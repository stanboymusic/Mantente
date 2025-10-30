# ⚡ TODO EN UNA PÁGINA

## 3 PROBLEMAS - 3 SOLUCIONES

| Problema | Estado | Causa | Solución |
|----------|--------|-------|----------|
| Error al crear Nota | ❌ FALLA | Tabla no existe | SQL en Supabase |
| Error al crear Pedido | ❌ FALLA | Tabla no existe | SQL en Supabase |
| Devoluciones se descuentan | ✅ OK | - | Nada |

---

## 🚀 LO QUE DEBES HACER AHORA

### 1️⃣ Abre Supabase
```
https://supabase.com → Tu Proyecto → SQL Editor → New Query
```

### 2️⃣ Copia este SQL COMPLETO

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

### 3️⃣ Presiona Ctrl + Enter
```
Deberías ver: ✅ Query executed successfully
```

### 4️⃣ Recarga la app
```powershell
npm run dev
```

---

## ✅ VERIFICACIONES RÁPIDAS

```
✅ Notas de Entrega: Crea una → Debe tener número ENT-xxxxx
✅ Pedidos: Crea uno → Debe tener número PED-xxxxx
✅ Dashboard: Verifica que Devoluciones se restan
✅ Egresos: Sigue funcionando normalmente
```

---

## 📊 FÓRMULA DE BALANCE (confirmada)

```
Balance Final = Ingresos - Egresos - Gastos Fijos - Deuda - Devoluciones
                  $1000      -$200      -$150       -$50     -$100
                = $500 ✅
```

---

## ⚠️ SI ALGO FALLA

1. Abre consola (F12)
2. Copia el error
3. Avísame con el error exacto
4. Yo voy a revisar

---

## 🎯 RESULTADO

**DESPUÉS de ejecutar el SQL:**

- ✅ Creas Notas de Entrega
- ✅ Creas Pedidos
- ✅ Devoluciones se descuentan
- ✅ Egresos funcionan
- ✅ Todo integrado en Dashboard

---

**Tiempo total**: 5 minutos
**Complejidad**: Baja (solo copiar y pegar SQL)
**Acción**: EJECUTA YA EL SQL EN SUPABASE 🚀