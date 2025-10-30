# ✅ TESTING MANUAL - PASO 4 (Paso a Paso)

## 🎯 Objetivo
Verificar que TODO funciona correctamente antes de ir a producción.

---

## ⏱️ Tiempo Estimado
- Test Suite 1-2: 20 minutos
- Test Suite 3-4: 15 minutos  
- Test Suite 5: 10 minutos
- **Total: ~45 minutos**

---

## 🚀 PASO 0: Preparación

### 1. Asegúrate que el servidor esté corriendo

```bash
# PowerShell
Set-Location "c:\Users\angel\OneDrive\Documents\proyecto mantente\mantente-app"
npm run dev
```

Verifica en consola:
```
VITE v7.1.11  ready in 1234 ms

Local:   http://localhost:5173
```

### 2. Abre navegador

```
http://localhost:5173  (o el puerto que aparezca)
```

### 3. Login con usuario Premium

- Email: (tu usuario premium)
- Password: (tu contraseña)

### 4. Abre F12 (Consola de Desarrollador)

```
F12 → Console tab
```

Verifica:
- ✅ No hay errores rojos
- ✅ Ves mensaje: "✅ Estado premium verificado: isActive: true"

---

## 📋 TEST SUITE 1: DEVOLUCIONES

### ✅ TEST 1.1: Crear Devolución - Reembolso Completo

**Paso 1: Navega a Devoluciones**
```
Click en navbar → ↩️ Devoluciones
```

**Paso 2: Busca una venta**
```
Campo "Buscar por código": 
  - Digita una venta que exista (ej: V-001)
  - Si no sabes qué ventas hay, ve a 📦 Ventas primero y nota un código
```

**Paso 3: Abre el modal**
```
En la tabla, click en el botón "Procesar" o similar
Modal se abre
```

**Paso 4: Selecciona Tipo**
```
Dropdown "Tipo de Resolución" 
→ Selecciona "Reembolso Completo"
```

**Paso 5: Verifica el impacto**
```
Panel muestra:
  Badge EGRESO (rojo): -$XX.XX
  Descripción: "Reembolso completo al cliente"
  
✓ Esperado: El badge es ROJO (egreso)
```

**Paso 6: Registra**
```
Click "Registrar Devolución"
Modal cierra
```

**Paso 7: Verifica resultado**
```
✓ Tabla ahora muestra la devolución registrada
✓ En Dashboard: Impacto Financiero mostrado
✓ Consola (F12): Busca error, debe estar verde ✅
```

---

### ✅ TEST 1.2: Cambio de Producto más Caro

**Paso 1: Abre Devoluciones**
```
Click navbar → ↩️ Devoluciones
```

**Paso 2: Busca una venta DIFERENTE**
```
Campo "Buscar": ingresa código de otra venta
Click "Procesar"
```

**Paso 3: Selecciona Tipo = Cambio +Caro**
```
Dropdown → "Cambio +Caro"
```

**Paso 4: Observa que aparecen campos nuevos**
```
Verás:
  ├─ Producto a Cambiar (Dropdown)
  ├─ Cantidad Nueva
  ├─ Precio Nuevo
  └─ Resumen de Cálculo
```

**Paso 5: Selecciona un producto más caro**
```
En Dropdown "Producto a Cambiar":
  - Busca un producto que cueste MÁS que el original
  - Ejemplo: Original $50 → Cambio $100

Campo "Cantidad Nueva": 1
Campo "Precio Nuevo": 100
```

**Paso 6: Verifica el cálculo**
```
Panel muestra:
  Fórmula: (100 * 1) - (50 * 1) = 50
  Badge INGRESO (verde): +$50
  Texto: "Cliente debe pagar $50"

✓ Esperado: Badge es VERDE (ingreso)
```

**Paso 7: Registra**
```
Click "Registrar Devolución"
```

**Paso 8: Verifica en tabla**
```
✓ Nueva devolución visible
✓ Tipo: "Cambio +Caro"
✓ Impacto: +$50 (verde)
```

---

### ✅ TEST 1.3: Canje con Proveedor

**Paso 1: Abre Devoluciones**
```
Click navbar → ↩️ Devoluciones
```

**Paso 2: Busca una venta más**
```
Campo: ingresa código de otra venta
Click "Procesar"
```

**Paso 3: Selecciona Tipo = Canje Proveedor**
```
Dropdown → "Canje Proveedor"
```

**Paso 4: Completa campos**
```
Nombre Proveedor: "Samsung" (o lo que sea)
Referencia Canje: "REF-20250115-001"
```

**Paso 5: Verifica impacto**
```
Panel muestra:
  Badge EGRESO (rojo): -$XX.XX
  Texto: "Canje con proveedor"
```

**Paso 6: Registra**
```
Click "Registrar Devolución"
```

**Paso 7: Verifica**
```
✓ En tabla aparece
✓ Tipo: "Canje Proveedor"
✓ Referencia guardada
```

---

### ✅ TEST 1.4: Búsqueda de Devoluciones

**Paso 1: En Devoluciones, observa tabla**
```
Verás todas las devoluciones registradas
Columnas:
  ├─ Fecha
  ├─ Código Venta
  ├─ Cliente
  ├─ Tipo Resolución
  ├─ Cantidad
  ├─ Impacto Financiero
  └─ Estado
```

**Paso 2: Verifica estadísticas**
```
Arriba de la tabla:
  📊 Total Devoluciones: X
  💰 Total Reembolsos: $Y
  🔄 Total Cambios: Z unidades
  etc.
```

**Paso 3: Filtra por tipo (si hay filtro)**
```
Si existe dropdown de filtro:
  Click dropdown → Selecciona "Cambio +Caro"
  Tabla se filtra (solo muestra cambios +caros)
```

**Paso 4: Verifica persistencia**
```
Presiona F5 (recargar página)
Login si necesario
✓ Todas las devoluciones siguen ahí
✓ Estadísticas mismo valor
```

---

## 📋 TEST SUITE 2: AVERÍAS & DAÑOS

### ✅ TEST 2.1: Registrar Avería Simple

**Paso 1: Navega a Averías**
```
Click navbar → 🔧 Averías
```

**Paso 2: Click "Nueva Avería"**
```
Botón verde "Nueva Avería" (o similar)
Se abre modal
```

**Paso 3: Selecciona producto**
```
Dropdown "Producto":
  - Selecciona un producto del inventario
  - Ejemplo: "iPhone 13"
```

**Paso 4: Ingresa cantidad**
```
Campo "Cantidad": 2
```

**Paso 5: Selecciona razón**
```
Dropdown "Razón del Daño":
  - "Pantalla rota"
  - "Componente defectuoso"
  - "Daño de transporte"
  - "Batería muerta"
  - etc.
  
Selecciona una
```

**Paso 6: NO marques "Canje Proveedor"**
```
Checkbox debe estar DESMARCADO
```

**Paso 7: Registra**
```
Click "Registrar Avería"
Modal cierra
```

**Paso 8: Verifica resultado**
```
✓ En tabla de Averías aparece el registro
✓ Estado: "Desechada"
✓ Inventario fue reducido
```

---

### ✅ TEST 2.2: Avería con Canje Proveedor

**Paso 1: Click "Nueva Avería"**
```
Modal abierto
```

**Paso 2: Selecciona producto**
```
Dropdown: "Samsung Galaxy S21"
```

**Paso 3: Ingresa cantidad**
```
Campo "Cantidad": 3
```

**Paso 4: Selecciona razón**
```
Dropdown: "Daño de transporte"
```

**Paso 5: MARCA "¿Canje con Proveedor?"**
```
Checkbox: MARCAR ✓
Aparecen campos nuevos:
  ├─ Nombre Proveedor
  ├─ Referencia Canje
  └─ Detalles
```

**Paso 6: Completa datos**
```
Nombre Proveedor: "Samsung Service"
Referencia Canje: "SWAP-123456"
```

**Paso 7: Registra**
```
Click "Registrar Avería"
```

**Paso 8: Verifica resultado**
```
✓ En tabla aparece
✓ Estado: "Canjeada"
✓ Muestra nombre del proveedor "Samsung Service"
✓ Referencia visible
```

---

### ✅ TEST 2.3: Estadísticas de Averías

**Paso 1: En pantalla 🔧 Averías, observa tarjetas superiores**
```
Tarjetas visibles:
  ┌─────────────────────────┐
  │ Total Averías    │ 5    │
  │ Canjeadas        │ 2    │
  │ Desechadas       │ 3    │
  │ Pérdida Total    │$150  │
  └─────────────────────────┘
```

**Paso 2: Verifica números**
```
✓ Total Averías = Canjeadas + Desechadas + Pendientes
✓ Pérdida Total = sum de (cantidad * precio) para averías sin canje
```

**Paso 3: Crea 2-3 averías más y verifica que se actualice**
```
Click "Nueva Avería" → registra
Espera que se actualice
✓ Números en tarjetas cambian
```

---

### ✅ TEST 2.4: Filtrar Averías

**Paso 1: Observa tabla de Averías**
```
Columnas visibles:
  ├─ Fecha
  ├─ Producto
  ├─ Cantidad
  ├─ Razón
  ├─ Estado
  ├─ Proveedor (si aplica)
  └─ Acciones
```

**Paso 2: Si existe filtro de Estado**
```
Click dropdown "Filtrar por Estado"
Selecciona: "Canjeada"
✓ Tabla muestra solo las canjeadas
✓ Columna "Proveedor" visible
```

**Paso 3: Si existe búsqueda por producto**
```
Campo búsqueda: "iPhone"
✓ Tabla filtra por productos que contienen "iPhone"
```

---

## 📋 TEST SUITE 3: PERSISTENCIA DE DATOS

### ✅ TEST 3.1: Datos Persisten al Recargar (Hard Refresh)

**Paso 1: Crea una devolución**
```
Ve a ↩️ Devoluciones
Registra un "Reembolso Completo"
Tabla muestra el registro
```

**Paso 2: Crea una avería**
```
Ve a 🔧 Averías
Registra una avería simple
Tabla muestra el registro
Nota estadísticas
```

**Paso 3: Anota los números**
```
Devoluciones: Total = X
Averías: Total = Y
Pérdida Total = $Z
```

**Paso 4: Hard Refresh (Ctrl+Shift+R)**
```
Presiona Ctrl+Shift+R (fuerza recarga sin caché)
```

**Paso 5: Login si es necesario**
```
Si cierra sesión, haz login
```

**Paso 6: Verifica que esté todo igual**
```
Ve a ↩️ Devoluciones
✓ Devoluciones que creaste siguen ahí
✓ Mismas estadísticas

Ve a 🔧 Averías
✓ Averías que creaste siguen ahí
✓ Mismo total en tarjetas
```

---

### ✅ TEST 3.2: Premium Status Persiste (Offline)

**Paso 1: Verifica que estés premium**
```
Navbar debe mostrar 🔧 Averías
Si no ves, NO HAGAS ESTE TEST (solo para premium)
```

**Paso 2: Abre DevTools**
```
F12 → Tab Network
```

**Paso 3: Simula conexión offline**
```
En DevTools Network:
  - Click dropdown "Throttling" (arriba a la derecha)
  - Selecciona "Offline"
  - El ícono de WiFi muestra X (offline)
```

**Paso 4: Recarga página**
```
Presiona F5
```

**Paso 5: Verifica que NO se degrada a Free**
```
✓ 🔧 Averías sigue visible en navbar
✓ ↩️ Devoluciones sigue disponible
✓ Botones NO están deshabilitados
```

**Paso 6: Vuelve a Online**
```
DevTools Network:
  - Click dropdown Throttling
  - Selecciona "No throttling" o "Online"
  - Espera a que sincronice (5-10 segundos)
```

**Paso 7: Verifica que se sincronizó**
```
Consola (F12 → Console):
  ✓ Ves mensaje: "✅ Estado premium verificado: isActive: true"
  ✓ No hay errores rojos
```

---

## 📋 TEST SUITE 4: VALIDACIONES & ERRORES

### ✅ TEST 4.1: Validación - Cantidad Excede Original

**Paso 1: Ve a ↩️ Devoluciones**
```
Busca una venta que tenga 3 unidades
```

**Paso 2: Intenta crear devolución**
```
Click para abrir modal
Selecciona tipo: "Cambio +Caro"
Selecciona producto
```

**Paso 3: Ingresa cantidad mayor**
```
Campo "Cantidad Nueva": 5 (cuando original era 3)
```

**Paso 4: Intenta registrar**
```
Click "Registrar Devolución"
```

**Paso 5: Verifica error**
```
✓ Aparece mensaje de error:
  "❌ Cantidad no puede exceder X unidades"
✓ Modal NO se cierra
✓ Devolución NO se registra
```

---

### ✅ TEST 4.2: Validación - Producto No Existe

**Paso 1: Ve a 🔧 Averías**
```
Click "Nueva Avería"
```

**Paso 2: Intenta seleccionar producto**
```
Dropdown "Producto": debe estar vacío o mostrar "Selecciona uno"
```

**Paso 3: SIN seleccionar, intenta registrar**
```
Click "Registrar Avería"
```

**Paso 4: Verifica error**
```
✓ Aparece error: "❌ Debes seleccionar un producto"
✓ Modal NO se cierra
```

---

### ✅ TEST 4.3: Validación - Premium Requerido

**SOLO SI TIENES ACCESO A USUARIO FREE:**

**Paso 1: Logout**
```
Click navbar → Logout/Cerrar sesión
```

**Paso 2: Login con usuario FREE**
```
(Usuario que NO tiene premium)
```

**Paso 3: Navega a 🔧 Averías**
```
Intenta hacer click en 🔧 Averías en navbar
```

**Paso 4: Verifica que está deshabilitado**
```
✓ Botón NO es clickeable (gris o deshabilitado)
O
✓ Muestra mensaje: "Requiere Premium"
✓ Redirecciona a Premium upgrade
```

---

### ✅ TEST 4.4: Validación - Venta No Existe

**Paso 1: Ve a ↩️ Devoluciones**
```
Campo "Buscar por código"
```

**Paso 2: Ingresa un código que NO existe**
```
Ejemplo: "V-99999"
```

**Paso 3: Intenta buscar/procesar**
```
Si hay botón "Buscar", clickea
```

**Paso 4: Verifica error**
```
✓ Aparece mensaje: "❌ Venta no encontrada"
O
✓ Modal NO se abre
✓ Tabla mostrará vacía
```

---

## 📋 TEST SUITE 5: CÁLCULOS AUTOMÁTICOS

### ✅ TEST 5.1: Diferencia Cambio +Caro

**Paso 1: Ve a ↩️ Devoluciones**
```
Busca una venta
```

**Paso 2: Crea devolución tipo Cambio +Caro**
```
Producto original: $50 (cantidad: 1)
Nuevo producto: $100 (cantidad: 1)
```

**Paso 3: Modal muestra cálculo**
```
Panel debe mostrar:
  Fórmula: (100 × 1) - (50 × 1) = 50
  Badge INGRESO (verde): +$50
  Texto: "Cliente debe pagar $50"
```

**Paso 4: Verifica badge color**
```
✓ Badge es VERDE (ingreso para la tienda)
✓ Color diferente a egresos
```

**Paso 5: Registra y verifica en Dashboard**
```
Ve al Dashboard (inicio)
Impacto Financiero debe actualizar
✓ +$50 visible en ingresos totales
```

---

### ✅ TEST 5.2: Diferencia Cambio -Caro

**Paso 1: Ve a ↩️ Devoluciones**
```
Busca una venta diferente
```

**Paso 2: Crea devolución tipo Cambio -Caro**
```
Producto original: $100 (cantidad: 1)
Nuevo producto: $50 (cantidad: 1)
```

**Paso 3: Modal muestra cálculo**
```
Panel debe mostrar:
  Fórmula: (50 × 1) - (100 × 1) = -50
  Badge EGRESO (rojo): -$50
  Texto: "Negocio refunda $50"
```

**Paso 4: Verifica badge color**
```
✓ Badge es ROJO (egreso para la tienda)
```

**Paso 5: Registra**
```
Ve al Dashboard
✓ -$50 visible en egresos totales
```

---

### ✅ TEST 5.3: Cambio 2x1 (Sin Impacto Financiero)

**Paso 1: Ve a ↩️ Devoluciones**
```
Busca una venta
```

**Paso 2: Crea devolución tipo Cambio Igual o Canje Proveedor**
```
O crea un cambio donde:
  Precio original: $100 × 1 = $100
  Nuevo precio: $50 × 2 = $100
  (Diferencia = 0)
```

**Paso 3: Modal muestra cálculo**
```
Panel debe mostrar:
  Fórmula: (50 × 2) - (100 × 1) = 0
  Badge NEUTRO (gris): $0
  Texto: "Sin impacto financiero"
```

**Paso 4: Verifica badge color**
```
✓ Badge es GRIS o NEUTRAL (no es rojo ni verde)
```

---

## 🎉 RESUMEN - Checklist Final

Marca ✅ cada test conforme termines:

```
SUITE 1: DEVOLUCIONES
  ✅ TEST 1.1: Reembolso Completo
  ✅ TEST 1.2: Cambio +Caro
  ✅ TEST 1.3: Canje Proveedor
  ✅ TEST 1.4: Búsqueda

SUITE 2: AVERÍAS
  ✅ TEST 2.1: Avería Simple
  ✅ TEST 2.2: Avería con Canje Proveedor
  ✅ TEST 2.3: Estadísticas
  ✅ TEST 2.4: Filtrar

SUITE 3: PERSISTENCIA
  ✅ TEST 3.1: Datos Persisten (Hard Refresh)
  ✅ TEST 3.2: Premium Status Persiste (Offline)

SUITE 4: VALIDACIONES
  ✅ TEST 4.1: Cantidad Excede Original
  ✅ TEST 4.2: Producto No Existe
  ✅ TEST 4.3: Premium Requerido
  ✅ TEST 4.4: Venta No Existe

SUITE 5: CÁLCULOS
  ✅ TEST 5.1: Cambio +Caro
  ✅ TEST 5.2: Cambio -Caro
  ✅ TEST 5.3: Cambio 2x1 Neutro
```

---

## 🐛 Si Algo Falla

### Error: "Debes seleccionar un cliente"
```
1. Recarga la página (F5)
2. Ve a 👥 Clientes y crea uno
3. Intenta denuevo
```

### Error: "No puedo conectar a Supabase"
```
1. Verifica internet
2. Abre https://supabase.com
3. Verifica que tu proyecto esté verde (online)
4. Recarga app (Ctrl+Shift+R)
```

### Datos desaparecen al recargar
```
1. Abre F12 → Console
2. Busca errores en rojo
3. Si ves "Error: Supabase", verifica conexión
4. Intenta crear el dato nuevamente
```

### Botones deshabilitados (no responden)
```
1. Verifica que sea usuario Premium
2. Abre F12 → Console
3. Busca "❌ Validación fallida"
4. Sigue el error sugerido
```

---

## ✨ ¡FELICIDADES!

Si pasaste TODOS los tests:

```
✅ PASO 4 - Testing Manual = COMPLETADO
✅ Sistema Listo para Deploy
✅ 0 Bugs Conocidos
✅ 100% Funcionalidad Verificada
```

**Próximo paso: Agrega Reportes.jsx y prepara Deploy** 🚀
