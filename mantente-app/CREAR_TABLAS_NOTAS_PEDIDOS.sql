-- ✅ CREAR TABLA: notas_entrega
-- Si ya existe, esto no hará nada. Si no existe, la crea.

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

-- Índices para mejor performance
CREATE INDEX IF NOT EXISTS idx_notas_entrega_owner ON public.notas_entrega(owner);
CREATE INDEX IF NOT EXISTS idx_notas_entrega_fecha ON public.notas_entrega(fecha_entrega);

-- ✅ CREAR TABLA: pedidos (si no existe)
-- Esta tabla almacena los pedidos de forma independiente
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

-- Índices para mejor performance
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

-- ✅ Verificar que las tablas se crearon correctamente
SELECT 
  table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('notas_entrega', 'pedidos');