import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import {
  Card,
  Form,
  Button,
  Row,
  Col,
  Alert,
  Table,
  Modal,
} from "react-bootstrap";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const GeneradorFacturas = () => {
  const {
    facturas,
    clientes,
    ventas,
    crearFactura,
    updateFactura,
    perfilEmpresa,
    obtenerVentasSinFacturar,
    marcarVentasFacturadas,
  } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [showEstadoModal, setShowEstadoModal] = useState(false);
  const [showVentasModal, setShowVentasModal] = useState(false);
  const [facturaEditando, setFacturaEditando] = useState(null);
  const [alerta, setAlerta] = useState(null);
  const [tipoFactura, setTipoFactura] = useState("fiscal");
  const [formData, setFormData] = useState({
    numero_factura: "",
    cliente_id: "",
    venta_id: "",
    descuento: 0,
    impuesto: 0,
    metodo_pago: "Efectivo",
  });
  const [estadoFormData, setEstadoFormData] = useState({
    estado: "pendiente",
    fecha_pago: "",
  });

  // ✅ NUEVO: Estado para productos
  const [productos, setProductos] = useState([]);
  const [nuevoProducto, setNuevoProducto] = useState({
    nombre: "",
    cantidad: 1,
    precio_unitario: 0,
  });

  // ✅ NUEVO: Estados para generar desde ventas
  const [clienteSeleccionadoVentas, setClienteSeleccionadoVentas] = useState("");
  const [ventasDisponibles, setVentasDisponibles] = useState([]);
  const [ventasSeleccionadas, setVentasSeleccionadas] = useState([]);

  // Generar número de factura automático
  useEffect(() => {
    const maxNumero = facturas.length > 0
      ? Math.max(...facturas.map((f) => {
          const match = f.numero_factura.match(/\d+/);
          return parseInt(match?.[0]) || 0;
        }))
      : 0;
    const nuevoNumero = String(maxNumero + 1).padStart(6, "0");
    const timestamp = Date.now().toString().slice(-3);
    setFormData((prev) => ({
      ...prev,
      numero_factura: `FAC-${nuevoNumero}-${timestamp}`,
    }));
  }, [facturas]);

  // ✅ NUEVO: Cargar ventas sin facturar cuando se selecciona cliente
  useEffect(() => {
    if (clienteSeleccionadoVentas) {
      const cargarVentas = async () => {
        const ventasClienteId = parseInt(clienteSeleccionadoVentas);
        const resultado = await obtenerVentasSinFacturar(ventasClienteId);
        
        if (resultado.success) {
          setVentasDisponibles(resultado.data || []);
          setVentasSeleccionadas([]);
          setAlerta({
            type: "info",
            message: `📦 ${resultado.data?.length || 0} venta(s) sin facturar encontrada(s)`,
          });
        } else {
          setAlerta({
            type: "warning",
            message: "⚠️ " + (resultado.message || "No se pudieron cargar las ventas"),
          });
        }
      };
      cargarVentas();
    }
  }, [clienteSeleccionadoVentas, obtenerVentasSinFacturar]);  // ✅ obtenerVentasSinFacturar ahora está envuelta en useCallback

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // ✅ NUEVO: Manejar cambios en nuevo producto
  const handleProductoChange = (e) => {
    const { name, value } = e.target;
    setNuevoProducto({
      ...nuevoProducto,
      [name]: name === "nombre" ? value : parseFloat(value) || 0,
    });
  };

  // ✅ NUEVO: Agregar producto a la lista
  const agregarProducto = () => {
    if (!nuevoProducto.nombre.trim()) {
      setAlerta({ type: "danger", message: "❌ El nombre del producto es requerido" });
      return;
    }
    if (nuevoProducto.cantidad <= 0) {
      setAlerta({ type: "danger", message: "❌ La cantidad debe ser mayor a 0" });
      return;
    }
    if (nuevoProducto.precio_unitario <= 0) {
      setAlerta({ type: "danger", message: "❌ El precio unitario debe ser mayor a 0" });
      return;
    }

    const nuevoProductoConSubtotal = {
      id: Date.now(), // ID temporal
      nombre: nuevoProducto.nombre,
      cantidad: nuevoProducto.cantidad,
      precio_unitario: nuevoProducto.precio_unitario,
      subtotal: nuevoProducto.cantidad * nuevoProducto.precio_unitario,
    };

    setProductos([...productos, nuevoProductoConSubtotal]);
    setNuevoProducto({ nombre: "", cantidad: 1, precio_unitario: 0 });
    setAlerta({ type: "success", message: "✅ Producto agregado" });
  };

  // ✅ NUEVO: Eliminar producto
  const eliminarProducto = (id) => {
    setProductos(productos.filter((p) => p.id !== id));
    setAlerta({ type: "info", message: "🗑️ Producto eliminado" });
  };

  // ✅ NUEVO: Toggle selección de venta
  const handleToggleVenta = (ventaId) => {
    setVentasSeleccionadas((prev) =>
      prev.includes(ventaId) ? prev.filter((id) => id !== ventaId) : [...prev, ventaId]
    );
  };

  // ✅ NUEVO: Crear factura desde ventas seleccionadas
  const handleCrearFacturaDesdeVentas = async () => {
    if (ventasSeleccionadas.length === 0) {
      setAlerta({ type: "danger", message: "❌ Selecciona al menos una venta" });
      return;
    }

    const clienteIdNum = parseInt(clienteSeleccionadoVentas);
    const clienteSeleccionado = clientes.find((c) => c.id === clienteIdNum);

    if (!clienteSeleccionado) {
      setAlerta({ type: "danger", message: "❌ Cliente no encontrado" });
      return;
    }

    // Recopilar todos los productos y códigos de venta
    const productosAgrupados = [];
    const codigosVentaAgrupados = [];
    let totalDesdeVentas = 0;

    ventasSeleccionadas.forEach((ventaId) => {
      const venta = ventasDisponibles.find((v) => v.id === ventaId);
      if (venta && venta.productos_json && Array.isArray(venta.productos_json)) {
        productosAgrupados.push(...venta.productos_json);
        totalDesdeVentas += venta.monto_total || 0;
        // 🎯 NUEVO: Capturar código de venta
        if (venta.codigo_venta) {
          codigosVentaAgrupados.push(venta.codigo_venta);
        }
      }
    });

    if (productosAgrupados.length === 0) {
      setAlerta({ type: "danger", message: "❌ No hay productos en las ventas seleccionadas" });
      return;
    }

    // Crear la factura
    const resultado = await crearFactura({
      numero_factura: formData.numero_factura,
      cliente_id: clienteSeleccionado.id,
      cliente: clienteSeleccionado.nombre,
      cliente_email: clienteSeleccionado.email || "",
      cliente_telefono: clienteSeleccionado.telefono || "",
      cliente_ruc: clienteSeleccionado.ruc || "",
      cliente_direccion: clienteSeleccionado.direccion || "",
      empresa_nombre: perfilEmpresa.nombre,
      empresa_ruc: perfilEmpresa.identificacion_fiscal,
      empresa_email: perfilEmpresa.email,
      empresa_telefono: perfilEmpresa.telefono,
      empresa_direccion: perfilEmpresa.direccion,
      empresa_logo_url: perfilEmpresa.logo_url || "",
      venta_id: null, // Múltiples ventas
      subtotal: totalDesdeVentas,
      descuento: 0,
      impuesto: 0,
      total: totalDesdeVentas,
      metodo_pago: "Pendiente",
      productos_json: productosAgrupados,
      // 🎯 NUEVO: Pasar códigos de venta
      codigos_venta_json: codigosVentaAgrupados,
    });

    if (resultado.success) {
      // Marcar ventas como facturadas
      await marcarVentasFacturadas(ventasSeleccionadas);

      setAlerta({
        type: "success",
        message: `✅ Factura ${formData.numero_factura} creada desde ${ventasSeleccionadas.length} venta(s)`,
      });

      // Limpiar
      setShowVentasModal(false);
      setClienteSeleccionadoVentas("");
      setVentasDisponibles([]);
      setVentasSeleccionadas([]);
    } else {
      setAlerta({
        type: "danger",
        message: "❌ " + resultado.message,
      });
    }
  };

  // ✅ NUEVO: Calcular subtotal total desde productos
  const calcularSubtotalDesdeProductos = () => {
    return productos.reduce((total, p) => total + p.subtotal, 0);
  };

  // ✅ NUEVO: Calcular total
  const calcularTotal = () => {
    const subtotal = calcularSubtotalDesdeProductos();
    const descuento = parseFloat(formData.descuento) || 0;
    const impuesto = parseFloat(formData.impuesto) || 0;
    return subtotal - descuento + impuesto;
  };

  // ✅ MODIFICADO: handleSubmit ahora incluye productos
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validación 1: Perfil de empresa completo
    if (!perfilEmpresa?.nombre || !perfilEmpresa?.identificacion_fiscal || 
        !perfilEmpresa?.email || !perfilEmpresa?.telefono || !perfilEmpresa?.direccion) {
      setAlerta({ 
        type: "danger", 
        message: "❌ DEBE COMPLETAR el Perfil de la Empresa primero (nombre, RUC, email, teléfono, dirección). Ir a Configuración > Perfil de Empresa." 
      });
      return;
    }

    // Validación 2: Productos requeridos
    if (productos.length === 0) {
      setAlerta({ type: "danger", message: "❌ Debe agregar al menos un producto a la factura" });
      return;
    }

    // Validación 3: Cliente seleccionado
    const clienteIdNum = parseInt(formData.cliente_id);
    const clienteSeleccionado = clientes.find((c) => c.id === clienteIdNum);
    if (!clienteSeleccionado && tipoFactura !== 'ticket') {
      setAlerta({ type: "danger", message: "❌ Debes seleccionar un cliente" });
      return;
    }

    // ✅ RECOPILAR INFORMACIÓN COMPLETA con productos
    const subtotalCalculado = calcularSubtotalDesdeProductos();
    
    // 🎯 NUEVO: Capturar código de venta si existe venta_id
    const ventaIdNum = formData.venta_id ? parseInt(formData.venta_id) : null;
    const codigosVentaManual = [];
    if (ventaIdNum) {
      const ventaRelacionada = ventas.find((v) => v.id === ventaIdNum);
      if (ventaRelacionada?.codigo_venta) {
        codigosVentaManual.push(ventaRelacionada.codigo_venta);
      }
    }
    
    const resultado = await crearFactura({
      numero_factura: formData.numero_factura,
      // Información del cliente
      cliente_id: clienteSeleccionado?.id || null,
      cliente: clienteSeleccionado ? clienteSeleccionado.nombre : "Cliente Anónimo",
      cliente_email: clienteSeleccionado?.email || "",
      cliente_telefono: clienteSeleccionado?.telefono || "",
      cliente_ruc: clienteSeleccionado?.ruc || "",
      cliente_direccion: clienteSeleccionado?.direccion || "",
      // Información de la empresa
      empresa_nombre: perfilEmpresa.nombre,
      empresa_ruc: perfilEmpresa.identificacion_fiscal,
      empresa_email: perfilEmpresa.email,
      empresa_telefono: perfilEmpresa.telefono,
      empresa_direccion: perfilEmpresa.direccion,
      empresa_logo_url: perfilEmpresa.logo_url || "",
      // Datos de la factura
      venta_id: ventaIdNum,
      subtotal: subtotalCalculado,
      descuento: parseFloat(formData.descuento) || 0,
      impuesto: parseFloat(formData.impuesto) || 0,
      total: calcularTotal(),
      metodo_pago: formData.metodo_pago,
      // ✅ NUEVO: Productos JSON
      productos_json: productos.map(p => ({
        nombre: p.nombre,
        cantidad: p.cantidad,
        precio_unitario: p.precio_unitario,
        subtotal: p.subtotal,
      })),
      // 🎯 NUEVO: Pasar códigos de venta
      codigos_venta_json: codigosVentaManual,
    });

    if (resultado.success) {
      setAlerta({
        type: "success",
        message: "✅ Factura creada exitosamente con " + productos.length + " producto(s)",
      });
      setShowModal(false);
      // Limpiar formulario
      setFormData({
        numero_factura: "",
        cliente_id: "",
        venta_id: "",
        descuento: 0,
        impuesto: 0,
        metodo_pago: "Efectivo",
      });
      setProductos([]);
      setNuevoProducto({ nombre: "", cantidad: 1, precio_unitario: 0 });
    } else {
      setAlerta({
        type: "danger",
        message: "❌ " + resultado.message,
      });
    }
  };

  const descargarPDF = async (factura) => {
    try {
      setAlerta({
        type: "info",
        message: "📄 Generando PDF...",
      });

      const element = document.getElementById(`factura-${factura.id}`);
      if (!element) {
        setAlerta({
          type: "danger",
          message: "❌ No se pudo encontrar la factura para generar PDF",
        });
        return;
      }

      const originalDisplay = element.style.display;
      element.style.display = "block";
      element.style.position = "fixed";
      element.style.top = "-9999px";

      const canvas = await html2canvas(element, { 
        scale: 2, 
        useCORS: true,
        logging: false,
        allowTaint: true,
        backgroundColor: "#ffffff",
        windowWidth: 800,
        windowHeight: 1000,
      });
      
      element.style.display = originalDisplay;
      
      if (canvas.width === 0 || canvas.height === 0) {
        throw new Error("El canvas generado está vacío");
      }

      const imgData = canvas.toDataURL("image/png");
      
      if (!imgData || imgData.length < 100) {
        throw new Error("La imagen del PDF no se generó correctamente");
      }
      
      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = 210;
      const pageHeight = 297;
      
      const imgHeight = (canvas.height * pageWidth) / canvas.width;
      
      if (imgHeight <= pageHeight) {
        pdf.addImage(imgData, "PNG", 0, 0, pageWidth, imgHeight);
      } else {
        let yPosition = 0;
        let remainingHeight = imgHeight;

        while (remainingHeight > 0) {
          if (yPosition > 0) {
            pdf.addPage();
          }
          
          const heightToAdd = Math.min(pageHeight, remainingHeight);
          pdf.addImage(
            imgData, 
            "PNG", 
            0, 
            -yPosition, 
            pageWidth, 
            imgHeight
          );
          
          yPosition += pageHeight;
          remainingHeight -= pageHeight;
        }
      }

      const nombreArchivo = `Factura_${factura.numero_factura.replace(/[^a-zA-Z0-9-]/g, "_")}_${new Date().toISOString().split("T")[0]}.pdf`;
      pdf.save(nombreArchivo);
      
      setAlerta({
        type: "success",
        message: "✅ PDF descargado exitosamente",
      });
    } catch (error) {
      console.error("Error al generar PDF:", error);
      setAlerta({
        type: "danger",
        message: "❌ Error al descargar PDF: " + error.message,
      });
    }
  };

  const handleCambiarEstado = (factura) => {
    setFacturaEditando(factura);
    setEstadoFormData({
      estado: factura.estado || "pendiente",
      fecha_pago: factura.fecha_pago || "",
    });
    setShowEstadoModal(true);
  };

  const handleGuardarEstado = async (e) => {
    e.preventDefault();
    const resultado = await updateFactura(facturaEditando.id, {
      estado: estadoFormData.estado,
      metodo_pago: facturaEditando.metodo_pago,
      notas: facturaEditando.notas,
      fecha_pago: estadoFormData.estado === "pagada" ? estadoFormData.fecha_pago : null,
    });

    if (resultado.success) {
      setAlerta({
        type: "success",
        message: "✅ Estado de factura actualizado",
      });
      setShowEstadoModal(false);
    } else {
      setAlerta({
        type: "danger",
        message: "❌ " + resultado.message,
      });
    }
  };

  return (
    <div className="container mt-4">
      {alerta && (
        <Alert variant={alerta.type} onClose={() => setAlerta(null)} dismissible>
          {alerta.message}
        </Alert>
      )}

      <Card className="shadow-lg border-0 mb-4">
        <Card.Header className="mantente-bg-taupe text-white fw-bold d-flex justify-content-between align-items-center">
          <span>📄 Generador de Facturas</span>
          <div className="d-flex gap-2">
            <Button
              variant="info"
              size="sm"
              onClick={() => setShowVentasModal(true)}
            >
              📋 Desde Ventas
            </Button>
            <Button
              variant="light"
              size="sm"
              onClick={() => {
                setShowModal(true);
                setProductos([]);
                setNuevoProducto({ nombre: "", cantidad: 1, precio_unitario: 0 });
              }}
            >
              + Nueva Factura
            </Button>
          </div>
        </Card.Header>
        <Card.Body>
          <div className="table-responsive">
            <Table striped bordered hover>
              <thead className="table-light">
                <tr>
                  <th>Número</th>
                  <th>Cliente</th>
                  <th>Productos</th>
                  <th>Subtotal</th>
                  <th>Descuento</th>
                  <th>Impuesto</th>
                  <th>Total</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {facturas.length > 0 ? (
                  facturas.map((factura) => (
                    <tr key={factura.id}>
                      <td>{factura.numero_factura}</td>
                      <td>
                        <strong>{factura.cliente || "Cliente desconocido"}</strong>
                        {factura.cliente_email && (
                          <div style={{ fontSize: "12px", color: "#666" }}>{factura.cliente_email}</div>
                        )}
                      </td>
                      <td>
                        <small>
                          {factura.productos_json && factura.productos_json.length > 0
                            ? `${factura.productos_json.length} producto(s)`
                            : "Sin productos"}
                        </small>
                      </td>
                      <td>${factura.subtotal.toFixed(2)}</td>
                      <td>${factura.descuento.toFixed(2)}</td>
                      <td>${factura.impuesto.toFixed(2)}</td>
                      <td className="fw-bold">${factura.total.toFixed(2)}</td>
                      <td>
                        <span
                          className={`badge bg-${
                            factura.estado === "pagada"
                              ? "success"
                              : "warning"
                          }`}
                        >
                          {factura.estado}
                        </span>
                      </td>
                      <td>
                        <Button
                          variant="outline-info"
                          size="sm"
                          className="me-2"
                          onClick={() => handleCambiarEstado(factura)}
                        >
                          🔄 Estado
                        </Button>
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={() => descargarPDF(factura)}
                        >
                          📥 PDF
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="9" className="text-center text-muted">
                      No hay facturas registradas
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>

      {/* ✅ MODAL PARA GENERAR FACTURA DESDE VENTAS */}
      <Modal show={showVentasModal} onHide={() => setShowVentasModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>📋 Generar Factura desde Ventas</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ maxHeight: "80vh", overflowY: "auto" }}>
          <Form>
            {/* Paso 1: Seleccionar cliente */}
            <Card className="mb-4 bg-light">
              <Card.Header className="bg-primary text-white fw-bold">
                👤 Paso 1: Seleccionar Cliente
              </Card.Header>
              <Card.Body>
                <Form.Group>
                  <Form.Label>Cliente *</Form.Label>
                  <Form.Select
                    value={clienteSeleccionadoVentas}
                    onChange={(e) => setClienteSeleccionadoVentas(e.target.value)}
                  >
                    <option value="">-- Selecciona un cliente --</option>
                    {clientes.map((cliente) => (
                      <option key={cliente.id} value={cliente.id}>
                        {cliente.nombre} ({cliente.email})
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Card.Body>
            </Card>

            {/* Paso 2: Seleccionar ventas */}
            {clienteSeleccionadoVentas && (
              <Card className="mb-4 bg-light">
                <Card.Header className="bg-success text-white fw-bold">
                  📦 Paso 2: Seleccionar Ventas ({ventasDisponibles.length})
                </Card.Header>
                <Card.Body>
                  {ventasDisponibles.length > 0 ? (
                    <div>
                      <p className="text-muted mb-3">
                        Selecciona una o más ventas para agruparlas en una factura:
                      </p>
                      <div className="table-responsive">
                        <Table bordered hover size="sm">
                          <thead className="table-light">
                            <tr>
                              <th style={{ width: "50px" }}>
                                <input
                                  type="checkbox"
                                  checked={
                                    ventasSeleccionadas.length === ventasDisponibles.length &&
                                    ventasDisponibles.length > 0
                                  }
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setVentasSeleccionadas(ventasDisponibles.map((v) => v.id));
                                    } else {
                                      setVentasSeleccionadas([]);
                                    }
                                  }}
                                  title="Seleccionar/Deseleccionar todas"
                                />
                              </th>
                              <th>ID</th>
                              <th>Fecha</th>
                              <th>Productos</th>
                              <th>Total</th>
                            </tr>
                          </thead>
                          <tbody>
                            {ventasDisponibles.map((venta) => (
                              <tr
                                key={venta.id}
                                style={{
                                  backgroundColor: ventasSeleccionadas.includes(venta.id)
                                    ? "#e7f3ff"
                                    : "transparent",
                                }}
                              >
                                <td style={{ textAlign: "center" }}>
                                  <input
                                    type="checkbox"
                                    checked={ventasSeleccionadas.includes(venta.id)}
                                    onChange={() => handleToggleVenta(venta.id)}
                                  />
                                </td>
                                <td>#{venta.id}</td>
                                <td>{new Date(venta.fecha).toLocaleDateString()}</td>
                                <td>
                                  <small>
                                    {venta.cantidad_productos || 
                                     (venta.productos_json ? venta.productos_json.length : 1)} 
                                    {" "}producto(s)
                                  </small>
                                </td>
                                <td className="fw-bold">
                                  ${(venta.monto_total || venta.total || 0).toFixed(2)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </Table>
                      </div>

                      {/* Resumen de selección */}
                      {ventasSeleccionadas.length > 0 && (
                        <Alert variant="info" className="mt-3">
                          <strong>✅ {ventasSeleccionadas.length} venta(s) seleccionada(s)</strong>
                          <br />
                          Total: $
                          {ventasDisponibles
                            .filter((v) => ventasSeleccionadas.includes(v.id))
                            .reduce((sum, v) => sum + (v.monto_total || v.total || 0), 0)
                            .toFixed(2)}
                        </Alert>
                      )}
                    </div>
                  ) : (
                    <Alert variant="warning">
                      ⚠️ No hay ventas sin facturar para este cliente
                    </Alert>
                  )}
                </Card.Body>
              </Card>
            )}

            {/* Botones de acción */}
            <div className="d-flex gap-2">
              <Button
                variant="success"
                className="flex-grow-1"
                onClick={handleCrearFacturaDesdeVentas}
                disabled={ventasSeleccionadas.length === 0}
              >
                ✅ Crear Factura Agrupada
              </Button>
              <Button variant="secondary" onClick={() => setShowVentasModal(false)}>
                ❌ Cancelar
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* MODAL PARA CREAR FACTURA */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>📋 Crear Nueva Factura</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ maxHeight: "80vh", overflowY: "auto" }}>
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Tipo de Factura *</Form.Label>
                  <Form.Select
                    value={tipoFactura}
                    onChange={(e) => setTipoFactura(e.target.value)}
                    required
                  >
                    <option value="fiscal">📋 Factura Fiscal</option>
                    <option value="libre">📝 Factura Forma Libre</option>
                    <option value="ticket">🧾 Ticket</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Número de Factura</Form.Label>
                  <Form.Control
                    type="text"
                    name="numero_factura"
                    value={formData.numero_factura}
                    readOnly
                    className="bg-light"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Cliente {tipoFactura === 'ticket' ? '(Opcional)' : '*'}</Form.Label>
                  <Form.Select
                    name="cliente_id"
                    value={formData.cliente_id}
                    onChange={handleChange}
                    required={tipoFactura !== 'ticket'}
                  >
                    <option value="">-- {tipoFactura === 'ticket' ? 'Consumidor' : 'Selecciona un cliente'} --</option>
                    {clientes.map((cliente) => (
                      <option key={cliente.id} value={cliente.id}>
                        {cliente.nombre} ({cliente.email})
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Método de Pago</Form.Label>
                  <Form.Select
                    name="metodo_pago"
                    value={formData.metodo_pago}
                    onChange={handleChange}
                  >
                    <option>Efectivo</option>
                    <option>Tarjeta</option>
                    <option>Transferencia</option>
                    <option>Cheque</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            {/* ✅ SECCIÓN DE PRODUCTOS */}
            <Card className="mb-4 bg-light">
              <Card.Header className="bg-info text-white fw-bold">
                🛍️ Agregar Productos a la Factura
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col md={5}>
                    <Form.Group className="mb-3">
                      <Form.Label>Nombre del Producto *</Form.Label>
                      <Form.Control
                        type="text"
                        name="nombre"
                        value={nuevoProducto.nombre}
                        onChange={handleProductoChange}
                        placeholder="Ej: Laptop, Servicio de reparación"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={2}>
                    <Form.Group className="mb-3">
                      <Form.Label>Cantidad *</Form.Label>
                      <Form.Control
                        type="number"
                        name="cantidad"
                        value={nuevoProducto.cantidad}
                        onChange={handleProductoChange}
                        min="1"
                        step="1"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group className="mb-3">
                      <Form.Label>Precio Unitario *</Form.Label>
                      <Form.Control
                        type="number"
                        name="precio_unitario"
                        value={nuevoProducto.precio_unitario}
                        onChange={handleProductoChange}
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={2} className="d-flex align-items-end">
                    <Button
                      variant="success"
                      size="sm"
                      className="w-100"
                      onClick={agregarProducto}
                    >
                      ➕ Agregar
                    </Button>
                  </Col>
                </Row>

                {/* Tabla de productos agregados */}
                {productos.length > 0 && (
                  <div className="mt-4">
                    <h6 className="mb-3">📦 Productos Agregados ({productos.length}):</h6>
                    <Table striped bordered hover size="sm">
                      <thead className="table-light">
                        <tr>
                          <th>Producto</th>
                          <th style={{ width: "80px" }}>Cantidad</th>
                          <th style={{ width: "120px" }}>Precio Unit.</th>
                          <th style={{ width: "120px" }}>Subtotal</th>
                          <th style={{ width: "60px" }}>Acción</th>
                        </tr>
                      </thead>
                      <tbody>
                        {productos.map((producto) => (
                          <tr key={producto.id}>
                            <td>{producto.nombre}</td>
                            <td className="text-center">{producto.cantidad}</td>
                            <td className="text-right">${producto.precio_unitario.toFixed(2)}</td>
                            <td className="text-right fw-bold">${producto.subtotal.toFixed(2)}</td>
                            <td className="text-center">
                              <Button
                                variant="outline-danger"
                                size="sm"
                                onClick={() => eliminarProducto(producto.id)}
                              >
                                🗑️
                              </Button>
                            </td>
                          </tr>
                        ))}
                        <tr className="table-light fw-bold">
                          <td colSpan="3" className="text-right">SUBTOTAL PRODUCTOS:</td>
                          <td className="text-right">${calcularSubtotalDesdeProductos().toFixed(2)}</td>
                          <td></td>
                        </tr>
                      </tbody>
                    </Table>
                  </div>
                )}
              </Card.Body>
            </Card>

            {/* Descuentos e Impuestos */}
            <Row>
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>Descuento</Form.Label>
                  <Form.Control
                    type="number"
                    name="descuento"
                    value={formData.descuento}
                    onChange={handleChange}
                    step="0.01"
                    min="0"
                  />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>Impuesto</Form.Label>
                  <Form.Control
                    type="number"
                    name="impuesto"
                    value={formData.impuesto}
                    onChange={handleChange}
                    step="0.01"
                    min="0"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold">TOTAL: ${calcularTotal().toFixed(2)}</Form.Label>
                  <div className="p-2 bg-light border rounded text-center fw-bold" style={{ fontSize: "18px", color: "#333" }}>
                    ${calcularTotal().toFixed(2)}
                  </div>
                </Form.Group>
              </Col>
            </Row>

            <div className="d-flex gap-2">
              <Button variant="primary" type="submit" className="flex-grow-1">
                ✅ Crear Factura
              </Button>
              <Button variant="secondary" onClick={() => setShowModal(false)}>
                ❌ Cancelar
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* MODAL CAMBIAR ESTADO */}
      <Modal show={showEstadoModal} onHide={() => setShowEstadoModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Cambiar Estado de Factura</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleGuardarEstado}>
            <Form.Group className="mb-3">
              <Form.Label>Estado</Form.Label>
              <Form.Select
                value={estadoFormData.estado}
                onChange={(e) =>
                  setEstadoFormData({ ...estadoFormData, estado: e.target.value })
                }
              >
                <option value="pendiente">⏳ Pendiente</option>
                <option value="pagada">✅ Pagada</option>
                <option value="cancelada">❌ Cancelada</option>
              </Form.Select>
            </Form.Group>
            {estadoFormData.estado === "pagada" && (
              <Form.Group className="mb-3">
                <Form.Label>Fecha de Pago</Form.Label>
                <Form.Control
                  type="date"
                  value={estadoFormData.fecha_pago}
                  onChange={(e) =>
                    setEstadoFormData({ ...estadoFormData, fecha_pago: e.target.value })
                  }
                />
              </Form.Group>
            )}
            <div className="d-flex gap-2">
              <Button variant="primary" type="submit" className="flex-grow-1">
                Guardar
              </Button>
              <Button variant="secondary" onClick={() => setShowEstadoModal(false)}>
                Cancelar
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* PLANTILLAS INVISIBLES PARA GENERAR PDF */}
      {facturas.map((factura) => (
        <div key={factura.id} id={`factura-${factura.id}`} style={{ display: "none" }}>
          <FacturaTemplate factura={factura} perfilEmpresa={perfilEmpresa} />
        </div>
      ))}

      {/* MODAL CAMBIAR ESTADO */}
      <Modal show={showEstadoModal} onHide={() => setShowEstadoModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Cambiar Estado de Factura</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleGuardarEstado}>
            <Form.Group className="mb-3">
              <Form.Label>Estado</Form.Label>
              <Form.Select
                value={estadoFormData.estado}
                onChange={(e) =>
                  setEstadoFormData({ ...estadoFormData, estado: e.target.value })
                }
              >
                <option value="pendiente">⏳ Pendiente</option>
                <option value="pagada">✅ Pagada</option>
                <option value="cancelada">❌ Cancelada</option>
              </Form.Select>
            </Form.Group>
            {estadoFormData.estado === "pagada" && (
              <Form.Group className="mb-3">
                <Form.Label>Fecha de Pago</Form.Label>
                <Form.Control
                  type="date"
                  value={estadoFormData.fecha_pago}
                  onChange={(e) =>
                    setEstadoFormData({ ...estadoFormData, fecha_pago: e.target.value })
                  }
                />
              </Form.Group>
            )}
            <div className="d-flex gap-2">
              <Button variant="primary" type="submit" className="flex-grow-1">
                Guardar
              </Button>
              <Button variant="secondary" onClick={() => setShowEstadoModal(false)}>
                Cancelar
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

// ✅ PLANTILLA MEJORADA CON TABLA DE PRODUCTOS
const FacturaTemplate = ({ factura, perfilEmpresa }) => {
  const empresaInfo = {
    nombre: factura.empresa_nombre || perfilEmpresa?.nombre || "Tu Empresa",
    ruc: factura.empresa_ruc || perfilEmpresa?.identificacion_fiscal || "",
    email: factura.empresa_email || perfilEmpresa?.email || "",
    telefono: factura.empresa_telefono || perfilEmpresa?.telefono || "",
    direccion: factura.empresa_direccion || perfilEmpresa?.direccion || "",
    logo_url: factura.empresa_logo_url || perfilEmpresa?.logo_url || "",
  };

  const clienteInfo = {
    nombre: factura.cliente || "Cliente",
    email: factura.cliente_email || "No especificado",
    ruc: factura.cliente_ruc || "",
    telefono: factura.cliente_telefono || "",
    direccion: factura.cliente_direccion || "",
  };

  // ✅ Obtener productos del JSON
  const productosArray = factura.productos_json && Array.isArray(factura.productos_json) 
    ? factura.productos_json 
    : [];

  // ✅ ARREGLO: Calcular subtotal desde productos (fallback si factura.subtotal es 0)
  const calcularSubtotalDesdeProductosTemplate = () => {
    if (productosArray.length === 0) return 0;
    return productosArray.reduce((total, p) => {
      const precio = parseFloat(p.precio_unitario) || 0;
      const cantidad = parseFloat(p.cantidad) || 1;
      return total + (precio * cantidad);
    }, 0);
  };

  // ✅ ARREGLO: Usar subtotal calculado o factura.subtotal si existe
  const subtotalFinal = factura.subtotal > 0 ? parseFloat(factura.subtotal) : calcularSubtotalDesdeProductosTemplate();
  const descuentoFinal = parseFloat(factura.descuento) || 0;
  const impuestoFinal = parseFloat(factura.impuesto) || 0;
  const totalFinal = subtotalFinal - descuentoFinal + impuestoFinal;

  return (
    <div style={{ 
      padding: "40px", 
      fontFamily: "Arial, sans-serif",
      backgroundColor: "#ffffff",
      width: "800px",
      margin: "0 auto"
    }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "40px", borderBottom: "2px solid #333", paddingBottom: "20px" }}>
        {empresaInfo.logo_url && (
          <img
            src={empresaInfo.logo_url}
            alt="Logo"
            style={{ maxHeight: "60px", marginBottom: "15px", display: "block" }}
          />
        )}
        <h1 style={{ margin: "10px 0 5px 0", fontSize: "32px", fontWeight: "bold" }}>FACTURA</h1>
        <p style={{ margin: "5px 0", fontSize: "16px", color: "#333", fontWeight: "600" }}>
          {factura.numero_factura}
        </p>
        <p style={{ margin: "5px 0", fontSize: "12px", color: "#666" }}>
          Fecha: {factura.fecha ? new Date(factura.fecha).toLocaleDateString() : new Date().toLocaleDateString()}
        </p>
      </div>

      {/* Datos De y Para */}
      <table style={{ width: "100%", marginBottom: "30px", borderCollapse: "collapse" }}>
        <tbody>
          <tr>
            <td style={{ width: "50%", verticalAlign: "top", paddingRight: "20px" }}>
              <p style={{ margin: "0 0 10px 0", fontSize: "12px", fontWeight: "bold", textTransform: "uppercase", color: "#333" }}>📋 EMITIDO POR:</p>
              <p style={{ margin: "0 0 5px 0", fontSize: "13px", fontWeight: "bold" }}>
                {empresaInfo.nombre}
              </p>
              {empresaInfo.ruc && (
                <p style={{ margin: "0 0 3px 0", fontSize: "11px", color: "#555" }}>
                  <strong>RUC:</strong> {empresaInfo.ruc}
                </p>
              )}
              {empresaInfo.email && (
                <p style={{ margin: "0 0 3px 0", fontSize: "11px", color: "#555" }}>
                  <strong>Email:</strong> {empresaInfo.email}
                </p>
              )}
              {empresaInfo.telefono && (
                <p style={{ margin: "0 0 3px 0", fontSize: "11px", color: "#555" }}>
                  <strong>Tel:</strong> {empresaInfo.telefono}
                </p>
              )}
              {empresaInfo.direccion && (
                <p style={{ margin: "0", fontSize: "11px", color: "#555" }}>
                  <strong>Dirección:</strong> {empresaInfo.direccion}
                </p>
              )}
            </td>
            <td style={{ width: "50%", verticalAlign: "top" }}>
              <p style={{ margin: "0 0 10px 0", fontSize: "12px", fontWeight: "bold", textTransform: "uppercase", color: "#333" }}>👤 CLIENTE:</p>
              <p style={{ margin: "0 0 5px 0", fontSize: "13px", fontWeight: "bold" }}>
                {clienteInfo.nombre}
              </p>
              <p style={{ margin: "0 0 3px 0", fontSize: "11px", color: "#555" }}>
                <strong>Email:</strong> {clienteInfo.email}
              </p>
              {clienteInfo.ruc && (
                <p style={{ margin: "0 0 3px 0", fontSize: "11px", color: "#555" }}>
                  <strong>RUC:</strong> {clienteInfo.ruc}
                </p>
              )}
              {clienteInfo.telefono && (
                <p style={{ margin: "0 0 3px 0", fontSize: "11px", color: "#555" }}>
                  <strong>Tel:</strong> {clienteInfo.telefono}
                </p>
              )}
              {clienteInfo.direccion && (
                <p style={{ margin: "0", fontSize: "11px", color: "#555" }}>
                  <strong>Dirección:</strong> {clienteInfo.direccion}
                </p>
              )}
            </td>
          </tr>
        </tbody>
      </table>

      {/* 🎯 CÓDIGOS DE VENTA - NUEVA SECCIÓN */}
      {factura.codigos_venta_json && factura.codigos_venta_json.length > 0 && (
        <div style={{ 
          backgroundColor: "#f0f8ff", 
          border: "2px solid #0066cc", 
          padding: "15px", 
          marginBottom: "30px", 
          borderRadius: "5px"
        }}>
          <p style={{ 
            margin: "0 0 10px 0", 
            fontSize: "12px", 
            fontWeight: "bold", 
            textTransform: "uppercase", 
            color: "#0066cc" 
          }}>
            📦 Códigos de Venta Asociados
          </p>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            {Array.isArray(factura.codigos_venta_json) && factura.codigos_venta_json.map((codigo, index) => (
              <span 
                key={index}
                style={{
                  backgroundColor: "#0066cc",
                  color: "#ffffff",
                  padding: "6px 12px",
                  borderRadius: "4px",
                  fontSize: "12px",
                  fontWeight: "bold",
                  fontFamily: "monospace"
                }}
              >
                {codigo}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ✅ TABLA DE PRODUCTOS PROFESIONAL */}
      <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "30px", border: "1px solid #333" }}>
        <thead>
          <tr style={{ backgroundColor: "#f5f5f5", borderBottom: "2px solid #333" }}>
            <th style={{ textAlign: "left", padding: "12px", fontSize: "12px", fontWeight: "bold", borderRight: "1px solid #ddd" }}>Producto/Servicio</th>
            <th style={{ textAlign: "center", padding: "12px", fontSize: "12px", fontWeight: "bold", width: "80px", borderRight: "1px solid #ddd" }}>Cantidad</th>
            <th style={{ textAlign: "right", padding: "12px", fontSize: "12px", fontWeight: "bold", width: "100px", borderRight: "1px solid #ddd" }}>Precio Unit.</th>
            <th style={{ textAlign: "right", padding: "12px", fontSize: "12px", fontWeight: "bold", width: "100px" }}>Subtotal</th>
          </tr>
        </thead>
        <tbody>
          {productosArray.length > 0 ? (
            productosArray.map((producto, index) => (
              <tr key={index} style={{ borderBottom: "1px solid #ddd" }}>
                <td style={{ padding: "12px", fontSize: "12px", borderRight: "1px solid #ddd" }}>
                  {producto.nombre}
                </td>
                <td style={{ textAlign: "center", padding: "12px", fontSize: "12px", borderRight: "1px solid #ddd" }}>
                  {producto.cantidad}
                </td>
                <td style={{ textAlign: "right", padding: "12px", fontSize: "12px", borderRight: "1px solid #ddd" }}>
                  ${parseFloat(producto.precio_unitario).toFixed(2)}
                </td>
                <td style={{ textAlign: "right", padding: "12px", fontSize: "12px", fontWeight: "bold" }}>
                  ${parseFloat(producto.subtotal).toFixed(2)}
                </td>
              </tr>
            ))
          ) : (
            <tr style={{ borderBottom: "1px solid #ddd" }}>
              <td colSpan="4" style={{ padding: "12px", fontSize: "12px", textAlign: "center", color: "#999" }}>
                Sin productos registrados
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Resumen totales */}
      <div style={{ marginBottom: "30px", display: "flex", justifyContent: "flex-end" }}>
        <div style={{ width: "250px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: "8px", borderBottom: "1px solid #ddd", marginBottom: "8px" }}>
            <span style={{ fontSize: "12px", fontWeight: "600" }}>Subtotal:</span>
            <span style={{ fontSize: "12px" }}>${subtotalFinal.toFixed(2)}</span>
          </div>
          {descuentoFinal > 0 && (
            <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: "8px", marginBottom: "8px", color: "#d9534f" }}>
              <span style={{ fontSize: "12px", fontWeight: "600" }}>Descuento:</span>
              <span style={{ fontSize: "12px" }}>-${descuentoFinal.toFixed(2)}</span>
            </div>
          )}
          {impuestoFinal > 0 && (
            <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: "8px", marginBottom: "8px" }}>
              <span style={{ fontSize: "12px", fontWeight: "600" }}>Impuesto:</span>
              <span style={{ fontSize: "12px" }}>+${impuestoFinal.toFixed(2)}</span>
            </div>
          )}
          <div style={{ 
            display: "flex", 
            justifyContent: "space-between", 
            paddingTop: "12px", 
            borderTop: "2px solid #333",
            borderBottom: "2px solid #333",
            paddingBottom: "12px",
            marginBottom: "8px"
          }}>
            <span style={{ fontSize: "14px", fontWeight: "bold" }}>TOTAL:</span>
            <span style={{ fontSize: "14px", fontWeight: "bold" }}>${totalFinal.toFixed(2)}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "#666" }}>
            <span>Método pago:</span>
            <span>{factura.metodo_pago || "No especificado"}</span>
          </div>
          {factura.estado && (
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "#666", marginTop: "5px" }}>
              <span>Estado:</span>
              <span style={{ textTransform: "uppercase", fontWeight: "bold", color: factura.estado === "pagada" ? "#5cb85c" : "#f0ad4e" }}>
                {factura.estado}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div style={{ fontSize: "11px", color: "#666", textAlign: "center", borderTop: "1px solid #ddd", paddingTop: "20px" }}>
        <p style={{ margin: "5px 0" }}>¡Gracias por su compra!</p>
        <p style={{ margin: "5px 0" }}>Factura generada el {new Date().toLocaleDateString()}</p>
      </div>
    </div>
  );
};

export default GeneradorFacturas;