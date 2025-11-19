# ✅ CHECKLIST: VERIFICACIÓN DE MIGRACIÓN

## 📋 Pre-ejecución

- [ ] Python/Node.js instalado (versión 14+)
- [ ] npm o yarn disponible
- [ ] Puertos 5173 y 8090 libres
- [ ] Terminal con permisos de escritura en la carpeta del proyecto

## 🔧 Instalación

### Backend PocketBase
- [ ] Navegar a `pocketbase-server`
- [ ] Ejecutar `npm install`
- [ ] Verificar que no hay errores
- [ ] Archivo `package.json` actualizado

### Frontend Mantente App
- [ ] Navegar a `mantente-app`
- [ ] Ejecutar `npm install`
- [ ] Verificar que PocketBase se instaló (buscar en node_modules)
- [ ] Archivo `.env.local` con `VITE_POCKETBASE_URL=http://localhost:8090`

## 🚀 Ejecución

### Servidor PocketBase
```bash
cd pocketbase-server && npm start
```

**Verificar:**
- [ ] No hay errores al iniciar
- [ ] Aparece mensaje "PocketBase iniciado exitosamente!"
- [ ] URL Admin: http://localhost:8090/_/ accesible
- [ ] Base de datos: carpeta `pb_data/` creada
- [ ] Archivo `pb_data/pb.db` existe

### App React
```bash
cd mantente-app && npm run dev
```

**Verificar:**
- [ ] No hay errores de compilación
- [ ] Mensaje "Local: http://localhost:5173/" visible
- [ ] App se abre en el navegador
- [ ] Navbar carga correctamente

## 🔐 Autenticación

### Usuario Admin (PocketBase)
- [ ] Accedí a http://localhost:8090/_/
- [ ] Creé usuario administrador
- [ ] Puedo entrar con credenciales admin

### Registro en Mantente App
- [ ] Botón "Crear cuenta" visible en http://localhost:5173
- [ ] Puedo llenar email y contraseña
- [ ] Submito formulario sin errores
- [ ] Aparece mensaje "Cuenta creada exitosamente"

### Login en Mantente App
- [ ] Puedo iniciar sesión con credenciales creadas
- [ ] Redirección a dashboard (http://localhost:5173/)
- [ ] Aparece nombre de usuario en navbar
- [ ] No hay errores en consola

## 📊 Funcionalidad

### Dashboard
- [ ] Se carga sin errores
- [ ] Datos iniciales vacíos (es normal en primera ejecución)
- [ ] No hay errores en consola (F12)

### Ventas
- [ ] Puedo crear una venta
- [ ] Datos se guardan
- [ ] Aparece en la lista
- [ ] Puedo editar
- [ ] Puedo eliminar

### Inventario
- [ ] Puedo crear producto
- [ ] Puedo ver lista
- [ ] Puedo actualizar stock
- [ ] Puedo eliminar

### Clientes
- [ ] Puedo crear cliente
- [ ] Datos persisten
- [ ] Puedo editar información
- [ ] Puedo cambiar estado

### Facturas
- [ ] Opción para generar factura
- [ ] Puedo crear documento
- [ ] Se guarda correctamente
- [ ] Puedo ver listado

### Premium
- [ ] Opción de suscripción visible
- [ ] Mensaje de estado correcto
- [ ] Sin errores en integración

## 🛡️ Seguridad

### Aislamiento de datos
- [ ] Registra 2 usuarios diferentes
- [ ] Usuario A no ve datos de Usuario B
- [ ] Cada usuario solo ve sus datos

### Acceso API
- [ ] Endpoint `/api/collections/ventas/records` requiere autenticación
- [ ] Sin token, retorna error 401

## 🔍 Consola del navegador (F12)

### Errores
- [ ] No hay errores en rojo (Error)
- [ ] Warnings son normales (yellow)

### Network
- [ ] Peticiones a `http://localhost:8090/api/*` exitosas (200/201)
- [ ] No hay 401 o 403 innecesarios

### Application
- [ ] Token PocketBase en localStorage
- [ ] Cookie de sesión presente

## 📊 Admin PocketBase

- [ ] Panel Admin http://localhost:8090/_/ accesible
- [ ] Puedo ver todas las colecciones (15+)
- [ ] Colecciones con datos de usuarios activos
- [ ] Records con campo `user_id` poblado

### Colecciones esperadas
- [ ] premium_subscriptions
- [ ] inventario
- [ ] ventas
- [ ] egreso
- [ ] historialMeses
- [ ] clientes
- [ ] facturas
- [ ] devoluciones
- [ ] presupuestos
- [ ] notas_entrega
- [ ] perfil_empresa
- [ ] products
- [ ] customers
- [ ] orders
- [ ] invoices

## 🧪 Pruebas Avanzadas

### Sincronización (mantente-connect)
- [ ] Si usas mantente-connect, datos se sincronizan
- [ ] Logs en sync_log sin errores

### Performance
- [ ] App responde rápidamente (<2 segundos)
- [ ] No hay lag al navegar
- [ ] Búsquedas filtran correctamente

### Persistencia
- [ ] Cierro navegador
- [ ] Reabre http://localhost:5173
- [ ] Todavía estoy logueado (si no cerré sesión)

### Múltiples pestañas
- [ ] Abre 2 pestañas del navegador
- [ ] Crea dato en pestaña 1
- [ ] Refresca pestaña 2 (F5)
- [ ] Aparece el nuevo dato

## 🔄 Reinicio

### Servidor
- [ ] Ctrl+C para detener PocketBase
- [ ] `npm start` nuevamente
- [ ] Se reinicia sin errores
- [ ] Datos persisten

### App
- [ ] Ctrl+C para detener Vite
- [ ] `npm run dev` nuevamente
- [ ] App se recompila exitosamente

## 📦 Build para Producción

- [ ] `npm run build` en `mantente-app` sin errores
- [ ] Carpeta `dist/` creada
- [ ] Archivos minificados generados

## 🚀 Deployment

- [ ] PocketBase puede correr en servidor
- [ ] App React optimizada para producción
- [ ] `.env` de producción configurado

---

## ✅ ESTADO FINAL

Si todas las casillas están marcadas:

```
✅ MIGRACIÓN COMPLETADA Y VERIFICADA
✅ APP 100% FUNCIONAL
✅ SEGURIDAD CONFIRMADA
✅ LISTA PARA PRODUCCIÓN
```

## ⚠️ Si algo falló

1. **Revisar logs de error** en ambas terminales
2. **Verificar puertos** (netstat -ano | find "5173" y "8090")
3. **Eliminar `pb_data/`** si hay problemas de BD
4. **Reinstalar dependencias** (`rm -r node_modules && npm install`)
5. **Revisar documentación** en MIGRACION_POCKETBASE_GUIA.md

---

**Fecha de verificación:** ____________  
**Verificado por:** ____________  
**Observaciones:** ____________
