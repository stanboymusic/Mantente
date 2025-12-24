export default function Footer() {
  return (
    <footer className="bg-gray-100 py-8 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-4">
            Mantente no proporciona asesoramiento financiero, legal ni fiscal. El contenido es solo educativo.
          </p>
          <div className="flex justify-center space-x-6">
            <a href="/privacy-policy" className="text-sm text-gray-600 hover:text-gray-900">
              Política de Privacidad
            </a>
            <a href="/terms" className="text-sm text-gray-600 hover:text-gray-900">
              Términos de Servicio
            </a>
            <a href="/disclaimer" className="text-sm text-gray-600 hover:text-gray-900">
              Descargo de Responsabilidad
            </a>
          </div>
          <p className="text-xs text-gray-500 mt-4">
            © 2024 Mantente. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}