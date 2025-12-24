import Link from "next/link";

export const metadata = {
  title: "Mantente - Educación Financiera Personal",
  description: "Aprende sobre finanzas personales, presupuestos y gestión del dinero con contenido educativo gratuito. Mejora tus hábitos financieros con guías prácticas.",
};

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl">
            Educación Financiera
            <span className="block text-blue-600">para Todos</span>
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Aprende a gestionar tu dinero de manera inteligente. Contenido educativo gratuito sobre presupuestos,
            ahorro, inversiones y hábitos financieros saludables.
          </p>
          <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
            <div className="rounded-md shadow">
              <Link
                href="/blog"
                className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10"
              >
                Explorar Blog Financiero
              </Link>
            </div>
            <div className="mt-3 rounded-md shadow sm:mt-0 sm:ml-3">
              <Link
                href="/app"
                className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-blue-600 bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10"
              >
                Acceder al Dashboard
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-16">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900">Presupuestos Inteligentes</h3>
                <p className="mt-2 text-sm text-gray-500">
                  Aprende a crear y mantener presupuestos que funcionen para tu estilo de vida.
                </p>
              </div>
            </div>
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900">Estrategias de Ahorro</h3>
                <p className="mt-2 text-sm text-gray-500">
                  Descubre técnicas probadas para aumentar tus ahorros mes a mes.
                </p>
              </div>
            </div>
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900">Gestión de Deudas</h3>
                <p className="mt-2 text-sm text-gray-500">
                  Estrategias para reducir y eliminar deudas de manera efectiva.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16 bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              ¿Por qué la educación financiera importa?
            </h3>
            <div className="mt-2 max-w-xl text-sm text-gray-500">
              <p>
                La alfabetización financiera es fundamental para tomar decisiones informadas sobre tu dinero.
                Nuestros artículos te ayudan a entender conceptos básicos y avanzados de finanzas personales
                de manera clara y accesible.
              </p>
            </div>
            <div className="mt-5">
              <Link
                href="/blog"
                className="text-sm font-medium text-blue-600 hover:text-blue-500"
              >
                Leer artículos →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
