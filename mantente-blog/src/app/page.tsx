import Link from "next/link";
import Image from "next/image";
import "./page.css";

export const metadata = {
  title: "Mantente - Educación Financiera Personal",
  description: "Aprende sobre finanzas personales, presupuestos y gestión del dinero con contenido educativo gratuito. Mejora tus hábitos financieros con guías prácticas.",
};

export default function Home() {
  return (
    <div className="home-container">
      {/* Header with Logo */}
      <header className="home-header">
        <div className="home-header-content">
          <div className="home-header-center">
            <Image
              src="/logo.png"
              alt="Mantente"
              width={150}
              height={50}
              className="home-logo"
            />
          </div>
        </div>
      </header>

      <div className="home-main">
        {/* Hero Section */}
        <div className="hero-section">
          <h1 className="hero-title">
            Educación Financiera
            <span className="hero-title-highlight">
              para Todos
            </span>
          </h1>
          <p className="hero-description">
            Aprende a gestionar tu dinero de manera inteligente. Contenido educativo gratuito sobre presupuestos,
            ahorro, inversiones y hábitos financieros saludables.
          </p>
          <div className="hero-buttons">
            <Link
              href="/blog"
              className="btn-primary-mantente btn-blog"
            >
              📚 Explorar Blog Financiero
            </Link>
            <a
              href="https://mantente.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-outline-mantente btn-dashboard"
            >
              Acceder al Dashboard
            </a>
          </div>
        </div>

        {/* Features Section */}
        <div className="features-section">
          <div className="features-grid">
            <div className="feature-card">
              <h3 className="feature-title">
                Presupuestos Inteligentes
              </h3>
              <p className="feature-description">
                Aprende a crear y mantener presupuestos que funcionen para tu estilo de vida.
              </p>
            </div>
            <div className="feature-card">
              <h3 className="feature-title">
                Estrategias de Ahorro
              </h3>
              <p className="feature-description">
                Descubre técnicas probadas para aumentar tus ahorros mes a mes.
              </p>
            </div>
            <div className="feature-card">
              <h3 className="feature-title">
                Gestión de Deudas
              </h3>
              <p className="feature-description">
                Estrategias para reducir y eliminar deudas de manera efectiva.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="cta-section">
          <h3 className="cta-title">
            ¿Por qué la educación financiera importa?
          </h3>
          <div className="cta-content">
            <p className="cta-description">
              La alfabetización financiera es fundamental para tomar decisiones informadas sobre tu dinero.
              Nuestros artículos te ayudan a entender conceptos básicos y avanzados de finanzas personales
              de manera clara y accesible.
            </p>
            <Link
              href="/blog"
              className="article-link cta-link"
            >
              Leer artículos →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
