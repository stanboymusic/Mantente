import React from 'react';

const AdLayout = ({ children }) => {
  // Anuncios eliminados del dashboard según política de AdSense YMYL
  // Los anuncios solo se mostrarán en el blog público
  return <div className="container mx-auto px-4 py-6">{children}</div>;
};

export default AdLayout;