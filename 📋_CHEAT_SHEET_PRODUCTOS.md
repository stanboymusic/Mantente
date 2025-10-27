# 📋 CHEAT SHEET - MÚLTIPLES PRODUCTOS EN FACTURAS

## ⚡ 30 SEGUNDOS

```
✅ QUÉ: Facturas con múltiples productos (antes: solo monto total)
✅ CÓMO: Agregar línea por línea con cantidad y precio
✅ DÓNDE: Modal de "Nueva Factura" → "🛍️ Agregar Productos"
✅ RESULTADO: PDF profesional con tabla de productos
```

---

## 🚀 3 PASOS - 10 MINUTOS

### 1️⃣ SQL (5 min)

```
URL: https://supabase.com/dashboard
Menu: SQL Editor → New Query

EJECUTA:
ALTER TABLE facturas ADD COLUMN IF NOT EXISTS productos_json JSONB DEFAULT '[]'::jsonb;

RESULTADO: ✅ Success. No rows returned.
```

### 2️⃣ APP (2 min)

```powershell
Set-Location "c:\Users\angel\OneDrive\Documents\proyecto mantente\mantente-app"
npm run dev
```

### 3️⃣ PRUEBA (3 min)

```
1. Abre: http://localhost:5173
2. Ve a: Facturas
3. Click: + Nueva Factura
4. Busca: 🛍️ Agregar Productos ← NUEVO
5. Ingresa: Nombre, Cantidad, Precio
6. Click: ➕ Agregar
7. Crea: ✅ Crear Factura
8. Descarga: 📥 PDF
```

---

## 📊 ANTES vs DESPUÉS

### ANTES (Viejo)
```
Factura: 1 monto total
Subtotal: $1,000
[Sin detalles de productos]
```

### DESPUÉS (Nuevo)
```
Factura: Múltiples productos
┌─────────────────┬──────┬────────┬────────┐
│ Producto        │ Cant.│ Precio │ Total  │
├─────────────────┼──────┼────────┼────────┤
│ Laptop          │  2   │ 500.00 │1000.00 │
│ Mouse           │  1   │  25.00 │  25.00 │
├─────────────────┴──────┴────────┼────────┤
│ SUBTOTAL:                      │1025.00 │
│ DESCUENTO:                     │   0.00 │
│ IMPUESTO:                      │ 205.00 │
│ ─────────────────────────────────────────
│ TOTAL:                         │1230.00 │
└────────────────────────────────┴────────┘
```

---

## 🎮 CÓMO USAR

### Crear Factura con 3 Productos

```
1. + Nueva Factura
2. Selecciona Cliente
3. Ingresa:
   Nombre:          Laptop
   Cantidad:        1
   Precio Unit.:    1000
   [➕ Agregar]
4. Repite para más productos
5. [✅ Crear Factura]
```

### Eliminar un Producto

```
En la tabla de productos:
Click: 🗑️
```

### Ver en PDF

```
Factura (tabla)
Click: 📥 PDF
Descarga automática
```

---

## ✅ VALIDACIONES

| Campo | Regla |
|-------|-------|
| **Nombre** | No puede estar vacío |
| **Cantidad** | Mínimo 1 |
| **Precio** | Mínimo 0.01 |
| **Productos** | Mínimo 1 para crear factura |
| **Empresa** | Debe estar completa (antes) |
| **Cliente** | Requerido (a menos que sea ticket) |

---

## 🗂️ ESTRUCTURA GUARDADA EN BD

```json
{
  "productos_json": [
    {
      "nombre": "Laptop",
      "cantidad": 2,
      "precio_unitario": 500,
      "subtotal": 1000
    },
    {
      "nombre": "Mouse",
      "cantidad": 1,
      "precio_unitario": 25,
      "subtotal": 25
    }
  ]
}
```

---

## 🐛 TROUBLESHOOTING RÁPIDO

| Problema | Solución |
|----------|----------|
| "No veo la sección de productos" | Limpia caché (F5) + npm run dev |
| "Cantidad debe ser > 0" | Ingresa cantidad válida |
| "Precio debe ser > 0" | Ingresa precio válido |
| "Debe agregar 1 producto" | Agrega un producto antes de crear |
| "Columna no existe en BD" | Ejecuta SQL en Supabase |
| "PDF no muestra productos" | Espera a que genere, limpia caché |

---

## 📁 ARCHIVOS MODIFICADOS

```
✅ src/context/AppContext.jsx
✅ src/components/GeneradorFacturas.jsx  
✅ ACTUALIZAR_TABLA_FACTURAS_PRODUCTOS.sql
```

---

## 📚 DOCUMENTACIÓN

```
📋 Inicio:        ⚡_COMIENZA_AQUI_PRODUCTOS.md
🚀 Completa:      🚀_COMENZAR_AQUI_PRODUCTOS_EN_FACTURAS.md
✅ Visual:        ✅_VERIFICACION_PRODUCTOS_FACTURA.md
📝 Código:        📝_CAMBIOS_EXACTOS_REALIZADOS_PRODUCTOS.md
📊 Técnico:       RESUMEN_TECNICO_PRODUCTOS_FACTURA.md
📋 Final:         📋_RESUMEN_FINAL_PRODUCTOS_FACTURA.md
📑 Índice:        📑_INDICE_DOCUMENTACION_PRODUCTOS.md
```

---

## 🎯 FLUJO RÁPIDO

```
Usuario
  ↓
+ Nueva Factura
  ↓
Selecciona Cliente
  ↓
Ingresa Producto 1 (nombre, cantidad, precio)
  ↓
Agregar
  ↓
[Opcional] Ingresa Producto 2, 3, ...
  ↓
Agrega Descuento/Impuesto
  ↓
Crear Factura
  ↓
Supabase guarda con productos_json
  ↓
Descarga PDF
  ↓
PDF muestra tabla de productos ✓
```

---

## 💾 SQL ÚTIL

### Ver productos de una factura
```sql
SELECT numero_factura, productos_json 
FROM facturas WHERE numero_factura = 'FAC-000001-123';
```

### Buscar por producto
```sql
SELECT numero_factura, cliente FROM facturas
WHERE productos_json::text ILIKE '%laptop%';
```

### Contar productos por factura
```sql
SELECT numero_factura, jsonb_array_length(productos_json) as cantidad
FROM facturas ORDER BY cantidad DESC;
```

---

## 🎁 NUEVAS FUNCIONALIDADES

- ✅ Agregar múltiples productos
- ✅ Validación automática
- ✅ Cálculo de subtotales
- ✅ Tabla profesional en PDF
- ✅ Almacenamiento JSON
- ✅ Editar (eliminar y reagregar)
- ✅ Sin límite de productos
- ✅ Caracteres especiales

---

## ⏱️ TIEMPOS

```
SQL + Reinicio:  7 minutos
Primera factura: 3 minutos
Documentación:   Según necesites
─────────────────────────────
Total:           10 minutos
```

---

## 📞 AYUDA RÁPIDA

- **Quick Start:** ⚡_COMIENZA_AQUI_PRODUCTOS.md
- **Problema:** ✅_VERIFICACION_PRODUCTOS_FACTURA.md
- **Código:** 📝_CAMBIOS_EXACTOS_REALIZADOS_PRODUCTOS.md
- **Índice:** 📑_INDICE_DOCUMENTACION_PRODUCTOS.md

---

## ✨ AHORA SÍ

```
Ejecuta SQL → Reinicia App → Prueba → ¡Listo! 🚀
```

*Quick reference guide - 2024*