// src/components/Egresos.jsx
import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { Card, Form, Button, Row, Col, Alert, Table } from "react-bootstrap";

const Egresos = () => {
  const { user, egresos, crearEgreso, eliminarEgreso, garantizarMesAbierto, obtenerEgresos } = useApp();
  const [formData, setFormData] = useState({
    descripcion: "",
    monto: "",
    categoria: "general",
    fecha: new Date().toISOString().split("T")[0],
  });
  const [alerta, setAlerta] = useState(null);

  useEffect(() => {
    if (!user?.id) return;

    obtenerEgresos();
    
    const autoRefreshInterval = setInterval(() => {
      obtenerEgresos();
    }, 15000);

    return () => clearInterval(autoRefreshInterval);
  }, [user?.id]);

  const categorias = [
    "Salarios",
    "Servicios",
    "Transporte",
    "Mantenimiento",
    "Materiales",
    "Otros",
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.descripcion || !formData.monto) {
      setAlerta({ type: "danger", message: "❌ Todos los campos son requeridos" });
      return;
    }

    const egresoData = {
      descripcion: formData.descripcion,
      monto: parseFloat(formData.monto),
      categoria: formData.categoria,
      fecha: formData.fecha,
      mes_cierre: formData.fecha.slice(0, 7) + "-01",
    };

    // ✅ Garantizar que el período esté abierto
    const mesCierre = egresoData.mes_cierre;
    const garantiaRes = await garantizarMesAbierto(mesCierre);
    
    if (!garantiaRes.success) {
      setAlerta({ type: "danger", message: "❌ " + garantiaRes.message });
      return;
    }

    // Si el mes fue abierto automáticamente, mostrar notificación
    if (garantiaRes.autoOpened) {
      setAlerta({ 
        type: "info", 
        message: `ℹ️ ${garantiaRes.message}. Registrando egreso...` 
      });
    }

    const { success, message } = await crearEgreso(egresoData);

    if (success) {
      setAlerta({ type: "success", message: "✅ " + message });
      setFormData({
        descripcion: "",
        monto: "",
        categoria: "general",
        fecha: new Date().toISOString().split("T")[0],
      });
    } else {
      setAlerta({ type: "danger", message: "❌ " + message });
    }
  };

  const handleEliminar = async (id) => {
    if (!window.confirm("¿Estás seguro de que quieres eliminar este egreso?")) {
      return;
    }
    const { success, message } = await eliminarEgreso(id);
    if (success) {
      setAlerta({ type: "success", message: "✅ Egreso eliminado" });
    } else {
      setAlerta({ type: "danger", message: "❌ " + message });
    }
  };

  const totalEgresos = (egresos || []).reduce((acc, e) => acc + Number(e.monto || 0), 0);
  const mesActual = new Date().toISOString().slice(0, 7);
  const egresosDelMes = (egresos || []).filter((e) =>
    e.mes_cierre && e.mes_cierre.startsWith(mesActual)
  );
  const totalEgresosMes = egresosDelMes.reduce(
    (acc, e) => acc + Number(e.monto || 0),
    0
  );

  return (
    <div className="container mt-4">
      <Card className="shadow-lg border-0">
        <Card.Header className="bg-danger text-white fw-bold">
          💸 Registrar Egreso
        </Card.Header>
        <Card.Body>
          {alerta && (
            <Alert
              variant={alerta.type}
              onClose={() => setAlerta(null)}
              dismissible
            >
              {alerta.message}
            </Alert>
          )}

          <Form onSubmit={handleSubmit}>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>📝 Descripción</Form.Label>
                  <Form.Control
                    type="text"
                    name="descripcion"
                    value={formData.descripcion}
                    onChange={handleChange}
                    placeholder="Ej: Pago de servicios"
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group>
                  <Form.Label>💵 Monto</Form.Label>
                  <Form.Control
                    type="number"
                    name="monto"
                    value={formData.monto}
                    onChange={handleChange}
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group>
                  <Form.Label>📅 Fecha</Form.Label>
                  <Form.Control
                    type="date"
                    name="fecha"
                    value={formData.fecha}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>🏷️ Categoría</Form.Label>
                  <Form.Select
                    name="categoria"
                    value={formData.categoria}
                    onChange={handleChange}
                  >
                    {categorias.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Button variant="danger" type="submit" className="w-100">
              ➕ Registrar Egreso
            </Button>
          </Form>
        </Card.Body>
      </Card>

      {/* Resumen de egresos */}
      <Row className="mt-4">
        <Col md={6}>
          <Card className="bg-light">
            <Card.Body>
              <h6 className="text-danger">💸 Egresos de este mes</h6>
              <h3 className="text-danger fw-bold">${totalEgresosMes.toFixed(2)}</h3>
              <small className="text-muted">{egresosDelMes.length} registros</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card className="bg-light">
            <Card.Body>
              <h6 className="text-dark">📊 Total de egresos</h6>
              <h3 className="fw-bold">${totalEgresos.toFixed(2)}</h3>
              <small className="text-muted">{(egresos || []).length} registros totales</small>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Listado de egresos */}
      <Card className="mt-4 shadow-lg border-0">
        <Card.Header className="bg-secondary text-white fw-bold">
          📋 Listado de Egresos
        </Card.Header>
        <Card.Body>
          {egresosDelMes.length > 0 ? (
            <Table responsive striped hover>
              <thead className="bg-light">
                <tr>
                  <th>Descripción</th>
                  <th>Categoría</th>
                  <th>Monto</th>
                  <th>Fecha</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {egresosDelMes.map((egreso) => (
                  <tr key={egreso.id}>
                    <td>{egreso.descripcion}</td>
                    <td>
                      <span className="badge bg-info">{egreso.categoria}</span>
                    </td>
                    <td className="text-danger fw-bold">
                      ${Number(egreso.monto).toFixed(2)}
                    </td>
                    <td>{egreso.fecha}</td>
                    <td>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleEliminar(egreso.id)}
                      >
                        🗑️
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <div className="text-center text-muted py-4">
              <p>📭 No hay egresos registrados para este mes</p>
            </div>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default Egresos;