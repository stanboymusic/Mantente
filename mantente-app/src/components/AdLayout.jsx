import React from 'react';

const AdLayout = ({ children }) => {
  // Anuncios eliminados de la aplicación según política - solo se mostrarán en el blog
  return <div className="container mt-4">{children}</div>;
};

export default AdLayout;