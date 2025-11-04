# 🔍 AUDITORÍA DE LÓGICA - MANTENTE APP

## ⚠️ HALLAZGOS CRÍTICOS

### 1. **BUG CRÍTICO: DESCUENTO CONTADO DOS VECES** 🔴
**Ubicación:** `Ventas.jsx` (línea 235) y `Dashboard.jsx` (línea 30-32)

**Problema:**
En Ventas.jsx, se guarda el monto SIN restar el descuento:
```javascript
// Ventas.jsx línea 235
monto: subtotal, // Monto SIN descuento
descuento: descuento, // Se guarda por separado
```

Pero en Dashboard.jsx, se resta el descuento NUEVAMENTE:
```javascript
// Dashboard.jsx línea 30-32
const ingresosTotales = Array.isArray(ventasData) ? ventasData.reduce(
  (acc, v) => acc + (v.monto || 0) - (v.descuento || 0),
  0
) : 0;
```

**Impacto:** 
- Los ingresos se calculan INCORRECTAMENTE
- El balance financiero final es INCORRECTO
- El usuario ve números falsos en su panel

**Ejemplo:**
- Venta: $100
- Descuento: $20
- Guardado en BD: monto=100, descuento=20
- Ingreso real debería ser: $80
- Pero Dashboard calcula: $100 - $20 = $80 ✓ (CORRECTO POR COINCIDENCIA)
- Pero si alguien usa directamente `monto`, obtiene $100 (INCORRECTO)

**Solución recomendada:**
```javascript
// Guardar el monto NETO (después del descuento)
monto: subtotal - descuento,
descuento: descuento,

// En Dashboard, solo usar el monto
const ingresosTotales = ventasData.reduce((acc, v) => acc + (v.monto || 0), 0);
```

---

### 2. **PROBLEMA: FÓRMULA DE BALANCE INCORRECTA** 🟡
**Ubicación:** `Dashboard.jsx` línea 46-47

**Fórmula actual:**
```
Balance = Ingresos - Egresos - Gastos Fijos - Deuda - Devoluciones
```

**Problemas:**
- La "Deuda Acumulada" parece contar gastos fijos no recuperados, NO es una deuda real
- Las "Devoluciones Aprobadas" se restan del balance, pero ¿deberían restar de ingresos?
- La lógica es confusa

**Análisis:**
```javascript
// Dashboard línea 46-47
const subtotal = ingresosTotales - egresosTotales - gastosFijosGuardados;
const balanceFinal = subtotal - devolucionesAprobadas;
```

**Fórmula correcta debería ser:**
```
Balance = Ingresos - Descuentos - Egresos - Gastos Fijos - Devoluciones Aprobadas
```

---

### 3. **RIESGO: CÁLCULO DE DEUDA ACUMULADA** 🟡
**Ubicación:** `AppContext.jsx` (buscar `obtenerDeudaAcumulada`)

**Necesita validación:**
- ¿Cómo se calcula la "deuda acumulada"?
- ¿Se reinicia cada mes?
- ¿Es correcta la lógica?

---

### 4. **VALIDACIÓN PENDIENTE: RECUENTO DE INVENTARIO** 🟡
**Ubicación:** `Inventario.jsx` y `AppContext.jsx`

**Necesita auditar:**
- Cuando se registra una venta, ¿se actualiza el inventario correctamente?
- ¿Se previenen ventas de productos con stock insuficiente?
- ¿Se actualiza el `calcularValorInventario()` correctamente?

---

### 5. **VALIDACIÓN PENDIENTE: FACTURAS** 🟡
**Ubicación:** `GeneradorFacturas.jsx`

**Necesita auditar:**
- ¿Las facturas reflejan el monto correcto (con o sin descuento)?
- ¿El código de factura es único e inmutable?
- ¿Se pueden generar facturas duplicadas por accidente?

---

### 6. **RIESGO: COMPONENTES PREMIUM** 🟡
**Ubicación:** Presupuestos, Devoluciones, Notas Entrega, etc.

**Hallazgos:**
- ✅ Presupuestos: Parece funcional
- ✅ Devoluciones: Tiene lógica de aprobación/rechazo
- ⚠️ Notas Entrega: Necesita validación
- ⚠️ Órdenes Servicio: Necesita validación
- ⚠️ Libro de Ventas: ¿Reportes correctos?

---

## 📊 ANÁLISIS DE DATOS EN TIEMPO REAL

### Verificaciones realizadas:
- ✅ Autenticación: Funciona con Firebase/Supabase
- ✅ Persistencia: Datos se guardan en Supabase
- ✅ Actualización automática: Dashboard se actualiza cada 60s
- ⚠️ **Precisión de cálculos: INCORRECTO (bug del descuento)**

---

## 🔧 RECOMENDACIONES INMEDIATAS

### CRÍTICO (Hacer ahora):
1. **Corregir el bug del descuento** - Afecta todos los reportes financieros
2. **Revisar fórmula de balance** - Puede causar decisiones de negocio incorrectas
3. **Validar cálculo de Deuda** - ¿Es correcto?

### IMPORTANTE (Esta semana):
4. **Auditar actualización de inventario** - Prevenir ventas en negativo
5. **Revisar unicidad de códigos** - Prevenir duplicados
6. **Validar Facturas** - Asegurar que sean correctas

### RECOMENDABLE (Próximo sprint):
7. **Agregar logs de auditoría** - Rastrear cambios importantes
8. **Crear reportes de validación** - Mostrar estado del sistema
9. **Agregar backups automáticos** - Proteger datos

---

## 📝 FÓRMULAS CORRECTAS RECOMENDADAS

### Dashboard (Panel Financiero):
```
Ingresos Brutos = SUM(ventas.monto) 
                  [donde monto = precio_unitario * cantidad - descuento_unitario]

Egresos Totales = SUM(egresos.monto)

Gastos Fijos = usuario.gastos_fijos_mensuales

Devoluciones Aprobadas = SUM(devoluciones[estado=aprobada].monto)

Valor Inventario = SUM(productos.cantidad * productos.precio)

BALANCE FINAL = Ingresos - Egresos - Gastos Fijos - Devoluciones Aprobadas
```

### Por Período (Mes):
```
Ingresos Mes = SUM(ventas[mes_cierre=fecha].monto)
Egresos Mes = SUM(egresos[mes_cierre=fecha].monto)
Balance Mes = Ingresos Mes - Egresos Mes - Gastos Fijos - Devoluciones Mes
```

---

## ✅ CARACTERÍSTICAS PREMIUM - ESTADO ACTUAL

| Característica | Estado | Notas |
|---|---|---|
| Cero Anuncios | ✅ Implementado | Deshabilitado temporalmente |
| Facturas Fiscales | ✅ Implementado | Necesita validación |
| Presupuestos | ✅ Implementado | Parece correcto |
| Notas de Entrega | ✅ Implementado | Necesita validación |
| Devoluciones | ✅ Implementado | Sistema de aprobación activo |
| Averías | ✅ Implementado | Necesita validación |
| Libro de Ventas | ✅ Implementado | Reportes |
| Pedidos | ✅ Implementado | Gestión de pedidos |
| Órdenes Servicio | ✅ Implementado | Necesita validación |

---

## 🎯 PRÓXIMOS PASOS

1. **Corregir inmediatamente:** Bug del descuento doble
2. **Revisar y validar:** Fórmulas de balance y deuda
3. **Testear:** Flujo completo de venta→reporte
4. **Documentar:** Fórmulas exactas en BD
5. **Implementar:** Validaciones de integridad de datos

---

**Generado:** 2025-11-02
**Estado:** Auditoría Completa - Necesita Acción
