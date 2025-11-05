# 🚀 PASO A PASO: Resolver Loop Infinito de Sincronización

## ✅ CAMBIOS YA REALIZADOS

He hecho 2 cambios automáticos en tu código:

1. **SyncManager.jsx**: Agregué debounce para evitar sincronizar cada milisegundo
2. **dataStore.js**: Solo recarga datos si sincronización es 100% exitosa

## 📋 QUÉ HACER AHORA

### Paso 1: Actualiza la aplicación en el navegador
1. Para la aplicación: `Ctrl + C` en la terminal
2. Reinicia: `npm run dev`
3. Recarga el navegador: `F5` o `Ctrl + Shift + R` (limpiar cache)

### Paso 2: Abre DevTools (F12) y observa
1. Ve a la pestaña **Console**
2. **Observa cuidadosamente** qué sucede:

**✅ ESPERADO (arreglado):**
```
🔄 Iniciando sincronización de datos pendientes (intento 1/3)...
📤 Sincronizando 2 cambios con Supabase...
⚠️ Error sincronizando item 1: [error message]
✅ Sincronización completada - 0 exitosos, 2 fallidos
⚠️ Sincronización con 2 errores. NO recargando datos de Supabase...
```
La pantalla debería **dejar de parpadear** después de esto.

**❌ SI SIGUE PARPADEANDO:**
El problema está en las columnas/datos de Supabase.

### Paso 3: Diagnosticar el error exacto
1. En DevTools → **Network** tab
2. Filtra por "products" o "customers"
3. Busca la solicitud que dice **400**
4. Haz click en ella
5. Ve a la pestaña **Response**
6. Lee el error exacto

**Copia el error que ves aquí** ↑

### Paso 4: Opción A - Limpiar cambios problemáticos
Si tienes cambios "atrapados" en la cola, puedes limpiarlos:

1. **En DevTools Console** (F12), pega:
```javascript
const db = await (async () => {
  const { openDB } = await import('https://cdn.jsdelivr.net/npm/idb@8.0.0/+esm');
  return await openDB('mantente-db');
})();
const tx = db.transaction('sync_queue', 'readwrite');
await tx.store.clear();
console.log('✅ Sync queue limpiada');
```

2. Recarga la página: `F5`

### Paso 5: Opción B - Verificar datos en Supabase
Abre tu proyecto de Supabase y verifica que exista la tabla y tenga datos:

1. Ve a **SQL Editor**
2. Ejecuta:
```sql
-- Ver estructura de tabla
SELECT * FROM products LIMIT 1;
SELECT * FROM customers LIMIT 1;

-- Ver cuántos registros hay
SELECT COUNT(*) as product_count FROM products;
SELECT COUNT(*) as customer_count FROM customers;
```

3. Copia cualquier error que veas

## 🎯 Checklist de Diagnóstico

- [ ] He reiniciado la aplicación (`npm run dev`)
- [ ] He limpiado el cache del navegador (`Ctrl + Shift + R`)
- [ ] He abierto DevTools (F12)
- [ ] Veo el error 400 exacto en la consola
- [ ] He copiado el mensaje de error completo
- [ ] He verificado que las tablas existan en Supabase

## 🆘 Qué reportarme

Una vez hayas seguido estos pasos, cuéntame:

1. **¿La pantalla dejó de parpadear?**
   - Sí → Problema resuelto ✅
   - No → Ve al paso 2

2. **¿Cuál es el error 400 exacto?**
   - Cópialo de la pestaña Response en DevTools

3. **¿Qué tabla falla primero?**
   - ¿products o customers?

4. **¿Ves algo en la consola como:**
   ```
   ⚠️ Máximo número de reintentos (3) alcanzado. Esperando 30 segundos...
   ```

Con esa información podré arreglarlo al 100%.

## 💡 Trucos Adicionales

### Si quieres ver qué está en la sync_queue:
```javascript
// En DevTools Console
(async () => {
  const { openDB } = await import('https://cdn.jsdelivr.net/npm/idb@8.0.0/+esm');
  const db = await openDB('mantente-db');
  const queue = await db.getAll('sync_queue');
  console.log('Cola de sincronización:', queue);
})();
```

### Si quieres simular un error de conexión:
1. DevTools (F12) → **Network**
2. Busca el dropdown que dice "No throttling"
3. Selecciona "Offline"
4. Observa lo que sucede
5. Selecciona "Online" nuevamente

### Si quieres limpiar TODO:
```javascript
(async () => {
  const { openDB } = await import('https://cdn.jsdelivr.net/npm/idb@8.0.0/+esm');
  const db = await openDB('mantente-db');
  const tx = db.transaction(['products', 'customers', 'orders', 'sync_queue'], 'readwrite');
  await tx.objectStore('products').clear();
  await tx.objectStore('customers').clear();
  await tx.objectStore('orders').clear();
  await tx.objectStore('sync_queue').clear();
  await tx.done;
  console.log('✅ IndexedDB completamente limpiada');
})();
```
Luego recarga la página.

## 📱 Resumen Rápido

| Acción | Comando |
|--------|---------|
| Reiniciar app | `npm run dev` |
| Limpiar cache | `Ctrl + Shift + R` |
| Abrir DevTools | `F12` |
| Ver Console | `F12 → Console` |
| Ver Network | `F12 → Network` |
| Simular offline | `F12 → Network → Offline` |
| Limpiar sync_queue | Ver paso 4 arriba |

---

**¿Necesitas ayuda?** Sigue los pasos del Paso 3 y cuéntame el error exacto que ves en la consola.