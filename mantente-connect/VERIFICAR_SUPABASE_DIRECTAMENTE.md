# 🔍 Verificar Datos en Supabase Directamente

## Objetivo
Confirmar si los datos se están guardando realmente en Supabase o si hay un error silencioso.

---

## Método 1: Usar Dashboard de Supabase (MÁS FÁCIL)

### Paso 1: Abre Supabase
1. Ve a https://app.supabase.com
2. Inicia sesión
3. Selecciona tu proyecto

### Paso 2: Revisa la tabla `customers`
1. En el menú izquierdo, ve a **Tabla Editor** (Table Editor)
2. Busca la tabla `customers`
3. Haz click en ella

### Paso 3: Busca el cliente ADRC producciones
1. Debería estar en la lista
2. Revisa la columna `name` - debe decir "ADRC producciones"
3. **Verifica el `user_id`** - debe ser el ID de tu usuario

### Paso 4: ¿Lo ves?

**SÍ, lo veo:**
→ Los datos SÍ se sincronizaron a Supabase  
→ El problema es por qué Mantente no lo carga  

**NO, no está:**
→ Los datos NO se están guardando en Supabase  
→ Hay un error silencioso en la sincronización

---

## Método 2: Verificar con SQL Query

Si prefieres usar SQL:

### Paso 1: Abre SQL Editor
1. En Supabase, ve a **SQL Editor** (en el menú izquierdo)
2. Haz click en **+ New Query**

### Paso 2: Ejecuta esta query
```sql
SELECT * FROM customers 
WHERE name LIKE '%ADRC%' 
ORDER BY created_at DESC 
LIMIT 5;
```

### Paso 3: Verifica el resultado
- ¿Ves filas? → El cliente está en Supabase
- ¿No ves filas? → El cliente NO está en Supabase

### Paso 4: Para ver TODOS los clientes de tu usuario
```sql
SELECT id, user_id, name, email, phone, created_at
FROM customers 
WHERE user_id = 'TU_USER_ID_AQUI'
ORDER BY created_at DESC;
```

---

## Método 3: Verificar RLS Policies (Permisos)

Si el cliente está en la tabla pero Mantente no lo ve, podría ser un problema de permisos.

### Paso 1: Ve a Autenticación
1. Abre Supabase
2. Ve a **Autenticación** → **Políticas** (Policies)
3. Busca la tabla `customers`

### Paso 2: Revisa las políticas
Debería haber políticas que permitan:
- **SELECT** - Para leer tus clientes
- **INSERT** - Para crear clientes
- **UPDATE** - Para editar clientes

**Si NO hay una política de SELECT, Mantente no verá tus clientes incluso si están en la tabla.**

---

## Lo Que Buscar

### 1. ¿Está el cliente en la tabla?
```
✅ SÍ - Cliente "ADRC producciones" está en la tabla `customers`
✅ SÍ - El user_id coincide con tu usuario
✅ SÍ - Tiene todos los datos (name, email, phone, etc.)

❌ NO - La tabla `customers` está vacía
❌ NO - El cliente no aparece aunque sync dice "exitoso"
```

### 2. ¿Hay políticas correctas?
```
✅ SÍ - Hay una política "SELECT" que permite leer datos
✅ SÍ - La política verifica que user_id = auth.uid()

❌ NO - No hay política de SELECT
❌ NO - La política no filtra por user_id
```

### 3. ¿Qué dice el user_id?
```
✅ BIEN - user_id = "123e4567-e89b-12d3-a456-426614174000" (match con tu user_id)

❌ MAL - user_id = NULL
❌ MAL - user_id = "uuid incorrecto"
❌ MAL - user_id = ""
```

---

## CHECKLIST COMPLETO

- [ ] Abrí Supabase
- [ ] Fui a tabla `customers`
- [ ] Busqué "ADRC producciones"
- [ ] ¿Lo encontré?
  - [ ] SÍ → Ir a próximo paso
  - [ ] NO → El problema está en la sincronización
- [ ] Verifiqué el `user_id` del cliente
  - [ ] Coincide con mi usuario → OK
  - [ ] NO coincide → Problema encontrado
- [ ] Revisé políticas de RLS
  - [ ] Hay política SELECT → OK
  - [ ] NO hay → Problema encontrado

---

## Resultados Posibles

### Resultado 1: Cliente ESTÁ en Supabase ✅
```
Cliente: ADRC producciones
user_id: 123e4567-e89b-12d3-a456-426614174000
email: ...
phone: ...
created_at: 2024-11-05 15:16:00
```

**Significado:** La sincronización SÍ funcionó.  
**Problema:** Mantente no está cargando correctamente desde Supabase.

**Solución:** El problema está en `loadDataFromSupabase()` en mantente-app

### Resultado 2: Cliente NO está en Supabase ❌
```
No rows returned
```

**Significado:** La sincronización falló silenciosamente.  
**Problema:** Los datos se guardan localmente pero NO llegan a Supabase.

**Solución:** Aumentar debugging en `supabaseService.js`

### Resultado 3: RLS Policies Incorrectas ⚠️
```
La tabla `customers` NO tiene política SELECT
O
La política SELECT no filtra por user_id
```

**Significado:** Aunque los datos estén en Supabase, no puedes verlos.  
**Problema:** Configuración de seguridad incompleta.

**Solución:** Crear políticas RLS correctas

---

## 📝 Qué Reportar

Después de verificar en Supabase, cuéntame:

1. **¿El cliente está en la tabla `customers`?** (Sí/No)
2. **¿El `user_id` es correcto?** (Sí/No)
3. **¿Hay políticas RLS?** (Sí/No)
4. **¿Mantente lo ve?** (Sí/No)

Con esa información sabré exactamente dónde está el problema. 🎯
