import React, { useState } from 'react';
import { useApp } from "../context/AppContext";
import { useNavigate } from 'react-router-dom';

const Premium = () => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [isPremium] = useState(false); // Simulación de estado premium

  const handleActivatePremium = () => {
    setShowModal(true);
  };

  const confirmActivation = () => {
    // En una app real, aquí iría la lógica de pago (Stripe, etc.)
    setShowModal(false);
    // Redirigimos al Dashboard para ver los cambios
    navigate('/'); 
  };
  
  // Renderizado del Modal de Confirmación
  const PremiumModal = () => (
      <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                  <div className="modal-header bg-primary text-white">
                      <h5 className="modal-title">Confirmación Premium</h5>
                  </div>
                  <div className="modal-body">
                      <p>Estás a punto de simular la activación de la cuenta Premium.</p>
                      <p>¿Deseas continuar y desbloquear todas las funciones?</p>
                  </div>
                  <div className="modal-footer">
                      <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                          Cancelar
                      </button>
                      <button type="button" className="btn btn-primary" onClick={confirmActivation}>
                          Confirmar Activación
                      </button>
                  </div>
              </div>
          </div>
      </div>
  );

  return (
    <div className="p-4 text-center">
      <div className="card mx-auto shadow-lg" style={{ maxWidth: '600px' }}>
        <div className="card-body">
          <h2 className="card-title text-primary">🚀 Desbloquea Mantente Premium 🚀</h2>
          {isPremium ? (
            <div className="alert alert-success">
              <h4>¡Ya eres Premium!</h4>
              <p>Gracias por tu apoyo. Disfruta de todas las funcionalidades sin interrupciones.</p>
            </div>
          ) : (
            <>
              <p className="card-text">
                Obtén acceso completo a todas las características de Mantente y mejora tu gestión.
              </p>
              <ul className="list-group list-group-flush mb-4 text-start">
                <li className="list-group-item">✅ <strong>Cero Anuncios:</strong> Una experiencia limpia y sin distracciones.</li>
                <li className="list-group-item">✅ <strong>Alertas de Stock Bajo:</strong> Recibe notificaciones visuales automáticas.</li>
                <li className="list-group-item">✅ <strong>Creación de Ofertas:</strong> Genera descuentos temporales para tus productos.</li>
                <li className="list-group-item">✅ <strong>Exportación de Reportes:</strong> Descarga tus datos en formatos PDF/CSV (función futura).</li>
              </ul>
              <button 
                className="btn btn-primary btn-lg w-100"
                onClick={handleActivatePremium}
              >
                Activar Premium Ahora (Simulación)
              </button>
            </>
          )}
        </div>
      </div>
      {showModal && <PremiumModal />}
    </div>
  );
};

export default Premium;