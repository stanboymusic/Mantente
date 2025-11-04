-- ========================================
-- SCHEMA COMPLETO PRECISO SUPABASE
-- Basado en análisis exacto del código
-- ========================================

-- ✅ TABLA: facturas
-- Campos basados en: AppContext.jsx línea 786-820 (crearFactura)
-- Los nombres EXACTOS que aparecen en el código
CREATE TABLE IF NOT EXISTS facturas (
  id BIGSERIAL PRIMARY KEY,
  owner UUID NOT NULL,
  numero_factura VARCHAR(50) UNIQUE,
  -- 👥 Información del Cliente
  cliente_id BIGINT,
  cliente VARCHAR(255) NOT NULL,
  cliente_email VARCHAR(255),
  cliente_telefono VARCHAR(20),
  cliente_ruc VARCHAR(50),
  cliente_direccion TEXT,
  -- 🏢 Información de la Empresa
  empresa_nombre VARCHAR(255),
  empresa_ruc VARCHAR(50),
  empresa_email VARCHAR(255),
  empresa_telefono VARCHAR(20),
  empresa_direccion TEXT,
  empresa_logo_url TEXT,
  -- 💰 Datos de la Factura
  fecha DATE DEFAULT CURRENT_DATE,
  venta_id BIGINT,
  subtotal DECIMAL(10, 2),
  descuento DECIMAL(10, 2) DEFAULT 0,
  impuesto DECIMAL(10, 2) DEFAULT 0,
  total DECIMAL(10, 2),
  estado VARCHAR(50) DEFAULT 'pendiente',
  metodo_pago VARCHAR(100),
  notas TEXT,
  -- 📦 Productos y Códigos de Venta
  productos_json JSONB,
  codigos_venta_json JSONB,
  -- 🔐 Auditoría
  fecha_pago DATE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT fk_owner FOREIGN KEY (owner) REFERENCES auth.users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_facturas_owner ON facturas(owner);
CREATE INDEX IF NOT EXISTS idx_facturas_numero ON facturas(numero_factura);
CREATE INDEX IF NOT EXISTS idx_facturas_fecha ON facturas(fecha);
CREATE INDEX IF NOT EXISTS idx_facturas_cliente_id ON facturas(cliente_id);

-- ✅ TABLA: notas_entrega
-- Campos basados en: AppContext.jsx línea 2055-2085 (crearNotaEntrega)
-- + información de empresa para el PDF (como en facturas)
CREATE TABLE IF NOT EXISTS notas_entrega (
  id BIGSERIAL PRIMARY KEY,
  owner UUID NOT NULL,
  numero_nota VARCHAR(50) UNIQUE,
  cliente VARCHAR(255) NOT NULL,
  items JSONB,
  observaciones TEXT,
  fecha_entrega DATE DEFAULT CURRENT_DATE,
  estado VARCHAR(50) DEFAULT 'pendiente',
  -- 🏢 Información de la Empresa (NUEVAS para PDF)
  empresa_nombre VARCHAR(255),
  empresa_ruc VARCHAR(50),
  empresa_email VARCHAR(255),
  empresa_telefono VARCHAR(20),
  empresa_direccion TEXT,
  empresa_logo_url TEXT,
  -- 🔐 Auditoría
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT fk_owner FOREIGN KEY (owner) REFERENCES auth.users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_notas_entrega_owner ON notas_entrega(owner);
CREATE INDEX IF NOT EXISTS idx_notas_entrega_numero ON notas_entrega(numero_nota);
CREATE INDEX IF NOT EXISTS idx_notas_entrega_fecha ON notas_entrega(fecha_entrega);

-- ✅ TABLA: ventas (verificación de campos para LibroVentas)
-- Campos basados en: LibroVentas.jsx línea 1-275
-- Ya existen pero se confirma que estos son los necesarios
CREATE TABLE IF NOT EXISTS ventas (
  id BIGSERIAL PRIMARY KEY,
  owner UUID NOT NULL,
  codigo_venta VARCHAR(50) UNIQUE,
  cliente VARCHAR(255) NOT NULL,
  producto VARCHAR(255) NOT NULL,
  cantidad INT NOT NULL DEFAULT 1,
  monto DECIMAL(10, 2) NOT NULL,
  descuento DECIMAL(10, 2) DEFAULT 0,
  total DECIMAL(10, 2) GENERATED ALWAYS AS (monto - descuento) STORED,
  metodo_pago VARCHAR(100),
  fecha DATE DEFAULT CURRENT_DATE,
  mes_cierre DATE,
  notas TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT fk_owner FOREIGN KEY (owner) REFERENCES auth.users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_ventas_owner ON ventas(owner);
CREATE INDEX IF NOT EXISTS idx_ventas_codigo_venta ON ventas(codigo_venta);
CREATE INDEX IF NOT EXISTS idx_ventas_fecha ON ventas(fecha);
CREATE INDEX IF NOT EXISTS idx_ventas_cliente ON ventas(cliente);
CREATE INDEX IF NOT EXISTS idx_ventas_mes_cierre ON ventas(mes_cierre);

-- ========================================
-- PARA AGREGAR NUEVAS COLUMNAS A TABLAS EXISTENTES
-- Ejecuta estos ALTER TABLE si las columnas no existen
-- ========================================

-- Para tabla facturas
ALTER TABLE IF EXISTS facturas
ADD COLUMN IF NOT EXISTS cliente_email VARCHAR(255),
ADD COLUMN IF NOT EXISTS cliente_telefono VARCHAR(20),
ADD COLUMN IF NOT EXISTS cliente_ruc VARCHAR(50),
ADD COLUMN IF NOT EXISTS cliente_direccion TEXT,
ADD COLUMN IF NOT EXISTS empresa_nombre VARCHAR(255),
ADD COLUMN IF NOT EXISTS empresa_ruc VARCHAR(50),
ADD COLUMN IF NOT EXISTS empresa_email VARCHAR(255),
ADD COLUMN IF NOT EXISTS empresa_telefono VARCHAR(20),
ADD COLUMN IF NOT EXISTS empresa_direccion TEXT,
ADD COLUMN IF NOT EXISTS empresa_logo_url TEXT,
ADD COLUMN IF NOT EXISTS fecha DATE DEFAULT CURRENT_DATE,
ADD COLUMN IF NOT EXISTS venta_id BIGINT,
ADD COLUMN IF NOT EXISTS descuento DECIMAL(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS metodo_pago VARCHAR(100),
ADD COLUMN IF NOT EXISTS notas TEXT,
ADD COLUMN IF NOT EXISTS productos_json JSONB,
ADD COLUMN IF NOT EXISTS codigos_venta_json JSONB,
ADD COLUMN IF NOT EXISTS fecha_pago DATE;

-- Para tabla notas_entrega
ALTER TABLE IF EXISTS notas_entrega
ADD COLUMN IF NOT EXISTS empresa_nombre VARCHAR(255),
ADD COLUMN IF NOT EXISTS empresa_ruc VARCHAR(50),
ADD COLUMN IF NOT EXISTS empresa_email VARCHAR(255),
ADD COLUMN IF NOT EXISTS empresa_telefono VARCHAR(20),
ADD COLUMN IF NOT EXISTS empresa_direccion TEXT,
ADD COLUMN IF NOT EXISTS empresa_logo_url TEXT;

-- ========================================
-- ROW LEVEL SECURITY
-- ========================================

ALTER TABLE facturas ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "Usuarios ven sus facturas" ON facturas 
  FOR SELECT USING (auth.uid() = owner);
CREATE POLICY IF NOT EXISTS "Usuarios crean facturas" ON facturas 
  FOR INSERT WITH CHECK (auth.uid() = owner);
CREATE POLICY IF NOT EXISTS "Usuarios actualizan facturas" ON facturas 
  FOR UPDATE USING (auth.uid() = owner);

ALTER TABLE notas_entrega ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "Usuarios ven sus notas de entrega" ON notas_entrega 
  FOR SELECT USING (auth.uid() = owner);
CREATE POLICY IF NOT EXISTS "Usuarios crean notas de entrega" ON notas_entrega 
  FOR INSERT WITH CHECK (auth.uid() = owner);
CREATE POLICY IF NOT EXISTS "Usuarios actualizan notas de entrega" ON notas_entrega 
  FOR UPDATE USING (auth.uid() = owner);

ALTER TABLE ventas ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "Usuarios ven sus ventas" ON ventas 
  FOR SELECT USING (auth.uid() = owner);
CREATE POLICY IF NOT EXISTS "Usuarios crean ventas" ON ventas 
  FOR INSERT WITH CHECK (auth.uid() = owner);
CREATE POLICY IF NOT EXISTS "Usuarios actualizan ventas" ON ventas 
  FOR UPDATE USING (auth.uid() = owner);
