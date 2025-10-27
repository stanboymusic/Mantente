# 🧪 Guía de Pruebas - Correcciones Integrales

**Objetivo:** Verificar que los 4 problemas han sido resueltos

---

## ✅ Test 1: Creación de Facturas (Sin error de cliente)

### Pasos:
1. Accede a la sección **Facturas**
2. Haz clic en **"➕ Nueva Factura"**
3. En el modal:
   - **Cliente:** Selecciona un cliente del dropdown (ej: "Cliente 1")
   - **Descripción:** Ingresa una descripción (ej: "Venta de productos")
   - **Monto:** $100
   - **Método de pago:** Efectivo
4. Haz clic en **"Crear Factura"**

### Resultado Esperado:
✅ Aparece mensaje verde: "✅ Factura creada exitosamente"
✅ NO debe aparecer el error: "❌ Debes seleccionar un cliente"
✅ La factura aparece en la lista

### Si Falla:
- Verifica que haya clientes en la lista (ve a **Clientes** y crea uno)
- Abre la consola (F12) y busca errores
- Verifica que el cliente esté seleccionado antes de hacer clic

---

## ✅ Test 2: Descuentos Reflejados Correctamente

### 2A: Ingresar Venta con Descuento

1. Accede a **Ventas**
2. Haz clic en **"➕ Nueva Venta"**
3. Completa el formulario:
   - **Producto:** Selecciona uno (ej: "Producto A")
   - **Cantidad:** 1
   - **Precio Unitario:** $100
   - **Cliente:** "Cliente Prueba"
   - **Descuento:** 20 (representa 20%)
4. Haz clic en **"Registrar Venta"**

### Resultado Esperado en Venta:
```
Monto Total: $100
Descuento: 20%
Descuento en USD: $20
Total Final: $80
```

✅ El descuento se muestra convertido a USD ($20)
✅ El total final es $80 (no $100)

### 2B: Verificar en Dashboard

1. Ve a **Dashboard**
2. En la sección de **"Resumen Mensual"** busca:
   ```
   Total Ventas: $100
   Total Descuentos: $20
   Total Final: $80
   ```

### Resultado Esperado:
✅ **Total Descuentos:** $20 (no 20%)
✅ **Total Final:** $80 (no $100)
✅ Los montos coinciden con lo ingresado en Ventas

### 2C: Verificar en Libro de Ventas

1. Ve a **Libro de Ventas**
2. Busca la venta que acabas de crear
3. Verifica la columna "Descuento"

### Resultado Esperado:
✅ **Columna Descuento:** $20 (no 20%)
✅ **Columna Total:** $80 (no $100)

---

## ✅ Test 3: Persistencia de Presupuestos/Notas/Pedidos

### 3A: Crear una Nota de Entrega

1. Ve a **Notas de Entrega** (solo Premium)
2. Haz clic en **"➕ Nueva Nota"**
3. Completa el formulario:
   - **Cliente:** "Cliente Prueba"
   - **Fecha de Entrega:** Hoy
   - **Artículos:** Agrega uno (ej: "Producto X", Cantidad: 5)
4. Haz clic en **"Crear Nota"**

### Resultado Esperado:
✅ Aparece mensaje: "✅ Nota de entrega creada exitosamente"
✅ La nota aparece en la tabla

### 3B: Recargar la Página (Test Crítico)

1. **Presiona F5** o **Ctrl+R** para recargar
2. Espera a que cargue completamente
3. Ve nuevamente a **Notas de Entrega**

### Resultado Esperado:
✅ **LA NOTA SIGUE AHIENDO** (NO desapareció)
✅ Aparece en la misma tabla
✅ Los datos se conservaron exactamente igual

### Si Falla:
❌ Los datos desaparecieron → Problema de persistencia
- Verifica en las DevTools (F12) si hay errores de Supabase
- Confirma que tienes conexión a la base de datos

### 3C: Igual con Presupuestos y Pedidos

Repite el mismo proceso (crear → recargar) con:
- **Presupuestos:** Crea uno, recarga, verifica que esté
- **Pedidos:** Crea uno, recarga, verifica que esté

---

## ✅ Test 4: Transferencia de Deuda Entre Meses

### 4A: Preparar Octubre

1. Ve a **Cierre de Mes**
2. En el mes de **Octubre**:
   - **Gastos Fijos:** $1000
   - Agrega algunas **Ventas** por un total de $430
   - Haz clic en **"Cerrar Mes"**

### Resultado Esperado:
```
Deuda Pendiente (Octubre): $570
(porque 1000 - 430 = 570)
```

### Cómo verificar:
1. Ve a **Dashboard** o **Historial de Meses**
2. Busca el registro de Octubre
3. Verifica que **"Deuda Pendiente"** = $570

### 4B: Abrir Noviembre y Verificar Transferencia

1. Ve a **Cierre de Mes** (o Dashboard)
2. Selecciona el mes de **Noviembre**
3. En el historial o al abrir noviembre, verifica:

### Resultado Esperado:
```
Noviembre:
├─ Deuda Anterior: $570 (transferida de Octubre)
├─ Gastos Fijos: $1000
├─ Ventas: $0 (sin ventas en noviembre)
└─ Deuda Pendiente: $1570 (570 + 1000 - 0)
```

✅ **Deuda Anterior:** $570 (transferida)
✅ **Deuda Pendiente:** $1570 (acumulada correctamente)

### 4C: Cerrar Noviembre

1. Haz clic en **"Cerrar Mes"** para noviembre

### Resultado Esperado:
```
Noviembre Cerrado:
├─ Deuda Pendiente (Final): $1570
```

✅ Al siguiente mes (Diciembre), esta deuda se transferirá nuevamente

---

## 📋 Checklist de Verificación

### Problema 1: Facturas
- [ ] Puedo crear facturas sin error
- [ ] El cliente se valida correctamente
- [ ] La factura aparece en la lista
- [ ] No hay error "Debes seleccionar un cliente"

### Problema 2: Descuentos
- [ ] Ingreso 10% y se convierte a USD correctamente
- [ ] En Ventas se muestra el descuento en USD
- [ ] En Dashboard el descuento aparece en USD
- [ ] En Libro de Ventas el descuento aparece en USD
- [ ] El Total Final = Monto - Descuento (no se duplica)

### Problema 3: Persistencia
- [ ] Creo una Nota y no desaparece al recargar
- [ ] Creo un Presupuesto y no desaparece al recargar
- [ ] Creo un Pedido y no desaparece al recargar
- [ ] Los datos se mantienen exactamente igual
- [ ] Puedo recargar múltiples veces sin perder datos

### Problema 4: Deuda
- [ ] Octubre con $1000 gastos y $430 ventas = $570 deuda
- [ ] Noviembre recibe $570 de deuda anterior
- [ ] Noviembre muestra deuda total = $1570 (sin ventas)
- [ ] La deuda se acumula correctamente mes a mes

---

## 🐛 Solución de Problemas

### Error: "Cliente no autenticado"
**Solución:** Verifica que hayas iniciado sesión con tu cuenta

### Error: "Debes seleccionar un cliente"
**Solución:** 
- Recarga la página
- Verifica que haya al menos un cliente creado
- Asegúrate de que el cliente esté en el dropdown

### Descuentos muestran porcentaje (%) en lugar de USD
**Solución:**
- Recarga la página
- Ve a Ventas y asegúrate de ingresar números
- Ejemplo: Para 10%, ingresa "10" (no "10%")

### Datos desaparecen al recargar
**Solución:**
- Abre la consola (F12) y busca errores de Supabase
- Verifica tu conexión a internet
- Confirma que Supabase está en línea
- Intenta crear el dato nuevamente

### Deuda no se transfiere
**Solución:**
- Asegúrate de haber cerrado el mes anterior
- Verifica que la deuda del mes anterior sea > 0
- Abre manualmente el nuevo mes si es necesario

---

## 📞 Información de Ayuda

**Si algo no funciona:**

1. **Abre la consola del navegador (F12)**
2. **Busca mensajes de error** (rojo)
3. **Copia el error completo**
4. **Verifica la conexión a Supabase:**
   - Abre https://supabase.com
   - Verifica que tu proyecto esté en línea
5. **Intenta en otro navegador o modo incógnito**

---

## ✅ Conclusión

Si todos los tests pasan, ¡Felicidades! 🎉

Los 4 problemas han sido resueltos:
- ✅ Facturas funcionan
- ✅ Descuentos correctos
- ✅ Datos persisten
- ✅ Deuda se transfiere

**Estado Final: TODAS LAS CORRECCIONES FUNCIONAN** ✨