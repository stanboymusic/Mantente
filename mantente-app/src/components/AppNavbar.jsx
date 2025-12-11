import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { useTranslation } from 'react-i18next';
import LanguageSelector from './LanguageSelector';
import NotificationSystem from './NotificationSystem';

// AppNavbar - Versión horizontal completa para móvil
const AppNavbar = React.memo(() => {
  const { logout, user, isPremium } = useApp();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const navItems = useMemo(() => [
    { path: "/", icon: "/material visual/dashboard icon.png", label: t('dashboard'), basic: true },
    { path: "/inventario", icon: "/material visual/inventario icon.png", label: t('inventory'), basic: true },
    { path: "/ventas", icon: "/material visual/ventas icon.png", label: t('sales'), basic: true },
    { path: "/clientes", icon: "/material visual/clientes icon.png", label: t('clients'), basic: true },
    { path: "/egresos", icon: "/material visual/egresos icon.png", label: t('expenses'), basic: true },
    { path: "/facturas", icon: "/material visual/facturas icon.png", label: t('invoices'), basic: true },
    { path: "/apertura-mes", icon: "/material visual/apertura de mes icon.png", label: t('opening'), basic: true },
    { path: "/cierre-mes", icon: "/material visual/cierre mes icon.png", label: t('closing'), basic: true },
    { path: "/calculadora", icon: "/material visual/calculadora icon.png", label: t('calculator'), basic: true },
  ], [t]);

  const premiumItems = useMemo(() => [
    { path: "/presupuestos", emoji: "💰", label: t('budgets'), premium: true },
    { path: "/notas-entrega", emoji: "📦", label: t('deliveryNotes'), premium: true },
    { path: "/devoluciones", emoji: "↩️", label: t('returns'), premium: true },
    { path: "/averias", emoji: "🔧", label: t('breakdowns'), premium: true },
    { path: "/libro-ventas", emoji: "📊", label: t('salesBook'), premium: true },
    { path: "/pedidos", emoji: "📋", label: t('orders'), premium: true },
    { path: "/ordenes-servicio", emoji: "⚙️", label: t('serviceOrders'), premium: true },
  ], [t]);

  const adminItems = useMemo(() => [
    { path: "/users", emoji: "👥", label: t('users'), premium: true },
    { path: "/reports", emoji: "📈", label: t('reports'), premium: true },
    { path: "/system-settings", emoji: "⚙️", label: t('settings'), premium: true },
  ], [t]);

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
                title={t('premium')}
                style={{ display: !isPremium ? "flex" : "none", flexDirection: "column" }}
              >
                ⭐
                <span>{t('premium')}</span>
              </button>

              {/* SEPARADOR 2 */}
              <div className="nav-separator"></div>

              {/* ADMIN ITEMS */}
              {user && user.role === 'admin' && (
                <div style={{ display: "flex", gap: "0.3rem" }}>
                  {adminItems.map((item) => (
                    <NavButton key={item.path} item={item} isPremiumItem={true} />
                  ))}
                  <div className="nav-separator"></div>
                </div>
              )}

              {/* Language & Notifications */}
              <div className="d-flex align-items-center gap-2 mx-2">
                 <LanguageSelector />
                 <NotificationSystem />
              </div>

              {/* UTILIDADES */}
              <button
                className="nav-button-item"
                onClick={() => navigate("/perfil-empresa")}
                title={t('profile')}
              >
                <img 
                  src="/material visual/perfil icon.png" 
                  alt={t('profile')}
                  height="20"
                  style={{ objectFit: "contain", width: "auto" }}
                />
                <span style={{ fontWeight: 500 }}>{t('profile')}</span>
              </button>

              {/* LOGOUT */}
              <button
                className="nav-button-logout"
                onClick={handleLogout}
                title={t('logout')}
              >
                <img 
                  src="/material visual/logout icon.png" 
                  alt={t('logout')}
                  height="20"
                  style={{ objectFit: "contain", width: "auto" }}
                />
                <span>{t('logout')}</span>
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