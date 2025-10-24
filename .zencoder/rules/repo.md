---
description: Repository Information Overview
alwaysApply: true
---

# Mantente App Information

## Summary
Mantente es una aplicación web para la gestión de inventario y ventas de pequeños negocios. Permite a los usuarios administrar productos, clientes, ventas, facturas y realizar análisis financieros. Incluye funcionalidades premium y soporte para anuncios de Google AdSense.

## Structure
- **mantente-app/**: Aplicación principal React
- **public/**: Archivos estáticos y recursos visuales
- **src/**: Código fuente de la aplicación
  - **components/**: Componentes React
  - **context/**: Contextos para gestión de estado
  - **styles/**: Archivos CSS

## Language & Runtime
**Language**: JavaScript (React)
**Version**: React 18+
**Build System**: Vite
**Package Manager**: npm

## Dependencies
**Main Dependencies**:
- React
- React Router
- React Bootstrap
- Firebase (Auth, Firestore)
- PayPal SDK

**Development Dependencies**:
- Vite
- ESLint
- Prettier

## Build & Installation
```bash
# Instalación de dependencias
npm install

# Desarrollo
npm run dev

# Construcción para producción
npm run build

# Vista previa de producción
npm run preview
```

## Key Components
- **AppNavbar.jsx**: Barra de navegación principal con logo
- **Footer.jsx**: Pie de página con información de la marca
- **AdLayout.jsx**: Componente para gestionar la disposición de anuncios
- **Anuncios.jsx**: Componente para mostrar anuncios de Google AdSense
- **Dashboard.jsx**: Panel principal con resumen de datos
- **Inventario.jsx**: Gestión de productos e inventario
- **Ventas.jsx**: Registro y gestión de ventas
- **Premium.jsx**: Gestión de suscripciones premium

## AdSense Integration
**Publisher ID**: ca-pub-9518260713755284
**Configuration Files**:
- ads.txt en public/ y dist/
- Componente Anuncios.jsx para mostrar anuncios
- AdLayout.jsx para estructurar la disposición de anuncios
- Integración en index.html con script de AdSense

## Branding
**Logo**: logo.png (80px de altura en la barra de navegación)
**Nombre**: nombre.png (60px de altura en el footer)
**Slogan**: "Decisiones claras, negocios rentables"
**Colores**: Esquema de colores definido en index.css con variables CSS

## User Authentication
**Sistema**: Firebase Authentication
**Tipos de usuario**: Regular y Premium
**Rutas protegidas**: Implementadas en App.jsx con React Router

## Payment Integration
**Sistema**: PayPal Subscriptions
**Script**: Integrado en index.html
**Componente**: Premium.jsx para gestión de suscripciones