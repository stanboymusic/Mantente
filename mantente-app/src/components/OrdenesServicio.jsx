import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Alert, Card, Button, Form, Table, Modal } from 'react-bootstrap';

const OrdenesServicio = () => {
  const { user, isPremium } = useApp();
  const [ordenes, setOrdenes] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    cliente: '',
    descripcion_servicio: '',
    fecha_inicio: new Date().toISOString().split('T')[0],
    fecha_estimada_termino: '',
    tecnico: '',
    costo_mano_obra: 0,
    costo_materiales: 0,
    notas: ''
  });

  if (!isPremium) {
    return (
      <Alert variant="warning" className="m-4">
        <strong>🔒 Funcionalidad Premium</strong>
        <p>Las órdenes de servicio están disponibles solo para usuarios Premium.</p>
      </Alert>
    );
  }

  const handleCreateOrden = () => {
    if (!formData.cliente || !formData.descripcion_servicio) {
      alert('Por favor completa los datos requeridos');
      return;
    }

    const nuevaOrden = {
      id: Date.now(),
      ...formData,
      numero: `OS-${Date.now()}`,
      estado: 'Pendiente',
      total: formData.costo_mano_obra + formData.costo_materiales
    };

    setOrdenes([nuevaOrden, ...ordenes]);
    setFormData({
      cliente: '',
      descripcion_servicio: '',
      fecha_inicio: new Date().toISOString().split('T')[0],
      fecha_estimada_termino: '',
      tecnico: '',
      costo_mano_obra: 0,
      costo_materiales: 0,
      notas: ''
    });
    setShowModal(false);
  };

  const handleChangeStatus = (id, nuevoEstado) => {
    setOrdenes(ordenes.map(ord =>
      ord.id === id ? { ...ord, estado: nuevoEstado } : ord
    ));
  };

  return (
    <div className="container mt-4 mb-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mantente-text-brown">🔧 Órdenes de Servicio</h2>
        <Button 
          onClick={() => setShowModal(true)}
          style={{ backgroundColor: 'var(--mantente-brown)', borderColor: 'var(--mantente-brown)' }}
        >
          ➕ Nueva Orden
        </Button>
      </div>

      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Crear Orden de Servicio</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Cliente</Form.Label>
              <Form.Control
                value={formData.cliente}
                onChange={(e) => setFormData({ ...formData, cliente: e.target.value })}
                placeholder="Nombre del cliente"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Descripción del Servicio</Form.Label>
              <Form.Control
                as="textarea"
                value={formData.descripcion_servicio}
                onChange={(e) => setFormData({ ...formData, descripcion_servicio: e.target.value })}
                placeholder="Detalles del servicio a realizar"
                rows={3}
              />
            </Form.Group>

            <div className="row">
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label>Fecha Inicio</Form.Label>
                  <Form.Control
                    type="date"
                    value={formData.fecha_inicio}
                    onChange={(e) => setFormData({ ...formData, fecha_inicio: e.target.value })}
                  />
                </Form.Group>
              </div>
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label>Fecha Est. Término</Form.Label>
                  <Form.Control
                    type="date"
                    value={formData.fecha_estimada_termino}
                    onChange={(e) => setFormData({ ...formData, fecha_estimada_termino: e.target.value })}
                  />
                </Form.Group>
              </div>
            </div>

            <Form.Group className="mb-3">
              <Form.Label>Técnico Responsable</Form.Label>
              <Form.Control
                value={formData.tecnico}
                onChange={(e) => setFormData({ ...formData, tecnico: e.target.value })}
                placeholder="Nombre del técnico"
              />
            </Form.Group>

            <div className="row">
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label>Costo Mano de Obra</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    value={formData.costo_mano_obra}
                    onChange={(e) => setFormData({ ...formData, costo_mano_obra: parseFloat(e.target.value) })}
                  />
                </Form.Group>
              </div>
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label>Costo Materiales</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    value={formData.costo_materiales}
                    onChange={(e) => setFormData({ ...formData, costo_materiales: parseFloat(e.target.value) })}
                  />
                </Form.Group>
              </div>
            </div>

            <Form.Group className="mb-3">
              <Form.Label>Notas Adicionales</Form.Label>
              <Form.Control
                as="textarea"
                value={formData.notas}
                onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
                placeholder="Notas técnicas o especiales"
                rows={2}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancelar
          </Button>
          <Button onClick={handleCreateOrden} style={{ backgroundColor: 'var(--mantente-brown)', borderColor: 'var(--mantente-brown)' }}>
            Crear Orden
          </Button>
        </Modal.Footer>
      </Modal>

      {ordenes.length === 0 ? (
        <Alert variant="info">No hay órdenes de servicio aún. ¡Crea una!</Alert>
      ) : (
        <div className="table-responsive">
          <Table hover>
            <thead style={{ backgroundColor: 'rgba(166, 119, 41, 0.1)' }}>
              <tr>
                <th>Nº Orden</th>
                <th>Cliente</th>
                <th>Técnico</th>
                <th>Inicio</th>
                <th>Est. Término</th>
                <th>Total</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {ordenes.map((ord) => (
                <tr key={ord.id}>
                  <td><strong>{ord.numero}</strong></td>
                  <td>{ord.cliente}</td>
                  <td>{ord.tecnico}</td>
                  <td>{ord.fecha_inicio}</td>
                  <td>{ord.fecha_estimada_termino}</td>
                  <td>${ord.total.toFixed(2)}</td>
                  <td>
                    <span className="badge" style={{ backgroundColor: 'var(--mantente-gold)' }}>
                      {ord.estado}
                    </span>
                  </td>
                  <td>
                    {ord.estado === 'Pendiente' && (
                      <>
                        <Button size="sm" variant="info" className="me-2" onClick={() => handleChangeStatus(ord.id, 'En Progreso')}>
                          ▶
                        </Button>
                      </>
                    )}
                    {ord.estado === 'En Progreso' && (
                      <Button size="sm" variant="success" onClick={() => handleChangeStatus(ord.id, 'Completada')}>
                        ✓
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default OrdenesServicio;