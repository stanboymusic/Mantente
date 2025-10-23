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
          sus preferencias de inicio de sesión.
        </p>
      </section>

      <section className="mt-4">
        <h2>2. Tipos de Cookies que Utilizamos</h2>

        <h3>Cookies Esenciales</h3>
        <p>
          Necesarias para el funcionamiento básico del sitio web. Sin estas cookies, 
          no podrá iniciar sesión ni acceder a sus datos.
        </p>

        <h3>Cookies de Sesión</h3>
        <p>
          Se utilizan para mantener su sesión activa mientras navega por nuestro sitio.
        </p>

        <h3>Cookies de Análisis</h3>
        <p>
          Nos ayudan a entender cómo los usuarios interactúan con nuestro sitio, qué páginas son populares 
          y cómo mejoramos continuamente.
        </p>

        <h3>Cookies de Publicidad (Google AdSense)</h3>
        <p>
          Google utiliza cookies para mostrar anuncios relevantes. Google puede utilizar información sobre 
          sus visitas a este y otros sitios web para mostrarle anuncios de productos y servicios que le interesan.
        </p>
      </section>

      <section className="mt-4">
        <h2>3. Cómo se Utilizan las Cookies</h2>
        <ul>
          <li><strong>Autenticación:</strong> Para mantenerlo conectado a su cuenta</li>
          <li><strong>Preferencias:</strong> Para recordar sus configuraciones y preferencias</li>
          <li><strong>Análisis:</strong> Para entender patrones de uso del sitio</li>
          <li><strong>Seguridad:</strong> Para detectar y prevenir actividades fraudulentas</li>
          <li><strong>Publicidad:</strong> Para mostrar anuncios relevantes</li>
        </ul>
      </section>

      <section className="mt-4">
        <h2>4. Cookies de Terceros</h2>
        <p>
          Nuestro sitio puede incluir contenido de terceros, como Google AdSense. Estos terceros pueden 
          establecer sus propias cookies. No tenemos control directo sobre cómo estos terceros utilizan sus cookies. 
          Le recomendamos que revise sus políticas de privacidad:
        </p>
        <ul>
          <li>
            <strong>Google:</strong> 
            <a href="https://policies.google.com/technologies/cookies" target="_blank" rel="noopener noreferrer">
              Política de Cookies de Google
            </a>
          </li>
          <li>
            <strong>Google AdSense:</strong> 
            <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">
              Política de Privacidad de Google
            </a>
          </li>
        </ul>
      </section>

      <section className="mt-4">
        <h2>5. Cómo Controlar las Cookies</h2>
        <p>
          Puede controlar y/o eliminar las cookies como desee. Puede eliminar todas las cookies que ya están 
          en su dispositivo y puede configurar la mayoría de los navegadores para evitar que se coloquen. 
          Sin embargo, si hace esto, es posible que tenga que ajustar manualmente algunas preferencias 
          cada vez que visite nuestro sitio, y es posible que algunos servicios y funcionalidades no funcionen.
        </p>
        <p>Para más información sobre cómo controlar cookies en su navegador:</p>
        <ul>
          <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer">Google Chrome</a></li>
          <li><a href="https://support.mozilla.org/es/kb/cookies-informacion-que-sitios-web-guardan" target="_blank" rel="noopener noreferrer">Mozilla Firefox</a></li>
          <li><a href="https://support.apple.com/es-es/guide/safari/manage-cookies-and-website-data-sfri11471/mac" target="_blank" rel="noopener noreferrer">Apple Safari</a></li>
          <li><a href="https://support.microsoft.com/es-es/help/4027947" target="_blank" rel="noopener noreferrer">Microsoft Edge</a></li>
        </ul>
      </section>

      <section className="mt-4">
        <h2>6. Web Beacons</h2>
        <p>
          Nuestro sitio puede contener pequeñas imágenes electrónicas (web beacons) que permiten a Google 
          contar usuarios que han visitado páginas específicas. Los web beacons permiten a terceros recopilar 
          información sobre su navegación web.
        </p>
      </section>

      <section className="mt-4">
        <h2>7. Actualización de esta Política</h2>
        <p>
          Podemos actualizar esta Política de Cookies periódicamente. Los cambios significativos serán 
          notificados en el sitio web.
        </p>
      </section>

      <section className="mt-4">
        <h2>8. Contacto</h2>
        <p>
          Si tiene preguntas sobre esta Política de Cookies, contáctenos en nuestra 
          <a href="/contact"> página de contacto</a>.
        </p>
      </section>
    </div>
  );
};

export default Cookies;