import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AppProvider, useApp } from "./context/AppContext";
import AppNavbar from "./components/AppNavbar"; // ✅ el nombre correcto
import Dashboard from "./components/Dashboard";
import Inventario from "./components/Inventario";
import Ventas from "./components/Ventas";
import Premium from "./components/Premium";
import CalculadoraPrecios from "./components/CalculadoraPrecios";
import Anuncios from "./components/Anuncios";
import Login from "./components/Login";
import Register from "./components/Register";
import ErrorBoundary from "./components/ErrorBoundary";
import "./styles/AdLayout.css";

const Main = () => {
  const { user } = useApp();

  return (
    <>
      {/* ✅ Aquí usa AppNavbar, no Navbar */}
      <AppNavbar />
      
      {/* Contenido Principal */}
      <div className="container mt-4">
        <Routes>
          {user ? (
            <>
              <Route path="/" element={<Dashboard />} />
              <Route path="/inventario" element={<Inventario />} />
              <Route path="/ventas" element={<Ventas />} />
              <Route path="/calculadora" element={<CalculadoraPrecios />} />
              <Route path="/premium" element={<Premium />} />
              <Route path="/anuncios" element={<Anuncios />} />
              <Route path="*" element={<Navigate to="/" />} />
            </>
          ) : (
            <>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="*" element={<Navigate to="/login" />} />
            </>
          )}
        </Routes>
      </div>
    </>
  );
};

const App = () => (
  <ErrorBoundary>
    <Router>
      <AppProvider>
        <Main />
      </AppProvider>
    </Router>
  </ErrorBoundary>
);

export default App;
