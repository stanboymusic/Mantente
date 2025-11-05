# 🎯 PLAN DE ACCIÓN - PASO A PASO

## 📋 Resumen
**Problema**: Los datos se agregan localmente pero no se sincronizan con Supabase
**Causa**: La sincronización fallaba silenciosamente
**Solución**: He mejorado el código para mostrar errores claros y asegurar que los datos se envíen correctamente

---

## 🚀 PASOS INMEDIATOS (15 minutos)

### ✅ PASO 1: Verifica que RLS en Supabase está bien
1. Ve a https://app.supabase.com → Tu Proyecto
2. Ve a **SQL Editor**
3. Copia TODO el contenido de: `SQL_VERIFICAR_RLS_PARA_SINCRONIZACION.sql`
4. Pégalo en SQL Editor de Supabase
5. Ejecuta (Ctrl+Enter o botón ▶️)
6. Deberías ver ✅ sin errores

**¿Por qué?** Las políticas de seguridad (RLS) controlan quién puede escribir en las tablas. Si están mal configuradas, la sincronización falla.

### ✅ PASO 2: Reinicia Mantente Connect
```bash
npm run dev
```

### ✅ PASO 3: Abre DevTools (F12 → Console)
Limpiar la consola para ver solo los nuevos mensajes

### ✅ PASO 4: Agrega 1 Producto de Prueba
1. En Mantente Connect
2. Inventario → + Nuevo Producto
3. Nombre: `TEST_SYNC_2025`
4. Cantidad: `1`
5. Precio: `99.99`
6. Descripción: `Producto de prueba`
7. **Guardar**

### ✅ PASO 5: Observa la Consola (muy importante)
Busca estos mensajes:

**🟢 SI VES ESTO = PERFECTO:**
```
🔄 Mapeando producto a formato Mantente: {...}
✅ Producto mapeado: { nombre: "TEST_SYNC_2025", owner: "...", ... }
📤 Insertando en tabla 'inventario': {...}
✅ ÉXITO: Producto creado en Supabase: {...}
📡 Cargando datos iniciales desde Supabase...
✅ Datos cargados de Supabase: 1 productos
✅ Sincronización completada - 1 exitosos, 0 fallidos
```

**🔴 SI VES ESTO = FALLA:**
```
❌ CRÍTICO: El producto NO tiene user_id
O
❌ ERROR de Supabase al crear producto: { code: "...", message: "..." }
O
❌ ERROR: Supabase retornó datos vacíos
```

---

## ✔️ VERIFICACIÓN (¿Funcionó?)

### Test 1: El contador desaparece
- Después de guardar, deberías ver: **"X cambios sin sincronizar"**
- Espera 10-15 segundos
- **¿El contador bajó a 0?**
  - ✅ **SÍ** → Funciona ✨
  - ❌ **NO** → Hay un error, revisa la consola

### Test 2: Aparece en Mantente
- Abre Mantente (otra pestaña)
- Ve a **Inventario**
- **¿Aparece "TEST_SYNC_2025"?**
  - ✅ **SÍ** → La sincronización cruzada funciona ✨
  - ❌ **NO** → Próximo paso de debugging

### Test 3: Persiste al refrescar
- Refresca Mantente Connect (F5)
- **¿Sigue viéndose el producto?**
  - ✅ **SÍ** → Todo funciona perfectamente ✨✨✨
  - ❌ **NO** → Problema con IndexedDB

---

## 🔧 DEBUGGING SI FALLA

### Error: "El producto NO tiene user_id"

**Qué significa**: Tu usuario no está loggeado correctamente

**Solución**:
```
1. En Navbar arriba → Ver si aparece tu email
2. Si NO aparece → Logout y Login de nuevo
3. Si APARECE → Abre DevTools Console y copia esto:
   JSON.parse(localStorage.getItem('auth')).id
4. Debería mostrar un UUID largo como: "550e8400-e29b-41d4-a716-446655440000"
5. Si muestra "undefined" → Hay problema con la autenticación
```

### Error: "permission denied"

**Qué significa**: Las políticas de RLS en Supabase no permiten la escritura

**Solución**:
```
1. Ve a Supabase → SQL Editor
2. Ejecuta esto (todo):
   ALTER TABLE inventario ENABLE ROW LEVEL SECURITY;
   DROP POLICY IF EXISTS "admin_can_create" ON inventario;
   CREATE POLICY "inventario_insert_own" ON inventario
     FOR INSERT WITH CHECK (owner = auth.uid());
   
   ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
   DROP POLICY IF EXISTS "admin_can_create" ON clientes;
   CREATE POLICY "clientes_insert_own" ON clientes
     FOR INSERT WITH CHECK (owner = auth.uid());
3. Reinicia Mantente Connect
4. Intenta agregar el producto de nuevo
```

### Error: "401 Unauthorized"

**Qué significa**: Tu API key de Supabase es inválida

**Solución**:
```
1. Ve a https://app.supabase.com → Tu Proyecto
2. Settings → API → Copia:
   - Project URL (ej: https://xxx.supabase.co)
   - anon key (ej: eyJhbGc...)
3. Abre el archivo: mantente-connect/.env.local
4. Actualiza:
   VITE_SUPABASE_URL=https://xxx.supabase.co
   VITE_SUPABASE_KEY=eyJhbGc...
5. Reinicia: npm run dev
```

---

## 📊 ESTADO ESPERADO DESPUÉS DEL FIX

### Mantente Connect Dashboard debe mostrar:
```
✓ En línea
✓ Base de datos local: Lista
✓ Última sincronización: Hace pocos segundos
✓ 0 cambios pendientes  ← IMPORTANTE
```

Si ves **"X cambios pendientes"** después de 30 segundos:
- Abre DevTools (F12)
- Busca el error rojo
- Busca que tipo de error es en la sección Debugging de arriba

---

## 📝 RESUMEN DE CAMBIOS REALIZADOS

### En `src/services/supabaseService.js`:

1. ✅ **Mapeo mejorado de productos**
   - Ahora incluye `owner` siempre
   - Convierte tipos correctamente (int, float)
   - Preserva timestamps

2. ✅ **Mapeo mejorado de clientes**
   - Ahora incluye `owner` siempre
   - Maneja booleanos correctamente
   - Maneja strings de estado

3. ✅ **Mejor logging en `createProduct()`**
   - Muestra qué se envía a Supabase
   - Muestra si tiene `user_id`
   - Reporta errores de Supabase específicamente
   - Muestra si la respuesta está vacía

4. ✅ **Mejor logging en `createCustomer()`**
   - Lo mismo que productos

5. ✅ **Validación de datos**
   - Rechaza si falta `user_id`
   - Rechaza si Supabase no retorna datos

---

## 🎓 QUÉ APRENDIMOS

| Problema | Causa | Solución |
|----------|-------|----------|
| Datos desaparecen al refrescar | No se sincronizaban | Mejoré logging para ver errores |
| "X cambios sin sincronizar" persiste | Error silencioso en Supabase | Ahora reporta qué falla específicamente |
| No aparecen en Mantente | Falta `owner` en datos | Ahora se incluye siempre |
| RLS bloquea escrituras | Políticas mal configuradas | Script SQL para verificar/arreglar |

---

## ✅ ÉXITO ESPERADO

Cuando funcione:

1. Agregas producto en **Mantente Connect** ✓
2. Se guarda localmente al instante ✓
3. Se intenta sincronizar automáticamente ✓
4. En 10 segundos, "cambios pendientes" → 0 ✓
5. Abres **Mantente** y ves el producto ✓
6. Refrescas Mantente Connect y persiste ✓
7. Todo offline-first + cloud-sync ✓

---

## 🆘 SI SIGUE SIN FUNCIONAR

1. Copia el **error EXACTO** de la consola
2. Ve a la sección "DEBUGGING" de `🔧_DEBUG_SINCRONIZACION_CRITICA.md`
3. Busca tu error específico
4. Sigue la solución

Si tu error no está ahí, es un problema específico que necesito investigar.

---

## 🚀 PRÓXIMOS PASOS

### Cuando funcione ✨
- Agrega más datos de prueba
- Verifica que se sincroniza en tiempo real
- Prueba en otro navegador/dispositivo
- Listo para producción

### Cuando falle 🔧
- Sigue los pasos de Debugging
- Revisa la consola
- Ejecuta el script SQL
- Reinicia la app