import React, { Suspense } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AppProvider, useApp } from "./context/AppContext";
import AppNavbar from "./components/AppNavbar";
import Footer from "./components/Footer";
import ErrorBoundary from "./components/ErrorBoundary";
import "./styles/AdLayout.css";
import "./styles/ads.css";
import "./styles/BrandingGuide.css";

// Code Splitting - Cargar componentes bajo demanda
const Dashboard = React.lazy(() => import("./components/Dashboard"));
const Inventario = React.lazy(() => import("./components/Inventario"));
const Ventas = React.lazy(() => import("./components/Ventas"));
const Clientes = React.lazy(() => import("./components/Clientes"));
const Egresos = React.lazy(() => import("./components/Egresos"));
const GeneradorFacturas = React.lazy(() => import("./components/GeneradorFacturas"));
const CierreMes = React.lazy(() => import("./components/CierreMes"));
const AperturaMes = React.lazy(() => import("./components/AperturaMes"));
const Premium = React.lazy(() => import("./components/Premium"));
const CalculadoraPrecios = React.lazy(() => import("./components/CalculadoraPrecios"));
const AdLayout = React.lazy(() => import("./components/AdLayout"));
const PerfilEmpresa = React.lazy(() => import("./components/PerfilEmpresa"));
const Login = React.lazy(() => import("./components/Login"));
const Register = React.lazy(() => import("./components/Register"));
const Privacy = React.lazy(() => import("./components/Privacy"));
const Cookies = React.lazy(() => import("./components/Cookies"));
const Contact = React.lazy(() => import("./components/Contact"));
const StyleGuide = React.lazy(() => import("./components/StyleGuide"));

// Componente loading simple y ligero
const LoadingSpinner = () => (
  <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "400px" }}>
    <div className="spinner-border text-primary" role="status">
      <span className="visually-hidden">Cargando...</span>
    </div>
  </div>
);

const Main = () => {
  const { user } = useApp();

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <AppNavbar />
      
      {/* Contenido Principal */}
      <div style={{ flex: 1 }}>
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            {user ? (
              <>
                <Route path="/" element={
                  <Suspense fallback={<LoadingSpinner />}>
                    <AdLayout showAds={!user.isPremium}>
                      <Dashboard />
                    </AdLayout>
                  </Suspense>
                } />
                <Route path="/inventario" element={
                  <Suspense fallback={<LoadingSpinner />}>
                    <AdLayout showAds={!user.isPremium}>
                      <Inventario />
                    </AdLayout>
                  </Suspense>
                } />
                <Route path="/ventas" element={
                  <Suspense fallback={<LoadingSpinner />}>
                    <AdLayout showAds={!user.isPremium}>
                      <Ventas />
                    </AdLayout>
                  </Suspense>
                } />
                <Route path="/clientes" element={
                  <Suspense fallback={<LoadingSpinner />}>
                    <AdLayout showAds={!user.isPremium}>
                      <Clientes />
                    </AdLayout>
                  </Suspense>
                } />
                <Route path="/egresos" element={
                  <Suspense fallback={<LoadingSpinner />}>
                    <AdLayout showAds={!user.isPremium}>
                      <Egresos />
                    </AdLayout>
                  </Suspense>
                } />
                <Route path="/facturas" element={
                  <Suspense fallback={<LoadingSpinner />}>
                    <AdLayout showAds={!user.isPremium}>
                      <GeneradorFacturas />
                    </AdLayout>
                  </Suspense>
                } />
                <Route path="/apertura-mes" element={
                  <Suspense fallback={<LoadingSpinner />}>
                    <AdLayout showAds={!user.isPremium}>
                      <AperturaMes />
                    </AdLayout>
                  </Suspense>
                } />
                <Route path="/cierre-mes" element={
                  <Suspense fallback={<LoadingSpinner />}>
                    <AdLayout showAds={!user.isPremium}>
                      <CierreMes />
                    </AdLayout>
                  </Suspense>
                } />
                <Route path="/calculadora" element={
                  <Suspense fallback={<LoadingSpinner />}>
                    <AdLayout showAds={!user.isPremium}>
                      <CalculadoraPrecios />
                    </AdLayout>
                  </Suspense>
                } />
                <Route path="/premium" element={
                  <Suspense fallback={<LoadingSpinner />}>
                    <div className="container mt-4">
                      <Premium />
                    </div>
                  </Suspense>
                } />
                <Route path="/perfil-empresa" element={
                  <Suspense fallback={<LoadingSpinner />}>
                    <div className="container mt-4">
                      <PerfilEmpresa />
                    </div>
                  </Suspense>
                } />
                <Route path="/privacy" element={
                  <Suspense fallback={<LoadingSpinner />}>
                    <div className="container mt-4">
                      <Privacy />
                    </div>
                  </Suspense>
                } />
                <Route path="/cookies" element={
                  <Suspense fallback={<LoadingSpinner />}>
                    <div className="container mt-4">
                      <Cookies />
                    </div>
                  </Suspense>
                } />
                <Route path="/contact" element={
                  <Suspense fallback={<LoadingSpinner />}>
                    <div className="container mt-4">
                      <Contact />
                    </div>
                  </Suspense>
                } />
                <Route path="/style-guide" element={
                  <Suspense fallback={<LoadingSpinner />}>
                    <div className="container mt-4">
                      <StyleGuide />
                    </div>
                  </Suspense>
                } />
                <Route path="*" element={<Navigate to="/" />} />
              </>
            ) : (
              <>
                <Route path="/login" element={
                  <Suspense fallback={<LoadingSpinner />}>
                    <div className="container mt-4">
                      <Login />
                    </div>
                  </Suspense>
                } />
                <Route path="/register" element={
                  <Suspense fallback={<LoadingSpinner />}>
                    <div className="container mt-4">
                      <Register />
                    </div>
                  </Suspense>
                } />
                <Route path="/privacy" element={
                  <Suspense fallback={<LoadingSpinner />}>
                    <div className="container mt-4">
                      <Privacy />
                    </div>
                  </Suspense>
                } />
                <Route path="/cookies" element={
                  <Suspense fallback={<LoadingSpinner />}>
                    <div className="container mt-4">
                      <Cookies />
                    </div>
                  </Suspense>
                } />
                <Route path="/contact" element={
                  <Suspense fallback={<LoadingSpinner />}>
                    <div className="container mt-4">
                      <Contact />
                    </div>
                  </Suspense>
                } />
                <Route path="*" element={<Navigate to="/login" />} />
              </>
            )}
          </Routes>
        </Suspense>
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
