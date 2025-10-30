import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../styles/AuthNavbar.css';

const AuthNavbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const handleNavigation = (path) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  return (
    <nav className="auth-navbar">
      <div className="auth-navbar-container">
        {/* Logo */}
        <div className="auth-navbar-logo" onClick={() => handleNavigation('/')}>
          <img src="/material visual/logo.png" alt="Mantente" className="auth-logo-image" />
          <span className="auth-logo-text">Mantente</span>
        </div>

        {/* Menu Desktop */}
        <div className={`auth-navbar-menu ${mobileMenuOpen ? 'active' : ''}`}>
          <a 
            href="/" 
            onClick={(e) => { e.preventDefault(); handleNavigation('/'); }}
            className={`auth-nav-link ${isActive('/') ? 'active' : ''}`}
          >
            Landing
          </a>
          <a 
            href="/#features"
            onClick={(e) => { 
              e.preventDefault(); 
              const element = document.querySelector('.features-section');
              if (element) element.scrollIntoView({ behavior: 'smooth' });
            }}
            className="auth-nav-link"
          >
            Características
          </a>
          <a 
            href="/#pricing"
            onClick={(e) => { 
              e.preventDefault(); 
              const element = document.querySelector('.pricing-section');
              if (element) element.scrollIntoView({ behavior: 'smooth' });
            }}
            className="auth-nav-link"
          >
            Precios
          </a>
          <a 
            href="#"
            onClick={(e) => { 
              e.preventDefault(); 
              handleNavigation('/first-steps');
            }}
            className={`auth-nav-link ${isActive('/first-steps') ? 'active' : ''}`}
          >
            Cómo Funciona
          </a>
        </div>

        {/* Botones Auth */}
        <div className="auth-navbar-buttons">
          <button 
            className="auth-btn-login"
            onClick={() => handleNavigation('/login')}
          >
            Iniciar Sesión
          </button>
          <button 
            className="auth-btn-register"
            onClick={() => handleNavigation('/register')}
          >
            Registrarse
          </button>
        </div>

        {/* Mobile Menu Toggle */}
        <button 
          className="auth-navbar-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </nav>
  );
};

export default AuthNavbar;