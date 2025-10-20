import React from 'react';

const Anuncios = ({ position }) => {
  // En producción, inserta aquí el código de AdSense, ej:
  // <ins className="adsbygoogle" style={{display: 'block'}} data-ad-client="ca-pub-XXXX" data-ad-slot="XXXX" data-ad-format="auto"></ins>
  // (script): (adsbygoogle = window.adsbygoogle || []).push({});

  const getAdStyle = () => {
    switch (position) {
      case 'left': return { height: '600px', background: '#f8f9fa', margin: '10px 0' };
      case 'right': return { height: '300px', background: '#f8f9fa', margin: '10px 0' };
      case 'footer': return { height: '50px', background: '#f8f9fa', textAlign: 'center', padding: '10px' };
      default: return {};
    }
  };

  return (
    <div style={getAdStyle()}>
      <p className="text-center text-muted small">
        {position === 'footer' ? 'Anuncio Footer' : `Espacio Publicitario (${position})`}
      </p>
      {/* Aquí va el AdSense real */}
      <div className="bg-light p-3">Banner AdSense Placeholder</div>
    </div>
  );
};

export default Anuncios;