import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Alert, Card, Button, Form, Table, Modal, Row, Col, Badge } from 'react-bootstrap';

const Devoluciones = () => {
  const {
    user,
    isPremium,
    ventas,
    devoluciones,
    registrarDevolucion,
    obtenerDevoluciones,
    actualizarEstadoDevolucion,
    buscarVentaPorCodigo,
    obtenerVentasPorPeriodo,
    calcularTotalDevolucionesAprobadas,
  } = useApp();

  const [showModal, setShowModal] = useState(false);
  const [codigoVentaBuscado, setCodigoVentaBuscado] = useState('');
  const [ventaSeleccionada, setVentaSeleccionada] = useState(null);
  const [mesInicio, setMesInicio] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [mesFin, setMesFin] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  const [formData, setFormData] = useState({
    codigo_venta: '',
    cliente: '',
    producto: '',
    cantidad: 1,
    razon: '',
    monto: 0,
  });

  const [loading, setLoading] = useState(false);

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
      alert('Por favor ingresa un código de venta');
      return;
    }

    const venta = buscarVentaPorCodigo(codigoVentaBuscado);
    if (venta) {
      setVentaSeleccionada(venta);
      setFormData({
        codigo_venta: venta.codigo_venta,
        cliente: venta.cliente || '',
        producto: venta.producto || '',
        cantidad: 1,
        razon: '',
        monto: venta.monto || 0,
      });
    } else {
      alert(`❌ No se encontró venta con código: ${codigoVentaBuscado}`);
      setVentaSeleccionada(null);
    }
  };

  // Limpiar búsqueda
  const handleLimpiarBusqueda = () => {
    setCodigoVentaBuscado('');
    setVentaSeleccionada(null);
    setFormData({
      codigo_venta: '',
      cliente: '',
      producto: '',
      cantidad: 1,
      razon: '',
      monto: 0,
    });
  };

  // Registrar devolución
  const handleRegistrarDevolucion = async () => {
    if (!formData.codigo_venta || !formData.monto) {
      alert('Por favor completa los datos requeridos');
      return;
    }

    if (parseFloat(formData.monto) <= 0) {
      alert('El monto debe ser mayor a 0');
      return;
    }

    setLoading(true);
    try {
      const resultado = await registrarDevolucion({
        codigo_venta: formData.codigo_venta,
        monto: parseFloat(formData.monto),
        cantidad: parseInt(formData.cantidad),
        razon: formData.razon,
        cliente: formData.cliente,
        producto: formData.producto,
      });

      if (resultado.success) {
        alert('✅ Devolución registrada exitosamente');
        handleLimpiarBusqueda();
        setShowModal(false);
        await cargarDevoluciones();
      } else {
        alert(`❌ Error: ${resultado.message}`);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al registrar la devolución');
    } finally {
      setLoading(false);
    }
  };

  // Cambiar estado de devolución
  const handleCambiarEstado = async (id, nuevoEstado) => {
    setLoading(true);
    try {
      const resultado = await actualizarEstadoDevolucion(id, nuevoEstado);
      if (resultado.success) {
        alert('✅ Estado actualizado');
        await cargarDevoluciones();
      } else {
        alert(`❌ Error: ${resultado.message}`);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al actualizar estado');
    } finally {
      setLoading(false);
    }
  };

  // Obtener ventas del período
  const ventasDelPeriodo = obtenerVentasPorPeriodo(mesInicio, mesFin);
  const totalDevolucionesAprobadas = calcularTotalDevolucionesAprobadas();

  if (!isPremium) {
    return (
      <Alert variant="warning" className="m-4">
        <strong>🔒 Funcionalidad Premium</strong>
        <p>La gestión de devoluciones está disponible solo para usuarios Premium.</p>
      </Alert>
    );
  }

  return (
    <div className="container mt-4 mb-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mantente-text-brown">↩️ Devoluciones</h2>
        <Button
          onClick={() => setShowModal(true)}
          style={{ backgroundColor: 'var(--mantente-brown)', borderColor: 'var(--mantente-brown)' }}
        >
          ➕ Nueva Devolución
        </Button>
      </div>

      {/* Resumen de devoluciones */}
      <Row className="g-3 mb-4">
        <Col md={3}>
          <Card>
            <Card.Body className="text-center">
              <h6 className="mantente-text-brown">Total Registradas</h6>
              <h4 className="mantente-text-gold">{devoluciones.length}</h4>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card>
            <Card.Body className="text-center">
              <h6 className="mantente-text-brown">Pendientes</h6>
              <h4 className="text-warning">
                {devoluciones.filter((d) => d.estado === 'Pendiente Revisión').length}
              </h4>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card>
            <Card.Body className="text-center">
              <h6 className="mantente-text-brown">Aprobadas</h6>
              <h4 className="text-success">
                {devoluciones.filter((d) => d.estado === 'Aprobada').length}
              </h4>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card>
            <Card.Body className="text-center">
              <h6 className="mantente-text-brown">Total Moneda</h6>
              <h4 className="mantente-text-gold">
                ${totalDevolucionesAprobadas.toLocaleString('es-ES', { maximumFractionDigits: 2 })}
              </h4>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Filtros */}
      <Card className="mb-4">
        <Card.Header>🔍 Filtrar Ventas por Período</Card.Header>
        <Card.Body>
          <Row className="g-3">
            <Col md={4}>
              <Form.Group>
                <Form.Label>Desde:</Form.Label>
                <Form.Control
                  type="month"
                  value={mesInicio}
                  onChange={(e) => setMesInicio(e.target.value)}
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Hasta:</Form.Label>
                <Form.Control
                  type="month"
                  value={mesFin}
                  onChange={(e) => setMesFin(e.target.value)}
                />
              </Form.Group>
            </Col>
            <Col md={4} className="d-flex align-items-end">
              <div>
                <small className="d-block text-muted mb-2">
                  {ventasDelPeriodo.length} venta(s) en este período
                </small>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Modal para nueva devolución */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>↩️ Registrar Devolución</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            {/* Búsqueda de venta */}
            <div className="mb-4 p-3" style={{ backgroundColor: 'rgba(226, 181, 78, 0.1)', borderRadius: '8px' }}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-bold">Buscar Venta por Código</Form.Label>
                <div className="d-flex gap-2">
                  <Form.Control
                    placeholder="Ej: VTA-2024-00001"
                    value={codigoVentaBuscado}
                    onChange={(e) => setCodigoVentaBuscado(e.target.value)}
                    disabled={ventaSeleccionada !== null}
                  />
                  {ventaSeleccionada ? (
                    <Button
                      variant="warning"
                      onClick={handleLimpiarBusqueda}
                      disabled={loading}
                    >
                      🔄 Cambiar
                    </Button>
                  ) : (
                    <Button
                      variant="info"
                      onClick={handleBuscarVenta}
                      disabled={loading}
                    >
                      🔍 Buscar
                    </Button>
                  )}
                </div>
              </Form.Group>

              {ventaSeleccionada && (
                <Alert variant="success">
                  ✅ Venta encontrada:
                  <ul className="mb-0 mt-2">
                    <li>
                      <strong>Código:</strong> {ventaSeleccionada.codigo_venta}
                    </li>
                    <li>
                      <strong>Cliente:</strong> {ventaSeleccionada.cliente}
                    </li>
                    <li>
                      <strong>Producto:</strong> {ventaSeleccionada.producto}
                    </li>
                    <li>
                      <strong>Monto Original:</strong> ${ventaSeleccionada.monto?.toFixed(2)}
                    </li>
                  </ul>
                </Alert>
              )}
            </div>

            {/* Detalles de la devolución */}
            {ventaSeleccionada && (
              <>
                <Form.Group className="mb-3">
                  <Form.Label>Cliente</Form.Label>
                  <Form.Control
                    value={formData.cliente}
                    onChange={(e) => setFormData({ ...formData, cliente: e.target.value })}
                    readOnly
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Producto</Form.Label>
                  <Form.Control
                    value={formData.producto}
                    onChange={(e) => setFormData({ ...formData, producto: e.target.value })}
                    readOnly
                  />
                </Form.Group>

                <Row className="mb-3">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Cantidad a Devolver</Form.Label>
                      <Form.Control
                        type="number"
                        min="1"
                        value={formData.cantidad}
                        onChange={(e) => setFormData({ ...formData, cantidad: parseInt(e.target.value) })}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Monto a Reembolsar ($)</Form.Label>
                      <Form.Control
                        type="number"
                        step="0.01"
                        min="0"
                        max={formData.monto}
                        value={formData.monto}
                        onChange={(e) => setFormData({ ...formData, monto: parseFloat(e.target.value) })}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label>Razón de la Devolución</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    placeholder="Especifica el motivo de la devolución"
                    value={formData.razon}
                    onChange={(e) => setFormData({ ...formData, razon: e.target.value })}
                  />
                </Form.Group>
              </>
            )}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => {
              setShowModal(false);
              handleLimpiarBusqueda();
            }}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleRegistrarDevolucion}
            disabled={!ventaSeleccionada || loading}
            style={{ backgroundColor: 'var(--mantente-brown)', borderColor: 'var(--mantente-brown)' }}
          >
            {loading ? 'Guardando...' : 'Registrar Devolución'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Historial de devoluciones */}
      <Card>
        <Card.Header className="bg-dark text-white fw-semibold">
          📋 Historial de Devoluciones
        </Card.Header>
        <Card.Body>
          {devoluciones.length === 0 ? (
            <Alert variant="info" className="mb-0">
              No hay devoluciones registradas aún.
            </Alert>
          ) : (
            <div className="table-responsive">
              <Table hover>
                <thead style={{ backgroundColor: 'rgba(166, 119, 41, 0.1)' }}>
                  <tr>
                    <th>Código Venta</th>
                    <th>Fecha</th>
                    <th>Cliente</th>
                    <th>Producto</th>
                    <th>Cantidad</th>
                    <th>Monto</th>
                    <th>Razón</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {devoluciones.map((dev) => (
                    <tr key={dev.id}>
                      <td>
                        <strong style={{ color: 'var(--mantente-gold)' }}>
                          {dev.codigo_venta}
                        </strong>
                      </td>
                      <td>{dev.fecha}</td>
                      <td>{dev.cliente}</td>
                      <td>{dev.producto}</td>
                      <td>{dev.cantidad}</td>
                      <td>${parseFloat(dev.monto || 0).toFixed(2)}</td>
                      <td>
                        <small>{dev.razon}</small>
                      </td>
                      <td>
                        <Badge
                          bg={
                            dev.estado === 'Aprobada'
                              ? 'success'
                              : dev.estado === 'Rechazada'
                              ? 'danger'
                              : 'warning'
                          }
                        >
                          {dev.estado}
                        </Badge>
                      </td>
                      <td>
                        {dev.estado === 'Pendiente Revisión' && (
                          <div className="d-flex gap-2">
                            <Button
                              size="sm"
                              variant="success"
                              onClick={() => handleCambiarEstado(dev.id, 'Aprobada')}
                              disabled={loading}
                            >
                              ✓
                            </Button>
                            <Button
                              size="sm"
                              variant="danger"
                              onClick={() => handleCambiarEstado(dev.id, 'Rechazada')}
                              disabled={loading}
                            >
                              ✕
                            </Button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Ventas disponibles para devolución */}
      {ventasDelPeriodo.length > 0 && (
        <Card className="mt-4">
          <Card.Header>📦 Ventas Disponibles del Período ({ventasDelPeriodo.length})</Card.Header>
          <Card.Body>
            <div className="table-responsive">
              <Table hover size="sm">
                <thead>
                  <tr>
                    <th>Código Venta</th>
                    <th>Fecha</th>
                    <th>Cliente</th>
                    <th>Producto</th>
                    <th>Monto</th>
                  </tr>
                </thead>
                <tbody>
                  {ventasDelPeriodo.map((venta) => (
                    <tr key={venta.id}>
                      <td>
                        <strong style={{ color: 'var(--mantente-gold)' }}>
                          {venta.codigo_venta}
                        </strong>
                      </td>
                      <td>{venta.fecha}</td>
                      <td>{venta.cliente}</td>
                      <td>{venta.producto}</td>
                      <td>${parseFloat(venta.monto || 0).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </Card.Body>
        </Card>
      )}
    </div>
  );
};

export default Devoluciones;