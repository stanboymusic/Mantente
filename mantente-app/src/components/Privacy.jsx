import React from "react";

const Privacy = () => {
  return (
    <div className="container mt-5 mb-5">
      <h1>Política de Privacidad</h1>
      <p className="text-muted">Última actualización: {new Date().toLocaleDateString("es-ES")}</p>

      <section className="mt-4">
        <h2>1. Introducción</h2>
        <p>
          Mantente ("nosotros", "nuestro", "nuestros" o "la Empresa") respeta la privacidad de nuestros usuarios 
          ("usuario" o "usted"). Esta Política de Privacidad explica cómo recopilamos, utilizamos, divulgamos y 
          salvaguardamos la información cuando visita nuestro sitio web y utiliza nuestros servicios.
        </p>
      </section>

      <section className="mt-4">
        <h2>2. Información que Recopilamos</h2>
        <p>Podemos recopilar información sobre usted de varias maneras, entre ellas:</p>
        <ul>
          <li><strong>Información proporcionada directamente:</strong> Nombre, correo electrónico, contraseña y otra información que proporciona durante el registro.</li>
          <li><strong>Información de uso:</strong> Cómo utiliza nuestro sitio, incluidas las páginas visitadas, el tiempo invertido y las acciones realizadas.</li>
          <li><strong>Información técnica:</strong> Dirección IP, navegador utilizado, sistema operativo y datos de cookies.</li>
          <li><strong>Información de inventario y ventas:</strong> Los datos que ingresa en su cuenta (inventario, ventas, etc.) se almacenan en nuestros servidores.</li>
        </ul>
      </section>

      <section className="mt-4">
        <h2>3. Cómo Utilizamos su Información</h2>
        <p>Utilizamos la información recopilada para:</p>
        <ul>
          <li>Proporcionar, mantener y mejorar nuestros servicios</li>
          <li>Procesar transacciones y enviar información relacionada</li>
          <li>Enviarle actualizaciones, alertas de seguridad y cambios de política</li>
          <li>Responder a sus consultas y proporcionar soporte al cliente</li>
          <li>Mejorar la experiencia del usuario y personalizar el contenido</li>
          <li>Cumplir con obligaciones legales</li>
        </ul>
      </section>

      <section className="mt-4">
        <h2>4. Publicidad (Google AdSense)</h2>
        <p>
          Nuestro sitio utiliza Google AdSense para mostrar anuncios. Google puede utilizar cookies, web beacons 
          y otras tecnologías para recopilar información sobre sus actividades de navegación con el fin de mostrarle 
          anuncios más relevantes. Para obtener más información sobre las prácticas de privacidad de Google, 
          visite <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">
          https://policies.google.com/privacy</a>.
        </p>
      </section>

      <section className="mt-4">
        <h2>5. Cookies</h2>
        <p>
          Utilizamos cookies para mejorar su experiencia en nuestro sitio. Para más información sobre cómo utilizamos 
          cookies, consulte nuestra <a href="/cookies">Política de Cookies</a>.
        </p>
      </section>

      <section className="mt-4">
        <h2>6. Seguridad de la Información</h2>
        <p>
          Implementamos medidas de seguridad técnicas, administrativas y físicas para proteger su información personal 
          contra el acceso no autorizado, la alteración, la divulgación o la destrucción. Sin embargo, ningún método de 
          transmisión por Internet es 100% seguro.
        </p>
      </section>

      <section className="mt-4">
        <h2>7. Retención de Datos</h2>
        <p>
          Mantenemos su información personal mientras su cuenta esté activa. Si desea que eliminemos sus datos, 
          puede contactarnos a través de nuestra <a href="/contact">página de contacto</a>.
        </p>
      </section>

      <section className="mt-4">
        <h2>8. Derechos del Usuario</h2>
        <p>Dependiendo de su ubicación, puede tener derechos como:</p>
        <ul>
          <li>Acceder a sus datos personales</li>
          <li>Corregir datos inexactos</li>
          <li>Solicitar la eliminación de sus datos</li>
          <li>Oponerse al procesamiento de datos</li>
          <li>Solicitar la portabilidad de datos</li>
        </ul>
        <p>Para ejercer estos derechos, contáctenos en nuestra <a href="/contact">página de contacto</a>.</p>
      </section>

      <section className="mt-4">
        <h2>9. Cambios en esta Política</h2>
        <p>
          Podemos actualizar esta Política de Privacidad periódicamente. Nos comprometemos a informarle sobre cambios 
          significativos publicando la nueva versión en el sitio web.
        </p>
      </section>

      <section className="mt-4">
        <h2>10. Contacto</h2>
        <p>
          Si tiene preguntas sobre esta Política de Privacidad, contáctenos en nuestra 
          <a href="/contact"> página de contacto</a>.
        </p>
      </section>
    </div>
  );
};

export default Privacy;