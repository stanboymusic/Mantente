# 🛰️ Mantente Connect

**Mantente Connect** es una aplicación complementaria del ecosistema Mantente, diseñada para funcionar completamente **sin conexión a internet** mientras sincroniza datos automáticamente al volver a estar online.

## 🎯 Objetivo Principal

Permitir que los usuarios de Mantente gestionen su inventario, registren clientes y creen órdenes de compra/venta **incluso sin conexión**, manteniendo todos los datos sincronizados con la plataforma principal.

## 🚀 NOVEDAD: Migración Automática de Datos

**✨ Los datos del Mantente antiguo se migran AUTOMÁTICAMENTE en el primer login.**

- ✅ Cero acciones del usuario
- ✅ Cero manual workarounds
- ✅ 3+ productos, 4+ clientes, 21+ órdenes migradas automáticamente
- ✅ Sistema inteligente con fallbacks
- ✅ Datos seguros y verificados

**📖 Documentación**: Lee `📑_INDICE_MIGRACION_AUTOMATICA.md` para detalles.

## ✨ Características Principales

### 📴 Modo Offline Total
- Gestión completa de inventario sin internet
- Registro de clientes y órdenes sin conexión
- Interfaz totalmente funcional offline

### ☁️ Sincronización Automática Inteligente
- Sincronización al detectar conexión
- Comparación de timestamps para evitar conflictos
- Sistema de caché distribuido

### 👤 Autenticación Mantente
- Usa las mismas credenciales Supabase
- Sesiones persistentes locales
- Permisos sincronizados

### 📦 Gestión de Inventario
- Consultar productos y stock
- Crear/editar/eliminar productos offline
- Sincronización bidireccional

### 🧾 Clientes y Ventas
- Registro de clientes offline
- Creación de ventas sin conexión
- Procesamiento automático → ventas confirmadas
- Generación automática de facturas

## 🛠️ Stack Tecnológico

| Componente | Tecnología |
|-----------|-----------|
| Framework | React + Vite |
| UI | TailwindCSS + Lucide Icons |
| Base Local | IndexedDB (via Dexie.js) |
| Backend | Supabase (compartido) |
| Autenticación | Supabase Auth |
| Estado Global | Zustand |
| Sincronización | Sistema custom con colas |

## 📦 Instalación

```bash
# Navega a la carpeta del proyecto
cd mantente-connect

# Instala las dependencias
npm install

# Copia el archivo .env
cp .env.example .env.local

# Llena las variables de entorno con tus credenciales de Supabase
# VITE_SUPABASE_URL=
# VITE_SUPABASE_KEY=

# Inicia el servidor de desarrollo
npm run dev
```

## 🔄 Migración Automática de Datos

**IMPORTANTE**: Antes de usar, ejecuta el SQL para crear tabla `returns`:

1. Abre https://supabase.co → Tu proyecto → SQL Editor
2. Copia y pega: `SQL_CREAR_TABLA_RETURNS.sql`
3. Click "Run"

**Después**: Solo loguea. Migración se ejecuta automáticamente en background.

✅ Productos, clientes, órdenes y más se migran sin que hagas nada.

**Documentación**: `🚀_PROXIMOS_PASOS_ACTIVACION.txt`

## 📁 Estructura del Proyecto

```
mantente-connect/
├── src/
│   ├── components/        # Componentes React reutilizables
│   ├── pages/            # Páginas de la aplicación
│   ├── store/            # Estado global (Zustand)
│   ├── services/         # Servicios (API, DB, sincronización)
│   ├── hooks/            # Custom React hooks
│   ├── utils/            # Utilidades y helpers
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── public/               # Archivos estáticos
├── index.html
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── package.json
```

## 🚀 Rutas Principales

- `/login` - Página de inicio de sesión
- `/dashboard` - Panel principal
- `/inventory` - Gestión de inventario
- `/customers` - Gestión de clientes
- `/orders` - Gestión de órdenes
- `/settings` - Configuración

## 💾 Base de Datos Local

Utiliza **IndexedDB** via **Dexie.js** para almacenar:
- Productos e inventario
- Clientes
- Órdenes y transacciones
- Caché de sesiones
- Cola de sincronización

## 🔄 Sistema de Sincronización

### Flujo de Sincronización:
1. Detectar cambios de conectividad
2. Comparar datos locales con servidor mediante timestamps
3. Resolver conflictos automáticamente o con intervención del usuario
4. Actualizar base de datos local y remota
5. Limpiar cola de sincronización

## 🔐 Seguridad

- Autenticación a través de Supabase Auth
- Tokens JWT persistentes localmente
- Validación al reconectarse
- Policies RLS en Supabase

## 📱 Compatibilidad

- ✅ Navegadores modernos (Chrome, Firefox, Safari, Edge)
- ✅ Dispositivos móviles (iOS, Android)
- 🔜 PWA (Progressive Web App)
- 🔜 Electron (Escritorio)
- 🔜 Capacitor (Versión nativa)

## 🚧 Estado de Desarrollo

Este proyecto está en fase inicial de desarrollo. Las características se irán implementando progresivamente.

## 📝 Licencia

Parte del ecosistema Mantente - Todos los derechos reservados.
