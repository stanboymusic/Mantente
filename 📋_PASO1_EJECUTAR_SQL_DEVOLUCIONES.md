# 📋 PASO 1: EJECUTAR SQL - Devoluciones Mejoradas

## ⚡ Resumen Rápido

Vamos a **agregar 11 columnas nuevas** a la tabla `devoluciones` y **crear la tabla `averias`**.

✅ **Es SEGURO**: No borra datos, solo agrega campos  
⏱️ **Tiempo**: ~5 segundos  
📊 **Resultado**: Tu BD lista para el sistema inteligente

---

## 🔧 ¿Cómo Ejecutarlo?

### Paso 1: Abre Supabase

1. Ve a https://supabase.com
2. Inicia sesión con tu cuenta
3. Selecciona tu **proyecto Mantente**

### Paso 2: Abre el SQL Editor

1. En el panel izquierdo, busca **SQL Editor**
2. Haz click en **SQL Editor** (o en el ícono `>_`)
3. Haz click en **"New Query"** o en el botón **"+"**

### Paso 3: Copia el SQL

1. Abre este archivo: `MEJORAR_DEVOLUCIONES_Y_AVERIAS.sql`
2. **Copia TODO el contenido**
3. Pégalo en el editor de Supabase

### Paso 4: Ejecuta

1. Presiona **Ctrl + Enter** O
2. Haz click en el botón **"Run"** (triángulo verde)

### Paso 5: Verifica

Deberías ver un mensaje similar a:

```
✅ Success. No rows returned.
```

---

## 🎯 ¿Qué Pasó?

### Campos Agregados a `devoluciones`:

| Campo | Tipo | Para Qué |
|-------|------|----------|
| `tipo_resolucion` | VARCHAR | Reembolso / Cambio / Canje Proveedor / Pérdida |
| `estado_producto` | VARCHAR | Buen estado / Dañado / Parcialmente dañado |
| `producto_nuevo` | VARCHAR | Nombre del producto de reemplazo |
| `cantidad_nueva` | INT | Cantidad del nuevo producto |
| `precio_nuevo` | DECIMAL | Precio unitario del nuevo producto |
| `diferencia_precio` | DECIMAL | Dinero extra que cliente paga (o recibe) |
| `tiene_cambio_proveedor` | BOOLEAN | ¿El proveedor aceptó cambio? |
| `referencia_canje` | VARCHAR | Número de referencia del canje con proveedor |
| `id_ingreso` | BIGINT | Si genera ingreso (cambio más caro) |
| `id_egreso` | BIGINT | Si genera egreso (cambio más barato o pérdida) |
| `fecha_procesada` | TIMESTAMP | Cuándo se procesó |
| `procesada_por` | UUID | Quién la procesó |
| `notas_adicionales` | TEXT | Notas extras |

### Nueva Tabla `averias`:

Registra todos los productos dañados con:
- Estado del daño (Pendiente, Canjeada, Desechada, Reembolsada)
- Información del proveedor
- Fecha de resolución
- Monto de pérdida
- Referencias de canje

---

## ✅ Verificación - Confirma que Funcionó

### Comando 1: Ver campos de devoluciones

Copia esto en un **nuevo Query**:

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'devoluciones' 
ORDER BY ordinal_position;
```

**Deberías ver**: 
- Los 13 campos originales PLUS los 11 nuevos = 24 campos total
- Los campos nuevos en orden (tipo_resolucion, estado_producto, etc.)

### Comando 2: Ver estructura de averias

Copia esto en un **nuevo Query**:

```sql
SELECT * FROM averias LIMIT 1;
```

**Deberías ver**: 
- La tabla existe (aunque vacía)
- Los campos se listan sin error

### Comando 3: Ver las restricciones

```sql
SELECT constraint_name, constraint_type 
FROM information_schema.table_constraints 
WHERE table_name = 'devoluciones';
```

**Deberías ver**: 
- Las restricciones CHECK para `tipo_resolucion` y `estado_producto`

---

## 🚨 Si Hay Error

### Error: "Column already exists"

**Causa**: Ya ejecutaste el script antes  
**Solución**: ¡No hay problema! Significa que ya está listo.

### Error: "Relation does not exist"

**Causa**: La tabla `devoluciones` no existe  
**Solución**: 
1. Ve a tu Supabase
2. Verifica que la tabla existe en la pestaña **Explore**
3. Si no existe, ejecuta primero: `CREAR_TABLAS_SUPABASE_FINAL.sql`

### Error: "Permission denied"

**Causa**: Tu usuario no tiene permisos  
**Solución**: 
1. Usa el usuario **Admin** de Supabase (no el anon key)
2. O contacta al propietario del proyecto

---

## 📊 Ejemplos de Registros

### Ejemplo 1: Reembolso simple

```sql
INSERT INTO devoluciones 
  (owner, codigo_venta, monto, cantidad, cliente, producto,
   tipo_resolucion, estado_producto)
VALUES 
  ('tu-uuid-aqui', 'VTA-2024-001', 50.00, 1, 'Juan Pérez', 'Producto A',
   'Reembolso', 'Buen estado');
```

### Ejemplo 2: Cambio por producto más caro

```sql
INSERT INTO devoluciones 
  (owner, codigo_venta, monto, cantidad, cliente, producto,
   tipo_resolucion, estado_producto, 
   producto_nuevo, cantidad_nueva, precio_nuevo, diferencia_precio)
VALUES 
  ('tu-uuid-aqui', 'VTA-2024-002', 50.00, 1, 'María García', 'Producto A',
   'Cambio', 'Buen estado',
   'Producto B', 1, 80.00, 30.00);  -- Cliente paga 30 más
```

### Ejemplo 3: Daño (Canje con proveedor)

```sql
-- Primero la devolución
INSERT INTO devoluciones 
  (owner, codigo_venta, cliente, producto,
   tipo_resolucion, estado_producto, 
   tiene_cambio_proveedor, referencia_canje)
VALUES 
  ('tu-uuid-aqui', 'VTA-2024-003', 'Carlos López', 'Producto C',
   'Canje Proveedor', 'Dañado',
   TRUE, 'Canje #PO-2024-001');

-- Luego el registro en averias
INSERT INTO averias 
  (owner, id_devolucion, producto, descripcion, estado, 
   proveedor, referencia_canje, monto_perdida)
VALUES 
  ('tu-uuid-aqui', (SELECT id FROM devoluciones ORDER BY id DESC LIMIT 1),
   'Producto C', 'Pantalla rota, proveedor aceptó cambio', 'Canjeada',
   'Proveedor XYZ', 'Canje #PO-2024-001', 75.00);
```

---

## 🎉 ¡Listo!

Una vez completado:

✅ Base de datos lista  
✅ Tablas mejoradas  
✅ RLS configurado  

**Próximo paso**: PASO 2 - Backend (AppContext.jsx)

---

## 📞 Dudas

Si algo no funciona o ves un error rojo en Supabase:

1. **Copia el error exacto** que ves
2. **Verifica el user_id** (debe ser un UUID válido de tu usuario)
3. **Recarga la página** de Supabase
4. **Intenta nuevamente**

Si sigue fallando, avísame y compartimos los detalles.