import React, { useState } from 'react';
import { Modal, Button, Card } from 'react-bootstrap';
import Tutorial from './Tutorial';

const HelpIcon = () => {
  const [showTutorial, setShowTutorial] = useState(false);
  const [showInfografia, setShowInfografia] = useState(false);

  const handleTutorialComplete = () => {
    setShowTutorial(false);
  };

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
    <>
      {/* Icono de ayuda flotante */}
      <div
        className="help-icon-container"
        onClick={() => setShowInfografia(true)}
        title="Ayuda y Tutorial"
      >
        <div className="help-icon">
          <span className="help-icon-emoji">❓</span>
        </div>
      </div>

      {/* Modal de opciones de ayuda */}
      <Modal
        show={showInfografia}
        onHide={() => setShowInfografia(false)}
        centered
        size="lg"
      >
        <Modal.Header closeButton className="bg-warning">
          <Modal.Title>
            <span className="elegant-icon">💡</span> Centro de Ayuda - Mantente
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="text-center mb-4">
            <p className="text-muted">¿Qué deseas hacer?</p>
          </div>

          <div className="d-flex gap-3 justify-content-center">
            <Button
              variant="primary"
              size="lg"
              onClick={() => {
                setShowInfografia(false);
                setShowTutorial(true);
              }}
              className="d-flex align-items-center gap-2"
            >
              <span>📚</span>
              Repasar Tutorial
            </Button>

            <Button
              variant="outline-primary"
              size="lg"
              onClick={() => setShowInfografia(false)}
              className="d-flex align-items-center gap-2"
            >
              <span>📖</span>
              Ver Funciones
            </Button>
          </div>

          {/* Infografía de funciones */}
          <div className="features-grid mt-4">
            <h5 className="text-center mb-3">Funciones Principales de Mantente</h5>
            {features.map((feature, index) => (
              <Card key={index} className="feature-card-small">
                <Card.Body className="text-center p-3">
                  <div className="feature-icon-small">{feature.icon}</div>
                  <h6 className="feature-title-small">{feature.title}</h6>
                  <p className="feature-description-small mb-0">{feature.description}</p>
                </Card.Body>
              </Card>
            ))}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowInfografia(false)}>
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Tutorial Modal */}
      {showTutorial && (
        <Tutorial onComplete={handleTutorialComplete} />
      )}
    </>
  );
};

export default HelpIcon;