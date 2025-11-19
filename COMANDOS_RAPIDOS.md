# ⚡ COMANDOS RÁPIDOS - MANTENTE CON POCKETBASE

## 🎯 Comandos más usados

### 1. Instalar dependencias (PRIMERO)

```bash
# Backend
cd pocketbase-server
npm install

# Frontend
cd ../mantente-app
npm install
```

### 2. Iniciar desarrollo

```bash
# Terminal 1: Backend (Puerto 8090)
cd pocketbase-server
npm start

# Terminal 2: Frontend (Puerto 5173) 
cd mantente-app
npm run dev
```

### 3. Acceso a servicios

```
Frontend:   http://localhost:5173
API:        http://localhost:8090/api
Admin:      http://localhost:8090/_/
Docs API:   http://localhost:8090/api/docs
```

---

## 🛠️ Comandos útiles

### Limpiar caché y reinstalar

```bash
# Backend
cd pocketbase-server
rm -r node_modules package-lock.json
npm install

# Frontend
cd ../mantente-app
rm -r node_modules package-lock.json dist .vite
npm install
```

### Eliminar base de datos local (reset total)

```bash
# ⚠️ CUIDADO: Esto elimina TODOS los datos
cd pocketbase-server
rm -r pb_data/
npm start  # Recrea vacía
```

### Build para producción

```bash
cd mantente-app
npm run build
# Genera carpeta dist/ lista para deploy
```

### Linting y verificación

```bash
cd mantente-app
npm run lint  # Verifica código
```

---

## 🔌 Puertos en uso

| Puerto | Servicio | Comando |
|--------|----------|---------|
| 8090 | PocketBase API | `npm start` en pocketbase-server |
| 5173 | React Dev | `npm run dev` en mantente-app |

### Si puerto está ocupado (Windows)

```bash
# Encontrar qué está usando puerto 8090
netstat -ano | find "8090"

# Matar proceso (reemplazar PID)
taskkill /PID <PID> /F

# Cambiar puerto en server.js si es necesario
```

---

## 🗂️ Estructura de carpetas

```bash
# Navegar rápido
cd "c:\Users\angel\OneDrive\Documents\proyecto mantente"

# Carpeta raíz
proyecto mantente/
├── pocketbase-server/    # Backend
├── mantente-app/         # Frontend
└── *.md                  # Documentación
```

---

## 🔐 Admin PocketBase

### Crear admin inicial

1. Abre: http://localhost:8090/_/
2. Primera vez: Crea usuario admin
3. Email: admin@example.com (o el que quieras)
4. Contraseña: Algo seguro

### Acceder después

- URL: http://localhost:8090/_/
- Email/Contraseña del admin

### Crear usuario desde admin

1. Click en "Auth"
2. "Users" 
3. Click en "+" 
4. Completa email/password
5. Save

---

## 📊 Operaciones comunes desde código

### Crear
```javascript
const { createVenta } = useApp();
await createVenta({ codigo_venta: "VTA-001", cliente: "Juan", ... });
```

### Leer
```javascript
const { ventas } = useApp();
console.log(ventas);  // Array de ventas
```

### Actualizar
```javascript
const { updateVenta } = useApp();
await updateVenta(ventaId, { estado: "completada" });
```

### Eliminar
```javascript
const { deleteVenta } = useApp();
await deleteVenta(ventaId);
```

---

## 🐛 Debugging

### Ver logs

```bash
# Browser Console (F12)
- Errores de conexión
- Estado de autenticación
- Datos cargados

# Terminal Server
- Errores del backend
- Requests recibidos
- Estado de colecciones
```

### Verificar autenticación

```javascript
// En console del navegador
pb.authStore.model           // Usuario actual
pb.authStore.isValid         // ¿Logueado?
pb.authStore.token           // Token JWT
localStorage.getItem('pb_auth')  // Data guardada
```

### Test de API

```bash
# Usando curl
curl http://localhost:8090/api/collections/ventas/records

# Con autenticación
curl -H "Authorization: Bearer <TOKEN>" \
  http://localhost:8090/api/collections/ventas/records
```

---

## 📁 Archivos clave

```bash
# Frontend
mantente-app/src/pocketbase.js           # Cliente PB
mantente-app/src/context/AppContext.jsx  # Lógica global
mantente-app/.env.local                  # Variables

# Backend
pocketbase-server/server.js              # Servidor
pocketbase-server/pb_data/pb.db          # Base de datos

# Documentación
START_POCKETBASE.md                 # Inicio (LEER PRIMERO)
MIGRACION_POCKETBASE_GUIA.md        # Guía completa
CHECKLIST_MIGRACION_POCKETBASE.md   # Verificación
```

---

## ✅ Checklist de inicio

```bash
# 1. Instalar
npm install  # en pocketbase-server
npm install  # en mantente-app

# 2. Iniciar backend (Terminal 1)
npm start  # en pocketbase-server
# Esperar hasta ver: "PocketBase iniciado"

# 3. Iniciar frontend (Terminal 2)
npm run dev  # en mantente-app
# Esperar hasta ver: "Local: http://localhost:5173"

# 4. Verificar
- [ ] Backend: http://localhost:8090/api
- [ ] Frontend: http://localhost:5173
- [ ] Admin: http://localhost:8090/_/

# 5. Test
- [ ] Registra usuario
- [ ] Inicia sesión
- [ ] Crea venta
- [ ] Actualiza datos
- [ ] Elimina elemento
```

---

## 🚀 Deploy rápido

### Local
```bash
npm start  # pocketbase-server
npm run dev  # mantente-app
```

### Docker
```bash
docker build -t mantente-pb .
docker run -p 8090:8090 mantente-pb
```

### Build producción
```bash
npm run build  # en mantente-app
# Genera: dist/
```

---

## 💾 Backup y restore

### Backup
```bash
# Copiar BD
cp pocketbase-server/pb_data/pb.db backup-$(date +%Y%m%d).db

# O exportar desde Admin UI
# http://localhost:8090/_/
# Collections > Export
```

### Restore
```bash
# Copiar BD anterior
cp backup-20240101.db pocketbase-server/pb_data/pb.db

# Reiniciar
npm start
```

---

## 📞 Ayuda rápida

| Problema | Solución |
|----------|----------|
| "Puerto ocupado" | Cambia puerto en server.js o mata proceso |
| "Colecciones no se crean" | Elimina pb_data/ y reinicia |
| "No puedo logearme" | Verifica usuario en Admin UI |
| "Errores CORS" | Revisa console (F12) para detalles |
| "BD corrupta" | Restaura desde backup o rm pb_data/ |

---

## 🎯 Próximas acciones

1. **Ahora**: Ejecuta `npm install` en ambas carpetas
2. **Luego**: `npm start` en pocketbase-server
3. **Después**: `npm run dev` en mantente-app
4. **Finalmente**: Abre http://localhost:5173

---

**Última actualización:** 2024  
**Versión:** 1.0  
**Propósito:** Referencia rápida de comandos
