import React from 'react';
import { useAppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';

const Premium = () => {
  const { isPremium, setIsPremium } = useAppContext();
  const navigate = useNavigate();

  const handleActivatePremium = () => {
    // En una app real, aquí iría la lógica de pago (Stripe, etc.)
    // Para este demo, simplemente activamos el estado premium.
    setIsPremium(true);
    alert('¡Felicidades! Has activado la versión Premium. Los anuncios han sido eliminados y todas las funciones están desbloqueadas.');
    navigate('/'); // Redirige al Dashboard para ver los cambios
  };

  return (
    <div className="p-4 text-center">
      <div className="card mx-auto" style={{ maxWidth: '600px' }}>
        <div className="card-body">
          <h2 className="card-title">🚀 Desbloquea Mantente Premium 🚀</h2>
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
              <ul className="list-group list-group-flush mb-4">
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
    </div>
  );
};

export default Premium;