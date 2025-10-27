# 📋 GUÍA: Crear Todas las Tablas en Supabase

## El Problema
El código intenta guardar datos en tabla **`premium_subscriptions`** que **no existe**. Esto es por qué no se guardan los datos premium.

Además faltan otras tablas:
- `presupuestos` (Premium)
- `notas_entrega` (Premium)
- `perfil_empresa`

## La Solución
Vamos a crear **TODAS las tablas de una vez**.

---

## 🚀 PASO A PASO

### PASO 1: Abre Supabase
1. Ve a https://supabase.com
2. Entra a tu proyecto
3. En el menú izquierdo, busca **SQL Editor**
4. Haz click en **"+"** (Nueva Query)

### PASO 2: Copia el SQL
1. En tu proyecto, abre este archivo:
   ```
   mantente-app/CREAR_TODAS_TABLAS_SUPABASE.sql
   ```

2. **Copia TODO el contenido** (Ctrl+A, Ctrl+C)

### PASO 3: Pega en Supabase
1. En Supabase, en el editor SQL que abriste, **pega todo** (Ctrl+V)

2. Tu pantalla debe verse así:
   ```
   CREATE TABLE IF NOT EXISTS premium_subscriptions (
     id BIGSERIAL PRIMARY KEY,
     user_id UUID NOT NULL UNIQUE,
     status VARCHAR(50) DEFAULT 'active' ...
   ```

### PASO 4: Ejecuta
1. Arriba a la derecha, ve al botón **"Run"** (o presiona **Ctrl+Enter**)

2. Espera a que termine (puede tomar 30-60 segundos)

3. Deberías ver:
   ```
   ✅ Success. No rows returned.
   ```

---

## ✅ VERIFICACIÓN

Después de ejecutar, verifica que las tablas se crearon:

1. En Supabase, ve a **Table Editor** (lado izquierdo)
2. Deberías ver estas tablas nuevas:
   - ✅ `premium_subscriptions`
   - ✅ `inventario`
   - ✅ `ventas`
   - ✅ `egreso`
   - ✅ `historialMeses`
   - ✅ `clientes`
   - ✅ `facturas`
   - ✅ `devoluciones`
   - ✅ `presupuestos`
   - ✅ `notas_entrega`
   - ✅ `perfil_empresa`

Si ves todas, ¡listo! ✅

---

## 🔧 Si Hay Error

Si ves un error como:
```
ERROR: relation "xyz" already exists
```

**No importa**, es normal. Significa que la tabla ya existe. Simplemente ejecuta de nuevo, el SQL está diseñado para **saltar tablas que ya existen**.

---

## 💾 Después de Crear las Tablas

1. **Abre una terminal** en tu proyecto:
   ```bash
   cd c:\Users\angel\OneDrive\Documents\proyecto mantente\mantente-app
   npm run dev
   ```

2. **Espera** a que cargue la app

3. **Intenta comprar Premium** con PayPal o **registra una devolución**

4. **Los datos deberían guardarse ahora** ✅

---

## 📊 Estructura de Tablas Creadas

### 💎 premium_subscriptions
Guarda datos de suscripción PayPal:
- `user_id` → Usuario
- `status` → active, cancelled, expired
- `transaction_id` → ID de PayPal
- `current_period_end` → Hasta cuándo es válida la suscripción

### 📦 inventario
Productos disponibles

### 💰 ventas
Registro de ventas con `codigo_venta` (VTA-YYYY-NNNNN)

### ➡️ egreso
Gastos e inversiones

### 📅 historialMeses
Cierre mensual con balance, deuda, etc.

### 👥 clientes
Información de clientes

### 📄 facturas
Facturas emitidas

### 🔄 devoluciones
Registro de devoluciones de productos

### 💼 presupuestos (Premium)
Presupuestos para clientes

### 📦 notas_entrega (Premium)
Notas de entrega de productos

### 🏢 perfil_empresa
Datos de tu negocio

---

## 🎯 Próximos Pasos

1. ✅ Crear todas las tablas en Supabase
2. ✅ Probar guardando datos premium
3. ✅ Si aún no funciona, revisar console de navegador (F12) para errores específicos
4. ✅ Si funciona, ¡celebra! 🎉

---

## ❓ Preguntas Frecuentes

**P: ¿Cuánto tarda en crear las tablas?**
R: 30-60 segundos normalmente

**P: ¿Necesito ejecutar esto para cada usuario?**
R: No, solo una vez en el servidor Supabase

**P: ¿Qué pasa si me equivoco?**
R: Nada, el SQL tiene `IF NOT EXISTS`, así que es seguro re-ejecutar

**P: ¿Puedo agregar más campos después?**
R: Sí, con `ALTER TABLE nombre ADD COLUMN campo tipo;`

---

## 📞 Si Aún Hay Problemas

1. Ve a **Supabase Dashboard**
2. En la tabla `premium_subscriptions`, agrega una fila manualmente:
   - `user_id` → Tu ID de usuario (lo ves en Settings → Account)
   - `status` → "active"
   - `current_period_end` → Fecha futura (ej: 2025-12-31)

3. Luego revisa si aparece en el Dashboard
