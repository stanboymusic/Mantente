# ✅ GUÍA DE VERIFICACIÓN: MÚLTIPLES PRODUCTOS EN FACTURAS

## 🎯 OBJETIVO
Verificar que la nueva funcionalidad de productos en facturas esté trabajando correctamente.

---

## 📋 PASO 1: EJECUTAR SQL EN SUPABASE

### ✅ Checklist Pre-SQL:
- [ ] Tengo acceso a Supabase (supabase.com)
- [ ] Conozco mis credenciales de login
- [ ] Identifiqué mi proyecto en Supabase

### 🔧 Ejecutar SQL:

**1. Accede a Supabase:**
```
URL: https://supabase.com/dashboard
```

**2. Selecciona tu proyecto**
```
Dashboard → [Tu Proyecto]
```

**3. Abre SQL Editor:**
```
Lado izquierdo → SQL Editor → New Query
```

**4. Pega el script:**
```sql
ALTER TABLE facturas ADD COLUMN IF NOT EXISTS productos_json JSONB DEFAULT '[]'::jsonb;
COMMENT ON COLUMN facturas.productos_json IS 'Array JSON con los productos de la factura';
```

**5. Ejecuta:**
```
Click: ▶ RUN
```

**✅ Resultado esperado:**
```
✅ Success. No rows returned.
```

### ✅ Verificación Post-SQL:

**Crear nueva query para verificar:**
```sql
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'facturas' 
ORDER BY column_name;
```

**Busca en los resultados:**
```
✅ productos_json (debe estar en la lista)
```

**O simpler, ejecuta:**
```sql
SELECT * FROM facturas LIMIT 1;
```

**Verifica que veas:**
```
Column headers: [...otros..., productos_json]
```

---

## 🚀 PASO 2: REINICIAR APLICACIÓN

### Terminal PowerShell:

```powershell
# Navega a la carpeta del proyecto
Set-Location "c:\Users\angel\OneDrive\Documents\proyecto mantente\mantente-app"

# Inicia desarrollo
npm run dev
```

### ✅ Resultado esperado:

```
  ✓ built in 2.5s

  ➜  Local:   http://localhost:5173/
  ➜  press h to show help
```

### Abre en navegador:
```
http://localhost:5173
```

---

## 🧪 PASO 3: PRUEBA VISUAL - CREAR FACTURA CON PRODUCTOS

### 1️⃣ Navega a Facturas:

**Esperas ver:**
```
╔════════════════════════════════════════════════════════╗
║  📄 Generador de Facturas              + Nueva Factura║
╠════════════════════════════════════════════════════════╣
║ [Tabla vacía o con facturas antiguas]                 ║
╚════════════════════════════════════════════════════════╝
```

### 2️⃣ Click "+ Nueva Factura":

**Se abre modal con:**
```
╔════════════════════════════════════════════════════════╗
║ 📋 Crear Nueva Factura                            [X]  ║
╠════════════════════════════════════════════════════════╣
║                                                        ║
║  Tipo de Factura*:    [▼ Factura Fiscal]             ║
║  Número de Factura:   [FAC-000001-XXX]  (auto)       ║
║                                                        ║
║  Cliente*:            [▼ Selecciona un cliente]       ║
║  Método de Pago:      [▼ Efectivo]                    ║
║                                                        ║
║  ┌──────────────────────────────────────────────┐    ║
║  │ 🛍️ Agregar Productos a la Factura            │    ║
║  ├──────────────────────────────────────────────┤    ║
║  │ Nombre*:        [__________________]         │    ║
║  │ Cantidad*:      [1 ]    Precio Unit* [$0.00] │    ║
║  │                           [➕ Agregar]       │    ║
║  └──────────────────────────────────────────────┘    ║
║                                                        ║
║  [✅ Crear Factura] [❌ Cancelar]                      ║
║                                                        ║
╚════════════════════════════════════════════════════════╝
```

### ✅ Checklist - Modal Abierto:
- [ ] Veo la sección "🛍️ Agregar Productos a la Factura"
- [ ] Hay campos: Nombre, Cantidad, Precio Unitario
- [ ] Hay un botón "➕ Agregar"
- [ ] Hay una tabla vacía de productos (no visible si no hay productos)

---

### 3️⃣ Selecciona Cliente:

Click en dropdown "Cliente*":
```
▼ Selecciona un cliente
  ├─ Juan Pérez (juan@email.com)
  ├─ María García (maria@email.com)
  └─ Carlos López (carlos@email.com)
```

**Selecciona:** Juan Pérez

---

### 4️⃣ Agregar Primer Producto:

Completa así:
```
Nombre:              Laptop Dell XPS 15
Cantidad:            2
Precio Unitario:     1200.00
```

Click: **➕ Agregar**

### ✅ Resultado esperado:

```
✅ Producto agregado

┌──────────────────────────────────────────────────────────┐
│ 📦 Productos Agregados (1):                             │
├──────────────────────────────────────────────────────────┤
│ Producto            │ Cant. │ Precio Unit. │ Subtotal   │
├─────────────────────┼───────┼──────────────┼────────────┤
│ Laptop Dell XPS 15  │  2    │   $1,200.00  │ $2,400.00  │
├─────────────────────┴───────┴──────────────┼────────────┤
│ SUBTOTAL PRODUCTOS:                      │  $2,400.00 │
└──────────────────────────────────────────┴────────────┘
```

### ✅ Checklist - Primer Producto:
- [ ] Veo el mensaje "✅ Producto agregado"
- [ ] La tabla muestra 1 producto
- [ ] El nombre es correcto
- [ ] La cantidad es 2
- [ ] El precio unitario es 1200.00
- [ ] El subtotal es 2400.00
- [ ] El SUBTOTAL PRODUCTOS es 2400.00

---

### 5️⃣ Agregar Segundo Producto:

Completa los campos nuevamente:
```
Nombre:              Mouse inalámbrico
Cantidad:            2
Precio Unitario:     25.00
```

Click: **➕ Agregar**

### ✅ Resultado esperado:

```
✅ Producto agregado

┌──────────────────────────────────────────────────────────┐
│ 📦 Productos Agregados (2):                             │
├──────────────────────────────────────────────────────────┤
│ Producto             │ Cant. │ Precio Unit. │ Subtotal   │
├──────────────────────┼───────┼──────────────┼────────────┤
│ Laptop Dell XPS 15   │  2    │  $1,200.00   │ $2,400.00  │
│ Mouse inalámbrico    │  2    │    $25.00    │   $50.00   │
├──────────────────────┴───────┴──────────────┼────────────┤
│ SUBTOTAL PRODUCTOS:                       │  $2,450.00 │
└──────────────────────────────────────────┴────────────┘
```

### ✅ Checklist - Segundo Producto:
- [ ] Ahora hay 2 productos listados
- [ ] El segundo producto se agregó correctamente
- [ ] El subtotal del segundo es 50.00
- [ ] El SUBTOTAL PRODUCTOS es 2450.00 (suma de ambos)

---

### 6️⃣ Agregar Descuento (Opcional):

Scroll down en el modal:

```
Descuento:  [50.00]
Impuesto:   [100.00]

TOTAL: $2500.00
━━━━━━━━━━━━━━━━━
$2500.00
```

### ✅ Verificar Total:
- [ ] Subtotal: 2450.00
- [ ] Menos Descuento: -50.00
- [ ] Más Impuesto: +100.00
- [ ] **Total: 2500.00** ✓

---

### 7️⃣ Crear la Factura:

Click: **✅ Crear Factura**

### ✅ Resultado esperado:

```
✅ Factura creada exitosamente con 2 producto(s)
```

**Modal se cierra automáticamente**

---

## 📊 PASO 4: VERIFICAR EN TABLA DE FACTURAS

### ✅ Tabla Actualizada:

```
┌──────────────┬──────────────┬──────────────┬───────────┬──────────┬────────┬────────┬─────────┐
│ Número       │ Cliente      │ Productos    │ Subtotal  │ Desct.   │ Impuesto│ Total  │ Estado │
├──────────────┼──────────────┼──────────────┼───────────┼──────────┼────────┼────────┼─────────┤
│FAC-000001-XXX│ Juan Pérez   │ 2 producto(s)│ $2,450.00 │ $50.00   │ $100.00│$2,500  │pendiente│
│(anterior)    │ María García │              │ $1,200.00 │ $0.00    │ $0.00  │$1,200  │pagada  │
└──────────────┴──────────────┴──────────────┴───────────┴──────────┴────────┴────────┴─────────┘
```

### ✅ Checklist - Tabla:
- [ ] Aparece la nueva factura en la tabla
- [ ] Número de factura es FAC-XXXXXX-XXX
- [ ] Cliente: Juan Pérez
- [ ] **Productos: "2 producto(s)"** ← ¡NUEVO!
- [ ] Subtotal: 2450.00
- [ ] Descuento: 50.00
- [ ] Impuesto: 100.00
- [ ] Total: 2500.00
- [ ] Estado: pendiente

---

## 📄 PASO 5: DESCARGAR Y VERIFICAR PDF

### 1️⃣ Descargar PDF:

En la tabla, click en la fila de la nueva factura → **📥 PDF**

### ✅ Resultado esperado:

```
✅ PDF descargado exitosamente
```

**Archivo descargado:** `Factura_FAC-000001-XXX_2024-12-25.pdf`

### 2️⃣ Abrir PDF y Verificar:

**Sección 1: Encabezado**
```
✓ Título: FACTURA
✓ Número: FAC-000001-XXX
✓ Fecha: 25/12/2024
```

**Sección 2: Datos de Empresa y Cliente**
```
📋 EMITIDO POR:              👤 CLIENTE:
Tu Empresa S.A.              Juan Pérez
RUC: 123456789               Email: juan@email.com
Email: empresa@email.com     ...
Tel: +123 456 7890
Dirección: Calle Principal 123
```

✅ Checklist Encabezado:
- [ ] Logo de empresa aparece (si existe)
- [ ] Datos de empresa completos
- [ ] Datos de cliente completos

**Sección 3: 🎁 TABLA DE PRODUCTOS** ← ¡NUEVA!

```
┌────────────────────────┬──────┬──────────────┬──────────┐
│ Producto/Servicio      │ Cant.│ Precio Unit. │ Subtotal │
├────────────────────────┼──────┼──────────────┼──────────┤
│ Laptop Dell XPS 15     │  2   │  $1,200.00   │$2,400.00 │
│ Mouse inalámbrico      │  2   │    $25.00    │  $50.00  │
└────────────────────────┴──────┴──────────────┴──────────┘
```

✅ Checklist Productos:
- [ ] Aparece tabla de productos
- [ ] Primer producto: Laptop Dell XPS 15
- [ ] Cantidad: 2
- [ ] Precio Unit: $1,200.00
- [ ] Subtotal: $2,400.00
- [ ] Segundo producto: Mouse inalámbrico
- [ ] Cantidad: 2
- [ ] Precio Unit: $25.00
- [ ] Subtotal: $50.00

**Sección 4: Resumen Totales**

```
Subtotal:     $2,450.00
Descuento:      -$50.00
Impuesto:      +$100.00
─────────────────────────
TOTAL:        $2,500.00

Método pago: Efectivo
Estado: PENDIENTE
```

✅ Checklist Totales:
- [ ] Subtotal: 2450.00
- [ ] Descuento: -50.00
- [ ] Impuesto: +100.00
- [ ] TOTAL: 2500.00 ✓

**Sección 5: Footer**

```
¡Gracias por su compra!
Factura generada el 25/12/2024
```

✅ Checklist Footer:
- [ ] Mensaje de agradecimiento
- [ ] Fecha de generación

---

## 🧪 PASO 6: PRUEBAS ADICIONALES

### Test 1: Intentar crear sin productos

```
1. Click "+ Nueva Factura"
2. Selecciona Cliente
3. SIN agregar productos
4. Click "✅ Crear Factura"

RESULTADO ESPERADO:
❌ Debe agregar al menos un producto a la factura
```

✅ Checklist:
- [ ] Sale el error correcto
- [ ] La factura NO se crea

---

### Test 2: Validar cantidad = 0

```
1. Click "+ Nueva Factura"
2. Ingresa:
   Nombre:     Laptop
   Cantidad:   0          ← ¡CERO!
   Precio:     1000
3. Click "➕ Agregar"

RESULTADO ESPERADO:
❌ La cantidad debe ser mayor a 0
```

✅ Checklist:
- [ ] Sale el error
- [ ] Producto NO se agrega

---

### Test 3: Validar precio = 0

```
1. Click "+ Nueva Factura"
2. Ingresa:
   Nombre:     Laptop
   Cantidad:   1
   Precio:     0         ← ¡CERO!
3. Click "➕ Agregar"

RESULTADO ESPERADO:
❌ El precio unitario debe ser mayor a 0
```

✅ Checklist:
- [ ] Sale el error
- [ ] Producto NO se agrega

---

### Test 4: Eliminar producto

```
1. Click "+ Nueva Factura"
2. Agrega 2 productos
3. Vés la tabla con 2 productos
4. Click "🗑️" en el segundo producto

RESULTADO ESPERADO:
- Producto se elimina
- Tabla ahora muestra 1 producto
- Subtotal total se recalcula
```

✅ Checklist:
- [ ] Producto eliminado
- [ ] Tabla se actualiza
- [ ] Subtotal se recalcula correctamente

---

### Test 5: Caracteres especiales

```
1. Click "+ Nueva Factura"
2. Ingresa:
   Nombre: "Laptop (Dell) & Accesorios - Service"
   Cantidad: 1
   Precio: 500
3. Click "➕ Agregar"
4. Crear factura
5. Descargar PDF

RESULTADO ESPERADO:
- Se agrega sin problemas
- Se guarda en BD
- El PDF muestra correctamente
```

✅ Checklist:
- [ ] Se agrega el producto
- [ ] No hay errores
- [ ] En PDF aparece igual

---

## 📊 PASO 7: VERIFICAR EN BASE DE DATOS

### Opción 1: Supabase UI

```
Dashboard → Tables → facturas
Busca la factura que acabas de crear
Haz scroll hacia la derecha
Busca columna: productos_json
```

✅ Deberías ver:
```json
[
  {
    "nombre": "Laptop Dell XPS 15",
    "cantidad": 2,
    "precio_unitario": 1200,
    "subtotal": 2400
  },
  {
    "nombre": "Mouse inalámbrico",
    "cantidad": 2,
    "precio_unitario": 25,
    "subtotal": 50
  }
]
```

---

### Opción 2: SQL Query

Abre SQL Editor en Supabase:

```sql
SELECT 
  numero_factura,
  cliente,
  productos_json,
  subtotal,
  total
FROM facturas
WHERE numero_factura = 'FAC-000001-XXX'
LIMIT 1;
```

✅ Resultado:
```
numero_factura: FAC-000001-XXX
cliente: Juan Pérez
productos_json: [{"nombre": "Laptop Dell XPS 15", "cantidad": 2, ...}]
subtotal: 2450.00
total: 2500.00
```

---

## 🎉 RESUMEN FINAL

### Si pasaste TODOS los tests:

✅ ¡La implementación está 100% correcta!

**Funcionalidades confirmadas:**
- ✅ Agregar múltiples productos
- ✅ Validación de campos
- ✅ Cálculo automático de subtotales
- ✅ Eliminación de productos
- ✅ Tabla profesional en PDF
- ✅ Almacenamiento en BD
- ✅ Caracteres especiales
- ✅ Errores claros y controlados

### Siguiente paso:

Usa esta funcionalidad en tus facturas reales. Ahora cada factura:
- 📦 Puede tener múltiples productos
- 💰 Calcula automáticamente el total
- 📄 Genera PDFs profesionales
- 💾 Guarda todo en la BD

---

## 🐛 TROUBLESHOOTING

### "No veo la columna productos_json en la BD"
→ Recarga la página (F5)
→ Ejecuta el SQL nuevamente
→ Verifica que el SQL mostró "Success"

### "La tabla de productos no aparece en el modal"
→ Asegúrate de que npm run dev esté ejecutándose
→ Limpia caché del navegador (Ctrl+Shift+Del)
→ Recarga la página

### "Los productos no se guardan"
→ Abre consola (F12) y busca errores en rojo
→ Verifica que Supabase esté en línea
→ Intenta crear una factura simple primero

### "El PDF se ve cortado o extraño"
→ Los PDFs multiproducto a veces necesitan múltiples páginas
→ Es normal que se expanda
→ Verifica que todos los productos estén listados

¡Cualquier problema, revisa la consola (F12) para ver el error exacto! 🔍