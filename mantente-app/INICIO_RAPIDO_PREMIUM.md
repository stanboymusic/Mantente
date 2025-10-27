# ⚡ Inicio Rápido - Premium Actualizado

## 🚀 Lo que se hizo en 5 minutos

✅ **Precio Premium:** $70 → **$20 USD/mes**
✅ **6 nuevas funciones premium:**
1. 📋 **Presupuestos** - Crear presupuestos con descuentos
2. 📝 **Notas Entrega** - Generar notas de entrega
3. 🔄 **Devoluciones** - Gestionar cambios/devoluciones
4. 📊 **Libro Ventas** - Reporte de ventas por mes
5. 📦 **Pedidos** - Gestionar órdenes de clientes
6. 🔧 **Órdenes Servicio** - Órdenes técnicas

✅ **Generador de Facturas mejorado:**
- 📋 Facturas Fiscales
- 📝 Facturas Forma Libre  
- 🧾 Tickets

---

## ⏱️ 30 Segundos: Setup Usuario Premium

### Paso 1: Supabase → Authentication → Add User
```
Email: test-premium@mantente.app
Password: TestPremium123!
```

### Paso 2: Copiar ID del usuario
Se verá algo como: `550e8400-e29b-41d4-a716-446655440000`

### Paso 3: SQL Editor → New Query → Ejecutar
```sql
INSERT INTO public.premium_subscriptions (
  user_id,
  status,
  payment_method,
  transaction_id,
  price,
  billing_cycle_anchor,
  current_period_start,
  current_period_end,
  updated_at,
  created_at
) VALUES (
  'PEGA_EL_ID_AQUI',  -- ← Reemplaza con el ID del paso 2
  'active',
  'test',
  'TEST_' || to_char(now(), 'YYYYMMDDHH24MISS'),
  20.00,
  now(),
  now(),
  now() + interval '30 days',
  now(),
  now()
)
ON CONFLICT (user_id) DO UPDATE SET
  status = 'active',
  current_period_end = now() + interval '30 days',
  updated_at = now();
```

### Paso 4: Login en la app
```
Email: test-premium@mantente.app
Password: TestPremium123!
```

---

## 🧪 Prueba en 60 Segundos

1. **Verifica Premium:**
   - Navega a cualquier página
   - Icono 👑 Premium debe estar en **dorado**
   - NO deberías ver anuncios

2. **Prueba una función:**
   - Ve a `/presupuestos`
   - Haz clic en "Nueva Presupuesto"
   - Completa formulario y guarda
   - Descargar PDF

3. **Verifica protección:**
   - Logout
   - Crea usuario normal
   - Intenta acceder a `/presupuestos`
   - Debe mostrar: "🔒 Funcionalidad Premium"

---

## 📍 Rutas Premium

```
/presupuestos          → Crear presupuestos
/notas-entrega         → Generar notas
/devoluciones          → Registrar devoluciones
/libro-ventas          → Reporte de ventas
/pedidos               → Gestionar órdenes
/ordenes-servicio      → Órdenes técnicas
/facturas              → Facturas + tipos (fiscal/libre/ticket)
```

---

## 🎯 Qué Verificar

| Feature | URL | ✓ Funciona |
|---------|-----|-----------|
| Presupuestos | `/presupuestos` | [ ] |
| Notas Entrega | `/notas-entrega` | [ ] |
| Devoluciones | `/devoluciones` | [ ] |
| Libro Ventas | `/libro-ventas` | [ ] |
| Pedidos | `/pedidos` | [ ] |
| Órdenes Servicio | `/ordenes-servicio` | [ ] |
| Facturas Tipo | `/facturas` | [ ] |
| Sin Anuncios | Navbar | [ ] |
| Protección Premium | No-premium user | [ ] |

---

## 📋 Archivos Importantes

1. **GUIA_USUARIO_PREMIUM_PRUEBA.md** 
   → Guía detallada paso a paso

2. **CHECKLIST_VALIDACION_PREMIUM.md**
   → Todas las pruebas que debes hacer

3. **RESUMEN_ACTUALIZACION_PREMIUM.md**
   → Cambios técnicos en detalle

4. **CREAR_USUARIO_PREMIUM_PRUEBA.sql**
   → SQL listo para copiar

---

## ⚠️ Problemas Comunes

**P: No veo Premium como activo**
R: 
1. F5 (recarga la página)
2. Logout y vuelve a entrar
3. Verifica que el SQL se ejecutó sin errores

**P: Veo "🔒 Funcionalidad Premium" siendo Premium**
R:
1. Verifica que `status = 'active'` en Supabase
2. Verifica que `current_period_end > ahora()`
3. Si la fecha pasó, actualiza con `now() + interval '30 days'`

**P: Error "componente no encontrado"**
R: Verifica que los componentes existen en `src/components/`:
- Presupuestos.jsx
- NotasEntrega.jsx
- Devoluciones.jsx
- LibroVentas.jsx
- Pedidos.jsx
- OrdenesServicio.jsx

---

## 💡 Tips

✨ **Usa datos de prueba:**
```
Cliente: "Test"
Email: "test@test.com"
Producto: "Test Product" - $100
```

✨ **Genera datos para pruebas:**
1. Crea cliente
2. Crea producto  
3. Crea venta
4. Luego prueba todas las funciones premium

✨ **Exporta PDFs para validar:**
- Presupuestos → PDF
- Notas Entrega → PDF
- Libro Ventas → PDF/CSV

---

## 🎉 Al Terminar

1. ✅ Todos los tests pasaron
2. ✅ Usuario premium activo 30 días
3. ✅ 6 funciones nuevas funcionando
4. ✅ Sin anuncios para premium
5. ✅ Protección correcta para no-premium

**Estado:** ✅ **LISTO PARA PRODUCCIÓN**

---

¿Necesitas más detalles? Lee:
- `GUIA_USUARIO_PREMIUM_PRUEBA.md` (paso a paso completo)
- `CHECKLIST_VALIDACION_PREMIUM.md` (pruebas detalladas)