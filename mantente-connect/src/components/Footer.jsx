import React from 'react'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-dark text-white border-t border-dark-gray mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-center md:text-left">
            <p className="text-sm">
              🛰️ <span className="font-bold">Mantente Connect</span> © {currentYear}
            </p>
            <p className="text-xs text-gray">Gestión offline de inventario y ventas</p>
          </div>

          <div className="flex gap-6 text-sm">
            <a href="#" className="hover:text-gold transition-colors">
              Soporte
            </a>
            <a href="#" className="hover:text-gold transition-colors">
              Política
            </a>
            <a href="#" className="hover:text-gold transition-colors">
              Términos
            </a>
          </div>

          <div className="text-xs text-gray">
            "Decisiones claras, negocios rentables"
          </div>
        </div>
      </div>
    </footer>
  )
}