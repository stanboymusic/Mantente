import React from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { Navbar, Container, Nav, Button, Image } from "react-bootstrap";

// Optimización: Memorizar componente para evitar re-renders innecesarios
const AppNavbar = React.memo(() => {
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
          <Nav className="ms-auto align-items-center mantene-nav" style={{ gap: "0.5rem" }}>
            {user && (
              <>
                <Nav.Link 
                  onClick={() => navigate("/")}
                  className="nav-link d-flex align-items-center justify-content-center"
                  style={{ minWidth: "40px", minHeight: "40px", padding: "0.25rem" }}
                  title="Dashboard"
                >
                  <Image 
                    src="/material visual/dashboard icon.png" 
                    alt="Dashboard" 
                    height="28" 
                    width="auto"
                    className="me-md-1" 
                    style={{ maxHeight: "28px" }}
                  />
                  <span className="d-none d-lg-inline" style={{ fontSize: "0.85rem" }}>Dashboard</span>
                </Nav.Link>
                <Nav.Link 
                  onClick={() => navigate("/inventario")}
                  className="nav-link d-flex align-items-center justify-content-center"
                  style={{ minWidth: "40px", minHeight: "40px", padding: "0.25rem" }}
                  title="Inventario"
                >
                  <Image 
                    src="/material visual/inventario icon.png" 
                    alt="Inventario" 
                    height="28" 
                    width="auto"
                    className="me-md-1" 
                    style={{ maxHeight: "28px" }}
                  />
                  <span className="d-none d-lg-inline" style={{ fontSize: "0.85rem" }}>Inventario</span>
                </Nav.Link>
                <Nav.Link 
                  onClick={() => navigate("/ventas")}
                  className="nav-link d-flex align-items-center justify-content-center"
                  style={{ minWidth: "40px", minHeight: "40px", padding: "0.25rem" }}
                  title="Ventas"
                >
                  <Image 
                    src="/material visual/ventas icon.png" 
                    alt="Ventas" 
                    height="28" 
                    width="auto"
                    className="me-md-1" 
                    style={{ maxHeight: "28px" }}
                  />
                  <span className="d-none d-lg-inline" style={{ fontSize: "0.85rem" }}>Ventas</span>
                </Nav.Link>
                <Nav.Link 
                  onClick={() => navigate("/clientes")}
                  className="nav-link d-flex align-items-center justify-content-center"
                  style={{ minWidth: "40px", minHeight: "40px", padding: "0.25rem" }}
                  title="Clientes"
                >
                  <Image 
                    src="/material visual/clientes icon.png" 
                    alt="Clientes" 
                    height="28" 
                    width="auto"
                    className="me-md-1" 
                    style={{ maxHeight: "28px" }}
                  />
                  <span className="d-none d-lg-inline" style={{ fontSize: "0.85rem" }}>Clientes</span>
                </Nav.Link>
                <Nav.Link 
                  onClick={() => navigate("/egresos")}
                  className="nav-link d-flex align-items-center justify-content-center"
                  style={{ minWidth: "40px", minHeight: "40px", padding: "0.25rem" }}
                  title="Egresos"
                >
                  <Image 
                    src="/material visual/egresos icon.png" 
                    alt="Egresos" 
                    height="28" 
                    width="auto"
                    className="me-md-1" 
                    style={{ maxHeight: "28px" }}
                  />
                  <span className="d-none d-lg-inline" style={{ fontSize: "0.85rem" }}>Egresos</span>
                </Nav.Link>
                <Nav.Link 
                  onClick={() => navigate("/facturas")}
                  className="nav-link d-flex align-items-center justify-content-center"
                  style={{ minWidth: "40px", minHeight: "40px", padding: "0.25rem" }}
                  title="Facturas"
                >
                  <Image 
                    src="/material visual/facturas icon.png" 
                    alt="Facturas" 
                    height="28" 
                    width="auto"
                    className="me-md-1" 
                    style={{ maxHeight: "28px" }}
                  />
                  <span className="d-none d-lg-inline" style={{ fontSize: "0.85rem" }}>Facturas</span>
                </Nav.Link>
                <Nav.Link 
                  onClick={() => navigate("/apertura-mes")}
                  className="nav-link d-flex align-items-center justify-content-center"
                  style={{ minWidth: "40px", minHeight: "40px", padding: "0.25rem" }}
                  title="Apertura"
                >
                  <Image 
                    src="/material visual/apertura de mes icon.png" 
                    alt="Apertura Mes" 
                    height="28" 
                    width="auto"
                    className="me-md-1" 
                    style={{ maxHeight: "28px" }}
                  />
                  <span className="d-none d-lg-inline" style={{ fontSize: "0.85rem" }}>Apertura</span>
                </Nav.Link>
                <Nav.Link 
                  onClick={() => navigate("/cierre-mes")}
                  className="nav-link d-flex align-items-center justify-content-center"
                  style={{ minWidth: "40px", minHeight: "40px", padding: "0.25rem" }}
                  title="Cierre"
                >
                  <Image 
                    src="/material visual/cierre mes icon.png" 
                    alt="Cierre Mes" 
                    height="28" 
                    width="auto"
                    className="me-md-1" 
                    style={{ maxHeight: "28px" }}
                  />
                  <span className="d-none d-lg-inline" style={{ fontSize: "0.85rem" }}>Cierre</span>
                </Nav.Link>
                <Nav.Link 
                  onClick={() => navigate("/calculadora")}
                  className="nav-link d-flex align-items-center justify-content-center"
                  style={{ minWidth: "40px", minHeight: "40px", padding: "0.25rem" }}
                  title="Calculadora"
                >
                  <Image 
                    src="/material visual/calculadora icon.png" 
                    alt="Calculadora" 
                    height="28" 
                    width="auto"
                    className="me-md-1" 
                    style={{ maxHeight: "28px" }}
                  />
                  <span className="d-none d-lg-inline" style={{ fontSize: "0.85rem" }}>Calculadora</span>
                </Nav.Link>
                <Nav.Link 
                  onClick={() => navigate("/premium")}
                  className={isPremium ? "nav-link mantente-text-gold fw-bold d-flex align-items-center justify-content-center" : "nav-link d-flex align-items-center justify-content-center"}
                  style={{ minWidth: "40px", minHeight: "40px", padding: "0.25rem" }}
                  title="Premium"
                >
                  <Image 
                    src="/material visual/premium icon.png" 
                    alt="Premium" 
                    height="28" 
                    width="auto"
                    className="me-md-1" 
                    style={{ maxHeight: "28px" }}
                  />
                  <span className="d-none d-lg-inline" style={{ fontSize: "0.85rem" }}>Premium</span>
                </Nav.Link>
                <Nav.Link 
                  onClick={() => navigate("/perfil-empresa")}
                  className="nav-link d-flex align-items-center justify-content-center"
                  style={{ minWidth: "40px", minHeight: "40px", padding: "0.25rem" }}
                  title="Perfil"
                >
                  <Image 
                    src="/material visual/perfil icon.png" 
                    alt="Perfil" 
                    height="28" 
                    width="auto"
                    className="me-md-1" 
                    style={{ maxHeight: "28px" }}
                  />
                  <span className="d-none d-lg-inline" style={{ fontSize: "0.85rem" }}>Perfil</span>
                </Nav.Link>
                <Button
                  variant="outline-danger"
                  size="sm"
                  onClick={handleLogout}
                  className="d-flex align-items-center justify-content-center"
                  style={{ minWidth: "40px", minHeight: "40px", padding: "0.25rem", marginLeft: "0.5rem" }}
                  title="Salir"
                >
                  <Image 
                    src="/material visual/logout icon.png" 
                    alt="Salir" 
                    height="24" 
                    width="auto"
                    className="me-md-1" 
                    style={{ maxHeight: "24px" }}
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
});

AppNavbar.displayName = "AppNavbar";
export default AppNavbar;
