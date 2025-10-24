import React, { useState, useEffect, useRef } from 'react';
import { useApp } from "../context/AppContext";
import { useNavigate } from 'react-router-dom';
import { Alert } from 'react-bootstrap';

const Premium = () => {
  const navigate = useNavigate();
  const { user, isPremium, premiumData, purchasePremium, cancelPremium } = useApp();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [activeAccordion, setActiveAccordion] = useState(null);
  const paypalContainerRef = useRef(null);
  const paypalButtonsRef = useRef(null);

  // Cargar PayPal cuando el componente se monta y el usuario NO es Premium
  useEffect(() => {
    // Solo renderizar PayPal si:
    // 1. El usuario NO es Premium
    // 2. PayPal SDK está disponible
    // 3. El contenedor existe en el DOM
    if (isPremium) {
      // Si el usuario ES Premium, no renderizar PayPal
      return;
    }

    if (!window.paypal) {
      console.warn("PayPal SDK no está disponible aún");
      return;
    }

    // Esperar un tick de React para asegurar que el DOM se ha actualizado
    const timeoutId = setTimeout(() => {
      if (paypalContainerRef.current && document.getElementById("paypal-container")) {
        renderPayPalButtons();
      }
    }, 0);

    return () => {
      clearTimeout(timeoutId);
      // Limpiar referencia anterior si existe
      if (paypalButtonsRef.current) {
        paypalButtonsRef.current = null;
      }
    };
  }, [isPremium]);

  const renderPayPalButtons = () => {
    if (!window.paypal) {
      setError("PayPal no se cargó correctamente");
      return;
    }

    // Verificar que el contenedor existe y está en el DOM
    const container = document.getElementById("paypal-container");
    if (!container || !container.isConnected) {
      console.warn("Contenedor PayPal no encontrado o no está en el DOM");
      return;
    }

    try {
      // Limpiar botones anteriores si existen
      container.innerHTML = "";
      paypalButtonsRef.current = null;

      window.paypal
        .Buttons({
          // Configuración para suscripción
          createSubscription: (data, actions) => {
            return actions.subscription.create({
              plan_id: "P-2SA90542VX213921XND4XZUA", // Plan ID de PayPal
              custom_id: user?.id,
              description: "Mantente Premium - Suscripción Mensual ($70 USD)",
            });
          },
          onInit: (data, actions) => {
            // Si no puedes comprar, desactiva el botón
            if (!user?.id) {
              actions.disable();
            }
          },
          // Cuando se completa la suscripción
          onApprove: async (data, actions) => {
            try {
              setLoading(true);
              setError(null);

              // Guardar la suscripción en Supabase
              const result = await purchasePremium(data.subscriptionID, data);

              if (result.success) {
                setMessage("¡Bienvenido a Premium! 🎉 Tu suscripción está activa.");
                setTimeout(() => {
                  navigate("/dashboard");
                }, 2000);
              } else {
                setError(result.message || "Error al procesar la suscripción");
              }
            } catch (err) {
              setError("Error al procesar: " + err.message);
            } finally {
              setLoading(false);
            }
          },
          // Errores
          onError: (err) => {
            setError("Error en PayPal: " + err.message);
            console.error("PayPal error:", err);
          },
          // Si cancela
          onCancel: () => {
            setMessage("Compra cancelada");
          },
        })
        .render("#paypal-container")
        .catch((err) => {
          console.error("Error renderizando PayPal buttons:", err);
          setError("No se pudo cargar los botones de PayPal");
        });
    } catch (err) {
      console.error("Error en renderPayPalButtons:", err);
      setError("Error al cargar PayPal");
    }
  };

  const handleCancelSubscription = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await cancelPremium();
      if (result.success) {
        setMessage("Suscripción cancelada. Tendrás acceso hasta el final del período actual.");
        setShowCancelConfirm(false);
        setTimeout(() => navigate("/"), 2000);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError("Error al cancelar: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const PremiumBenefits = () => (
    <div className="mb-4">
      <h4 className="mantente-text-gold mb-3">✨ Beneficios de Premium</h4>
      <ul className="list-group list-group-flush">
        <li className="list-group-item">
          <strong className="mantente-text-brown">🚫 Cero Anuncios:</strong> Disfruta de una experiencia completamente limpia y sin distracciones
        </li>
        <li className="list-group-item">
          <strong className="mantente-text-brown">📢 Alertas de Stock Bajo:</strong> Recibe notificaciones visuales automáticas cuando el inventario se agota
        </li>
        <li className="list-group-item">
          <strong className="mantente-text-brown">🎁 Creación de Ofertas:</strong> Genera descuentos temporales personalizados para tus productos
        </li>
        <li className="list-group-item">
          <strong className="mantente-text-brown">📊 Reportes Avanzados:</strong> Acceso a análisis detallados y exportación de datos (PDF/CSV)
        </li>
        <li className="list-group-item">
          <strong className="mantente-text-brown">🎨 Estadísticas en Tiempo Real:</strong> Dashboards más detallados y visualización mejorada
        </li>
        <li className="list-group-item">
          <strong className="mantente-text-brown">💪 Soporte Prioritario:</strong> Ayuda rápida y asistencia técnica dedicada
        </li>
        <li className="list-group-item">
          <strong className="mantente-text-brown">❤️ Principalmente para apoyar al creador:</strong> Tu contribución ayuda a mantener y mejorar Mantente
        </li>
      </ul>
    </div>
  );

  return (
    <div className="p-4">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="card shadow-lg" style={{ borderColor: 'var(--mantente-gold)', borderWidth: '1px', borderStyle: 'solid' }}>
              <div className="card-body">
                <h1 className="card-title text-center mantente-text-gold mb-2">🚀 Mantente Premium</h1>
                <p className="text-center text-muted mb-4">
                  Desbloquea todas las funciones y apoya al creador
                </p>

                {/* Alertas de estado */}
                {error && (
                  <Alert variant="danger" onClose={() => setError(null)} dismissible>
                    {error}
                  </Alert>
                )}
                {message && (
                  <Alert variant="success" onClose={() => setMessage(null)} dismissible>
                    {message}
                  </Alert>
                )}

                {/* Si ya es Premium */}
                {isPremium && premiumData ? (
                  <div>
                    <div className="alert mb-4" style={{ backgroundColor: 'rgba(166, 119, 41, 0.15)', color: 'var(--mantente-brown)', border: '1px solid var(--mantente-brown)' }}>
                      <h4 className="alert-heading">✅ ¡Eres Premium!</h4>
                      <p className="mb-0">
                        Gracias por tu apoyo. Disfruta de todas las funcionalidades sin interrupciones.
                      </p>
                    </div>

                    <PremiumBenefits />

                    {/* Información de suscripción */}
                    <div className="card mb-4" style={{ backgroundColor: 'rgba(226, 181, 78, 0.05)' }}>
                      <div className="card-body">
                        <h6 className="card-subtitle mb-2 mantente-text-brown">Detalles de tu suscripción</h6>
                        <p className="mb-1">
                          <strong>Estado:</strong>{" "}
                          <span className="badge" style={{ backgroundColor: 'var(--mantente-taupe)', color: 'white' }}>Activo</span>
                        </p>
                        <p className="mb-1">
                          <strong>Próxima renovación:</strong>{" "}
                          {premiumData?.current_period_end
                            ? new Date(premiumData.current_period_end).toLocaleDateString(
                                "es-ES",
                                { year: "numeric", month: "long", day: "numeric" }
                              )
                            : "No disponible"}
                        </p>
                        <p className="mb-0">
                          <strong>Monto mensual:</strong> $70.00 USD
                        </p>
                      </div>
                    </div>

                    {/* Botón para cancelar */}
                    {showCancelConfirm ? (
                      <div className="alert" style={{ backgroundColor: 'rgba(226, 181, 78, 0.15)', color: 'var(--mantente-dark-gray)', border: '1px solid var(--mantente-gold)' }}>
                        <p className="mb-2">¿Seguro que deseas cancelar tu suscripción?</p>
                        <div className="d-flex gap-2">
                          <button
                            className="btn btn-sm"
                            onClick={handleCancelSubscription}
                            disabled={loading}
                            style={{ backgroundColor: 'var(--mantente-dark-gray)', color: 'white' }}
                          >
                            {loading ? "Cancelando..." : "Sí, cancelar"}
                          </button>
                          <button
                            className="btn btn-sm"
                            onClick={() => setShowCancelConfirm(false)}
                            disabled={loading}
                            style={{ backgroundColor: 'var(--mantente-taupe)', color: 'white' }}
                          >
                            No, mantener
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        className="btn w-100"
                        onClick={() => setShowCancelConfirm(true)}
                        disabled={loading}
                        style={{ 
                          backgroundColor: 'transparent', 
                          color: 'var(--mantente-dark-gray)', 
                          borderColor: 'var(--mantente-dark-gray)',
                          borderWidth: '1px',
                          borderStyle: 'solid'
                        }}
                      >
                        Cancelar Suscripción
                      </button>
                    )}
                  </div>
                ) : (
                  /* Si NO es Premium - Mostrar opción de compra */
                  <div>
                    <PremiumBenefits />

                    {/* Precio */}
                    <div className="text-center mb-4">
                      <div className="mantente-bg-gold text-dark p-4 rounded">
                        <h2 className="mb-0">$70</h2>
                        <p className="mb-0 small">USD por mes</p>
                      </div>
                    </div>

                    {/* PayPal Button Container */}
                    <div
                      ref={paypalContainerRef}
                      id="paypal-container"
                      className="mb-3"
                      style={{
                        minHeight: "60px",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center"
                      }}
                    >
                      {/* Los botones de PayPal se renderizarán aquí */}
                      {loading && (
                        <div className="spinner-border mantente-text-gold" role="status">
                          <span className="visually-hidden">Cargando...</span>
                        </div>
                      )}
                    </div>

                    {/* Información de seguridad */}
                    <div className="alert small" role="alert" style={{ backgroundColor: 'rgba(102, 86, 68, 0.1)', color: 'var(--mantente-taupe)', border: '1px solid var(--mantente-taupe)' }}>
                      <strong>🔒 Seguro:</strong> Tu información de pago está completamente
                      protegida. Utilizamos PayPal, el procesador de pagos más confiable del mundo.
                    </div>

                    {/* Términos */}
                    <p className="text-center small text-muted mt-3">
                      Al hacer clic en "Comprar", aceptas que se te cobre $70 USD cada mes. Puedes
                      cancelar en cualquier momento desde esta página.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Preguntas frecuentes */}
            <div className="card mt-4 shadow-sm">
              <div className="card-header" style={{ backgroundColor: 'rgba(226, 181, 78, 0.1)' }}>
                <h6 className="mb-0 mantente-text-brown">❓ Preguntas Frecuentes</h6>
              </div>
              <div className="card-body" style={{ padding: '1rem' }}>
                <div className="accordion" id="faqAccordion">
                  <div className="accordion-item">
                    <h2 className="accordion-header">
                      <button
                        className={`accordion-button ${activeAccordion === 'faq1' ? '' : 'collapsed'}`}
                        type="button"
                        onClick={() => setActiveAccordion(activeAccordion === 'faq1' ? null : 'faq1')}
                        style={{ 
                          fontWeight: 'bold', 
                          color: activeAccordion === 'faq1' ? 'var(--mantente-brown)' : 'var(--mantente-dark-gray)',
                          backgroundColor: activeAccordion === 'faq1' ? 'rgba(226, 181, 78, 0.1)' : 'white'
                        }}
                      >
                        ¿Cuándo se cobra?
                      </button>
                    </h2>
                    <div
                      className={`accordion-collapse ${activeAccordion === 'faq1' ? 'show' : 'collapse'}`}
                      style={{transition: 'height 0.35s ease'}}
                    >
                      <div className="accordion-body">
                        Se cobra el primer día de cada mes. Puedes ver la fecha de próxima renovación
                        en tu información de suscripción.
                      </div>
                    </div>
                  </div>
                  <div className="accordion-item">
                    <h2 className="accordion-header">
                      <button
                        className={`accordion-button ${activeAccordion === 'faq2' ? '' : 'collapsed'}`}
                        type="button"
                        onClick={() => setActiveAccordion(activeAccordion === 'faq2' ? null : 'faq2')}
                        style={{ 
                          fontWeight: 'bold', 
                          color: activeAccordion === 'faq2' ? 'var(--mantente-brown)' : 'var(--mantente-dark-gray)',
                          backgroundColor: activeAccordion === 'faq2' ? 'rgba(226, 181, 78, 0.1)' : 'white'
                        }}
                      >
                        ¿Puedo cancelar en cualquier momento?
                      </button>
                    </h2>
                    <div
                      className={`accordion-collapse ${activeAccordion === 'faq2' ? 'show' : 'collapse'}`}
                      style={{transition: 'height 0.35s ease'}}
                    >
                      <div className="accordion-body">
                        Sí, puedes cancelar en cualquier momento. Mantendrás el acceso premium hasta
                        el final del período actual.
                      </div>
                    </div>
                  </div>
                  <div className="accordion-item">
                    <h2 className="accordion-header">
                      <button
                        className={`accordion-button ${activeAccordion === 'faq3' ? '' : 'collapsed'}`}
                        type="button"
                        onClick={() => setActiveAccordion(activeAccordion === 'faq3' ? null : 'faq3')}
                        style={{ 
                          fontWeight: 'bold', 
                          color: activeAccordion === 'faq3' ? 'var(--mantente-brown)' : 'var(--mantente-dark-gray)',
                          backgroundColor: activeAccordion === 'faq3' ? 'rgba(226, 181, 78, 0.1)' : 'white'
                        }}
                      >
                        ¿Hay reembolso?
                      </button>
                    </h2>
                    <div
                      className={`accordion-collapse ${activeAccordion === 'faq3' ? 'show' : 'collapse'}`}
                      style={{transition: 'height 0.35s ease'}}
                    >
                      <div className="accordion-body">
                        No ofrecemos reembolsos después de la compra. Sin embargo, puedes cancelar tu
                        suscripción en cualquier momento para evitar cobros futuros.
                      </div>
                    </div>
                  </div>
                  <div className="accordion-item">
                    <h2 className="accordion-header">
                      <button
                        className={`accordion-button ${activeAccordion === 'faq4' ? '' : 'collapsed'}`}
                        type="button"
                        onClick={() => setActiveAccordion(activeAccordion === 'faq4' ? null : 'faq4')}
                        style={{ 
                          fontWeight: 'bold', 
                          color: activeAccordion === 'faq4' ? 'var(--mantente-brown)' : 'var(--mantente-dark-gray)',
                          backgroundColor: activeAccordion === 'faq4' ? 'rgba(226, 181, 78, 0.1)' : 'white'
                        }}
                      >
                        ¿Qué métodos de pago aceptan?
                      </button>
                    </h2>
                    <div
                      className={`accordion-collapse ${activeAccordion === 'faq4' ? 'show' : 'collapse'}`}
                      style={{transition: 'height 0.35s ease'}}
                    >
                      <div className="accordion-body">
                        Aceptamos todos los métodos de pago disponibles a través de PayPal, incluyendo tarjetas de crédito/débito, 
                        saldo de PayPal y transferencias bancarias en algunos países.
                      </div>
                    </div>
                  </div>
                  <div className="accordion-item">
                    <h2 className="accordion-header">
                      <button
                        className={`accordion-button ${activeAccordion === 'faq5' ? '' : 'collapsed'}`}
                        type="button"
                        onClick={() => setActiveAccordion(activeAccordion === 'faq5' ? null : 'faq5')}
                        style={{ 
                          fontWeight: 'bold', 
                          color: activeAccordion === 'faq5' ? 'var(--mantente-brown)' : 'var(--mantente-dark-gray)',
                          backgroundColor: activeAccordion === 'faq5' ? 'rgba(226, 181, 78, 0.1)' : 'white'
                        }}
                      >
                        ¿Cómo funciona la renovación automática?
                      </button>
                    </h2>
                    <div
                      className={`accordion-collapse ${activeAccordion === 'faq5' ? 'show' : 'collapse'}`}
                      style={{transition: 'height 0.35s ease'}}
                    >
                      <div className="accordion-body">
                        Tu suscripción se renovará automáticamente cada mes hasta que decidas cancelarla. 
                        Recibirás un correo electrónico de confirmación de PayPal cada vez que se realice un cargo.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Premium;