import React from "react";

const Cookies = () => {
  return (
    <div className="container mt-5 mb-5">
      <h1>Política de Cookies</h1>
      <p className="text-muted">Última actualización: {new Date().toLocaleDateString("es-ES")}</p>

      <section className="mt-4">
        <h2>1. ¿Qué son las Cookies?</h2>
        <p>
          Las cookies son pequeños archivos de texto que se almacenan en su dispositivo (ordenador, tableta o teléfono 
          móvil) cuando visita nuestro sitio web. Las cookies se utilizan para recordar información sobre usted, como 
          sus preferencias de inicio de sesión, información de navegación y preferencias de usuario.
        </p>
      </section>

      <section className="mt-4">
        <h2>2. Tipos de Cookies que Utilizamos</h2>

        <h3>2.1 Cookies Esenciales (Consentimiento No Requerido)</h3>
        <p>
          Necesarias para el funcionamiento básico del sitio web. Sin estas cookies, no podrá iniciar sesión ni acceder 
          a sus datos. Estas cookies son técnicamente necesarias para la prestación del servicio y no requieren consentimiento 
          previo de acuerdo con la normativa GDPR.
        </p>
        <ul>
          <li><strong>Firebase Authentication Tokens:</strong> Para mantener su sesión autenticada</li>
          <li><strong>Session ID:</strong> Para rastrear su sesión actual en el sitio</li>
          <li><strong>Preferencias de Seguridad:</strong> Para proteger su cuenta y datos</li>
        </ul>

        <h3>2.2 Cookies de Sesión</h3>
        <p>
          Se utilizan para mantener su sesión activa mientras navega por nuestro sitio. Se eliminan automáticamente 
          cuando cierra su navegador. Estas cookies almacenan información temporal sobre su navegación actual.
        </p>

        <h3>2.3 Cookies de Análisis</h3>
        <p>
          <strong>Google Analytics:</strong> Utilizamos Google Analytics para recopilar información anónima sobre cómo 
          los usuarios interactúan con nuestro sitio, qué páginas son populares y cómo mejoramos continuamente. 
          Estas cookies requieren consentimiento explícito y pueden ser desactivadas en cualquier momento.
        </p>
        <ul>
          <li><strong>_ga:</strong> Identifica usuarios únicos (no almacena datos personales)</li>
          <li><strong>_gid:</strong> Almacena el ID de sesión</li>
          <li><strong>_gat:</strong> Limita la velocidad de solicitud</li>
        </ul>

        <h3>2.4 Cookies de Publicidad (Google AdSense)</h3>
        <p>
          Google utiliza cookies para mostrar anuncios relevantes en nuestro sitio. Google puede utilizar información 
          sobre sus visitas a este y otros sitios web para mostrarle anuncios de productos y servicios que le interesan. 
          Estas cookies requieren consentimiento explícito y pueden ser opt-out en cualquier momento.
        </p>
        <ul>
          <li><strong>IDE:</strong> Para mostrar anuncios relevantes</li>
          <li><strong>ANID:</strong> Para personalizar anuncios</li>
          <li><strong>NID:</strong> Para recordar sus preferencias publicitarias</li>
        </ul>

        <h3>2.5 Cookies de Almacenamiento Local (LocalStorage)</h3>
        <p>
          Utilizamos almacenamiento local del navegador para guardar preferencias de usuario y datos de aplicación. 
          Estos datos no se transmiten a servidores externos (excepto datos que usted envía explícitamente).
        </p>
      </section>

      <section className="mt-4">
        <h2>3. Cómo se Utilizan las Cookies</h2>
        <ul>
          <li><strong>Autenticación:</strong> Para mantenerlo conectado a su cuenta de forma segura</li>
          <li><strong>Preferencias:</strong> Para recordar sus configuraciones, idioma y preferencias de usuario</li>
          <li><strong>Análisis:</strong> Para entender patrones de uso del sitio y mejorar nuestros servicios</li>
          <li><strong>Seguridad:</strong> Para detectar y prevenir actividades fraudulentas, proteger contra ataques</li>
          <li><strong>Publicidad:</strong> Para mostrar anuncios relevantes basados en sus intereses</li>
          <li><strong>Funcionamiento del Sitio:</strong> Para mantener la continuidad de su experiencia de usuario</li>
        </ul>
      </section>

      <section className="mt-4">
        <h2>4. Cookies de Terceros</h2>
        <p>
          Nuestro sitio incluye servicios de terceros que pueden establecer sus propias cookies:
        </p>
        <ul>
          <li>
            <strong>Google (Analytics, AdSense, Firebase):</strong> 
            <a href="https://policies.google.com/technologies/cookies" target="_blank" rel="noopener noreferrer">
              Política de Cookies de Google
            </a> y 
            <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">
              Política de Privacidad de Google
            </a>
          </li>
          <li>
            <strong>PayPal (Pagos):</strong>
            <a href="https://www.paypal.com/legacyapps/mpp/home" target="_blank" rel="noopener noreferrer">
              Política de PayPal
            </a>
          </li>
          <li>
            <strong>Firebase (Google):</strong> Para almacenamiento seguro de datos y autenticación
          </li>
        </ul>
        <p>
          No tenemos control directo sobre cómo estos terceros utilizan sus cookies. Le recomendamos que revise 
          sus políticas de privacidad individuales.
        </p>
      </section>

      <section className="mt-4">
        <h2>5. Consentimiento de Cookies</h2>
        <p>
          Al utilizar Mantente, acepta el uso de cookies de acuerdo con esta política. Sin embargo, le ofrecemos 
          control granular sobre qué cookies permitir:
        </p>
        <ul>
          <li><strong>Cookies Esenciales:</strong> Siempre habilitadas (necesarias para funcionalidad básica)</li>
          <li><strong>Cookies de Análisis:</strong> Requieren consentimiento explícito</li>
          <li><strong>Cookies de Publicidad:</strong> Requieren consentimiento explícito</li>
        </ul>
        <p>
          Puede cambiar sus preferencias de cookies en cualquier momento a través del banner de consentimiento 
          que aparece en su primera visita o en la configuración de su navegador.
        </p>
      </section>

      <section className="mt-4">
        <h2>6. Cómo Controlar las Cookies</h2>
        <p>
          Puede controlar y/o eliminar las cookies como desee. Puede eliminar todas las cookies que ya están 
          en su dispositivo y puede configurar la mayoría de los navegadores para evitar que se coloquen. 
          Sin embargo, si hace esto, es posible que tenga que ajustar manualmente algunas preferencias 
          cada vez que visite nuestro sitio, y es posible que algunos servicios y funcionalidades no funcionen correctamente.
        </p>
        <p><strong>Para más información sobre cómo controlar cookies en su navegador:</strong></p>
        <ul>
          <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer">Google Chrome</a></li>
          <li><a href="https://support.mozilla.org/es/kb/cookies-informacion-que-sitios-web-guardan" target="_blank" rel="noopener noreferrer">Mozilla Firefox</a></li>
          <li><a href="https://support.apple.com/es-es/guide/safari/manage-cookies-and-website-data-sfri11471/mac" target="_blank" rel="noopener noreferrer">Apple Safari</a></li>
          <li><a href="https://support.microsoft.com/es-es/help/4027947" target="_blank" rel="noopener noreferrer">Microsoft Edge</a></li>
        </ul>
        <p><strong>Para opt-out de cookies de publicidad personalizadas:</strong></p>
        <ul>
          <li><a href="https://adssettings.google.com/" target="_blank" rel="noopener noreferrer">Google Ad Settings</a></li>
          <li><a href="https://www.youradchoices.com/" target="_blank" rel="noopener noreferrer">Your Ad Choices (US)</a></li>
          <li><a href="https://youradchoices.eu/" target="_blank" rel="noopener noreferrer">Your Ad Choices (EU)</a></li>
        </ul>
      </section>

      <section className="mt-4">
        <h2>7. Web Beacons y Etiquetas de Seguimiento</h2>
        <p>
          Nuestro sitio puede contener pequeñas imágenes electrónicas (web beacons) que permiten a terceros 
          como Google Analytics contar usuarios que han visitado páginas específicas. Los web beacons también pueden 
          permitir a terceros recopilar información anónima sobre su navegación web con fines de análisis.
        </p>
      </section>

      <section className="mt-4">
        <h2>8. Dirección IP y Datos Técnicos</h2>
        <p>
          Cuando visita nuestro sitio, registramos su dirección IP y otra información técnica (navegador, sistema operativo) 
          para propósitos de seguridad y análisis. Esta información se procesa de acuerdo con nuestra Política de Privacidad.
        </p>
      </section>

      <section className="mt-4">
        <h2>9. Retención de Cookies</h2>
        <ul>
          <li><strong>Cookies de Sesión:</strong> Se eliminan al cerrar el navegador</li>
          <li><strong>Cookies Persistentes:</strong> Se mantienen hasta 2 años</li>
          <li><strong>Google Analytics:</strong> Se eliminan después de 14 meses de inactividad</li>
          <li><strong>Google AdSense:</strong> Se mantienen según la política de Google</li>
        </ul>
      </section>

      <section className="mt-4">
        <h2>10. Cumplimiento GDPR y CCPA</h2>
        <p>
          Mantente cumple con el Reglamento General de Protección de Datos (GDPR) de la Unión Europea 
          y la Ley de Privacidad del Consumidor de California (CCPA):
        </p>
        <ul>
          <li><strong>Consentimiento Explícito:</strong> Solicitamos consentimiento antes de usar cookies no esenciales</li>
          <li><strong>Derecho a Retirarse:</strong> Puede cambiar sus preferencias en cualquier momento</li>
          <li><strong>Transparencia:</strong> Esta política describe claramente cómo usamos cookies</li>
          <li><strong>Derechos del Usuario:</strong> Tiene derecho a acceder, corregir o eliminar sus datos</li>
        </ul>
      </section>

      <section className="mt-4">
        <h2>11. Actualización de esta Política</h2>
        <p>
          Podemos actualizar esta Política de Cookies periódicamente. Los cambios significativos serán 
          notificados en el sitio web y se le pedirá que proporcione su consentimiento nuevamente si es necesario.
        </p>
      </section>

      <section className="mt-4">
        <h2>12. Preguntas y Soporte</h2>
        <p>
          Si tiene preguntas sobre esta Política de Cookies, contáctenos en nuestra 
          <a href="/contact"> página de contacto</a> o envíe un correo a 
          <a href="mailto:mantenteapp@gmail.com"> mantenteapp@gmail.com</a>.
        </p>
      </section>
    </div>
  );
};

export default Cookies;