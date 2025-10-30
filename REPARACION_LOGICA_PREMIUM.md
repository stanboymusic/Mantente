# 🔧 Reparación de Lógica Premium - Notas, Pedidos y Devoluciones

## 📋 Resumen de Cambios

Se han identificado y arreglado 3 problemas críticos en el módulo Premium:

### ✅ 1. DEVOLUCIONES AHORA DESCUENTAN DEL BALANCE

**Problema:** Las devoluciones aprobadas no se restaban del balance final en el Dashboard.

**Solución:**
- ✅ Dashboard.jsx: Ahora calcula `calcularTotalDevolucionesAprobadas()` 
- ✅ El balance final usa la fórmula: `Ingresos - Egresos - Gastos Fijos - Deuda - Devoluciones Aprobadas`
- ✅ Agregado card visual en Dashboard mostrando "↩️ Devoluciones Aprobadas"
- ✅ El método `handleGuardarGastosFijos()` también incluye devoluciones en el cálculo

**Archivos modificados:**
- `src/components/Dashboard.jsx` (líneas 7, 10, 13-14, 27, 40, 47, 54, 69, 73, 113-181)

---

### ✅ 2. PEDIDOS AHORA USAN TABLA PROPIA (NO PRESUPUESTOS)

**Problema:** Los pedidos estaban guardándose en la tabla `presupuestos` con campos incorrectos, causando confusión.

**Solución:**
- ✅ Cambio: `presupuestos` → tabla `pedidos` 
- ✅ Campos correctos: `numero_pedido` (no `numero_presupuesto`)
- ✅ La tabla `pedidos` tiene campos: id, owner, numero_pedido, cliente, items, total, estado, fecha_entrega_estimada, observaciones
- ✅ El número de pedido se genera con timestamp (PED-1729999999...)

**Archivos modificados:**
- `src/context/AppContext.jsx` (líneas 1616-1620, 1638-1650)

---

### ✅ 3. NOTAS DE ENTREGA - PREPARADO PARA SUPABASE

**Problema:** La tabla `notas_entrega` podría no existir en Supabase, causando errores al crear notas.

**Solución:**
- ✅ Creado SQL script con toda la configuración necesaria
- ✅ Incluye: tabla `notas_entrega`, índices, políticas RLS
- ✅ La lógica en React está correctamente implementada en `NotasEntrega.jsx`

---

## 🚀 PASOS PARA IMPLEMENTAR

### PASO 1: Ejecutar SQL en Supabase

1. Ve a **Supabase Dashboard** → Tu proyecto
2. Abre **SQL Editor** → **New Query**
3. Copia TODO el contenido de: `CREAR_TABLAS_NOTAS_PEDIDOS.sql`
4. Ejecuta (Cmd/Ctrl + Enter)
5. Verifica que no haya errores

**¿Qué hace este SQL?**
- ✅ Crea tabla `notas_entrega` si no existe
- ✅ Crea tabla `pedidos` si no existe  
- ✅ Crea índices para mejor performance
- ✅ Configura políticas RLS (seguridad)
- ✅ Verifica que todo se creó correctamente

---

### PASO 2: Reiniciar la aplicación

```powershell
# En PowerShell, en la carpeta del proyecto:
Set-Location "c:\Users\angel\OneDrive\Documents\proyecto mantente\mantente-app"
npm run dev
```

Abre: http://localhost:5175/

---

## ✔️ VERIFICAR QUE TODO FUNCIONA

### ✅ Test 1: Crear Nota de Entrega

1. Inicia sesión como usuario Premium
2. Ve a: **Menu** → **Notas de Entrega**
3. Haz clic en: **➕ Nueva Nota**
4. Completa:
   - Cliente: "Tienda ABC"
   - Fecha: Hoy
   - Artículos: "Producto X" - Cantidad: 5
5. Clic: **Crear Nota**

**Resultado esperado:** ✅ "Nota de entrega creada exitosamente"

**Si falla:**
- Abre F12 (Consola)
- Busca el error en rojo
- Envíame el mensaje de error exacto

---

### ✅ Test 2: Crear Pedido

1. Ve a: **Menu** → **Pedidos**
2. Haz clic en: **➕ Nuevo Pedido**
3. Completa:
   - Cliente: "Cliente Test"
   - Producto: Selecciona uno del inventario
   - Cantidad: 10
   - Precio Unit: 50
   - F. Entrega Est.: En 5 días
4. Clic: **Crear Pedido**

**Resultado esperado:**
- ✅ "Pedido creado exitosamente"
- ✅ Aparece en la tabla con número como: `PED-1729999999`
- ✅ Total calculado correctamente: 10 × 50 = 500

---

### ✅ Test 3: Crear Devolución Y Ver DESCUENTO en Balance

1. Ve a: **Menu** → **Devoluciones**
2. Haz clic en: **➕ Nueva Devolución**
3. Busca una venta (ej: código VTA-2024-00001)
4. Ingresa monto: 100
5. Clic: **Registrar Devolución**

6. Ve al **Dashboard** (Home)

**Resultado esperado:**
- ✅ Panel "↩️ Devoluciones Aprobadas" muestra: $100 (o el monto que ingresaste)
- ✅ **Balance Final** se reduce por esa cantidad
- ✅ Fórmula visible en comentarios: Balance = Ingresos - Egresos - Gastos - Deuda - **Devoluciones**

---

### ✅ Test 4: Verificar Egresos

1. Ve a: **Menu** → **Egresos**
2. Crea un egreso:
   - Descripción: "Compra de materiales"
   - Monto: 50
   - Categoría: "Materiales"
3. Clic: **Crear Egreso**

4. Ve al **Dashboard**

**Resultado esperado:**
- ✅ Card "📉 Egresos" aumenta a 50
- ✅ **Balance Final** se reduce por 50
- ✅ Mensaje de confirmación: "✅ Egreso registrado"

---

## 📊 FÓRMULA DE BALANCE FINAL (Actualizada)

```
Balance Final = Ingresos - Egresos - Gastos Fijos - Deuda Acumulada - Devoluciones Aprobadas
```

### Ejemplo:
- Ingresos: $1,000
- Egresos: $200
- Gastos Fijos: $150
- Deuda: $50
- Devoluciones Aprobadas: $100

**Balance Final = 1000 - 200 - 150 - 50 - 100 = $500**

---

## 🐛 SOLUCIÓN DE PROBLEMAS

### "Error: La tabla notas_entrega no existe"
✅ Ejecuta el SQL script en Supabase (Paso 1)

### "Error: La tabla pedidos no existe"
✅ Ejecuta el SQL script en Supabase (Paso 1)

### "El balance no se actualiza cuando apruebo una devolución"
✅ Recarga la página o ve al Dashboard nuevamente
✅ Si persiste, verifica en Supabase que la devolución tenga estado "Aprobada"

### "El balance está negativamente afectado"
✅ Verifica que todas las fórmulas estén correctas en Dashboard.jsx
✅ Abre F12 y revisa que `calcularTotalDevolucionesAprobadas()` devuelva el valor correcto

---

## 📁 ARCHIVOS MODIFICADOS

| Archivo | Cambios |
|---------|---------|
| `src/context/AppContext.jsx` | Pedidos ahora usan tabla `pedidos` (no `presupuestos`) |
| `src/components/Dashboard.jsx` | Devoluciones se restan del balance + nuevo card |
| `CREAR_TABLAS_NOTAS_PEDIDOS.sql` | NUEVO - SQL para crear tablas en Supabase |

---

## ✨ PRÓXIMOS PASOS

Después de ejecutar el SQL y verificar que todo funciona:

1. ✅ Prueba crear varias notas de entrega
2. ✅ Crea varios pedidos y verifica los números
3. ✅ Registra devoluciones y ve el descuento en Dashboard
4. ✅ Verifica que los egresos se calculan correctamente

---

## 📞 DUDAS

Si algo no funciona:

1. **Abre la consola** (F12)
2. **Busca errores en rojo**
3. **Copia el error exacto**
4. **Cuéntame qué pasos seguiste antes de que falle**

Ej: "Intenté crear una nota de entrega en Premium, llené todos los campos, hice clic en 'Crear Nota' y me aparece este error: [pega el error]"

---

✅ **¡Todo está listo! Ahora ejecuta el SQL y prueba.**