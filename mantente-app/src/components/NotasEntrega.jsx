import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Alert, Button, Form, Table, Modal } from 'react-bootstrap';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const NotaEntregaPDF = ({ nota, perfilEmpresa }) => {
  const empresa = {
    nombre: nota?.empresa_nombre || perfilEmpresa?.nombre || 'Tu Empresa',
    identificacion_fiscal: nota?.empresa_ruc || perfilEmpresa?.identificacion_fiscal || '',
    email: nota?.empresa_email || perfilEmpresa?.email || '',
    telefono: nota?.empresa_telefono || perfilEmpresa?.telefono || '',
    direccion: nota?.empresa_direccion || perfilEmpresa?.direccion || '',
    logo_url: nota?.empresa_logo_url || perfilEmpresa?.logo_url || '',
  };

  let items = [];
  if (Array.isArray(nota?.items)) {
    items = nota.items;
  } else if (typeof nota?.items === 'string') {
    try {
      items = JSON.parse(nota.items) || [];
    } catch (e) {
      items = [];
    }
  }

  const fechaEntrega = nota?.fecha_entrega ? new Date(nota.fecha_entrega).toLocaleDateString() : '';

  return (
    <div
      style={{
        width: '800px',
        margin: '0 auto',
        backgroundColor: '#ffffff',
        padding: '32px',
        fontFamily: 'Arial, sans-serif',
        color: '#333333',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '2px solid #d9a441',
          paddingBottom: '16px',
          marginBottom: '24px',
        }}
      >
        <div>
          <h2 style={{ margin: 0, fontSize: '26px', color: '#a67729' }}>Nota de Entrega</h2>
          <p style={{ margin: '6px 0 0', fontSize: '12px', color: '#555555' }}>#{nota?.numero_nota || nota?.numero || nota?.id}</p>
          {nota?.estado && (
            <p style={{ margin: '6px 0 0', fontSize: '12px', color: '#555555', textTransform: 'capitalize' }}>Estado: {nota.estado}</p>
          )}
        </div>
        {empresa.logo_url && (
          <div style={{ textAlign: 'right' }}>
            <img
              src={empresa.logo_url}
              alt="Logo"
              style={{ maxHeight: '70px', objectFit: 'contain', marginBottom: '8px' }}
            />
          </div>
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div style={{ width: '48%' }}>
          <h3 style={{ margin: 0, fontSize: '14px', textTransform: 'uppercase', color: '#555555', letterSpacing: '1px' }}>Información del Negocio</h3>
          <p style={{ margin: '8px 0 0', fontSize: '13px', fontWeight: 'bold' }}>{empresa.nombre}</p>
          {empresa.identificacion_fiscal && (
            <p style={{ margin: '4px 0', fontSize: '12px' }}>Identificación Fiscal: {empresa.identificacion_fiscal}</p>
          )}
          {empresa.direccion && (
            <p style={{ margin: '4px 0', fontSize: '12px' }}>Dirección: {empresa.direccion}</p>
          )}
          {empresa.telefono && (
            <p style={{ margin: '4px 0', fontSize: '12px' }}>Teléfono: {empresa.telefono}</p>
          )}
          {empresa.email && (
            <p style={{ margin: '4px 0', fontSize: '12px' }}>Correo: {empresa.email}</p>
          )}
        </div>
        <div style={{ width: '48%' }}>
          <h3 style={{ margin: 0, fontSize: '14px', textTransform: 'uppercase', color: '#555555', letterSpacing: '1px' }}>Detalles de Entrega</h3>
          <p style={{ margin: '8px 0 0', fontSize: '12px' }}>Cliente: <span style={{ fontWeight: 'bold' }}>{nota?.cliente}</span></p>
          {fechaEntrega && (
            <p style={{ margin: '4px 0', fontSize: '12px' }}>Fecha de entrega: {fechaEntrega}</p>
          )}
          {nota?.observaciones && (
            <p style={{ margin: '4px 0', fontSize: '12px' }}>Observaciones: {nota.observaciones}</p>
          )}
        </div>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '24px' }}>
        <thead>
          <tr style={{ backgroundColor: 'rgba(166, 119, 41, 0.1)' }}>
            <th style={{ textAlign: 'left', padding: '12px', fontSize: '12px', border: '1px solid #dddddd' }}>Artículo</th>
            <th style={{ textAlign: 'center', padding: '12px', fontSize: '12px', border: '1px solid #dddddd', width: '80px' }}>Cantidad</th>
            <th style={{ textAlign: 'left', padding: '12px', fontSize: '12px', border: '1px solid #dddddd' }}>Observaciones</th>
          </tr>
        </thead>
        <tbody>
          {items.length > 0 ? (
            items.map((item, index) => (
              <tr key={index}>
                <td style={{ padding: '12px', fontSize: '12px', border: '1px solid #dddddd' }}>{item.descripcion}</td>
                <td style={{ padding: '12px', fontSize: '12px', border: '1px solid #dddddd', textAlign: 'center' }}>{item.cantidad}</td>
                <td style={{ padding: '12px', fontSize: '12px', border: '1px solid #dddddd' }}>{item.observaciones || ''}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="3" style={{ padding: '12px', fontSize: '12px', border: '1px solid #dddddd', textAlign: 'center', color: '#999999' }}>
                Sin artículos registrados
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <div style={{ fontSize: '11px', color: '#777777', textAlign: 'center' }}>
        <p style={{ margin: '6px 0' }}>Gracias por confiar en {empresa.nombre}</p>
        <p style={{ margin: '6px 0' }}>Documento generado el {new Date().toLocaleDateString()}</p>
      </div>
    </div>
  );
};

const NotasEntrega = () => {
  const { user, isPremium, notasEntrega, crearNotaEntrega, perfilEmpresa } = useApp();
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
      estado: 'Pendiente',
      empresa_nombre: perfilEmpresa?.nombre || '',
      empresa_ruc: perfilEmpresa?.identificacion_fiscal || '',
      empresa_email: perfilEmpresa?.email || '',
      empresa_telefono: perfilEmpresa?.telefono || '',
      empresa_direccion: perfilEmpresa?.direccion || '',
      empresa_logo_url: perfilEmpresa?.logo_url || ''
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

  const exportarPDF = async (nota) => {
    const element = document.getElementById(`nota-pdf-${nota.id}`);
    if (!element) {
      return;
    }

    const originalDisplay = element.style.display;
    const originalPosition = element.style.position;
    const originalTop = element.style.top;

    element.style.display = 'block';
    element.style.position = 'fixed';
    element.style.top = '-9999px';

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
    });

    element.style.display = originalDisplay;
    element.style.position = originalPosition;
    element.style.top = originalTop;

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const margin = 10;
    const imgWidth = pageWidth - margin * 2;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    pdf.addImage(imgData, 'PNG', margin, margin, imgWidth, imgHeight);
    const fileName = `nota-entrega-${nota.numero_nota || nota.numero || nota.id}.pdf`;
    pdf.save(fileName);
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
                  <td>{Array.isArray(nota.items) ? nota.items.length : (() => { try { const parsed = JSON.parse(nota.items || '[]'); return Array.isArray(parsed) ? parsed.length : 0; } catch (e) { return 0; } })()}</td>
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

      <div style={{ position: 'absolute', left: '-9999px', top: 0 }}>
        {notasEntrega?.map((nota) => (
          <div key={nota.id} id={`nota-pdf-${nota.id}`} style={{ display: 'none' }}>
            <NotaEntregaPDF nota={nota} perfilEmpresa={perfilEmpresa} />
          </div>
        ))}
      </div>

      {selectedNota && (
        <div className="card mt-4 p-4" style={{ backgroundColor: '#f8f9fa' }}>
          <NotaEntregaPDF nota={selectedNota} perfilEmpresa={perfilEmpresa} />
        </div>
      )}
    </div>
  );
};

export default NotasEntrega;