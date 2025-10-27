# ✅ Checklist de Validación - Funcionalidades Premium

## 🎯 Pre-requisitos
- [ ] Usuario premium creado en Supabase
- [ ] Suscripción premium activa (verified)
- [ ] Aplicación funcionando en localhost
- [ ] Sesión iniciada como usuario premium

---

## 📱 PRUEBA 1: Verificar Estado Premium

### En la Navbar
- [ ] Icono Premium (👑) aparece en **color dorado**
- [ ] No hay anuncios AdSense en la página
- [ ] Puedo hacer clic en "Premium" sin error

### En DevTools (F12 → Console)
```javascript
// Ejecuta en consola:
sessionStorage.getItem('isPremium')
// Debe mostrar: true o un objeto con isPremium: true
```

**Resultado esperado:** `true`

---

## 📊 PRUEBA 2: Presupuestos (/presupuestos)

### Crear Presupuesto
- [ ] Cargar página sin alertas de bloqueo
- [ ] Formulario visible con "Nueva Presupuesto"
- [ ] Puedo seleccionar cliente
- [ ] Puedo agregar items con precio unitario
- [ ] Puedo aplicar descuento por item
- [ ] Se calcula total automáticamente
- [ ] Puedo descargar como PDF

### Función esperada
| Campo | Valor de prueba |
|-------|---|
| Cliente | "Test Client" |
| Item 1 | "Producto A" - 10 unidades x $100 = $1,000 |
| Descuento Item | $100 |
| Total esperado | $900 |

---

## 📝 PRUEBA 3: Notas de Entrega (/notas-entrega)

### Crear Nota
- [ ] Cargar página sin alertas de bloqueo
- [ ] Botón "Nueva Nota de Entrega" visible
- [ ] Generar número automático (ENT-{timestamp})
- [ ] Seleccionar cliente
- [ ] Agregar items con descripción
- [ ] Cambiar estado Pendiente → Entregado
- [ ] Exportar a PDF

### Validaciones
- [ ] Número se genera con formato: `ENT-20240115123456`
- [ ] Al cambiar estado, se persiste
- [ ] PDF contiene todos los datos

---

## 🔄 PRUEBA 4: Devoluciones (/devoluciones)

### Crear Devolución
- [ ] Cargar página sin alertas de bloqueo
- [ ] Formulario para registrar devolución
- [ ] Seleccionar número de venta original
- [ ] Ingresar motivo
- [ ] Calcular monto a devolver
- [ ] Ver tabla de devoluciones registradas
- [ ] Botones Aprobar/Rechazar funcionan

### Estado Esperado
- [ ] Nueva devolución: "Pendiente Revisión" (naranja)
- [ ] Después de Aprobar: "Aprobada" (verde)
- [ ] Después de Rechazar: "Rechazada" (rojo)

---

## 📊 PRUEBA 5: Libro de Ventas (/libro-ventas)

### Ver Reporte
- [ ] Cargar página sin alertas de bloqueo
- [ ] Ver tarjetas resumen (Total, Descuentos, Neto, Transacciones)
- [ ] Ver desglose por mes
- [ ] Cada mes muestra sus ventas
- [ ] Botón Exportar a PDF funciona
- [ ] Botón Exportar a CSV funciona

### Datos Esperados (si hay ventas)
```
Mes: Enero 2024
├─ Venta 1: $500
├─ Venta 2: $300
└─ Total Mes: $800
```

---

## 📦 PRUEBA 6: Pedidos (/pedidos)

### Crear Pedido
- [ ] Cargar página sin alertas de bloqueo
- [ ] Formulario para nuevo pedido
- [ ] Seleccionar cliente
- [ ] Seleccionar productos del inventario
- [ ] Cantidad auto-valida stock
- [ ] Ingresar fecha de entrega estimada
- [ ] Ver tabla de pedidos
- [ ] Cambiar estado: Pendiente → Confirmado → Enviado → Entregado

### Validaciones
- [ ] Total se calcula automáticamente
- [ ] Estados se guardan
- [ ] Puedo ver historial de estados

---

## 🔧 PRUEBA 7: Órdenes de Servicio (/ordenes-servicio)

### Crear Orden
- [ ] Cargar página sin alertas de bloqueo
- [ ] Formulario para nueva orden
- [ ] Ingresar descripción del servicio
- [ ] Seleccionar técnico
- [ ] Ingresar costo mano de obra
- [ ] Ingresar costo materiales
- [ ] Total se calcula: MO + Materiales
- [ ] Cambiar estado: Pendiente → En Progreso → Completada

### Validaciones
- [ ] MO: $500, Materiales: $200 → Total: $700
- [ ] Estados se guardan
- [ ] Puedo agregar notas técnicas

---

## 📄 PRUEBA 8: Facturas - Tipos (/facturas)

### Factura Fiscal
- [ ] Seleccionar "📋 Factura Fiscal"
- [ ] Cliente es **requerido**
- [ ] Se genera número con formato: `FAC-000001-{timestamp}`
- [ ] Mostrar impuesto (IVA)
- [ ] Descargar PDF

### Factura Forma Libre
- [ ] Seleccionar "📝 Factura Forma Libre"
- [ ] Cliente es **requerido**
- [ ] Número diferente al fiscal
- [ ] Flexible sin requisitos fiscales

### Ticket
- [ ] Seleccionar "🧾 Ticket"
- [ ] Cliente es **opcional** (consumidor final)
- [ ] Formato simplificado
- [ ] Exportar a PDF

---

## 🔒 PRUEBA 9: Protección Premium

### Probar con Usuario NO Premium
1. [ ] Crear usuario normal (sin premium)
2. [ ] Intentar acceder a `/presupuestos`
3. [ ] Ver alerta: "🔒 Funcionalidad Premium"
4. [ ] No puede ver formulario
5. [ ] Intentar otras rutas premium - mismo resultado

**Resultado esperado:** Alerta de bloqueo en todas las rutas premium

---

## ⚙️ PRUEBA 10: Performance y Ads

### Sin Anuncios (Premium)
- [ ] Navegar por `/presupuestos` - NO ver AdSense
- [ ] Navegar por `/notas-entrega` - NO ver AdSense
- [ ] Navegar por `/pedidos` - NO ver AdSense

### Con Anuncios (Non-Premium)
- [ ] Crear usuario normal
- [ ] Navegar a cualquier sección
- [ ] VER anuncios AdSense

---

## 🔧 Prueba de Datos - Crear esto Primero

### 1. Cliente de Prueba
```
Nombre: Test Client
Email: test@client.com
Teléfono: 1234567890
```

### 2. Producto de Prueba
```
Nombre: Test Product
Precio: $100.00
Stock: 100 unidades
Categoría: Test
```

### 3. Venta de Prueba
```
Cliente: Test Client
Producto: Test Product
Cantidad: 5
Total: $500.00
```

Usar estos en cada prueba para datos consistentes.

---

## 📊 Resultado Final

### ✅ SI TODO PASÓ:
```
Premium Funcional: ✅
- 6 nuevas funciones disponibles
- Sin anuncios
- Suscripción activa por 30 días
- Protección de funcionalidades correcta
```

### ❌ SI ALGO FALLA:

**Problema:** Alerta de "🔒 Funcionalidad Premium" incluso siendo Premium
**Solución:**
1. F5 (recarga)
2. Logout y login nuevamente
3. Verifica en Supabase que `status = 'active'` y fecha `current_period_end > now()`

**Problema:** No puedo cargar la página
**Solución:**
1. Abre DevTools (F12)
2. Busca errores en Console
3. Verifica que las rutas existen: `/presupuestos`, `/notas-entrega`, etc.

**Problema:** Error "componente no encontrado"
**Solución:**
1. Verifica que los archivos existen en `src/components/`
2. Verifica que están importados en `App.jsx` con `React.lazy()`

---

## 📋 Envío de Reporte

Si todo funciona, genera reporte:

```markdown
✅ VALIDACIÓN COMPLETADA - Premium Funcional

Pruebas Pasadas:
- Presupuestos: ✅
- Notas Entrega: ✅
- Devoluciones: ✅
- Libro Ventas: ✅
- Pedidos: ✅
- Órdenes Servicio: ✅
- Protección Premium: ✅
- Sin Anuncios: ✅

Total: 8/8 ✅

Fecha: [DATE]
Usuario: [EMAIL]
Navegador: [BROWSER]
```

---

**¿Necesitas ayuda?** Revisa los archivos:
- `RESUMEN_ACTUALIZACION_PREMIUM.md`
- `GUIA_USUARIO_PREMIUM_PRUEBA.md`