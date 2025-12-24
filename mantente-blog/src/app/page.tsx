import Link from "next/link";
import Image from "next/image";

export const metadata = {
  title: "Mantente - Educación Financiera Personal",
  description: "Aprende sobre finanzas personales, presupuestos y gestión del dinero con contenido educativo gratuito. Mejora tus hábitos financieros con guías prácticas.",
};

export default function Home() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--mantente-bg-light)' }}>
      {/* Header with Logo */}
      <header style={{
        backgroundColor: 'var(--mantente-white)',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        padding: '16px 0',
        position: 'sticky',
        top: 0,
        zIndex: 10
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <Image
              src="/logo.png"
              alt="Mantente"
              width={150}
              height={50}
              style={{ objectFit: 'contain' }}
            />
          </div>
        </div>
      </header>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
        {/* Hero Section */}
        <div style={{
          textAlign: 'center',
          padding: '60px 0 40px 0'
        }}>
          <h1 style={{
            fontSize: '3.5rem',
            fontWeight: 'bold',
            color: 'var(--mantente-dark-gray)',
            marginBottom: '1rem',
            fontFamily: "'Montserrat', sans-serif",
            lineHeight: '1.2'
          }}>
            Educación Financiera
            <span style={{
              display: 'block',
              color: 'var(--mantente-gold)',
              fontSize: '2.5rem'
            }}>
              para Todos
            </span>
          </h1>
          <p style={{
            fontSize: '1.25rem',
            color: 'var(--mantente-gray)',
            maxWidth: '800px',
            margin: '0 auto 2rem auto',
            lineHeight: '1.6'
          }}>
            Aprende a gestionar tu dinero de manera inteligente. Contenido educativo gratuito sobre presupuestos,
            ahorro, inversiones y hábitos financieros saludables.
          </p>
          <div style={{
            display: 'flex',
            gap: '20px',
            justifyContent: 'center',
            flexWrap: 'wrap',
            maxWidth: '500px',
            margin: '0 auto'
          }}>
            <Link
              href="/blog"
              className="btn-primary-mantente"
              style={{ minWidth: '200px' }}
            >
              📚 Explorar Blog Financiero
            </Link>
            <a
              href="https://mantente-app.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-outline-mantente"
              style={{ minWidth: '200px' }}
            >
              Acceder al Dashboard
            </a>
          </div>
        </div>

        {/* Features Section */}
        <div style={{ marginTop: '60px' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '30px'
          }}>
            <div style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              padding: '24px'
            }}>
              <h3 style={{
                fontSize: '1.25rem',
                fontWeight: '600',
                color: 'var(--mantente-dark-gray)',
                marginBottom: '12px',
                fontFamily: "'Montserrat', sans-serif"
              }}>
                Presupuestos Inteligentes
              </h3>
              <p style={{
                color: 'var(--mantente-gray)',
                lineHeight: '1.6'
              }}>
                Aprende a crear y mantener presupuestos que funcionen para tu estilo de vida.
              </p>
            </div>
            <div style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              padding: '24px'
            }}>
              <h3 style={{
                fontSize: '1.25rem',
                fontWeight: '600',
                color: 'var(--mantente-dark-gray)',
                marginBottom: '12px',
                fontFamily: "'Montserrat', sans-serif"
              }}>
                Estrategias de Ahorro
              </h3>
              <p style={{
                color: 'var(--mantente-gray)',
                lineHeight: '1.6'
              }}>
                Descubre técnicas probadas para aumentar tus ahorros mes a mes.
              </p>
            </div>
            <div style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              padding: '24px'
            }}>
              <h3 style={{
                fontSize: '1.25rem',
                fontWeight: '600',
                color: 'var(--mantente-dark-gray)',
                marginBottom: '12px',
                fontFamily: "'Montserrat', sans-serif"
              }}>
                Gestión de Deudas
              </h3>
              <p style={{
                color: 'var(--mantente-gray)',
                lineHeight: '1.6'
              }}>
                Estrategias para reducir y eliminar deudas de manera efectiva.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div style={{
          marginTop: '60px',
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          padding: '40px'
        }}>
          <h3 style={{
            fontSize: '1.5rem',
            fontWeight: '600',
            color: 'var(--mantente-dark-gray)',
            marginBottom: '16px',
            fontFamily: "'Montserrat', sans-serif"
          }}>
            ¿Por qué la educación financiera importa?
          </h3>
          <div style={{ maxWidth: '600px' }}>
            <p style={{
              color: 'var(--mantente-gray)',
              lineHeight: '1.6',
              marginBottom: '20px'
            }}>
              La alfabetización financiera es fundamental para tomar decisiones informadas sobre tu dinero.
              Nuestros artículos te ayudan a entender conceptos básicos y avanzados de finanzas personales
              de manera clara y accesible.
            </p>
            <Link
              href="/blog"
              className="article-link"
              style={{ fontSize: '1.125rem' }}
            >
              Leer artículos →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
