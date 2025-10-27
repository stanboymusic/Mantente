# 🔍 DIAGNÓSTICO INTERACTIVO - Bugs Críticos

Vamos a identificar exactamente dónde está el problema. **Sigue estos pasos en orden:**

---

## 🧪 TEST 1: Verificar si el Perfil de Empresa se guardó correctamente

### Paso 1: Abre tu base de datos Supabase
1. Ve a https://supabase.com
2. Accede a tu proyecto
3. Ve a "SQL Editor" o "Table Editor"
4. Busca la tabla `empresa_profiles`

### Paso 2: Verifica que tu perfil existe
- **Busca un registro con tu `user_id`**
- **Verifica que estos campos estén LLENOS:**
  - ✅ `nombre` (no vacío)
  - ✅ `razon_social` (no vacío)
  - ✅ `email` (no vacío)

**Si NO ves un registro o está vacío** → El perfil nunca se guardó. Sigue el TEST 2.

**Si VES un registro con datos** → Ve al TEST 3.

---

## 📝 TEST 2: Vuelve a guardar el Perfil de Empresa

1. En la app, ve a **Perfil de Empresa**
2. Llena los campos:
   - Nombre: `Mi Empresa` (o lo que sea)
   - Razón Social: `RUC/CUIT`
   - Email: `correo@empresa.com`
   - Teléfono: `123456789` (opcional)
   - Dirección: `Dirección` (opcional)
3. **Haz clic en GUARDAR**
4. **Abre la consola del navegador (F12)**
5. Busca el mensaje **✅ Perfil de empresa guardado:**
   - Si ves este mensaje → ¡Perfecto! Recarga la página y ve al TEST 3
   - Si NO ves este mensaje → Hay error al guardar. Copia el error y repórtalo

---

## 🔗 TEST 3: Verificar que las Ventas se cargan correctamente

1. **Abre la consola del navegador (F12)**
2. Recarga la página
3. Busca estos mensajes en orden:
   ```
   ✅ Ventas sin facturar obtenidas para cliente X: [...]
   ```
   - Si ves este mensaje → Las ventas SE están buscando correctamente
   - Si NO ves este mensaje → Hay problema de carga

4. **Ahora intenta crear una venta:**
   - Ve a **Ventas**
   - Selecciona un cliente que ya tenga ventas previas
   - Crea una venta con **auto-facturar DESACTIVADO**
   - Haz clic en **GUARDAR**

5. **Abre la consola nuevamente (F12)**
   - Busca: `✅ Venta registrada exitosamente`
   - Si la ves → La venta se guardó
   - Si ves error rojo → Cópialo

---

## 💎 TEST 4: Verificar Premium Status

1. **Abre la consola (F12)**
2. Recarga la página
3. Busca estos mensajes:
   ```
   ✅ Estado premium verificado: { isActive: true, ...}
   ```
   o
   ```
   ℹ️ Usuario no tiene suscripción premium activa
   ```

**Si ves "isActive: false" o "no tiene suscripción":**
   - Ve a tu tabla `premium_subscriptions` en Supabase
   - Busca un registro con tu `user_id`
   - Verifica que `status = "active"` y `current_period_end` sea una fecha futura

**Si ves "Error temporal al verificar premium":**
   - Esto es normal ocasionalmente, pero si ves MUCHOS de estos errores
   - Significa que Supabase tiene problemas de conexión
   - Verifica tu conexión a internet

---

## 🚨 TEST 5: Crear Factura desde Ventas

1. Ve a **Ventas**
2. Crea una venta NUEVA:
   - Cliente: cualquiera
   - Productos: agrega 1 producto
   - **IMPORTANTE: Activa "auto-facturar"**
3. Haz clic en **GUARDAR**

### ¿Qué deberías ver?

**OPCIÓN A - Éxito:**
```
✅ Venta y Factura FAC-XXXX-XXX creadas exitosamente
```

**OPCIÓN B - Error esperado (si perfil no está completo):**
```
❌ Para crear factura automática debes completar tu Perfil de Empresa. 
⚙️ Ve a Perfil de Empresa en el menú.
```
→ En este caso, ve a Perfil de Empresa, completa los datos y vuelve.

**OPCIÓN C - Error de la venta NO deseado:**
```
venta registrada pero no se creo factura, completa el perfil de empresa primero
```
→ **Este es el BUG. Si ves esto, reporta.**

---

## 📋 Resumen de lo que reportar

Después de hacer todos los TESTS, copia esto y completa:

```
✅ TEST 1 - Perfil en BD: [SÍ / NO / DATOS VACÍOS]
✅ TEST 2 - Se guarda el perfil: [SÍ / NO / ERROR: ___]
✅ TEST 3 - Las ventas se cargan: [SÍ / NO]
✅ TEST 4 - Premium status: [PREMIUM / FREE / ERROR]
✅ TEST 5 - Crear factura: [ÉXITO / ERROR: ___]

ERRORES VISTOS EN CONSOLA:
[copia aquí los errores rojos que veas]
```

---

## 🎯 Próximos Pasos

Una vez completes los tests, sabremos exactamente dónde está el problema:

- Si falla TEST 1 o 2 → Problema de guardar perfil
- Si falla TEST 3 → Problema de cargar ventas
- Si falla TEST 4 → Problema de Premium
- Si falla TEST 5 → El bug principal

**Hazme saber los resultados y arreglaremos el/los problema(s) específico(s).**