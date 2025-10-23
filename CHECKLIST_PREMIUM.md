# ✅ Checklist - Sistema Premium con PayPal

## 📋 Estado Actual

| Tarea | Estado | Archivo |
|-------|--------|---------|
| Tabla Supabase creada | ✅ HECHO | BD |
| AppContext actualizado | ✅ HECHO | `src/context/AppContext.jsx` |
| Premium.jsx con PayPal | ✅ HECHO | `src/components/Premium.jsx` |
| AdSpace mejorado | ✅ HECHO | `src/components/AdSpace.jsx` |
| Script PayPal en HTML | ✅ HECHO | `index.html` |
| **Client ID PayPal** | ⏳ PENDIENTE | `index.html` |

---

## 🔴 ACCIÓN REQUERIDA AHORA

### 1. Obtener Client ID PayPal
```
Sitio: https://developer.paypal.com/dashboard/
1. Inicia sesión / Crea cuenta
2. Apps & Credentials → Sandbox
3. Copia Client ID (empieza con "AXz..." o similar)
```

### 2. Reemplazar en index.html

**Abre:** `mantente-app/index.html`

**Busca esta línea (línea 12):**
```html
<script src="https://www.paypal.com/sdk/js?client-id=YOUR_PAYPAL_CLIENT_ID&vault=true&intent=subscription"></script>
```

**Reemplaza `YOUR_PAYPAL_CLIENT_ID` con tu Client ID:**
```html
<script src="https://www.paypal.com/sdk/js?client-id=AXz1234567890abcdefghijk&vault=true&intent=subscription"></script>
```

---

## 🧪 Después de configurar

### Prueba en Desarrollo
```bash
npm run dev
```

1. Ve a `http://localhost:5173/premium`
2. **Sin login:** Deberías ver beneficios + botones azules de PayPal
3. **Con login:** 
   - Si NO es premium: Botones de PayPal
   - Si SÍ es premium: Mostrar "¡Eres Premium!"

### Prueba de Pago (Sandbox)
1. Haz click en PayPal button
2. Usa cuenta: `sandbox@example.com` / `123456`
3. Completa el pago de prueba
4. **Verifica en Supabase:**
   - Tabla `premium_subscriptions`
   - Nuevo registro con tu user_id
   - Status: 'active'

---

## 🚀 Deployment a Vercel

```bash
cd mantente-app
git add .
git commit -m "Add Premium system with PayPal integration"
git push
```

Vercel detectará cambios y hará redeploy automáticamente.

---

## 📊 Después del Deploy

1. **Verifica en producción:**
   - Ve a https://mantente-pro.vercel.app/premium
   - Confirma que PayPal buttons aparecen
   - Haz una compra de prueba (si usas Sandbox)

2. **Funcionalidades Automáticas:**
   - ✅ Anuncios se ocultan para usuarios premium
   - ✅ Estado se verifica al login
   - ✅ Fecha de expiración se valida automáticamente

3. **Cambiar a Live (Producción Real):**
   - Obtén Client ID de **Live** en PayPal Dashboard
   - Reemplaza en `index.html` (o variable de entorno)
   - Redeploy

---

## 💾 Archivos Creados

```
proyecto mantente/
├── premium_subscriptions_schema.csv      ← Estructura BD
├── PAYPAL_SETUP.md                       ← Guía PayPal
├── PREMIUM_IMPLEMENTATION.md             ← Documentación técnica
├── CHECKLIST_PREMIUM.md                  ← Este archivo
└── mantente-app/
    ├── index.html                        ← Script PayPal (actualizado)
    ├── src/
    │   ├── context/
    │   │   └── AppContext.jsx            ← +Premium functions
    │   └── components/
    │       ├── Premium.jsx               ← Nuevo sistema PayPal
    │       └── AdSpace.jsx               ← Oculta anuncios si premium
```

---

## 🎯 Beneficios que Muestra

Cuando el usuario ve la página Premium, verá estos beneficios:

1. 🚫 **Cero Anuncios** - Experiencia limpia sin distracciones
2. 📢 **Alertas de Stock Bajo** - Notificaciones automáticas
3. 🎁 **Creación de Ofertas** - Descuentos temporales
4. 📊 **Reportes Avanzados** - Exportar PDF/CSV
5. 🎨 **Estadísticas en Tiempo Real** - Dashboards mejorados
6. 💪 **Soporte Prioritario** - Ayuda dedicada
7. ❤️ **Principalmente para apoyar al creador** - Mensaje importante

---

## ❓ Preguntas Frecuentes (Mostradas en la App)

**P: ¿Cuándo se cobra?**
R: El primer día de cada mes

**P: ¿Puedo cancelar en cualquier momento?**
R: Sí, mantienes acceso hasta fin del período

**P: ¿Hay reembolso?**
R: No, pero puedes cancelar para evitar cobros futuros

---

## 🆘 Si algo no funciona

### PayPal buttons no aparecen
```
✓ Verifica Client ID correcto en index.html
✓ Abre F12 (consola) busca errores de red
✓ Verifica que script está en <head>
```

### Pago se procesa pero no se guarda
```
✓ Verifica que user_id no sea null (debes estar logueado)
✓ Verifica tabla premium_subscriptions existe
✓ Abre F12 consola, busca errores de Supabase
```

### El usuario NO ve estado premium después de comprar
```
✓ Recarga la página (F5)
✓ Verifica que checkPremiumStatus se ejecutó
✓ Ve a Supabase, confirma que registro existe
✓ Verifica current_period_end > ahora
```

---

## ✨ Validación Final Antes de Deploy

Verifica estos puntos antes de hacer `git push`:

- [ ] Client ID reemplazado en `index.html`
- [ ] `npm run dev` ejecuta sin errores
- [ ] Botones PayPal aparecen en `/premium`
- [ ] Tabla `premium_subscriptions` existe en Supabase
- [ ] Probaste compra en Sandbox (opcional pero recomendado)
- [ ] Anuncios desaparecen para usuario premium

---

## 🎉 ¡Listo!

Cuando completes estos pasos:
1. **Google AdSense:** ✅ Páginas legales implementadas
2. **Premium:** ✅ Sistema de pagos operacional
3. **Anuncios:** ✅ Se ocultan para premium
4. **Deploy:** ✅ Listo para Vercel

**Próximo paso: Reemplaza Client ID en index.html y prueba**