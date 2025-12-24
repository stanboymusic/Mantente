import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import AuthNavbar from './AuthNavbar';
import '../styles/Landing.css';

const Landing = () => {
  const navigate = useNavigate();
  const { user } = useApp();

  const handleGetStarted = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/register');
    }
  };

  const handleLogin = () => {
    navigate('/login');
  };

  const handlePremium = () => {
    navigate('/premium');
  };

  return (
    <div className="landing-page">
      <AuthNavbar />
      
      {/* ===== HERO SECTION ===== */}
      <section className="hero-section">
        <div className="hero-wrapper">
          <div className="hero-content">
            <div className="hero-logo">
              <img src="/material visual/logo con slogan.png" alt="Mantente" className="logo-image" />
            </div>
            <h1 className="hero-title">
              Decisiones claras, <span className="highlight">negocios rentables</span>
            </h1>
            <p className="hero-subtitle">
              Gestiona tu inventario, ventas y finanzas con la herramienta perfecta para pequeños negocios
            </p>
            <div className="hero-buttons">
              <a
                href="https://blog.mantente.app"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-outline-mantente"
                style={{ marginBottom: '10px', display: 'inline-block' }}
              >
                📚 Blog Financiero
              </a>
              {user ? (
                <button className="btn-primary-mantente" onClick={handleGetStarted}>
                  Ir al Dashboard
                </button>
              ) : (
                <>
                  <button className="btn-primary-mantente" onClick={handleGetStarted}>
                    Comenzar Gratis
                  </button>
                  <button className="btn-outline-mantente" onClick={handleLogin}>
                    Iniciar Sesión
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ===== FEATURES SECTION ===== */}
      <section className="features-section">
        <h2 className="section-title">
          Funciones <span className="highlight">Principales</span>
        </h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>Dashboard Completo</h3>
            <p>Visualiza resumen de ventas, inventario y estado financiero en tiempo real</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📦</div>
            <h3>Gestión de Inventario</h3>
            <p>Controla stock de productos, categorías y disponibilidad automáticamente</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">💰</div>
            <h3>Registro de Ventas</h3>
            <p>Registra todas tus transacciones y genera reportes detallados</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">👥</div>
            <h3>Gestión de Clientes</h3>
            <p>Mantén registro de clientes con historial de compras y contactos</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📄</div>
            <h3>Facturas Profesionales</h3>
            <p>Genera facturas con datos fiscales e información de tus productos</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>Control Financiero</h3>
            <p>Monitorea egresos, cierre de mes y deuda acumulada entre períodos</p>
          </div>
        </div>
      </section>

      {/* ===== BENEFITS SECTION ===== */}
      <section className="benefits-section">
        <h2 className="section-title">¿Por qué elegir Mantente?</h2>
        <div className="benefits-container">
          <div className="benefit-item">
            <div className="benefit-icon">✨</div>
            <div className="benefit-content">
              <h4>Simple y Intuitivo</h4>
              <p>Interfaz fácil de usar, sin necesidad de capacitación técnica</p>
            </div>
          </div>
          <div className="benefit-item">
            <div className="benefit-icon">🔒</div>
            <div className="benefit-content">
              <h4>Datos Seguros</h4>
              <p>Tu información se almacena en servidores seguros en la nube</p>
            </div>
          </div>
          <div className="benefit-item">
            <div className="benefit-icon">⚡</div>
            <div className="benefit-content">
              <h4>Acceso Desde Cualquier Lugar</h4>
              <p>Accede a tu negocio desde PC, tablet o teléfono</p>
            </div>
          </div>
          <div className="benefit-item">
            <div className="benefit-icon">🎯</div>
            <div className="benefit-content">
              <h4>Decisiones Rentables</h4>
              <p>Reportes que te ayudan a entender mejor tu negocio</p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS SECTION ===== */}
      <section className="how-works-section">
        <h2 className="section-title">Cómo Funciona</h2>
        <div className="steps-grid">
          <div className="step-card">
            <div className="step-number">1</div>
            <h4>Crea tu Cuenta</h4>
            <p>Regístrate con tu email y comienza a usar Mantente en minutos</p>
          </div>
          <div className="step-card">
            <div className="step-number">2</div>
            <h4>Configura tu Negocio</h4>
            <p>Ingresa tus productos, clientes y datos de tu empresa</p>
          </div>
          <div className="step-card">
            <div className="step-number">3</div>
            <h4>Empieza a Prosperar</h4>
            <p>Registra tus ventas y visualiza tus reportes en tiempo real</p>
          </div>
        </div>
      </section>

      {/* ===== PRICING SECTION ===== */}
      <section className="pricing-section">
        <h2 className="section-title">Planes de Precios</h2>
        <div className="pricing-grid">
          {/* Plan Free */}
          <div className="pricing-card">
            <h3 className="plan-name">Gratis</h3>
            <div className="plan-price">$0</div>
            <p className="plan-period">para siempre</p>
            <ul className="plan-features">
              <li>Dashboard básico</li>
              <li>Gestión de inventario</li>
              <li>Registro de ventas</li>
              <li>Gestión de clientes</li>
              <li>Facturas básicas</li>
              <li>Control de egresos</li>
              <li>Cierre de mes</li>
              <li className="unavailable">Presupuestos y Pedidos</li>
              <li className="unavailable">Notas de Entrega</li>
              <li className="unavailable">Libro de Ventas</li>
              <li className="unavailable">Gestión de Devoluciones</li>
              <li className="unavailable">Órdenes de Servicio</li>
              <li>Con anuncios</li>
            </ul>
            <button className="plan-button btn-primary" onClick={handleGetStarted}>
              Comenzar Gratis
            </button>
          </div>

          {/* Plan Premium */}
          <div className="pricing-card popular">
            <div className="popular-badge">MÁS POPULAR</div>
            <h3 className="plan-name">Premium</h3>
            <div className="plan-price">$20</div>
            <p className="plan-period">USD por mes</p>
            <ul className="plan-features">
              <li>Todo del plan Gratis</li>
              <li>Presupuestos avanzados</li>
              <li>Gestión de Pedidos</li>
              <li>Notas de Entrega</li>
              <li>Libro de Ventas detallado</li>
              <li>Gestión de Devoluciones</li>
              <li>Órdenes de Servicio</li>
              <li>Tickets personalizados</li>
              <li>Alertas de Stock Bajo</li>
              <li>Creación de Ofertas</li>
              <li>Reportes avanzados</li>
              <li>Estadísticas mejoradas</li>
              <li>CERO Anuncios</li>
            </ul>
            <button className="plan-button btn-secondary" onClick={handlePremium}>
              Activar Premium
            </button>
          </div>
        </div>
      </section>

      {/* ===== TARGET USERS SECTION ===== */}
      <section className="target-section">
        <h2 className="section-title">Perfecto para</h2>
        <div className="target-grid">
          <div className="target-card">
            <div className="target-icon">🏪</div>
            <h4>Dueños de Tiendas</h4>
            <p>Controla tu inventario y ventas en tiempo real</p>
          </div>
          <div className="target-card">
            <div className="target-icon">🛠️</div>
            <h4>Prestadores de Servicios</h4>
            <p>Gestiona presupuestos, pedidos y órdenes de trabajo</p>
          </div>
          <div className="target-card">
            <div className="target-icon">📦</div>
            <h4>Distribuidores</h4>
            <p>Administra notas de entrega y gestión de devoluciones</p>
          </div>
          <div className="target-card">
            <div className="target-icon">👔</div>
            <h4>Emprendedores</h4>
            <p>Herramienta completa para crecer tu negocio online y offline</p>
          </div>
        </div>
      </section>

      {/* ===== STATS SECTION ===== */}
      <section className="stats-section">
        <div className="stats-container">
          <div className="stat-item">
            <h3>1000+</h3>
            <p>Negocios activos</p>
          </div>
          <div className="stat-item">
            <h3>50K+</h3>
            <p>Transacciones mensuales</p>
          </div>
          <div className="stat-item">
            <h3>99%</h3>
            <p>Disponibilidad del servicio</p>
          </div>
          <div className="stat-item">
            <h3>24/7</h3>
            <p>Acceso desde cualquier dispositivo</p>
          </div>
        </div>
      </section>

      {/* ===== MANTENTE CONNECT SECTION ===== */}
      <section className="connect-section" style={{
        backgroundColor: '#f8f9fa',
        padding: '60px 20px',
        borderTop: '2px solid #e9ecef'
      }}>
        <div className="connect-container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 className="section-title" style={{ marginBottom: '40px' }}>
            🚀 Mantente <span className="highlight">Connect</span>
          </h2>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '30px',
            marginBottom: '40px'
          }}>
            {/* Card 1: Offline First */}
            <div style={{
              backgroundColor: 'white',
              padding: '30px',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '15px' }}>📱</div>
              <h3 style={{ marginBottom: '12px' }}>Funciona sin Internet</h3>
              <p style={{ color: '#666', fontSize: '14px' }}>
                Registra ventas, gestiona inventario y crea pedidos incluso sin conexión. Se sincroniza automáticamente cuando vuelves online.
              </p>
            </div>

            {/* Card 2: Sincronización Automática */}
            <div style={{
              backgroundColor: 'white',
              padding: '30px',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '15px' }}>🔄</div>
              <h3 style={{ marginBottom: '12px' }}>Sincronización Automática</h3>
              <p style={{ color: '#666', fontSize: '14px' }}>
                Tus datos se sincronizan automáticamente con Mantente principal. Todo lo que hagas en Connect aparece en tu dashboard.
              </p>
            </div>

            {/* Card 3: Acceso Móvil */}
            <div style={{
              backgroundColor: 'white',
              padding: '30px',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '15px' }}>⚡</div>
              <h3 style={{ marginBottom: '12px' }}>Optimizado para Móvil</h3>
              <p style={{ color: '#666', fontSize: '14px' }}>
                Aplicación ligera y rápida, perfecta para trabajar desde tu teléfono o tablet en la tienda.
              </p>
            </div>
          </div>

          {/* CTA Buttons */}
          <div style={{
            display: 'flex',
            gap: '20px',
            justifyContent: 'center',
            flexWrap: 'wrap',
            marginTop: '40px'
          }}>
            <a 
              href="https://mantente-connect-app.vercel.app" 
              target="_blank" 
              rel="noopener noreferrer"
              className="btn-primary-mantente"
              style={{
                display: 'inline-block',
                padding: '12px 30px',
                textDecoration: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '600',
                textAlign: 'center'
              }}
            >
              🌐 Acceder a Mantente Connect
            </a>
            
            <button 
              onClick={() => {
                // Instrucciones para instalar como PWA
                const userAgent = navigator.userAgent.toLowerCase();
                if (userAgent.includes('iphone') || userAgent.includes('ipad')) {
                  alert('Para instalar en iOS:\n1. Abre Safari\n2. Ve a mantente-connect-app.vercel.app\n3. Tap compartir → Agregar a pantalla de inicio');
                } else if (userAgent.includes('android')) {
                  alert('Para instalar en Android:\n1. Abre Chrome\n2. Ve a mantente-connect-app.vercel.app\n3. Tap menú → Instalar aplicación');
                } else {
                  alert('Para instalar como PWA:\n1. Abre Chrome, Edge o Safari\n2. Haz clic en el icono "Instalar" en la barra de direcciones\n3. ¡Listo!');
                }
              }}
              className="btn-outline-mantente"
              style={{
                display: 'inline-block',
                padding: '12px 30px',
                textDecoration: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '600',
                border: '2px solid #007bff',
                backgroundColor: 'transparent',
                color: '#007bff',
                textAlign: 'center'
              }}
            >
              📥 Instalar como Aplicación
            </button>

            <a 
              href="https://mantente-connect-app.vercel.app" 
              target="_blank" 
              rel="noopener noreferrer"
              className="btn-outline-mantente"
              style={{
                display: 'inline-block',
                padding: '12px 30px',
                textDecoration: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '600',
                border: '2px solid #28a745',
                backgroundColor: 'transparent',
                color: '#28a745',
                textAlign: 'center'
              }}
            >
              💻 Versión Desktop
            </a>
          </div>

          <p style={{
            textAlign: 'center',
            marginTop: '30px',
            color: '#666',
            fontSize: '14px'
          }}>
            ✨ Las órdenes creadas en Mantente Connect se sincronizan automáticamente a tu Mantente principal
          </p>
        </div>
      </section>

      {/* ===== CTA SECTION ===== */}
      <section className="cta-section">
        <div className="cta-container">
          <h2 className="cta-title">¿Listo para hacer crecer tu negocio?</h2>
          <p className="cta-subtitle">
            Únete a miles de emprendedores que ya confían en Mantente para gestionar sus negocios
          </p>
          <div className="cta-buttons">
            {user ? (
              <button className="btn-primary-mantente" onClick={handleGetStarted}>
                Ir al Dashboard
              </button>
            ) : (
              <>
                <button className="btn-primary-mantente" onClick={handleGetStarted}>
                  Comenzar Gratis Ahora
                </button>
                <button className="btn-secondary-mantente" onClick={handlePremium}>
                  Ver Plan Premium
                </button>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;