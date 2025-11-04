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
          Cumplimos con el Reglamento General de Protección de Datos (GDPR), la Ley de Privacidad del 
          Consumidor de California (CCPA) y otras normativas de privacidad aplicables.
        </p>
      </section>

      <section className="mt-4">
        <h2>2. Información que Recopilamos</h2>
        <p>Podemos recopilar información sobre usted de varias maneras, entre ellas:</p>
        <ul>
          <li><strong>Información proporcionada directamente:</strong> Nombre, correo electrónico, contraseña, nombre de la empresa, número de teléfono y otra información que proporciona durante el registro.</li>
          <li><strong>Información de uso:</strong> Cómo utiliza nuestro sitio, incluidas las páginas visitadas, el tiempo invertido y las acciones realizadas, mediante análisis y tecnologías de seguimiento.</li>
          <li><strong>Información técnica:</strong> Dirección IP, navegador utilizado, sistema operativo, dispositivo, idioma y datos de cookies.</li>
          <li><strong>Información de ubicación:</strong> Ubicación geográfica aproximada derivada de la dirección IP (no se recopila precisión GPS a menos que usted lo autorice explícitamente).</li>
          <li><strong>Información de inventario y ventas:</strong> Los datos que ingresa en su cuenta (inventario, ventas, clientes, etc.) se almacenan de forma segura en nuestros servidores.</li>
          <li><strong>Información de pago:</strong> Si compra una suscripción premium, PayPal procesa la información de pago. Nosotros no almacenamos detalles de tarjetas de crédito.</li>
        </ul>
      </section>

      <section className="mt-4">
        <h2>3. Cómo Utilizamos su Información</h2>
        <p>Utilizamos la información recopilada para:</p>
        <ul>
          <li>Proporcionar, mantener y mejorar nuestros servicios</li>
          <li>Procesar transacciones y enviar información relacionada con pagos</li>
          <li>Enviarle actualizaciones, alertas de seguridad y cambios de política (solo con su consentimiento)</li>
          <li>Responder a sus consultas y proporcionar soporte al cliente</li>
          <li>Mejorar la experiencia del usuario y personalizar el contenido (basado en su actividad de navegación)</li>
          <li>Cumplir con obligaciones legales y reglamentarias</li>
          <li>Detectar, prevenir y abordar fraude y problemas técnicos</li>
          <li>Análisis agregado para comprender tendencias de uso del sitio</li>
        </ul>
      </section>

      <section className="mt-4">
        <h2>4. Publicidad (Google AdSense)</h2>
        <p>
          Nuestro sitio utiliza Google AdSense para mostrar anuncios. Google puede utilizar cookies, web beacons 
          y otras tecnologías para recopilar información sobre sus actividades de navegación con el fin de mostrarle 
          anuncios más relevantes. Estos anuncios se personalizan basándose en:
        </p>
        <ul>
          <li>Su historial de navegación</li>
          <li>Ubicación geográfica aproximada (por IP)</li>
          <li>Intereses inferidos</li>
          <li>Búsquedas anteriores</li>
        </ul>
        <p>
          <strong>Puede optar por no participar en publicidad personalizada:</strong> Visite 
          <a href="https://adssettings.google.com/" target="_blank" rel="noopener noreferrer"> Google Ad Settings</a> 
          para gestionar sus preferencias publicitarias.
        </p>
        <p>
          Para más información sobre las prácticas de privacidad de Google, visite 
          <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">
          https://policies.google.com/privacy</a>.
        </p>
      </section>

      <section className="mt-4">
        <h2>5. Cookies y Tecnologías de Seguimiento</h2>
        <p>
          Utilizamos cookies y otras tecnologías de seguimiento para mejorar su experiencia. Para información detallada 
          sobre qué cookies utilizamos, cómo controlarlas y tus derechos, consulte nuestra 
          <a href="/cookies"> Política de Cookies</a>.
        </p>
        <p><strong>Resumen rápido:</strong></p>
        <ul>
          <li><strong>Cookies Esenciales:</strong> Se instalan automáticamente para funcionalidad básica</li>
          <li><strong>Cookies de Análisis:</strong> Requieren su consentimiento explícito</li>
          <li><strong>Cookies de Publicidad:</strong> Requieren su consentimiento explícito</li>
        </ul>
      </section>

      <section className="mt-4">
        <h2>6. Compartición de Datos</h2>
        <p>
          <strong>NO compartimos su información personal con terceros para marketing directo.</strong> Sin embargo, 
          podemos compartir información en los siguientes casos:
        </p>
        <ul>
          <li><strong>Proveedores de servicios:</strong> Firebase (Google), PayPal, Google Analytics - bajo acuerdos de confidencialidad estrictos</li>
          <li><strong>Requisitos legales:</strong> Si lo requiere la ley o una autoridad judicial</li>
          <li><strong>Protección de derechos:</strong> Para prevenir fraude, seguridad o proteger nuestros derechos legales</li>
          <li><strong>Con su consentimiento:</strong> Solo si usted ha aceptado explícitamente</li>
        </ul>
      </section>

      <section className="mt-4">
        <h2>7. Ubicación Geográfica y Datos Técnicos</h2>
        <p>
          <strong>Recopilación de ubicación:</strong> Recopilamos ubicación geográfica aproximada basada en su dirección IP. 
          Esta ubicación se utiliza para:
        </p>
        <ul>
          <li>Mejorar la experiencia del usuario</li>
          <li>Personalizar anuncios relevantes para su región</li>
          <li>Fines de análisis y seguridad</li>
          <li>Cumplir con regulaciones locales</li>
        </ul>
        <p>
          <strong>NO recopilamos datos precisos de ubicación (GPS) sin su consentimiento explícito.</strong> 
          Si en el futuro queremos acceder a ubicación precisa, se lo pediremos de forma clara y explícita.
        </p>
        <p>
          <strong>Información técnica que recopilamos:</strong> Dirección IP, tipo de navegador, sistema operativo, 
          tipo de dispositivo, idioma preferido, y páginas visitadas. Esta información se procesa de acuerdo con esta política.
        </p>
      </section>

      <section className="mt-4">
        <h2>8. Seguridad de la Información</h2>
        <p>
          Implementamos medidas de seguridad técnicas, administrativas y físicas para proteger su información personal 
          contra el acceso no autorizado, la alteración, la divulgación o la destrucción:
        </p>
        <ul>
          <li><strong>Encriptación:</strong> Utilizamos HTTPS y encriptación de datos en tránsito y en reposo</li>
          <li><strong>Autenticación:</strong> Firebase proporciona autenticación segura y gestión de sesiones</li>
          <li><strong>Acceso limitado:</strong> Solo personal autorizado puede acceder a datos personales</li>
          <li><strong>Auditoría de seguridad:</strong> Realizamos pruebas de seguridad regulares</li>
        </ul>
        <p>
          Sin embargo, ningún método de transmisión por Internet es 100% seguro. Aunque nos comprometemos a proteger 
          su información, no podemos garantizar una seguridad absoluta.
        </p>
      </section>

      <section className="mt-4">
        <h2>9. Retención de Datos</h2>
        <p>
          <strong>Período de retención:</strong>
        </p>
        <ul>
          <li><strong>Datos de cuenta activa:</strong> Se retienen mientras su cuenta esté activa</li>
          <li><strong>Datos después de eliminación de cuenta:</strong> Se eliminan dentro de 30 días (excepto donde la ley requiera retención más larga)</li>
          <li><strong>Datos de análisis:</strong> Se agregan y anonomizan después de 14 meses</li>
          <li><strong>Registros de seguridad:</strong> Se retienen durante 1 año para fines de seguridad</li>
        </ul>
        <p>
          Si desea que eliminemos sus datos, puede contactarnos a través de nuestra 
          <a href="/contact"> página de contacto</a>. Procesaremos su solicitud dentro de 30 días.
        </p>
      </section>

      <section className="mt-4">
        <h2>10. Derechos del Usuario (GDPR/CCPA)</h2>
        <p>
          <strong>Dependiendo de su ubicación, tiene los siguientes derechos:</strong>
        </p>
        <ul>
          <li><strong>Derecho de acceso:</strong> Puede solicitar una copia de sus datos personales</li>
          <li><strong>Derecho de rectificación:</strong> Puede corregir datos inexactos o incompletos</li>
          <li><strong>Derecho de eliminación:</strong> Puede solicitar la eliminación de sus datos ("derecho al olvido")</li>
          <li><strong>Derecho de restricción:</strong> Puede solicitar que limitemos el procesamiento de sus datos</li>
          <li><strong>Derecho de portabilidad:</strong> Puede solicitar sus datos en formato estructurado para transferir a otro servicio</li>
          <li><strong>Derecho de oposición:</strong> Puede oponerse al procesamiento de datos para marketing o publicidad personalizada</li>
          <li><strong>Derechos de decisión automatizada:</strong> Tiene derecho a no ser sujeto de decisiones basadas únicamente en procesamiento automatizado</li>
        </ul>
        <p>
          Para ejercer estos derechos, contáctenos en nuestra <a href="/contact">página de contacto</a> o 
          envíe un correo a <a href="mailto:mantenteapp@gmail.com">mantenteapp@gmail.com</a>. Responderemos 
          dentro de 30 días.
        </p>
      </section>

      <section className="mt-4">
        <h2>11. Cumplimiento Normativo</h2>
        <p>
          <strong>GDPR (Unión Europea):</strong> Mantente cumple con el Reglamento General de Protección de Datos, 
          incluyendo base legal para procesamiento de datos, derechos de datos y transferencias internacionales.
        </p>
        <p>
          <strong>CCPA (California, USA):</strong> Mantente cumple con la Ley de Privacidad del Consumidor de California, 
          incluyendo derechos de acceso, eliminación y portabilidad de datos.
        </p>
        <p>
          <strong>Transferencias internacionales:</strong> Si sus datos se transfieren fuera de su país, utilizamos 
          mecanismos legales como Cláusulas Contractuales Estándar para proteger sus derechos.
        </p>
      </section>

      <section className="mt-4">
        <h2>12. Cambios en esta Política</h2>
        <p>
          Podemos actualizar esta Política de Privacidad periódicamente. Nos comprometemos a informarle sobre cambios 
          significativos publicando la nueva versión en el sitio web. Si se realizan cambios materiales, 
          le notificaremos por correo electrónico o mediante un aviso prominente en el sitio.
        </p>
      </section>

      <section className="mt-4">
        <h2>13. Contacto</h2>
        <p>
          Si tiene preguntas sobre esta Política de Privacidad o desea ejercer alguno de sus derechos, 
          puede contactarnos de las siguientes maneras:
        </p>
        <ul>
          <li><strong>Email:</strong> <a href="mailto:mantenteapp@gmail.com">mantenteapp@gmail.com</a></li>
          <li><strong>Formulario de contacto:</strong> <a href="/contact">Página de Contacto</a></li>
          <li><strong>Teléfono:</strong> +58 04141773879</li>
        </ul>
        <p>
          Si cree que sus derechos de privacidad han sido violados, también puede presentar una reclamación 
          ante su autoridad de protección de datos local.
        </p>
      </section>
    </div>
  );
};

export default Privacy;