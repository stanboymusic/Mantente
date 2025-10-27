import React from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { Navbar, Container, Nav, Button, Image, NavDropdown } from "react-bootstrap";

// AppNavbar - Sin memo para permitir re-renders cuando isPremium cambia
const AppNavbar = () => {
  const { logout, user, isPremium } = useApp();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <Navbar bg="white" variant="light" expand="lg" className="shadow-sm">
      <Container>
        <Navbar.Brand
          onClick={() => navigate("/")}
          style={{ cursor: "pointer" }}
          className="d-flex align-items-center flex-shrink-0"
        >
          <Image 
            src="/material visual/logo.png" 
            alt="Mantente Logo" 
            height="50" 
            width="auto"
            className="me-2"
            loading="lazy"
            style={{
              maxHeight: "50px",
              height: "auto",
              objectFit: "contain"
            }}
          />
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="navbar-content" />
        <Navbar.Collapse id="navbar-content">
          {/* Navbar mejorada con dos secciones: Básica y Premium */}
          <Nav className="ms-auto align-items-center navbar-items-container" style={{ gap: "0.3rem", overflow: "auto", maxHeight: "calc(100vh - 80px)" }}>
            {user && (
              <>
                {/* ========== FUNCIONES BÁSICAS ========== */}
                <Nav.Link 
                  onClick={() => navigate("/")}
                  className="nav-icon-link"
                  title="Dashboard"
                >
                  <Image src="/material visual/dashboard icon.png" alt="Dashboard" height="28" width="auto" />
                  <span className="d-none d-lg-inline">Dashboard</span>
                </Nav.Link>

                <Nav.Link 
                  onClick={() => navigate("/inventario")}
                  className="nav-icon-link"
                  title="Inventario"
                >
                  <Image src="/material visual/inventario icon.png" alt="Inventario" height="28" width="auto" />
                  <span className="d-none d-lg-inline">Inventario</span>
                </Nav.Link>

                <Nav.Link 
                  onClick={() => navigate("/ventas")}
                  className="nav-icon-link"
                  title="Ventas"
                >
                  <Image src="/material visual/ventas icon.png" alt="Ventas" height="28" width="auto" />
                  <span className="d-none d-lg-inline">Ventas</span>
                </Nav.Link>

                <Nav.Link 
                  onClick={() => navigate("/clientes")}
                  className="nav-icon-link"
                  title="Clientes"
                >
                  <Image src="/material visual/clientes icon.png" alt="Clientes" height="28" width="auto" />
                  <span className="d-none d-lg-inline">Clientes</span>
                </Nav.Link>

                <Nav.Link 
                  onClick={() => navigate("/egresos")}
                  className="nav-icon-link"
                  title="Egresos"
                >
                  <Image src="/material visual/egresos icon.png" alt="Egresos" height="28" width="auto" />
                  <span className="d-none d-lg-inline">Egresos</span>
                </Nav.Link>

                <Nav.Link 
                  onClick={() => navigate("/facturas")}
                  className="nav-icon-link"
                  title="Facturas"
                >
                  <Image src="/material visual/facturas icon.png" alt="Facturas" height="28" width="auto" />
                  <span className="d-none d-lg-inline">Facturas</span>
                </Nav.Link>

                <Nav.Link 
                  onClick={() => navigate("/apertura-mes")}
                  className="nav-icon-link"
                  title="Apertura"
                >
                  <Image src="/material visual/apertura de mes icon.png" alt="Apertura" height="28" width="auto" />
                  <span className="d-none d-lg-inline">Apertura</span>
                </Nav.Link>

                <Nav.Link 
                  onClick={() => navigate("/cierre-mes")}
                  className="nav-icon-link"
                  title="Cierre"
                >
                  <Image src="/material visual/cierre mes icon.png" alt="Cierre" height="28" width="auto" />
                  <span className="d-none d-lg-inline">Cierre</span>
                </Nav.Link>

                <Nav.Link 
                  onClick={() => navigate("/calculadora")}
                  className="nav-icon-link"
                  title="Calculadora"
                >
                  <Image src="/material visual/calculadora icon.png" alt="Calculadora" height="28" width="auto" />
                  <span className="d-none d-lg-inline">Calculadora</span>
                </Nav.Link>

                {/* ========== SEPARADOR VISUAL ========== */}
                {isPremium && <div className="nav-divider"></div>}

                {/* ========== FUNCIONES PREMIUM - EXPANDIDAS COMO ICONOS ========== */}
                {isPremium && (
                  <>
                    {/* 💰 Presupuestos */}
                    <Nav.Link 
                      onClick={() => navigate("/presupuestos")}
                      className="nav-icon-link nav-premium-link"
                      title="Presupuestos"
                    >
                      <span className="premium-icon">💰</span>
                      <span className="d-none d-lg-inline">Presupuestos</span>
                    </Nav.Link>

                    {/* 📦 Notas de Entrega */}
                    <Nav.Link 
                      onClick={() => navigate("/notas-entrega")}
                      className="nav-icon-link nav-premium-link"
                      title="Notas de Entrega"
                    >
                      <span className="premium-icon">📦</span>
                      <span className="d-none d-lg-inline">Notas</span>
                    </Nav.Link>

                    {/* ↩️ Devoluciones */}
                    <Nav.Link 
                      onClick={() => navigate("/devoluciones")}
                      className="nav-icon-link nav-premium-link"
                      title="Devoluciones"
                    >
                      <span className="premium-icon">↩️</span>
                      <span className="d-none d-lg-inline">Devoluciones</span>
                    </Nav.Link>

                    {/* 📊 Libro de Ventas */}
                    <Nav.Link 
                      onClick={() => navigate("/libro-ventas")}
                      className="nav-icon-link nav-premium-link"
                      title="Libro de Ventas"
                    >
                      <span className="premium-icon">📊</span>
                      <span className="d-none d-lg-inline">Libro</span>
                    </Nav.Link>

                    {/* 📋 Pedidos */}
                    <Nav.Link 
                      onClick={() => navigate("/pedidos")}
                      className="nav-icon-link nav-premium-link"
                      title="Pedidos"
                    >
                      <span className="premium-icon">📋</span>
                      <span className="d-none d-lg-inline">Pedidos</span>
                    </Nav.Link>

                    {/* 🔧 Órdenes de Servicio */}
                    <Nav.Link 
                      onClick={() => navigate("/ordenes-servicio")}
                      className="nav-icon-link nav-premium-link"
                      title="Órdenes de Servicio"
                    >
                      <span className="premium-icon">🔧</span>
                      <span className="d-none d-lg-inline">Órdenes</span>
                    </Nav.Link>
                  </>
                )}

                {/* Botón Premium para no-premium */}
                {!isPremium && (
                  <Nav.Link 
                    onClick={() => navigate("/premium")}
                    className="nav-icon-link premium-btn-link"
                    title="Obtener Premium"
                  >
                    <Image src="/material visual/premium icon.png" alt="Premium" height="28" width="auto" />
                    <span className="d-none d-lg-inline">Premium</span>
                  </Nav.Link>
                )}

                {/* ========== UTILIDADES ========== */}
                <div className="nav-divider"></div>

                <Nav.Link 
                  onClick={() => navigate("/perfil-empresa")}
                  className="nav-icon-link"
                  title="Perfil"
                >
                  <Image src="/material visual/perfil icon.png" alt="Perfil" height="28" width="auto" />
                  <span className="d-none d-lg-inline">Perfil</span>
                </Nav.Link>

                <Button
                  variant="outline-danger"
                  size="sm"
                  onClick={handleLogout}
                  className="nav-logout-btn"
                  title="Salir"
                >
                  <Image 
                    src="/material visual/logout icon.png" 
                    alt="Salir" 
                    height="24" 
                    width="auto"
                    className="me-md-1"
                  />
                  <span className="d-none d-lg-inline" style={{ fontSize: "0.85rem" }}>Salir</span>
                </Button>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default AppNavbar;
