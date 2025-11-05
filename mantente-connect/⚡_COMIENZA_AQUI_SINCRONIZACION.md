# ⚡ COMIENZA AQUÍ - 2 MINUTOS

## El Problema
❌ Agregas datos → Se guardan locales → Desaparecen al refrescar
❌ "6 cambios sin sincronizar" → No baja a 0
❌ No aparecen en Mantente

## La Solución
✅ He mejorado el código para que muestre errores claros
✅ Ahora sincroniza correctamente o te dice qué falla

---

## HAGO AHORA (5 minutos)

### 1️⃣ Ejecuta SQL en Supabase
1. https://app.supabase.com → Tu proyecto
2. SQL Editor (arriba a la izquierda)
3. Abre: `SQL_VERIFICAR_RLS_PARA_SINCRONIZACION.sql` (en mantente-connect/)
4. Copia TODO el contenido
5. Pégalo en SQL Editor
6. Presiona ▶️ para ejecutar
7. Deberías ver ✅ sin errores rojos

> **¿Por qué?** Configura las reglas de seguridad correctas en la base de datos

### 2️⃣ Reinicia la App
```bash
npm run dev
```

### 3️⃣ Abre DevTools
Presiona F12 → Console (pestaña)
Limpia los mensajes viejos

### 4️⃣ Agrega 1 Producto de Prueba
- Mantente Connect → Inventario
- + Nuevo Producto
- Nombre: `TEST`
- Cantidad: `1`
- Precio: `100`
- Guardar

### 5️⃣ Observa la Consola
Deberías ver un mensaje como:

✅ **ÉXITO:**
```
✅ ÉXITO: Producto creado en Supabase
✅ Sincronización completada - 1 exitosos
```

❌ **FALLA:**
```
❌ ERROR de Supabase al crear producto
```

---

## ¿Funcionó?

### ✅ SÍ (Si bajó de "1 cambio" a "0 cambios"):
1. Abre Mantente (otra tab)
2. Ve a Inventario
3. ¿Aparece "TEST"?
   - ✅ **SÍ** → **¡TODO FUNCIONA!** 🎉
   - ❌ NO → Verifica que usas mismo usuario en ambas

### ❌ NO (Si sigue diciendo "1 cambio sin sincronizar"):
1. Abre DevTools (F12)
2. Busca el error rojo
3. Busca ese error en `🔧_DEBUG_SINCRONIZACION_CRITICA.md`
4. Sigue la solución

---

## Errores Comunes y Soluciones Rápidas

| Error | Solución |
|-------|----------|
| `El producto NO tiene user_id` | Haz logout/login |
| `permission denied` | Ejecuta el SQL que te pedí |
| `401 Unauthorized` | Verifica `.env.local` tiene API key correcta |
| `Supabase retornó datos vacíos` | Verifica RLS en Supabase |

---

## Documentación Completa

- 📖 `⚡_ACCIONES_INMEDIATAS.md` - Más detallado
- 🔧 `🔧_DEBUG_SINCRONIZACION_CRITICA.md` - Debugging completo
- 🎯 `🎯_PLAN_DE_ACCION_PASO_A_PASO.md` - Todo paso a paso

---

## TL;DR
1. Ejecuta SQL en Supabase ← **IMPORTANTE**
2. Reinicia app
3. Agrega producto
4. Mira consola
5. Si funciona → Prueba agregar datos reales
6. Si falla → Busca error en guía de debugging

**Listo. Adelante.** ⚡