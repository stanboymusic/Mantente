# 🛰️ MANTENTE CONNECT - COMIENZA AQUÍ

## ✅ Estado: LISTO PARA DESARROLLAR

Tu nueva aplicación **Mantente Connect** está completamente configurada y lista.

---

## 🚀 PASO 1: INICIA EL SERVIDOR (1 minuto)

Abre una terminal en la carpeta `mantente-connect` y ejecuta:

```bash
npm run dev
```

✨ La app abrirá automáticamente en: **http://localhost:3000**

---

## ⚙️ PASO 2: CONFIGURA SUPABASE (2 minutos)

1. **Copia el archivo de configuración:**
   ```bash
   cp .env.example .env.local
   ```

2. **Abre `.env.local` y completa:**
   ```env
   VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
   VITE_SUPABASE_KEY=tu-anon-key-aqui
   ```

3. **Obtén tus credenciales de:**
   - Dashboard Supabase → Settings → API
   - Project URL = `VITE_SUPABASE_URL`
   - Anon Public Key = `VITE_SUPABASE_KEY`

---

## 📁 ESTRUCTURA RÁPIDA

```
mantente-connect/
├── src/
│   ├── components/      → Componentes reutilizables
│   ├── pages/          → Páginas principales
│   ├── store/          → Estado global (Zustand)
│   ├── services/       → Lógica backend
│   └── App.jsx         → Componente raíz
│
├── index.html          → HTML principal
├── vite.config.js      → Configuración Vite
├── tailwind.config.js  → Configuración Tailwind
└── package.json        → Dependencias
```

---

## 🎯 PÁGINAS PRINCIPALES

| Ruta | Archivo | Estado |
|------|---------|--------|
| `/login` | `pages/LoginPage.jsx` | 🔧 Necesita Supabase |
| `/dashboard` | `pages/DashboardPage.jsx` | ✅ Base lista |
| `/inventory` | `pages/InventoryPage.jsx` | 🔧 En desarrollo |
| `/customers` | `pages/CustomersPage.jsx` | 🔧 En desarrollo |
| `/orders` | `pages/OrdersPage.jsx` | 🔧 En desarrollo |
| `/settings` | `pages/SettingsPage.jsx` | 🔧 En desarrollo |

---

## 💾 BASE DE DATOS LOCAL

Usa **IndexedDB** (via Dexie.js) para almacenamiento offline.

Tablas disponibles:
- `products` - Inventario
- `customers` - Clientes
- `orders` - Órdenes
- `orderItems` - Detalle de órdenes
- `syncQueue` - Cola de sincronización
- `sessions` - Sesiones de usuario

**Acceso desde code:**
```javascript
import { dbService } from '@/services/databaseService'

// Crear
await dbService.addProduct({ name: 'Producto', sku: '123' })

// Leer
const product = await dbService.getProduct(id)

// Actualizar
await dbService.updateProduct(id, { name: 'Nuevo nombre' })

// Eliminar
await dbService.deleteProduct(id)
```

---

## 🔄 ESTADO GLOBAL (Zustand)

Gestiona el estado de tu app:

```javascript
import { useInventoryStore } from '@/store/inventoryStore'
import { useCustomersStore } from '@/store/customersStore'
import { useOrdersStore } from '@/store/ordersStore'
import { useAuthStore } from '@/store/authStore'

// En componentes:
const { products, addProduct } = useInventoryStore()
```

---

## 🌐 DETECTOR DE CONECTIVIDAD

La app automáticamente:
- ✅ Detecta cambios de red
- ✅ Guarda localmente cuando está offline
- ✅ Sincroniza cuando vuelves online
- ✅ Muestra estado en navbar

---

## 🎨 COLORES PERSONALIZADOS

Usa las clases de TailwindCSS:

```jsx
// Colores Mantente
<div className="text-gold">Oro</div>
<div className="text-violet">Violeta</div>
<div className="text-brown">Marrón</div>
<div className="text-taupe">Taupe</div>

// Botones
<button className="bg-gold hover:bg-light-gold">Gold</button>
<button className="bg-violet hover:bg-light-violet">Violet</button>
```

---

## 🔥 COMANDOS ÚTILES

```bash
# Desarrollo
npm run dev

# Build producción
npm run build

# Preview del build
npm run preview

# Lint
npm run lint
```

---

## 💡 TIPS DE DESARROLLO

### 1️⃣ Hot Reload
Vite actualiza automáticamente al guardar cambios ✨

### 2️⃣ Dev Tools
Usa React DevTools + Redux DevTools (Zustand es compatible)

### 3️⃣ Console Logging
```javascript
console.log('🛰️ Debug:', data)
```

### 4️⃣ Estilos TailwindCSS
No necesitas importar estilos CSS adicionales, Tailwind maneja todo:

```jsx
<div className="bg-white rounded-lg shadow p-6 border-l-4 border-gold">
  Contenido
</div>
```

---

## 🐛 SI ALGO NO FUNCIONA

### Error: "Cannot find module 'dexie'"
```bash
npm install
```

### Error: ".env not found"
```bash
cp .env.example .env.local
```

### Port 3000 ocupado
Edita `vite.config.js`:
```javascript
server: {
  port: 3001  // Cambia aquí
}
```

### Base de datos no se inicializa
Abre DevTools → Application → Storage → IndexedDB → ManteneConnectDB

---

## 📊 PRÓXIMAS FUNCIONALIDADES

1. **Integración Supabase Auth**
   - Login con email/password
   - Sesiones persistentes
   - Logout

2. **Gestión de Inventario**
   - CRUD de productos
   - Búsqueda y filtros
   - Bajo stock alerts

3. **Gestión de Clientes**
   - Registro de clientes
   - Historial de órdenes
   - Datos de contacto

4. **Órdenes de Compra/Venta**
   - Crear órdenes
   - Agregar productos
   - Calcular totales
   - Editar/Eliminar

5. **Sistema de Sincronización Avanzado**
   - Resolver conflictos
   - Validar integridad
   - Historial de cambios

6. **PWA**
   - Instalable
   - Offline completo
   - Notificaciones push

7. **Electron**
   - App de escritorio
   - Auto-update

---

## 🎓 APRENDIZAJE RECOMENDADO

- **React:** https://react.dev/learn
- **Zustand:** https://github.com/pmndrs/zustand
- **Dexie.js:** https://dexie.org/
- **TailwindCSS:** https://tailwindcss.com/docs
- **Supabase:** https://supabase.com/docs

---

## 📞 SOPORTE

Consulta:
- `README.md` - Documentación completa
- `INICIO_RAPIDO.md` - Guía rápida
- `src/` - Código comentado

---

## 🎉 AHORA SÍ...

**¡Estás listo para desarrollar Mantente Connect!**

Ejecuta:
```bash
npm run dev
```

Y comienza a construir 🚀

---

*Mantente Connect - La herramienta que garantiza que tu negocio nunca se detenga*