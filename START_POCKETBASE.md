# ⚡ INICIO RÁPIDO POCKETBASE

## 🎯 Comandos esenciales (en orden)

### Terminal 1: Backend PocketBase

```bash
cd "c:\Users\angel\OneDrive\Documents\proyecto mantente\pocketbase-server"
npm install
npm start
```

**Espera hasta ver:**
```
📊 PocketBase iniciado exitosamente!
🌐 URL: http://localhost:8090
📱 Admin: http://localhost:8090/_/
```

### Terminal 2: Frontend React

```bash
cd "c:\Users\angel\OneDrive\Documents\proyecto mantente\mantente-app"
npm install
npm run dev
```

**Espera hasta ver:**
```
➜  Local:   http://localhost:5173/
```

## 🔑 Acceso Admin

- **URL**: http://localhost:8090/_/
- **Primer acceso**: Crea usuario admin
- **Dashboard**: Administra colecciones y usuarios

## 🌐 URLs

| Servicio | URL | Descripción |
|----------|-----|-----------|
| Frontend | http://localhost:5173 | App React |
| Backend | http://localhost:8090 | API PocketBase |
| Admin | http://localhost:8090/_ | Panel administrativo |
| API Docs | http://localhost:8090/api/docs | Documentación API |

## ✨ Características

- ✅ 15 colecciones preconfiguradasautenticación integrada
- ✅ Row Level Security (RLS) automática
- ✅ Base de datos SQLite local
- ✅ Admin UI incluida

## 📝 Notas importantes

- PocketBase crea carpeta `pb_data/` con BD local
- Los datos se guardan en `pocketbase-server/pb_data/pb.db`
- Cierra ambas terminales para detener servidor y app
- Si quieres limpiar: elimina `pb_data/` y reinicia

## 🚀 Ahora puedes:

1. Registrarte en la app
2. Crear ventas, clientes, productos
3. Gestionar facturas y devoluciones
4. Ver datos en tiempo real
5. Administrar todo desde PocketBase Admin

**¡Listo para usar!** 🎉
