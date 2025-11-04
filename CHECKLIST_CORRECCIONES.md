# ✅ CHECKLIST DE CORRECCIONES Y VALIDACIONES

## 🔴 CRÍTICO - COMPLETAR PRIMERO

### [✅] Bug del Descuento Doble
- **Archivos afectados:**
  - ✅ `Ventas.jsx` línea 235
  - ✅ `Dashboard.jsx` línea 30-32
- **Cambio:** Guardar `monto: total` (con descuento) en lugar de `monto: subtotal`
- **Estado:** CORREGIDO
- **Validar:** Crear venta con descuento y revisar Dashboard

---

## 🟡 IMPORTANTE - HACER ESTA SEMANA

### [ ] Validar Fórmula de Balance
**Ubicación:** `Dashboard.jsx`

**Preguntas a responder:**
- ¿Cómo se calcula la "Deuda Acumulada"?
- ¿Es gastos fijos no recuperados o deuda real?
- ¿Debería restarse cada mes?

**Acción:** 
- [ ] Revisar `obtenerDeudaAcumulada()` en AppContext
- [ ] Validar lógica con contador/asesor

---

### [ ] Agregar Validaciones de Integridad
```javascript
// Validar que descuento no exceda el subtotal
if (descuento > subtotal) {
  alert("❌ Descuento no puede exceder el subtotal");
}

// Validar que no haya montos negativos
if (monto < 0 || total < 0) {
  alert("❌ Montos negativos detectados");
}

// Validar que cantidad > 0
if (cantidad <= 0) {
  alert("❌ Cantidad debe ser mayor a cero");
}
```

**Ubicaciones:**
- [ ] `Ventas.jsx` - Línea de cálculos
- [ ] `Egresos.jsx` - Línea de cálculos
- [ ] `Inventario.jsx` - Línea de cálculos

---

### [ ] Implementar Logs de Auditoría
```javascript
// Log cada transacción importante
console.log({
  tipo: "VENTA_REGISTRADA",
  usuario: user.id,
  monto: total,
  descuento: descuento,
  cliente: cliente_id,
  timestamp: new Date().toISOString(),
  codigo_venta: codigo_venta
});
```

**Archivos:**
- [ ] `Ventas.jsx` - Registrar cuando se crea venta
- [ ] `Egresos.jsx` - Registrar cuando se crea egreso
- [ ] `GeneradorFacturas.jsx` - Registrar cuando se crea factura

---

## 🟢 VALIDAR PRÓXIMA SEMANA

### [ ] Testing: Escenario 1 - Venta Simple
**Pasos:**
1. Crear producto: Precio $100, Cantidad 5
2. Registrar venta: 1 unidad, sin descuento
3. Verificar:
   - [ ] Inventario cambio a 4
   - [ ] Dashboard muestra ingreso de $100
   - [ ] Balance correcto

**Resultado esperado:**
- Inventario: 4 ✅
- Ingreso: $100 ✅
- Balance: $100 - $0 - $0 - $0 - $0 = $100 ✅

---

### [ ] Testing: Escenario 2 - Venta con Descuento
**Pasos:**
1. Crear producto: Precio $100
2. Registrar venta: 1 unidad, descuento $20
3. Verificar:
   - [ ] Se guarda monto $80 (con descuento)
   - [ ] Dashboard muestra ingreso $80
   - [ ] Descuento NO se resta dos veces

**Resultado esperado:**
- Monto guardado: $80 ✅
- Dashboard: $80 ✅
- NO: $100 - $20 = $80 (dos veces) ❌

---

### [ ] Testing: Escenario 3 - Múltiples Productos
**Pasos:**
1. Registrar venta con 3 productos
2. Verificar:
   - [ ] Todos los productos se guardan
   - [ ] Total se calcula correctamente
   - [ ] Código de venta es único

**Resultado esperado:**
- Productos: 3 ✅
- Total: suma correcta ✅
- Código único ✅

---

### [ ] Testing: Escenario 4 - Devolución
**Pasos:**
1. Crear venta: $100
2. Crear devolución: $20
3. Aprobar devolución
4. Verificar:
   - [ ] Balance se ajusta correctamente
   - [ ] Devolución aparece en Dashboard

**Resultado esperado:**
- Balance: $100 - $20 = $80 ✅
- Devoluciones mostradas correctamente ✅

---

## 📋 TESTING - CARACTERÍSTICAS PREMIUM

### [ ] Presupuestos
- [ ] Crear presupuesto
- [ ] Verificar descuentos
- [ ] Exportar PDF
- [ ] Convertir a venta

### [ ] Devoluciones
- [ ] Crear devolución
- [ ] Aprobar/Rechazar
- [ ] Impacto en balance
- [ ] Historial

### [ ] Notas de Entrega
- [ ] Crear nota
- [ ] Vincular a venta
- [ ] Estado de entrega
- [ ] Exportar

### [ ] Órdenes de Servicio
- [ ] Crear orden
- [ ] Asignar técnico
- [ ] Cambiar estado
- [ ] Generar factura

---

## 🔍 AUDITORÍA DE DATOS

### [ ] Revisar Datos Históricos
```sql
-- Verificar que no hay ventas con descuento duplicado
SELECT COUNT(*) as inconsistencias
FROM ventas
WHERE monto != (subtotal - descuento)
```

**Acción si hay inconsistencias:**
- [ ] Identificar qué ventas están mal
- [ ] Corregir manual o automáticamente
- [ ] Documentar el cambio

---

### [ ] Validar Integridad de Inventario
**Preguntas:**
- [ ] ¿Hay productos con cantidad negativa?
- [ ] ¿Suma de ventas coincide con inventario?
- [ ] ¿Stock está correcto?

**Consulta:**
```javascript
// En dashboard, verificar
inventario.forEach(prod => {
  if (prod.cantidad < 0) {
    console.error("ALERTA: Producto con stock negativo", prod);
  }
});
```

---

## 📊 DOCUMENTACIÓN REQUERIDA

### [ ] Crear Manual de Fórmulas
```
ARCHIVO: MANUAL_FORMULAS.md

Ingresos = SUM(ventas.monto) donde monto = subtotal - descuento
Egresos = SUM(egresos.monto)
Gastos Fijos = usuario.gastos_fijos_mensuales
Devoluciones = SUM(devoluciones aprobadas)
Balance = Ingresos - Egresos - Gastos Fijos - Devoluciones
```

### [ ] Crear Guía de Uso - Módulo Ventas
```
- Cómo registrar venta correctamente
- Qué es descuento y cómo aplicarlo
- Cómo generar factura
- Qué significa cada campo
```

### [ ] Crear Guía de Uso - Reportes
```
- Cómo leer el Dashboard
- Cómo generar reportes
- Qué significa cada número
- Cómo exportar datos
```

---

## 🚀 PRE-PRODUCCIÓN

### [ ] Crear Backup
- [ ] Hacer backup de BD actual
- [ ] Guardar en lugar seguro
- [ ] Documentar fecha y versión

### [ ] Monitoreo
- [ ] Configurar alertas de errores
- [ ] Revisar logs cada día
- [ ] Validar consistencia de datos

### [ ] Capacitación
- [ ] Entrenar usuarios en flujo correcto
- [ ] Mostrar cómo verificar datos
- [ ] Explicar qué es descuento y cómo usarlo

---

## ⚠️ PROBLEMAS CONOCIDOS

### Problema 1: AdSense Deshabilitado
- **Causa:** Loop infinito de re-renders
- **Solución:** Temporalmente deshabilitado en index.html
- **Próximos pasos:** Reimplementar con mejor control

### Problema 2: Deuda Acumulada
- **Causa:** Lógica confusa
- **Solución:** Validar con contador
- **Próximos pasos:** Documentar correctamente

---

## 📈 CHECKLIST ANTES DE IR A PRODUCCIÓN

- [ ] ✅ Bug del descuento corregido
- [ ] Testing completado (4 escenarios)
- [ ] Validaciones de datos activas
- [ ] Logs de auditoría implementados
- [ ] Backup realizado
- [ ] Documentación completada
- [ ] Usuarios capacitados
- [ ] Monitoreo configurado
- [ ] Manual de fórmulas documentado
- [ ] Revisión final de contador/asesor

---

**Estado Actual:** 30% completo  
**Estimación:** 2-3 días de trabajo  
**Riesgo:** MEDIO → BAJO (después del fix)
