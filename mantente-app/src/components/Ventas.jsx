// src/components/Ventas.jsx
import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { Card, Form, Button, Row, Col, Alert, Modal } from "react-bootstrap";

const Ventas = () => {
  const { 
    registrarVenta, 
    actualizarInventario, 
    inventario, 
    clientes, 
    crearCliente,
    garantizarMesAbierto
  } = useApp();
  const [formData, setFormData] = useState({
    producto: "",
    cantidad: 1,
    precio: "",
    cliente_id: "",
    clienteNombre: "",
    descuento: 0,
  });
  const [alerta, setAlerta] = useState(null);
  const [showModalCliente, setShowModalCliente] = useState(false);
  const [nuevoCliente, setNuevoCliente] = useState({
    nombre: "",
    email: "",
    telefono: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleProductoChange = (e) => {
    const nombreProducto = e.target.value;
    const productoSeleccionado = inventario.find(
      (p) => p.nombre.toLowerCase() === nombreProducto.toLowerCase()
    );

    if (productoSeleccionado) {
      setFormData({
        ...formData,
        producto: nombreProducto,
        precio: productoSeleccionado.precio || "",
      });
    } else {
      setFormData({ ...formData, producto: nombreProducto, precio: "" });
    }
  };

  const handleCrearCliente = async (e) => {
    e.preventDefault();
    const resultado = await crearCliente({
      nombre: nuevoCliente.nombre,
      email: nuevoCliente.email,
      telefono: nuevoCliente.telefono,
    });

    if (resultado.success) {
      setAlerta({
        type: "success",
        message: "✅ Cliente creado exitosamente",
      });
      setFormData({
        ...formData,
        cliente_id: resultado.data.id,
        clienteNombre: resultado.data.nombre,
      });
      setShowModalCliente(false);
      setNuevoCliente({ nombre: "", email: "", telefono: "" });
    } else {
      setAlerta({
        type: "danger",
        message: "❌ " + resultado.message,
      });
    }
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fechaHoy = new Date().toISOString().split("T")[0];

    // Validar que el producto existe en inventario
    const productoEnInventario = inventario.find(
      (p) => p.nombre.toLowerCase() === formData.producto.toLowerCase()
    );

    if (!productoEnInventario) {
      setAlerta({
        type: "danger",
        message: "❌ Producto no encontrado en el inventario.",
      });
      return;
    }

    // Validar cantidad disponible
    const cantidadDisponible = Number(productoEnInventario.cantidad || 0);
    const cantidadVender = Number(formData.cantidad);

    if (cantidadVender > cantidadDisponible) {
      setAlerta({
        type: "danger",
        message: `❌ Stock insuficiente. Disponible: ${cantidadDisponible} unidades.`,
      });
      return;
    }

    const precioUnitario = parseFloat(formData.precio) || 0;
    const montoTotal = precioUnitario * cantidadVender;

    const ventaData = {
      producto: formData.producto,
      cantidad: cantidadVender,
      monto: montoTotal,
      cliente: formData.clienteNombre || "Cliente sin especificar",
      descuento: formData.descuento,
      fecha: fechaHoy,
      mes_cierre: fechaHoy.slice(0, 7) + "-01",
    };

    // ✅ Garantizar que el período esté abierto
    const mesCierre = ventaData.mes_cierre;
    const garantiaRes = await garantizarMesAbierto(mesCierre);
    
    if (!garantiaRes.success) {
      setAlerta({ type: "danger", message: "❌ " + garantiaRes.message });
      return;
    }

    // Si el mes fue abierto automáticamente, mostrar notificación
    if (garantiaRes.autoOpened) {
      setAlerta({ 
        type: "info", 
        message: `ℹ️ ${garantiaRes.message}. Registrando venta...` 
      });
    }

    // Registrar la venta
    const { success, message } = await registrarVenta(ventaData);
    
    if (success) {
      await actualizarInventario(formData.producto, cantidadVender);
      setAlerta({ type: "success", message: "✅ " + message });
      setFormData({
        producto: "",
        cantidad: 1,
        precio: "",
        cliente_id: "",
        clienteNombre: "",
        descuento: 0,
      });
    } else {
      setAlerta({ type: "danger", message: "❌ " + message });
    }
  };

  return (
    <div className="container mt-4">
      <Card className="shadow-lg border-0">
        <Card.Header className="mantente-bg-blue text-white fw-bold">
          Registrar Nueva Venta
        </Card.Header>
        <Card.Body>
          {alerta && (
            <Alert variant={alerta.type} onClose={() => setAlerta(null)} dismissible>
              {alerta.message}
            </Alert>
          )}
          <Form onSubmit={handleSubmit}>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>📦 Producto</Form.Label>
                  <Form.Select
                    name="producto"
                    value={formData.producto}
                    onChange={handleProductoChange}
                    required
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
                  <Form.Label>Cantidad</Form.Label>
                  <Form.Control
                    type="number"
                    name="cantidad"
                    value={formData.cantidad}
                    onChange={handleChange}
                    min="1"
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group>
                  <Form.Label>💵 Precio (Auto)</Form.Label>
                  <Form.Control
                    type="number"
                    name="precio"
                    value={formData.precio}
                    required
                    readOnly
                    className="bg-light"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>👥 Cliente (Opcional)</Form.Label>
                  <Row className="g-2">
                    <Col xs={10}>
                      <Form.Select
                        name="cliente_id"
                        value={formData.cliente_id}
                        onChange={handleClienteChange}
                      >
                        <option value="">-- Selecciona un cliente --</option>
                        {clientes.map((cliente) => (
                          <option key={cliente.id} value={cliente.id}>
                            {cliente.nombre}
                          </option>
                        ))}
                      </Form.Select>
                    </Col>
                    <Col xs={2}>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => setShowModalCliente(true)}
                        title="Crear nuevo cliente"
                      >
                        ➕
                      </Button>
                    </Col>
                  </Row>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Descuento (%)</Form.Label>
                  <Form.Control
                    type="number"
                    name="descuento"
                    value={formData.descuento}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Button type="submit" variant="success" className="mt-3 w-100 fw-semibold">
              💾 Registrar Venta
            </Button>
          </Form>
        </Card.Body>
      </Card>

      {/* Modal para crear cliente */}
      <Modal show={showModalCliente} onHide={() => setShowModalCliente(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Crear Nuevo Cliente</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleCrearCliente}>
            <Form.Group className="mb-3">
              <Form.Label>Nombre *</Form.Label>
              <Form.Control
                type="text"
                value={nuevoCliente.nombre}
                onChange={(e) =>
                  setNuevoCliente({ ...nuevoCliente, nombre: e.target.value })
                }
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Email *</Form.Label>
              <Form.Control
                type="email"
                value={nuevoCliente.email}
                onChange={(e) =>
                  setNuevoCliente({ ...nuevoCliente, email: e.target.value })
                }
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Teléfono</Form.Label>
              <Form.Control
                type="tel"
                value={nuevoCliente.telefono}
                onChange={(e) =>
                  setNuevoCliente({ ...nuevoCliente, telefono: e.target.value })
                }
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
