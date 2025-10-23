import React, { useState, useEffect } from 'react';
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

  // Cargar PayPal cuando el componente se monta
  useEffect(() => {
    if (!isPremium && window.paypal) {
      renderPayPalButtons();
    }
  }, [isPremium]);

  const renderPayPalButtons = () => {
    if (!window.paypal) {
      setError("PayPal no se cargó correctamente");
      return;
    }

    const container = document.getElementById("paypal-container");
    if (!container) return;

    // Limpiar contenedor anterior
    container.innerHTML = "";

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
      .render("#paypal-container");
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
      <h4 className="text-primary mb-3">✨ Beneficios de Premium</h4>
      <ul className="list-group list-group-flush">
        <li className="list-group-item">
          <strong>🚫 Cero Anuncios:</strong> Disfruta de una experiencia completamente limpia y sin distracciones
        </li>
        <li className="list-group-item">
          <strong>📢 Alertas de Stock Bajo:</strong> Recibe notificaciones visuales automáticas cuando el inventario se agota
        </li>
        <li className="list-group-item">
          <strong>🎁 Creación de Ofertas:</strong> Genera descuentos temporales personalizados para tus productos
        </li>
        <li className="list-group-item">
          <strong>📊 Reportes Avanzados:</strong> Acceso a análisis detallados y exportación de datos (PDF/CSV)
        </li>
        <li className="list-group-item">
          <strong>🎨 Estadísticas en Tiempo Real:</strong> Dashboards más detallados y visualización mejorada
        </li>
        <li className="list-group-item">
          <strong>💪 Soporte Prioritario:</strong> Ayuda rápida y asistencia técnica dedicada
        </li>
        <li className="list-group-item">
          <strong>❤️ Principalmente para apoyar al creador:</strong> Tu contribución ayuda a mantener y mejorar Mantente
        </li>
      </ul>
    </div>
  );

  return (
    <div className="p-4">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="card shadow-lg border-primary">
              <div className="card-body">
                <h1 className="card-title text-center text-primary mb-2">🚀 Mantente Premium</h1>
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
                    <div className="alert alert-success mb-4">
                      <h4 className="alert-heading">✅ ¡Eres Premium!</h4>
                      <p className="mb-0">
                        Gracias por tu apoyo. Disfruta de todas las funcionalidades sin interrupciones.
                      </p>
                    </div>

                    <PremiumBenefits />

                    {/* Información de suscripción */}
                    <div className="card bg-light mb-4">
                      <div className="card-body">
                        <h6 className="card-subtitle mb-2 text-muted">Detalles de tu suscripción</h6>
                        <p className="mb-1">
                          <strong>Estado:</strong>{" "}
                          <span className="badge bg-success">Activo</span>
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
                      <div className="alert alert-warning">
                        <p className="mb-2">¿Seguro que deseas cancelar tu suscripción?</p>
                        <div className="d-flex gap-2">
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={handleCancelSubscription}
                            disabled={loading}
                          >
                            {loading ? "Cancelando..." : "Sí, cancelar"}
                          </button>
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => setShowCancelConfirm(false)}
                            disabled={loading}
                          >
                            No, mantener
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        className="btn btn-outline-danger w-100"
                        onClick={() => setShowCancelConfirm(true)}
                        disabled={loading}
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
                      <div className="bg-primary text-white p-4 rounded">
                        <h2 className="mb-0">$70</h2>
                        <p className="mb-0 small">USD por mes</p>
                      </div>
                    </div>

                    {/* PayPal Button Container */}
                    <div
                      id="paypal-container"
                      className="mb-3"
                      style={{
                        minHeight: "60px",
                        display: "flex",
                        justifyContent: "center",
                      }}
                    >
                      {/* Los botones de PayPal se renderizarán aquí */}
                      {loading && (
                        <div className="spinner-border text-primary" role="status">
                          <span className="visually-hidden">Cargando...</span>
                        </div>
                      )}
                    </div>

                    {/* Información de seguridad */}
                    <div className="alert alert-info small" role="alert">
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
            <div className="card mt-4">
              <div className="card-header bg-light">
                <h6 className="mb-0">❓ Preguntas Frecuentes</h6>
              </div>
              <div className="card-body">
                <div className="accordion" id="faqAccordion">
                  <div className="accordion-item">
                    <h2 className="accordion-header">
                      <button
                        className="accordion-button collapsed"
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target="#faq1"
                      >
                        ¿Cuándo se cobra?
                      </button>
                    </h2>
                    <div
                      id="faq1"
                      className="accordion-collapse collapse"
                      data-bs-parent="#faqAccordion"
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
                        className="accordion-button collapsed"
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target="#faq2"
                      >
                        ¿Puedo cancelar en cualquier momento?
                      </button>
                    </h2>
                    <div
                      id="faq2"
                      className="accordion-collapse collapse"
                      data-bs-parent="#faqAccordion"
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
                        className="accordion-button collapsed"
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target="#faq3"
                      >
                        ¿Hay reembolso?
                      </button>
                    </h2>
                    <div
                      id="faq3"
                      className="accordion-collapse collapse"
                      data-bs-parent="#faqAccordion"
                    >
                      <div className="accordion-body">
                        No ofrecemos reembolsos después de la compra. Sin embargo, puedes cancelar tu
                        suscripción en cualquier momento para evitar cobros futuros.
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