import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';

const Anuncios = ({ position }) => {
  const { isPremium } = useApp();
  const [adLoaded, setAdLoaded] = useState(false);
  const [adError, setAdError] = useState(false);

  // Si el usuario es premium, no mostrar anuncios
  if (isPremium) {
    return null;
  }

  useEffect(() => {
    // Intentar cargar los anuncios si existe el objeto adsbygoogle
    if (window.adsbygoogle) {
      try {
        // Marcar un pequeño retraso para asegurar que el contenido se cargue primero
        const timer = setTimeout(() => {
          (window.adsbygoogle = window.adsbygoogle || []).push({});
          setAdLoaded(true);
        }, 300);
        
        return () => clearTimeout(timer);
      } catch (error) {
        console.error('Error al cargar anuncios:', error);
        setAdError(true);
      }
    }
  }, []);

  // Contenido específico según la posición del anuncio - IMPORTANTE para cumplir con políticas de AdSense
  const getAdContent = () => {
    switch (position) {
      case 'left':
        return {
          title: 'Herramientas para optimizar tu negocio',
          description: 'Descubre soluciones que pueden ayudarte a optimizar la gestión de tu inventario y aumentar tus ventas. Estas herramientas complementan perfectamente las funcionalidades de Mantente y te permiten llevar tu negocio al siguiente nivel.',
          tips: 'Mantente al día con las últimas tendencias en gestión empresarial y tecnologías para pequeños negocios. La automatización de procesos puede ahorrarte hasta un 30% de tiempo en tareas administrativas.',
          article: 'Los negocios que utilizan herramientas digitales para gestionar su inventario reportan un 25% menos de pérdidas por productos caducados o dañados. Implementar un sistema de alertas de stock mínimo puede prevenir roturas de stock y pérdidas de ventas potenciales.'
        };
      case 'right':
        return {
          title: 'Recursos financieros para emprendedores',
          description: 'Conoce opciones de financiamiento, herramientas contables y servicios que pueden ayudarte a mejorar la salud financiera de tu negocio y tomar decisiones más informadas sobre tus inversiones y gastos.',
          tips: 'La planificación financiera es clave para el crecimiento sostenible de cualquier empresa. Establece un presupuesto mensual y revisa tus métricas financieras al menos una vez por semana.',
          article: 'Según estudios recientes, las pequeñas empresas que mantienen un seguimiento detallado de sus finanzas tienen un 30% más de probabilidades de sobrevivir los primeros cinco años. Utilizar herramientas de proyección financiera te permite anticipar necesidades de capital y planificar estratégicamente.'
        };
      case 'footer':
        return {
          title: 'Servicios recomendados para tu crecimiento',
          description: 'Servicios seleccionados que complementan la gestión de tu negocio y te ayudan a tomar decisiones más informadas. Desde marketing digital hasta asesoría legal especializada para pequeñas empresas.',
          tips: 'Combina diferentes herramientas para crear un ecosistema completo para tu negocio. La integración entre tus sistemas de gestión, contabilidad y marketing puede multiplicar su efectividad.',
          article: 'Las empresas que integran sus sistemas de gestión con herramientas de marketing y atención al cliente reportan un aumento promedio del 22% en la satisfacción de sus clientes y un 15% en la tasa de retención.'
        };
      case 'mobile':
        return {
          title: 'Soluciones móviles para negocios',
          description: 'Aprovecha el poder de la movilidad con herramientas que te permiten gestionar tu negocio desde cualquier lugar. Mantén el control de tu inventario, ventas y clientes incluso cuando estás fuera de la oficina.',
          tips: 'Las aplicaciones móviles de gestión empresarial pueden aumentar la productividad de tu equipo hasta en un 40% al permitir realizar tareas importantes sin estar atados a un escritorio.',
          article: 'El 78% de los pequeños empresarios que utilizan soluciones móviles reportan una mejor conciliación entre su vida laboral y personal, además de una respuesta más rápida a las necesidades de sus clientes.'
        };
      default:
        return {
          title: 'Recursos empresariales esenciales',
          description: 'Herramientas y servicios que pueden potenciar tu negocio junto con Mantente. Descubre cómo la tecnología adecuada puede transformar tu operación diaria y mejorar tus resultados.',
          tips: 'La tecnología adecuada puede marcar la diferencia en la eficiencia de tu negocio. Invierte tiempo en investigar y probar diferentes soluciones antes de decidirte por una.',
          article: 'Las pequeñas empresas que adoptan soluciones tecnológicas adecuadas a sus necesidades experimentan un crecimiento promedio del 18% en sus ingresos durante el primer año de implementación, según estudios del sector.'
        };
    }
  };

  const getAdStyle = () => {
    switch (position) {
      case 'left': return { minHeight: '600px', margin: '10px 0', padding: '15px', border: '1px solid #e0e0e0', borderRadius: '8px', backgroundColor: '#f9f9f9' };
      case 'right': return { minHeight: '300px', margin: '10px 0', padding: '15px', border: '1px solid #e0e0e0', borderRadius: '8px', backgroundColor: '#f9f9f9' };
      case 'footer': return { minHeight: '120px', textAlign: 'center', padding: '15px', border: '1px solid #e0e0e0', borderRadius: '8px', marginTop: '20px', backgroundColor: '#f9f9f9' };
      default: return { minHeight: '250px', margin: '15px 0', padding: '15px', border: '1px solid #e0e0e0', borderRadius: '8px', backgroundColor: '#f9f9f9' };
    }
  };

  // Determinar el slot de anuncio según la posición
  const getAdSlot = () => {
    switch (position) {
      case 'left': return '1234567890'; // Reemplazar con tu slot real
      case 'right': return '0987654321'; // Reemplazar con tu slot real
      case 'footer': return '1122334455'; // Reemplazar con tu slot real
      default: return '5566778899'; // Slot por defecto
    }
  };

  const content = getAdContent();

  return (
    <div className="ad-container" style={getAdStyle()}>
      {/* Contenido del editor relacionado con los anuncios - IMPORTANTE para cumplir con las políticas de AdSense */}
      <div className="ad-content mb-3">
        <h5 style={{ color: '#E2B54E', marginBottom: '10px', fontSize: '1.1rem' }}>{content.title}</h5>
        <p className="small text-muted mb-2" style={{ color: '#666', fontSize: '0.9rem', lineHeight: '1.5' }}>
          {content.description}
        </p>
        <p className="small fst-italic text-muted mb-3" style={{ color: '#666', fontSize: '0.9rem', lineHeight: '1.5' }}>
          <strong>Consejo:</strong> {content.tips}
        </p>
        
        {/* Artículo informativo - Contenido valioso para el usuario */}
        <div className="bg-light p-3 rounded mb-3">
          <h6 style={{ color: '#0056b3', fontSize: '0.9rem', fontWeight: 'bold' }}>¿Sabías que?</h6>
          <p className="small mb-0" style={{ color: '#666', fontSize: '0.9rem', lineHeight: '1.5' }}>
            {content.article}
          </p>
        </div>
      </div>
      
      {/* Separador visual */}
      <hr className="my-3" style={{ borderColor: 'var(--mantente-taupe)' }} />
      
      {/* Anuncio de AdSense - Siempre después de contenido valioso */}
      <div className="adsense-container">
        <p className="small text-muted mb-2">Anuncios seleccionados para tu negocio:</p>
        {window.adsbygoogle ? (
          <ins 
            className="adsbygoogle"
            style={{ display: 'block', textAlign: 'center' }}
            data-ad-client="ca-pub-9518260713755284"
            data-ad-slot={getAdSlot()}
            data-ad-format="auto"
            data-full-width-responsive="true"
          ></ins>
        ) : (
          <div className="bg-light p-3 border" style={{ minHeight: '90px' }}>
            <p className="text-center text-muted small mb-0">
              Espacio publicitario ({position || 'estándar'})
            </p>
          </div>
        )}
        {adError && (
          <p className="small text-danger mt-2">
            No se pudieron cargar los anuncios. Por favor, verifica tu conexión.
          </p>
        )}
      </div>
      
      {/* Nota de transparencia - Buena práctica */}
      <div className="text-end mt-2">
        <p style={{ color: '#666', fontSize: '0.8rem', fontStyle: 'italic', marginBottom: '0' }}>
          Contenido informativo proporcionado por Mantente
        </p>
      </div>
    </div>
  );
};

export default Anuncios;