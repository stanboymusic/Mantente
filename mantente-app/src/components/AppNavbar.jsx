import React from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { Navbar, Container, Nav, Button, Image } from "react-bootstrap";

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
          className="d-flex align-items-center"
        >
          <Image 
            src="/material visual/logo.png" 
            alt="Mantente Logo" 
            height="80" 
            width="auto"
            className="me-2" 
          />
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="navbar-content" />
        <Navbar.Collapse id="navbar-content">
          <Nav className="ms-auto align-items-center mantente-nav">
            {user && (
              <>
                <Nav.Link 
                  onClick={() => navigate("/")}
                  className="nav-link"
                >
                  <Image 
                    src="/material visual/dashboard icon.png" 
                    alt="Dashboard" 
                    height="24" 
                    width="auto"
                    className="me-1" 
                  />
                  <span className="d-none d-lg-inline">Dashboard</span>
                </Nav.Link>
                <Nav.Link 
                  onClick={() => navigate("/inventario")}
                  className="nav-link"
                >
                  <Image 
                    src="/material visual/inventario icon.png" 
                    alt="Inventario" 
                    height="24" 
                    width="auto"
                    className="me-1" 
                  />
                  <span className="d-none d-lg-inline">Inventario</span>
                </Nav.Link>
                <Nav.Link 
                  onClick={() => navigate("/ventas")}
                  className="nav-link"
                >
                  <Image 
                    src="/material visual/ventas icon.png" 
                    alt="Ventas" 
                    height="24" 
                    width="auto"
                    className="me-1" 
                  />
                  <span className="d-none d-lg-inline">Ventas</span>
                </Nav.Link>
                <Nav.Link 
                  onClick={() => navigate("/clientes")}
                  className="nav-link"
                >
                  <Image 
                    src="/material visual/clientes icon.png" 
                    alt="Clientes" 
                    height="24" 
                    width="auto"
                    className="me-1" 
                  />
                  <span className="d-none d-lg-inline">Clientes</span>
                </Nav.Link>
                <Nav.Link 
                  onClick={() => navigate("/egresos")}
                  className="nav-link"
                >
                  <Image 
                    src="/material visual/egresos icon.png" 
                    alt="Egresos" 
                    height="24" 
                    width="auto"
                    className="me-1" 
                  />
                  <span className="d-none d-lg-inline">Egresos</span>
                </Nav.Link>
                <Nav.Link 
                  onClick={() => navigate("/facturas")}
                  className="nav-link"
                >
                  <Image 
                    src="/material visual/facturas icon.png" 
                    alt="Facturas" 
                    height="24" 
                    width="auto"
                    className="me-1" 
                  />
                  <span className="d-none d-lg-inline">Facturas</span>
                </Nav.Link>
                <Nav.Link 
                  onClick={() => navigate("/apertura-mes")}
                  className="nav-link"
                >
                  <Image 
                    src="/material visual/apertura de mes icon.png" 
                    alt="Apertura Mes" 
                    height="24" 
                    width="auto"
                    className="me-1" 
                  />
                  <span className="d-none d-lg-inline">Apertura</span>
                </Nav.Link>
                <Nav.Link 
                  onClick={() => navigate("/cierre-mes")}
                  className="nav-link"
                >
                  <Image 
                    src="/material visual/cierre mes icon.png" 
                    alt="Cierre Mes" 
                    height="24" 
                    width="auto"
                    className="me-1" 
                  />
                  <span className="d-none d-lg-inline">Cierre</span>
                </Nav.Link>
                <Nav.Link 
                  onClick={() => navigate("/calculadora")}
                  className="nav-link"
                >
                  <Image 
                    src="/material visual/calculadora icon.png" 
                    alt="Calculadora" 
                    height="24" 
                    width="auto"
                    className="me-1" 
                  />
                  <span className="d-none d-lg-inline">Calculadora</span>
                </Nav.Link>
                <Nav.Link 
                  onClick={() => navigate("/premium")}
                  className={isPremium ? "nav-link mantente-text-gold fw-bold" : "nav-link"}
                >
                  <Image 
                    src="/material visual/premium icon.png" 
                    alt="Premium" 
                    height="24" 
                    width="auto"
                    className="me-1" 
                  />
                  <span className="d-none d-lg-inline">Premium</span>
                </Nav.Link>
                <Nav.Link 
                  onClick={() => navigate("/perfil-empresa")}
                  className="nav-link"
                >
                  <Image 
                    src="/material visual/perfil icon.png" 
                    alt="Perfil" 
                    height="24" 
                    width="auto"
                    className="me-1" 
                  />
                  <span className="d-none d-lg-inline">Perfil</span>
                </Nav.Link>
                <Button
                  variant="outline-primary"
                  size="sm"
                  onClick={handleLogout}
                  className="ms-2"
                >
                  <Image 
                    src="/material visual/logout icon.png" 
                    alt="Salir" 
                    height="20" 
                    width="auto"
                    className="me-1" 
                  />
                  <span className="d-none d-sm-inline">Salir</span>
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
