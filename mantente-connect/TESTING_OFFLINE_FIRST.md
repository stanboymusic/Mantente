# 🧪 Guía de Testing - Sistema Offline-First

## 🎯 Objetivo

Verificar que la aplicación funciona correctamente en modo offline y sincroniza correctamente al volver online.

---

## 📋 Requisitos Previos

- [ ] La aplicación está corriendo (`npm run dev`)
- [ ] Estás autenticado en Mantente Connect
- [ ] DevTools abierto (F12)
- [ ] Pestaña Network visible en DevTools

---

## ✅ Test 1: Verificar Persistencia de Sesión

### Paso 1: Abre la app en modo online

1. Inicia la aplicación normalmente
2. Autentícate con tus credenciales
3. Verifica que veas el Dashboard con datos

### Paso 2: Abre DevTools (F12)

```
Network tab → "No throttling" → "Offline"
```

### Paso 3: Recarga la página

```
Ctrl + R o Cmd + R
```

### ✅ Esperado: 
- La página carga
- **Aún estás autenticado** (sin ir a Login)
- Ves el Dashboard aunque esté offline
- Aparece badge: "📴 Offline"

### ❌ Si falla:
- [ ] Verifica que `auth-store` se está guardando en localStorage
- [ ] Abre DevTools → Application → LocalStorage → tu_dominio
- [ ] Busca `auth-store` y verifica que tenga `user` y `session`

---

## ✅ Test 2: Crear Producto Offline

### Paso 1: Asegúrate estar offline

```
DevTools → Network → "Offline"
```

### Paso 2: Ve a Inventario

```
Click en "📦 Inventario" en la navbar
```

### Paso 3: Crea un producto

```
1. Click en "+ Nuevo Producto"
2. Completa el formulario:
   - Nombre: "Producto Test Offline"
   - Categoría: "Test"
   - Cantidad: "5"
   - Precio: "99.99"
3. Click en "Guardar"
```

### ✅ Esperado:
- El modal se cierra
- El producto aparece en la tabla **inmediatamente**
- Aparece badge: "⏳ 1 cambios sin sincronizar"
- El producto tiene marca: `synced: false`

### ❌ Si falla:
- [ ] Abre DevTools → Application → IndexedDB → mantente-db → products
- [ ] Verifica que el producto nuevo esté ahí
- [ ] Busca en sync_queue y verifica que haya un item con action: "CREATE"

---

## ✅ Test 3: Editar Producto Offline

### Paso 1: Sigue offline

```
DevTools → Network → "Offline" (sin cambios)
```

### Paso 2: Edita el producto que creaste

```
1. En la tabla, busca "Producto Test Offline"
2. Click en el botón "✏️"
3. Cambia la Cantidad a "10"
4. Click en "Guardar"
```

### ✅ Esperado:
- El producto se actualiza en la tabla
- Cantidad ahora es "10"
- Badge sigue mostrando cambios sin sincronizar: "⏳ 2 cambios sin sincronizar"

### Nota:
Cada operación (crear, editar) añade una entrada a sync_queue

---

## ✅ Test 4: Buscar y Filtrar Offline

### Paso 1: Sigue offline

### Paso 2: Prueba búsqueda

```
1. En el campo de búsqueda, escribe "Test"
2. Verifica que filtre el producto
3. Limpia el campo y busca "xyz"
4. Verifica que muestre "No hay productos"
```

### ✅ Esperado:
- La búsqueda funciona sin conexión
- Es **instantánea** (no hay retraso)

---

## ✅ Test 5: Crear Cliente Offline

### Paso 1: Ve a Clientes

```
Click en "👥 Clientes"
```

### Paso 2: Crea un cliente

```
1. Click en "+ Nuevo Cliente"
2. Completa:
   - Nombre: "Cliente Test"
   - Email: "cliente@test.com"
   - Teléfono: "123456789"
   - Ciudad: "Test City"
3. Guardar
```

### ✅ Esperado:
- Cliente aparece inmediatamente
- Badge: "⏳ 3 cambios sin sincronizar"

---

## ✅ Test 6: Crear Orden Offline

### Paso 1: Ve a Órdenes

```
Click en "📋 Órdenes"
```

### Paso 2: Crea una orden

```
1. Click en "+ Nueva Orden"
2. Completa:
   - Cliente: Selecciona "Cliente Test" (debería estar en la lista)
   - Agregar Artículo
   - Producto: Selecciona "Producto Test Offline"
   - Cantidad: 2
   - Precio: 99.99
3. Guardar
```

### ✅ Esperado:
- La orden aparece en la lista
- Puede expandirse para ver detalles
- Badge: "⏳ 4 cambios sin sincronizar" (aprox.)

### Nota importante:
Los selects en el modal cargan datos **locales** de IndexedDB

---

## ✅ Test 7: Volver Online y Sincronizar

### Paso 1: Reconecta a internet

```
DevTools → Network → "No throttling" (o quitar "Offline")
```

### Paso 2: Observa el SyncManager

```
Debería ver notificación: "🔄 Sincronizando..."
```

### ✅ Esperado:
- Notificación: "🔄 Sincronizando..."
- Los cambios se envían a Supabase
- Notificación final: "✅ Sincronización completada"
- Badge desaparece (0 cambios sin sincronizar)

### ❌ Si no sincroniza:
- [ ] Verifica que estés conectado a internet
- [ ] Abre la consola (F12) → Console tab
- [ ] Busca mensajes con 🔄 o ✅
- [ ] Verifica que supabaseSyncService tenga métodos CRUD

---

## ✅ Test 8: Verificar Sincronización en Supabase

### Paso 1: Abre Supabase Dashboard

```
https://app.supabase.com
```

### Paso 2: Ve a Table Editor

```
En el menú izquierdo → Table Editor
```

### Paso 3: Verifica los datos

```
1. Abre tabla "products"
   - Debe tener el "Producto Test Offline"
2. Abre tabla "customers"
   - Debe tener el "Cliente Test"
3. Abre tabla "orders"
   - Debe tener la orden creada
```

### ✅ Esperado:
- Todos los datos están en Supabase
- `user_id` coincide con tu usuario actual
- Los timestamps están actualizados

---

## ✅ Test 9: Flujo Completo Offline → Online

### Paso 1: Inicia offline

```
DevTools → Network → "Offline"
```

### Paso 2: Crea 3 productos diferentes

```
1. "Producto A" - $10
2. "Producto B" - $20
3. "Producto C" - $30
```

### Paso 3: Verifica badge

```
Debería mostrar: "⏳ 3 cambios sin sincronizar"
```

### Paso 4: Reconecta a internet

```
DevTools → Network → "No throttling"
```

### Paso 5: Espera sincronización

```
- Notificación: "🔄 Sincronizando..."
- Espera a que termine
- Notificación: "✅ Completada"
```

### Paso 6: Recarga la página

```
Ctrl + R
```

### ✅ Esperado:
- Todos los 3 productos siguen ahí
- No hay cambios pendientes
- Datos están en Supabase

---

## ✅ Test 10: Eliminar en Offline

### Paso 1: Asegúrate estar offline

```
DevTools → Network → "Offline"
```

### Paso 2: Elimina un producto

```
1. En Inventario, busca "Producto A"
2. Click en botón "🗑️"
3. Confirma
```

### ✅ Esperado:
- Producto desaparece de la lista
- Badge actualiza: "⏳ 1 cambio sin sincronizar"
- Cuando sincronices, se elimina de Supabase

---

## ✅ Test 11: Múltiples Operaciones en Offline

### Paso 1: Offline

```
DevTools → Network → "Offline"
```

### Paso 2: Realiza varias operaciones

```
1. Edita "Producto B" - cambia cantidad a 100
2. Crea nuevo cliente "Cliente 2"
3. Edita "Cliente Test" - cambia email
4. Crea nueva orden con "Cliente 2"
5. Edita la orden - cambia estado a "completed"
```

### Paso 3: Verifica badge

```
Debería mostrar: "⏳ 5 cambios sin sincronizar" (aprox.)
```

### Paso 4: Reconecta y sincroniza

```
DevTools → Network → "No throttling"
```

### ✅ Esperado:
- Se procesan todas las operaciones
- Notificación de sincronización
- Todos los cambios en Supabase

---

## ✅ Test 12: Búsqueda en Offline con Muchos Datos

### Paso 1: Crea 10+ productos en offline

```
Repite crear producto varias veces
```

### Paso 2: Busca por término

```
Escribe en el campo de búsqueda
```

### ✅ Esperado:
- La búsqueda filtra en tiempo real
- Sin lag
- Funciona completamente sin conexión

---

## ✅ Test 13: Indicadores de Estado

### En DevTools, verifica los indicadores:

#### Online + Sin cambios:
```
✅ No hay badge
✅ SyncManager no muestra nada
```

#### Online + Con cambios:
```
✅ Badge: "⏳ X cambios"
✅ SyncManager sincroniza automáticamente
```

#### Offline + Con cambios:
```
✅ Badge: "⏳ X cambios sin sincronizar"
✅ Badge de offline: "📴 Offline"
✅ SyncManager muestra: "Modo Offline"
```

#### Sincronizando:
```
✅ SyncManager muestra: "🔄 Sincronizando..."
✅ No puedes crear nuevos datos (opcional)
```

#### Sincronización completada:
```
✅ SyncManager muestra: "✅ Sincronización completada"
✅ Los badges desaparecen después de 5 segundos
```

---

## 🐛 Debugging Avanzado

### Ver estado completo de la app:

```javascript
// En la consola del navegador (F12 → Console)
import { useAuthStore } from './store/authStore'
import { useDataStore } from './store/dataStore'

// Ver estado de auth
const authState = useAuthStore.getState()
console.log('Auth:', authState)

// Ver estado de datos
const dataState = useDataStore.getState()
console.log('Data:', dataState)
console.log('Pending sync:', dataState.pendingSync)
console.log('Is syncing:', dataState.isSyncing)
```

### Ver IndexedDB:

```
DevTools → Application → IndexedDB → mantente-db
```

**Tienda "sync_queue":**
```
- Cada entrada = una operación pendiente
- action: CREATE/UPDATE/DELETE
- data: objeto completo de la operación
```

### Ver localStorage:

```
DevTools → Application → LocalStorage → [tu dominio]
```

**Busca:**
- `auth-store`: Sesión del usuario
- `local-state` o similar: Estado de Zustand

---

## ✅ Checklist de Validación Final

- [ ] App funciona completamente sin internet
- [ ] Datos persisten en IndexedDB
- [ ] Sesión persiste sin perder autenticación
- [ ] CRUD (crear, leer, editar, eliminar) funciona offline
- [ ] Búsqueda funciona sin conexión
- [ ] Cola de sincronización se actualiza
- [ ] Sincronización automática funciona al conectar
- [ ] Datos aparecen en Supabase después de sincronizar
- [ ] Notificaciones se muestran correctamente
- [ ] Indicadores de estado son precisos
- [ ] La app maneja múltiples operaciones
- [ ] Recarga de página mantiene datos

---

## 📊 Resultados Esperados

| Operación | Offline | Online (Sin Sync) | Online (Sincronizado) | Supabase |
|---|---|---|---|---|
| Crear | ✅ | ✅ | ✅ | ✅ |
| Leer | ✅ | ✅ | ✅ | ✅ |
| Editar | ✅ | ✅ | ✅ | ✅ |
| Eliminar | ✅ | ✅ | ✅ | ✅ |
| Buscar | ✅ | ✅ | ✅ | ✅ |
| Filtrar | ✅ | ✅ | ✅ | ✅ |

---

## 🎓 Preguntas Clave

### ¿Qué pasa si cierro el navegador mientras estoy offline?

```
✅ Los datos se guardan en IndexedDB
✅ Al reabrirlo, la sesión persiste
✅ Los datos siguen disponibles
✅ La cola de sync permanece
```

### ¿Qué pasa si cambio los datos en Supabase desde otra pestaña?

```
⚠️ Los cambios se sobreescriben cuando sincronizas
💡 Futura mejora: Detectar conflictos
```

### ¿Cuál es el tamaño máximo de IndexedDB?

```
Chrome/Firefox: ~50-100MB por dominio
Safari: ~50MB
IE: ~50MB
```

### ¿Se encriptan los datos locales?

```
🔐 IndexedDB es accesible desde la consola
💡 Futura mejora: Cifrar datos sensibles
```

---

## 📞 Troubleshooting

### Problema: El producto no aparece después de crear

**Solución:**
```javascript
// En consola
const db = await openDB('mantente-db')
const products = await db.getAll('products')
console.table(products)
```

### Problema: No sincroniza automáticamente

**Solución:**
```javascript
// En consola
const state = useDataStore.getState()
state.syncPendingData(userId)
```

### Problema: Badge de cambios no desaparece

**Solución:**
```javascript
// Manualmente sincronizar
const { pendingSync, syncPendingData } = useDataStore()
if (pendingSync > 0) await syncPendingData(userId)
```

---

## ✨ Características Verificadas

- ✅ Offline-first funcional
- ✅ Sincronización automática
- ✅ Persistencia de sesión
- ✅ CRUD local sin conexión
- ✅ Búsqueda local
- ✅ Filtros locales
- ✅ Cola de cambios
- ✅ Indicadores visuales
- ✅ Manejo de reconexión
- ✅ Datos en Supabase

---

**Fecha de Testing:** Noviembre 2024  
**Ambiente:** Mantente Connect - Offline-First Edition  
**Estado:** 🚀 Ready for Production