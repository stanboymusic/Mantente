# 🔧 Diagnóstico: Loop Infinito de Sincronización

## Síntomas
- Pantalla parpadea constantemente
- Mensaje "Sincronizando..." no desaparece
- Error 400 en la consola del navegador

## Causa Identificada
El error **400** en las solicitudes a Supabase indica que hay un problema con los datos que se intentan sincronizar. Las solicitudes fallan pero el sistema intenta nuevamente inmediatamente → **LOOP INFINITO**

## ✅ ARREGLADO
He implementado dos soluciones:

### 1. Debounce en SyncManager
- Espera 5 segundos entre reintentos
- Máximo 3 intentos antes de pausar 30 segundos
- Evita que dispare sincronización cada milisegundo

### 2. Validación en dataStore
- Si hay errores durante sincronización, **NO** recarga datos desde Supabase
- Esto previene que el loop se reinicie automáticamente
- Solo recarga cuando sincronización es 100% exitosa

## 📋 Pasos para Diagnosticar

### Paso 1: Abre la consola del navegador (F12)
Busca el error 400 exacto. Debería mostrar algo como:
```
Failed to load resource: the server responded with a status of 400
POST https://[your-project].supabase.co/rest/v1/products
```

### Paso 2: Inspecciona el error completo
1. Abre DevTools (F12)
2. Ve a la pestaña **Network**
3. Filtra por "products" o "customers"
4. Haz click en la solicitud que falla (400)
5. Lee el error en la pestaña **Response**

### Paso 3: Causas comunes del 400

#### ❌ Problema: Columnas no existen
**Síntoma**: Error menciona una columna específica
**Solución**: Verifica las columnas en Supabase

```sql
-- En Supabase SQL Editor, ejecuta:
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'products';
```

#### ❌ Problema: Falta autenticación
**Síntoma**: Error de "unauthorized" o "permission denied"
**Solución**: Verifica que esté logueado y el token sea válido

#### ❌ Problema: user_id no existe
**Síntoma**: Error de constraint o "no rows"
**Solución**: Verifica que el user_id sea válido

#### ❌ Problema: Políticas de RLS
**Síntoma**: Error de "permission denied"
**Solución**: Verifica las políticas en Supabase

## 🔍 Debugging en tiempo real

### En DevTools Console, ejecuta:

```javascript
// Ver el contenido de sync_queue
const db = await window.IDBFactory.databases()
console.log('IndexedDB Databases:', db)

// Ver si hay cambios pendientes
const request = indexedDB.open('mantente-db')
request.onerror = () => console.log('Error abriendo DB')
request.onsuccess = (event) => {
  const database = event.target.result
  const tx = database.transaction('sync_queue', 'readonly')
  const store = tx.objectStore('sync_queue')
  const getAllRequest = store.getAll()
  getAllRequest.onsuccess = () => {
    console.log('Sync Queue:', getAllRequest.result)
  }
}
```

## 🛠️ Acciones Inmediatas

### Opción A: Limpiar la sync_queue (temporal)
Si todo funciona excepto la sincronización, puedes limpiar la cola:

```javascript
// En DevTools Console
const request = indexedDB.open('mantente-db')
request.onsuccess = (event) => {
  const database = event.target.result
  const tx = database.transaction('sync_queue', 'readwrite')
  const store = tx.objectStore('sync_queue')
  store.clear()
  console.log('✅ Sync queue limpiada')
}
```

### Opción B: Desconectar y reconectar
1. Apaga internet (o abre DevTools > Network > Offline)
2. Recarga la página
3. Enciende internet nuevamente
4. Observa los logs

## 📊 Qué debería ver después del arreglo

```
✅ CORRECTO:
🔄 Iniciando sincronización de datos pendientes (intento 1/3)...
📤 Sincronizando 2 cambios con Supabase...
✅ Sincronización completada - 2 exitosos, 0 fallidos
📡 Recargando datos desde Supabase...
✅ Datos obtenidos de Supabase: 3 productos, 4 clientes, 19 órdenes

❌ INCORRECTO (loop):
🔄 Iniciando sincronización... (se repite infinitamente)
⚠️ Error sincronizando item: [error]
```

## 📞 Próximos Pasos

1. **Abre DevTools (F12) → Console**
2. **Copia el error 400 exacto**
3. **Cuéntame:**
   - ¿Cuál es el error exacto que ves?
   - ¿La pantalla sigue parpadeando con el nuevo código?
   - ¿Qué tabla está fallando (products, customers)?

Con esa información podré arreglarlo rápidamente.