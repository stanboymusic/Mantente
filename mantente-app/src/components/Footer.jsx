import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer style={{ backgroundColor: 'var(--mantente-dark-gray)' }} className="text-white mt-5 py-4">
      <div className="container">
        <div className="row">
          <div className="col-md-6">
            <img 
              src="/material visual/nombre.png" 
              alt="Mantente" 
              height="120" 
              width="auto"
              className="mb-2" 
            />
            <p style={{ color: 'var(--mantente-gold)', fontStyle: 'italic', fontSize: '1rem', fontWeight: '500' }}>
              "Decisiones claras, negocios rentables"
            </p>
          </div>
          <div className="col-md-6 text-md-end">
            <div className="small">
              <Link to="/privacy" style={{ color: 'var(--mantente-light-gray)' }} className="text-decoration-none me-3 hover-white">
                Política de Privacidad
              </Link>
              <Link to="/cookies" style={{ color: 'var(--mantente-light-gray)' }} className="text-decoration-none me-3 hover-white">
                Cookies
              </Link>
              <Link to="/contact" style={{ color: 'var(--mantente-light-gray)' }} className="text-decoration-none hover-white">
                Contacto
              </Link>
            </div>
          </div>
        </div>
        <hr className="my-3" style={{ borderColor: 'var(--mantente-taupe)' }} />
        <div className="text-center small" style={{ color: 'var(--mantente-light-gray)' }}>
          <p>&copy; {new Date().getFullYear()} Mantente. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;