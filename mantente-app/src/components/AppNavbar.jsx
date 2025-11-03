import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";

// AppNavbar - Versión horizontal completa para móvil
const AppNavbar = React.memo(() => {
  const { logout, user, isPremium } = useApp();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const navItems = useMemo(() => [
    { path: "/", icon: "/material visual/dashboard icon.png", label: "Dashboard", basic: true },
    { path: "/inventario", icon: "/material visual/inventario icon.png", label: "Inventario", basic: true },
    { path: "/ventas", icon: "/material visual/ventas icon.png", label: "Ventas", basic: true },
    { path: "/clientes", icon: "/material visual/clientes icon.png", label: "Clientes", basic: true },
    { path: "/egresos", icon: "/material visual/egresos icon.png", label: "Egresos", basic: true },
    { path: "/facturas", icon: "/material visual/facturas icon.png", label: "Facturas", basic: true },
    { path: "/apertura-mes", icon: "/material visual/apertura de mes icon.png", label: "Apertura", basic: true },
    { path: "/cierre-mes", icon: "/material visual/cierre mes icon.png", label: "Cierre", basic: true },
    { path: "/calculadora", icon: "/material visual/calculadora icon.png", label: "Calculadora", basic: true },
  ], []);

  const premiumItems = useMemo(() => [
    { path: "/presupuestos", emoji: "💰", label: "Presupuestos", premium: true },
    { path: "/notas-entrega", emoji: "📦", label: "Notas", premium: true },
    { path: "/devoluciones", emoji: "↩️", label: "Devoluciones", premium: true },
    { path: "/averias", emoji: "🔧", label: "Averías", premium: true },
    { path: "/libro-ventas", emoji: "📊", label: "Libro", premium: true },
    { path: "/pedidos", emoji: "📋", label: "Pedidos", premium: true },
    { path: "/ordenes-servicio", emoji: "⚙️", label: "Órdenes", premium: true },
  ], []);

  const NavButton = React.memo(({ item, isPremiumItem }) => (
    <button
      className="nav-button-item"
      onClick={() => navigate(item.path)}
      title={item.label}
    >
      {isPremiumItem ? (
        <span style={{ fontSize: "1.2rem" }}>{item.emoji}</span>
      ) : (
        <img 
          src={item.icon} 
          alt={item.label}
          height="20"
          style={{ objectFit: "contain", width: "auto" }}
        />
      )}
      <span style={{ fontWeight: 500 }}>{item.label}</span>
    </button>
  ), (prevProps, nextProps) => {
    return prevProps.item.path === nextProps.item.path && 
           prevProps.isPremiumItem === nextProps.isPremiumItem;
  });

  return (
    <div className="navbar-horizontal-wrapper">
      <div className="navbar-horizontal-container">
        {/* Logo */}
        <div 
          className="navbar-brand-section"
          onClick={() => navigate("/")}
          style={{ cursor: "pointer", flexShrink: 0 }}
        >
          <img 
            src="/material visual/logo.png" 
            alt="Mantente Logo" 
            height="40"
            loading="lazy"
            style={{
              maxHeight: "40px",
              height: "auto",
              objectFit: "contain",
              width: "auto"
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

              {/* SEPARADOR - Renderizar siempre pero ocultar con CSS si no es premium */}
              <div className="nav-separator" style={{ display: isPremium ? "block" : "none" }}></div>

              {/* FUNCIONES PREMIUM - Renderizar siempre pero ocultar con CSS si no es premium */}
              <div style={{ display: isPremium ? "flex" : "none", gap: "0.3rem" }}>
                {premiumItems.map((item) => (
                  <NavButton key={item.path} item={item} isPremiumItem={true} />
                ))}
              </div>

              {/* PREMIUM BUTTON - Renderizar siempre pero ocultar si es premium */}
              <button
                className="nav-button-item premium-nav-btn"
                onClick={() => navigate("/premium")}
                title="Obtener Premium"
                style={{ display: !isPremium ? "flex" : "none", flexDirection: "column" }}
              >
                ⭐
                <span>Premium</span>
              </button>

              {/* SEPARADOR 2 */}
              <div className="nav-separator"></div>

              {/* UTILIDADES */}
              <button
                className="nav-button-item"
                onClick={() => navigate("/perfil-empresa")}
                title="Perfil"
              >
                <img 
                  src="/material visual/perfil icon.png" 
                  alt="Perfil"
                  height="20"
                  style={{ objectFit: "contain", width: "auto" }}
                />
                <span style={{ fontWeight: 500 }}>Perfil</span>
              </button>

              {/* LOGOUT */}
              <button
                className="nav-button-logout"
                onClick={handleLogout}
                title="Salir"
              >
                <img 
                  src="/material visual/logout icon.png" 
                  alt="Salir"
                  height="20"
                  style={{ objectFit: "contain", width: "auto" }}
                />
                <span>Salir</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
});

AppNavbar.displayName = "AppNavbar";

export default AppNavbar;