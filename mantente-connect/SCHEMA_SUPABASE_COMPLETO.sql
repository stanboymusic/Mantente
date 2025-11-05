-- ============================================================================
-- MANTENTE CONNECT - SCHEMA SUPABASE COMPLETO
-- ============================================================================
-- Ejecuta este SQL en: https://supabase.co
-- Dashboard → SQL Editor → Pega todo aquí → Click "Run"
-- ============================================================================

-- ============================================================================
-- 1. TABLA: PRODUCTS (Productos)
-- ============================================================================
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL DEFAULT 0,
  cost DECIMAL(10, 2) DEFAULT 0,
  quantity INTEGER DEFAULT 0,
  category VARCHAR(100),
  image_url TEXT,
  sku VARCHAR(50),
  barcode VARCHAR(50),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para rendimiento
CREATE INDEX IF NOT EXISTS idx_products_user_id ON products(user_id);
CREATE INDEX IF NOT EXISTS idx_products_code ON products(code);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);

-- RLS: Row Level Security
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_can_view_own_products" ON products
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "users_can_create_products" ON products
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users_can_update_own_products" ON products
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users_can_delete_own_products" ON products
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- 2. TABLA: CUSTOMERS (Clientes)
-- ============================================================================
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(20),
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  zip_code VARCHAR(20),
  country VARCHAR(100),
  tax_id VARCHAR(50),
  contact_person VARCHAR(255),
  payment_terms VARCHAR(50),
  credit_limit DECIMAL(10, 2) DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para rendimiento
CREATE INDEX IF NOT EXISTS idx_customers_user_id ON customers(user_id);
CREATE INDEX IF NOT EXISTS idx_customers_code ON customers(code);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_is_active ON customers(is_active);

-- RLS: Row Level Security
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_can_view_own_customers" ON customers
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "users_can_create_customers" ON customers
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users_can_update_own_customers" ON customers
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users_can_delete_own_customers" ON customers
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- 3. TABLA: ORDERS (Órdenes/Pedidos)
-- ============================================================================
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
  code VARCHAR(50) UNIQUE NOT NULL,
  status VARCHAR(50) DEFAULT 'pending', -- pending, processing, completed, cancelled
  order_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  delivery_date TIMESTAMP WITH TIME ZONE,
  subtotal DECIMAL(10, 2) NOT NULL DEFAULT 0,
  tax DECIMAL(10, 2) DEFAULT 0,
  discount DECIMAL(10, 2) DEFAULT 0,
  total DECIMAL(10, 2) NOT NULL DEFAULT 0,
  payment_method VARCHAR(50), -- cash, credit_card, bank_transfer, check
  payment_status VARCHAR(50) DEFAULT 'pending', -- pending, paid, partial
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para rendimiento
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_code ON orders(code);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_order_date ON orders(order_date);

-- RLS: Row Level Security
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_can_view_own_orders" ON orders
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "users_can_create_orders" ON orders
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users_can_update_own_orders" ON orders
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users_can_delete_own_orders" ON orders
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- 4. TABLA: ORDER_ITEMS (Items de Órdenes - Detalles)
-- ============================================================================
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(10, 2) NOT NULL DEFAULT 0,
  discount_percentage DECIMAL(5, 2) DEFAULT 0,
  line_total DECIMAL(10, 2) NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para rendimiento
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);

-- RLS: Row Level Security
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_can_view_own_order_items" ON order_items
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "users_can_create_order_items" ON order_items
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "users_can_update_own_order_items" ON order_items
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "users_can_delete_own_order_items" ON order_items
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()
    )
  );

-- ============================================================================
-- 5. TABLA: INVOICES (Facturas)
-- ============================================================================
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
  invoice_number VARCHAR(50) UNIQUE NOT NULL,
  invoice_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  due_date TIMESTAMP WITH TIME ZONE,
  status VARCHAR(50) DEFAULT 'draft', -- draft, sent, partial, paid, overdue, cancelled
  subtotal DECIMAL(10, 2) NOT NULL DEFAULT 0,
  tax DECIMAL(10, 2) DEFAULT 0,
  discount DECIMAL(10, 2) DEFAULT 0,
  total DECIMAL(10, 2) NOT NULL DEFAULT 0,
  paid_amount DECIMAL(10, 2) DEFAULT 0,
  payment_method VARCHAR(50),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para rendimiento
CREATE INDEX IF NOT EXISTS idx_invoices_user_id ON invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_customer_id ON invoices(customer_id);
CREATE INDEX IF NOT EXISTS idx_invoices_order_id ON invoices(order_id);
CREATE INDEX IF NOT EXISTS idx_invoices_invoice_number ON invoices(invoice_number);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_invoice_date ON invoices(invoice_date);

-- RLS: Row Level Security
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_can_view_own_invoices" ON invoices
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "users_can_create_invoices" ON invoices
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users_can_update_own_invoices" ON invoices
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users_can_delete_own_invoices" ON invoices
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- 6. TABLA: SYNC_LOG (Log de Sincronización)
-- ============================================================================
CREATE TABLE IF NOT EXISTS sync_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  table_name VARCHAR(100) NOT NULL,
  action VARCHAR(50) NOT NULL, -- INSERT, UPDATE, DELETE
  record_id UUID,
  synced_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  synced BOOLEAN DEFAULT TRUE,
  error TEXT
);

-- Índices para rendimiento
CREATE INDEX IF NOT EXISTS idx_sync_log_user_id ON sync_log(user_id);
CREATE INDEX IF NOT EXISTS idx_sync_log_synced ON sync_log(synced);
CREATE INDEX IF NOT EXISTS idx_sync_log_synced_at ON sync_log(synced_at);

-- RLS: Row Level Security
ALTER TABLE sync_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_can_view_own_sync_log" ON sync_log
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "users_can_create_sync_log" ON sync_log
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- 7. FUNCIÓN: Trigger para actualizar updated_at
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplica trigger a las tablas que lo necesitan
CREATE TRIGGER products_updated_at_trigger
BEFORE UPDATE ON products
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER customers_updated_at_trigger
BEFORE UPDATE ON customers
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER orders_updated_at_trigger
BEFORE UPDATE ON orders
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER invoices_updated_at_trigger
BEFORE UPDATE ON invoices
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 8. VISTA: Estadísticas del Usuario
-- ============================================================================
CREATE OR REPLACE VIEW user_statistics AS
SELECT
  u.id as user_id,
  COUNT(DISTINCT p.id) as total_products,
  COUNT(DISTINCT c.id) as total_customers,
  COUNT(DISTINCT o.id) as total_orders,
  COUNT(DISTINCT i.id) as total_invoices,
  COALESCE(SUM(o.total), 0) as total_sales,
  COALESCE(SUM(CASE WHEN o.status = 'completed' THEN o.total ELSE 0 END), 0) as completed_sales
FROM auth.users u
LEFT JOIN products p ON u.id = p.user_id
LEFT JOIN customers c ON u.id = c.user_id
LEFT JOIN orders o ON u.id = o.user_id
LEFT JOIN invoices i ON u.id = i.user_id
GROUP BY u.id;

-- ============================================================================
-- ✅ SCHEMA COMPLETADO
-- ============================================================================
-- 
-- Tablas creadas:
-- 1. products - Gestión de inventario
-- 2. customers - Información de clientes
-- 3. orders - Pedidos y órdenes
-- 4. order_items - Detalles de órdenes
-- 5. invoices - Facturas
-- 6. sync_log - Log de sincronización
--
-- Características implementadas:
-- ✅ Row Level Security (RLS) para cada tabla
-- ✅ Índices para optimizar queries
-- ✅ Triggers para actualizar timestamps
-- ✅ Vistas para estadísticas
-- ✅ Relaciones entre tablas
-- ✅ Validaciones de datos
--
-- ============================================================================