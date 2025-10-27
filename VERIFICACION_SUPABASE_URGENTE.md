# 🚨 VERIFICACIÓN URGENTE EN SUPABASE

Estos bugs son **críticos** pero fáciles de diagnosticar si revisamos los datos reales en tu base de datos.

---

## 📋 Paso 1: Acceder a Supabase

1. Ve a https://supabase.com
2. Inicia sesión
3. Abre tu proyecto "Mantente"
4. En la barra lateral izquierda, ve a **"Table Editor"**

---

## 🔍 VERIFICACIÓN 1: Perfil de Empresa

### En la tabla: `empresa_profiles`

Busca el registro de tu empresa:
- Haz clic en la tabla `empresa_profiles`
- Deberías ver UN registro con tu información

**Verifica estos campos:**

| Campo | ¿Debe estar lleno? | Tu valor |
|-------|-------------------|----------|
| `user_id` | ✅ Sí | _________ |
| `nombre` | ✅ Sí | _________ |
| `razon_social` | ✅ Sí | _________ |
| `email` | ✅ Sí | _________ |
| `telefono` | ⚠️ Opcional | _________ |
| `direccion` | ⚠️ Opcional | _________ |

**Si ALGUNO de los CRÍTICOS está vacío:**
→ El error "completa el perfil de empresa primero" es CORRECTO
→ Ve a la app y guarda el perfil nuevamente

**Si TODO está lleno:**
→ Hay un bug de carga. Sigue leyendo.

---

## 🛍️ VERIFICACIÓN 2: Las 3 Ventas

### En la tabla: `ventas`

1. Haz clic en la tabla `ventas`
2. **Filtra por cliente específico:** Busca una forma de filtrar
   - Algunos clientes tienen ID como `1`, `2`, `3`, etc.
   - Filtra ventas donde `cliente_id = [TU CLIENTE]`

**Para cada una de las 3 ventas, verifica:**

| Venta 1 | |
|---------|---|
| `id` | _________ |
| `cliente_id` | _________ |
| `owner` (tu user_id) | _________ |
| `facturado` | ⭕ DEBE ser **FALSE** |
| `monto` | _________ |
| `fecha` | _________ |

| Venta 2 | |
|---------|---|
| `id` | _________ |
| `cliente_id` | _________ |
| `owner` (tu user_id) | _________ |
| `facturado` | ⭕ DEBE ser **FALSE** |
| `monto` | _________ |
| `fecha` | _________ |

| Venta 3 | |
|---------|---|
| `id` | _________ |
| `cliente_id` | _________ |
| `owner` (tu user_id) | _________ |
| `facturado` | ⭕ DEBE ser **FALSE** |
| `monto` | _________ |
| `fecha` | _________ |

**PROBLEMA POTENCIAL #1:**
Si el campo `facturado` está en **TRUE**, significa que ya fueron facturadas. Entonces es CORRECTO que no aparezcan en GeneradorFacturas.

**PROBLEMA POTENCIAL #2:**
Si el `owner` NO es tu `user_id`, significa que las ventas no son tuyas. Esto causaría que no se vean.

**PROBLEMA POTENCIAL #3:**
Si el `cliente_id` es un STRING (ej: `"1"`) en lugar de un NÚMERO (ej: `1`), habría un mismatch de tipos.

---

## 💎 VERIFICACIÓN 3: Premium Status

### En la tabla: `premium_subscriptions`

1. Haz clic en la tabla `premium_subscriptions`
2. Busca un registro con tu `user_id`

**Verifica:**

| Campo | Valor esperado | Tu valor |
|-------|---|---|
| `user_id` | Tu ID | _________ |
| `status` | `"active"` | _________ |
| `current_period_end` | Fecha futura | _________ |

**Si `status` es `"cancelled"` o `"inactive"`:**
→ Tu suscripción premium REALMENTE terminó
→ Por eso se downgrade a Free

**Si `status` es `"active"` pero `current_period_end` es pasado:**
→ Tu suscripción expiró
→ Renuevaá tu plan

**Si TODO está bien pero aún así te degrada a Free:**
→ Hay bug en `checkPremiumStatus()`

---

## 🔧 VERIFICACIÓN 4: Mirar el SQL Actual

Si quieres ser más avanzado, puedes ejecutar queries SQL directamente:

### Query 1: Ver TU perfil de empresa

```sql
SELECT * 
FROM empresa_profiles 
WHERE user_id = 'TU_USER_ID_AQUI';
```

Reemplaza `TU_USER_ID_AQUI` con tu ID real.

### Query 2: Ver las 3 ventas sin facturar de TU cliente

```sql
SELECT id, cliente_id, facturado, monto, fecha, owner
FROM ventas
WHERE cliente_id = 1  -- Reemplaza 1 con el ID del cliente
  AND facturado = false
  AND owner = 'TU_USER_ID_AQUI'
ORDER BY fecha DESC;
```

### Query 3: Ver tu suscripción premium

```sql
SELECT * 
FROM premium_subscriptions
WHERE user_id = 'TU_USER_ID_AQUI';
```

---

## 📝 Resumen a Reportar

Después de verificar todo, copia esto y completa:

```
VERIFICACIÓN 1 - Perfil de Empresa:
✅ user_id: ___________
✅ nombre: ___________
✅ razon_social: ___________
✅ email: ___________

VERIFICACIÓN 2 - Las 3 Ventas:
Venta 1: 
  - cliente_id: ___
  - facturado: [TRUE/FALSE]
  - owner es mi user_id: [SÍ/NO]

Venta 2: 
  - cliente_id: ___
  - facturado: [TRUE/FALSE]
  - owner es mi user_id: [SÍ/NO]

Venta 3: 
  - cliente_id: ___
  - facturado: [TRUE/FALSE]
  - owner es mi user_id: [SÍ/NO]

VERIFICACIÓN 3 - Premium:
✅ status: ___________
✅ current_period_end: ___________

PROBLEMA IDENTIFICADO:
[Cuál es el problema según esta verificación]
```

---

## 🎯 Siguiente Paso

Una vez que hagas esto, **reporta el "Resumen a Reportar"** arriba y sabremos exactamente cómo arreglar los bugs.