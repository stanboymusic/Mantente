// src/components/Ventas.jsx
import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { Card, Form, Button, Row, Col, Alert } from "react-bootstrap";

const Ventas = () => {
  const { registrarVenta, actualizarInventario, inventario } = useApp();
  const [formData, setFormData] = useState({
    producto: "",
    cantidad: 1,
    precio: "",
    cliente: "",
    descuento: 0,
  });
  const [alerta, setAlerta] = useState(null);

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

    const ventaData = {
      producto: formData.producto,
      cantidad: cantidadVender,
      monto: formData.precio, // Convertir 'precio' a 'monto'
      cliente: formData.cliente,
      descuento: formData.descuento,
      fecha: fechaHoy,
      mes_cierre: fechaHoy.slice(0, 7) + "-01", // Formato: YYYY-MM-01
    };

    const { success, message } = await registrarVenta(ventaData);
    
    if (success) {
      // Descontar del inventario
      await actualizarInventario(formData.producto, cantidadVender);
      setAlerta({ type: "success", message: "✅ " + message });
      setFormData({ producto: "", cantidad: 1, precio: "", cliente: "", descuento: 0 });
    } else {
      setAlerta({ type: "danger", message: "❌ " + message });
    }
  };

  return (
    <div className="container mt-4">
      <Card className="shadow-lg border-0">
        <Card.Header className="bg-primary text-white fw-bold">
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
                  <Form.Label>Cliente</Form.Label>
                  <Form.Control
                    type="text"
                    name="cliente"
                    value={formData.cliente}
                    onChange={handleChange}
                  />
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
    </div>
  );
};

export default Ventas;
