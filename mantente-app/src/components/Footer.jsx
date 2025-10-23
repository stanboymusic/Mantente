import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-dark text-white mt-5 py-4">
      <div className="container">
        <div className="row">
          <div className="col-md-6">
            <h6>Mantente</h6>
            <p className="small text-muted">
              Gestiona tu inventario y ventas de forma fácil y eficiente.
            </p>
          </div>
          <div className="col-md-6 text-md-end">
            <div className="small">
              <Link to="/privacy" className="text-white-50 text-decoration-none me-3">
                Política de Privacidad
              </Link>
              <Link to="/cookies" className="text-white-50 text-decoration-none me-3">
                Cookies
              </Link>
              <Link to="/contact" className="text-white-50 text-decoration-none">
                Contacto
              </Link>
            </div>
          </div>
        </div>
        <hr className="my-3 border-secondary" />
        <div className="text-center text-muted small">
          <p>&copy; {new Date().getFullYear()} Mantente. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;