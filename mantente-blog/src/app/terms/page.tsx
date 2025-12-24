export const metadata = {
  title: "Términos de Servicio - Mantente",
  description: "Términos y condiciones de uso del sitio web de Mantente.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-8 sm:px-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">
              Términos de Servicio
            </h1>

            <div className="prose prose-lg max-w-none">
              <p className="text-gray-600 mb-6">
                <strong>Última actualización:</strong> 24 de diciembre de 2024
              </p>

              <h2>1. Aceptación de los Términos</h2>
              <p>
                Al acceder y utilizar Mantente, aceptas estar sujeto a estos términos de servicio.
                Si no estás de acuerdo con estos términos, no utilices nuestro sitio web.
              </p>

              <h2>2. Descripción del Servicio</h2>
              <p>
                Mantente proporciona contenido educativo sobre finanzas personales. Nuestro contenido
                es únicamente informativo y no constituye asesoramiento financiero, legal o fiscal.
              </p>

              <h2>3. Uso Aceptable</h2>
              <p>
                Te comprometes a utilizar nuestro sitio web de manera legal y apropiada. No debes:
              </p>
              <ul>
                <li>Utilizar el sitio para actividades ilegales</li>
                <li>Intentar acceder a áreas restringidas</li>
                <li>Interferir con el funcionamiento del sitio</li>
                <li>Violar derechos de propiedad intelectual</li>
              </ul>

              <h2>4. Contenido del Usuario</h2>
              <p>
                Si proporcionas contenido al sitio, garantizas que tienes los derechos necesarios
                y nos otorgas una licencia limitada para utilizar dicho contenido.
              </p>

              <h2>5. Descargo de Responsabilidad</h2>
              <p>
                El contenido de este sitio se proporciona "tal cual". No garantizamos la exactitud,
                integridad o utilidad de la información proporcionada.
              </p>

              <h2>6. Limitación de Responsabilidad</h2>
              <p>
                En la medida máxima permitida por la ley, no seremos responsables por daños
                directos, indirectos o consecuentes derivados del uso de nuestro sitio.
              </p>

              <h2>7. Modificaciones</h2>
              <p>
                Nos reservamos el derecho de modificar estos términos en cualquier momento.
                Los cambios entrarán en vigor inmediatamente después de su publicación.
              </p>

              <h2>8. Ley Aplicable</h2>
              <p>
                Estos términos se rigen por las leyes aplicables en la jurisdicción correspondiente.
              </p>

              <h2>9. Contacto</h2>
              <p>
                Para preguntas sobre estos términos, contáctanos a través de nuestro sitio web.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}