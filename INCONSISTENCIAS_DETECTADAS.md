# 🚨 INCONSISTENCIAS CRÍTICAS DETECTADAS

## ❌ ERROR 1: BALANCE FINAL COMPLETAMENTE INCORRECTO
**Ubicación:** Dashboard.jsx línea 48
```javascript
// ❌ INCORRECTO
const balanceFinal = subtotal - devolucionesAprobadas;

// ✅ CORRECTO (según documento)
// BALANCE FINAL = INGRESOS - EGRESOS - GASTOS FIJOS - DEUDA ACUMULADA
const balanceFinal = ingresosTotales - egresosTotales - gastosFijos - deudaAcumulada;
```
**Impacto:** El balance final está completamente errado. Las devoluciones NO restan del balance, restan de los INGRESOS.

---

## ❌ ERROR 2: DEVOLUCIONES NO SE RESTAN DE INGRESOS
**Ubicación:** Dashboard.jsx línea 31-34
```javascript
// ❌ INCORRECTO - No resta devoluciones
const ingresosTotales = Array.isArray(ventasData) ? ventasData.reduce(
  (acc, v) => acc + (v.monto || 0),
  0
) : 0;

// ✅ CORRECTO - Restar devoluciones aprobadas de ingresos
const ingresosTotales = (Array.isArray(ventasData) ? ventasData.reduce(
  (acc, v) => acc + (v.monto || 0), 0
) : 0) - devolucionesAprobadas;
```
**Impacto:** Los ingresos mostrados son 100% falsos. No incluyen las devoluciones restadas.

---

## ❌ ERROR 3: CIERRE DE MES - DESCUENTOS CONTADOS DOS VECES
**Ubicación:** AppContext.jsx línea 994-996
```javascript
// ❌ INCORRECTO - Está restando descuentos cuando ya están en el monto
const totalVentas = ventasDelMes.reduce((acc, v) => acc + Number(v.monto || 0), 0);
const totalDescuentos = ventasDelMes.reduce((acc, v) => acc + Number(v.descuento || 0), 0);
const totalFinal = totalVentas - totalDescuentos;

// ✅ CORRECTO - El monto ya tiene descuento aplicado, no restar de nuevo
const totalFinal = ventasDelMes.reduce((acc, v) => acc + Number(v.monto || 0), 0);
// NO RESTAR totalDescuentos porque ya está en monto
```
**Impacto:** El cierre de mes está subestimando los ingresos al restar descuentos dos veces.

---

## ❌ ERROR 4: CIERRE DE MES NO DESCUENTA DEVOLUCIONES APROBADAS
**Ubicación:** AppContext.jsx línea 994-1019
```javascript
// ❌ INCORRECTO - No considera devoluciones al calcular total final
const totalFinal = totalVentas - totalDescuentos; // Sin restar devoluciones

// ✅ CORRECTO - Debería restar devoluciones aprobadas
const devolucionesAprobadas = devoluciones
  .filter((d) => d.estado === "Aprobada" && d.mes_cierre === mesCierre)
  .reduce((acc, d) => acc + (d.monto || 0), 0);
const totalFinal = totalVentas - devolucionesAprobadas;
```
**Impacto:** El cierre de mes NO refleja las devoluciones aprobadas, invalidando el reporte financiero.

---

## ❌ ERROR 5: FÓRMULA DE DEUDA ACUMULADA INCOMPLETA
**Ubicación:** AppContext.jsx línea 1015-1019
```javascript
// ⚠️ INCOMPLETO - Está bien, pero solo funciona si totalFinal tiene devoluciones restadas
const deudaQueAcumular = deudaAnterior + gastosFijosGuardados;
const deudaAcumulada = Math.max(0, deudaQueAcumular - totalFinal);

// ✅ CORRECCIÓN DEPENDIENTE - Necesita que ERROR 4 esté arreglado
```
**Impacto:** Si el ERROR 4 persiste, la deuda acumulada será incorrecta.

---

## ❌ ERROR 6: obtenerDeudaAcumulada OBTIENE DEUDA EQUIVOCADA
**Ubicación:** AppContext.jsx línea 626-653
```javascript
// ❌ PROBLEMA - Busca deuda del MES ANTERIOR cuando debería ser del mes actual
const mesPasado = fechaHoy.toISOString().slice(0, 7) + "-01";
const { data, error } = await supabase
  .from("historialMeses")
  .select("deuda_pendiente")
  .eq("owner", user.id)
  .eq("mes", mesPasado)  // ❌ BUSCA MES PASADO
  .maybeSingle();
```

**Conceptualmente:** 
- **En Dashboard:** Necesita la deuda acumulada ACTUAL (del mes que se está viendo)
- **En Cierre de Mes:** Necesita la deuda del mes ANTERIOR para sumarla
- La función está mezclando estos conceptos

**Impacto:** El Dashboard muestra deuda incorrecta. El sistema está confundido sobre qué mes está viendo.

---

## ❌ ERROR 7: BALANCE FINAL LÍNEA 47-48 CÁLCULO INCORRECTO
**Ubicación:** Dashboard.jsx línea 47-48
```javascript
// ❌ INCORRECTO
const subtotal = ingresosTotales - egresosTotales - gastosFijosGuardados;
const balanceFinal = subtotal - devolucionesAprobadas;

// ✅ CORRECTO
const balanceFinal = ingresosTotales - egresosTotales - gastosFijosGuardados - deudaAcumulada;
// Nota: NO restar devoluciones aquí, ya deben estar restadas de ingresosTotales
```

---

## ❌ ERROR 8: handleGuardarGastosFijos CÁLCULO INCORRECTO
**Ubicación:** Dashboard.jsx línea 85-89
```javascript
// ❌ INCORRECTO - No incluye deuda en cálculo
setBalance((prev) => ({
  ...prev,
  gastosFijos: monto,
  total: prev.ingresos - prev.egresos - monto - prev.deuda - prev.devoluciones,
}));

// ✅ CORRECTO (pero redundante con Error 1)
setBalance((prev) => ({
  ...prev,
  gastosFijos: monto,
  total: prev.ingresos - prev.egresos - monto - prev.deuda,
  // NO restar devoluciones aquí
}));
```

---

## 📊 RESUMEN DE IMPACTO

| Error | Severidad | Afecta a | Impacto Financiero |
|-------|-----------|----------|-------------------|
| 1 - Balance Final Incorrecto | 🔴 CRÍTICA | Dashboard, Reportes | Reportes totalmente falsos |
| 2 - Devoluciones no restan de ingresos | 🔴 CRÍTICA | Dashboard, Reportes | Ingresos sobrestimados |
| 3 - Descuentos contados 2x en cierre | 🔴 CRÍTICA | Cierre de mes | Ingresos subestimados |
| 4 - Sin devoluciones en cierre | 🔴 CRÍTICA | Cierre de mes, Deuda | Reportes incompletos |
| 5 - Deuda acumulada incompleta | 🟡 MEDIA | Deuda, Apertura | Deuda incorrecta si 4 falla |
| 6 - obtenerDeudaAcumulada equivocada | 🔴 CRÍTICA | Dashboard, Deuda | Deuda mostrada incorrectamente |
| 7 - Balance línea 47 errado | 🔴 CRÍTICA | Dashboard | Duplica error 1 |
| 8 - handleGuardarGastosFijos | 🟡 MEDIA | Gastos Fijos | Actualización manual inconsistente |

---

## 🔧 ORDEN DE CORRECCIONES RECOMENDADO

1. **ERROR 2** - Restar devoluciones de INGRESOS (prerequisito para todo lo demás)
2. **ERROR 3** - Quitar duplicación de descuentos en CIERRE
3. **ERROR 4** - Agregar devoluciones a CIERRE DE MES
4. **ERROR 6** - Revisar obtenerDeudaAcumulada
5. **ERROR 1** - Corregir BALANCE FINAL
6. **ERROR 5** - Validar DEUDA ACUMULADA
7. **ERROR 7** - Limpiar cálculo en línea 47-48
8. **ERROR 8** - Limpiar handleGuardarGastosFijos
