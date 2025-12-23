// src/components/Dashboard.jsx
import React, { useEffect, useState } from "react";
import { useApp } from "../context/AppContext";
import { Card, Row, Col, Table, Button, Form, Modal } from "react-bootstrap";

const Dashboard = () => {
  const { obtenerVentas, obtenerEgresos, calcularValorInventario, obtenerGastosFijos, guardarGastosFijos, obtenerDeudaAcumulada, calcularTotalDevolucionesAprobadas, obtenerDevoluciones, user, ventas: ventasContext, egresos: egresosContext, devoluciones: devolucionesContext } = useApp();
  const [ventas, setVentas] = useState([]);
  const [egresos, setEgresos] = useState([]);
  const [balance, setBalance] = useState({ ingresos: 0, egresos: 0, gastosFijos: 0, deuda: 0, devoluciones: 0, total: 0 });
  const [valorInventario, setValorInventario] = useState(0);
  const [gastosFijos, setGastosFijos] = useState(0);
  const [deuda, setDeuda] = useState(0);
  const [devoluciones, setDevoluciones] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [nuevoGasto, setNuevoGasto] = useState("");

  const cargarDatos = async () => {
    if (!user?.id) return;

    const ventasResult = await obtenerVentas();
    const ventasData = Array.isArray(ventasResult?.data) ? ventasResult.data : Array.isArray(ventasResult) ? ventasResult : [];
    const egresosResult = await obtenerEgresos();
    const egresosData = Array.isArray(egresosResult?.data) ? egresosResult.data : Array.isArray(egresosResult) ? egresosResult : [];
    const gastosFijosGuardados = obtenerGastosFijos();
    const deudaResult = await obtenerDeudaAcumulada();
    const deudaAcumulada = deudaResult.deuda || 0;
    const devolucionesAprobadas = calcularTotalDevolucionesAprobadas();

    // ✅ CORREGIDO: El monto ya viene con descuento aplicado, NO restar nuevamente
    const ventasTotal = Array.isArray(ventasData) ? ventasData.reduce(
      (acc, v) => acc + (v.monto || 0),
      0
    ) : 0;
    
    // ✅ ERROR 2 CORREGIDO: Restar devoluciones aprobadas de los INGRESOS
    const ingresosTotales = ventasTotal - devolucionesAprobadas;
    
    const egresosTotales = Array.isArray(egresosData) ? egresosData.reduce((acc, e) => acc + (e.monto || 0), 0) : 0;
    const totalInventario = calcularValorInventario();

    const ventasOrdenadas = [...ventasData].sort((a, b) => (b.id || 0) - (a.id || 0));

    setVentas(ventasOrdenadas);
    setEgresos(egresosData);
    setGastosFijos(gastosFijosGuardados);
    setDeuda(deudaAcumulada);
    setDevoluciones(devolucionesAprobadas);
    setValorInventario(totalInventario);
    
    // ✅ CORREGIDO: BALANCE ACTUAL = INGRESOS - EGRESOS - GASTOS FIJOS
    // La deuda acumulada se muestra por separado, no se resta del balance
    const balanceActual = ingresosTotales - egresosTotales - gastosFijosGuardados;
    const balanceFinal = balanceActual; // Balance puede ser negativo
    
    setBalance({
      ingresos: ingresosTotales,
      egresos: egresosTotales,
      gastosFijos: gastosFijosGuardados,
      deuda: deudaAcumulada,
      devoluciones: devolucionesAprobadas,
      total: balanceFinal,
    });
  };

  useEffect(() => {
    if (!user?.id) return;

    cargarDatos();
    
    const autoRefreshInterval = setInterval(() => {
      cargarDatos();
    }, 60000);

    return () => clearInterval(autoRefreshInterval);
  }, [user?.id]);

  useEffect(() => {
    cargarDatos();
  }, [ventasContext, egresosContext, devolucionesContext]);

  const handleGuardarGastosFijos = () => {
    const monto = parseFloat(nuevoGasto) || 0;
    if (monto < 0) {
      alert("❌ El monto no puede ser negativo");
      return;
    }
    guardarGastosFijos(monto);
    setGastosFijos(monto);
    // ✅ CORREGIDO: Balance = Ingresos - Egresos - Gastos Fijos (deuda se muestra por separado)
    setBalance((prev) => ({
      ...prev,
      gastosFijos: monto,
      total: prev.ingresos - prev.egresos - monto,
    }));
    setNuevoGasto("");
    setShowModal(false);
  };

  return (
    <div className="container mt-4">
      <h2 className="text-center mb-4 fw-bold" style={{ color: '#E2B54E' }}>
        Panel Financiero 💼
      </h2>

      {/* Primera fila: Ingresos, Egresos, Balance */}
      <Row className="g-4 mb-5">
        <Col md={4}>
          <Card className="shadow-lg border-0 mantente-bg-taupe text-white text-center">
            <Card.Body>
              <h4><span className="elegant-icon">💰</span> Ingresos</h4>
              <h2>${balance.ingresos.toLocaleString('es-ES')}</h2>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="shadow-lg border-0 bg-danger text-white text-center">
            <Card.Body>
              <h4><span className="elegant-icon">📉</span> Egresos</h4>
              <h2>${balance.egresos.toLocaleString('es-ES')}</h2>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="shadow-lg border-0 text-white text-center" style={{ background: 'linear-gradient(135deg, #E2B54E 0%, #A67729 100%)' }}>
            <Card.Body>
              <h4><span className="elegant-icon">📊</span> Balance Final</h4>
              <h2>${balance.total.toLocaleString('es-ES')}</h2>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Segunda fila: Gastos Fijos, Deuda, Inventario y Devoluciones */}
      <Row className="g-4 mb-5">
        <Col md={3}>
          <Card className="shadow-lg border-0">
            <Card.Body className="text-center">
              <h4>🏠 Gastos Fijos Mensuales</h4>
              <h2 className="text-warning">${gastosFijos.toLocaleString('es-ES')}</h2>
              <Button 
                variant="warning" 
                size="sm" 
                className="mt-3"
                onClick={() => setShowModal(true)}
              >
                ⚙️ Configurar
              </Button>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className={`shadow-lg border-0 ${deuda > 0 ? 'border-danger' : ''}`}>
            <Card.Body className="text-center">
              <h4>📊 Deuda Acumulada</h4>
              <h2 className={deuda > 0 ? "text-danger" : "text-success"}>
                ${deuda.toLocaleString('es-ES')}
              </h2>
              <p className="text-muted small mt-2">
                {deuda > 0 
                  ? `Gastos fijos pendientes por recuperar` 
                  : `Sin deuda pendiente`}
              </p>
              {deuda > 0 && (
                <div className="mt-3">
                  <div className="progress" style={{ height: "8px" }}>
                    <div 
                      className="progress-bar bg-danger" 
                      style={{ width: `${Math.min((deuda / gastosFijos) * 100, 100)}%` }}
                    ></div>
                  </div>
                  <small className="text-muted mt-2">
                    Necesitas ${deuda.toLocaleString('es-ES')} en ingresos para recuperarla
                  </small>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="shadow-lg border-0">
            <Card.Body className="text-center">
              <h4><span className="elegant-icon">📦</span> Valor del Inventario</h4>
              <h2 style={{ color: '#E2B54E' }}>${valorInventario.toLocaleString('es-ES')}</h2>
              <p className="text-muted small mt-2">Capital invertido</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className={`shadow-lg border-0 ${devoluciones > 0 ? 'border-secondary' : ''}`}>
            <Card.Body className="text-center">
              <h4><span className="elegant-icon">↩️</span> Devoluciones Aprobadas</h4>
              <h2 className="text-secondary">${devoluciones.toLocaleString('es-ES')}</h2>
              <p className="text-muted small mt-2">
                {devoluciones > 0
                  ? `Reembolsos aprobados`
                  : `Sin devoluciones`}
              </p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Card className="shadow border-0">
        <Card.Header style={{ background: 'linear-gradient(135deg, #E2B54E 0%, #A67729 100%)', color: 'white' }} className="fw-semibold">
          Últimas Ventas Registradas
        </Card.Header>
        <Card.Body>
          <Table responsive hover>
            <thead>
              <tr>
                <th>Código Venta</th>
                <th>Fecha</th>
                <th>Producto</th>
                <th>Cantidad</th>
                <th>Monto</th>
                <th>Cliente</th>
              </tr>
            </thead>
            <tbody>
              {ventas.length > 0 ? (
                ventas.slice(0, 8).map((v) => (
                  <tr key={v.id}>
                    <td>
                      <strong style={{ color: 'var(--mantente-gold)' }}>
                        {v.codigo_venta || 'N/A'}
                      </strong>
                    </td>
                    <td>{v.fecha}</td>
                    <td>{v.producto}</td>
                    <td>{v.cantidad || 1}</td>
                    <td>${Number(v.monto || 0).toLocaleString('es-ES')}</td>
                    <td>{v.cliente}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center text-muted">
                    No hay ventas registradas
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* Modal para configurar gastos fijos */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton className="bg-warning">
          <Modal.Title><span className="elegant-icon">⚙️</span> Configurar Gastos Fijos Mensuales</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold">Monto de gastos fijos ($)</Form.Label>
            <Form.Control
              type="number"
              placeholder="Ej: 1000"
              value={nuevoGasto}
              onChange={(e) => setNuevoGasto(e.target.value)}
              step="0.01"
              min="0"
            />
            <small className="text-muted">
              Este monto será restado de tus ingresos mensuales
            </small>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancelar
          </Button>
          <Button variant="warning" onClick={handleGuardarGastosFijos}>
            <span className="elegant-icon">💾</span> Guardar
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Dashboard;
