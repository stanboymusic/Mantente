# ✅ CHECKLIST - Ejecutar SQL Paso a Paso

## 🎯 Meta Final

**Cambiar tabla devoluciones de SIMPLE a INTELIGENTE**

De esto:
```
id, owner, codigo_venta, monto, cantidad, razon, cliente, 
producto, fecha, estado, created_at, updated_at
```

A esto:
```
+ tipo_resolucion        (Reembolso/Cambio/Canje/Pérdida)
+ estado_producto        (Buen estado/Dañado/Parcialmente dañado)
+ producto_nuevo, cantidad_nueva, precio_nuevo, diferencia_precio
+ tiene_cambio_proveedor, referencia_canje
+ id_ingreso, id_egreso
+ fecha_procesada, procesada_por, notas_adicionales

+ NUEVA TABLA: averias
```

---

## 📋 ANTES DE EMPEZAR

- [ ] Estoy en Supabase.com (logeado)
- [ ] Tengo mi proyecto Mantente abierto
- [ ] He copié el archivo `MEJORAR_DEVOLUCIONES_Y_AVERIAS.sql`

---

## 🚀 PASO 1: Abre Supabase

- [ ] Ve a **https://supabase.com**
- [ ] Haz login con tu cuenta
- [ ] Selecciona el proyecto **Mantente** (o el que uses)
- [ ] Espera a que cargue

**Vista esperada:**
```
Dashboard > Mantente ▼
│
├─ Home
├─ SQL Editor ← AQUÍ
├─ Tables
├─ Documentation
```

---

## 🔧 PASO 2: Abre SQL Editor

En el panel izquierdo:

- [ ] Busca **SQL Editor** (o busca con Ctrl+K)
- [ ] Haz click en **SQL Editor**

**Vista esperada:**
```
┌─────────────────────────────┐
│ SQL Editor                  │
│                             │
│ + New Query                 │
│                             │
│ [Query 1]  [Query 2]  [Query 3]
│                             │
│ [Editor vacío]              │
└─────────────────────────────┘
```

---

## ✏️ PASO 3: Crea Nueva Query

- [ ] Haz click en **"+ New Query"** (esquina arriba a la izquierda)
- [ ] Se abrirá una pestaña nueva

**Vista esperada:**
```
New Query | Query 1 | Query 2
    ↑
    └─ Nueva pestaña vacía
```

---

## 📄 PASO 4: Copia el SQL

- [ ] Abre este archivo: **`MEJORAR_DEVOLUCIONES_Y_AVERIAS.sql`**
- [ ] Selecciona TODO (Ctrl+A)
- [ ] Copia (Ctrl+C)

**Tip**: El archivo tiene ~250 líneas. Verifica que copias TODO, no solo una parte.

---

## 📌 PASO 5: Pega en Supabase

- [ ] Haz click en el editor de SQL (el recuadro vacío)
- [ ] Pega el contenido (Ctrl+V)

**Vista esperada:**
```
┌────────────────────────────────────┐
│ Editor SQL                          │
│                                     │
│ -- =============================   │
│ -- 🚀 PASO 1: MEJORAR...          │
│ -- =============================   │
│ ALTER TABLE devoluciones ADD...    │
│ ...                                │
│ ...  (muchas líneas)               │
│                                     │
│ [Run] [Save] [Format]              │
└────────────────────────────────────┘
```

---

## ▶️ PASO 6: Ejecuta el Script

Tienes 2 opciones:

### Opción A: Botón "Run" (recomendado)
- [ ] Haz click en el botón **"Run"** (triángulo verde, esquina derecha)

### Opción B: Teclado
- [ ] Presiona **Ctrl + Enter**

**Vista esperada mientras se ejecuta:**
```
⏳ Running query...
```

---

## 🎉 PASO 7: Verifica Éxito

Deberías ver uno de estos mensajes:

### ✅ ÉXITO (Lo que esperamos)
```
✅ Success. No rows returned.
```

O simplemente:
```
Success
```

### ⚠️ ADVERTENCIA (Probablemente OK)
```
⚠️ Relation "devoluciones" already has this column defined.
Success.
```

Esto significa que ya había ejecutado el script antes. **¡No hay problema!**

### ❌ ERROR (Debes revisar)
```
ERROR: relation "devoluciones" does not exist
```

Si ves esto: Ve al **PASO 10: Solucionar Errores**

---

## 📊 PASO 8: Verificación Visual #1 - Ver Campos

Crea una **nueva query** (sin borrar la anterior):

- [ ] Haz click en **"+ New Query"**
- [ ] Copia esto:

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'devoluciones' 
ORDER BY ordinal_position;
```

- [ ] Haz click **Run** (Ctrl + Enter)

**Deberías ver:**

Una tabla con ~24 filas (columnas):

```
column_name                    data_type
───────────────────────────────────────────────
id                            bigint
owner                         uuid
codigo_venta                  character varying
monto                         numeric
cantidad                      integer
...
tipo_resolucion               character varying  ← NUEVO ✨
estado_producto               character varying  ← NUEVO ✨
producto_nuevo                character varying  ← NUEVO ✨
cantidad_nueva                integer             ← NUEVO ✨
precio_nuevo                  numeric             ← NUEVO ✨
diferencia_precio             numeric             ← NUEVO ✨
tiene_cambio_proveedor        boolean             ← NUEVO ✨
referencia_canje              character varying  ← NUEVO ✨
id_ingreso                    bigint              ← NUEVO ✨
id_egreso                     bigint              ← NUEVO ✨
fecha_procesada               timestamp           ← NUEVO ✨
procesada_por                 uuid                ← NUEVO ✨
notas_adicionales             text                ← NUEVO ✨
created_at                    timestamp
updated_at                    timestamp
```

✅ Si ves todos los campos NUEVOS, significa que **funciona**.

---

## 📊 PASO 9: Verificación Visual #2 - Tabla Averias

Nueva query:

- [ ] Haz click en **"+ New Query"**
- [ ] Copia esto:

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'averias' 
ORDER BY ordinal_position;
```

- [ ] Haz click **Run**

**Deberías ver:**

Una tabla con ~13 columnas:

```
column_name              data_type
────────────────────────────────────────
id                      bigint
owner                   uuid
id_devolucion           bigint
producto                character varying
descripcion             text
estado                  character varying
proveedor               character varying
referencia_canje        character varying
fecha_reporte           date
fecha_resolucion        date
monto_perdida           numeric
notas                   text
created_at              timestamp
updated_at              timestamp
```

✅ Si ves todos estos campos, la tabla **averias está creada**.

---

## 🔐 PASO 10: Verificación Visual #3 - RLS

Nueva query:

- [ ] Haz click en **"+ New Query"**
- [ ] Copia esto:

```sql
SELECT tablename, indexname 
FROM pg_indexes 
WHERE tablename = 'devoluciones' 
OR tablename = 'averias'
ORDER BY tablename;
```

- [ ] Haz click **Run**

**Deberías ver:**

Varios índices para ambas tablas (mínimo 6):

```
tablename      indexname
─────────────────────────────────────────────
averias        idx_averias_estado
averias        idx_averias_fecha_reporte
averias        idx_averias_id_devolucion
averias        idx_averias_owner
devoluciones   idx_devoluciones_estado_producto
devoluciones   idx_devoluciones_fecha_procesada
... (más)
```

✅ Si ves los índices, significa que **todo está optimizado**.

---

## 🚨 PASO 11: Solucionar Errores

### Error #1: "relation 'devoluciones' does not exist"

**Causa**: La tabla devoluciones no existe en tu BD

**Solución**:
1. Ve a la pestaña **Tables** (panel izquierdo)
2. Busca **devoluciones**
3. Si NO está, ejecuta primero: `CREAR_TABLAS_SUPABASE_FINAL.sql`
4. Luego intenta de nuevo

### Error #2: "Column already exists"

**Causa**: Ya ejecutaste el script antes

**Solución**: ¡NO HAY PROBLEMA! Significa que ya está listo. Continúa con el Paso 8.

### Error #3: "Permission denied"

**Causa**: Tu usuario no tiene permisos para hacer ALTER TABLE

**Solución**:
1. Cierra sesión en Supabase
2. Abre un navegador anónimo
3. Inicia sesión nuevamente
4. Intenta de nuevo

O:
1. Contacta al admin del proyecto Supabase
2. Pídele que ejecute el script

### Error #4: "new row violates row level security policy"

**Causa**: RLS está habilitado pero no correctamente

**Solución**: Es raro. Intenta recargar: Ctrl+Shift+R (fuerza recarga)

---

## 🎊 PASO 12: Confirmación Final

- [ ] ✅ Paso 1-7 completados sin error
- [ ] ✅ Paso 8 mostró ~24 campos (incluyendo nuevos)
- [ ] ✅ Paso 9 mostró tabla averias con ~13 campos
- [ ] ✅ Paso 10 mostró índices creados

**Si todo está ✅**, entonces:

```
┌──────────────────────────────────────┐
│ ✨ ¡BD LISTA PARA DEVOLUCIONES! ✨  │
│                                      │
│ Tabla devoluciones: ✅ Mejorada      │
│ Tabla averias:      ✅ Creada        │
│ Índices:            ✅ Optimizados   │
│ RLS:                ✅ Configurado   │
└──────────────────────────────────────┘
```

---

## 🎯 Próximo Paso

Ahora que la BD está lista, vamos a **PASO 2: Backend**

Crearemos en `AppContext.jsx`:
- Función `procesarDevolucion()`
- Función `crearAveria()`
- Lógica de cálculos automáticos

**Estimado**: ~30-40 líneas de código

---

## 📞 Ayuda

Si algo no funciona:

1. **Describe exactamente qué error ves**
2. **Copia el error completo** (puede estar en rojo)
3. **Cuéntame qué paso fallò** (ej: Paso 8, Paso 11, etc.)
4. **Avísame** y lo arreglamos juntos

¡Adelante! 🚀