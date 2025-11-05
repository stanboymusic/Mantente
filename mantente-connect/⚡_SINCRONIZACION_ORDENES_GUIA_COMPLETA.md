# 🛒 SINCRONIZACIÓN DE ÓRDENES - GUÍA COMPLETA

## ✨ ¿QUÉ CAMBIÓ?

Exactamente lo mismo que hicimos con productos y clientes. Ahora las órdenes tienen:

✅ **Mapping automático** de órdenes locales → Supabase  
✅ **Validación de `user_id`** antes de sincronizar  
✅ **Logging detallado** en DevTools Console  
✅ **Manejo de errores específico** de Supabase  

---

## 🎯 FLUJO DE SINCRONIZACIÓN DE ÓRDENES

```
┌─────────────────────────────────────────┐
│  USER EN MANTENTE CONNECT (OFFLINE)    │
│  Crea una orden                         │
└─────────────┬───────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────┐
│  ORDEN GUARDADA EN IndexedDB            │
│  - Agregada a "cambios sin sincronizar"│
│  - Estado: synced = false              │
└─────────────┬───────────────────────────┘
              │
              ▼
    ¿CONEXIÓN INTERNET?
    ┌─────────┴─────────┐
   NO                   SÍ
    │                   │
    ▼                   ▼
ESPERAR             SINCRONIZAR
CONEXIÓN          (syncService.js)
                    │
                    ▼
            ┌──────────────────────┐
            │  mapOrderToMantente()│
            │  - Valida user_id   │
            │  - Convierte campos │
            └──────────┬───────────┘
                       │
                       ▼
            ┌──────────────────────┐
            │  supabaseService     │
            │  .createOrder()      │
            └──────────┬───────────┘
                       │
        ┌──────────────┴──────────────┐
        │                             │
        ▼                             ▼
    ✅ ÉXITO                    ❌ ERROR
    │                             │
    ▼                             ▼
ORDEN CREADA EN              MOSTRAR ERROR
SUPABASE TABLE              EN CONSOLE
    │                             │
    ▼                             ▼
ACTUALIZAR                  REINTENTAD
IndexedDB                   (próximo ciclo)
    │                             
    ▼                             
✅ "0 cambios sin 
   sincronizar"
    │
    ▼
MANTENTE (APP PRINCIPAL)
LEE SUPABASE Y VE LA ORDEN
COMO "VENTA"
```

---

## 🚀 PASOS PARA CONFIGURAR (5 minutos)

### PASO 1: Ejecutar SQL en Supabase

1. Ve a https://app.supabase.com → Tu Proyecto → **SQL Editor**
2. Abre el archivo: `SQL_VERIFICAR_RLS_ORDENES.sql`
3. Copia **TODO** el contenido
4. Pégalo en el editor SQL de Supabase
5. Presiona **▶️ Ejecutar** (verde arriba a la derecha)
6. Deberías ver ✅ sin errores

**Qué hace este SQL:**
- ✅ Habilita RLS en tabla `orders`
- ✅ Elimina políticas antiguas
- ✅ Crea 4 políticas nuevas (SELECT, INSERT, UPDATE, DELETE)
- ✅ Verifica que todo esté correcto

---

### PASO 2: Reinicia la App

```bash
npm run dev
```

Espera que muestre `VITE v... ready in ...`

---

### PASO 3: Prueba Crear una Orden

1. **Abre Mantente Connect** en navegador
2. **Ve a:** Órdenes → + Nueva Orden
3. **Rellena:**
   - Cliente: (selecciona uno)
   - Producto: (selecciona uno)
   - Cantidad: 1
   - Precio: $10
4. **Guarda** ✅

5. **Abre DevTools** (F12 → Console)
6. **Observa los mensajes** (debería ver algo como):

```
🛒 INICIO: Creando orden en Supabase...
🔄 Mapeando orden a formato Mantente/Supabase: ...
📤 Insertando en tabla 'orders': ...
✅ ÉXITO: Orden creada en Supabase: { id: "...", user_id: "...", ... }
```

---

## ✅ VERIFICACIÓN (3 PASOS)

### 1️⃣ ¿EL CONTADOR BAJÓ?

- Antes: "1 cambio sin sincronizar"
- Después (espera 10 seg): "0 cambios sin sincronizar"

Si **NO baja** → Ver sección **Debugging** más abajo

---

### 2️⃣ ¿APARECE EN MANTENTE?

1. Abre **Mantente (app principal)** en otra tab
2. Ve a **Ventas** (debería listar como nueva venta)
3. Si **NO aparece** → Ver sección **Debugging**

---

### 3️⃣ ¿PERSISTE AL REFRESCAR?

1. En Mantente Connect, presiona **F5** (o Ctrl+R)
2. Ve nuevamente a **Órdenes**
3. ¿La orden aún está ahí?

Si **NO persiste** → Ver sección **Debugging**

---

## 🔧 DEBUGGING - PROBLEMAS COMUNES

### ❌ PROBLEMA 1: "El contador NO baja a 0"

**Posible causa:** RLS no está configurado o hay error en mapeo

**Solución:**
1. Abre DevTools Console (F12)
2. Busca mensajes rojos (`❌ ERROR`)
3. Lee el error específico

**Errores comunes:**

```
❌ ERROR: PGRST116 
"new row violates row-level security policy"
```
→ **Solución:** El `user_id` no coincide. Ejecuta nuevamente `SQL_VERIFICAR_RLS_ORDENES.sql`

---

```
❌ ERROR: PGRST100 
"No rows affected - wrong or missing user_id"
```
→ **Solución:** Falta `user_id` en la orden. Verifica que el usuario esté autenticado.

---

```
❌ CRÍTICO: La orden NO tiene user_id
```
→ **Solución:** El `user_id` no se está pasando. En `dataStore.js`, asegúrate que:

```javascript
addOrder: async (order) => {
  // DEBE incluir user_id
  const orderWithUser = {
    ...order,
    user_id: usuario.id  // ← CRÍTICO
  }
}
```

---

### ❌ PROBLEMA 2: "La orden NO aparece en Mantente"

**Posible causa:** La orden se sincronizó pero Mantente no la ve

**Solución:**
1. En Mantente, presiona **F5** para refrescar
2. Ve a **Ventas** nuevamente
3. ¿Ahora aparece?

Si **aún NO**:
```sql
-- En Supabase SQL Editor, ejecuta:
SELECT * FROM orders WHERE user_id = 'TU_USER_ID_AQUI' LIMIT 5;
```

¿Ves datos? Si SÍ → Mantente tiene problema de lectura  
Si NO → La orden nunca se sincronizó (ver Problema 1)

---

### ❌ PROBLEMA 3: "Error de sincronización silencioso"

**Síntoma:** Console muestra `✅ ÉXITO` pero NO aparece en Supabase

**Causa:** La orden se insertó pero con datos incompletos

**Solución:**
1. Ejecuta en Supabase:
```sql
SELECT * FROM orders ORDER BY created_at DESC LIMIT 1;
```

2. Revisa si le faltan campos (especialmente `user_id`)
3. Si faltan → El mapeo no funciona bien. Contacta con el equipo de desarrollo

---

## 📊 MONITOREO EN SUPABASE

Para ver en tiempo real cómo se sincronizan tus órdenes:

```sql
-- VER ÚLTIMAS ÓRDENES SINCRONIZADAS
SELECT 
  id,
  user_id,
  code,
  status,
  total,
  created_at,
  updated_at
FROM orders
ORDER BY created_at DESC
LIMIT 10;

-- CONTAR ÓRDENES POR ESTADO
SELECT 
  status,
  COUNT(*) as cantidad
FROM orders
GROUP BY status;

-- CONTAR ÓRDENES POR USUARIO
SELECT 
  user_id,
  COUNT(*) as total_ordenes,
  SUM(total) as monto_total
FROM orders
GROUP BY user_id;
```

---

## 🎯 FLUJO COMPLETO - EJEMPLO REAL

### Escenario: Usuario sin conexión crea 2 órdenes

```
TIEMPO 0:00s - USER ESTÁ OFFLINE
  ✅ Crea Orden #1 (Producto: Laptop, $800)
  ✅ Crea Orden #2 (Producto: Mouse, $20)
  
  Console muestra:
  📊 Órdenes locales: 2
  ⚠️ Sin conexión... esperando

TIEMPO 1:00m - USER SE CONECTA
  ✅ Conexión detectada
  ⏳ Iniciando sincronización...
  
  [Sincronizando Orden #1...]
  🛒 INICIO: Creando orden en Supabase...
  🔄 Mapeando orden a formato Mantente/Supabase
  📤 Insertando en tabla 'orders'
  ✅ ÉXITO: Orden creada en Supabase
  
  [Sincronizando Orden #2...]
  🛒 INICIO: Creando orden en Supabase...
  🔄 Mapeando orden a formato Mantente/Supabase
  📤 Insertando en tabla 'orders'
  ✅ ÉXITO: Orden creada en Supabase
  
  ✅ SINCRONIZACIÓN COMPLETADA
  📊 Cambios sin sincronizar: 0

TIEMPO 1:10m - VERIFICA EN MANTENTE
  ✅ Abre Mantente (app principal)
  ✅ Ve a Ventas
  ✅ VE LAS 2 ÓRDENES COMO NUEVAS VENTAS
```

---

## 📝 RESUMEN TÉCNICO

### Funciones Modificadas en `supabaseService.js`:

1. **`mapOrderToMantente(order)`** (nuevo)
   - Convierte orden local → formato Supabase
   - Valida campos numéricos
   - Asegura `user_id` presente
   - Mapea camelCase → snake_case

2. **`createOrder(order)`** (mejorado)
   - Valida `user_id` antes de insertar
   - Usa `mapOrderToMantente()`
   - Logging detallado en cada paso
   - Captura errores de Supabase

3. **`updateOrder(id, updates)`** (mejorado)
   - Validación de `user_id`
   - Logging en actualización
   - Manejo de errores específicos

4. **`deleteOrder(id)`** (mejorado)
   - Logging de eliminación
   - Captura de errores

---

## 🚨 ERRORES Y SOLUCIONES RÁPIDAS

| Error | Causa | Solución |
|-------|-------|----------|
| "no user_id" | Usuario no autenticado | Ingresa nuevamente en la app |
| "PGRST116" | RLS bloqueando | Ejecuta `SQL_VERIFICAR_RLS_ORDENES.sql` |
| Tarda >30s sincronizar | Conexión lenta | Espera o reinicia conexión |
| No aparece en Mantente | Mantente no refrescó | Presiona F5 en Mantente |
| Datos incompletos | Mapeo falla | Revisa Console para detalles |

---

## 💡 TIPS PRO

**Activar logging detallado:**
```javascript
// En DevTools Console:
localStorage.setItem('DEBUG_SYNC', 'true')
// Luego recarga la página
```

**Limpiar sincronización completamente:**
```javascript
// En DevTools Console:
const db = await indexedDB.databases()[0]
const request = indexedDB.deleteDatabase(db.name)
// Luego recarga: F5
```

**Ver estado de RLS en tiempo real:**
```sql
-- En Supabase SQL Editor:
SELECT tablename, COUNT(*) as policies
FROM pg_policies
WHERE tablename IN ('orders', 'inventario', 'clientes')
GROUP BY tablename;
```

---

## ✅ RESULTADO FINAL

Una vez completado esto:

✅ Órdenes se crean offline  
✅ Se sincronizan automáticamente online  
✅ Aparecen en Mantente como ventas  
✅ Persisten al refrescar  
✅ Errores visibles en Console  

🎉 **¡TU SINCRONIZACIÓN DE ÓRDENES ESTÁ LISTA!**

---

**¿Problemas?** Abre DevTools Console (F12) y busca mensajes con:
- 🛒 = Operación de orden
- 🔄 = Mapeo de datos
- 📤 = Envío a Supabase
- ✅ = Éxito
- ❌ = Error

¡Los mensajes dirán exactamente qué falló! 🎯