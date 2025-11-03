import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  Container, Card, Button, Form, Table, Modal, Alert, Row, Col, Badge, ListGroup
} from 'react-bootstrap';

/**
 * 🔧 COMPONENTE AVERÍAS
 * Registra productos dañados y gestiona canjes con proveedores
 */
const Averias = () => {
  const { user, isPremium, inventario, crearAveria, averias } = useApp();

  // Estados
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState(null);
  const [filtroEstado, setFiltroEstado] = useState("todos");

  // Formulario
  const [formData, setFormData] = useState({
    producto: "",
    cantidad: 1,
    razon_dano: "",
    tiene_cambio_proveedor: false,
    referencia_canje: "",
    nombre_proveedor: "",
    notas: "",
  });

  // 📝 MANEJAR CAMBIOS DE FORMULARIO
  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // 🎯 REGISTRAR AVERÍA
  const handleRegistrarAveria = async () => {
    // Validar
    if (!formData.producto || !formData.cantidad || !formData.razon_dano) {
      setMensaje({ type: "warning", text: "Por favor completa los campos obligatorios" });
      return;
    }

    setLoading(true);
    try {
      const resultado = await crearAveria({
        producto: formData.producto,
        cantidad: parseInt(formData.cantidad),
        razon_dano: formData.razon_dano,
        tiene_cambio_proveedor: formData.tiene_cambio_proveedor,
        referencia_canje: formData.referencia_canje || null,
        nombre_proveedor: formData.nombre_proveedor || null,
        notas: formData.notas,
      });

      if (resultado.success) {
        setMensaje({
          type: "success",
          text: `✅ Avería registrada: ${formData.producto}`,
        });

        // Reset formulario
        setFormData({
          producto: "",
          cantidad: 1,
          razon_dano: "",
          tiene_cambio_proveedor: false,
          referencia_canje: "",
          nombre_proveedor: "",
          notas: "",
        });

        setTimeout(() => setShowModal(false), 1500);
      } else {
        setMensaje({ type: "danger", text: `❌ ${resultado.message}` });
      }
    } catch (error) {
      setMensaje({ type: "danger", text: `Error: ${error.message}` });
    } finally {
      setLoading(false);
    }
  };

  // 📊 ESTADÍSTICAS
  const stats = {
    total: averias.length,
    canjeadas: averias.filter(a => a.estado === "canjeada").length,
    desechadas: averias.filter(a => a.estado === "desechada").length,
    totalPerdida: averias.reduce((acc, a) => acc + (a.cantidad * (a.precio_unitario || 0)), 0),
  };

  // 🔍 FILTRAR AVERÍAS
  const aeriasFiltradasPorEstado = averias.filter(a => {
    if (filtroEstado === "todos") return true;
    return a.estado === filtroEstado;
  });

  return (
    <Container className="py-4">
      {/* HEADER */}
      <Row className="mb-4">
        <Col>
          <h1 className="mb-1">🔧 Gestión de Averías</h1>
          <p className="text-muted">Registra productos dañados y gestiona canjes con proveedores</p>
        </Col>
        <Col md="auto">
          <Button
            variant="primary"
            onClick={() => setShowModal(true)}
            disabled={!isPremium}
          >
            ➕ Nueva Avería
          </Button>
        </Col>
      </Row>

      {!isPremium && (
        <Alert variant="info" className="mb-4">
          <strong>💎 Premium Feature:</strong> La gestión de averías está disponible para usuarios Premium. Consulta los beneficios de Premium.
        </Alert>
      )}

      {/* MENSAJE DE ESTADO */}
      {mensaje && (
        <Alert
          variant={mensaje.type}
          dismissible
          onClose={() => setMensaje(null)}
          className="mb-4"
        >
          {mensaje.text}
        </Alert>
      )}

      {/* TARJETAS DE ESTADÍSTICAS */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="text-center border-primary">
            <Card.Body>
              <h3 className="text-primary">{stats.total}</h3>
              <p className="text-muted mb-0">Total de Averías</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center border-success">
            <Card.Body>
              <h3 className="text-success">{stats.canjeadas}</h3>
              <p className="text-muted mb-0">Canjeadas</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center border-warning">
            <Card.Body>
              <h3 className="text-warning">{stats.desechadas}</h3>
              <p className="text-muted mb-0">Desechadas</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center border-danger">
            <Card.Body>
              <h3 className="text-danger">${stats.totalPerdida.toFixed(2)}</h3>
              <p className="text-muted mb-0">Pérdida Total</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* FILTROS */}
      <Card className="mb-4">
        <Card.Body>
          <Form.Group>
            <Form.Label><strong>Filtrar por Estado:</strong></Form.Label>
            <div className="d-flex gap-2">
              <Form.Check
                type="radio"
                label="Todas"
                name="filtro"
                value="todos"
                checked={filtroEstado === "todos"}
                onChange={(e) => setFiltroEstado(e.target.value)}
              />
              <Form.Check
                type="radio"
                label="Canjeadas"
                name="filtro"
                value="canjeada"
                checked={filtroEstado === "canjeada"}
                onChange={(e) => setFiltroEstado(e.target.value)}
              />
              <Form.Check
                type="radio"
                label="Desechadas"
                name="filtro"
                value="desechada"
                checked={filtroEstado === "desechada"}
                onChange={(e) => setFiltroEstado(e.target.value)}
              />
            </div>
          </Form.Group>
        </Card.Body>
      </Card>

      {/* TABLA DE AVERÍAS */}
      {aeriasFiltradasPorEstado.length > 0 ? (
        <Card>
          <Table hover responsive>
            <thead className="table-light">
              <tr>
                <th>Fecha</th>
                <th>Producto</th>
                <th>Cantidad</th>
                <th>Razón del Daño</th>
                <th>Estado</th>
                <th>Proveedor</th>
                <th>Pérdida</th>
              </tr>
            </thead>
            <tbody>
              {aeriasFiltradasPorEstado.map((averia) => (
                <tr key={averia.id}>
                  <td>
                    {new Date(averia.fecha).toLocaleDateString("es-MX")}
                  </td>
                  <td><strong>{averia.producto}</strong></td>
                  <td>{averia.cantidad}</td>
                  <td>{averia.razon_dano}</td>
                  <td>
                    <Badge
                      bg={averia.estado === "canjeada" ? "success" : "warning"}
                    >
                      {averia.estado === "canjeada" ? "✅ Canjeada" : "❌ Desechada"}
                    </Badge>
                  </td>
                  <td>
                    {averia.nombre_proveedor ? (
                      <small>{averia.nombre_proveedor}</small>
                    ) : (
                      <span className="text-muted">—</span>
                    )}
                  </td>
                  <td>
                    <strong>${(averia.cantidad * (averia.precio_unitario || 0)).toFixed(2)}</strong>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>
      ) : (
        <Alert variant="info" className="text-center">
          📭 No hay averías registradas aún
        </Alert>
      )}

      {/* MODAL NUEVA AVERÍA */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>🔧 Registrar Nueva Avería</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {/* PRODUCTO */}
          <Form.Group className="mb-3">
            <Form.Label><strong>🏪 Producto Dañado</strong></Form.Label>
            <Form.Select
              name="producto"
              value={formData.producto}
              onChange={handleFormChange}
              isInvalid={!formData.producto && formData.producto === ""}
            >
              <option value="">-- Seleccionar Producto --</option>
              {inventario?.map((prod) => (
                <option key={prod.id} value={prod.nombre}>
                  {prod.nombre} - ${prod.precio}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          {/* CANTIDAD */}
          <Form.Group className="mb-3">
            <Form.Label><strong>📦 Cantidad Dañada</strong></Form.Label>
            <Form.Control
              type="number"
              name="cantidad"
              min="1"
              value={formData.cantidad}
              onChange={handleFormChange}
            />
          </Form.Group>

          {/* RAZÓN DEL DAÑO */}
          <Form.Group className="mb-3">
            <Form.Label><strong>💔 Razón del Daño</strong></Form.Label>
            <Form.Select
              name="razon_dano"
              value={formData.razon_dano}
              onChange={handleFormChange}
            >
              <option value="">-- Seleccionar Razón --</option>
              <option value="Pantalla rota">Pantalla rota</option>
              <option value="Componente defectuoso">Componente defectuoso</option>
              <option value="Daño de transporte">Daño de transporte</option>
              <option value="Defecto de fabricación">Defecto de fabricación</option>
              <option value="Otra razón">Otra razón</option>
            </Form.Select>
          </Form.Group>

          {/* CANJE CON PROVEEDOR */}
          <Form.Group className="mb-3">
            <Form.Check
              type="checkbox"
              name="tiene_cambio_proveedor"
              label="¿Proveedor acepta canje/cambio?"
              checked={formData.tiene_cambio_proveedor}
              onChange={handleFormChange}
            />
          </Form.Group>

          {formData.tiene_cambio_proveedor && (
            <>
              <Form.Group className="mb-3">
                <Form.Label><strong>🏭 Nombre del Proveedor</strong></Form.Label>
                <Form.Control
                  type="text"
                  name="nombre_proveedor"
                  placeholder="Ej: Tech Supplier Inc"
                  value={formData.nombre_proveedor}
                  onChange={handleFormChange}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label><strong>📋 Referencia de Canje</strong></Form.Label>
                <Form.Control
                  type="text"
                  name="referencia_canje"
                  placeholder="Ej: REF-2025-001"
                  value={formData.referencia_canje}
                  onChange={handleFormChange}
                />
              </Form.Group>
            </>
          )}

          {/* NOTAS */}
          <Form.Group className="mb-3">
            <Form.Label><strong>📝 Notas Adicionales</strong></Form.Label>
            <Form.Control
              as="textarea"
              name="notas"
              rows={2}
              placeholder="Detalles adicionales sobre el daño..."
              value={formData.notas}
              onChange={handleFormChange}
            />
          </Form.Group>

          {/* RESUMEN */}
          <Card className="bg-light border-info mb-3">
            <Card.Body>
              <strong>💡 Resumen:</strong>
              <ListGroup variant="flush" className="mt-2">
                <ListGroup.Item className="bg-light">
                  Producto: <strong>{formData.producto || "—"}</strong>
                </ListGroup.Item>
                <ListGroup.Item className="bg-light">
                  Cantidad: <strong>{formData.cantidad}</strong>
                </ListGroup.Item>
                <ListGroup.Item className="bg-light">
                  Estado: {formData.tiene_cambio_proveedor ? (
                    <Badge bg="success">✅ Canjeada con {formData.nombre_proveedor}</Badge>
                  ) : (
                    <Badge bg="warning">❌ Será desechada</Badge>
                  )}
                </ListGroup.Item>
              </ListGroup>
            </Card.Body>
          </Card>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)} disabled={loading}>
            ❌ Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={handleRegistrarAveria}
            disabled={loading || !formData.producto}
          >
            {loading ? "⏳ Guardando..." : "✅ Registrar Avería"}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Averias;