# 🎁 NUEVA FUNCIONALIDAD: MÚLTIPLES PRODUCTOS EN FACTURAS

## ✨ ¿QUÉ CAMBIA?

Ahora las facturas pueden incluir **múltiples productos** con:
- ✅ Nombre del producto
- ✅ Cantidad
- ✅ Precio unitario  
- ✅ Cálculo automático de subtotales
- ✅ Visualización profesional en PDF

---

## ⚡ IMPLEMENTACIÓN (2 PASOS - 5 MINUTOS)

### Paso 1️⃣: Ejecutar Script SQL en Supabase

1. Abre: **https://supabase.com/dashboard**
2. Selecciona tu proyecto
3. Ve a **SQL Editor** → **New Query**
4. Copia este script completo:

```sql
-- Script para agregar columna de productos a la tabla facturas
-- Este script es IDEMPOTENTE (seguro ejecutar múltiples veces)

ALTER TABLE facturas ADD COLUMN IF NOT EXISTS productos_json JSONB DEFAULT '[]'::jsonb;

-- Comentario de la columna para documentación
COMMENT ON COLUMN facturas.productos_json IS 'Array JSON con los productos de la factura: [{"nombre": "Producto 1", "cantidad": 1, "precio_unitario": 100, "subtotal": 100}, ...]';
```

5. Click en **▶ RUN**
6. Verás: ✅ **Success. No rows returned**

---

### Paso 2️⃣: Reiniciar la aplicación

```powershell
# En PowerShell:
Set-Location "c:\Users\angel\OneDrive\Documents\proyecto mantente\mantente-app"
npm run dev
```

---

## 🎯 USAR LA NUEVA FUNCIONALIDAD

### Crear una Factura con Múltiples Productos:

1. **Abre la app** → **Facturas** → **+ Nueva Factura**

2. **Completa los datos básicos:**
   - Tipo de Factura
   - Cliente
   - Método de Pago

3. **🛍️ SECCIÓN NUEVA - Agregar Productos:**

   ```
   Nombre del Producto:     Laptop Dell XPS 15
   Cantidad:                2
   Precio Unitario:         1200.00
   [➕ Agregar]
   ```

   ➜ Se agregará a la tabla de abajo

4. **Agregar más productos:**
   ```
   Nombre del Producto:     Mouse inalámbrico
   Cantidad:                2
   Precio Unitario:         25.00
   [➕ Agregar]
   ```

5. **Ver tabla de productos:**
   ```
   📦 Productos Agregados (2):
   ┌─────────────────────┬──────────┬──────────────┬─────────┐
   │ Producto            │ Cantidad │ Precio Unit. │ Subtotal│
   ├─────────────────────┼──────────┼──────────────┼─────────┤
   │ Laptop Dell XPS 15  │    2     │   1200.00    │ 2400.00 │
   │ Mouse inalámbrico   │    2     │    25.00     │   50.00 │
   ├─────────────────────┴──────────┴──────────────┼─────────┤
   │ SUBTOTAL PRODUCTOS:                          │ 2450.00 │
   └──────────────────────────────────────────────┴─────────┘
   ```

6. **Agregar descuentos/impuestos (opcional):**
   - Descuento: 50.00
   - Impuesto: 100.00

7. **Ver total calculado:**
   ```
   TOTAL: $2500.00
   ```

8. **Crear la factura:** ✅ **Crear Factura**

---

## 📄 VER FACTURAS

En la tabla de facturas ahora ves:

```
Número         | Cliente    | Productos | Subtotal | Descuento | Impuesto | Total    | Estado
FAC-000001-123 | Juan Pérez | 2 producto| $2450.00 |  $50.00   | $100.00  | $2500.00 | pendiente
```

La columna **"Productos"** muestra cuántos productos incluye.

---

## 🎨 PDF MEJORADO

Cuando descargas el PDF, ahora ves:

```
╔════════════════════════════════════════════════════════════╗
║                    FACTURA                                 ║
║              FAC-000001-123                                ║
║       Fecha: 25/12/2024                                   ║
╠════════════════════════════════════════════════════════════╣
║ 📋 EMITIDO POR:                 │ 👤 CLIENTE:              ║
║ Mi Empresa S.A.                 │ Juan Pérez               ║
║ RUC: 123456789                  │ Email: juan@email.com    ║
║ Email: empresa@email.com        │ RUC: 987654321           ║
║ Tel: +123 456 7890              │ Tel: +987 654 3210       ║
║ Dirección: Calle Principal 123  │ Dirección: Calle B 456   ║
╠════════════════════════════════════════════════════════════╣
║ Producto/Servicio    │ Cant. │ Precio Unit. │ Subtotal    ║
║──────────────────────┼───────┼──────────────┼─────────────║
║ Laptop Dell XPS 15   │   2   │   $1,200.00  │ $2,400.00   ║
║ Mouse inalámbrico    │   2   │     $25.00   │    $50.00   ║
╠════════════════════════════════════════════════════════════╣
║ Subtotal:                                   │  $2,450.00   ║
║ Descuento:                                  │    -$50.00   ║
║ Impuesto:                                   │   +$100.00   ║
║ ─────────────────────────────────────────────┼──────────────║
║ TOTAL:                                       │  $2,500.00   ║
╠════════════════════════════════════════════════════════════╣
║ Método de pago: Transferencia    Estado: PENDIENTE        ║
║ ¡Gracias por su compra!                                    ║
╚════════════════════════════════════════════════════════════╝
```

---

## ✅ VALIDACIONES INCLUIDAS

La aplicación valida automáticamente:

- ✅ **Nombre del producto**: No puede estar vacío
- ✅ **Cantidad**: Debe ser mayor a 0
- ✅ **Precio unitario**: Debe ser mayor a 0
- ✅ **Al menos un producto**: No puedes crear una factura sin productos
- ✅ **Perfil de empresa**: Debe estar completo (como antes)
- ✅ **Cliente seleccionado**: Requerido (a menos que sea ticket)

---

## 🔧 FUNCIONALIDADES ESPECIALES

### Eliminar un Producto:
En la tabla de productos, click en **🗑️** para eliminarlo

### Editar un Producto:
Actualmente no es posible editar en línea. Para cambiar:
1. Elimina con 🗑️
2. Agrégalo nuevamente con los valores correctos

### Limpiar todo:
- Cierra el modal (❌)
- Abre nuevamente (+ Nueva Factura)

---

## 🐛 PREGUNTAS COMUNES

### ¿Qué pasa si no agrego productos?
❌ Verás un error: **"Debe agregar al menos un producto a la factura"**

### ¿Puedo tener 10+ productos en una factura?
✅ Sí, sin límite. Se mostrará todo en el PDF (en múltiples páginas si es necesario)

### ¿Los productos se guardan en la base de datos?
✅ Sí, en la columna `productos_json` de la tabla `facturas` como un array JSON

### ¿Puedo ver los productos después de crear la factura?
✅ Sí, al descargar el PDF verás todos los productos listados

### ¿Puedo usar caracteres especiales en nombres?
✅ Sí: "Laptop (Dell)" o "Servicio de reparación & instalación" funcionan perfectamente

---

## 📊 DATOS GUARDADOS EN BASE DE DATOS

Cada factura almacena ahora:

```json
{
  "id": 123,
  "numero_factura": "FAC-000001-123",
  "cliente": "Juan Pérez",
  "subtotal": 2450.00,
  "descuento": 50.00,
  "impuesto": 100.00,
  "total": 2500.00,
  "estado": "pendiente",
  "productos_json": [
    {
      "nombre": "Laptop Dell XPS 15",
      "cantidad": 2,
      "precio_unitario": 1200.00,
      "subtotal": 2400.00
    },
    {
      "nombre": "Mouse inalámbrico",
      "cantidad": 2,
      "precio_unitario": 25.00,
      "subtotal": 50.00
    }
  ]
}
```

---

## 🚀 AHORA SÍ...

1. ✅ Ejecuta el SQL en Supabase
2. ✅ Reinicia la app con `npm run dev`
3. ✅ Prueba creando una factura con 2-3 productos
4. ✅ Descarga el PDF para verificar que todo se vea correctamente

---

## 📞 AYUDA

Si algo no funciona:

1. ¿Ejecutaste el SQL en Supabase? Verifica haciendo un refresh (F5)
2. ¿La columna `productos_json` no aparece en la BD?
   - Abre Supabase → SQL Editor
   - Ejecuta: `SELECT * FROM facturas LIMIT 1;`
   - Verifica que aparezca `productos_json` en las columnas
3. ¿Los productos no se guardan?
   - Abre la consola (F12)
   - Busca errores en rojo
   - Copia el error y verifica en la documentación técnica

¡Disfruta la nueva funcionalidad! 🎉