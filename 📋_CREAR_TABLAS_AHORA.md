# 🚨 ESTO ARREGLARÁ TU PROBLEMA DE DATOS PREMIUM

## El Problema
Tu app intenta guardar datos en Supabase, pero **las tablas no existen**.

Cuando compras Premium o registras una devolución, Supabase dice:
```
ERROR: relation "premium_subscriptions" does not exist
```

## La Solución (3 minutos)

### ✅ PASO 1: Copia el SQL
Abre este archivo en tu computadora:
```
c:\Users\angel\OneDrive\Documents\proyecto mantente\mantente-app\CREAR_TODAS_TABLAS_SUPABASE.sql
```

Selecciona todo (Ctrl+A) y copia (Ctrl+C)

### ✅ PASO 2: Ve a Supabase
1. Abre https://supabase.com
2. Entra a tu proyecto
3. En el menú izquierdo: **SQL Editor**
4. Haz click en **"+"** (Nueva Query)

### ✅ PASO 3: Ejecuta el SQL
1. Pega el código (Ctrl+V)
2. Haz click en **"Run"** arriba a la derecha
3. Espera 30-60 segundos
4. Deberías ver: **"Success. No rows returned."**

### ✅ PASO 4: Verifica
En Supabase, ve a **Table Editor** (lado izquierdo).

Deberías ver estas tablas:
- ✅ premium_subscriptions (LA MÁS IMPORTANTE)
- ✅ inventario
- ✅ ventas
- ✅ devoluciones
- ✅ presupuestos
- ✅ notas_entrega
- ✅ Más...

## ✅ LISTO
Ahora ejecuta tu app:
```bash
npm run dev
```

**Y prueba:**
1. Intenta comprar Premium → Debería guardar datos ✅
2. Intenta registrar una devolución → Debería guardar ✅
3. Recarga la página → Los datos siguen ahí ✅

---

## Si Algo Falla

### Error: "relation already exists"
**No es problema**, es normal. Las tablas ya existen. Solo:
1. No hagas nada
2. Continúa al PASO 4

### Error: "syntax error"
Significa que algo de tu SQL está mal. 
**Solución**: Asegúrate de que copiaste TODO el archivo, sin saltar líneas.

### Los datos aún no se guardan
1. Abre tu navegador → **F12** (Consola)
2. Intenta registrar algo
3. Verás un error específico
4. Copia ese error y comparte

---

## ¿Qué Tablas se Crean?

```
premium_subscriptions  ← Suscripción PayPal (LA FALTA ESTA)
inventario
ventas (con codigo_venta)
devoluciones (la que ya creamos)
egreso
historialMeses
clientes
facturas
presupuestos (Premium)
notas_entrega (Premium)
perfil_empresa
```

Todas con **RLS** (Row Level Security) habilitado = cada usuario solo ve SUS datos.

---

## ⏱️ Tiempo Total
- Copiar SQL: 30 segundos
- Ir a Supabase: 30 segundos
- Ejecutar: 1 minuto
- **Total: 2-3 minutos ✅**

## 🎯 Después
Tu app podrá guardar:
✅ Suscripciones Premium
✅ Devoluciones
✅ Todos los datos del negocio

¡A hacerlo! 💪