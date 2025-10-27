import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Alert, Card, Button, Form, Table, Modal } from 'react-bootstrap';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const Presupuestos = () => {
  const { user, isPremium, inventario, presupuestos, crearPresupuesto } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [alerta, setAlerta] = useState(null);
  const [formData, setFormData] = useState({
    cliente: '',
    items: [{ producto: '', cantidad: 1, precio_unitario: 0, descuento: 0 }],
    notas: '',
    vigencia_dias: 7
  });
  const [selectedPresupuesto, setSelectedPresupuesto] = useState(null);

  // Cargar presupuestos cuando el componente monta
  useEffect(() => {
    if (user?.id) {
      // Los presupuestos ya se cargan desde el contexto automáticamente
    }
  }, [user?.id]);

  // Verificar permiso premium
  if (!isPremium) {
    return (
      <Alert variant="warning" className="m-4">
        <strong>🔒 Funcionalidad Premium</strong>
        <p>Los presupuestos están disponibles solo para usuarios Premium.</p>
      </Alert>
    );
  }

  const handleAddItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { producto: '', cantidad: 1, precio_unitario: 0, descuento: 0 }]
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

  const handleCreatePresupuesto = async () => {
    if (!formData.cliente || formData.items.length === 0) {
      setAlerta({ type: "danger", message: "❌ Por favor completa los datos requeridos" });
      return;
    }

    // 🔧 Calcular totales
    const subtotal = formData.items.reduce((acc, item) => acc + (item.cantidad * item.precio_unitario), 0);
    const totalDescuentos = formData.items.reduce((acc, item) => acc + (item.descuento || 0), 0);
    const total = subtotal - totalDescuentos;

    const resultado = await crearPresupuesto({
      cliente: formData.cliente,
      items: formData.items,
      subtotal,
      descuento: totalDescuentos,
      impuestos: 0,
      total,
      notas: formData.notas,
      vigencia_dias: formData.vigencia_dias,
      estado: "pendiente"
    });

    if (resultado.success) {
      setAlerta({ type: "success", message: "✅ Presupuesto creado exitosamente" });
      setFormData({
        cliente: '',
        items: [{ producto: '', cantidad: 1, precio_unitario: 0, descuento: 0 }],
        notas: '',
        vigencia_dias: 7
      });
      setShowModal(false);
    } else {
      setAlerta({ type: "danger", message: "❌ Error al crear presupuesto" });
    }
  };

  const calcularTotal = (items) => {
    return items.reduce((total, item) => {
      const subtotal = item.cantidad * item.precio_unitario;
      return total + (subtotal - item.descuento);
    }, 0);
  };

  const exportarPDF = (presupuesto) => {
    const element = document.getElementById(`presupuesto-${presupuesto.id}`);
    html2canvas(element).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF();
      const imgWidth = 190;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
      pdf.save(`presupuesto-${presupuesto.id}.pdf`);
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
        <h2 className="mantente-text-brown">💰 Presupuestos</h2>
        <Button 
          onClick={() => setShowModal(true)}
          style={{ backgroundColor: 'var(--mantente-brown)', borderColor: 'var(--mantente-brown)' }}
        >
          ➕ Nuevo Presupuesto
        </Button>
      </div>

      {/* Modal de creación */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Crear Presupuesto</Modal.Title>
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
              <Form.Label>Vigencia (días)</Form.Label>
              <Form.Control
                type="number"
                value={formData.vigencia_dias}
                onChange={(e) => setFormData({ ...formData, vigencia_dias: parseInt(e.target.value) })}
              />
            </Form.Group>

            <h5 className="mt-4 mb-3">Artículos</h5>
            {formData.items.map((item, index) => (
              <div key={index} className="card p-3 mb-3">
                <div className="row">
                  <div className="col-md-4">
                    <Form.Label>Producto</Form.Label>
                    <Form.Select
                      value={item.producto}
                      onChange={(e) => {
                        const prod = inventario.find(p => p.nombre === e.target.value);
                        handleItemChange(index, 'producto', e.target.value);
                        if (prod) handleItemChange(index, 'precio_unitario', prod.precio);
                      }}
                    >
                      <option>Seleccionar...</option>
                      {inventario.map((prod) => (
                        <option key={prod.id}>{prod.nombre}</option>
                      ))}
                    </Form.Select>
                  </div>
                  <div className="col-md-2">
                    <Form.Label>Cantidad</Form.Label>
                    <Form.Control
                      type="number"
                      min="1"
                      value={item.cantidad}
                      onChange={(e) => handleItemChange(index, 'cantidad', parseInt(e.target.value))}
                    />
                  </div>
                  <div className="col-md-2">
                    <Form.Label>Precio</Form.Label>
                    <Form.Control
                      type="number"
                      step="0.01"
                      value={item.precio_unitario}
                      onChange={(e) => handleItemChange(index, 'precio_unitario', parseFloat(e.target.value))}
                    />
                  </div>
                  <div className="col-md-2">
                    <Form.Label>Descuento</Form.Label>
                    <Form.Control
                      type="number"
                      step="0.01"
                      value={item.descuento}
                      onChange={(e) => handleItemChange(index, 'descuento', parseFloat(e.target.value))}
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
              <Form.Label>Notas</Form.Label>
              <Form.Control
                as="textarea"
                value={formData.notas}
                onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
                placeholder="Notas adicionales para el cliente"
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={handleCreatePresupuesto}
            style={{ backgroundColor: 'var(--mantente-brown)', borderColor: 'var(--mantente-brown)' }}
          >
            Crear Presupuesto
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Lista de presupuestos */}
      {presupuestos.length === 0 ? (
        <Alert variant="info">No hay presupuestos aún. ¡Crea uno!</Alert>
      ) : (
        <div className="row">
          {presupuestos.map((presupuesto) => (
            <div key={presupuesto.id} className="col-md-6 mb-3">
              <Card>
                <Card.Body>
                  <Card.Title>{presupuesto.cliente}</Card.Title>
                  <Card.Subtitle className="mb-2 text-muted">
                    {presupuesto.fecha} • {presupuesto.estado}
                  </Card.Subtitle>
                  <p><strong>Items:</strong> {presupuesto.items.length}</p>
                  <p><strong>Total:</strong> ${calcularTotal(presupuesto.items).toFixed(2)}</p>
                  <div className="d-flex gap-2">
                    <Button 
                      size="sm"
                      onClick={() => exportarPDF(presupuesto)}
                    >
                      📥 PDF
                    </Button>
                    <Button 
                      size="sm" 
                      variant="secondary"
                      onClick={() => setSelectedPresupuesto(selectedPresupuesto?.id === presupuesto.id ? null : presupuesto)}
                    >
                      👁️ Ver
                    </Button>
                  </div>
                </Card.Body>
              </Card>
              {selectedPresupuesto?.id === presupuesto.id && (
                <div id={`presupuesto-${presupuesto.id}`} className="p-3 mt-2" style={{ backgroundColor: '#f8f9fa' }}>
                  <h5>{presupuesto.cliente}</h5>
                  <p><small>Fecha: {presupuesto.fecha} • Vigencia: {presupuesto.vigencia_dias} días</small></p>
                  <Table striped size="sm">
                    <thead>
                      <tr>
                        <th>Producto</th>
                        <th>Cantidad</th>
                        <th>Precio</th>
                        <th>Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {presupuesto.items.map((item, idx) => (
                        <tr key={idx}>
                          <td>{item.producto}</td>
                          <td>{item.cantidad}</td>
                          <td>${item.precio_unitario.toFixed(2)}</td>
                          <td>${(item.cantidad * item.precio_unitario - item.descuento).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                  <h6 className="text-end">Total: ${calcularTotal(presupuesto.items).toFixed(2)}</h6>
                  {presupuesto.notas && <p><small><strong>Notas:</strong> {presupuesto.notas}</small></p>}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Presupuestos;