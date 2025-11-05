# 🔧 DEBUG CRÍTICO: SINCRONIZACIÓN NO FUNCIONA

## ⚠️ PROBLEMA REPORTADO
- Los datos que se agregan **desaparecen al refrescar** ✅ (se guardan localmente)
- Muestra **"6 cambios sin sincronizar"** ✅ (se marca en cola)
- Pero NO se sincronizan con Supabase ❌ (no aparecen en Mantente)
- El contador **NO baja** aunque dice "Sincronización completada"

---

## 🎯 SOLUCIÓN IMPLEMENTADA

He mejorado `supabaseService.js` con:

1. **Mapeo mejor de datos** - Asegura que `owner` (user_id) siempre se incluye
2. **Logging detallado** - Puedes ver exactamente qué falla
3. **Validación de datos** - Rechaza si falta el `user_id`
4. **Manejo de errores mejorado** - Reporta errores de Supabase específicamente

---

## 🚀 PASOS PARA PROBAR

### 1️⃣ Reinicia la App
```bash
npm run dev
```

### 2️⃣ Abre DevTools (F12 → Console)

### 3️⃣ Agrega un Producto
- Ve a **Inventario**
- Clic en **+ Nuevo Producto**
- Nombre: `TEST_2025`
- Precio: `100`
- Cantidad: `5`
- **Guardar**

### 4️⃣ OBSERVA LA CONSOLA
Deberías ver:

#### ✅ SI FUNCIONA (deberías ver esto):
```
🔄 Mapeando producto a formato Mantente: { original: {...}, user_id: "..." }
✅ Producto mapeado: { nombre: "TEST_2025", owner: "...", ... }
📤 Insertando en tabla 'inventario': { nombre: "TEST_2025", ... }
✅ ÉXITO: Producto creado en Supabase: { id: ..., nombre: "TEST_2025" ... }
✅ Sincronización completada - 1 exitosos, 0 fallidos
```

#### ❌ SI FALLA, busca:
```
❌ CRÍTICO: El producto NO tiene user_id
O
❌ ERROR de Supabase al crear producto: { code: "...", message: "..." }
O
❌ ERROR: Supabase retornó datos vacíos
```

---

## 🔍 DEBUGGING POR TIPO DE ERROR

### Error: "El producto NO tiene user_id"
**Problema**: El usuario no está loggeado o `user.id` es undefined

**Solución**:
1. Verifica que estés loggeado (deberías ver tu email en Navbar)
2. Abre DevTools → Console y busca: `const user = JSON.parse(localStorage.getItem('auth'))`
3. Deberías ver un objeto con `id`, `email`, etc.
4. Si está vacío, haz logout y login de nuevo

### Error: "PGRST116" o "401 Unauthorized"
**Problema**: La conexión a Supabase está fallando

**Solución**:
1. Verifica que `.env.local` tiene:
   - `VITE_SUPABASE_URL` correcto
   - `VITE_SUPABASE_KEY` correcto
2. Copia estos valores de: https://app.supabase.com → Proyecto → Settings → API

### Error: "permission denied"
**Problema**: Las políticas de RLS en Supabase están bloqueando

**Solución**:
1. Ve a Supabase → SQL Editor
2. Ejecuta esta consulta para permitir inserciones:
```sql
ALTER TABLE inventario ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Usuarios pueden crear productos" ON inventario
  FOR INSERT WITH CHECK (owner = auth.uid());
```

---

## 📊 FLUJO CORRECTO DE SINCRONIZACIÓN

```
1. Usuario agrega producto
   ↓
2. Se guarda en IndexedDB (local)
   ↓
3. Se agrega a SYNC_QUEUE
   ↓
4. SyncManager detecta: isOnline=true && pendingSync > 0
   ↓
5. Llama a syncPendingData(user.id)
   ↓
6. Itera items de SYNC_QUEUE
   ↓
7. Para cada item, llama a supabaseService.createProduct()
   ✅ SI ÉXITO: Elimina de SYNC_QUEUE
   ❌ SI FALLA: Deja en SYNC_QUEUE para reintentar
   ↓
8. Recarga datos de Supabase
   ↓
9. Actualiza IndexedDB
   ↓
10. Muestra "Sincronización completada"
```

---

## 🧪 TEST COMPLETO (5 minutos)

### Paso 1: Verificar que el contador DESAPARECE
1. Agrega un cliente en **Clientes**
2. Debe aparecer: **"6 cambios sin sincronizar"**
3. Si están online, espera 5-10 segundos
4. ¿El contador **bajó a 0**?
   - ✅ **SÍ** → La sincronización funciona
   - ❌ **NO** → Hay un error (revisa la consola)

### Paso 2: Verificar que PERSISTEN en Mantente
1. Abre Mantente (otra tab)
2. Ve a **Clientes**
3. ¿Aparece el cliente que acabas de agregar?
   - ✅ **SÍ** → La sincronización cruzada funciona
   - ❌ **NO** → Verifica que Mantente tiene el mismo user_id

### Paso 3: Verificar que PERSISTEN al refrescar
1. Refresca Mantente Connect (F5)
2. ¿Sigue viéndose el cliente?
   - ✅ **SÍ** → Los datos persisten correctamente
   - ❌ **NO** → Hay un problema con IndexedDB

---

## 🎯 COSAS A VERIFICAR

### 1. ¿El user_id es el mismo en ambas apps?
En Mantente Connect Console:
```javascript
console.log("Auth en Connect:", JSON.parse(localStorage.getItem('auth')).id)
```

En Mantente Console (si está disponible):
```javascript
console.log("Auth en Mantente:", JSON.parse(localStorage.getItem('user')).id)
```

**Deberían ser IGUALES**

### 2. ¿Las políticas de RLS permiten inserciones?
En Supabase:
1. Ve a **Database** → **Policies**
2. Tabla `inventario` → Ve que hay una política FOR INSERT
3. Tabla `clientes` → Ve que hay una política FOR INSERT

### 3. ¿Los datos están en las tablas correctas?
En Supabase SQL Editor:
```sql
-- Ver todos los productos del usuario
SELECT * FROM inventario WHERE owner = 'YOUR_USER_ID';

-- Ver todos los clientes del usuario
SELECT * FROM clientes WHERE owner = 'YOUR_USER_ID';
```

**Deberías ver los datos que sincronizaste**

---

## 💡 SOLUCIÓN RÁPIDA SI SIGUE SIN FUNCIONAR

Si después de estos pasos sigue sin funcionar:

### Opción 1: Reinicia todo
```bash
# En carpeta mantente-connect
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Opción 2: Limpia el caché del navegador
```
F12 → Application → Storage → Clear Site Data → Aplicación
```

### Opción 3: Verifica RLS directamente en Supabase
```sql
-- Esto debería fallar (prueba de seguridad)
SELECT * FROM inventario WHERE owner != 'OTHER_USER_ID';

-- Esto debería funcionar (si eres el dueño)
SELECT * FROM inventario WHERE owner = (SELECT auth.uid());
```

---

## 📱 PANTALLA QUE DEBERÍAS VER

```
Mantente Connect
Dashboard
└─ En línea ✓
└─ Base de datos local: Lista ✓
└─ Última sincronización: Hace unos segundos
└─ 0 cambios pendientes  ← IMPORTANTE: Debe ser 0
```

Si ves **"6 cambios pendientes"** después de 30 segundos, hay un error en la sincronización.

---

## ✅ RESUMEN DEL FIX

| Antes | Después |
|-------|---------|
| ❌ No incluía `owner` en mapeo | ✅ `owner` siempre incluido |
| ❌ Sin logging de qué falla | ✅ Logging detallado paso a paso |
| ❌ Errores silenciosos | ✅ Errores claros y específicos |
| ❌ No validaba `user_id` | ✅ Rechaza si falta `user_id` |
| ❌ Sin información de Supabase | ✅ Reporta errores de Supabase |

---

## 📞 SI AÚN FALLA

Después de reiniciar y probar, si ves un error específico en la consola:

1. **Copia el error completo** (todo el mensaje rojo)
2. **Captura una pantalla** del estado en Dashboard
3. **Abre el archivo `supabaseService.js`** y confirma que tiene los cambios

El error te dirá exactamente qué está fallando. Los mensajes son específicos:
- ❌ "CRÍTICO: El producto NO tiene user_id" → Problema de auth
- ❌ "Error Supabase: permission denied" → Problema de RLS
- ❌ "Error Supabase: 401 Unauthorized" → Problema de API key