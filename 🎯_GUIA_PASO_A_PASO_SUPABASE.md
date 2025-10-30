# 🎯 GUÍA VISUAL PASO A PASO - SUPABASE

## 🚀 OBJETIVO

Crear 2 tablas en Supabase:
- ✅ `notas_entrega` → Para notas de entrega
- ✅ `pedidos` → Para pedidos

**Tiempo**: 5 minutos
**Dificultad**: Muy fácil (solo copiar y pegar)

---

## PASO 1: ABRE SUPABASE

```
1. Ve a: https://supabase.com
2. Haz login con tu cuenta
3. Selecciona tu proyecto "Mantente"
```

**Deberías ver:**
```
Dashboard → SQL Editor
```

---

## PASO 2: ABRE SQL EDITOR

```
1. Click en la sidebar: "SQL Editor"
2. Click en "New Query" (botón azul)
```

**Deberías ver:**
```
Un editor de código vacío donde puedes escribir SQL
```

---

## PASO 3: COPIA TODO ESTE SQL

**IMPORTANTE**: Copia TODO de aquí hasta la siguiente línea de separación.

```sql
-- ✅ CREAR TABLA: notas_entrega
CREATE TABLE IF NOT EXISTS public.notas_entrega (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  owner UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  numero_nota TEXT NOT NULL,
  cliente TEXT NOT NULL,
  items JSONB NOT NULL DEFAULT '[]',
  observaciones TEXT,
  fecha_entrega DATE NOT NULL,
  estado TEXT DEFAULT 'pendiente',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notas_entrega_owner ON public.notas_entrega(owner);
CREATE INDEX IF NOT EXISTS idx_notas_entrega_fecha ON public.notas_entrega(fecha_entrega);

-- ✅ CREAR TABLA: pedidos
CREATE TABLE IF NOT EXISTS public.pedidos (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  owner UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  numero_pedido TEXT NOT NULL UNIQUE,
  cliente TEXT NOT NULL,
  items JSONB NOT NULL DEFAULT '[]',
  total NUMERIC(10, 2) DEFAULT 0,
  estado TEXT DEFAULT 'pendiente',
  fecha_entrega_estimada DATE,
  observaciones TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pedidos_owner ON public.pedidos(owner);
CREATE INDEX IF NOT EXISTS idx_pedidos_numero ON public.pedidos(numero_pedido);

-- ✅ POLÍTICA RLS PARA notas_entrega
ALTER TABLE public.notas_entrega ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS notas_entrega_select ON public.notas_entrega;
DROP POLICY IF EXISTS notas_entrega_insert ON public.notas_entrega;
DROP POLICY IF EXISTS notas_entrega_update ON public.notas_entrega;
DROP POLICY IF EXISTS notas_entrega_delete ON public.notas_entrega;

CREATE POLICY notas_entrega_select ON public.notas_entrega
  FOR SELECT USING (auth.uid() = owner);

CREATE POLICY notas_entrega_insert ON public.notas_entrega
  FOR INSERT WITH CHECK (auth.uid() = owner);

CREATE POLICY notas_entrega_update ON public.notas_entrega
  FOR UPDATE USING (auth.uid() = owner);

CREATE POLICY notas_entrega_delete ON public.notas_entrega
  FOR DELETE USING (auth.uid() = owner);

-- ✅ POLÍTICA RLS PARA pedidos
ALTER TABLE public.pedidos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS pedidos_select ON public.pedidos;
DROP POLICY IF EXISTS pedidos_insert ON public.pedidos;
DROP POLICY IF EXISTS pedidos_update ON public.pedidos;
DROP POLICY IF EXISTS pedidos_delete ON public.pedidos;

CREATE POLICY pedidos_select ON public.pedidos
  FOR SELECT USING (auth.uid() = owner);

CREATE POLICY pedidos_insert ON public.pedidos
  FOR INSERT WITH CHECK (auth.uid() = owner);

CREATE POLICY pedidos_update ON public.pedidos
  FOR UPDATE USING (auth.uid() = owner);

CREATE POLICY pedidos_delete ON public.pedidos
  FOR DELETE USING (auth.uid() = owner);
```

---

## PASO 4: PEGA EL SQL EN SUPABASE

```
1. En el editor de Supabase, click en el área blanca
2. Ctrl + A (selecciona todo lo que haya)
3. Ctrl + V (pega el SQL que copiaste)
```

**Deberías ver:**
```
El editor lleno de código SQL
```

---

## PASO 5: EJECUTA

```
Presiona: Ctrl + Enter
```

**Espera a que aparezca:**
```
✅ Query executed successfully
```

---

## PASO 6: VERIFICA

```
1. Click en "Table Editor" (sidebar)
2. Deberías ver: "notas_entrega" y "pedidos" en la lista
```

**Si ves ambas tablas:**
```
✅ ¡ÉXITO! Las tablas se crearon
```

**Si ves error:**
```
⚠️ Copia el error exacto y avísame
```

---

## PASO 7: RECARGA LA APP

```powershell
# En PowerShell:
Set-Location "c:\Users\angel\OneDrive\Documents\proyecto mantente\mantente-app"
npm run dev
```

Espera a que veas:
```
Local:   http://localhost:5173
```

---

## PASO 8: PRUEBA

### Prueba 1: Crear Nota de Entrega
```
1. Abre la app
2. Login
3. Click: Premium → Notas de Entrega
4. Click: ➕ Nueva Nota
5. Completa: Cliente, Artículos, Fecha
6. Click: Crear Nota
7. ✅ Deberías ver: "✅ Nota de entrega creada exitosamente"
```

### Prueba 2: Crear Pedido
```
1. Click: Premium → Pedidos
2. Click: ➕ Nuevo Pedido
3. Completa: Cliente, Productos, Cantidades
4. Click: Crear Pedido
5. ✅ Deberías ver: "✅ Pedido creado exitosamente"
6. El pedido aparece con número: PED-1729999999
```

### Prueba 3: Verificar Devoluciones en Balance
```
1. Click: Dashboard
2. Card "↩️ Devoluciones Aprobadas" debe mostrar monto
3. Si hay devoluciones, Balance Final debe estar reducido
4. ✅ Balance = Ingresos - Egresos - Gastos - Deuda - Devoluciones
```

### Prueba 4: Panel de Egresos
```
1. Click: Egresos
2. Crea un egreso: $100
3. Click: Dashboard
4. Card "📉 Egresos" muestra $100
5. Balance Final se reduce en $100
6. ✅ Todo correcto
```

---

## ⚠️ PROBLEMAS COMUNES

### Error: "relation 'notas_entrega' does not exist"
```
Solución: No ejecutaste el SQL en Supabase
→ Repite PASO 3, 4, 5
```

### Error: "syntax error"
```
Solución: Copiar incompleto o con caracteres extraños
→ Copia NUEVAMENTE desde PASO 3
→ Asegúrate de copiar TODO (debe tener ~100 líneas)
```

### La tabla no aparece en "Table Editor"
```
Solución: Recarga Supabase (F5)
→ Luego verifica nuevamente
```

### Sigue diciendo "Error" sin más detalles
```
Solución: Abre la consola en Supabase
→ Click derecha → Inspeccionar → Consola
→ Copia el error que aparece y avísame
```

---

## 🎯 CHECKLIST FINAL

- [ ] Abriste Supabase
- [ ] Entraste a SQL Editor
- [ ] Creaste New Query
- [ ] Copiaste TODO el SQL
- [ ] Pegaste en el editor
- [ ] Ejecutaste (Ctrl + Enter)
- [ ] Viste ✅ Query executed successfully
- [ ] Verificaste que existen las tablas
- [ ] Recargaste npm run dev
- [ ] Probaste crear Nota
- [ ] Probaste crear Pedido
- [ ] Verificaste Devoluciones en Dashboard
- [ ] Verificaste Egresos

---

## 📞 AYUDA

Si algo no funciona:

1. **Abre consola en Supabase** (F12)
2. **Copia el error exacto**
3. **Avísame**
4. **Yo voy a revisar**

---

**¡Vamos!** 🚀

Ejecuta el SQL en Supabase AHORA y luego avísame cuando esté listo.