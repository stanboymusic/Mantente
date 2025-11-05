# 🎯 MIGRACIÓN EN 5 PASOS (2 MINUTOS)

## 📌 EL PROBLEMA
- ✅ Tienes datos en **Mantente** (inventario, clientes, ventas)
- ❌ **Mantente Connect** está vacía (todo en 0)
- 💡 Ambas usan el mismo login pero bases de datos diferentes

## ✅ LA SOLUCIÓN
Ejecutar una migración automática que copia tus datos.

---

## 🚀 PASO 1: Abre Mantente Connect

Abre tu navegador y ve a:
```
http://localhost:3000
```

Si no tienes npm run dev corriendo, ejecuta:
```bash
npm run dev
```

---

## 🔐 PASO 2: Inicia sesión

- Email: `adrcproducciones@gmail.com`
- Contraseña: `Tu contraseña`

Deberías ver el Dashboard con todo en 0 (por ahora).

---

## 🔗 PASO 3: Accede a la página de migración

En la barra de direcciones, cambia a:
```
http://localhost:3000/migrate
```

Deberías ver una pantalla así:

```
┌─────────────────────────────────────┐
│    🔄 Migración de Datos           │
│  Traslada tus datos de Mantente   │
│      a Mantente Connect            │
│                                   │
│ Usuario: adrcproducciones@...     │
│                                   │
│ ¿Qué se migrar?                   │
│ 📦 Productos                      │
│ 👥 Clientes                       │
│ 🛒 Ventas                         │
│                                   │
│   [🚀 Iniciar Migración]          │
└─────────────────────────────────────┘
```

---

## ▶️ PASO 4: Haz clic en "🚀 Iniciar Migración"

Aparecerá una consola mostrando lo que está pasando:

```
🚀 INICIANDO MIGRACIÓN DE DATOS
👤 Usuario: adrcproducciones@gmail.com
🔑 ID: 1234567890...

📦 Migrando productos...
  ✅ Producto migrado: Laptop
  ✅ Producto migrado: Mouse
  ✅ Producto migrado: Monitor
✅ Productos: 3/3 completados

👥 Migrando clientes...
  ✅ Cliente migrado: Juan Pérez
  ✅ Cliente migrado: Carlos López
✅ Clientes: 2/2 completados

🛒 Migrando ventas como órdenes...
  ✅ Venta migrada: Venta #1
  ✅ Venta migrado: Venta #2
✅ Ventas: 2/2 completados

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ MIGRACIÓN COMPLETADA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📦 Productos: 3 / 3
👥 Clientes: 2 / 2
🛒 Ventas: 2 / 2
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## ⏳ PASO 5: Espera a que termine

Esto tardará algunos segundos (depende de cuántos datos tengas).

Cuando termine, verás un mensaje de confirmación:
```
✅ Migración Completada
📦 Productos: X / X
👥 Clientes: X / X
🛒 Ventas: X / X
```

---

## 🎉 ¡LISTO!

Ahora:

1. Ve al **Dashboard** (`http://localhost:3000/dashboard`)
2. Recarga la página (F5)
3. Deberías ver los números actualizados:

**Antes:**
```
📦 Productos: 0
👥 Clientes: 0
🛒 Órdenes: 0
```

**Después:**
```
📦 Productos: 3 ✅
👥 Clientes: 2 ✅
🛒 Órdenes: 2 ✅
```

---

## 🔍 VERIFICAR EN DETALLES

Haz clic en cada sección para ver tus datos:

### 📦 Inventario
- `http://localhost:3000/inventory`
- Deberías ver tus productos listados

### 👥 Clientes
- `http://localhost:3000/customers`
- Deberías ver tus clientes listados

### 🛒 Órdenes
- `http://localhost:3000/orders`
- Deberías ver tus ventas listadas

---

## ❌ ¿QUÉ SI ALGO NO FUNCIONA?

### La migración dice "0 items"
**Posible causa**: No tienes datos en Mantente

**Solución**: 
- Abre Mantente (la app original)
- Crea algunos productos/clientes/ventas
- Intenta migrar de nuevo

### Sigue mostrando 0 en el Dashboard
**Posible causa**: La página no se actualizó

**Solución**:
1. Presiona `F5` (recarga total)
2. Espera 3 segundos
3. Asegúrate de estar online ✅

### Error: "Usuario no autenticado"
**Solución**:
1. Cierra la app
2. Inicia sesión de nuevo
3. Intenta migrar nuevamente

### Error en la consola (F12)
**Solución**:
1. Abre DevTools con `F12`
2. Ve a "Console"
3. Busca el mensaje de error rojo
4. Copiar el error exacto y compartir

---

## 💾 ¿DÓNDE SE GUARDAN LOS DATOS?

### Mantente (Original)
- **Base de datos**: Supabase (antiguo esquema)
- **Tablas**: `inventario`, `clientes`, `ventas`
- **Estado**: ✅ Intactos (no se modifican)

### Mantente Connect (Nueva)
- **Base de datos**: Supabase (nuevo esquema)
- **Tablas**: `products`, `customers`, `orders`
- **Estado**: ✅ Se completan con la migración

---

## 🔄 MIGRACIÓN SEGURA

✅ **Puedes migrar varias veces sin problema**
- Los datos no se duplican
- Los datos nuevos reemplazan los antiguos por ID
- Es perfecta para sincronizar cambios

---

## ⏰ ¿CUÁNTO TARDA?

- **100 productos**: ~2 segundos
- **50 clientes**: ~1 segundo
- **200 ventas**: ~3 segundos
- **TOTAL**: ~6 segundos

---

## 📱 ACCEDER DESDE MÓVIL

Si tienes una red local, también puedes acceder desde tu teléfono:

1. Averigua tu IP de Windows:
   ```bash
   ipconfig
   ```
   Busca algo como: `192.168.x.x` o `10.x.x.x`

2. Desde el teléfono accede a:
   ```
   http://192.168.x.x:3000/migrate
   ```

---

## 🚀 DESPUÉS DE MIGRAR

### Mantente Connect ahora tiene:
- ✅ Todos tus productos
- ✅ Todos tus clientes
- ✅ Todas tus ventas
- ✅ Sincronización offline automática

### Lo que falta (Fase 2):
- ⏳ Sincronización bidireccional
- ⏳ Cambios automáticos entre apps
- ⏳ Resolución de conflictos

---

## 🎯 RESUMEN

| Paso | Acción | Estado |
|------|--------|--------|
| 1 | Abre http://localhost:3000 | ▶️ |
| 2 | Inicia sesión | ▶️ |
| 3 | Ve a http://localhost:3000/migrate | ▶️ |
| 4 | Haz clic en "🚀 Iniciar Migración" | ▶️ |
| 5 | Espera a que termine | ✅ |
| 6 | Ve al Dashboard | ✅ |

---

**¿Listo? ¡Comienza la migración! 🚀**

Si necesitas ayuda, abre DevTools (F12) y compartir los errores específicos.

---

**Última actualización**: Hoy
**Tiempo estimado**: 2 minutos
**Dificultad**: ⭐ Muy fácil