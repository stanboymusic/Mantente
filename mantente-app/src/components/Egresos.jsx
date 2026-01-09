// src/components/Egresos.jsx
import React, { useState, useEffect, useRef } from "react";
import { useApp } from "../context/AppContext";
import { useTranslation } from 'react-i18next';
import { Card, Form, Button, Row, Col, Alert, Table, Badge } from "react-bootstrap";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const Egresos = () => {
  const { user, egresos, createEgreso, registrarEgreso, deleteEgreso, garantizarMesAbierto, fetchEgreso, historialMeses, perfilEmpresa } = useApp();
  const { t } = useTranslation();
  const tableRef = useRef(null);
  
  const [formData, setFormData] = useState({
    descripcion: "",
    monto: "",
    categoria: "Salarios",
    fecha: new Date().toISOString().split("T")[0],
  });

  const [selectedMonth, setSelectedMonth] = useState("");
  const [alerta, setAlerta] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Determinar el mes actual abierto
  useEffect(() => {
    const activeMonth = historialMeses.find(h => !h.is_closed)?.mes;
    if (activeMonth) {
      setSelectedMonth(activeMonth);
    } else {
      setSelectedMonth(new Date().toISOString().slice(0, 7) + "-01");
    }
  }, [historialMeses]);

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

      // 1️⃣ Primero garantizar que el período esté abierto
      // Usamos el mes de la fecha seleccionada para intentar abrir ese período
      const targetMonth = formData.fecha.slice(0, 7) + "-01";
      console.log("📅 DEBUG Egresos: Ensuring month is open for:", targetMonth);
      
      const garantiaRes = await garantizarMesAbierto(targetMonth);

      if (!garantiaRes.success) {
        console.log("❌ DEBUG Egresos: Failed to open month:", garantiaRes.message);
        setAlerta({ type: "danger", message: "❌ " + garantiaRes.message });
        return;
      }

      // Usar el mes real que está abierto (devuelto por el servidor/contexto)
      const mes_cierre = garantiaRes.data.mes;
      console.log("📅 DEBUG Egresos: Using confirmed mes_cierre:", mes_cierre);

      const egresoData = {
        descripcion: formData.descripcion.trim(),
        monto: monto,
        categoria: formData.categoria,
        fecha: formData.fecha,
        mes_cierre,
      };

      // Si el mes fue abierto automáticamente, mostrar notificación
      if (garantiaRes.autoOpened) {
        console.log("ℹ️ DEBUG Egresos: Month was auto-opened");
        setAlerta({
          type: "info",
          message: `ℹ️ ${garantiaRes.message}. Registrando egreso...`
        });
      }

      console.log("💾 DEBUG Egresos: Calling registrarEgreso with:", egresoData);
      const result = await registrarEgreso(egresoData);
      console.log("📊 DEBUG Egresos: registrarEgreso result:", result);

      if (result.success) {
        console.log("✅ DEBUG Egresos: Egreso created successfully");
        setAlerta({ type: "success", message: "✅ Egreso registrado exitosamente" });
        
        // Si el egreso se registró en un mes diferente al seleccionado actualmente, cambiamos la vista
        if (selectedMonth !== mes_cierre) {
          console.log(`🔄 DEBUG Egresos: Switching selectedMonth from ${selectedMonth} to ${mes_cierre}`);
          setSelectedMonth(mes_cierre);
        }

        setFormData({
          descripcion: "",
          monto: "",
          categoria: "Otros",
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

  const exportToPDF = async () => {
    if (egresosFiltrados.length === 0) {
      setAlerta({ type: "warning", message: "⚠️ No hay egresos para exportar" });
      return;
    }

    try {
      setAlerta({ type: "info", message: "📄 Generando PDF..." });
      const element = document.getElementById("egresos-table-print");
      const originalDisplay = element.style.display;
      element.style.display = "block";

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
      });

      element.style.display = originalDisplay;

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = 210;
      const imgHeight = (canvas.height * pageWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, pageWidth, imgHeight);
      pdf.save(`Egresos_${selectedMonth}.pdf`);
      setAlerta({ type: "success", message: "✅ PDF descargado correctamente" });
    } catch (error) {
      console.error("Error al generar PDF:", error);
      setAlerta({ type: "danger", message: "❌ Error al generar el PDF" });
    }
  };

  const totalEgresosTotal = (egresos || []).reduce((acc, e) => acc + Number(e.monto || 0), 0);
  
  const egresosFiltrados = (egresos || []).filter((e) => {
    if (!selectedMonth) return false;
    
    // Comparación robusta: normalizar ambos a YYYY-MM
    const eMes = e.mes_cierre ? e.mes_cierre.slice(0, 7) : "";
    const sMes = selectedMonth.slice(0, 7);
    return eMes === sMes;
  });

  const totalEgresosFiltrados = egresosFiltrados.reduce(
    (acc, e) => acc + Number(e.monto || 0),
    0
  );

  const egresosDelMesActual = (egresos || []).filter((e) => {
    const currentMonthStr = new Date().toISOString().slice(0, 7);
    return e.mes_cierre && e.mes_cierre.startsWith(currentMonthStr);
  });

  const totalEgresosMesActual = egresosDelMesActual.reduce(
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
        <Col md={12} className="mb-4">
          <Card className="shadow-sm border-0">
            <Card.Body className="d-flex justify-content-between align-items-center">
              <div className="d-flex align-items-center gap-3">
                <Form.Group controlId="monthSelector" className="mb-0">
                  <Form.Label className="me-2 fw-bold mb-0">Ver Egresos de:</Form.Label>
                  <Form.Select 
                    value={selectedMonth} 
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    style={{ width: 'auto', display: 'inline-block' }}
                  >
                    <option value="">-- Seleccionar Corte --</option>
                    {historialMeses.map((h) => (
                      <option key={h.id} value={h.mes}>
                        {new Date(h.mes).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })} {h.is_closed ? '(Cerrado)' : '(Abierto)'}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </div>
              <Button variant="outline-danger" onClick={exportToPDF}>
                <i className="bi bi-file-earmark-pdf me-2"></i>Descargar PDF
              </Button>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card className="egresos-summary-card monthly-card">
            <Card.Body className="text-center">
              <div className="summary-icon monthly-icon">
                <span className="elegant-icon">📅</span>
              </div>
              <h6 className="summary-title">Egresos del período seleccionado</h6>
              <h3 className="summary-amount monthly-amount">${totalEgresosFiltrados.toFixed(2)}</h3>
              <Badge bg="secondary" className="summary-badge">
                {egresosFiltrados.length} registros
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
              <h6 className="summary-title">Total histórico de egresos</h6>
              <h3 className="summary-amount total-amount">${totalEgresosTotal.toFixed(2)}</h3>
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
              <h5 className="mb-0 fw-bold">Listado de Egresos Individuales</h5>
              <small className="text-muted">Desglose de gastos del período seleccionado</small>
            </div>
          </div>
        </Card.Header>
        <Card.Body className="egresos-list-body">
          {egresosFiltrados.length > 0 ? (
            <div className="egresos-table-container">
              <Table responsive hover>
                <thead>
                  <tr>
                    <th>Descripción</th>
                    <th>Categoría</th>
                    <th>Monto</th>
                    <th>Fecha</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {egresosFiltrados.map((egreso, index) => (
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
              <h6>No hay egresos registrados para este período</h6>
              <p className="text-muted">Los egresos correspondientes al período seleccionado aparecerán aquí</p>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Componente oculto para generar PDF */}
      <div id="egresos-table-print" style={{ display: 'none', padding: '20px', color: '#000', backgroundColor: '#fff' }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          {perfilEmpresa?.logo_url && <img src={perfilEmpresa.logo_url} alt="Logo" style={{ height: '60px', marginBottom: '10px' }} />}
          <h2 style={{ margin: '0' }}>{perfilEmpresa?.nombre || 'Mantente App'}</h2>
          <p style={{ margin: '5px 0' }}>{perfilEmpresa?.nit || ''}</p>
          <h3 style={{ marginTop: '20px', borderBottom: '2px solid #333', paddingBottom: '10px' }}>REPORTES DE EGRESOS</h3>
          <p><strong>Período:</strong> {selectedMonth ? new Date(selectedMonth).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }) : 'N/A'}</p>
        </div>
        <Table bordered>
          <thead>
            <tr style={{ backgroundColor: '#f2f2f2' }}>
              <th>Fecha</th>
              <th>Descripción</th>
              <th>Categoría</th>
              <th style={{ textAlign: 'right' }}>Monto</th>
            </tr>
          </thead>
          <tbody>
            {egresosFiltrados.map((egreso) => (
              <tr key={egreso.id}>
                <td>{new Date(egreso.fecha).toLocaleDateString('es-ES')}</td>
                <td>{egreso.descripcion}</td>
                <td>{egreso.categoria}</td>
                <td style={{ textAlign: 'right' }}>${Number(egreso.monto).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr style={{ fontWeight: 'bold', backgroundColor: '#f2f2f2' }}>
              <td colSpan="3" style={{ textAlign: 'right' }}>TOTAL EGRESOS:</td>
              <td style={{ textAlign: 'right' }}>${totalEgresosFiltrados.toFixed(2)}</td>
            </tr>
          </tfoot>
        </Table>
        <div style={{ marginTop: '50px', fontSize: '12px', textAlign: 'center', color: '#666' }}>
          <p>Generado automáticamente por Mantente App - Decisiones claras, negocios rentables</p>
          <p>Fecha de generación: {new Date().toLocaleString('es-ES')}</p>
        </div>
      </div>
    </div>
  );
};

export default Egresos;