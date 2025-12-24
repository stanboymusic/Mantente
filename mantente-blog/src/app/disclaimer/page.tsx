export const metadata = {
  title: "Descargo de Responsabilidad - Mantente",
  description: "Descargo de responsabilidad financiera de Mantente.",
};

export default function DisclaimerPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-8 sm:px-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">
              Descargo de Responsabilidad
            </h1>

            <div className="prose prose-lg max-w-none">
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
                <div className="flex">
                  <div className="ml-3">
                    <p className="text-sm text-yellow-700">
                      <strong>Importante:</strong> Mantente no proporciona asesoramiento financiero, legal ni fiscal.
                      El contenido de este sitio es únicamente educativo e informativo.
                    </p>
                  </div>
                </div>
              </div>

              <h2>Información General</h2>
              <p>
                Todo el contenido publicado en Mantente, incluyendo artículos, guías y recursos,
                tiene como único propósito proporcionar información educativa general sobre temas
                relacionados con las finanzas personales.
              </p>

              <h2>No es Asesoramiento Profesional</h2>
              <p>
                La información proporcionada no constituye asesoramiento financiero, de inversión,
                legal, contable o fiscal. No debe interpretarse como una recomendación para comprar,
                vender o mantener ningún valor mobiliario, instrumento financiero o producto de inversión.
              </p>

              <h2>Riesgos y Decisiones</h2>
              <p>
                Todas las decisiones de inversión y financieras deben basarse en tu propia investigación
                y consulta con profesionales calificados. Los mercados financieros pueden ser volátiles
                y existe el riesgo de pérdida de capital.
              </p>

              <h2>Exactitud de la Información</h2>
              <p>
                Aunque nos esforzamos por proporcionar información precisa y actualizada, no garantizamos
                la exactitud, integridad o actualidad de la información. Las condiciones del mercado
                y las regulaciones pueden cambiar.
              </p>

              <h2>Resultados No Garantizados</h2>
              <p>
                El uso de la información proporcionada no garantiza ningún resultado específico.
                El rendimiento pasado no es indicativo de resultados futuros.
              </p>

              <h2>Responsabilidad Limitada</h2>
              <p>
                En la medida máxima permitida por la ley, Mantente y sus afiliados no serán responsables
                por pérdidas o daños derivados del uso de la información proporcionada en este sitio.
              </p>

              <h2>Consulta a Profesionales</h2>
              <p>
                Te recomendamos encarecidamente consultar con asesores financieros, contadores o abogados
                calificados antes de tomar cualquier decisión financiera importante.
              </p>

              <h2>Actualizaciones</h2>
              <p>
                Este descargo de responsabilidad puede actualizarse periódicamente. Te recomendamos
                revisarlo regularmente.
              </p>

              <p className="text-sm text-gray-600 mt-8">
                Al utilizar este sitio web, reconoces y aceptas este descargo de responsabilidad.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}