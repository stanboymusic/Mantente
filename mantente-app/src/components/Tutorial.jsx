import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Modal, Button, Card, ProgressBar } from 'react-bootstrap';
import { pb } from '../pocketbase';
import './Tutorial.css';

const Tutorial = ({ onComplete }) => {
  const navigate = useNavigate();
  const { user, perfilEmpresa, guardarPerfilEmpresa, garantizarMesAbierto, guardarGastosFijos, markTutorialCompleted } = useApp();
  const [currentStep, setCurrentStep] = useState(0);
  const [showInfografia, setShowInfografia] = useState(false);
  const [perfilForm, setPerfilForm] = useState({
    nombre_negocio: '',
    nit: '',
    email: '',
    telefono: '',
    direccion: ''
  });
  const [gastosFijos, setGastosFijos] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const steps = [
    {
      title: '🏢 Configura tu Perfil de Empresa',
      description: 'Antes de comenzar, necesitamos configurar la información básica de tu negocio.',
      content: 'Completa los campos obligatorios para generar facturas legales y mantener tu información organizada.',
      action: 'Ir al Perfil de Empresa'
    },
    {
      title: '📅 Abre tu Mes Contable',
      description: 'Es hora de abrir el mes contable actual para comenzar a registrar tus operaciones.',
      content: 'Esto te permitirá controlar tus ingresos, egresos y balance mensual de manera organizada.',
      action: 'Abrir Mes Contable'
    },
    {
      title: '💰 Configura Gastos Fijos Mensuales',
      description: 'Define tus gastos fijos mensuales para un mejor control financiero.',
      content: 'Estos gastos se restarán automáticamente de tus ingresos para calcular tu balance real.',
      action: 'Configurar Gastos Fijos'
    }
  ];

  useEffect(() => {
    if (perfilEmpresa) {
      setPerfilForm({
        nombre_negocio: perfilEmpresa.nombre_negocio || '',
        nit: perfilEmpresa.nit || '',
        email: perfilEmpresa.email || '',
        telefono: perfilEmpresa.telefono || '',
        direccion: perfilEmpresa.direccion || ''
      });
    }
  }, [perfilEmpresa]);

  const handleNext = async () => {
    setIsLoading(true);

    try {
      if (currentStep === 0) {
        // Validar y guardar perfil de empresa
        if (!perfilForm.nombre_negocio || !perfilForm.nit) {
          alert('Por favor completa al menos el nombre del negocio y el NIT/RUC.');
          setIsLoading(false);
          return;
        }

        const result = await guardarPerfilEmpresa(perfilForm);
        if (!result.success) {
          alert('Error al guardar el perfil: ' + result.message);
          setIsLoading(false);
          return;
        }

        // Navegar al perfil de empresa
        navigate('/perfil-empresa');
        setTimeout(() => setCurrentStep(1), 1000);

      } else if (currentStep === 1) {
        // Abrir mes contable
        const result = await garantizarMesAbierto();
        if (!result.success) {
          alert('Error al abrir el mes contable: ' + result.message);
          setIsLoading(false);
          return;
        }

        // Navegar a apertura de mes
        navigate('/apertura-mes');
        setTimeout(() => setCurrentStep(2), 1000);

      } else if (currentStep === 2) {
        // Configurar gastos fijos
        const monto = parseFloat(gastosFijos) || 0;
        if (monto < 0) {
          alert('El monto no puede ser negativo.');
          setIsLoading(false);
          return;
        }

        guardarGastosFijos(monto);

        // Completar tutorial - mostrar infografía directamente
        setTimeout(() => {
          setShowInfografia(true);
        }, 1000);
      }
    } catch (error) {
      console.error('Error en el paso del tutorial:', error);
      alert('Ocurrió un error. Por favor intenta nuevamente.');
    }

    setIsLoading(false);
  };

  const handleCompleteTutorial = async () => {
    try {
      // Marcar tutorial como completado usando la función del contexto
      await markTutorialCompleted(user.id);

      // Navegar al dashboard principal
      navigate('/');

      onComplete();
    } catch (error) {
      console.error('Error al completar tutorial:', error);
      // Fallback: marcar en localStorage y estado
      localStorage.setItem(`tutorial_completed_${user.id}`, 'true');
      navigate('/');
      onComplete();
    }
  };

  const progress = ((currentStep + 1) / steps.length) * 100;

  if (showInfografia) {
    return <Infografia onClose={handleCompleteTutorial} />;
  }

  return (
    <Modal
      show={true}
      fullscreen={true}
      backdrop="static"
      keyboard={false}
      className="tutorial-modal"
    >
      <Modal.Body className="tutorial-body">
        <div className="tutorial-container">
          {/* Header con progreso */}
          <div className="tutorial-header">
            <div className="tutorial-progress">
              <div className="progress-info">
                <span className="step-counter">Paso {currentStep + 1} de {steps.length}</span>
                <span className="progress-text">{Math.round(progress)}% completado</span>
              </div>
              <ProgressBar
                now={progress}
                className="tutorial-progress-bar"
                animated
              />
            </div>
          </div>

          {/* Contenido del paso actual */}
          <div className="tutorial-content">
            <div className="step-card">
              <div className="step-icon">
                {currentStep === 0 && '🏢'}
                {currentStep === 1 && '📅'}
                {currentStep === 2 && '💰'}
              </div>

              <h2 className="step-title">{steps[currentStep].title}</h2>
              <p className="step-description">{steps[currentStep].description}</p>
              <p className="step-content">{steps[currentStep].content}</p>

              {/* Formularios específicos por paso */}
              {currentStep === 0 && (
                <div className="perfil-form">
                  <div className="form-row">
                    <div className="form-group">
                      <label>Nombre del Negocio *</label>
                      <input
                        type="text"
                        value={perfilForm.nombre_negocio}
                        onChange={(e) => setPerfilForm({...perfilForm, nombre_negocio: e.target.value})}
                        placeholder="Ej: Mi Tienda Online"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>RUC/Cédula/NIT *</label>
                      <input
                        type="text"
                        value={perfilForm.nit}
                        onChange={(e) => setPerfilForm({...perfilForm, nit: e.target.value})}
                        placeholder="Ej: 123456789"
                        required
                      />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Email</label>
                      <input
                        type="email"
                        value={perfilForm.email}
                        onChange={(e) => setPerfilForm({...perfilForm, email: e.target.value})}
                        placeholder="empresa@email.com"
                      />
                    </div>
                    <div className="form-group">
                      <label>Teléfono</label>
                      <input
                        type="tel"
                        value={perfilForm.telefono}
                        onChange={(e) => setPerfilForm({...perfilForm, telefono: e.target.value})}
                        placeholder="+123456789"
                      />
                    </div>
                  </div>
                  <div className="form-group full-width">
                    <label>Dirección</label>
                    <input
                      type="text"
                      value={perfilForm.direccion}
                      onChange={(e) => setPerfilForm({...perfilForm, direccion: e.target.value})}
                      placeholder="Dirección completa"
                    />
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="gastos-form">
                  <div className="form-group">
                    <label>Gastos Fijos Mensuales ($)</label>
                    <input
                      type="number"
                      value={gastosFijos}
                      onChange={(e) => setGastosFijos(e.target.value)}
                      placeholder="Ej: 1000"
                      min="0"
                      step="0.01"
                    />
                    <small className="form-help">
                      Incluye alquiler, servicios, salarios fijos, etc.
                    </small>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer con botón de acción */}
          <div className="tutorial-footer">
            <Button
              className="tutorial-btn-next"
              onClick={handleNext}
              disabled={isLoading}
              size="lg"
            >
              {isLoading ? 'Procesando...' : steps[currentStep].action}
              {!isLoading && <span className="btn-arrow">→</span>}
            </Button>
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
};

// Componente Infografía
const Infografia = ({ onClose }) => {
  const features = [
    {
      icon: '📊',
      title: 'Dashboard',
      description: 'Panel principal con resumen de ingresos, egresos, balance y métricas clave.'
    },
    {
      icon: '📦',
      title: 'Inventario',
      description: 'Gestiona tus productos, controla stock y precios de venta.'
    },
    {
      icon: '💰',
      title: 'Ventas',
      description: 'Registra ventas, genera facturas y controla ingresos.'
    },
    {
      icon: '👥',
      title: 'Clientes',
      description: 'Administra información de clientes y historial de compras.'
    },
    {
      icon: '📄',
      title: 'Facturas',
      description: 'Crea facturas profesionales con datos fiscales.'
    },
    {
      icon: '💸',
      title: 'Egresos',
      description: 'Registra gastos operativos y controla costos.'
    },
    {
      icon: '📅',
      title: 'Cierre de Mes',
      description: 'Genera reportes mensuales y controla balance.'
    },
    {
      icon: '🏢',
      title: 'Perfil Empresa',
      description: 'Configura información fiscal y datos de tu negocio.'
    }
  ];

  return (
    <Modal
      show={true}
      fullscreen={true}
      backdrop="static"
      keyboard={false}
      className="infografia-modal"
    >
      <Modal.Body className="infografia-body">
        <div className="infografia-container">
          <div className="infografia-header">
            <h1>🎉 ¡Bienvenido a Mantente!</h1>
            <p className="infografia-subtitle">
              Conoce las funciones principales de tu nueva herramienta de gestión financiera
            </p>
          </div>

          <div className="features-grid">
            {features.map((feature, index) => (
              <Card key={index} className="feature-card">
                <Card.Body className="text-center">
                  <div className="feature-icon">{feature.icon}</div>
                  <h5 className="feature-title">{feature.title}</h5>
                  <p className="feature-description">{feature.description}</p>
                </Card.Body>
              </Card>
            ))}
          </div>

          <div className="infografia-footer">
            <p className="help-text">
              💡 Puedes acceder a esta guía en cualquier momento desde el icono de ayuda (?)
              en la esquina inferior derecha del dashboard.
            </p>
            <Button
              className="infografia-btn-close"
              onClick={onClose}
              size="lg"
            >
              ¡Comenzar a usar Mantente! 🚀
            </Button>
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default Tutorial;