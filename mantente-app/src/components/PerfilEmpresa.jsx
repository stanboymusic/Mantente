import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { Card, Form, Button, Alert, Modal } from "react-bootstrap";

const PerfilEmpresa = ({ mostrarModal = false, onCerrar = null }) => {
  const { perfilEmpresa, guardarPerfilEmpresa, obtenerPerfilEmpresa } = useApp();
  const [showModal, setShowModal] = useState(mostrarModal);
  const [alerta, setAlerta] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const [formData, setFormData] = useState({
    nombre: "",
    direccion: "",
    telefono: "",
    email: "",
    identificacion_fiscal: "",
    logo_url: "",
  });

  // Cargar perfil existente
  useEffect(() => {
    cargarPerfil();
  }, []);

  const cargarPerfil = async () => {
    const resultado = await obtenerPerfilEmpresa();
    if (resultado.success && resultado.data) {
      setFormData(resultado.data);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setEnviando(true);

    if (!formData.nombre) {
      setAlerta({ type: "danger", message: "❌ El nombre de la empresa es obligatorio" });
      setEnviando(false);
      return;
    }

    const resultado = await guardarPerfilEmpresa(formData);
    if (resultado.success) {
      setAlerta({ type: "success", message: "✅ Perfil de empresa guardado exitosamente" });
      setTimeout(() => {
        if (onCerrar) onCerrar();
        setShowModal(false);
      }, 1500);
    } else {
      setAlerta({ type: "danger", message: "❌ " + resultado.message });
    }
    setEnviando(false);
  };

  const handleCloseModal = () => {
    if (mostrarModal === false) {
      setShowModal(false);
    }
  };

  // Si es modal obligatorio (registro)
  if (mostrarModal) {
    return (
      <Modal show={true} onHide={handleCloseModal} backdrop="static" keyboard={false} centered>
        <Modal.Header>
          <Modal.Title>🏢 Crear Perfil de Empresa</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="text-muted small mb-3">
            Completa la información de tu empresa. Esta se utilizará en las facturas y documentos.
          </p>
          <Form onSubmit={handleSubmit}>
            {alerta && (
              <Alert variant={alerta.type} onClose={() => setAlerta(null)} dismissible>
                {alerta.message}
              </Alert>
            )}

            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">Nombre de Empresa *</Form.Label>
              <Form.Control
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                placeholder="Ej: Mi Empresa S.A."
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">Identificación Fiscal (RUC, NIT, etc.) *</Form.Label>
              <Form.Control
                type="text"
                name="identificacion_fiscal"
                value={formData.identificacion_fiscal}
                onChange={handleChange}
                placeholder="Ej: 12345678-9"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="contacto@miempresa.com"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">Teléfono</Form.Label>
              <Form.Control
                type="tel"
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                placeholder="+123456789"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">Dirección</Form.Label>
              <Form.Control
                type="text"
                name="direccion"
                value={formData.direccion}
                onChange={handleChange}
                placeholder="Calle Principal 123, Ciudad"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">URL del Logo (Opcional)</Form.Label>
              <Form.Control
                type="url"
                name="logo_url"
                value={formData.logo_url}
                onChange={handleChange}
                placeholder="https://ejemplo.com/logo.png"
              />
            </Form.Group>

            <Button
              variant="primary"
              type="submit"
              className="w-100"
              disabled={enviando}
            >
              {enviando ? "Guardando..." : "✅ Guardar Perfil"}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    );
  }

  // Si es página de configuración
  return (
    <div className="container mt-4">
      {alerta && (
        <Alert variant={alerta.type} onClose={() => setAlerta(null)} dismissible>
          {alerta.message}
        </Alert>
      )}

      <Card className="shadow-lg border-0">
        <Card.Header className="bg-info text-white fw-bold">
          🏢 Perfil de la Empresa
        </Card.Header>
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">Nombre de Empresa *</Form.Label>
              <Form.Control
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                placeholder="Ej: Mi Empresa S.A."
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">Identificación Fiscal (RUC, NIT, etc.) *</Form.Label>
              <Form.Control
                type="text"
                name="identificacion_fiscal"
                value={formData.identificacion_fiscal}
                onChange={handleChange}
                placeholder="Ej: 12345678-9"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="contacto@miempresa.com"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">Teléfono</Form.Label>
              <Form.Control
                type="tel"
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                placeholder="+123456789"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">Dirección</Form.Label>
              <Form.Control
                type="text"
                name="direccion"
                value={formData.direccion}
                onChange={handleChange}
                placeholder="Calle Principal 123, Ciudad"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">URL del Logo (Opcional)</Form.Label>
              <Form.Control
                type="url"
                name="logo_url"
                value={formData.logo_url}
                onChange={handleChange}
                placeholder="https://ejemplo.com/logo.png"
              />
            </Form.Group>

            <Button
              variant="primary"
              type="submit"
              className="w-100 py-2"
              disabled={enviando}
            >
              {enviando ? "Guardando..." : "💾 Guardar Perfil"}
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
};

export default PerfilEmpresa;