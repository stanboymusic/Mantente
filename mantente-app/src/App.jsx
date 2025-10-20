// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useAppContext } from './context/AppContext';

// Componentes de la UI
import Navbar from './components/Navbar';
import Anuncios from './components/Anuncios'; 

// Componentes de las páginas
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Inventario from './components/Inventario';
import CalculadoraPrecios from './components/CalculadoraPrecios';
import Ventas from './components/Ventas'; // <--- IMPORTACIÓN DESCOMENTADA
import Premium from './components/Premium'; // <--- IMPORTACIÓN DESCOMENTADA

function App() {
  return (
    <Router>
      <AppProvider>
        <Main />
      </AppProvider>
    </Router>
  );
}

const Main = () => {
  const { user, logout, loading } = useAppContext();

  // Muestra el Login si no hay un usuario autenticado
  if (!user) {
    return <Login />;
  }
  
  // Muestra el spinner si está cargando datos iniciales
  if (loading) {
    return (
        <div className="container mt-5 text-center">
            <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Cargando...</span>
            </div>
            <p className='mt-3 text-muted'>Cargando datos de PocketBase...</p>
        </div>
    ); 
  }

  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar user={user} onLogout={logout} />
      
      <div className="container-fluid flex-grow-1">
        <div className="row">
          
          {/* Columna para anuncio izquierdo */}
          <div className="col-lg-2 d-none d-lg-block">
             <Anuncios position="left" />
          </div>

          {/* Contenido Principal */}
          <main className="col-lg-8">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/inventario" element={<Inventario />} />
              <Route path="/calculadora-precios" element={<CalculadoraPrecios />} />
              
              {/* RUTAS DESCOMENTADAS Y ACTIVAS */}
              <Route path="/ventas" element={<Ventas />} /> 
              <Route path="/premium" element={<Premium />} /> 
              
              {/* Redirecciona cualquier otra ruta a la página principal */}
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </main>

          {/* Columna para anuncio derecho */}
          <div className="col-lg-2 d-none d-lg-block">
            <Anuncios position="right" />
          </div>

        </div>
      </div>
      
      {/* Footer con anuncio */}
      <footer className="mt-auto">
        <Anuncios position="footer" />
      </footer>
    </div>
  );
};

export default App;