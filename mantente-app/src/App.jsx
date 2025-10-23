import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AppProvider, useApp } from "./context/AppContext";
import AppNavbar from "./components/AppNavbar";
import Dashboard from "./components/Dashboard";
import Inventario from "./components/Inventario";
import Ventas from "./components/Ventas";
import Clientes from "./components/Clientes";
import Egresos from "./components/Egresos";
import GeneradorFacturas from "./components/GeneradorFacturas";
import CierreMes from "./components/CierreMes";
import AperturaMes from "./components/AperturaMes";
import Premium from "./components/Premium";
import CalculadoraPrecios from "./components/CalculadoraPrecios";
import Anuncios from "./components/Anuncios";
import PerfilEmpresa from "./components/PerfilEmpresa";
import Login from "./components/Login";
import Register from "./components/Register";
import ErrorBoundary from "./components/ErrorBoundary";
import Privacy from "./components/Privacy";
import Cookies from "./components/Cookies";
import Contact from "./components/Contact";
import Footer from "./components/Footer";
import "./styles/AdLayout.css";

const Main = () => {
  const { user } = useApp();

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      {/* ✅ Aquí usa AppNavbar, no Navbar */}
      <AppNavbar />
      
      {/* Contenido Principal */}
      <div className="container mt-4" style={{ flex: 1 }}>
        <Routes>
          {user ? (
            <>
              <Route path="/" element={<Dashboard />} />
              <Route path="/inventario" element={<Inventario />} />
              <Route path="/ventas" element={<Ventas />} />
              <Route path="/clientes" element={<Clientes />} />
              <Route path="/egresos" element={<Egresos />} />
              <Route path="/facturas" element={<GeneradorFacturas />} />
              <Route path="/apertura-mes" element={<AperturaMes />} />
              <Route path="/cierre-mes" element={<CierreMes />} />
              <Route path="/calculadora" element={<CalculadoraPrecios />} />
              <Route path="/premium" element={<Premium />} />
              <Route path="/anuncios" element={<Anuncios />} />
              <Route path="/perfil-empresa" element={<PerfilEmpresa />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/cookies" element={<Cookies />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="*" element={<Navigate to="/" />} />
            </>
          ) : (
            <>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/cookies" element={<Cookies />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="*" element={<Navigate to="/login" />} />
            </>
          )}
        </Routes>
      </div>

      {/* Footer */}
      <Footer />
    </div>
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
