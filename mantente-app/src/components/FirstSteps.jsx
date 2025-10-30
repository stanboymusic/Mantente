import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthNavbar from './AuthNavbar';
import '../styles/FirstSteps.css';

const FirstSteps = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('setup');

  const handleGetStarted = () => {
    navigate('/register');
  };

  const handleLogin = () => {
    navigate('/login');
  };

  return (
    <div className="first-steps-page">
      <AuthNavbar />

      {/* Hero Section */}
      <section className="fs-hero">
        <div className="fs-hero-content">
          <h1>Cómo Funciona Mantente</h1>
          <p>Guía completa para nuevos usuarios</p>
        </div>
      </section>

      {/* Main Content */}
      <div className="fs-container">
        {/* Tab Navigation */}
        <div className="fs-tabs">
          <button 
            className={`fs-tab-btn ${activeTab === 'setup' ? 'active' : ''}`}
            onClick={() => setActiveTab('setup')}
          >
            <span className="fs-tab-icon">⚙️</span>
            Configuración Inicial
          </button>
          <button 
            className={`fs-tab-btn ${activeTab === 'usage' ? 'active' : ''}`}
            onClick={() => setActiveTab('usage')}
          >
            <span className="fs-tab-icon">📊</span>
            Cómo Usar
          </button>
          <button 
            className={`fs-tab-btn ${activeTab === 'features' ? 'active' : ''}`}
            onClick={() => setActiveTab('features')}
          >
            <span className="fs-tab-icon">✨</span>
            Características
          </button>
        </div>

        {/* Content Panels */}
        {activeTab === 'setup' && (
          <div className="fs-panel">
            <h2>Primeros Pasos: Configuración Inicial</h2>
            <p className="fs-intro">
              ¡Felicidades por registrarte en Mantente! Antes de comenzar a usar la aplicación, 
              es crucial configurar tu perfil de negocio. Sin esto, la aplicación no funcionará correctamente.
            </p>

            <div className="fs-steps">
              {/* Step 1 */}
              <div className="fs-step">
                <div className="fs-step-number">1</div>
                <div className="fs-step-content">
                  <h3>📋 Crea tu Cuenta</h3>
                  <p>Regístrate con tu correo electrónico y contraseña. Recibirás un email de confirmación.</p>
                  <div className="fs-highlight">
                    💡 <strong>Tip:</strong> Usa una contraseña segura con letras, números y símbolos.
                  </div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="fs-step">
                <div className="fs-step-number">2</div>
                <div className="fs-step-content">
                  <h3>🏢 Accede al Perfil de Empresa</h3>
                  <p>
                    Una vez hayas iniciado sesión, verás el Dashboard. En la barra de navegación 
                    superior, encontrarás un menú con diferentes opciones.
                  </p>
                  <p>
                    Busca y haz clic en <strong>"Perfil de Empresa"</strong> (generalmente en el menú de usuario o configuración).
                  </p>
                  <div className="fs-highlight">
                    💡 <strong>Localización:</strong> Menú superior derecho → ⚙️ Configuración → Perfil de Empresa
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="fs-step">
                <div className="fs-step-number">3</div>
                <div className="fs-step-content">
                  <h3>✍️ Completa tu Información</h3>
                  <p>Rellena los siguientes campos <strong>obligatorios</strong>:</p>
                  
                  <div className="fs-fields">
                    <div className="fs-field">
                      <strong>Nombre de Negocio:</strong>
                      <p>Ej: "Mi Tienda Online", "Carpintería José", "Distribuidora García"</p>
                    </div>
                    <div className="fs-field">
                      <strong>RUC/Cédula/NIT:</strong>
                      <p>Tu número de identificación fiscal. Necesario para generar facturas legales.</p>
                    </div>
                    <div className="fs-field">
                      <strong>Dirección:</strong>
                      <p>Dirección física de tu negocio.</p>
                    </div>
                    <div className="fs-field">
                      <strong>Teléfono:</strong>
                      <p>Número de contacto de tu negocio.</p>
                    </div>
                    <div className="fs-field">
                      <strong>Email:</strong>
                      <p>Email de contacto de tu empresa (puede ser diferente de tu email de login).</p>
                    </div>
                    <div className="fs-field">
                      <strong>Régimen Fiscal:</strong>
                      <p>Selecciona el régimen tributario de tu país (consulta con tu contador si no lo sabes).</p>
                    </div>
                  </div>

                  <div className="fs-highlight warning">
                    ⚠️ <strong>Importante:</strong> La información del RUC/Cédula aparecerá en las facturas que generes. 
                    Asegúrate de que sea correcta antes de guardar.
                  </div>
                </div>
              </div>

              {/* Step 4 */}
              <div className="fs-step">
                <div className="fs-step-number">4</div>
                <div className="fs-step-content">
                  <h3>💾 Guarda tu Perfil</h3>
                  <p>Haz clic en el botón <strong>"Guardar Cambios"</strong> o <strong>"Actualizar Perfil"</strong>.</p>
                  <p>Deberías ver un mensaje de confirmación indicando que los cambios se guardaron correctamente.</p>
                  <div className="fs-highlight">
                    ✅ <strong>Listo!</strong> Ya puedes comenzar a usar Mantente.
                  </div>
                </div>
              </div>

              {/* Step 5 */}
              <div className="fs-step">
                <div className="fs-step-number">5</div>
                <div className="fs-step-content">
                  <h3>📦 Agrega tus Productos</h3>
                  <p>Ve a la sección <strong>"Inventario"</strong> y agrega los productos que vendes.</p>
                  <p>Para cada producto ingresa:</p>
                  <ul className="fs-list">
                    <li>Nombre del producto</li>
                    <li>Categoría</li>
                    <li>Cantidad inicial en stock</li>
                    <li>Precio de costo</li>
                    <li>Precio de venta</li>
                  </ul>
                </div>
              </div>

              {/* Step 6 */}
              <div className="fs-step">
                <div className="fs-step-number">6</div>
                <div className="fs-step-content">
                  <h3>👥 Registra tus Clientes</h3>
                  <p>Ve a <strong>"Clientes"</strong> y agrega los datos de tus clientes.</p>
                  <p>Esto te ayudará a:</p>
                  <ul className="fs-list">
                    <li>Generar facturas con datos del cliente</li>
                    <li>Mantener historial de compras por cliente</li>
                    <li>Controlar deudas y créditos</li>
                    <li>Realizar análisis de ventas por cliente</li>
                  </ul>
                </div>
              </div>

              {/* Step 7 */}
              <div className="fs-step">
                <div className="fs-step-number">7</div>
                <div className="fs-step-content">
                  <h3>💰 Comienza a Registrar Ventas</h3>
                  <p>En la sección <strong>"Ventas"</strong> puedes registrar todas tus transacciones.</p>
                  <p>Cada venta registrada aparecerá en tu Dashboard y en los reportes.</p>
                </div>
              </div>
            </div>

            <div className="fs-cta">
              <button className="fs-btn-primary" onClick={handleGetStarted}>
                Crear Cuenta Ahora
              </button>
              <button className="fs-btn-secondary" onClick={handleLogin}>
                Tengo Cuenta
              </button>
            </div>
          </div>
        )}

        {activeTab === 'usage' && (
          <div className="fs-panel">
            <h2>Cómo Usar Mantente</h2>
            <p className="fs-intro">
              Una vez configurado, Mantente es muy fácil de usar. Aquí te mostramos el flujo principal.
            </p>

            <div className="fs-sections">
              {/* Dashboard */}
              <div className="fs-section">
                <h3>📊 Dashboard</h3>
                <p>Tu panel de control principal donde ves:</p>
                <ul className="fs-list">
                  <li><strong>Resumen de Ventas:</strong> Total vendido en el período actual</li>
                  <li><strong>Inventario:</strong> Productos con stock bajo</li>
                  <li><strong>Clientes Deudores:</strong> Clientes que te deben dinero</li>
                  <li><strong>Gráficos:</strong> Visualizaciones de tu rendimiento</li>
                </ul>
              </div>

              {/* Inventario */}
              <div className="fs-section">
                <h3>📦 Inventario</h3>
                <p>Gestiona todos tus productos:</p>
                <ul className="fs-list">
                  <li>Ver, agregar, editar y eliminar productos</li>
                  <li>Actualizar stock automáticamente</li>
                  <li>Organizar por categorías</li>
                  <li>Rastrear costos y márgenes de ganancia</li>
                </ul>
              </div>

              {/* Ventas */}
              <div className="fs-section">
                <h3>💰 Ventas</h3>
                <p>Registra todas tus transacciones:</p>
                <ul className="fs-list">
                  <li>Selecciona cliente, productos y cantidades</li>
                  <li>Aplica descuentos si es necesario</li>
                  <li>Genera facturas automáticamente</li>
                  <li>Visualiza todas tus ventas en un libro de ventas</li>
                </ul>
              </div>

              {/* Clientes */}
              <div className="fs-section">
                <h3>👥 Clientes</h3>
                <p>Administra información de tus clientes:</p>
                <ul className="fs-list">
                  <li>Ver historial de compras por cliente</li>
                  <li>Controlar saldos deudores</li>
                  <li>Actualizar contactos y direcciones</li>
                </ul>
              </div>

              {/* Facturas */}
              <div className="fs-section">
                <h3>📄 Facturas</h3>
                <p>Crea y gestiona facturas profesionales:</p>
                <ul className="fs-list">
                  <li>Generadas automáticamente desde ventas</li>
                  <li>O crea facturas manuales cuando lo necesites</li>
                  <li>Descarga en PDF para enviar a clientes</li>
                </ul>
              </div>

              {/* Egresos */}
              <div className="fs-section">
                <h3>💸 Egresos</h3>
                <p>Registra todos tus gastos:</p>
                <ul className="fs-list">
                  <li>Compra de inventario</li>
                  <li>Gastos operativos</li>
                  <li>Servicios y utilidades</li>
                  <li>Análisis de gastos por categoría</li>
                </ul>
              </div>

              {/* Cierre de Mes */}
              <div className="fs-section">
                <h3>📅 Cierre de Mes</h3>
                <p>Genera reportes mensuales:</p>
                <ul className="fs-list">
                  <li>Resumen de ingresos totales</li>
                  <li>Resumen de egresos totales</li>
                  <li>Ganancia neta del mes</li>
                  <li>Deuda transferida al próximo mes</li>
                </ul>
              </div>
            </div>

            <div className="fs-cta">
              <button className="fs-btn-primary" onClick={handleGetStarted}>
                Comenzar Ahora
              </button>
            </div>
          </div>
        )}

        {activeTab === 'features' && (
          <div className="fs-panel">
            <h2>Características de Mantente</h2>
            <p className="fs-intro">
              Mantente tiene dos planes: Gratis y Premium. Conoce qué incluye cada uno.
            </p>

            <div className="fs-features-grid">
              {/* Plan Gratis */}
              <div className="fs-feature-card">
                <h3>Plan Gratis 🎁</h3>
                <p className="fs-price">$0 para siempre</p>
                <ul className="fs-list">
                  <li>✅ Dashboard básico</li>
                  <li>✅ Gestión de inventario</li>
                  <li>✅ Registro de ventas</li>
                  <li>✅ Gestión de clientes</li>
                  <li>✅ Facturas profesionales</li>
                  <li>✅ Control de egresos</li>
                  <li>✅ Cierre de mes</li>
                  <li>✅ Acceso desde cualquier dispositivo</li>
                  <li>❌ Presupuestos avanzados</li>
                  <li>❌ Gestión de Pedidos</li>
                  <li>❌ Notas de Entrega</li>
                  <li>❌ Devoluciones</li>
                  <li>📢 Incluye anuncios</li>
                </ul>
              </div>

              {/* Plan Premium */}
              <div className="fs-feature-card fs-feature-premium">
                <div className="fs-premium-badge">⭐ MÁS POPULAR</div>
                <h3>Plan Premium 🚀</h3>
                <p className="fs-price">$20 USD/mes</p>
                <ul className="fs-list">
                  <li>✅ Todo del Plan Gratis</li>
                  <li>✅ Presupuestos avanzados</li>
                  <li>✅ Gestión de Pedidos</li>
                  <li>✅ Notas de Entrega</li>
                  <li>✅ Libro de Ventas detallado</li>
                  <li>✅ Gestión de Devoluciones</li>
                  <li>✅ Órdenes de Servicio</li>
                  <li>✅ Tickets personalizados</li>
                  <li>✅ Alertas de Stock Bajo</li>
                  <li>✅ Creación de Ofertas</li>
                  <li>✅ Reportes avanzados</li>
                  <li>✅ Estadísticas mejoradas</li>
                  <li>🎯 CERO Anuncios</li>
                </ul>
              </div>
            </div>

            <div className="fs-section fs-section-full">
              <h3>¿Cuándo necesitas Premium?</h3>
              <p>Considera Premium si:</p>
              <ul className="fs-list">
                <li>Trabajas con presupuestos y necesitas rastrear propuestas</li>
                <li>Manejas pedidos y entregas complejas</li>
                <li>Tienes devoluciones frecuentes</li>
                <li>Necesitas órdenes de servicio</li>
                <li>Quieres una experiencia sin publicidad</li>
                <li>Requieres reportes más detallados</li>
              </ul>
            </div>

            <div className="fs-cta">
              <button className="fs-btn-primary" onClick={handleGetStarted}>
                Registrarse Gratis
              </button>
              <button className="fs-btn-secondary" onClick={handleLogin}>
                Ver Plan Premium
              </button>
            </div>
          </div>
        )}
      </div>

      {/* FAQ Section */}
      <section className="fs-faq">
        <h2>Preguntas Frecuentes</h2>
        
        <div className="fs-faq-grid">
          <div className="fs-faq-item">
            <h4>❓ ¿Puedo cambiar mi información después?</h4>
            <p>Sí, puedes actualizar tu perfil de empresa en cualquier momento desde Configuración → Perfil de Empresa.</p>
          </div>

          <div className="fs-faq-item">
            <h4>❓ ¿Es seguro guardar mis datos?</h4>
            <p>Sí, Mantente usa encriptación de nivel empresarial y servidores seguros en la nube para proteger tu información.</p>
          </div>

          <div className="fs-faq-item">
            <h4>❓ ¿Puedo usar Mantente desde mi teléfono?</h4>
            <p>¡Claro! Mantente es responsive y funciona perfectamente en teléfonos, tablets y computadoras.</p>
          </div>

          <div className="fs-faq-item">
            <h4>❓ ¿Hay soporte técnico?</h4>
            <p>Sí, puedes contactarnos desde la sección Contacto en la aplicación. Nos encantaría ayudarte.</p>
          </div>

          <div className="fs-faq-item">
            <h4>❓ ¿Qué pasa con mis datos si cancelo la suscripción?</h4>
            <p>Tus datos se mantienen seguros. Puedes volver a activar Premium en cualquier momento sin perder información.</p>
          </div>

          <div className="fs-faq-item">
            <h4>❓ ¿Cuánto cuesta exactamente?</h4>
            <p>Plan Gratis: $0 (siempre). Plan Premium: $20 USD por mes. Sin costos ocultos.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default FirstSteps;