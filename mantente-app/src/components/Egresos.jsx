// src/components/Egresos.jsx
import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { useTranslation } from 'react-i18next';
import { Card, Form, Button, Row, Col, Alert, Table, Badge } from "react-bootstrap";

const Egresos = () => {
  const { user, egresos, createEgreso, deleteEgreso, garantizarMesAbierto, fetchEgreso, historialMeses } = useApp();
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    descripcion: "",
    monto: "",
    categoria: "general",
    fecha: new Date().toISOString().split("T")[0],
  });
  const [alerta, setAlerta] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) {
      console.log("🔍 DEBUG Egresos: No user ID, skipping data load");
      setIsLoading(false);
      return;
    }

    const loadData = async () => {
      console.log("🔄 DEBUG Egresos: Loading egresos data for user:", user.id);
      setIsLoading(true);
      try {
        await fetchEgreso();
        console.log("✅ DEBUG Egresos: Data loaded successfully");
      } catch (error) {
        console.error("❌ DEBUG Egresos: Error loading data:", error);
        setAlerta({ type: "danger", message: "❌ Error al cargar los egresos" });
      } finally {
        setIsLoading(false);
      }
    };

    loadData();

    const autoRefreshInterval = setInterval(() => {
      console.log("🔄 DEBUG Egresos: Auto-refreshing egresos data");
      fetchEgreso().catch(error => {
        console.error("❌ DEBUG Egresos: Error in auto-refresh:", error);
      });
    }, 15000);

    return () => clearInterval(autoRefreshInterval);
  }, [user?.id, fetchEgreso]);

  const categorias = [
    "Salarios",
    "Servicios",
    "Transporte",
    "Mantenimiento",
    "Materiales",
    "Otros",
  ];

  const getCategoriaIcon = (categoria) => {
    const icons = {
      "Salarios": "👥",
      "Servicios": "🔧",
      "Transporte": "🚗",
      "Mantenimiento": "🔨",
      "Materiales": "📦",
      "Otros": "📝"
    };
    return icons[categoria] || "📝";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      console.log("🔄 DEBUG Egresos: Starting egreso submission");
      if (!formData.descripcion.trim() || !formData.monto) {
        console.log("⚠️ DEBUG Egresos: Missing required fields");
        setAlerta({ type: "danger", message: "⚠️ Todos los campos son requeridos" });
        return;
      }

      const monto = parseFloat(formData.monto);
      if (isNaN(monto) || monto <= 0) {
        console.log("⚠️ DEBUG Egresos: Invalid amount:", formData.monto);
        setAlerta({ type: "danger", message: "⚠️ El monto debe ser un número positivo" });
        return;
      }

      const currentMonth = formData.fecha.slice(0, 7) + "-01";
      const latestOpenMonth = historialMeses.filter(h => !h.is_closed).sort((a, b) => b.mes.localeCompare(a.mes))[0]?.mes;
      const mes_cierre = latestOpenMonth || currentMonth;
      const egresoData = {
      descripcion: formData.descripcion.trim(),
      monto: monto,
      categoria: formData.categoria,
      fecha: formData.fecha,
      mes_cierre,
      };

      console.log("📝 DEBUG Egresos: Prepared egreso data:", egresoData);

      // ✅ Garantizar que el período esté abierto
      console.log("📅 DEBUG Egresos: Ensuring month is open");
      const latestOpenMonthForClosure = historialMeses.filter(h => !h.is_closed).sort((a, b) => b.mes.localeCompare(a.mes))[0]?.mes;
      const currentMonthForClosure = new Date().toISOString().slice(0, 7) + "-01";
      const mesCierre = latestOpenMonthForClosure || currentMonthForClosure;
      console.log("📅 DEBUG Egresos: mesCierre determination - latestOpenMonthForClosure:", latestOpenMonthForClosure, "currentMonthForClosure:", currentMonthForClosure, "mesCierre:", mesCierre);
      const garantiaRes = await garantizarMesAbierto();

      if (!garantiaRes.success) {
        console.log("❌ DEBUG Egresos: Failed to open month:", garantiaRes.message);
        setAlerta({ type: "danger", message: "❌ " + garantiaRes.message });
        return;
      }

      // Si el mes fue abierto automáticamente, mostrar notificación
      if (garantiaRes.autoOpened) {
        console.log("ℹ️ DEBUG Egresos: Month was auto-opened");
        setAlerta({
          type: "info",
          message: `ℹ️ ${garantiaRes.message}. Registrando egreso...`
        });
      }

      console.log("💾 DEBUG Egresos: Calling createEgreso");
      const result = await createEgreso(egresoData);
      console.log("📊 DEBUG Egresos: createEgreso result:", result);

      if (result.success) {
        console.log("✅ DEBUG Egresos: Egreso created successfully");
        setAlerta({ type: "success", message: "✅ Egreso registrado exitosamente" });
        setFormData({
          descripcion: "",
          monto: "",
          categoria: "general",
          fecha: new Date().toISOString().split("T")[0],
        });

        // Refresh egresos list
        console.log("🔄 DEBUG Egresos: Refreshing egresos list");
        await fetchEgreso();
        console.log("✅ DEBUG Egresos: Egresos list refreshed");
      } else {
        console.log("❌ DEBUG Egresos: Failed to create egreso:", result.error || result.message);
        setAlerta({ type: "danger", message: "❌ Error al registrar egreso: " + (result.error || result.message) });
      }
    } catch (error) {
      console.error("❌ DEBUG Egresos: Unexpected error:", error);
      setAlerta({ type: "danger", message: "❌ Error inesperado al registrar egreso" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEliminar = async (id) => {
    console.log("🗑️ DEBUG Egresos: Attempting to delete egreso with ID:", id);
    if (!window.confirm("¿Estás seguro de que quieres eliminar este egreso? Esta acción no se puede deshacer.")) {
      console.log("❌ DEBUG Egresos: User cancelled deletion");
      return;
    }

    try {
      console.log("💾 DEBUG Egresos: Calling deleteEgreso");
      const result = await deleteEgreso(id);
      console.log("📊 DEBUG Egresos: deleteEgreso result:", result);

      if (result.success) {
        console.log("✅ DEBUG Egresos: Egreso deleted successfully");
        setAlerta({ type: "success", message: "✅ Egreso eliminado exitosamente" });
        // Refresh egresos list
        console.log("🔄 DEBUG Egresos: Refreshing egresos list after deletion");
        await fetchEgreso();
        console.log("✅ DEBUG Egresos: Egresos list refreshed after deletion");
      } else {
        console.log("❌ DEBUG Egresos: Failed to delete egreso:", result.error || result.message);
        setAlerta({ type: "danger", message: "❌ Error al eliminar egreso: " + (result.error || result.message) });
      }
    } catch (error) {
      console.error("❌ DEBUG Egresos: Unexpected error during deletion:", error);
      setAlerta({ type: "danger", message: "❌ Error inesperado al eliminar egreso" });
    }
  };

  const totalEgresos = (egresos || []).reduce((acc, e) => acc + Number(e.monto || 0), 0);
  const mesActual = new Date().toISOString().slice(0, 7);
  console.log("🔍 DEBUG Egresos: mesActual:", mesActual);
  console.log("🔍 DEBUG Egresos: todos los egresos:", egresos);
  const egresosDelMes = (egresos || []).filter((e) => {
    const matches = e.mes_cierre && e.mes_cierre.startsWith(mesActual);
    console.log("🔍 DEBUG Egresos: egreso", e.id, "mes_cierre:", e.mes_cierre, "matches:", matches);
    return matches;
  });
  console.log("🔍 DEBUG Egresos: egresosDelMes filtrados:", egresosDelMes);
  const totalEgresosMes = egresosDelMes.reduce(
    (acc, e) => acc + Number(e.monto || 0),
    0
  );

  if (isLoading) {
    return (
      <div className="container mt-4">
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando egresos...</span>
          </div>
          <p className="mt-3 text-muted">Cargando egresos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <Card className="shadow-lg border-0 egresos-card">
        <Card.Header className="egresos-header">
          <div className="d-flex align-items-center">
            <div className="egresos-icon">
              <span className="elegant-icon">💸</span>
            </div>
            <div>
              <h5 className="mb-0 fw-bold">{t('expenses')}</h5>
              <small className="text-muted">{t('registerExpense')}</small>
            </div>
          </div>
        </Card.Header>
        <Card.Body className="egresos-body">
          {alerta && (
            <Alert
              variant={alerta.type}
              onClose={() => setAlerta(null)}
              dismissible
              className="egresos-alert"
            >
              {alerta.message}
            </Alert>
          )}

          <Form onSubmit={handleSubmit}>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="egresos-label">
                    <i className="bi bi-pencil-square me-2"></i>Descripción
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="descripcion"
                    value={formData.descripcion}
                    onChange={handleChange}
                    placeholder="Ej: Pago de servicios, compra de materiales..."
                    required
                    className="egresos-input"
                  />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group>
                  <Form.Label className="egresos-label">
                    <i className="bi bi-cash-coin me-2"></i>Monto
                  </Form.Label>
                  <Form.Control
                    type="number"
                    name="monto"
                    value={formData.monto}
                    onChange={handleChange}
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    required
                    className="egresos-input"
                  />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group>
                  <Form.Label className="egresos-label">
                    <i className="bi bi-calendar-date me-2"></i>Fecha
                  </Form.Label>
                  <Form.Control
                    type="date"
                    name="fecha"
                    value={formData.fecha}
                    onChange={handleChange}
                    required
                    className="egresos-input"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-4">
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="egresos-label">
                    <i className="bi bi-tags me-2"></i>Categoría
                  </Form.Label>
                  <Form.Select
                    name="categoria"
                    value={formData.categoria}
                    onChange={handleChange}
                    className="egresos-select"
                  >
                    {categorias.map((cat) => (
                      <option key={cat} value={cat}>
                        {getCategoriaIcon(cat)} {cat}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Button
              variant="primary"
              type="submit"
              className="egresos-submit-btn w-100"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                  Registrando...
                </>
              ) : (
                <>
                  <i className="bi bi-plus-circle me-2"></i>
                  Registrar Egreso
                </>
              )}
            </Button>
          </Form>
        </Card.Body>
      </Card>

      {/* Resumen de egresos */}
      <Row className="mt-4">
        <Col md={6}>
          <Card className="egresos-summary-card monthly-card">
            <Card.Body className="text-center">
              <div className="summary-icon monthly-icon">
                <span className="elegant-icon">📅</span>
              </div>
              <h6 className="summary-title">Egresos de este mes</h6>
              <h3 className="summary-amount monthly-amount">${totalEgresosMes.toFixed(2)}</h3>
              <Badge bg="secondary" className="summary-badge">
                {egresosDelMes.length} registros
              </Badge>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card className="egresos-summary-card total-card">
            <Card.Body className="text-center">
              <div className="summary-icon total-icon">
                <span className="elegant-icon">📊</span>
              </div>
              <h6 className="summary-title">Total de egresos</h6>
              <h3 className="summary-amount total-amount">${totalEgresos.toFixed(2)}</h3>
              <Badge bg="info" className="summary-badge">
                {(egresos || []).length} registros totales
              </Badge>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Listado de egresos */}
      <Card className="mt-4 shadow-lg border-0 egresos-list-card">
        <Card.Header className="egresos-list-header">
          <div className="d-flex align-items-center">
            <div className="list-icon">
              <span className="elegant-icon">📋</span>
            </div>
            <div>
              <h5 className="mb-0 fw-bold">Listado de Egresos</h5>
              <small className="text-muted">Egresos registrados en el mes actual</small>
            </div>
          </div>
        </Card.Header>
        <Card.Body className="egresos-list-body">
          {egresosDelMes.length > 0 ? (
            <div className="egresos-table-container">
              <Table responsive hover className="egresos-table">
                <thead>
                  <tr>
                    <th><i className="bi bi-pencil-square me-2"></i>Descripción</th>
                    <th><i className="bi bi-tags me-2"></i>Categoría</th>
                    <th><i className="bi bi-cash-coin me-2"></i>Monto</th>
                    <th><i className="bi bi-calendar-date me-2"></i>Fecha</th>
                    <th><i className="bi bi-gear me-2"></i>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {egresosDelMes.map((egreso, index) => (
                    <tr key={egreso.id} className="egresos-row" style={{ animationDelay: `${index * 0.1}s` }}>
                      <td className="egresos-description">
                        <div className="d-flex align-items-center">
                          <span className="description-text">{egreso.descripcion}</span>
                        </div>
                      </td>
                      <td>
                        <Badge bg="light" text="dark" className="categoria-badge">
                          {getCategoriaIcon(egreso.categoria)} {egreso.categoria}
                        </Badge>
                      </td>
                      <td className="egresos-amount">
                        <span className="amount-text">${Number(egreso.monto).toFixed(2)}</span>
                      </td>
                      <td className="egresos-date">
                        {new Date(egreso.fecha).toLocaleDateString('es-ES')}
                      </td>
                      <td>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => handleEliminar(egreso.id)}
                          className="delete-btn"
                          title="Eliminar egreso"
                        >
                          <i className="bi bi-trash"></i>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          ) : (
            <div className="egresos-empty-state">
              <div className="empty-icon">
                💸
              </div>
              <h6>No hay egresos registrados</h6>
              <p className="text-muted">Los egresos que registres en este mes aparecerán aquí</p>
            </div>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default Egresos;