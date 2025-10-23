# 🔐 Configuración de PayPal para Mantente Premium

## Paso 1: Crear Cuenta PayPal Developer
1. Ve a https://developer.paypal.com/dashboard/
2. Crea una cuenta PayPal si no tienes
3. Inicia sesión en el Dashboard

## Paso 2: Obtener Client ID
1. En el Dashboard, ve a **Apps & Credentials**
2. Selecciona **Sandbox** (para pruebas) o **Live** (para producción real)
3. Busca tu **Client ID** en la sección de aplicaciones
4. Cópialo

## Paso 3: Configurar en la App

### Opción A: Variable de Entorno (.env.local)
```
VITE_PAYPAL_CLIENT_ID=YOUR_CLIENT_ID_HERE
```

Luego en `index.html`, cambia:
```html
<script src="https://www.paypal.com/sdk/js?client-id=YOUR_PAYPAL_CLIENT_ID&vault=true&intent=subscription"></script>
```

A:
```html
<script src="https://www.paypal.com/sdk/js?client-id=${import.meta.env.VITE_PAYPAL_CLIENT_ID}&vault=true&intent=subscription"></script>
```

### Opción B: Directamente en index.html (Fácil para desarrollo)
Solo reemplaza `YOUR_PAYPAL_CLIENT_ID` con tu Client ID:
```html
<script src="https://www.paypal.com/sdk/js?client-id=AXz1234567890abcdef&vault=true&intent=subscription"></script>
```

## Paso 4: Crear Plan de Suscripción (Opcional pero Recomendado)

Si quieres que PayPal maneje la renovación automática, crea un plan:

1. En el Dashboard PayPal → **Recurring Billing**
2. Ve a **Plans**
3. Crea un nuevo plan:
   - **Nombre:** Mantente Premium Monthly
   - **Precio:** $70 USD
   - **Billing Cycle:** Monthly
   - **Plan ID:** Cópialo

4. Luego en Premium.jsx, cambia:
```javascript
plan_id: "mantente-premium-monthly", // Tu Plan ID aquí
```

## Paso 5: Probar en Sandbox

### Cuentas de prueba:
- **Comprador:** sandbox@example.com / Password: 123456
- **Vendedor:** seller@example.com / Password: 123456

> ⚠️ Estas son cuentas automáticas del Sandbox. Los datos aparecen en tu Dashboard.

## Paso 6: Ir a Producción

Una vez todo funcione:
1. En el Dashboard PayPal, cambia a **Live**
2. Copia el Client ID en **Live**
3. Reemplaza el Client ID en `index.html`
4. Haz deploy a Vercel

## ✅ Verificación

Después de configurar, en el navegador:
1. Ve a la página de Premium
2. Deberías ver botones azules de PayPal
3. Intenta hacer una compra de prueba (en Sandbox)

## 🆘 Troubleshooting

**Problema:** No aparecen botones de PayPal
- ✅ Verifica que el Client ID sea correcto
- ✅ Verifica que el script esté en `<head>`
- ✅ Abre la consola (F12) y busca errores

**Problema:** Error de CORS
- ✅ Usa siempre `https://www.paypal.com/sdk/js`
- ✅ No modificar el script manualmente

**Problema:** Pago no se guarda en BD
- ✅ Verifica que el user_id no sea null
- ✅ Verifica que el usuario esté autenticado

## 📚 Recursos

- [PayPal Developer](https://developer.paypal.com/)
- [PayPal Subscription Docs](https://developer.paypal.com/docs/checkout/integrate/)
- [Supabase Storage](https://supabase.io/)