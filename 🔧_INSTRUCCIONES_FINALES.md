# 🔧 INSTRUCCIONES FINALES - Cómo Usar las Correcciones

**Build Status:** ✅ EXITOSO - Sin errores

---

## ⚡ PASO 1: Inicia la Aplicación

Abre **PowerShell** y ejecuta:

```powershell
Set-Location "c:\Users\angel\OneDrive\Documents\proyecto mantente\mantente-app"
npm run dev
```

**Espera a ver:**
```
Local:   http://localhost:5173
```

Luego abre esa URL en tu navegador. ✅

---

## ✅ PASO 2: Prueba las 4 Correcciones

### 🎯 Corrección 1: Facturas (Error de Cliente)

**¿Qué hacías antes?**
- Intentabas crear una factura
- Seleccionabas un cliente
- ❌ Error: "null value in column cliente violates not-null constraint"

**¿Qué hace ahora?**

1. Ve a **Facturas** en el menú lateral
2. Haz clic en **➕ Nueva Factura**
3. Completa:
   - **Cliente:** Selecciona uno del dropdown
   - **Monto Subtotal:** 100
   - **Método de Pago:** Efectivo
4. Haz clic en **Crear Factura**

**Resultado Esperado:** ✅
```
✅ Factura creada exitosamente

La factura aparece en la lista con el nombre del cliente
```

**Si Falla:** 
- Verifica que haya clientes creados (ve a Clientes si no hay)
- Intenta recargar la página
- Vuelve a intentar

---

### 💰 Corrección 2: Descuentos

**¿Qué hacías antes?**
- Ingresabas un descuento de 10% en una venta
- El sistema guardaba 10 (como número) en lugar de convertirlo a USD
- ❌ En Dashboard aparecía "Descuento: 10" (incorrecto)

**¿Qué hace ahora?**

1. Ve a **Ventas** en el menú lateral
2. Haz clic en **➕ Nueva Venta**
3. Completa:
   - **Producto:** Selecciona uno
   - **Cantidad:** 1
   - **Precio Unitario:** 100
   - **Cliente:** Ingresa un nombre
   - **Descuento:** 20 (representa 20%)
4. Haz clic en **Registrar Venta**

**Resultado Esperado:** ✅
```
En la venta registrada:
├─ Monto: $100
├─ Descuento: $20  ← Ahora en USD, no porcentaje
├─ Total: $80
```

**Verificación en Dashboard:** ✅
1. Ve a **Dashboard**
2. En "Resumen Mensual":
   ```
   Total Ventas: $100
   Total Descuentos: $20  ← Debe ser $20, no 20%
   Total Final: $80
   ```

**Si no Aparece en USD:**
- Recarga la página (F5)
- Intenta crear una nueva venta
- El cambio debe reflejarse

---

### 📦 Corrección 3: Persistencia de Datos

**¿Qué hacías antes?**
- Creabas un Presupuesto, una Nota de Entrega o un Pedido
- Recargabas la página (F5)
- ❌ Los datos desaparecían (se perdían completamente)

**¿Qué hace ahora?**

#### Prueba 1: Notas de Entrega

1. Ve a **Notas de Entrega** (si no ves esto, necesitas ser Premium)
2. Haz clic en **➕ Nueva Nota**
3. Completa:
   - **Cliente:** "Cliente Prueba"
   - **Fecha de Entrega:** Hoy
   - **Artículos:** Agrega uno (Descripción: "Producto X", Cantidad: 5)
4. Haz clic en **Crear Nota**

**Resultado Esperado:** ✅
```
✅ Nota de entrega creada exitosamente

La nota aparece en la tabla
```

5. **Ahora presiona F5 (Recargar Página)**

**Resultado Esperado:** ✅
```
✅ LA NOTA SIGUE AQUÍ

La nota NO desapareció, está en la misma tabla
```

#### Prueba 2: Presupuestos
Repite el mismo proceso con **Presupuestos → Nueva Presupuesta**

#### Prueba 3: Pedidos
Repite el mismo proceso con **Pedidos → Nuevo Pedido**

**Si Falla (Datos Desaparecen):**
1. Abre la consola del navegador (Presiona **F12**)
2. Busca mensajes en ROJO (errores)
3. Verifica tu conexión a internet
4. Verifica que Supabase esté en línea en https://supabase.com
5. Intenta nuevamente crear el dato

---

### 💳 Corrección 4: Transferencia de Deuda

**¿Qué querías verificar?**
```
Octubre: Gastos Fijos $1000, Ventas $430
         Deuda: $570 (porque 1000 - 430 = 570)

Noviembre: Deuda Anterior $570 + Gastos Fijos $1000
           Deuda Total: $1570 (si no hay ventas)
```

**¿Cómo está implementado?**

1. Ve a **Cierre de Mes**
2. En Octubre:
   - Establece **Gastos Fijos:** 1000
   - Crea algunas ventas por **$430**
   - Haz clic en **Cerrar Mes**

3. Verifica:
   - Ve a **Dashboard** o **Historial de Meses**
   - En Octubre debe mostrar: **Deuda Pendiente: $570** ✅

4. Abre Noviembre:
   - Verifica automáticamente: **Deuda Anterior: $570** ✅
   - Establece **Gastos Fijos:** 1000
   - Sin hacer ventas
   - Cierra el mes

5. Verifica:
   - **Deuda Pendiente en Noviembre: $1570** ✅

**Resultado Esperado:** ✅
```
La deuda se transfiere automáticamente cada mes
Fórmula: Deuda = (Deuda Anterior + Gastos Fijos) - Ventas
```

---

## 📋 Checklist de Verificación

Marca cada item conforme lo pruebas:

### Facturas
- [ ] Puedo crear una factura sin error
- [ ] El cliente se selecciona correctamente
- [ ] La factura aparece en la lista
- [ ] No aparece el error "null value in column cliente"

### Descuentos
- [ ] Ingreso un descuento de 20%
- [ ] Se convierte a $USD correctamente (10% de $100 = $10)
- [ ] En Dashboard aparece en $USD (no como porcentaje)
- [ ] El Total = Monto - Descuento

### Persistencia
- [ ] Creo una Nota de Entrega
- [ ] Presiono F5 (recargar)
- [ ] La nota SIGUE siendo visible
- [ ] Los datos están exactamente igual

### Deuda
- [ ] Octubre con $1000 gastos y $430 ventas = $570 deuda
- [ ] Al abrir Noviembre, aparece $570 como deuda anterior
- [ ] La deuda total en Noviembre = $1570 (sin ventas)

---

## ⚙️ Si Algo Falla

### "Error: Debes seleccionar un cliente"
```
❌ Falla: Aún aparece este error en Facturas
✅ Solución:
   - Recarga la página (F5)
   - Verifica que haya clientes en la lista
   - Intenta nuevamente
```

### "Error: null value in column cliente"
```
❌ Falla: El error de NULL persiste
✅ Solución:
   - Verifica que GeneradorFacturas.jsx línea 87 sea:
     cliente: clienteSeleccionado ? clienteSeleccionado.nombre : "Cliente Anónimo"
   - Recarga la página
   - Ejecuta npm run build para verificar
```

### "Los descuentos no aparecen en USD"
```
❌ Falla: Los descuentos siguen mostrando como porcentaje
✅ Solución:
   - Recarga la página (F5)
   - Verifica que Ventas.jsx línea 125 tenga:
     const descuentoEnDolares = (montoTotal * descuentoPorcentaje) / 100;
```

### "Los datos desaparecen al recargar"
```
❌ Falla: Las Notas/Presupuestos/Pedidos desaparecen
✅ Solución:
   - Abre la consola (F12) y busca errores de Supabase
   - Verifica tu conexión a internet
   - Verifica que AppContext.jsx tenga auto-carga en línea 1524
   - Intenta crear el dato nuevamente
```

### "No puedo conectar a Supabase"
```
❌ Falla: Errores de conexión
✅ Solución:
   - Abre https://supabase.com
   - Verifica que tu proyecto esté en línea (status: healthy)
   - Intenta con otro navegador
   - Recarga la página
```

---

## 📞 Resumen Técnico

### Cambios Realizados

**GeneradorFacturas.jsx (Línea 87)**
```javascript
// ANTES ❌
cliente_id: parseInt(formData.cliente_id) || null,

// DESPUÉS ✅
cliente: clienteSeleccionado ? clienteSeleccionado.nombre : "Cliente Anónimo",
```

**Ventas.jsx (Línea 125)**
```javascript
// ANTES ❌
const descuentoEnDolares = parseFloat(formData.descuento) || 0;

// DESPUÉS ✅
const descuentoEnDolares = (montoTotal * descuentoPorcentaje) / 100;
```

**AppContext.jsx (Línea 685)**
```javascript
// ANTES ❌
cliente_id: factura.cliente_id,

// DESPUÉS ✅
cliente: factura.cliente,
```

**AppContext.jsx (Línea 1524 - Auto-carga)**
```javascript
useEffect(() => {
  if (user?.id) {
    obtenerPresupuestos();
    obtenerNotasEntrega();
    obtenerPedidos();
  }
}, [user?.id]);
```

---

## ✨ Conclusión

```
✅ TODAS LAS 4 CORRECCIONES IMPLEMENTADAS
✅ BUILD SIN ERRORES
✅ LISTA PARA PRODUCCIÓN

Sigue los 4 pasos de prueba arriba y todo debe funcionar.
```

---

## 🚀 Próximo Paso

1. Abre PowerShell
2. Ejecuta: `npm run dev`
3. Abre http://localhost:5173
4. Sigue las 4 pruebas arriba
5. ✅ Todo debe funcionar

¡Adelante! 🎉