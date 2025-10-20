import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

const Navbar = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const { isPremium } = useAppContext();

  const handleLogout = () => {
    onLogout();
    navigate('/');
  };

  return (
    // --- CAMBIO: Clases actualizadas para un tema claro. 'navbar-dark bg-dark' se convierte en 'navbar-light bg-white' ---
    <nav className="navbar navbar-expand-lg navbar-light bg-white">
      <div className="container-fluid">
        <Link className="navbar-brand" to="/">📊 Mantente</Link>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <NavLink className="nav-link" to="/">Dashboard</NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/inventario">Inventario</NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/ventas">Ventas</NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/calculadora-precios">Calculadora</NavLink>
            </li>
            {!isPremium && (
              <li className="nav-item">
                <NavLink className="nav-link text-primary" to="/premium">
                  🚀 Activar Premium
                </NavLink>
              </li>
            )}
          </ul>
          <ul className="navbar-nav">
            <li className="nav-item">
              <span className="navbar-text me-3">
                Hola, {user?.nombre} {isPremium && '⭐'}
              </span>
            </li>
            <li className="nav-item">
              <button className="btn btn-outline-danger" onClick={handleLogout}>Cerrar Sesión</button>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;