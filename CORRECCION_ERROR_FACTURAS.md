# ✅ Corrección: Error al Crear Facturas

## ❌ Error Reportado
```
Error al crear factura: null value in column "cliente" of relation "facturas" 
violates not-null constraint
```

---

## 🔍 Causa del Error

### Problema
Se estaba enviando **`cliente_id`** (número) pero Supabase espera **`cliente`** (nombre del cliente como texto).

### Estructura de la Tabla
```sql
CREATE TABLE IF NOT EXISTS facturas (
  cliente VARCHAR(255) NOT NULL,   ← Aquí: espera NOMBRE del cliente, no ID
  ...
);
```

### Envío Incorrecto (Antes)
```javascript
// GeneradorFacturas.jsx
cliente_id: parseInt(formData.cliente_id) || null  ❌ Envía: 123
```

**Resultado:** `cliente` queda NULL → Violación de restricción NOT NULL

---

## ✅ Solución Implementada

### 1. GeneradorFacturas.jsx (Línea 87)

**Cambio:**
```javascript
// Antes ❌
cliente_id: parseInt(formData.cliente_id) || null,

// Después ✅
cliente: clienteSeleccionado ? clienteSeleccionado.nombre : "Cliente Anónimo",
```

**Explicación:**
- Obtiene el cliente seleccionado del array `clientes`
- Extrae el campo `nombre` del cliente
- Si no hay cliente seleccionado, usa "Cliente Anónimo" (fallback)

---

### 2. AppContext.jsx (Línea 685)

**Cambio:**
```javascript
// Antes ❌
cliente_id: factura.cliente_id,

// Después ✅
cliente: factura.cliente, // ✅ Ahora es nombre, no ID
```

**Validación (Línea 675):**
```javascript
// Antes ❌
if (!factura.cliente_id || !factura.numero_factura)

// Después ✅
if (!factura.cliente || !factura.numero_factura)
```

---

## 📊 Flujo Corregido

### Antes ❌
```
Usuario selecciona "Cliente 1"
         ↓
FormData tiene: cliente_id = 1 (número)
         ↓
GeneradorFacturas envía: cliente_id: 1
         ↓
AppContext intenta insertar: cliente_id: 1
         ↓
Supabase: columna "cliente" recibe NULL ← ❌ ERROR
```

### Después ✅
```
Usuario selecciona "Cliente 1"
         ↓
FormData tiene: cliente_id = "1" (string del select)
         ↓
GeneradorFacturas convierte: parseInt(cliente_id) = 1
         ↓
Busca cliente: clientes.find(c => c.id === 1) = {id: 1, nombre: "Cliente 1"}
         ↓
Envía: cliente: "Cliente 1"
         ↓
AppContext inserta: cliente: "Cliente 1"
         ↓
Supabase: columna "cliente" recibe "Cliente 1" ← ✅ OK
```

---

## 🧪 Cómo Probar

1. **Inicia la app:**
   ```powershell
   npm run dev
   ```

2. **Ve a Facturas → Nueva Factura**

3. **Completa el formulario:**
   - Cliente: Selecciona uno del dropdown
   - Monto: $100
   - Método de pago: Efectivo

4. **Haz clic en "Crear Factura"**

### Resultado Esperado ✅
```
✅ Factura creada exitosamente

La factura aparece en la lista con:
├─ Número: FAC-XXXXXX-XXX
├─ Cliente: [Nombre del cliente que seleccionaste]
├─ Monto: $100
└─ Estado: Pendiente
```

### Si Sigue Fallando ❌
1. Abre la consola (F12)
2. Busca el error exacto
3. Verifica que haya al menos un cliente creado en la sección **Clientes**
4. Intenta recargar la página
5. Vuelve a intentar crear la factura

---

## 📝 Resumen de Cambios

| Archivo | Línea | Antes | Después |
|---------|-------|-------|---------|
| GeneradorFacturas.jsx | 87 | `cliente_id: parseInt(...)` | `cliente: clienteSeleccionado?.nombre` |
| AppContext.jsx | 675 | `if (!factura.cliente_id...)` | `if (!factura.cliente...)` |
| AppContext.jsx | 685 | `cliente_id: factura.cliente_id` | `cliente: factura.cliente` |

---

## ✨ Estado

```
✅ Corrección implementada
✅ Build sin errores
✅ Listo para probar
```

Ahora debería poder crear facturas sin el error de NULL en cliente. ¡Inténtalo!