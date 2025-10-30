# 🧪 Pasos para Reproducir y Verificar el Arreglo

## 📸 Lo que Viste (Del Error Reportado)

Tú compartiste dos capturas:
1. Factura **FAC-18-040** CON productos (collar perlado x50, telefono samsung x1)
2. Error en Devoluciones: **"La factura #FAC-18-040 no tiene productos asociados"**

El arreglo hace que AHORA funcione correctamente.

---

## 🚀 Instrucciones Exactas para Verificar

### PASO 1: Inicia la aplicación
```powershell
Set-Location "c:\Users\angel\OneDrive\Documents\proyecto mantente\mantente-app"
npm run dev
```

Espera a ver:
```
✅ Local: http://localhost:5173
```

### PASO 2: Abre en navegador
```
http://localhost:5173
```

### PASO 3: Inicia sesión
- Usa tu usuario y contraseña

### PASO 4: Ve a tab **Ventas**

### PASO 5: Crea una venta EXACTAMENTE como antes

**5.1. Selecciona Cliente:**
- Click en dropdown "Cliente"
- Selecciona: **maria**

**5.2. Agrega el primer producto:**
- Dropdown "Producto": **collar perlado**
- Cantidad: **50**
- Precio: **$50**
- Click: **Agregar Producto**

**5.3. Agrega el segundo producto:**
- Dropdown "Producto": **telefono samsung**
- Cantidad: **1**
- Precio: **$200**
- Click: **Agregar Producto**

**5.4. (IMPORTANTE) Marca Factura Automática:**
- ✅ Marca el checkbox: **"Generar Factura Automáticamente"**

**5.5. Guarda la venta:**
- Click: **Guardar Venta**

### PASO 6: Espera el mensaje de éxito

Deberías ver:
```
✅ Venta y Factura FAC-XXX-YYY creadas exitosamente
```

**ANOTA el número de factura** (ej: FAC-18-040)

### PASO 7: Ve a tab **Devoluciones**

### PASO 8: Click en **"Por Factura (Bulk Returns)"**

### PASO 9: Busca la factura

**9.1. En "Número de Factura":**
- Escribe el número anotado (ej: FAC-18-040)

**9.2. Click: Buscar**

---

## ✅ RESULTADO ESPERADO (Ahora Funciona)

**DEBE VER:**
```
✅ Factura encontrada: FAC-18-040
✅ Cliente: maria
✅ Productos:
   □ collar perlado (Cantidad disponible: 50)
   □ telefono samsung (Cantidad disponible: 1)
```

**DEBE PODER:**
- ✅ Marcar cantidad a devolver
- ✅ Ver opciones de resolución (Reembolso, etc)
- ✅ Procesar la devolución

---

## ❌ Si VES ERROR (Significa que no funcionó arreglo)

```
❌ La factura #FAC-18-040 no tiene productos asociados
```

**Si esto pasa:**
1. Abre DevTools (F12)
2. Ve a Console
3. Busca errores en rojo
4. Copia los errores

---

## 🔍 Verificación Técnica (Advanced)

### En DevTools (F12) → Console

**Al crear la venta, debes ver:**
```
✅ Venta registrada correctamente: {
  id: 123
  codigo_venta: "VTA-2025-1729264..."
  productos_json: [...]
}
```

**Al crear la factura, debes ver:**
```
✅ Factura creada con información completa + productos: {
  id: 456
  numero_factura: "FAC-18-040"
  codigos_venta_json: ["VTA-2025-1729264..."]  ← ESTO ES LO NUEVO ✅
  productos_json: [
    {nombre: "collar perlado", cantidad: 50, ...},
    {nombre: "telefono samsung", cantidad: 1, ...}
  ]
}
```

Si ves `codigos_venta_json` lleno, el arreglo funciona ✅

---

## 📊 Comparación Lado a Lado

### ANTES (Roto):
```
CONSOLA AL CREAR FACTURA:
✅ Factura creada con información completa + productos: {
  ...
  codigos_venta_json: []  ← VACÍO ❌
  ...
}

RESULTADO EN DEVOLUCIONES:
❌ La factura no tiene productos asociados
```

### DESPUÉS (Funciona):
```
CONSOLA AL CREAR FACTURA:
✅ Factura creada con información completa + productos: {
  ...
  codigos_venta_json: ["VTA-2025-1729264..."]  ← LLENO ✅
  ...
}

RESULTADO EN DEVOLUCIONES:
✅ Factura encontrada con 2 productos
```

---

## 🎯 Checklist de Verificación

```
□ App iniciada correctamente
□ Sesión iniciada
□ Venta creada con 2 productos
□ Checkbox "Generar Factura Automáticamente" MARCADO
□ Mensaje de éxito visto
□ Número de factura anotado
□ Ir a tab Devoluciones
□ Tab "Por Factura" seleccionado
□ Factura buscada sin error ✅
□ Productos visibles en devolución ✅
□ Puede marcar cantidad a devolver ✅
□ DevTools muestra codigos_venta_json lleno ✅
```

---

## 💬 Si Todo Funciona

¡Excelente! El arreglo está funcionando correctamente.

**Lo que cambió:**
- Antes: Factura generada sin referencia a la venta → Búsqueda fallaba
- Ahora: Factura generada CON referencia a la venta → Búsqueda funciona

---

## 💬 Si Algo NO Funciona

1. **Recarga la página** (Ctrl+F5 para cache limpio)
2. **Cierra DevTools** y abre de nuevo (F12)
3. **Intenta con otro cliente/producto**
4. **Verifica conexión a Supabase** (abre supabase.com)

Si persiste el error, necesito ver:
- La imagen de la consola (F12)
- El código de error exacto
- Qué pasos hiciste

---

## 🎉 Resultado Final

Después de este arreglo:
- ✅ Facturas generadas automáticamente tienen referencia a la venta
- ✅ Devoluciones por factura funcionan correctamente
- ✅ Sistema de trazabilidad completo

**¡Ya está listo!** 🚀