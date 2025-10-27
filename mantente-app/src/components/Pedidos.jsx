import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Alert, Card, Button, Form, Table, Modal } from 'react-bootstrap';

const Pedidos = () => {
  const { user, isPremium, inventario, pedidos, crearPedido } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [alerta, setAlerta] = useState(null);
  const [formData, setFormData] = useState({
    cliente: '',
    items: [{ producto: '', cantidad: 1, precio_unitario: 0 }],
    fecha_entrega_estimada: '',
    observaciones: ''
  });

  // Cargar pedidos cuando el componente monta
  useEffect(() => {
    if (user?.id) {
      // Los pedidos ya se cargan desde el contexto automáticamente
    }
  }, [user?.id]);

  // Verificar permiso premium
  if (!isPremium) {
    return (
      <Alert variant="warning" className="m-4">
        <strong>🔒 Funcionalidad Premium</strong>
        <p>La gestión de pedidos está disponible solo para usuarios Premium.</p>
      </Alert>
    );
  }

  const handleAddItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { producto: '', cantidad: 1, precio_unitario: 0 }]
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

  const handleCreatePedido = async () => {
    if (!formData.cliente || formData.items.length === 0) {
      setAlerta({ type: "danger", message: "❌ Por favor completa los datos requeridos" });
      return;
    }

    const total = formData.items.reduce((sum, item) => sum + (item.cantidad * item.precio_unitario), 0);

    const resultado = await crearPedido({
      cliente: formData.cliente,
      items: formData.items,
      numero_pedido: `PED-${Date.now()}`,
      fecha_entrega_estimada: formData.fecha_entrega_estimada,
      observaciones: formData.observaciones || '',
      estado: 'Pendiente',
      total: total
    });

    if (resultado.success) {
      setAlerta({ type: "success", message: "✅ Pedido creado exitosamente" });
      setFormData({
        cliente: '',
        items: [{ producto: '', cantidad: 1, precio_unitario: 0 }],
        fecha_entrega_estimada: '',
        observaciones: ''
      });
      setShowModal(false);
    } else {
      setAlerta({ type: "danger", message: "❌ Error al crear pedido" });
    }
  };

  const estadoColors = {
    'Pendiente': 'var(--mantente-gold)',
    'Confirmado': 'var(--mantente-taupe)',
    'Enviado': '#007bff',
    'Entregado': 'var(--mantente-brown)'
  };

  return (
    <div className="container mt-4 mb-4">
      {alerta && (
        <Alert variant={alerta.type} onClose={() => setAlerta(null)} dismissible>
          {alerta.message}
        </Alert>
      )}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mantente-text-brown">📋 Pedidos</h2>
        <Button 
          onClick={() => setShowModal(true)}
          style={{ backgroundColor: 'var(--mantente-brown)', borderColor: 'var(--mantente-brown)' }}
        >
          ➕ Nuevo Pedido
        </Button>
      </div>

      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Crear Pedido</Modal.Title>
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
              <Form.Label>Fecha Est. Entrega</Form.Label>
              <Form.Control
                type="date"
                value={formData.fecha_entrega_estimada}
                onChange={(e) => setFormData({ ...formData, fecha_entrega_estimada: e.target.value })}
              />
            </Form.Group>

            <h5 className="mt-4 mb-3">Artículos del Pedido</h5>
            {formData.items.map((item, index) => (
              <div key={index} className="card p-3 mb-3">
                <div className="row">
                  <div className="col-md-5">
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
                  <div className="col-md-3">
                    <Form.Label>Cantidad</Form.Label>
                    <Form.Control
                      type="number"
                      min="1"
                      value={item.cantidad}
                      onChange={(e) => handleItemChange(index, 'cantidad', parseInt(e.target.value))}
                    />
                  </div>
                  <div className="col-md-3">
                    <Form.Label>Precio Unit.</Form.Label>
                    <Form.Control
                      type="number"
                      step="0.01"
                      value={item.precio_unitario}
                      onChange={(e) => handleItemChange(index, 'precio_unitario', parseFloat(e.target.value))}
                    />
                  </div>
                  <div className="col-md-1">
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
              <Form.Label>Observaciones</Form.Label>
              <Form.Control
                as="textarea"
                value={formData.observaciones}
                onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                placeholder="Observaciones especiales del pedido"
                rows={2}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancelar
          </Button>
          <Button onClick={handleCreatePedido} style={{ backgroundColor: 'var(--mantente-brown)', borderColor: 'var(--mantente-brown)' }}>
            Crear Pedido
          </Button>
        </Modal.Footer>
      </Modal>

      {!pedidos || pedidos.length === 0 ? (
        <Alert variant="info">No hay pedidos aún. ¡Crea uno!</Alert>
      ) : (
        <div className="table-responsive">
          <Table hover>
            <thead style={{ backgroundColor: 'rgba(166, 119, 41, 0.1)' }}>
              <tr>
                <th>Nº Pedido</th>
                <th>Cliente</th>
                <th>Artículos</th>
                <th>Total</th>
                <th>F. Entrega Est.</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {pedidos?.map((ped) => (
                <tr key={ped.id}>
                  <td><strong>{ped.numero_pedido}</strong></td>
                  <td>{ped.cliente}</td>
                  <td>{ped.items?.length || 0}</td>
                  <td>${ped.total ? ped.total.toFixed(2) : '0.00'}</td>
                  <td>{ped.fecha_entrega_estimada}</td>
                  <td>
                    <span className="badge" style={{ backgroundColor: estadoColors[ped.estado] || 'var(--mantente-gold)' }}>
                      {ped.estado}
                    </span>
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

export default Pedidos;