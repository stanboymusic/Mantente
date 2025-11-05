-- ============================================================================
-- CREAR TABLA RETURNS (Devoluciones)
-- ============================================================================
-- Ejecuta este SQL en: https://supabase.co
-- Dashboard → SQL Editor → Pega todo aquí → Click "Run"
-- ============================================================================

-- ============================================================================
-- TABLA: RETURNS (Devoluciones)
-- ============================================================================
CREATE TABLE IF NOT EXISTS returns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  reason VARCHAR(255),
  quantity_returned INTEGER DEFAULT 0,
  refund_amount DECIMAL(10, 2) DEFAULT 0,
  status VARCHAR(50) DEFAULT 'pending', -- pending, approved, rejected, completed, refunded
  replacement_product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para rendimiento
CREATE INDEX IF NOT EXISTS idx_returns_user_id ON returns(user_id);
CREATE INDEX IF NOT EXISTS idx_returns_order_id ON returns(order_id);
CREATE INDEX IF NOT EXISTS idx_returns_product_id ON returns(product_id);
CREATE INDEX IF NOT EXISTS idx_returns_status ON returns(status);
CREATE INDEX IF NOT EXISTS idx_returns_created_at ON returns(created_at);

-- RLS: Row Level Security
ALTER TABLE returns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_can_view_own_returns" ON returns
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "users_can_create_returns" ON returns
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users_can_update_own_returns" ON returns
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users_can_delete_own_returns" ON returns
  FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger para actualizar updated_at
CREATE OR REPLACE TRIGGER returns_updated_at_trigger
BEFORE UPDATE ON returns
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- FIN
-- ============================================================================