import React, { Suspense, useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AppProvider, useApp } from "./context/AppContext";
import AppNavbar from "./components/AppNavbar";
import Footer from "./components/Footer";
import ConsentBanner from "./components/ConsentBanner";
import ErrorBoundary from "./components/ErrorBoundary";
import AdLayout from "./components/AdLayout";
import "./styles/BrandingGuide.css";
import "./styles/navbar.css";
import "./styles/AuthNavbar.css";
import "./styles/FirstSteps.css";

// Code Splitting - Cargar componentes bajo demanda
const Landing = React.lazy(() => import("./components/Landing"));
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
const PerfilEmpresa = React.lazy(() => import("./components/PerfilEmpresa"));
const Login = React.lazy(() => import("./components/Login"));
const Register = React.lazy(() => import("./components/Register"));
const FirstSteps = React.lazy(() => import("./components/FirstSteps"));
const Privacy = React.lazy(() => import("./components/Privacy"));
const Cookies = React.lazy(() => import("./components/Cookies"));
const Contact = React.lazy(() => import("./components/Contact"));
const StyleGuide = React.lazy(() => import("./components/StyleGuide"));
// Componentes Premium
const Presupuestos = React.lazy(() => import("./components/Presupuestos"));
const NotasEntrega = React.lazy(() => import("./components/NotasEntrega"));
const Devoluciones = React.lazy(() => import("./components/Devoluciones"));
const Averias = React.lazy(() => import("./components/Averias"));
const LibroVentas = React.lazy(() => import("./components/LibroVentas"));
const Pedidos = React.lazy(() => import("./components/Pedidos"));
const OrdenesServicio = React.lazy(() => import("./components/OrdenesServicio"));

// Tutorial obligatorio
const Tutorial = React.lazy(() => import("./components/Tutorial"));
const HelpIcon = React.lazy(() => import("./components/HelpIcon"));

// Nuevos componentes KRISDYL
const UserManagement = React.lazy(() => import("./components/UserManagement"));
const AdvancedReports = React.lazy(() => import("./components/AdvancedReports"));
const SystemSettings = React.lazy(() => import("./components/SystemSettings"));

// Componente loading simple y ligero
const LoadingSpinner = () => (
  <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "400px" }}>
    <div className="spinner-border text-primary" role="status">
      <span className="visually-hidden">Cargando...</span>
    </div>
  </div>
);

const Main = () => {
  const { user, isPremium, tutorialCompleted, checkTutorialStatus } = useApp();
  const [showTutorial, setShowTutorial] = useState(false);
  const [tutorialChecked, setTutorialChecked] = useState(false);
  const [checkingTutorial, setCheckingTutorial] = useState(false);

  useEffect(() => {
    console.log('🔍 DEBUG: User state changed:', { user: user ? 'logged in' : 'not logged in', userId: user?.id, isPremium });
  }, [user, isPremium]);

  // Verificar tutorial inmediatamente cuando el usuario inicia sesión - PRIORIDAD MÁXIMA
  useEffect(() => {
    const verificarTutorial = async () => {
      if (user?.id && !tutorialChecked && !checkingTutorial) {
        console.log('🔍 DEBUG: Verificando estado del tutorial para usuario:', user.id);
        setCheckingTutorial(true);

        try {
          const completado = await checkTutorialStatus(user.id);
          console.log('🔍 DEBUG: Tutorial completado:', completado);

          if (!completado) {
            console.log('🎯 DEBUG: Mostrando tutorial obligatorio');
            setShowTutorial(true);
          } else {
            console.log('✅ DEBUG: Tutorial ya completado, mostrando dashboard');
            setShowTutorial(false);
          }
        } catch (error) {
          console.warn('⚠️ DEBUG: Error verificando tutorial:', error);
          // En caso de error, asumir que no está completado para mostrar tutorial
          setShowTutorial(true);
        } finally {
          setTutorialChecked(true);
          setCheckingTutorial(false);
        }
      }
    };

    // Verificar inmediatamente cuando tengamos usuario
    if (user?.id && !tutorialChecked && !checkingTutorial) {
      verificarTutorial();
    }
  }, [user?.id, tutorialChecked, checkingTutorial, checkTutorialStatus]);

  const handleTutorialComplete = () => {
    console.log('✅ DEBUG: Tutorial completado, ocultando modal');
    setShowTutorial(false);
  };

  // Mostrar loading mientras verificamos el tutorial
  if (user?.id && !tutorialChecked) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
            <span className="visually-hidden">Verificando configuración inicial...</span>
          </div>
          <p className="mt-3 text-muted">Preparando tu experiencia en Mantente...</p>
        </div>
      </div>
    );
  }

  // Si el tutorial está activo, mostrar solo el tutorial
  if (showTutorial) {
    return (
      <Suspense fallback={<LoadingSpinner />}>
        <Tutorial onComplete={handleTutorialComplete} />
      </Suspense>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      {user && <AppNavbar />}

      {/* Contenido Principal */}
      <div style={{ flex: 1 }}>
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            {user ? (
              <>
                <Route path="/" element={
                  <Suspense fallback={<LoadingSpinner />}>
                    <AdLayout>
                      <Dashboard />
                    </AdLayout>
                  </Suspense>
                } />
                <Route path="/inventario" element={
                  <Suspense fallback={<LoadingSpinner />}>
                    <AdLayout>
                      <Inventario />
                    </AdLayout>
                  </Suspense>
                } />
                <Route path="/ventas" element={
                  <Suspense fallback={<LoadingSpinner />}>
                    <AdLayout>
                      <Ventas />
                    </AdLayout>
                  </Suspense>
                } />
                <Route path="/clientes" element={
                  <Suspense fallback={<LoadingSpinner />}>
                    <AdLayout>
                      <Clientes />
                    </AdLayout>
                  </Suspense>
                } />
                <Route path="/egresos" element={
                  <Suspense fallback={<LoadingSpinner />}>
                    <AdLayout>
                      <Egresos />
                    </AdLayout>
                  </Suspense>
                } />
                <Route path="/facturas" element={
                  <Suspense fallback={<LoadingSpinner />}>
                    <AdLayout>
                      <GeneradorFacturas />
                    </AdLayout>
                  </Suspense>
                } />
                <Route path="/apertura-mes" element={
                  <Suspense fallback={<LoadingSpinner />}>
                    <AdLayout>
                      <AperturaMes />
                    </AdLayout>
                  </Suspense>
                } />
                <Route path="/cierre-mes" element={
                  <Suspense fallback={<LoadingSpinner />}>
                    <AdLayout>
                      <CierreMes />
                    </AdLayout>
                  </Suspense>
                } />
                <Route path="/calculadora" element={
                  <Suspense fallback={<LoadingSpinner />}>
                    <AdLayout>
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
                    <AdLayout>
                      <PerfilEmpresa />
                    </AdLayout>
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
                {/* Rutas Premium */}
                <Route path="/presupuestos" element={
                  <Suspense fallback={<LoadingSpinner />}>
                    <AdLayout>
                      <Presupuestos />
                    </AdLayout>
                  </Suspense>
                } />
                <Route path="/notas-entrega" element={
                  <Suspense fallback={<LoadingSpinner />}>
                    <AdLayout>
                      <NotasEntrega />
                    </AdLayout>
                  </Suspense>
                } />
                <Route path="/devoluciones" element={
                  <Suspense fallback={<LoadingSpinner />}>
                    <AdLayout>
                      <Devoluciones />
                    </AdLayout>
                  </Suspense>
                } />
                <Route path="/averias" element={
                  <Suspense fallback={<LoadingSpinner />}>
                    <AdLayout>
                      <Averias />
                    </AdLayout>
                  </Suspense>
                } />
                <Route path="/libro-ventas" element={
                  <Suspense fallback={<LoadingSpinner />}>
                    <AdLayout>
                      <LibroVentas />
                    </AdLayout>
                  </Suspense>
                } />
                <Route path="/pedidos" element={
                  <Suspense fallback={<LoadingSpinner />}>
                    <AdLayout>
                      <Pedidos />
                    </AdLayout>
                  </Suspense>
                } />
                <Route path="/ordenes-servicio" element={
                  <Suspense fallback={<LoadingSpinner />}>
                    <AdLayout>
                      <OrdenesServicio />
                    </AdLayout>
                  </Suspense>
                } />
                {/* Nuevas rutas KRISDYL */}
                <Route path="/users" element={
                  <Suspense fallback={<LoadingSpinner />}>
                    <AdLayout>
                      <UserManagement />
                    </AdLayout>
                  </Suspense>
                } />
                <Route path="/reports" element={
                  <Suspense fallback={<LoadingSpinner />}>
                    <AdLayout>
                      <AdvancedReports />
                    </AdLayout>
                  </Suspense>
                } />
                <Route path="/system-settings" element={
                  <Suspense fallback={<LoadingSpinner />}>
                    <AdLayout>
                      <SystemSettings />
                    </AdLayout>
                  </Suspense>
                } />
                <Route path="*" element={<Navigate to="/" />} />
              </>
            ) : (
              <>
                <Route path="/" element={
                  <Suspense fallback={<LoadingSpinner />}>
                    <Landing />
                  </Suspense>
                } />
                <Route path="/login" element={
                  <Suspense fallback={<LoadingSpinner />}>
                    <Login />
                  </Suspense>
                } />
                <Route path="/register" element={
                  <Suspense fallback={<LoadingSpinner />}>
                    <Register />
                  </Suspense>
                } />
                <Route path="/first-steps" element={
                  <Suspense fallback={<LoadingSpinner />}>
                    <FirstSteps />
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
                <Route path="*" element={<Navigate to="/" />} />
              </>
            )}
          </Routes>
        </Suspense>
      </div>

      {/* Footer */}
      <Footer />

      {/* Icono de Ayuda - Solo mostrar si tutorial está completado */}
      {user && tutorialCompleted && tutorialChecked && (
        <Suspense fallback={null}>
          <HelpIcon />
        </Suspense>
      )}

      {/* Cookie Consent Banner */}
      <ToastContainer />
      <ConsentBanner />
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
