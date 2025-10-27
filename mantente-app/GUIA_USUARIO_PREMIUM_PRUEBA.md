# 🎯 Guía: Crear Usuario Premium de Prueba

## 📋 Resumen de cambios realizados

✅ **Precio Premium actualizado a $20 USD** (antes $70)
✅ **6 nuevas funciones premium agregadas:**
- 📄 Presupuestos (con descuentos y vigencia)
- 📝 Notas de Entrega
- 🔄 Devoluciones/Cambios
- 📊 Libro de Ventas (reporte)
- 📦 Pedidos (gestión de órdenes)
- 🔧 Órdenes de Servicio

✅ **Mejoras a Generador de Facturas:**
- 📋 Facturas Fiscales
- 📝 Facturas Forma Libre
- 🧾 Tickets

---

## 🚀 PASO 1: Crear Usuario de Prueba en Supabase

1. **Abre Supabase Dashboard**
   - Ve a: https://app.supabase.com
   - Selecciona tu proyecto

2. **Ve a Authentication → Users**
   - Click derecho: "Add user" o botón "Add user"

3. **Completa los datos:**
   - **Email:** `test-premium@mantente.app`
   - **Password:** `TestPremium123!` (o la que prefieras)
   - Deja los demás campos en blanco

4. **Copia el ID del usuario**
   - Se verá algo como: `550e8400-e29b-41d4-a716-446655440000`
   - ⚠️ **GUARDA ESTE ID**, lo necesitarás en el siguiente paso

---

## 🔧 PASO 2: Crear Suscripción Premium en SQL

1. **Abre SQL Editor en Supabase**
   - Ve a: SQL Editor (lado izquierdo)
   - Click en "New Query"

2. **Copia este SQL y reemplaza `USER_ID_AQUI`:**

```sql
BEGIN;

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
  'USER_ID_AQUI',  -- ← REEMPLAZA CON EL ID DEL USUARIO
  'active',
  'test',
  'TEST_MANUAL_PREMIUM_' || to_char(now(), 'YYYYMMDDHH24MISS'),
  20.00,
  now(),
  now(),
  now() + interval '30 days',
  now(),
  now()
)
ON CONFLICT (user_id) DO UPDATE SET
  status = 'active',
  payment_method = 'test',
  price = 20.00,
  current_period_end = now() + interval '30 days',
  updated_at = now();

COMMIT;
```

3. **Ejecuta el SQL (Ctrl + Enter)**

4. **Verifica que se creó correctamente:**

```sql
SELECT 
  user_id,
  status,
  price,
  current_period_start,
  current_period_end
FROM public.premium_subscriptions
WHERE user_id = 'USER_ID_AQUI'
LIMIT 1;
```

---

## 🧪 PASO 3: Prueba en la Aplicación

1. **Inicia sesión con:**
   - Email: `test-premium@mantente.app`
   - Password: `TestPremium123!` (la que usaste)

2. **Verifica que ves Premium activo:**
   - El icono 👑 Premium en la navbar debe estar en **dorado/resaltado**
   - No deberías ver anuncios AdSense

3. **Prueba las nuevas funciones premium:**

   | Función | Ruta | ¿Qué prueba? |
   |---------|------|-------------|
   | Presupuestos | `/presupuestos` | Crear presupuesto con descuentos |
   | Notas Entrega | `/notas-entrega` | Generar nota de entrega y PDF |
   | Devoluciones | `/devoluciones` | Registrar una devolución |
   | Libro Ventas | `/libro-ventas` | Ver reporte de ventas por mes |
   | Pedidos | `/pedidos` | Crear un pedido a cliente |
   | Órdenes Servicio | `/ordenes-servicio` | Crear orden de servicio |
   | Facturas | `/facturas` | Crear factura fiscal/libre/ticket |

4. **Verifica modo no-premium:**
   - Cierra sesión
   - Crea un usuario normal (no premium)
   - Intenta acceder a `/presupuestos` → debe mostrar "🔒 Funcionalidad Premium"

---

## ⚠️ Resolución de Problemas

### ❌ "No me aparece Premium como activo"

**Solución:**
1. Recarga la página (F5)
2. Cierra sesión y vuelve a entrar
3. Abre DevTools (F12) → Console
4. Busca mensajes de error relacionados con `premium_subscriptions`

### ❌ "Error: usuario no encontrado"

**Solución:**
- Verifica que el `user_id` en el SQL sea exactamente igual al ID de Supabase Auth
- Sin espacios en blanco antes/después

### ❌ "Error: tabla no existe"

**Solución:**
- Verifica que la tabla `premium_subscriptions` existe en Supabase
- Si no existe, crea la migración en tu proyecto

---

## 📊 Datos de Prueba Recomendados

Una vez logueado como premium, crea:

### Cliente de prueba:
- Nombre: "Cliente Test"
- Email: "cliente@test.com"
- Teléfono: "123456789"

### Producto de prueba:
- Nombre: "Producto Test"
- Precio: "$50.00"
- Cantidad: "100"

### Venta de prueba:
- Cliente: "Cliente Test"
- Producto: "Producto Test"
- Cantidad: "5"
- Total: "$250.00"

Con estos datos, puedes probar todas las funciones premium.

---

## 🎯 Checklist Final

- [ ] Usuario de prueba creado en Supabase Auth
- [ ] ID de usuario copiado correctamente
- [ ] SQL de suscripción premium ejecutado
- [ ] Usuario aparece como Premium en la app
- [ ] Puedes acceder a `/presupuestos` sin ver alerta de bloqueo
- [ ] Pruebaste al menos 3 funciones premium
- [ ] Verificaste que usuario no-premium ve el alerta "🔒 Funcionalidad Premium"

---

## 💡 Notas Técnicas

- La suscripción premium tiene validez de **30 días** desde ahora
- Puedes cambiar `interval '30 days'` a lo que necesites
- El método de pago aparecerá como `"test"` (no PayPal)
- La suscripción es `"active"` - esto determina si el usuario es premium

---

¿Necesitas ayuda? Revisa los logs en:
- **Console del navegador** (F12 → Console)
- **Supabase Logs** (Dashboard → Logs)