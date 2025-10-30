import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Alert, Card, Button, Table, Row, Col, Badge, Container } from 'react-bootstrap';
import DevolucionesModal from './DevolucionesModal';

/**
 * 📦 COMPONENTE DEVOLUCIONES
 * Interfaz para procesar devoluciones de ventas con 7 tipos de resolución
 */
const Devoluciones = () => {
  const {
    user,
    isPremium,
    ventas,
    devoluciones,
    obtenerDevoluciones,
    buscarVentaPorCodigo,
    aprobarDevolucion,   // ✅ NUEVO
    rechazarDevolucion,  // ✅ NUEVO
  } = useApp();

  const [showModal, setShowModal] = useState(false);
  const [codigoVentaBuscado, setCodigoVentaBuscado] = useState('');
  const [ventaSeleccionada, setVentaSeleccionada] = useState(null);
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState(null);
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [loadingAccion, setLoadingAccion] = useState(null); // ✅ NUEVO: Tracking para botones

  useEffect(() => {
    cargarDevoluciones();
  }, []);

  const cargarDevoluciones = async () => {
    setLoading(true);
    try {
      await obtenerDevoluciones();
    } catch (error) {
      console.error('Error al cargar devoluciones:', error);
    }
    setLoading(false);
  };

  // Buscar venta por código
  const handleBuscarVenta = () => {
    if (!codigoVentaBuscado.trim()) {
      setMensaje({ type: "warning", text: "Por favor ingresa un código de venta" });
      return;
    }

    const venta = buscarVentaPorCodigo(codigoVentaBuscado);
    if (venta) {
      setVentaSeleccionada(venta);
      setShowModal(true);
    } else {
      setMensaje({ type: "danger", text: `❌ No se encontró venta con código: ${codigoVentaBuscado}` });
      setVentaSeleccionada(null);
    }
  };

  // Limpiar búsqueda
  const handleLimpiarBusqueda = () => {
    setCodigoVentaBuscado('');
    setVentaSeleccionada(null);
    setShowModal(false);
  };

  // Manejar cierre del modal
  const handleModalClose = () => {
    setShowModal(false);
    setVentaSeleccionada(null);
    setCodigoVentaBuscado('');
    cargarDevoluciones(); // Recargar devoluciones
  };

  // ✅ NUEVO: Manejar aprobación de devolución
  const handleAprobarDevolucion = async (devolucionId) => {
    setLoadingAccion(devolucionId);
    const resultado = await aprobarDevolucion(devolucionId);
    setLoadingAccion(null);
    
    if (resultado.success) {
      setMensaje({
        type: "success",
        text: `✅ Devolución aprobada exitosamente. Impacto financiero registrado.`,
      });
    } else {
      setMensaje({
        type: "danger",
        text: `❌ Error al aprobar: ${resultado.message}`,
      });
    }
  };

  // ✅ NUEVO: Manejar rechazo de devolución
  const handleRechazarDevolucion = async (devolucionId) => {
    setLoadingAccion(devolucionId);
    const resultado = await rechazarDevolucion(devolucionId);
    setLoadingAccion(null);
    
    if (resultado.success) {
      setMensaje({
        type: "info",
        text: `ℹ️ Devolución rechazada. Sin cambios financieros.`,
      });
    } else {
      setMensaje({
        type: "danger",
        text: `❌ Error al rechazar: ${resultado.message}`,
      });
    }
  };

  // 📊 ESTADÍSTICAS
  const stats = {
    total: devoluciones.length,
    reembolsos: devoluciones.filter(d => d.tipo_resolucion === "Reembolso").length,
    cambios: devoluciones.filter(d => d.tipo_resolucion.includes("Cambio")).length,
    canjes: devoluciones.filter(d => d.tipo_resolucion === "Canje Proveedor").length,
    perdidas: devoluciones.filter(d => d.tipo_resolucion === "Pérdida").length,
    // ✅ ACTUALIZADO: Solo contar impacto de devoluciones APROBADAS (tienen id_ingreso o id_egreso)
    totalMoneda: devoluciones
      .filter(d => d.estado === "Aprobada")
      .reduce((acc, d) => {
        const impacto = d.id_ingreso ? d.diferencia_precio : (d.id_egreso ? -(d.diferencia_precio) : 0);
        return acc + impacto;
      }, 0),
  };

  // 🔍 FILTRAR DEVOLUCIONES
  const devolucionesFiltradasPorEstado = devoluciones.filter(d => {
    if (filtroEstado === "todos") return true;
    return d.tipo_resolucion === filtroEstado;
  });

  if (!isPremium) {
    return (
      <Container className="py-4">
        <Alert variant="warning">
          <strong>🔒 Funcionalidad Premium</strong>
          <p className="mb-0">La gestión de devoluciones está disponible solo para usuarios Premium.</p>
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="py-4" style={{ minHeight: "100vh" }}>
      {/* HEADER */}
      <Row className="mb-4 align-items-center">
        <Col>
          <h1 className="mb-1">📦 Gestión de Devoluciones</h1>
          <p className="text-muted">Procesa devoluciones con 7 tipos de resolución automáticos</p>
        </Col>
        <Col md="auto">
          <Button
            variant="primary"
            onClick={() => setShowModal(true)}
            size="lg"
          >
            ➕ Nueva Devolución
          </Button>
        </Col>
      </Row>

      {/* MENSAJE */}
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

      {/* BÚSQUEDA DE VENTA */}
      <Card className="mb-4 border-primary">
        <Card.Header className="bg-primary text-white">
          <strong>🔍 Buscar Venta para Procesar Devolución</strong>
        </Card.Header>
        <Card.Body>
          <Row className="g-3">
            <Col md={10}>
              <input
                type="text"
                className="form-control"
                placeholder="Ingresa el código de venta (ej: VTA-2024-00001)"
                value={codigoVentaBuscado}
                onChange={(e) => setCodigoVentaBuscado(e.target.value)}
                disabled={ventaSeleccionada !== null}
              />
            </Col>
            <Col md={2}>
              {ventaSeleccionada ? (
                <Button
                  variant="warning"
                  onClick={handleLimpiarBusqueda}
                  className="w-100"
                >
                  🔄 Cambiar
                </Button>
              ) : (
                <Button
                  variant="info"
                  onClick={handleBuscarVenta}
                  className="w-100"
                >
                  🔍 Buscar
                </Button>
              )}
            </Col>
          </Row>

          {ventaSeleccionada && (
            <Alert variant="success" className="mt-3 mb-0">
              <Row className="mb-2">
                <Col md={6}>
                  <p><strong>Código:</strong> {ventaSeleccionada.codigo_venta}</p>
                  <p><strong>Cliente:</strong> {ventaSeleccionada.cliente}</p>
                </Col>
                <Col md={6}>
                  <p><strong>Monto:</strong> ${ventaSeleccionada.monto?.toFixed(2)}</p>
                  <p><strong>Cantidad Productos:</strong> {ventaSeleccionada.cantidad_productos || (ventaSeleccionada.productos_json?.length || 1)}</p>
                </Col>
              </Row>
              {ventaSeleccionada.productos_json && ventaSeleccionada.productos_json.length > 0 && (
                <div>
                  <strong>📦 Productos en la venta:</strong>
                  <ul className="mb-0 mt-2">
                    {ventaSeleccionada.productos_json.map((prod, idx) => (
                      <li key={idx}>
                        {prod.nombre} - Cantidad: {prod.cantidad} x ${prod.precio_unitario?.toFixed(2)} = ${prod.subtotal?.toFixed(2)}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </Alert>
          )}
        </Card.Body>
      </Card>

      {/* TARJETAS DE ESTADÍSTICAS */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="text-center border-primary">
            <Card.Body>
              <h3 className="text-primary">{stats.total}</h3>
              <p className="text-muted mb-0">Total Devoluciones</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center border-info">
            <Card.Body>
              <h3 className="text-info">{stats.reembolsos}</h3>
              <p className="text-muted mb-0">Reembolsos</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center border-success">
            <Card.Body>
              <h3 className="text-success">{stats.cambios}</h3>
              <p className="text-muted mb-0">Cambios</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center border-danger">
            <Card.Body>
              <h3 className="text-danger">${stats.totalMoneda.toFixed(2)}</h3>
              <p className="text-muted mb-0">Impacto Financiero</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* TABLA DE DEVOLUCIONES */}
      <Card>
        <Card.Header className="bg-dark text-white">
          <strong>📋 Historial de Devoluciones</strong>
        </Card.Header>
        {devolucionesFiltradasPorEstado.length > 0 ? (
          <div className="table-responsive">
            <Table hover className="mb-0">
              <thead className="table-light">
                <tr>
                  <th>Fecha</th>
                  <th>Venta</th>
                  <th>Cliente</th>
                  <th>Tipo</th>
                  <th>Cantidad</th>
                  <th>Impacto</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {devolucionesFiltradasPorEstado.map((dev) => (
                  <tr key={dev.id}>
                    <td>{new Date(dev.fecha).toLocaleDateString("es-MX")}</td>
                    <td><strong>{dev.codigo_venta}</strong></td>
                    <td>{dev.cliente}</td>
                    <td>
                      <Badge bg="secondary">{dev.tipo_resolucion}</Badge>
                    </td>
                    <td>{dev.cantidad_devuelta || dev.cantidad}</td>
                    <td>
                      {dev.id_ingreso ? (
                        <Badge bg="success">+${dev.diferencia_precio?.toFixed(2)}</Badge>
                      ) : dev.id_egreso ? (
                        <Badge bg="danger">-${dev.diferencia_precio?.toFixed(2)}</Badge>
                      ) : (
                        <Badge bg="secondary">$0 (Pendiente)</Badge>
                      )}
                    </td>
                    <td>
                      <Badge
                        bg={dev.estado === "Pendiente Revisión" ? "warning" : dev.estado === "Aprobada" ? "success" : "danger"}
                      >
                        {dev.estado}
                      </Badge>
                    </td>
                    {/* ✅ NUEVO: Botones de acciones */}
                    <td>
                      {dev.estado === "Pendiente Revisión" ? (
                        <div className="d-flex gap-2">
                          <Button
                            variant="success"
                            size="sm"
                            disabled={loadingAccion === dev.id}
                            onClick={() => handleAprobarDevolucion(dev.id)}
                          >
                            {loadingAccion === dev.id ? "⏳..." : "✓ Aprobar"}
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            disabled={loadingAccion === dev.id}
                            onClick={() => handleRechazarDevolucion(dev.id)}
                          >
                            {loadingAccion === dev.id ? "⏳..." : "✗ Rechazar"}
                          </Button>
                        </div>
                      ) : (
                        <Badge bg="secondary">—</Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        ) : (
          <Card.Body>
            <Alert variant="info" className="mb-0">
              📭 No hay devoluciones registradas aún
            </Alert>
          </Card.Body>
        )}
      </Card>

      {/* MODAL DE DEVOLUCIÓN */}
      <DevolucionesModal
        show={showModal}
        onHide={handleModalClose}
        ventaSeleccionada={ventaSeleccionada}
      />
    </Container>
  );
};

export default Devoluciones;