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
import Ventas from './components/Ventas'; 
import Premium from './components/Premium'; 

function App() {
  // 💡 App es el componente que debe contener el AppProvider.
  return (
    <Router>
      <AppProvider>
        <Main />
      </AppProvider>
    </Router>
  );
}

const Main = () => {
  // ✅ Este hook ahora funciona porque Main está anidado dentro de AppProvider (en el componente App).
  const { user, logout, loading } = useAppContext();

  // Muestra el Login si no hay un usuario autenticado
  if (!user) {
    return <Login />;
  }
  
  // Muestra el spinner si está cargando datos iniciales
  if (loading) {
    return (
        <div className="d-flex justify-content-center align-items-center min-vh-100"> 
            <div className="text-center">
                <div className="spinner-border text-primary mb-3" role="status">
                    <span className="visually-hidden">Cargando...</span>
                </div>
                <p className="text-muted">Cargando datos. Por favor espera...</p> 
            </div>
        </div>
    ); 
  }
  
  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar user={user} onLogout={logout} />
      
      <div className="container-fluid flex-grow-1">
        <div className="row">
          
          <div className="col-lg-2 d-none d-lg-block">
             <Anuncios position="left" />
          </div>

          {/* Contenido Principal */}
          <main className="col-lg-8">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/inventario" element={<Inventario />} />
              <Route path="/calculadora-precios" element={<CalculadoraPrecios />} />
              <Route path="/ventas" element={<Ventas />} /> 
              <Route path="/premium" element={<Premium />} /> 
              
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </main>

          <div className="col-lg-2 d-none d-lg-block">
            <Anuncios position="right" />
          </div>

        </div>
      </div>
      
      <div className="p-4 bg-light mt-auto">
        <Anuncios position="footer" />
        <p className="text-center text-muted small mt-2">Mantente App © 2024</p>
      </div>
    </div>
  );
};

// 🌟 CORRECCIÓN CLAVE 🌟
export default App; // ¡DEBE SER 'App'! Esto soluciona el error de contexto.