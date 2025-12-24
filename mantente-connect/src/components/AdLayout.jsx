import React from 'react';
import Anuncios from './Anuncios';
import { useAuthStore } from '../store/authStore';

const AdLayout = ({ children, showAds = null }) => {
  const user = useAuthStore((state) => state.user);

  // Mostrar anuncios solo si el usuario está autenticado
  // Si showAds es explícitamente false, no mostrar anuncios
  const shouldShowAds = showAds !== false && !!user;

  // Si no debe mostrar anuncios, renderizar solo el contenido
  if (!shouldShowAds) {
    return <div className="container mx-auto px-4 py-6">{children}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          {/* Anuncio lateral izquierdo - solo visible en pantallas extra grandes */}
          <div className="hidden xl:block xl:col-span-2">
            <div className="sticky top-6">
              <Anuncios position="left" />
            </div>
          </div>

          {/* Contenido principal */}
          <div className="col-span-1 xl:col-span-8">
            <div className="bg-white rounded-lg shadow-sm p-6">
              {/* Contenido real de la página */}
              <div className="mb-6">
                {children}
              </div>

              {/* Anuncio inferior - visible en todas las pantallas */}
              <div className="mt-8">
                <Anuncios position="footer" />
              </div>
            </div>
          </div>

          {/* Anuncio lateral derecho - solo visible en pantallas extra grandes */}
          <div className="hidden xl:block xl:col-span-2">
            <div className="sticky top-6">
              <Anuncios position="right" />
            </div>
          </div>
        </div>

        {/* Anuncio móvil - solo visible en pantallas pequeñas y medianas */}
        <div className="xl:hidden mt-6">
          <Anuncios position="mobile" />
        </div>
      </div>
    </div>
  );
};

export default AdLayout;