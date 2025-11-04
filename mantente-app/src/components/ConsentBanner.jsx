import React, { useState, useEffect } from "react";
import "./ConsentBanner.css";

const ConsentBanner = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [consent, setConsent] = useState({
    essential: true,
    analytics: false,
    advertising: false
  });

  useEffect(() => {
    const savedConsent = localStorage.getItem("cookieConsent");
    if (!savedConsent) {
      setShowBanner(true);
    }
  }, []);

  const handleAcceptAll = () => {
    const allConsent = {
      essential: true,
      analytics: true,
      advertising: true
    };
    localStorage.setItem("cookieConsent", JSON.stringify(allConsent));
    setShowBanner(false);
    enableAnalytics();
    enableAdvertising();
  };

  const handleRejectAll = () => {
    const minimalConsent = {
      essential: true,
      analytics: false,
      advertising: false
    };
    localStorage.setItem("cookieConsent", JSON.stringify(minimalConsent));
    setShowBanner(false);
  };

  const handleSavePreferences = () => {
    localStorage.setItem("cookieConsent", JSON.stringify(consent));
    setShowBanner(false);
    
    if (consent.analytics) {
      enableAnalytics();
    }
    if (consent.advertising) {
      enableAdvertising();
    }
  };

  const handleConsentChange = (type) => {
    setConsent(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };

  const enableAnalytics = () => {
    if (window.gtag) {
      window.gtag('consent', 'update', {
        'analytics_storage': 'granted'
      });
    }
  };

  const enableAdvertising = () => {
    if (window.gtag) {
      window.gtag('consent', 'update', {
        'ad_storage': 'granted',
        'ad_user_data': 'granted',
        'ad_personalization': 'granted'
      });
    }
  };

  if (!showBanner) {
    return null;
  }

  return (
    <div className="cookie-consent-overlay">
      <div className="cookie-consent-banner">
        <div className="cookie-consent-header">
          <h3>🍪 Política de Cookies</h3>
          <button 
            className="cookie-close-btn" 
            onClick={handleRejectAll}
            aria-label="Cerrar banner de cookies"
          >
            ✕
          </button>
        </div>

        {!showDetails ? (
          <div className="cookie-consent-main">
            <p className="cookie-consent-description">
              Utilizamos cookies para mejorar tu experiencia en Mantente. Algunas cookies son <strong>esenciales</strong> para 
              el funcionamiento de la aplicación, mientras que otras nos ayudan a <strong>analizar el uso</strong> y 
              <strong> personalizar anuncios</strong>.
            </p>

            <p className="cookie-consent-info">
              <a href="/cookies" target="_blank" rel="noopener noreferrer">
                Más información sobre nuestras cookies →
              </a>
            </p>

            <div className="cookie-consent-buttons">
              <button 
                className="btn btn-secondary"
                onClick={() => setShowDetails(true)}
              >
                ⚙️ Personalizar
              </button>
              <button 
                className="btn btn-danger"
                onClick={handleRejectAll}
              >
                Rechazar todo
              </button>
              <button 
                className="btn btn-primary"
                onClick={handleAcceptAll}
              >
                ✓ Aceptar todo
              </button>
            </div>
          </div>
        ) : (
          <div className="cookie-consent-details">
            <p className="cookie-consent-description">
              Personaliza qué cookies permitir. Las cookies esenciales siempre están habilitadas.
            </p>

            <div className="cookie-preference-item">
              <div className="cookie-preference-header">
                <label htmlFor="essential-checkbox" className="cookie-preference-label">
                  <strong>🔒 Cookies Esenciales</strong>
                </label>
                <input 
                  id="essential-checkbox"
                  type="checkbox" 
                  checked={consent.essential}
                  disabled
                  className="cookie-checkbox"
                />
              </div>
              <p className="cookie-preference-description">
                Necesarias para el funcionamiento básico de la aplicación. No se pueden desactivar.
              </p>
            </div>

            <div className="cookie-preference-item">
              <div className="cookie-preference-header">
                <label htmlFor="analytics-checkbox" className="cookie-preference-label">
                  <strong>📊 Cookies de Análisis</strong>
                </label>
                <input 
                  id="analytics-checkbox"
                  type="checkbox" 
                  checked={consent.analytics}
                  onChange={() => handleConsentChange('analytics')}
                  className="cookie-checkbox"
                />
              </div>
              <p className="cookie-preference-description">
                Nos ayudan a entender cómo utilizas la aplicación para mejorarla continuamente.
              </p>
            </div>

            <div className="cookie-preference-item">
              <div className="cookie-preference-header">
                <label htmlFor="advertising-checkbox" className="cookie-preference-label">
                  <strong>📢 Cookies de Publicidad</strong>
                </label>
                <input 
                  id="advertising-checkbox"
                  type="checkbox" 
                  checked={consent.advertising}
                  onChange={() => handleConsentChange('advertising')}
                  className="cookie-checkbox"
                />
              </div>
              <p className="cookie-preference-description">
                Permiten mostrar anuncios más relevantes basados en tus intereses y ubicación.
              </p>
            </div>

            <div className="cookie-consent-buttons">
              <button 
                className="btn btn-secondary"
                onClick={() => setShowDetails(false)}
              >
                ← Atrás
              </button>
              <button 
                className="btn btn-primary"
                onClick={handleSavePreferences}
              >
                ✓ Guardar Preferencias
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConsentBanner;
