# 🚀 GUÍA COMPLETA: MIGRACIÓN DE SUPABASE A POCKETBASE

## ✅ ESTADO ACTUAL

- **Base de datos**: Migrada completamente a PocketBase
- **Autenticación**: Configurada en PocketBase
- **Backend**: Servidor Node.js con PocketBase listo
- **Frontend**: App React actualizada para usar PocketBase

## 📋 PASO A PASO: INSTALACIÓN Y EJECUCIÓN

### 1️⃣ Instalar dependencias de la app React

```bash
cd "c:\Users\angel\OneDrive\Documents\proyecto mantente\mantente-app"
npm install
```

### 2️⃣ Instalar dependencias del servidor PocketBase

```bash
cd "c:\Users\angel\OneDrive\Documents\proyecto mantente\pocketbase-server"
npm install
```

### 3️⃣ Iniciar el servidor PocketBase

```bash
cd "c:\Users\angel\OneDrive\Documents\proyecto mantente\pocketbase-server"
npm start
```

**Resultado esperado:**
```
🚀 Iniciando PocketBase Server...
📊 PocketBase iniciado exitosamente!
🌐 URL: http://localhost:8090
📱 Admin: http://localhost:8090/_/
📡 API: http://localhost:8090/api
```

### 4️⃣ En otra terminal, iniciar la app React

```bash
cd "c:\Users\angel\OneDrive\Documents\proyecto mantente\mantente-app"
npm run dev
```

## 🔑 ACCESO A POCKETBASE ADMIN

1. Abre: **http://localhost:8090/_/**
2. Crea usuario administrador (primera ejecución)
3. Administra colecciones, usuarios y permisos

## 📊 COLECCIONES CREADAS

### Gestión de Ventas
- **ventas**: Registro de ventas
- **inventario**: Productos en stock
- **devoluciones**: Devoluciones de productos
- **egreso**: Gastos y egresos

### Gestión de Clientes
- **clientes**: Información de clientes
- **perfil_empresa**: Datos de la empresa

### Documentos
- **facturas**: Facturas generadas
- **presupuestos**: Presupuestos
- **notas_entrega**: Notas de entrega

### Control
- **premium_subscriptions**: Suscripciones premium
- **historialMeses**: Cierre de meses

### Sincronización (mantente-connect)
- **products**: Catálogo de productos
- **customers**: Base de clientes
- **orders**: Órdenes de pedido
- **order_items**: Detalles de órdenes
- **invoices**: Facturación
- **sync_log**: Log de sincronización

## 🔒 CONFIGURACIÓN DE SEGURIDAD

### RLS (Row Level Security) en PocketBase

PocketBase usa **Record Rules** para simular RLS. Por defecto, los permisos están configurados para que cada usuario solo vea sus datos:

```javascript
// Cada colección tiene un campo "user_id"
// Los Record Rules aseguran que solo el propietario pueda acceder
filter: user_id = @request.auth.id
```

## 🔄 MIGRACIÓN DE DATOS

### Desde Supabase a PocketBase

1. **Exportar datos de Supabase** (SQL export o JSON)
2. **Transformar formato** si es necesario
3. **Importar a PocketBase** vía Admin UI o API

### Script de migración (opcional)

Si tienes datos existentes, puedes crear un script en `migration.js` para importarlos.

## 📦 ESTRUCTURA DE DIRECTORIOS

```
proyecto mantente/
├── mantente-app/                 # App React (Frontend)
│   ├── src/
│   │   ├── pocketbase.js        # Cliente PocketBase
│   │   ├── context/AppContext.jsx # Estado global (actualizado)
│   │   ├── components/          # Componentes React
│   │   └── ...
│   ├── .env.local               # Variables de entorno
│   └── package.json             # Dependencias
│
├── pocketbase-server/            # Servidor Node.js + PocketBase
│   ├── server.js                # Servidor principal
│   ├── package.json             # Dependencias
│   └── pb_data/                 # Base de datos local
│
└── MIGRACION_POCKETBASE_GUIA.md # Esta guía
```

## 🐛 TROUBLESHOOTING

### Error: "EADDRINUSE: address already in use :::8090"

**Solución**: El puerto 8090 ya está en uso. Usa otro puerto o mata el proceso:

```bash
# Windows
netstat -ano | find "8090"
taskkill /PID <PID> /F

# O cambia el puerto en server.js
```

### Error: "Usuario no autenticado"

**Solución**: 
1. Verifica que estés logueado en la app
2. Comprueba que PocketBase está corriendo
3. Revisa la consola para ver errores

### Las colecciones no se crean

**Solución**:
1. Elimina la carpeta `pb_data/`
2. Reinicia el servidor: `npm start`
3. Las colecciones se crearán automáticamente

## 📱 COMPONENTES ACTUALIZADOS

Los componentes que usaban Supabase directamente ahora usan el contexto `useApp()`:

```javascript
import { useApp } from "../context/AppContext";

function MiComponente() {
  const { 
    ventas, 
    createVenta, 
    user, 
    isPremium 
  } = useApp();
  
  // Usar los datos del contexto
}
```

## 🚀 PRÓXIMOS PASOS

1. ✅ Instalar dependencias (`npm install`)
2. ✅ Iniciar PocketBase (`npm start` en pocketbase-server)
3. ✅ Iniciar app React (`npm run dev` en mantente-app)
4. 📌 **Crear usuario admin** en http://localhost:8090/_/
5. 📌 **Registrar usuarios** en la app
6. 📌 **Probar funcionalidades** completas
7. 📌 **Migrar datos** si es necesario
8. 📌 **Hacer build** para producción (`npm run build`)

## 📚 RECURSOS ÚTILES

- [Documentación PocketBase](https://pocketbase.io/docs/)
- [React PocketBase SDK](https://github.com/pocketbase/js-sdk)
- [PocketBase Docker](https://hub.docker.com/r/pocketbase/pocketbase)

## ✨ CARACTERÍSTICAS NUEVAS

- ✅ **Auto-hosting**: Controla tu propia infraestructura
- ✅ **SQLite**: Base de datos embebida (no requiere servidor externo)
- ✅ **Admin UI**: Panel administrativo incluido
- ✅ **API REST**: Compatible con cualquier cliente
- ✅ **WebSockets**: Sincronización en tiempo real
- ✅ **Backups automáticos**: Protege tus datos

---

**¿Preguntas o problemas?** Revisa los logs en la consola para más detalles.
