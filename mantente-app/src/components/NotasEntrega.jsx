import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Alert, Card, Button, Form, Table, Modal } from 'react-bootstrap';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const NotasEntrega = () => {
  const { user, isPremium, notasEntrega, crearNotaEntrega } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [alerta, setAlerta] = useState(null);
  const [formData, setFormData] = useState({
    cliente: '',
    items: [{ descripcion: '', cantidad: 1, observaciones: '' }],
    fecha_entrega: new Date().toISOString().split('T')[0]
  });
  const [selectedNota, setSelectedNota] = useState(null);

  // Cargar notas cuando el componente monta
  useEffect(() => {
    if (user?.id) {
      // Las notas ya se cargan desde el contexto automáticamente
    }
  }, [user?.id]);

  // Verificar permiso premium
  if (!isPremium) {
    return (
      <Alert variant="warning" className="m-4">
        <strong>🔒 Funcionalidad Premium</strong>
        <p>Las notas de entrega están disponibles solo para usuarios Premium.</p>
      </Alert>
    );
  }

  const handleAddItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { descripcion: '', cantidad: 1, observaciones: '' }]
    });
  };

  const handleRemoveItem = (index) => {
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index)
    });
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = value;
    setFormData({ ...formData, items: newItems });
  };

  const handleCreateNota = async () => {
    if (!formData.cliente || formData.items.length === 0) {
      setAlerta({ type: "danger", message: "❌ Por favor completa los datos requeridos" });
      return;
    }

    const resultado = await crearNotaEntrega({
      cliente: formData.cliente,
      items: formData.items,
      numero_nota: `ENT-${Date.now()}`,
      observaciones: formData.observaciones || '',
      fecha_entrega: formData.fecha_entrega,
      estado: 'Pendiente'
    });

    if (resultado.success) {
      setAlerta({ type: "success", message: "✅ Nota de entrega creada exitosamente" });
      setFormData({
        cliente: '',
        items: [{ descripcion: '', cantidad: 1, observaciones: '' }],
        fecha_entrega: new Date().toISOString().split('T')[0]
      });
      setShowModal(false);
    } else {
      setAlerta({ type: "danger", message: "❌ Error al crear nota de entrega" });
    }
  };

  const exportarPDF = (nota) => {
    const element = document.getElementById(`nota-${nota.id}`);
    html2canvas(element).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF();
      const imgWidth = 190;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
      pdf.save(`nota-entrega-${nota.numero}.pdf`);
    });
  };

  return (
    <div className="container mt-4 mb-4">
      {alerta && (
        <Alert variant={alerta.type} onClose={() => setAlerta(null)} dismissible>
          {alerta.message}
        </Alert>
      )}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mantente-text-brown">📦 Notas de Entrega</h2>
        <Button 
          onClick={() => setShowModal(true)}
          style={{ backgroundColor: 'var(--mantente-brown)', borderColor: 'var(--mantente-brown)' }}
        >
          ➕ Nueva Nota
        </Button>
      </div>

      {/* Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Crear Nota de Entrega</Modal.Title>
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
              <Form.Label>Fecha de Entrega</Form.Label>
              <Form.Control
                type="date"
                value={formData.fecha_entrega}
                onChange={(e) => setFormData({ ...formData, fecha_entrega: e.target.value })}
              />
            </Form.Group>

            <h5 className="mt-4 mb-3">Artículos a Entregar</h5>
            {formData.items.map((item, index) => (
              <div key={index} className="card p-3 mb-3">
                <div className="row">
                  <div className="col-md-6">
                    <Form.Label>Descripción</Form.Label>
                    <Form.Control
                      value={item.descripcion}
                      onChange={(e) => handleItemChange(index, 'descripcion', e.target.value)}
                      placeholder="Descripción del producto"
                    />
                  </div>
                  <div className="col-md-3">
                    <Form.Label>Cantidad</Form.Label>
                    <Form.Control
                      type="number"
                      min="1"
                      value={item.cantidad}
                      onChange={(e) => handleItemChange(index, 'cantidad', parseInt(e.target.value))}
                    />
                  </div>
                  <div className="col-md-2">
                    <Button 
                      variant="danger" 
                      size="sm" 
                      onClick={() => handleRemoveItem(index)}
                      className="mt-4"
                    >
                      ✕
                    </Button>
                  </div>
                </div>
                <div className="mt-2">
                  <Form.Label>Observaciones</Form.Label>
                  <Form.Control
                    as="textarea"
                    value={item.observaciones}
                    onChange={(e) => handleItemChange(index, 'observaciones', e.target.value)}
                    placeholder="Observaciones sobre este artículo"
                    rows={2}
                  />
                </div>
              </div>
            ))}
            <Button 
              variant="secondary" 
              onClick={handleAddItem}
              className="mb-3"
            >
              ➕ Agregar artículo
            </Button>

            <Form.Group className="mb-3">
              <Form.Label>Observaciones Generales</Form.Label>
              <Form.Control
                as="textarea"
                value={formData.observaciones || ''}
                onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                placeholder="Observaciones generales sobre la entrega"
                rows={2}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={handleCreateNota}
            style={{ backgroundColor: 'var(--mantente-brown)', borderColor: 'var(--mantente-brown)' }}
          >
            Crear Nota
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Lista de notas */}
      {!notasEntrega || notasEntrega.length === 0 ? (
        <Alert variant="info">No hay notas de entrega aún. ¡Crea una!</Alert>
      ) : (
        <div className="table-responsive">
          <Table hover>
            <thead style={{ backgroundColor: 'rgba(166, 119, 41, 0.1)' }}>
              <tr>
                <th>Nº Nota</th>
                <th>Cliente</th>
                <th>Fecha</th>
                <th>Artículos</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {notasEntrega?.map((nota) => (
                <tr key={nota.id}>
                  <td><strong>{nota.numero_nota}</strong></td>
                  <td>{nota.cliente}</td>
                  <td>{nota.fecha_entrega}</td>
                  <td>{nota.items?.length || 0}</td>
                  <td>
                    <span className="badge" style={{ backgroundColor: nota.estado === 'Entregado' ? 'var(--mantente-taupe)' : 'var(--mantente-gold)' }}>
                      {nota.estado}
                    </span>
                  </td>
                  <td>
                    <Button 
                      size="sm" 
                      variant="secondary"
                      onClick={() => setSelectedNota(selectedNota?.id === nota.id ? null : nota)}
                    >
                      👁️
                    </Button>
                    <Button 
                      size="sm"
                      className="ms-2"
                      onClick={() => exportarPDF(nota)}
                    >
                      📥
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}

      {selectedNota && (
        <div id={`nota-${selectedNota.id}`} className="card mt-4 p-4" style={{ backgroundColor: '#f8f9fa' }}>
          <h5>Nota de Entrega #{selectedNota.numero_nota}</h5>
          <p><strong>Cliente:</strong> {selectedNota.cliente}</p>
          <p><strong>Fecha:</strong> {selectedNota.fecha_entrega}</p>
          <p><strong>Observaciones:</strong> {selectedNota.observaciones}</p>
          <Table striped size="sm">
            <thead>
              <tr>
                <th>Descripción</th>
                <th>Cantidad</th>
                <th>Observaciones</th>
              </tr>
            </thead>
            <tbody>
              {selectedNota.items?.map((item, idx) => (
                <tr key={idx}>
                  <td>{item.descripcion}</td>
                  <td>{item.cantidad}</td>
                  <td>{item.observaciones}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default NotasEntrega;