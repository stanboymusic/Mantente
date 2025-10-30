import React from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { Image } from "react-bootstrap";

// AppNavbar - Versión horizontal completa para móvil
const AppNavbar = () => {
  const { logout, user, isPremium } = useApp();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const navItems = [
    { path: "/", icon: "/material visual/dashboard icon.png", label: "Dashboard", basic: true },
    { path: "/inventario", icon: "/material visual/inventario icon.png", label: "Inventario", basic: true },
    { path: "/ventas", icon: "/material visual/ventas icon.png", label: "Ventas", basic: true },
    { path: "/clientes", icon: "/material visual/clientes icon.png", label: "Clientes", basic: true },
    { path: "/egresos", icon: "/material visual/egresos icon.png", label: "Egresos", basic: true },
    { path: "/facturas", icon: "/material visual/facturas icon.png", label: "Facturas", basic: true },
    { path: "/apertura-mes", icon: "/material visual/apertura de mes icon.png", label: "Apertura", basic: true },
    { path: "/cierre-mes", icon: "/material visual/cierre mes icon.png", label: "Cierre", basic: true },
    { path: "/calculadora", icon: "/material visual/calculadora icon.png", label: "Calculadora", basic: true },
  ];

  const premiumItems = [
    { path: "/presupuestos", emoji: "💰", label: "Presupuestos", premium: true },
    { path: "/notas-entrega", emoji: "📦", label: "Notas", premium: true },
    { path: "/devoluciones", emoji: "↩️", label: "Devoluciones", premium: true },
    { path: "/averias", emoji: "🔧", label: "Averías", premium: true },
    { path: "/libro-ventas", emoji: "📊", label: "Libro", premium: true },
    { path: "/pedidos", emoji: "📋", label: "Pedidos", premium: true },
    { path: "/ordenes-servicio", emoji: "⚙️", label: "Órdenes", premium: true },
  ];

  const NavButton = ({ item, isPremiumItem }) => (
    <button
      className="nav-button-item"
      onClick={() => navigate(item.path)}
      title={item.label}
    >
      {isPremiumItem ? (
        <span style={{ fontSize: "1.2rem" }}>{item.emoji}</span>
      ) : (
        <Image 
          src={item.icon} 
          alt={item.label}
          height="20"
          width="auto"
          style={{ objectFit: "contain" }}
        />
      )}
      <span style={{ fontWeight: 500 }}>{item.label}</span>
    </button>
  );

  return (
    <div className="navbar-horizontal-wrapper">
      <div className="navbar-horizontal-container">
        {/* Logo */}
        <div 
          className="navbar-brand-section"
          onClick={() => navigate("/")}
          style={{ cursor: "pointer", flexShrink: 0 }}
        >
          <Image 
            src="/material visual/logo.png" 
            alt="Mantente Logo" 
            height="40" 
            width="auto"
            loading="lazy"
            style={{
              maxHeight: "40px",
              height: "auto",
              objectFit: "contain"
            }}
          />
        </div>

        {/* Nav Items Scrolleable Horizontalmente */}
        <div className="navbar-items-scroll">
          {user && (
            <>
              {/* FUNCIONES BÁSICAS */}
              {navItems.map((item) => (
                <NavButton key={item.path} item={item} isPremiumItem={false} />
              ))}

              {/* SEPARADOR */}
              {isPremium && <div className="nav-separator"></div>}

              {/* FUNCIONES PREMIUM */}
              {isPremium && premiumItems.map((item) => (
                <NavButton key={item.path} item={item} isPremiumItem={true} />
              ))}

              {/* PREMIUM BUTTON (si no es premium) */}
              {!isPremium && (
                <button
                  className="nav-button-item premium-nav-btn"
                  onClick={() => navigate("/premium")}
                  title="Obtener Premium"
                >
                  ⭐
                  <span>Premium</span>
                </button>
              )}

              {/* SEPARADOR 2 */}
              <div className="nav-separator"></div>

              {/* UTILIDADES */}
              <button
                className="nav-button-item"
                onClick={() => navigate("/perfil-empresa")}
                title="Perfil"
              >
                <Image 
                  src="/material visual/perfil icon.png" 
                  alt="Perfil"
                  height="20"
                  width="auto"
                  style={{ objectFit: "contain" }}
                />
                <span style={{ fontWeight: 500 }}>Perfil</span>
              </button>

              {/* LOGOUT */}
              <button
                className="nav-button-logout"
                onClick={handleLogout}
                title="Salir"
              >
                <Image 
                  src="/material visual/logout icon.png" 
                  alt="Salir"
                  height="20"
                  width="auto"
                  style={{ objectFit: "contain" }}
                />
                <span>Salir</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AppNavbar;