import React from 'react';
import Anuncios from './Anuncios';
import { Container, Row, Col } from 'react-bootstrap';
import { useApp } from '../context/AppContext';

const AdLayout = ({ children, showAds = null }) => {
  const { isPremium } = useApp();
  
  // Determinar si mostrar anuncios
  // Si showAds es explícitamente null/undefined, usar el estado isPremium del contexto
  const shouldShowAds = showAds !== null ? showAds : !isPremium;
  
  // Si el usuario es premium o showAds es false, no mostrar anuncios
  if (!shouldShowAds) {
    return <div className="container mt-4">{children}</div>;
  }

  return (
    <Container fluid className="px-0">
      <Row className="mx-0">
        {/* Anuncio lateral izquierdo - solo visible en pantallas extra grandes */}
        <Col xl={2} className="d-none d-xl-block px-2">
          <div className="sticky-top" style={{ top: '20px', zIndex: 10 }}>
            <Anuncios position="left" />
          </div>
        </Col>

        {/* Contenido principal */}
        <Col xs={12} xl={8}>
          <div className="main-content px-3">
            {/* Contenido real de la página - IMPORTANTE para cumplir con las políticas de AdSense */}
            <div className="mb-4">
              {children}
            </div>

            {/* Anuncio inferior - visible en todas las pantallas */}
            <div className="mt-4 mb-5">
              <Anuncios position="footer" />
            </div>
          </div>
        </Col>

        {/* Anuncio lateral derecho - solo visible en pantallas extra grandes */}
        <Col xl={2} className="d-none d-xl-block px-2">
          <div className="sticky-top" style={{ top: '20px', zIndex: 10 }}>
            <Anuncios position="right" />
          </div>
        </Col>
      </Row>

      {/* Anuncio móvil - solo visible en pantallas pequeñas y medianas */}
      <Row className="d-xl-none mx-0 mt-3">
        <Col xs={12}>
          <Anuncios position="mobile" />
        </Col>
      </Row>
    </Container>
  );
};

export default AdLayout;