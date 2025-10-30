import React, { useState, useMemo } from 'react';
import { Modal, Form, Button, Alert, Row, Col, Card, Badge, ListGroup, Tabs, Tab, InputGroup } from 'react-bootstrap';
import { useApp } from '../context/AppContext';

/**
 * 🎯 MODAL INTELIGENTE PARA DEVOLUCIONES
 * Soporta 7 tipos de resolución con cálculos automáticos
 * ✨ NUEVO: Soporte para devoluciones por factura (invoice-based returns)
 */
const DevolucionesModal = ({ show, onHide, ventaSeleccionada }) => {
  const { procesarDevolucion, inventario, ventas, buscarFacturaPorNumero, obtenerProductosFacturaParaDevoluciones, buscarVentaPorCodigo } = useApp();

  // 🔍 DEBUG: Ver qué inventario tenemos
  console.log("📦 DevolucionesModal - Inventario disponible:", inventario);
  console.log("📦 DevolucionesModal - Modal abierto:", show);
  console.log("📦 DevolucionesModal - Venta seleccionada:", {
    ventaSeleccionada,
    tieneProducto: !!ventaSeleccionada?.producto,
    tieneMonto: !!ventaSeleccionada?.monto,
    tieneDescuento: !!ventaSeleccionada?.descuento,
    montoValue: ventaSeleccionada?.monto,
    descuentoValue: ventaSeleccionada?.descuento,
    montoReal: (parseFloat(ventaSeleccionada?.monto || 0) - parseFloat(ventaSeleccionada?.descuento || 0)).toFixed(2),
  });

  // 🔀 MODO DE DEVOLUCIÓN: "venta" o "factura"
  const [modoDevoluciones, setModoDevoluciones] = useState("venta");

  // Estados del formulario - MODO VENTA
  const [tipoResolucion, setTipoResolucion] = useState("Reembolso");
  const [estadoProducto, setEstadoProducto] = useState("Buen estado");
  const [cantidadDevuelta, setCantidadDevuelta] = useState(1);
  const [productoNuevo, setProductoNuevo] = useState("");
  const [productoNuevoSeleccionado, setProductoNuevoSeleccionado] = useState(null); // 🆕 Objeto completo del producto
  const [cantidadNueva, setCantidadNueva] = useState(1);
  const [precioNuevo, setPrecioNuevo] = useState(0);
  const [notas, setNotas] = useState("");
  const [tieneCanjeProveedor, setTieneCanjeProveedor] = useState(false);
  const [referenciaCanje, setReferenciaCanje] = useState("");
  const [nombreProveedor, setNombreProveedor] = useState("");
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState(null);

  // Estados del formulario - MODO FACTURA
  const [numeroFactura, setNumeroFactura] = useState("");
  const [facturaSeleccionada, setFacturaSeleccionada] = useState(null);
  const [productosFactura, setProductosFactura] = useState([]);
  const [productosSeleccionados, setProductosSeleccionados] = useState({});
  const [tipoResolucionFactura, setTipoResolucionFactura] = useState("Reembolso");
  const [estadoProductoFactura, setEstadoProductoFactura] = useState("Buen estado");
  const [notasFactura, setNotasFactura] = useState("");
  const [searchError, setSearchError] = useState(null);

  // Estados del formulario - MODO CÓDIGO DE VENTA
  const [codigoVenta, setCodigoVenta] = useState("");
  const [ventaBuscada, setVentaBuscada] = useState(null);
  const [ventaBuscadaCargada, setVentaBuscadaCargada] = useState(false);

  // 📊 CÁLCULOS AUTOMÁTICOS
  const calculos = useMemo(() => {
    // 🔀 Usar la venta correcta según el modo
    const ventaActual = modoDevoluciones === "codigo" ? ventaBuscada : ventaSeleccionada;
    
    if (!ventaActual) return null;

    // 💰 ARREGLO CRÍTICO: Usar 'monto' en lugar de 'precio_unitario'
    // La venta guarda: monto (subtotal) y descuento (aplicado)
    // El monto real = monto - descuento
    const montoSubtotal = parseFloat(ventaActual.monto) || 0;
    const descuentoVenta = parseFloat(ventaActual.descuento) || 0;
    const precioOriginal = montoSubtotal - descuentoVenta; // Monto REAL pagado por el cliente
    
    console.log("📊 Cálculos de Devolución:", {
      montoSubtotal,
      descuentoVenta,
      precioOriginal,
      modo: modoDevoluciones,
      ventaActual
    });

    const montoDevuelto = precioOriginal * cantidadDevuelta;
    const precioNuevoNum = parseFloat(precioNuevo) || 0;
    const cantidadNuevaNum = parseInt(cantidadNueva) || 1;

    let diferencia = 0;
    let tipoMovimiento = "ninguno";
    let descripcion = "";

    switch (tipoResolucion) {
      case "Reembolso":
        diferencia = montoDevuelto;
        tipoMovimiento = "egreso";
        descripcion = `Cliente recibe $${montoDevuelto.toFixed(2)} reembolso`;
        break;

      case "Cambio +Caro": // Cliente paga más (producto nuevo es más caro)
        const montoNuevo1 = precioNuevoNum * cantidadNuevaNum;
        diferencia = montoNuevo1 - montoDevuelto;
        tipoMovimiento = diferencia > 0 ? "ingreso" : "egreso";
        descripcion = diferencia > 0
          ? `✅ Cliente paga $${diferencia.toFixed(2)} adicional por producto más caro`
          : `⚠️ Negocio devuelve $${Math.abs(diferencia).toFixed(2)}`;
        break;

      case "Cambio -Caro": // Cliente paga menos (producto nuevo es más barato)
        const montoNuevo2 = precioNuevoNum * cantidadNuevaNum;
        diferencia = montoDevuelto - montoNuevo2;
        tipoMovimiento = diferencia > 0 ? "egreso" : "ninguno";
        descripcion = diferencia > 0
          ? `✅ Negocio devuelve $${diferencia.toFixed(2)} al cliente`
          : `⚠️ Diferencia mínima o negativa`;
        break;

      case "Cambio Igual":
        const montoNuevo3 = precioNuevoNum * cantidadNuevaNum;
        diferencia = Math.abs(montoDevuelto - montoNuevo3);
        tipoMovimiento = "ninguno";
        descripcion = diferencia < 0.01 
          ? "✅ Sin diferencia de precio" 
          : `⚠️ Diferencia: $${diferencia.toFixed(2)} (revisa los precios)`;
        break;

      case "Cambio 2x1":
        const montoNuevo4 = precioNuevoNum * 2; // 2 productos al nuevo precio
        diferencia = montoDevuelto - montoNuevo4;
        tipoMovimiento = diferencia > 0 ? "egreso" : "ingreso";
        descripcion = diferencia > 0
          ? `✅ Negocio devuelve $${diferencia.toFixed(2)} (cliente recibe 2 por el precio de 1)`
          : `⚠️ Cliente paga $${Math.abs(diferencia).toFixed(2)} adicional por 2 productos`;
        break;

      case "Canje Proveedor":
        tipoMovimiento = "ninguno";
        descripcion = tieneCanjeProveedor
          ? `📦 Esperando canje con proveedor: ${nombreProveedor}`
          : "📦 Producto será desechado";
        break;

      case "Pérdida":
        diferencia = montoDevuelto;
        tipoMovimiento = "egreso";
        descripcion = `❌ Pérdida registrada: $${montoDevuelto.toFixed(2)}`;
        break;

      default:
        descripcion = "⚠️ Selecciona un tipo de resolución";
    }

    return {
      precioOriginal,
      montoDevuelto,
      montoNuevo: precioNuevoNum * cantidadNuevaNum,
      diferencia: Math.abs(diferencia),
      diferenciaBruta: diferencia, // Mantener el signo original
      tipoMovimiento,
      descripcion,
      esIngreso: tipoMovimiento === "ingreso",
      esEgreso: tipoMovimiento === "egreso",
    };
  }, [ventaSeleccionada, ventaBuscada, modoDevoluciones, tipoResolucion, cantidadDevuelta, precioNuevo, cantidadNueva, tieneCanjeProveedor, nombreProveedor, productoNuevoSeleccionado]);

  // 🔄 RESET FORMULARIO
  const resetForm = () => {
    setTipoResolucion("Reembolso");
    setEstadoProducto("Buen estado");
    setCantidadDevuelta(1);
    setProductoNuevo("");
    setProductoNuevoSeleccionado(null); // 🆕
    setCantidadNueva(1);
    setPrecioNuevo(0);
    setNotas("");
    setTieneCanjeProveedor(false);
    setReferenciaCanje("");
    setNombreProveedor("");
    setMensaje(null);
    setNumeroFactura("");
    setFacturaSeleccionada(null);
    setProductosFactura([]);
    setProductosSeleccionados({});
    setTipoResolucionFactura("Reembolso");
    setEstadoProductoFactura("Buen estado");
    setNotasFactura("");
    setSearchError(null);
    // 🔍 Reset búsqueda por código
    setCodigoVenta("");
    setVentaBuscada(null);
    setVentaBuscadaCargada(false);
  };

  // 📋 BUSCAR FACTURA POR NÚMERO
  const handleBuscarFactura = async () => {
    setSearchError(null);
    setFacturaSeleccionada(null);
    setProductosFactura([]);
    setProductosSeleccionados({});

    if (!numeroFactura.trim()) {
      setSearchError("Por favor ingresa un número de factura");
      return;
    }

    try {
      // Buscar factura
      const factura = buscarFacturaPorNumero(numeroFactura);
      
      if (!factura) {
        setSearchError(`No se encontró factura con número: ${numeroFactura}`);
        return;
      }

      // Obtener productos de la factura
      const productosConCodigos = obtenerProductosFacturaParaDevoluciones(numeroFactura);
      
      if (!productosConCodigos || productosConCodigos.length === 0) {
        setSearchError(`La factura #${numeroFactura} no tiene productos asociados`);
        return;
      }

      setFacturaSeleccionada(factura);
      setProductosFactura(productosConCodigos);
      
      // Pre-seleccionar todos los productos por defecto
      const todosSeleccionados = {};
      productosConCodigos.forEach((prod, idx) => {
        todosSeleccionados[idx] = { 
          selected: true, 
          cantidadDevuelta: prod.cantidad 
        };
      });
      setProductosSeleccionados(todosSeleccionados);
      
      setMensaje({
        type: "success",
        text: `✅ Factura #${numeroFactura} cargada con ${productosConCodigos.length} producto(s)`
      });
    } catch (error) {
      setSearchError(`Error al buscar factura: ${error.message}`);
    }
  };

  // 🔍 BUSCAR VENTA POR CÓDIGO
  const handleBuscarPorCodigo = async () => {
    setSearchError(null);
    setVentaBuscada(null);
    setVentaBuscadaCargada(false);

    if (!codigoVenta.trim()) {
      setSearchError("Por favor ingresa un código de venta (ej: VTA-2025-424894580)");
      return;
    }

    try {
      console.log("🔍 Buscando venta por código:", codigoVenta);
      
      // Buscar la venta
      const venta = buscarVentaPorCodigo(codigoVenta.trim());
      
      if (!venta) {
        setSearchError(`No se encontró venta con código: ${codigoVenta}`);
        console.log("❌ Venta no encontrada. Ventas disponibles:", ventas?.slice(0, 3));
        return;
      }

      console.log("✅ Venta encontrada:", venta);

      setVentaBuscada(venta);
      setVentaBuscadaCargada(true);
      
      setMensaje({
        type: "success",
        text: `✅ Venta ${codigoVenta} cargada correctamente`
      });
    } catch (error) {
      setSearchError(`Error al buscar venta: ${error.message}`);
      console.error("❌ Error:", error);
    }
  };

  // 🔄 TOGGLE SELECCIÓN DE PRODUCTO
  const toggleProductoSeleccionado = (index) => {
    setProductosSeleccionados(prev => ({
      ...prev,
      [index]: {
        selected: !prev[index]?.selected,
        cantidadDevuelta: prev[index]?.cantidadDevuelta || productosFactura[index].cantidad
      }
    }));
  };

  // 📝 ACTUALIZAR CANTIDAD DEVUELTA
  const actualizarCantidadDevuelta = (index, cantidad) => {
    const max = productosFactura[index].cantidad;
    const cantidadAct = Math.min(Math.max(1, cantidad), max);
    setProductosSeleccionados(prev => ({
      ...prev,
      [index]: {
        ...prev[index],
        cantidadDevuelta: cantidadAct
      }
    }));
  };

  // 💰 CÁLCULOS PARA FACTURA
  const calculosFactura = useMemo(() => {
    if (!facturaSeleccionada || productosFactura.length === 0) return null;

    let montoTotal = 0;
    let productosCount = 0;

    productosFactura.forEach((prod, idx) => {
      if (productosSeleccionados[idx]?.selected) {
        const cantidadDev = productosSeleccionados[idx]?.cantidadDevuelta || prod.cantidad;
        montoTotal += prod.precio_unitario * cantidadDev;
        productosCount += 1;
      }
    });

    let diferencia = 0;
    let tipoMovimiento = "ninguno";
    let descripcion = "";

    if (tipoResolucionFactura === "Reembolso") {
      diferencia = montoTotal;
      tipoMovimiento = "egreso";
      descripcion = `Cliente recibe $${montoTotal.toFixed(2)} reembolso por ${productosCount} producto(s)`;
    } else if (tipoResolucionFactura === "Canje Proveedor") {
      tipoMovimiento = "ninguno";
      descripcion = `Canje pendiente: ${productosCount} producto(s) con proveedor`;
    } else if (tipoResolucionFactura === "Pérdida") {
      diferencia = montoTotal;
      tipoMovimiento = "egreso";
      descripcion = `Pérdida registrada: $${montoTotal.toFixed(2)} por ${productosCount} producto(s)`;
    }

    return {
      montoTotal,
      productosCount,
      diferencia: Math.abs(diferencia),
      tipoMovimiento,
      descripcion,
      esIngreso: tipoMovimiento === "ingreso",
      esEgreso: tipoMovimiento === "egreso",
    };
  }, [facturaSeleccionada, productosFactura, productosSeleccionados, tipoResolucionFactura]);

  // 🎯 PROCESAR DEVOLUCIÓN (MODO VENTA)
  const handleProcesar = async () => {
    setLoading(true);
    setMensaje(null);

    try {
      const resultado = await procesarDevolucion({
        venta_id: ventaSeleccionada?.id,
        codigo_venta: ventaSeleccionada?.codigo_venta,
        cantidad_devuelta: parseInt(cantidadDevuelta),
        tipo_resolucion: tipoResolucion,
        estado_producto: estadoProducto,
        producto_nuevo: productoNuevo || null,
        cantidad_nueva: cantidadNueva > 0 ? parseInt(cantidadNueva) : null,
        precio_nuevo: precioNuevo > 0 ? parseFloat(precioNuevo) : null,
        tiene_cambio_proveedor: tieneCanjeProveedor,
        referencia_canje: referenciaCanje || null,
        notas_adicionales: notas,
      });

      if (resultado.success) {
        setMensaje({
          type: "success",
          text: `✅ ${resultado.message}`,
        });
        setTimeout(() => {
          resetForm();
          onHide();
        }, 2000);
      } else {
        setMensaje({
          type: "danger",
          text: `❌ ${resultado.message}`,
        });
      }
    } catch (error) {
      setMensaje({
        type: "danger",
        text: `❌ Error inesperado: ${error.message}`,
      });
    } finally {
      setLoading(false);
    }
  };

  // 🎯 PROCESAR DEVOLUCIÓN (MODO FACTURA) - Invoice-based returns
  const handleProcesarFactura = async () => {
    setLoading(true);
    setMensaje(null);

    try {
      // Validar que haya al menos un producto seleccionado
      const productosADevolver = productosFactura.filter((_, idx) => productosSeleccionados[idx]?.selected);
      
      if (productosADevolver.length === 0) {
        setMensaje({
          type: "warning",
          text: "❌ Debes seleccionar al menos un producto para devolver",
        });
        setLoading(false);
        return;
      }

      // Procesar cada producto como devolución individual vinculada a la factura
      for (let idx = 0; idx < productosFactura.length; idx++) {
        if (productosSeleccionados[idx]?.selected) {
          const producto = productosFactura[idx];
          const cantidadDev = productosSeleccionados[idx]?.cantidadDevuelta || producto.cantidad;

          const resultado = await procesarDevolucion({
            venta_id: producto.venta_id,
            codigo_venta: producto.codigo_venta,
            numero_factura: numeroFactura, // 🆕 Vínculo a factura
            cantidad_devuelta: cantidadDev,
            precio_unitario: producto.precio_unitario,  // ✅ Pasar el precio exacto del producto
            tipo_resolucion: tipoResolucionFactura,
            estado_producto: estadoProductoFactura,
            producto_nuevo: null,
            cantidad_nueva: null,
            precio_nuevo: null,
            tiene_cambio_proveedor: false,
            referencia_canje: null,
            notas_adicionales: `Devolución por factura #${numeroFactura}. ${notasFactura}`.trim(),
          });

          if (!resultado.success) {
            throw new Error(`Error procesando producto ${producto.nombre || 'desconocido'}: ${resultado.message}`);
          }
        }
      }

      setMensaje({
        type: "success",
        text: `✅ Factura #${numeroFactura} procesada con ${productosADevolver.length} devolución(es)`,
      });
      setTimeout(() => {
        resetForm();
        onHide();
      }, 2000);
    } catch (error) {
      setMensaje({
        type: "danger",
        text: `❌ Error: ${error.message}`,
      });
    } finally {
      setLoading(false);
    }
  };

  // Mostrar contenido basado en si es modal de venta o de factura
  const shouldShowSalesMode = modoDevoluciones === "venta" && ventaSeleccionada;
  const shouldShowInvoiceMode = modoDevoluciones === "factura";

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>
          📦 Procesar Devolución
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {mensaje && (
          <Alert variant={mensaje.type} dismissible onClose={() => setMensaje(null)}>
            {mensaje.text}
          </Alert>
        )}

        {/* 🔀 TABS - MODO DEVOLUCIÓN */}
        <Tabs activeKey={modoDevoluciones} onSelect={(key) => {
          setModoDevoluciones(key);
          setMensaje(null);
          setSearchError(null);
        }} className="mb-4">
          {/* TAB 1: DEVOLUCIÓN POR VENTA INDIVIDUAL */}
          <Tab eventKey="venta" title="💰 Por Venta Individual" disabled={!ventaSeleccionada}>
            {ventaSeleccionada && (
              <>
                {/* INFORMACIÓN DE VENTA */}
                <Card className="mb-4" bg="light">
                  <Card.Body>
                    <Row className="mb-3">
                      <Col md={6}>
                        <p><strong>Producto:</strong> {ventaSeleccionada?.producto}</p>
                        <p><strong>Cliente:</strong> {ventaSeleccionada?.cliente}</p>
                      </Col>
                      <Col md={6}>
                        <p><strong>Precio Unit:</strong> ${calculos?.precioOriginal.toFixed(2)}</p>
                        <p><strong>Cantidad:</strong> {ventaSeleccionada?.cantidad}</p>
                      </Col>
                    </Row>
                    {/* 📦 MOSTRAR TODOS LOS PRODUCTOS SI HAY MÚLTIPLES */}
                    {ventaSeleccionada?.productos_json && ventaSeleccionada.productos_json.length > 0 && (
                      <div className="mt-3 pt-3 border-top">
                        <strong>📦 Productos en la venta:</strong>
                        <ul className="mb-0 mt-2" style={{ paddingLeft: "1.5rem" }}>
                          {ventaSeleccionada.productos_json.map((prod, idx) => (
                            <li key={idx} style={{ marginBottom: "0.5rem" }}>
                              {prod.nombre} - Cantidad: {prod.cantidad} x ${prod.precio_unitario?.toFixed(2)} = ${prod.subtotal?.toFixed(2)}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </Card.Body>
                </Card>

                {/* TIPO DE RESOLUCIÓN */}
                <Form.Group className="mb-4">
                  <Form.Label><strong>🎯 Tipo de Resolución</strong></Form.Label>
                  <Form.Select
                    value={tipoResolucion}
                    onChange={(e) => setTipoResolucion(e.target.value)}
                  >
                    <option value="Reembolso">💰 Reembolso Completo</option>
                    <option value="Cambio +Caro">⬆️ Cambio por Producto Más Caro</option>
                    <option value="Cambio -Caro">⬇️ Cambio por Producto Más Barato</option>
                    <option value="Cambio Igual">➡️ Cambio por Igual Precio</option>
                    <option value="Cambio 2x1">🔄 Cambio 2x1</option>
                    <option value="Canje Proveedor">🏭 Canje con Proveedor (Dañado)</option>
                    <option value="Pérdida">💔 Pérdida Total</option>
                  </Form.Select>
                </Form.Group>

                {/* ESTADO DEL PRODUCTO */}
                <Form.Group className="mb-3">
                  <Form.Label><strong>🔍 Estado del Producto</strong></Form.Label>
                  <Form.Select
                    value={estadoProducto}
                    onChange={(e) => setEstadoProducto(e.target.value)}
                  >
                    <option value="Buen estado">✅ Buen Estado</option>
                    <option value="Dañado">❌ Dañado</option>
                    <option value="Parcialmente dañado">⚠️ Parcialmente Dañado</option>
                  </Form.Select>
                </Form.Group>

                {/* CANTIDAD DEVUELTA */}
                <Form.Group className="mb-3">
                  <Form.Label><strong>📤 Cantidad Devuelta</strong></Form.Label>
                  <Form.Control
                    type="number"
                    min="1"
                    max={ventaSeleccionada?.cantidad}
                    value={cantidadDevuelta}
                    onChange={(e) => setCantidadDevuelta(e.target.value)}
                  />
                </Form.Group>

                {/* PRODUCTOS PARA CAMBIO - Mostrar solo si es Cambio */}
                {tipoResolucion.includes("Cambio") && (
                  <>
                    <Form.Group className="mb-3">
                      <Form.Label><strong>🏪 Producto Nuevo</strong></Form.Label>
                      <Form.Select
                        value={productoNuevo}
                        onChange={(e) => {
                          const nombreProducto = e.target.value;
                          setProductoNuevo(nombreProducto);
                          
                          console.log("🔍 Buscando producto:", nombreProducto);
                          console.log("📦 En inventario:", inventario);
                          
                          // 🆕 Buscar el producto en inventario y cargar su precio automáticamente
                          if (nombreProducto) {
                            const productoDatos = inventario?.find(
                              (prod) => prod.nombre.toLowerCase() === nombreProducto.toLowerCase()
                            );
                            console.log("✅ Producto encontrado:", productoDatos);
                            
                            if (productoDatos) {
                              setProductoNuevoSeleccionado(productoDatos);
                              // ✅ AUTO-CARGAR precio del producto
                              setPrecioNuevo(productoDatos.precio);
                              // ✅ AUTO-CARGAR cantidad en 1 (puede cambiar después)
                              setCantidadNueva(1);
                              console.log("✅ Precio cargado:", productoDatos.precio);
                            } else {
                              console.log("❌ Producto NO encontrado en inventario");
                            }
                          } else {
                            setProductoNuevoSeleccionado(null);
                            setPrecioNuevo(0);
                            setCantidadNueva(1);
                          }
                        }}
                      >
                        <option value="">-- Seleccionar Producto ({inventario?.length || 0} disponibles) --</option>
                        {inventario && inventario.length > 0 ? (
                          inventario.map((prod) => (
                            <option key={prod.id} value={prod.nombre}>
                              {prod.nombre} - ${prod.precio.toFixed(2)} (Stock: {prod.cantidad})
                            </option>
                          ))
                        ) : (
                          <option disabled>No hay productos en inventario</option>
                        )}
                      </Form.Select>
                      {productoNuevoSeleccionado && (
                        <small className="text-success d-block mt-2">
                          ✅ Producto cargado: Stock disponible = {productoNuevoSeleccionado.cantidad} unidades
                        </small>
                      )}
                    </Form.Group>

                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label><strong>Cantidad Nueva</strong></Form.Label>
                          <Form.Control
                            type="number"
                            min="1"
                            value={cantidadNueva}
                            onChange={(e) => setCantidadNueva(e.target.value)}
                            disabled={!productoNuevoSeleccionado}
                          />
                          {productoNuevoSeleccionado && cantidadNueva > productoNuevoSeleccionado.cantidad && (
                            <small className="text-danger d-block mt-2">
                              ⚠️ Cantidad solicitada ({cantidadNueva}) excede el stock ({productoNuevoSeleccionado.cantidad})
                            </small>
                          )}
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label><strong>Precio Nuevo</strong></Form.Label>
                          <Form.Control
                            type="number"
                            step="0.01"
                            min="0"
                            value={precioNuevo}
                            onChange={(e) => setPrecioNuevo(e.target.value)}
                            className={productoNuevoSeleccionado ? "bg-light" : ""}
                          />
                          {productoNuevoSeleccionado && (
                            <small className="text-success d-block mt-2">
                              💰 Precio automático cargado: ${productoNuevoSeleccionado.precio.toFixed(2)}
                            </small>
                          )}
                        </Form.Group>
                      </Col>
                    </Row>
                  </>
                )}

                {/* CANJE CON PROVEEDOR */}
                {tipoResolucion === "Canje Proveedor" && (
                  <>
                    <Form.Group className="mb-3">
                      <Form.Check
                        type="checkbox"
                        label="¿Proveedor acepta cambio?"
                        checked={tieneCanjeProveedor}
                        onChange={(e) => setTieneCanjeProveedor(e.target.checked)}
                      />
                    </Form.Group>

                    {tieneCanjeProveedor && (
                      <>
                        <Form.Group className="mb-3">
                          <Form.Label><strong>Nombre del Proveedor</strong></Form.Label>
                          <Form.Control
                            type="text"
                            placeholder="Ej: Tech Supplier Inc"
                            value={nombreProveedor}
                            onChange={(e) => setNombreProveedor(e.target.value)}
                          />
                        </Form.Group>

                        <Form.Group className="mb-3">
                          <Form.Label><strong>Referencia de Canje</strong></Form.Label>
                          <Form.Control
                            type="text"
                            placeholder="Ej: REF-2025-001"
                            value={referenciaCanje}
                            onChange={(e) => setReferenciaCanje(e.target.value)}
                          />
                        </Form.Group>
                      </>
                    )}
                  </>
                )}

                {/* NOTAS ADICIONALES */}
                <Form.Group className="mb-4">
                  <Form.Label><strong>📝 Notas Adicionales</strong></Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    placeholder="Razón de la devolución, detalles adicionales..."
                    value={notas}
                    onChange={(e) => setNotas(e.target.value)}
                  />
                </Form.Group>

                {/* RESUMEN AUTOMÁTICO */}
                {calculos && (
                  <Card className="border-info mb-4">
                    <Card.Header className="bg-info text-white">
                      💡 Resumen Automático del Sistema
                    </Card.Header>
                    <Card.Body>
                      <ListGroup variant="flush">
                        <ListGroup.Item className="bg-light">
                          <strong>📦 Información de la Devolución:</strong>
                        </ListGroup.Item>
                        <ListGroup.Item>
                          <Row>
                            <Col md={6}>
                              <small><strong>🛍️ Producto Original:</strong></small>
                              <br />
                              <small>{ventaSeleccionada?.producto || "Venta con múltiples productos"}</small>
                              <br />
                              <small className="text-muted">
                                Código: <strong>{ventaSeleccionada?.codigo_venta}</strong>
                              </small>
                            </Col>
                            <Col md={6}>
                              <small><strong>💰 Monto Original Pagado:</strong></small>
                              <br />
                              <small>
                                Subtotal: ${parseFloat(ventaSeleccionada?.monto || 0).toFixed(2)}
                                {ventaSeleccionada?.descuento > 0 && (
                                  <>
                                    <br />
                                    Descuento: -${parseFloat(ventaSeleccionada?.descuento || 0).toFixed(2)}
                                  </>
                                )}
                                <br />
                                <strong className="text-primary">Total Pagado: ${calculos.precioOriginal.toFixed(2)}</strong>
                              </small>
                            </Col>
                          </Row>
                          <Row className="mt-3">
                            <Col>
                              <small><strong>📦 Cantidad a Devolver: </strong>{cantidadDevuelta} unidad(es)</small>
                              <br />
                              <small className="text-danger">
                                <strong>Monto a Procesar: ${calculos.montoDevuelto.toFixed(2)}</strong>
                              </small>
                            </Col>
                          </Row>
                        </ListGroup.Item>

                        {tipoResolucion.includes("Cambio") && productoNuevoSeleccionado && (
                          <>
                            <ListGroup.Item className="bg-light">
                              <strong>🔄 Información del Cambio:</strong>
                            </ListGroup.Item>
                            <ListGroup.Item>
                              <Row>
                                <Col md={6}>
                                  <small><strong>Producto Nuevo:</strong> {productoNuevo}</small>
                                  <br />
                                  <small>Cantidad: {cantidadNueva} × ${precioNuevo}</small>
                                </Col>
                                <Col md={6}>
                                  <small><strong>Monto del Nuevo Producto:</strong></small>
                                  <br />
                                  <small className="text-success"><strong>${calculos.montoNuevo.toFixed(2)}</strong></small>
                                </Col>
                              </Row>
                            </ListGroup.Item>
                          </>
                        )}

                        <ListGroup.Item className="bg-light">
                          <strong>🎯 Decisión del Sistema:</strong>
                        </ListGroup.Item>
                        <ListGroup.Item>
                          {calculos.descripcion}
                        </ListGroup.Item>

                        {calculos.tipoMovimiento !== "ninguno" && (
                          <ListGroup.Item>
                            <Row className="align-items-center">
                              <Col>
                                <strong>💰 Impacto Financiero:</strong>
                              </Col>
                              <Col className="text-end">
                                <Badge
                                  bg={calculos.esIngreso ? "success" : "danger"}
                                  className="ms-2 p-2"
                                  style={{ fontSize: "0.9rem" }}
                                >
                                  {calculos.esIngreso ? "➕ INGRESO" : "➖ EGRESO"} $
                                  {calculos.diferencia.toFixed(2)}
                                </Badge>
                              </Col>
                            </Row>
                          </ListGroup.Item>
                        )}

                        {tieneCanjeProveedor && nombreProveedor && (
                          <ListGroup.Item>
                            <strong>🏭 Proveedor:</strong> {nombreProveedor}
                          </ListGroup.Item>
                        )}
                      </ListGroup>
                    </Card.Body>
                  </Card>
                )}
              </>
            )}
          </Tab>

          {/* TAB 2: DEVOLUCIÓN POR FACTURA (INVOICE-BASED RETURNS) */}
          <Tab eventKey="factura" title="📋 Por Factura (Bulk Returns)">
            {searchError && (
              <Alert variant="danger" dismissible onClose={() => setSearchError(null)}>
                {searchError}
              </Alert>
            )}

            {/* BÚSQUEDA DE FACTURA */}
            <Card className="mb-4">
              <Card.Header className="bg-primary text-white">
                🔍 Buscar Factura
              </Card.Header>
              <Card.Body>
                <Form.Group className="mb-3">
                  <Form.Label><strong>Número de Factura</strong></Form.Label>
                  <InputGroup>
                    <Form.Control
                      type="text"
                      placeholder="Ingresa el número de factura (ej: VTA-2025-941155106)"
                      value={numeroFactura}
                      onChange={(e) => setNumeroFactura(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleBuscarFactura()}
                    />
                    <Button
                      variant="primary"
                      onClick={handleBuscarFactura}
                      disabled={!numeroFactura.trim() || loading}
                    >
                      🔍 Buscar
                    </Button>
                  </InputGroup>
                </Form.Group>
              </Card.Body>
            </Card>

            {/* INFORMACIÓN DE FACTURA */}
            {facturaSeleccionada && (
              <>
                <Card className="mb-4" bg="light">
                  <Card.Header className="bg-success text-white">
                    ✅ Factura #{numeroFactura} Cargada
                  </Card.Header>
                  <Card.Body>
                    <Row>
                      <Col md={6}>
                        <p><strong>Cliente:</strong> {facturaSeleccionada.cliente_nombre}</p>
                        <p><strong>Fecha:</strong> {new Date(facturaSeleccionada.fecha).toLocaleDateString()}</p>
                      </Col>
                      <Col md={6}>
                        <p><strong>Total:</strong> ${facturaSeleccionada.total?.toFixed(2)}</p>
                        <p><strong>Productos:</strong> {productosFactura.length}</p>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>

                {/* LISTA DE PRODUCTOS CON SELECCIÓN */}
                <Card className="mb-4">
                  <Card.Header className="bg-info text-white">
                    📦 Productos en Factura
                  </Card.Header>
                  <Card.Body>
                    {productosFactura.map((producto, idx) => (
                      <Card key={idx} className="mb-3 border border-secondary">
                        <Card.Body>
                          <Row>
                            <Col md={1}>
                              <Form.Check
                                type="checkbox"
                                checked={productosSeleccionados[idx]?.selected || false}
                                onChange={() => toggleProductoSeleccionado(idx)}
                              />
                            </Col>
                            <Col md={5}>
                              <div>
                                <strong>{producto.producto}</strong>
                                <br />
                                <small>Código: {producto.codigo_venta}</small>
                              </div>
                            </Col>
                            <Col md={2}>
                              <div>
                                <strong>Cantidad:</strong> {producto.cantidad}
                              </div>
                            </Col>
                            <Col md={2}>
                              <div>
                                <strong>Precio:</strong> ${producto.precio_unitario.toFixed(2)}
                              </div>
                            </Col>
                            <Col md={2}>
                              {productosSeleccionados[idx]?.selected && (
                                <Form.Control
                                  type="number"
                                  min="1"
                                  max={producto.cantidad}
                                  value={productosSeleccionados[idx]?.cantidadDevuelta || producto.cantidad}
                                  onChange={(e) => actualizarCantidadDevuelta(idx, parseInt(e.target.value) || 1)}
                                  size="sm"
                                />
                              )}
                            </Col>
                          </Row>
                        </Card.Body>
                      </Card>
                    ))}
                  </Card.Body>
                </Card>

                {/* TIPO DE RESOLUCIÓN PARA FACTURA */}
                <Form.Group className="mb-4">
                  <Form.Label><strong>🎯 Tipo de Resolución (Aplica a todos)</strong></Form.Label>
                  <Form.Select
                    value={tipoResolucionFactura}
                    onChange={(e) => setTipoResolucionFactura(e.target.value)}
                  >
                    <option value="Reembolso">💰 Reembolso Completo</option>
                    <option value="Canje Proveedor">🏭 Canje con Proveedor</option>
                    <option value="Pérdida">💔 Pérdida Total</option>
                  </Form.Select>
                </Form.Group>

                {/* ESTADO DEL PRODUCTO PARA FACTURA */}
                <Form.Group className="mb-3">
                  <Form.Label><strong>🔍 Estado de Productos (Aplica a todos)</strong></Form.Label>
                  <Form.Select
                    value={estadoProductoFactura}
                    onChange={(e) => setEstadoProductoFactura(e.target.value)}
                  >
                    <option value="Buen estado">✅ Buen Estado</option>
                    <option value="Dañado">❌ Dañado</option>
                    <option value="Parcialmente dañado">⚠️ Parcialmente Dañado</option>
                  </Form.Select>
                </Form.Group>

                {/* NOTAS ADICIONALES PARA FACTURA */}
                <Form.Group className="mb-4">
                  <Form.Label><strong>📝 Notas Adicionales</strong></Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    placeholder="Razón de la devolución, detalles adicionales..."
                    value={notasFactura}
                    onChange={(e) => setNotasFactura(e.target.value)}
                  />
                </Form.Group>

                {/* RESUMEN AUTOMÁTICO PARA FACTURA */}
                {calculosFactura && (
                  <Card className="border-success mb-4">
                    <Card.Header className="bg-success text-white">
                      💡 Resumen Automático - Devoluciones por Factura
                    </Card.Header>
                    <Card.Body>
                      <ListGroup variant="flush">
                        <ListGroup.Item>
                          <strong>Monto Total:</strong> ${calculosFactura.montoTotal.toFixed(2)}
                        </ListGroup.Item>
                        <ListGroup.Item>
                          <strong>Productos Seleccionados:</strong> {calculosFactura.productosCount}
                        </ListGroup.Item>
                        <ListGroup.Item>
                          <strong>Descripción:</strong> {calculosFactura.descripcion}
                        </ListGroup.Item>
                        {calculosFactura.tipoMovimiento !== "ninguno" && (
                          <ListGroup.Item>
                            <strong>Impacto Financiero:</strong>{" "}
                            <Badge
                              bg={calculosFactura.esIngreso ? "success" : "danger"}
                              className="ms-2"
                            >
                              {calculosFactura.esIngreso ? "INGRESO" : "EGRESO"} $
                              {calculosFactura.diferencia.toFixed(2)}
                            </Badge>
                          </ListGroup.Item>
                        )}
                      </ListGroup>
                    </Card.Body>
                  </Card>
                )}
              </>
            )}
          </Tab>

          {/* TAB 3: DEVOLUCIÓN POR CÓDIGO DE VENTA */}
          <Tab eventKey="codigo" title="🔐 Por Código de Venta">
            {searchError && (
              <Alert variant="danger" dismissible onClose={() => setSearchError(null)}>
                {searchError}
              </Alert>
            )}

            {/* BÚSQUEDA POR CÓDIGO */}
            <Card className="mb-4">
              <Card.Header className="bg-primary text-white">
                🔍 Buscar por Código de Venta
              </Card.Header>
              <Card.Body>
                <Form.Group className="mb-3">
                  <Form.Label><strong>Código de Venta</strong></Form.Label>
                  <Form.Text className="d-block text-muted mb-2">
                    Ejemplo: VTA-2025-424894580
                  </Form.Text>
                  <InputGroup>
                    <Form.Control
                      type="text"
                      placeholder="Ingresa el código de venta"
                      value={codigoVenta}
                      onChange={(e) => setCodigoVenta(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleBuscarPorCodigo()}
                    />
                    <Button
                      variant="primary"
                      onClick={handleBuscarPorCodigo}
                      disabled={!codigoVenta.trim() || loading}
                    >
                      🔍 Buscar
                    </Button>
                  </InputGroup>
                </Form.Group>
              </Card.Body>
            </Card>

            {/* INFORMACIÓN DE VENTA ENCONTRADA */}
            {ventaBuscadaCargada && ventaBuscada && (
              <>
                <Card className="mb-4" bg="light">
                  <Card.Header className="bg-success text-white">
                    ✅ Venta {codigoVenta} Cargada
                  </Card.Header>
                  <Card.Body>
                    <Row>
                      <Col md={6}>
                        <p><strong>🛍️ Producto:</strong> {ventaBuscada.producto}</p>
                        <p><strong>👤 Cliente:</strong> {ventaBuscada.cliente}</p>
                        <p><strong>📅 Fecha:</strong> {new Date(ventaBuscada.fecha).toLocaleDateString()}</p>
                      </Col>
                      <Col md={6}>
                        <p><strong>📦 Cantidad:</strong> {ventaBuscada.cantidad}</p>
                        <p><strong>💰 Subtotal:</strong> ${parseFloat(ventaBuscada.monto || 0).toFixed(2)}</p>
                        {ventaBuscada.descuento && ventaBuscada.descuento > 0 && (
                          <p><strong>🎁 Descuento:</strong> -${parseFloat(ventaBuscada.descuento).toFixed(2)}</p>
                        )}
                      </Col>
                    </Row>

                    {/* MONTO TOTAL PAGADO - CRITICAL INFO */}
                    <Card className="mt-3 border-warning bg-warning bg-opacity-10">
                      <Card.Body>
                        <Row className="align-items-center">
                          <Col>
                            <h6 className="mb-0">💵 MONTO TOTAL PAGADO</h6>
                          </Col>
                          <Col className="text-end">
                            <h5 className="mb-0 text-success">
                              ${(parseFloat(ventaBuscada.monto || 0) - parseFloat(ventaBuscada.descuento || 0)).toFixed(2)}
                            </h5>
                          </Col>
                        </Row>
                      </Card.Body>
                    </Card>
                  </Card.Body>
                </Card>

                {/* TIPO DE RESOLUCIÓN PARA CÓDIGO DE VENTA */}
                <Form.Group className="mb-4">
                  <Form.Label><strong>🎯 Tipo de Resolución</strong></Form.Label>
                  <Form.Select
                    value={tipoResolucion}
                    onChange={(e) => setTipoResolucion(e.target.value)}
                  >
                    <option value="Reembolso">💰 Reembolso Completo</option>
                    <option value="Cambio +Caro">⬆️ Cambio por Producto Más Caro</option>
                    <option value="Cambio -Caro">⬇️ Cambio por Producto Más Barato</option>
                    <option value="Cambio Igual">➡️ Cambio por Igual Precio</option>
                    <option value="Cambio 2x1">🔄 Cambio 2x1</option>
                    <option value="Canje Proveedor">🏭 Canje con Proveedor</option>
                    <option value="Pérdida">💔 Pérdida Total</option>
                  </Form.Select>
                </Form.Group>

                {/* ESTADO DEL PRODUCTO */}
                <Form.Group className="mb-3">
                  <Form.Label><strong>🔍 Estado del Producto</strong></Form.Label>
                  <Form.Select
                    value={estadoProducto}
                    onChange={(e) => setEstadoProducto(e.target.value)}
                  >
                    <option value="Buen estado">✅ Buen Estado</option>
                    <option value="Dañado">❌ Dañado</option>
                    <option value="Parcialmente dañado">⚠️ Parcialmente Dañado</option>
                  </Form.Select>
                </Form.Group>

                {/* CANTIDAD DEVUELTA */}
                <Form.Group className="mb-3">
                  <Form.Label><strong>📦 Cantidad a Devolver</strong></Form.Label>
                  <Form.Control
                    type="number"
                    min="1"
                    max={ventaBuscada.cantidad}
                    value={cantidadDevuelta}
                    onChange={(e) => setCantidadDevuelta(e.target.value)}
                  />
                  <small className="text-muted">Máximo: {ventaBuscada.cantidad}</small>
                </Form.Group>

                {/* PRODUCTOS PARA CAMBIO - Mostrar solo si es Cambio */}
                {tipoResolucion.includes("Cambio") && (
                  <>
                    <Form.Group className="mb-3">
                      <Form.Label><strong>🏪 Producto Nuevo</strong></Form.Label>
                      <Form.Select
                        value={productoNuevo}
                        onChange={(e) => {
                          const nombreProducto = e.target.value;
                          setProductoNuevo(nombreProducto);
                          
                          if (nombreProducto) {
                            const productoDatos = inventario?.find(
                              (prod) => prod.nombre.toLowerCase() === nombreProducto.toLowerCase()
                            );
                            
                            if (productoDatos) {
                              setProductoNuevoSeleccionado(productoDatos);
                              setPrecioNuevo(productoDatos.precio);
                              setCantidadNueva(1);
                            } else {
                              setProductoNuevoSeleccionado(null);
                              setPrecioNuevo(0);
                            }
                          } else {
                            setProductoNuevoSeleccionado(null);
                            setPrecioNuevo(0);
                            setCantidadNueva(1);
                          }
                        }}
                      >
                        <option value="">-- Selecciona un producto --</option>
                        {inventario?.map((prod) => (
                          <option key={prod.id} value={prod.nombre}>
                            {prod.nombre} - ${prod.precio.toFixed(2)}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>

                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label><strong>Cantidad Nueva</strong></Form.Label>
                          <Form.Control
                            type="number"
                            min="1"
                            value={cantidadNueva}
                            onChange={(e) => setCantidadNueva(e.target.value)}
                            disabled={!productoNuevoSeleccionado}
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label><strong>Precio Nuevo</strong></Form.Label>
                          <Form.Control
                            type="number"
                            step="0.01"
                            min="0"
                            value={precioNuevo}
                            onChange={(e) => setPrecioNuevo(e.target.value)}
                            className={productoNuevoSeleccionado ? "bg-light" : ""}
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                  </>
                )}

                {/* NOTAS ADICIONALES */}
                <Form.Group className="mb-4">
                  <Form.Label><strong>📝 Notas Adicionales</strong></Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    placeholder="Razón de la devolución, detalles adicionales..."
                    value={notas}
                    onChange={(e) => setNotas(e.target.value)}
                  />
                </Form.Group>

                {/* RESUMEN AUTOMÁTICO */}
                {calculos && (
                  <Card className="border-info mb-4">
                    <Card.Header className="bg-info text-white">
                      💡 Resumen Automático del Sistema
                    </Card.Header>
                    <Card.Body>
                      <ListGroup variant="flush">
                        <ListGroup.Item className="bg-light">
                          <strong>📦 Información de la Devolución:</strong>
                        </ListGroup.Item>
                        <ListGroup.Item>
                          <Row>
                            <Col md={6}>Monto Pagado (Original):</Col>
                            <Col className="text-end">
                              <strong>${calculos.precioOriginal.toFixed(2)}</strong>
                            </Col>
                          </Row>
                        </ListGroup.Item>
                        <ListGroup.Item>
                          <Row>
                            <Col md={6}>Cantidad Devuelta:</Col>
                            <Col className="text-end"><strong>{cantidadDevuelta}</strong></Col>
                          </Row>
                        </ListGroup.Item>
                        <ListGroup.Item>
                          <Row>
                            <Col md={6}>Monto a Devolver:</Col>
                            <Col className="text-end">
                              <small className="text-danger"><strong>${calculos.montoDevuelto?.toFixed(2)}</strong></small>
                            </Col>
                          </Row>
                        </ListGroup.Item>

                        {tipoResolucion.includes("Cambio") && (
                          <>
                            <ListGroup.Item>
                              <Row>
                                <Col md={6}>Monto del Producto Nuevo:</Col>
                                <Col className="text-end">
                                  <small className="text-success"><strong>${calculos.montoNuevo?.toFixed(2)}</strong></small>
                                </Col>
                              </Row>
                            </ListGroup.Item>
                          </>
                        )}

                        <ListGroup.Item className="bg-light">
                          <strong>🎯 Decisión del Sistema:</strong>
                        </ListGroup.Item>
                        <ListGroup.Item>
                          {calculos.descripcion}
                        </ListGroup.Item>

                        {calculos.tipoMovimiento !== "ninguno" && (
                          <ListGroup.Item>
                            <Row className="align-items-center">
                              <Col>
                                <strong>💰 Impacto Financiero:</strong>
                              </Col>
                              <Col className="text-end">
                                <Badge
                                  bg={calculos.esIngreso ? "success" : "danger"}
                                  className="ms-2 p-2"
                                  style={{ fontSize: "0.9rem" }}
                                >
                                  {calculos.esIngreso ? "➕ INGRESO" : "➖ EGRESO"} $
                                  {calculos.diferencia.toFixed(2)}
                                </Badge>
                              </Col>
                            </Row>
                          </ListGroup.Item>
                        )}
                      </ListGroup>
                    </Card.Body>
                  </Card>
                )}
              </>
            )}
          </Tab>
        </Tabs>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onHide} disabled={loading}>
          ❌ Cancelar
        </Button>
        
        {/* BOTÓN PARA MODO VENTA */}
        {modoDevoluciones === "venta" && (
          <Button
            variant="primary"
            onClick={handleProcesar}
            disabled={loading || !tipoResolucion}
          >
            {loading ? "⏳ Procesando..." : "✅ Procesar Devolución"}
          </Button>
        )}

        {/* BOTÓN PARA MODO FACTURA */}
        {modoDevoluciones === "factura" && (
          <Button
            variant="success"
            onClick={handleProcesarFactura}
            disabled={loading || !facturaSeleccionada || Object.values(productosSeleccionados).filter(p => p?.selected).length === 0}
          >
            {loading ? "⏳ Procesando..." : "✅ Procesar Devoluciones por Factura"}
          </Button>
        )}

        {/* BOTÓN PARA MODO CÓDIGO DE VENTA */}
        {modoDevoluciones === "codigo" && (
          <Button
            variant="info"
            onClick={handleProcesar}
            disabled={loading || !ventaBuscadaCargada || !tipoResolucion}
          >
            {loading ? "⏳ Procesando..." : "✅ Procesar Devolución por Código"}
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  );
};

export default DevolucionesModal;