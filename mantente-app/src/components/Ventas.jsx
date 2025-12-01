// src/components/Ventas.jsx - VERSIÓN MEJORADA CON MÚLTIPLES PRODUCTOS
import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { Card, Form, Button, Row, Col, Alert, Modal, Table } from "react-bootstrap";

const Ventas = () => {
  const {
    registrarVenta,
    crearFactura,
    actualizarInventario,
    inventario,
    clientes,
    crearCliente,
    garantizarMesAbierto,
    perfilEmpresa,
    user,
    obtenerInventario,
    obtenerClientes,
    obtenerPerfilEmpresa,
  } = useApp();

  useEffect(() => {
    if (!user?.id) return;

    obtenerInventario();
    obtenerClientes();
    
    const autoRefreshInterval = setInterval(() => {
      obtenerInventario();
      obtenerClientes();
    }, 60000);

    return () => clearInterval(autoRefreshInterval);
  }, [user?.id]);

  // ==========================================
  // 🛍️ NUEVO: ESTADO PARA MÚLTIPLES PRODUCTOS
  // ==========================================
  const [productos, setProductos] = useState([]);
  const [nuevoProducto, setNuevoProducto] = useState({
    nombre: "",
    cantidad: 1,
    precio: "",
  });

  // ==========================================
  // 👥 ESTADO DEL CLIENTE
  // ==========================================
  const [formData, setFormData] = useState({
    cliente_id: "",
    clienteNombre: "",
    descuento: 0,
    // ✅ NUEVO: Opción de generar factura automáticamente
    autoFacturar: false,
  });

  const [alerta, setAlerta] = useState(null);
  const [showModalCliente, setShowModalCliente] = useState(false);
  const [nuevoCliente, setNuevoCliente] = useState({
    nombre: "",
    email: "",
    telefono: "",
  });

  // ==========================================
  // 🛒 MANEJO DE PRODUCTOS
  // ==========================================
  
  const handleProductoChange = (e) => {
    const nombreProducto = e.target.value;
    const productoSeleccionado = inventario.find(
      (p) => p.nombre.toLowerCase() === nombreProducto.toLowerCase()
    );

    if (productoSeleccionado) {
      setNuevoProducto({
        nombre: nombreProducto,
        cantidad: 1,
        precio: productoSeleccionado.precio || "",
      });
    } else {
      setNuevoProducto({
        nombre: nombreProducto,
        cantidad: 1,
        precio: "",
      });
    }
  };

  const handleNuevoProductoChange = (e) => {
    const { name, value } = e.target;
    setNuevoProducto({
      ...nuevoProducto,
      [name]: name === "nombre" ? value : parseFloat(value) || 0,
    });
  };

  // ✅ NUEVO: Agregar producto a la lista
  const agregarProducto = () => {
    if (!nuevoProducto.nombre.trim()) {
      setAlerta({ type: "danger", message: "❌ Selecciona un producto" });
      return;
    }
    if (nuevoProducto.cantidad <= 0) {
      setAlerta({ type: "danger", message: "❌ La cantidad debe ser mayor a 0" });
      return;
    }
    if (nuevoProducto.precio <= 0) {
      setAlerta({ type: "danger", message: "❌ El precio debe ser mayor a 0" });
      return;
    }

    // Validar stock
    const productoEnInventario = inventario.find(
      (p) => p.nombre.toLowerCase() === nuevoProducto.nombre.toLowerCase()
    );
    if (!productoEnInventario) {
      setAlerta({ type: "danger", message: "❌ Producto no encontrado en inventario" });
      return;
    }
    if (nuevoProducto.cantidad > productoEnInventario.cantidad) {
      setAlerta({ 
        type: "danger", 
        message: `❌ Stock insuficiente. Disponible: ${productoEnInventario.cantidad}` 
      });
      return;
    }

    // Agregar producto
    const productoConSubtotal = {
      id: Date.now(),
      nombre: nuevoProducto.nombre,
      cantidad: nuevoProducto.cantidad,
      precio: nuevoProducto.precio,
      subtotal: nuevoProducto.cantidad * nuevoProducto.precio,
    };

    setProductos([...productos, productoConSubtotal]);
    setNuevoProducto({ nombre: "", cantidad: 1, precio: "" });
    setAlerta({ type: "success", message: "✅ Producto agregado" });
  };

  // ✅ NUEVO: Eliminar producto
  const eliminarProducto = (id) => {
    setProductos(productos.filter((p) => p.id !== id));
  };

  // ✅ NUEVO: Calcular total
  const calcularTotal = () => {
    const subtotal = productos.reduce((acc, p) => acc + p.subtotal, 0);
    const descuento = parseFloat(formData.descuento) || 0;
    return subtotal - descuento;
  };

  // ==========================================
  // 👥 MANEJO DE CLIENTE
  // ==========================================

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleClienteChange = (e) => {
    const clienteId = e.target.value;
    const clienteSeleccionado = clientes.find((c) => c.id === clienteId);
    setFormData({
      ...formData,
      cliente_id: clienteId,
      clienteNombre: clienteSeleccionado?.nombre || "",
    });
  };

  const handleCrearCliente = async (e) => {
    e.preventDefault();
    const resultado = await crearCliente({
      nombre: nuevoCliente.nombre,
      email: nuevoCliente.email,
      telefono: nuevoCliente.telefono,
    });

    if (resultado.success) {
      setAlerta({ type: "success", message: "✅ Cliente creado exitosamente" });
      setFormData({
        ...formData,
        cliente_id: resultado.data.id,
        clienteNombre: resultado.data.nombre,
      });
      setShowModalCliente(false);
      setNuevoCliente({ nombre: "", email: "", telefono: "" });
    } else {
      setAlerta({ type: "danger", message: "❌ " + resultado.message });
    }
  };

  // ==========================================
  // 💾 GUARDAR VENTA
  // ==========================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validaciones
    if (productos.length === 0) {
      setAlerta({ type: "danger", message: "❌ Debes agregar al menos un producto" });
      return;
    }
    if (!formData.cliente_id) {
      setAlerta({ type: "danger", message: "❌ Debes seleccionar un cliente" });
      return;
    }

    const fechaHoy = new Date().toISOString().split("T")[0];
    const mesCierre = fechaHoy.slice(0, 7) + "-01";

    // Garantizar que el período esté abierto
    const garantiaRes = await garantizarMesAbierto(mesCierre);
    if (!garantiaRes.success) {
      setAlerta({ type: "danger", message: "❌ " + garantiaRes.message });
      return;
    }

    try {
      // Calcular totales
      const subtotal = productos.reduce((acc, p) => acc + p.subtotal, 0);
      const descuento = parseFloat(formData.descuento) || 0;
      const total = subtotal - descuento;

      // Generar código de venta único
      const codigoVenta = `VENTA-${Date.now()}`;

      // Calcular cantidad total de productos
      const cantidadTotal = productos.reduce((acc, p) => acc + p.cantidad, 0);

      // Preparar datos de venta
      const ventaData = {
        codigo_venta: codigoVenta,
        cliente: formData.clienteNombre,
        cliente_id: formData.cliente_id,
        producto: productos.length === 1 ? productos[0].nombre : `${productos.length} productos`,
        cantidad: cantidadTotal,
        monto: total,
        descuento: descuento,
        total: total,
        metodo_pago: "Efectivo",
        fecha: fechaHoy,
        mes_cierre: mesCierre,
        productos_json: productos.map(p => ({
          nombre: p.nombre,
          cantidad: p.cantidad,
          precio_unitario: p.precio,
          subtotal: p.subtotal,
        })),
        cantidad_productos: productos.length,
      };

      // Registrar la venta
      const ventaResult = await registrarVenta(ventaData);
      if (!ventaResult.success) {
        setAlerta({ type: "danger", message: "❌ " + ventaResult.message });
        return;
      }

      // ✅ NUEVO: Actualizar inventario para cada producto
      for (const producto of productos) {
        await actualizarInventario(producto.nombre, producto.cantidad);
      }

      // ✅ NUEVO: Si está activada la opción de auto-facturar, crear factura
      if (formData.autoFacturar) {
        // ✅ ARREGLO: Cargar perfil de empresa directamente cuando sea necesario
        let perfilActual = perfilEmpresa;
        if (!perfilActual) {
          console.log("⚠️ Perfil de empresa no estaba cargado, cargando ahora...");
          const perfilResult = await obtenerPerfilEmpresa();
          if (!perfilResult.success || !perfilResult.data) {
            setAlerta({
              type: "warning",
              message: `⚠️ No se pudo cargar el perfil de empresa. Verifica tu conexión e intenta nuevamente.`,
            });
            return;
          }
          perfilActual = perfilResult.data;
        }
        
        // Validar perfil de empresa y dar feedback específico
        if (!perfilActual) {
          setAlerta({
            type: "danger",
            message: "❌ Error: No se pudo cargar la información de la empresa para generar la factura.",
          });
          return;
        }

        const camposFaltantes = [];
        if (!perfilActual.nombre) camposFaltantes.push("Nombre");
        if (!perfilActual.identificacion_fiscal) camposFaltantes.push("Identificación Fiscal");
        if (!perfilActual.email) camposFaltantes.push("Email");

        if (camposFaltantes.length > 0) {
          setAlerta({
            type: "danger",
            message: `❌ Para crear factura automática, completa estos campos en tu Perfil de Empresa: ${camposFaltantes.join(", ")}. ⚙️ Ve a Perfil de Empresa en el menú.`,
          });
          console.warn("❌ Campos faltantes en perfil de empresa:", { camposFaltantes, perfilActual });
        } else {
          // Generar número de factura
          const timestamp = Date.now().toString().slice(-3);
          const ventaId = ventaResult.data?.id;
          if (!ventaId) {
            setAlerta({
              type: "danger",
              message: "❌ Error: No se pudo obtener el ID de la venta para generar la factura.",
            });
            return;
          }
          const numeroFactura = `FAC-${ventaId}-${timestamp}`;

          const facturaData = {
            numero_factura: numeroFactura,
            cliente_id: formData.cliente_id,
            cliente: formData.clienteNombre,
            cliente_email: clientes.find(c => c.id === formData.cliente_id)?.email || "",
            cliente_telefono: clientes.find(c => c.id === formData.cliente_id)?.telefono || "",
            cliente_direccion: clientes.find(c => c.id === formData.cliente_id)?.direccion || "",
            empresa_nombre: perfilActual?.nombre || "",
            empresa_ruc: perfilActual?.identificacion_fiscal || "",
            empresa_email: perfilActual?.email || "",
            empresa_telefono: perfilActual?.telefono || "",
            empresa_direccion: perfilActual?.direccion || "",
            fecha: fechaHoy,
            subtotal: subtotal,
            descuento: descuento,
            impuesto: 0,
            total: total,
            estado: "pendiente",
            metodo_pago: "Efectivo",
            productos_json: ventaData.productos_json,
            ventas_ids: [ventaId], // ✅ Vincular a la venta
            codigos_venta_json: [ventaResult.data?.codigo_venta], // 🎯 ARREGLO CRÍTICO: Pasar el código de venta para trazabilidad
          };

          const facturaResult = await crearFactura(facturaData);
          if (facturaResult.success) {
            setAlerta({
              type: "success",
              message: `✅ Venta y Factura ${numeroFactura} creadas exitosamente`,
            });
          } else {
            setAlerta({
              type: "success",
              message: "✅ Venta registrada. Error al crear factura automática.",
            });
          }
        }
      } else {
        setAlerta({ type: "success", message: "✅ Venta registrada exitosamente" });
      }

      // Limpiar formulario
      setProductos([]);
      setFormData({
        cliente_id: "",
        clienteNombre: "",
        descuento: 0,
        autoFacturar: false,
      });
      setNuevoProducto({ nombre: "", cantidad: 1, precio: "" });
    } catch (error) {
      console.error("Error:", error);
      setAlerta({ type: "danger", message: "❌ Error al registrar venta: " + error.message });
    }
  };

  return (
    <div className="container mt-4">
      <Card className="shadow-lg border-0">
        <Card.Header className="mantente-bg-blue text-white fw-bold">
          🛍️ Registrar Nueva Venta (Múltiples Productos)
        </Card.Header>
        <Card.Body>
          {alerta && (
            <Alert variant={alerta.type} onClose={() => setAlerta(null)} dismissible>
              {alerta.message}
            </Alert>
          )}

          <Form onSubmit={handleSubmit}>
            {/* ==================== SECCIÓN 1: CLIENTE ==================== */}
            <Card className="mb-4 border-light">
              <Card.Header className="bg-light fw-bold">👥 Información del Cliente</Card.Header>
              <Card.Body>
                <Row className="mb-3">
                  <Col md={10}>
                    <Form.Group>
                      <Form.Label>Cliente *</Form.Label>
                      <Form.Select
                        name="cliente_id"
                        value={formData.cliente_id}
                        onChange={handleClienteChange}
                        required
                      >
                        <option value="">-- Selecciona un cliente --</option>
                        {clientes.map((cliente) => (
                          <option key={cliente.id} value={cliente.id}>
                            {cliente.nombre}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={2} className="d-flex align-items-end">
                    <Button
                      variant="outline-primary"
                      size="sm"
                      onClick={() => setShowModalCliente(true)}
                      className="w-100"
                    >
                      + Nuevo
                    </Button>
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            {/* ==================== SECCIÓN 2: PRODUCTOS ==================== */}
            <Card className="mb-4 border-light">
              <Card.Header className="bg-light fw-bold">📦 Agregar Productos</Card.Header>
              <Card.Body>
                <Row className="mb-3">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Producto *</Form.Label>
                      <Form.Select
                        value={nuevoProducto.nombre}
                        onChange={handleProductoChange}
                      >
                        <option value="">-- Selecciona un producto --</option>
                        {inventario.map((prod) => (
                          <option key={prod.id} value={prod.nombre}>
                            {prod.nombre} (Stock: {prod.cantidad || 0})
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group>
                      <Form.Label>Cantidad *</Form.Label>
                      <Form.Control
                        type="number"
                        name="cantidad"
                        value={nuevoProducto.cantidad}
                        onChange={handleNuevoProductoChange}
                        min="1"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group>
                      <Form.Label>Precio Unitario *</Form.Label>
                      <Form.Control
                        type="number"
                        name="precio"
                        value={nuevoProducto.precio}
                        onChange={handleNuevoProductoChange}
                        step="0.01"
                        min="0"
                      />
                    </Form.Group>
                  </Col>
                </Row>
                <Row>
                  <Col>
                    <Button
                      variant="success"
                      onClick={agregarProducto}
                      className="w-100"
                    >
                      ➕ Agregar Producto
                    </Button>
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            {/* ==================== SECCIÓN 3: TABLA DE PRODUCTOS ==================== */}
            {productos.length > 0 && (
              <Card className="mb-4 border-light">
                <Card.Header className="bg-light fw-bold">📋 Productos Agregados ({productos.length})</Card.Header>
                <Card.Body>
                  <div className="table-responsive">
                    <Table striped bordered hover size="sm">
                      <thead className="mantente-bg-blue text-white">
                        <tr>
                          <th>Producto</th>
                          <th className="text-center">Cantidad</th>
                          <th className="text-end">Precio Unit.</th>
                          <th className="text-end">Subtotal</th>
                          <th className="text-center">Acción</th>
                        </tr>
                      </thead>
                      <tbody>
                        {productos.map((prod) => (
                          <tr key={prod.id}>
                            <td>{prod.nombre}</td>
                            <td className="text-center">{prod.cantidad}</td>
                            <td className="text-end">${prod.precio.toFixed(2)}</td>
                            <td className="text-end fw-bold">${prod.subtotal.toFixed(2)}</td>
                            <td className="text-center">
                              <Button
                                variant="danger"
                                size="sm"
                                onClick={() => eliminarProducto(prod.id)}
                              >
                                🗑️
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                </Card.Body>
              </Card>
            )}

            {/* ==================== SECCIÓN 4: RESUMEN FINANCIERO ==================== */}
            <Card className="mb-4 border-light">
              <Card.Header className="bg-light fw-bold">💰 Resumen Financiero</Card.Header>
              <Card.Body>
                <Row className="mb-3">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Descuento (Opcional)</Form.Label>
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
                  <Col md={6}>
                    <div className="p-3 bg-light rounded">
                      <div className="mb-2">
                        <strong>Subtotal:</strong> ${(
                          productos.reduce((acc, p) => acc + p.subtotal, 0)
                        ).toFixed(2)}
                      </div>
                      <div className="mb-2">
                        <strong>Descuento:</strong> -${formData.descuento.toFixed(2)}
                      </div>
                      <hr />
                      <div className="fs-5 fw-bold text-success">
                        <strong>Total:</strong> ${calcularTotal().toFixed(2)}
                      </div>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            {/* ==================== SECCIÓN 5: OPCIONES AVANZADAS ==================== */}
            <Card className="mb-4 border-light">
              <Card.Header className="bg-light fw-bold">⚙️ Opciones</Card.Header>
              <Card.Body>
                <Form.Check
                  type="checkbox"
                  name="autoFacturar"
                  label="✅ Generar factura automáticamente (al guardar venta)"
                  checked={formData.autoFacturar}
                  onChange={handleChange}
                />
                <small className="text-muted d-block mt-2">
                  Si activas esta opción, se creará una factura automáticamente cuando guardes la venta.
                </small>
              </Card.Body>
            </Card>

            {/* ==================== BOTÓN GUARDAR ==================== */}
            <Row className="mt-4">
              <Col>
                <Button
                  variant="primary"
                  type="submit"
                  size="lg"
                  className="w-100 fw-bold"
                >
                  💾 Guardar Venta {formData.autoFacturar && "+ Factura"}
                </Button>
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>

      {/* ==================== MODAL: CREAR CLIENTE ==================== */}
      <Modal show={showModalCliente} onHide={() => setShowModalCliente(false)}>
        <Modal.Header closeButton>
          <Modal.Title>➕ Crear Nuevo Cliente</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleCrearCliente}>
            <Form.Group className="mb-3">
              <Form.Label htmlFor="cliente-nombre">Nombre *</Form.Label>
              <Form.Control
                id="cliente-nombre"
                name="nombre"
                type="text"
                value={nuevoCliente.nombre}
                onChange={(e) => setNuevoCliente({ ...nuevoCliente, nombre: e.target.value })}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label htmlFor="cliente-email">Email</Form.Label>
              <Form.Control
                id="cliente-email"
                name="email"
                type="email"
                value={nuevoCliente.email}
                onChange={(e) => setNuevoCliente({ ...nuevoCliente, email: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label htmlFor="cliente-telefono">Teléfono</Form.Label>
              <Form.Control
                id="cliente-telefono"
                name="telefono"
                type="text"
                value={nuevoCliente.telefono}
                onChange={(e) => setNuevoCliente({ ...nuevoCliente, telefono: e.target.value })}
              />
            </Form.Group>
            <Button variant="primary" type="submit" className="w-100">
              Crear Cliente
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default Ventas;