# ⚡ QUICK START - 5 MINUTOS

## 🎯 Objetivo
Ejecutar SQL para ampliar tabla `devoluciones` y crear tabla `averias`

---

## 🚀 PASO A PASO (Literal)

### PASO 1: Ve a Supabase
```
https://supabase.com → Login → Proyecto Mantente
```

### PASO 2: Abre SQL Editor
```
Panel izquierdo → SQL Editor → "+ New Query"
```

### PASO 3: Copia el SQL
```
Abre archivo: MEJORAR_DEVOLUCIONES_Y_AVERIAS.sql
Selecciona TODO (Ctrl+A)
Copia (Ctrl+C)
```

### PASO 4: Pega en Supabase
```
Haz click en editor Supabase
Pega (Ctrl+V)
```

### PASO 5: Ejecuta
```
Presiona: Ctrl+Enter
O haz click: botón "Run" (triángulo verde)
```

### PASO 6: Verifica Resultado
```
Si ves: ✅ Success. No rows returned.
       → TODO BIEN ✅

Si ves: ⚠️ Column already exists
       → No importa, ya estaba hecho ✅

Si ves: ❌ ERROR
       → Envíame el error exacto
```

---

## ✅ VERIFICACIÓN RÁPIDA (Opcional)

**Query 1: Ver campos nuevos**
```sql
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'devoluciones'
ORDER BY ordinal_position;
```
**Debería haber ~24 columnas (incluyendo tipo_resolucion, estado_producto, etc.)**

**Query 2: Ver tabla averias**
```sql
SELECT * FROM averias LIMIT 1;
```
**Debería existir sin errores**

---

## 📊 Lo Que Pasó

**Tabla devoluciones:**
- ❌ 9 campos → ✅ 24 campos
- Agregó: tipo_resolucion, estado_producto, producto_nuevo, cantidad_nueva, precio_nuevo, diferencia_precio, tiene_cambio_proveedor, referencia_canje, id_ingreso, id_egreso, fecha_procesada, procesada_por, notas_adicionales

**Nueva tabla:**
- ✅ Creada tabla `averias` para tracking de daños

---

## 🎉 ¡Listo!

```
Una vez completado:
✅ SQL ejecutado
✅ Campos agregados
✅ Tabla averias creada
✅ BD lista para Backend (PASO 2)
```

---

## 📞 Si Hay Error

Comparte:
1. **El error exacto** que ves
2. **Captura de pantalla** (optional)
3. **En qué paso fallaste** (paso 1-6 arriba)

---

**Próximo:** PASO 2 Backend en AppContext.jsx 🚀