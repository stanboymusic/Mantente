import React from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { Navbar, Container, Nav, Button } from "react-bootstrap";

const AppNavbar = () => {
  const { logout, user } = useApp();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <Navbar bg="dark" variant="dark" expand="lg" className="shadow-sm">
      <Container>
        <Navbar.Brand
          onClick={() => navigate("/")}
          style={{ cursor: "pointer" }}
          className="fw-bold text-info"
        >
          💰 Mantente
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="navbar-content" />
        <Navbar.Collapse id="navbar-content">
          <Nav className="ms-auto align-items-center gap-2">
            {user && (
              <>
                <Nav.Link 
                  onClick={() => navigate("/")}
                  className="text-white"
                >
                  📊 Dashboard
                </Nav.Link>
                <Nav.Link 
                  onClick={() => navigate("/inventario")}
                  className="text-white"
                >
                  📦 Inventario
                </Nav.Link>
                <Nav.Link 
                  onClick={() => navigate("/ventas")}
                  className="text-white"
                >
                  💳 Ventas
                </Nav.Link>
                <Nav.Link 
                  onClick={() => navigate("/calculadora")}
                  className="text-white"
                >
                  🧮 Calculadora
                </Nav.Link>
                <Nav.Link 
                  onClick={() => navigate("/premium")}
                  className="text-warning"
                >
                  ⭐ Premium
                </Nav.Link>
                <Button
                  variant="outline-light"
                  size="sm"
                  onClick={handleLogout}
                  className="ms-2"
                >
                  🚪 Logout
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
