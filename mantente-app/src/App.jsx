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
import AdLayout from "./components/AdLayout";
import PerfilEmpresa from "./components/PerfilEmpresa";
import Login from "./components/Login";
import Register from "./components/Register";
import ErrorBoundary from "./components/ErrorBoundary";
import Privacy from "./components/Privacy";
import Cookies from "./components/Cookies";
import Contact from "./components/Contact";
import StyleGuide from "./components/StyleGuide";
import Footer from "./components/Footer";
import "./styles/AdLayout.css";
import "./styles/BrandingGuide.css";

const Main = () => {
  const { user } = useApp();

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      {/* ✅ Aquí usa AppNavbar, no Navbar */}
      <AppNavbar />
      
      {/* Contenido Principal */}
      <div style={{ flex: 1 }}>
        <Routes>
          {user ? (
            <>
              <Route path="/" element={
                <AdLayout showAds={!user.isPremium}>
                  <Dashboard />
                </AdLayout>
              } />
              <Route path="/inventario" element={
                <AdLayout showAds={!user.isPremium}>
                  <Inventario />
                </AdLayout>
              } />
              <Route path="/ventas" element={
                <AdLayout showAds={!user.isPremium}>
                  <Ventas />
                </AdLayout>
              } />
              <Route path="/clientes" element={
                <AdLayout showAds={!user.isPremium}>
                  <Clientes />
                </AdLayout>
              } />
              <Route path="/egresos" element={
                <AdLayout showAds={!user.isPremium}>
                  <Egresos />
                </AdLayout>
              } />
              <Route path="/facturas" element={
                <AdLayout showAds={!user.isPremium}>
                  <GeneradorFacturas />
                </AdLayout>
              } />
              <Route path="/apertura-mes" element={
                <AdLayout showAds={!user.isPremium}>
                  <AperturaMes />
                </AdLayout>
              } />
              <Route path="/cierre-mes" element={
                <AdLayout showAds={!user.isPremium}>
                  <CierreMes />
                </AdLayout>
              } />
              <Route path="/calculadora" element={
                <AdLayout showAds={!user.isPremium}>
                  <CalculadoraPrecios />
                </AdLayout>
              } />
              <Route path="/premium" element={
                <div className="container mt-4">
                  <Premium />
                </div>
              } />
              <Route path="/perfil-empresa" element={
                <div className="container mt-4">
                  <PerfilEmpresa />
                </div>
              } />
              <Route path="/privacy" element={
                <div className="container mt-4">
                  <Privacy />
                </div>
              } />
              <Route path="/cookies" element={
                <div className="container mt-4">
                  <Cookies />
                </div>
              } />
              <Route path="/contact" element={
                <div className="container mt-4">
                  <Contact />
                </div>
              } />
              <Route path="/style-guide" element={
                <div className="container mt-4">
                  <StyleGuide />
                </div>
              } />
              <Route path="*" element={<Navigate to="/" />} />
            </>
          ) : (
            <>
              <Route path="/login" element={
                <div className="container mt-4">
                  <Login />
                </div>
              } />
              <Route path="/register" element={
                <div className="container mt-4">
                  <Register />
                </div>
              } />
              <Route path="/privacy" element={
                <div className="container mt-4">
                  <Privacy />
                </div>
              } />
              <Route path="/cookies" element={
                <div className="container mt-4">
                  <Cookies />
                </div>
              } />
              <Route path="/contact" element={
                <div className="container mt-4">
                  <Contact />
                </div>
              } />
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
