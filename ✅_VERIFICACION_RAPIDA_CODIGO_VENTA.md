# ✅ Verificación Rápida - Bug Arreglado (5 minutos)

## 🎯 Lo que arreglé

**Archivo:** `src/components/Ventas.jsx` (línea 302)

**El problema:** Cuando generabas factura automática desde Ventas, no se guardaba el `codigo_venta` → Las devoluciones fallaban.

**La solución:** Agregué esta línea:
```javascript
codigos_venta_json: [ventaResult.data.codigo_venta]
```

---

## 🚀 Verificación en 5 pasos

### Paso 1: Reinicia la app
```powershell
Set-Location "c:\Users\angel\OneDrive\Documents\proyecto mantente\mantente-app"
npm run dev
```

### Paso 2: Crea una venta con factura automática
1. Ve a **Ventas** tab
2. Selecciona cliente: **maria**
3. Agrega un producto (ej: "collar perlado", cantidad 10, precio $50)
4. ✅ Marca: **Generar Factura Automáticamente**
5. Click: **Guardar Venta**

**Espera el mensaje:** ✅ Venta y Factura FAC-XXX-YYY creadas exitosamente

### Paso 3: Anota el número de factura
(Aparecerá en el mensaje de éxito, ej: `FAC-123-045`)

### Paso 4: Intenta hacer una devolución
1. Ve a **Devoluciones** tab
2. Click: **Por Factura (Bulk Returns)**
3. Escribe el número de factura en "Número de Factura"
4. Click: **Buscar**

### Paso 5: Verifica el resultado

**✅ DEBE FUNCIONAR (ahora):**
- ✅ Se muestra la factura sin error
- ✅ Se muestran los productos que vendiste
- ✅ Puedes seleccionar cantidad a devolver
- ✅ Puedes hacer la devolución

**❌ SI VES ERROR (antes del arreglo):**
- ❌ "La factura #FAC-XXX no tiene productos asociados"

---

## 🔍 Verificación en Consola (F12)

Abre DevTools (F12) → Console y busca:

**Al crear la factura, debes ver:**
```
✅ Factura creada con información completa + productos: {
  numero_factura: "FAC-123-045"
  codigos_venta_json: ["VTA-2025-1729264..."]  ✅ ESTO DEBE ESTAR
  productos_json: [...]
  ...
}
```

Si NO ves `codigos_venta_json`, recarga la página.

---

## 📊 Comparación Antes vs Después

| Acción | Antes | Después |
|--------|-------|---------|
| Crear venta con factura auto | ✅ Funciona | ✅ Funciona |
| Hacer devolución por factura | ❌ **ERROR** | ✅ **Funciona** |
| Mensaje de error | "No tiene productos" | (Sin error) |

---

## 💡 Resumen Técnico

Cuando creas una venta:
1. Se genera `codigo_venta` único (ej: "VTA-2025-1729264...")
2. Se guarda en la tabla `ventas`

Cuando se crea factura desde esa venta:
- **ANTES:** No se guardaba el código → Búsqueda fallaba
- **DESPUÉS:** Se guarda como `codigos_venta_json` → Búsqueda funciona ✅

---

## ❓ ¿Qué si algo falla?

1. **Consola muestra error:** Copia el error y comparte
2. **La factura aún sin productos:** Limpia cache (Ctrl+Shift+Delete) y recarga
3. **¿Qué tal con facturas antiguas?** Las nuevas funcionarán; las antiguas no tienen el código

**¿Listo para probar?** 🚀