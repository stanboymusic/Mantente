-- ========================================
-- SQL PARA EJECUTAR EN SUPABASE
-- Copia TODO el contenido y ejecuta en la consola SQL de Supabase
-- ========================================

-- PASO 1: AGREGAR COLUMNAS A TABLA facturas
-- Estos campos están siendo utilizados por GeneradorFacturas.jsx
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
ADD COLUMN IF NOT EXISTS venta_id BIGINT,
ADD COLUMN IF NOT EXISTS descuento DECIMAL(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS impuesto DECIMAL(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS metodo_pago VARCHAR(100),
ADD COLUMN IF NOT EXISTS notas TEXT,
ADD COLUMN IF NOT EXISTS productos_json JSONB,
ADD COLUMN IF NOT EXISTS codigos_venta_json JSONB,
ADD COLUMN IF NOT EXISTS fecha_pago DATE,
ADD COLUMN IF NOT EXISTS fecha DATE DEFAULT CURRENT_DATE;

-- PASO 2: AGREGAR COLUMNAS A TABLA notas_entrega
-- Estos campos son para guardar información de empresa en la nota
-- Usado por NotasEntrega.jsx (línea 181-200)
ALTER TABLE IF EXISTS notas_entrega
ADD COLUMN IF NOT EXISTS empresa_nombre VARCHAR(255),
ADD COLUMN IF NOT EXISTS empresa_ruc VARCHAR(50),
ADD COLUMN IF NOT EXISTS empresa_email VARCHAR(255),
ADD COLUMN IF NOT EXISTS empresa_telefono VARCHAR(20),
ADD COLUMN IF NOT EXISTS empresa_direccion TEXT,
ADD COLUMN IF NOT EXISTS empresa_logo_url TEXT;

-- PASO 3: CREAR ÍNDICES PARA OPTIMIZAR BÚSQUEDAS
CREATE INDEX IF NOT EXISTS idx_facturas_cliente_id ON facturas(cliente_id);
CREATE INDEX IF NOT EXISTS idx_facturas_empresa_nombre ON facturas(empresa_nombre);
CREATE INDEX IF NOT EXISTS idx_notas_entrega_empresa_nombre ON notas_entrega(empresa_nombre);
CREATE INDEX IF NOT EXISTS idx_notas_entrega_fecha_entrega ON notas_entrega(fecha_entrega);

-- ========================================
-- VERIFICACIÓN
-- Ejecuta estas queries para verificar que las columnas existen:
-- ========================================

-- Ver estructura de facturas:
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'facturas'
ORDER BY ordinal_position;

-- Ver estructura de notas_entrega:
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'notas_entrega'
ORDER BY ordinal_position;

-- ========================================
-- NOTES
-- ========================================
-- Estos cambios HABILITAN que tu programa funcione correctamente:
--
-- 1. GeneradorFacturas.jsx ahora puede guardar TODA la información de cliente y empresa
-- 2. LibroVentas.jsx puede mostrar info completa de empresa en PDF
-- 3. NotasEntrega.jsx puede guardar info de empresa para PDF consistente
--
-- NO se modificaron nombres de columnas del código.
-- Todos los nombres son EXACTOS tal como aparecen en el código.
