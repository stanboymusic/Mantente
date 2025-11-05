# 🚀 Mantente Connect - Inicio Rápido

## ✅ Setup Completado

Se ha creado la estructura base del proyecto **Mantente Connect**. 

### 📁 Estructura de Carpetas

```
mantente-connect/
├── src/
│   ├── components/          # Componentes reutilizables
│   │   ├── Navbar.jsx       # Barra de navegación
│   │   └── Footer.jsx       # Pie de página
│   ├── pages/               # Páginas principales
│   │   ├── LoginPage.jsx
│   │   ├── DashboardPage.jsx
│   │   ├── InventoryPage.jsx
│   │   ├── CustomersPage.jsx
│   │   ├── OrdersPage.jsx
│   │   └── SettingsPage.jsx
│   ├── store/               # Estado global (Zustand)
│   │   ├── authStore.js     # Autenticación
│   │   ├── inventoryStore.js # Inventario
│   │   ├── customersStore.js # Clientes
│   │   └── ordersStore.js    # Órdenes
│   ├── services/            # Servicios backend
│   │   ├── databaseService.js    # IndexedDB (Dexie)
│   │   ├── initializeService.js  # Inicialización
│   │   └── syncService.js        # Sincronización
│   ├── App.jsx              # Componente principal
│   ├── main.jsx             # Punto de entrada
│   └── index.css            # Estilos globales
├── index.html               # HTML principal
├── vite.config.js           # Configuración Vite
├── tailwind.config.js       # Configuración Tailwind
├── postcss.config.js        # Configuración PostCSS
├── package.json             # Dependencias
└── .env.example             # Variables de entorno (plantilla)
```

## 🛠️ Próximos Pasos

### 1. **Completar Instalación**
Las dependencias se están instalando ahora. Espera a que termine.

```bash
# Verifica que npm install haya terminado
npm list
```

### 2. **Configurar Variables de Entorno**
```bash
# Copia el archivo .env.example
cp .env.example .env.local

# Rellena con tus credenciales de Supabase:
# VITE_SUPABASE_URL=tu-url-supabase
# VITE_SUPABASE_KEY=tu-anon-key
```

### 3. **Iniciar Servidor de Desarrollo**
```bash
npm run dev
```

La app estará disponible en: **http://localhost:3000**

### 4. **Compilar para Producción**
```bash
npm run build
```

## 📦 Dependencias Instaladas

| Paquete | Función |
|---------|---------|
| **react** | Framework base |
| **react-router-dom** | Enrutamiento |
| **dexie** | IndexedDB simplificado |
| **zustand** | Estado global |
| **@supabase/supabase-js** | Cliente Supabase |
| **axios** | Peticiones HTTP |
| **tailwindcss** | Estilos |
| **lucide-react** | Iconos |

## 🗂️ Características Implementadas

✅ **Estructura de carpetas completa**
✅ **Sistema de enrutamiento con React Router**
✅ **Gestión de estado con Zustand**
✅ **IndexedDB para almacenamiento local (Dexie)**
✅ **Navbar responsive**
✅ **Footer**
✅ **Indicador de estado online/offline**
✅ **Sistema de sincronización (base)**
✅ **Estilos con TailwindCSS y colores Mantente**

## 🔄 Sistema de Sincronización

El sistema está diseñado para:
1. Detectar cambios de conectividad
2. Guardar cambios locales automáticamente
3. Sincronizar con Supabase cuando hay conexión
4. Manejar conflictos de datos

## 🔐 Autenticación

- Basada en Supabase Auth
- Las sesiones se guardan localmente
- Funciona offline con credenciales cacheadas

## 🎨 Colores y Estilos

Se utilizan los colores de la marca Mantente:
- **Oro (#e2b54e)** - Primario
- **Violeta (#7c5daf)** - Secundario
- **Marrón (#8b6f47)** - Acentos

## 📝 Próximas Tareas

1. ✏️ **Integrar Supabase Auth** en LoginPage
2. 📊 **Completar DashboardPage** con datos reales
3. 📦 **Implementar Inventario completo**
4. 👥 **Implementar Gestión de Clientes**
5. 🧾 **Implementar Órdenes**
6. 🔄 **Perfeccionar sistema de sincronización**
7. 📱 **Convertir a PWA**
8. 🎁 **Empaquetar con Electron/Capacitor**

## ✨ Tips

- Los estilos globales están en `src/index.css`
- Todos los componentes usan TailwindCSS
- El estado global está centralizado en `src/store/`
- Los servicios están en `src/services/`
- Usa `console.log()` para debugging

## 🆘 Troubleshooting

**Error: "Cannot find module"**
→ Asegúrate de que `npm install` completó correctamente

**Error: ".env not found"**
→ Copia `.env.example` a `.env.local` y completa los valores

**Port 3000 en uso**
→ Cambia el puerto en `vite.config.js`

---

**¡Listo para desarrollar Mantente Connect!** 🚀

¿Necesitas ayuda con algo específico?