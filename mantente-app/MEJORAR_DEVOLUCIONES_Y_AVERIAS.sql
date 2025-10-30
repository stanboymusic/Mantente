-- ========================================
-- 🚀 PASO 1: MEJORAR TABLA DEVOLUCIONES
-- ========================================
-- Ejecutar en: Supabase Dashboard → SQL Editor
--
-- Este script AMPLÍA la tabla "devoluciones" existente
-- SIN eliminar los datos actuales.
--
-- ✅ SEGURO: No borra nada, solo agrega campos
-- ⏱️  TIEMPO: ~5 segundos
-- 
-- ========================================

-- ========================================
-- 1️⃣  AMPLIAR TABLA DEVOLUCIONES
-- ========================================

ALTER TABLE devoluciones ADD COLUMN IF NOT EXISTS tipo_resolucion VARCHAR(50)
  DEFAULT 'Reembolso'
  CHECK (tipo_resolucion IN ('Reembolso', 'Cambio', 'Canje Proveedor', 'Pérdida'));

ALTER TABLE devoluciones ADD COLUMN IF NOT EXISTS estado_producto VARCHAR(50)
  DEFAULT 'Buen estado'
  CHECK (estado_producto IN ('Buen estado', 'Dañado', 'Parcialmente dañado'));

-- Producto de reemplazo (para cambios)
ALTER TABLE devoluciones ADD COLUMN IF NOT EXISTS producto_nuevo VARCHAR(255);
ALTER TABLE devoluciones ADD COLUMN IF NOT EXISTS cantidad_nueva INT;
ALTER TABLE devoluciones ADD COLUMN IF NOT EXISTS precio_nuevo DECIMAL(10, 2);

-- Cálculo de diferencia de precio
ALTER TABLE devoluciones ADD COLUMN IF NOT EXISTS diferencia_precio DECIMAL(10, 2) DEFAULT 0;

-- Información de canje con proveedor
ALTER TABLE devoluciones ADD COLUMN IF NOT EXISTS tiene_cambio_proveedor BOOLEAN DEFAULT FALSE;
ALTER TABLE devoluciones ADD COLUMN IF NOT EXISTS referencia_canje VARCHAR(255);

-- Enlaces con otras transacciones
ALTER TABLE devoluciones ADD COLUMN IF NOT EXISTS id_ingreso BIGINT;  -- Si genera ingreso (cambio más caro)
ALTER TABLE devoluciones ADD COLUMN IF NOT EXISTS id_egreso BIGINT;   -- Si genera egreso (cambio más barato, pérdida)

-- Control de procesamiento
ALTER TABLE devoluciones ADD COLUMN IF NOT EXISTS fecha_procesada TIMESTAMP;
ALTER TABLE devoluciones ADD COLUMN IF NOT EXISTS procesada_por UUID;

-- Documentación
ALTER TABLE devoluciones ADD COLUMN IF NOT EXISTS notas_adicionales TEXT;

-- ========================================
-- 2️⃣  CREAR TABLA AVERIAS (Tracking de daños)
-- ========================================

CREATE TABLE IF NOT EXISTS averias (
  id BIGSERIAL PRIMARY KEY,
  
  -- Relaciones
  owner UUID NOT NULL,
  id_devolucion BIGINT,                    -- FK a devoluciones
  
  -- Identificación del daño
  producto VARCHAR(255) NOT NULL,
  descripcion TEXT NOT NULL,
  
  -- Estado y seguimiento
  estado VARCHAR(50) NOT NULL
    DEFAULT 'Pendiente'
    CHECK (estado IN ('Pendiente', 'Canjeada', 'Desechada', 'Reembolsada')),
  
  -- Proveedor (si aplica)
  proveedor VARCHAR(255),
  referencia_canje VARCHAR(255),           -- Ej: "Cambio #PO-2024-001"
  
  -- Fechas
  fecha_reporte DATE DEFAULT CURRENT_DATE,
  fecha_resolucion DATE,
  
  -- Impacto financiero
  monto_perdida DECIMAL(10, 2),            -- Valor del producto dañado
  
  -- Documentación
  notas TEXT,
  
  -- Auditoría
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT fk_averias_owner FOREIGN KEY (owner) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT fk_averias_devolucion FOREIGN KEY (id_devolucion) REFERENCES devoluciones(id) ON DELETE SET NULL
);

-- ========================================
-- 3️⃣  CREAR ÍNDICES
-- ========================================

CREATE INDEX IF NOT EXISTS idx_devoluciones_tipo_resolucion 
  ON devoluciones(tipo_resolucion);

CREATE INDEX IF NOT EXISTS idx_devoluciones_estado_producto 
  ON devoluciones(estado_producto);

CREATE INDEX IF NOT EXISTS idx_devoluciones_id_ingreso 
  ON devoluciones(id_ingreso);

CREATE INDEX IF NOT EXISTS idx_devoluciones_id_egreso 
  ON devoluciones(id_egreso);

CREATE INDEX IF NOT EXISTS idx_devoluciones_fecha_procesada 
  ON devoluciones(fecha_procesada);

-- Índices para averias
CREATE INDEX IF NOT EXISTS idx_averias_owner 
  ON averias(owner);

CREATE INDEX IF NOT EXISTS idx_averias_id_devolucion 
  ON averias(id_devolucion);

CREATE INDEX IF NOT EXISTS idx_averias_estado 
  ON averias(estado);

CREATE INDEX IF NOT EXISTS idx_averias_fecha_reporte 
  ON averias(fecha_reporte);

-- ========================================
-- 4️⃣  HABILITAR RLS EN AVERIAS
-- ========================================

ALTER TABLE averias ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuarios ven sus averias" 
  ON averias 
  FOR SELECT 
  USING (auth.uid() = owner);

CREATE POLICY "Usuarios crean averias" 
  ON averias 
  FOR INSERT 
  WITH CHECK (auth.uid() = owner);

CREATE POLICY "Usuarios actualizan sus averias" 
  ON averias 
  FOR UPDATE 
  USING (auth.uid() = owner)
  WITH CHECK (auth.uid() = owner);

CREATE POLICY "Usuarios eliminan sus averias" 
  ON averias 
  FOR DELETE 
  USING (auth.uid() = owner);

-- ========================================
-- 5️⃣  VERIFICACIÓN
-- ========================================
-- Si todo salió bien, ejecuta esto:
-- 
-- SELECT column_name, data_type FROM information_schema.columns 
-- WHERE table_name = 'devoluciones' 
-- ORDER BY ordinal_position;
--
-- Deberías ver todos los campos nuevos (tipo_resolucion, estado_producto, etc.)
--
-- Y luego:
-- SELECT * FROM averias LIMIT 1;
--
-- Deberías ver la nueva tabla (sin datos aún).

-- ========================================
-- 6️⃣  EJEMPLOS DE USO
-- ========================================

-- EJEMPLO 1: Devolver producto en buen estado (Reembolso)
-- INSERT INTO devoluciones 
--   (owner, codigo_venta, monto, cantidad, cliente, producto,
--    tipo_resolucion, estado_producto, fecha)
-- VALUES 
--   ('uuid-del-user', 'VTA-2024-001', 50.00, 1, 'Juan Pérez', 'Producto A',
--    'Reembolso', 'Buen estado', CURRENT_DATE);

-- EJEMPLO 2: Cambio por producto más caro (Cliente paga diferencia)
-- INSERT INTO devoluciones 
--   (owner, codigo_venta, monto, cantidad, cliente, producto,
--    tipo_resolucion, estado_producto, 
--    producto_nuevo, cantidad_nueva, precio_nuevo, diferencia_precio, fecha)
-- VALUES 
--   ('uuid-del-user', 'VTA-2024-002', 50.00, 1, 'María García', 'Producto A',
--    'Cambio', 'Buen estado', 
--    'Producto B', 1, 80.00, 30.00, CURRENT_DATE);  -- Cliente paga 30 más

-- EJEMPLO 3: Canje con proveedor (producto dañado)
-- INSERT INTO devoluciones 
--   (owner, codigo_venta, monto, cantidad, cliente, producto,
--    tipo_resolucion, estado_producto, 
--    tiene_cambio_proveedor, referencia_canje, fecha)
-- VALUES 
--   ('uuid-del-user', 'VTA-2024-003', 0, 1, 'Carlos López', 'Producto C',
--    'Canje Proveedor', 'Dañado',
--    TRUE, 'Canje #PO-2024-001', CURRENT_DATE);
--
-- -- Luego crear registro en averias
-- INSERT INTO averias 
--   (owner, id_devolucion, producto, descripcion, estado, proveedor, referencia_canje, monto_perdida)
-- VALUES 
--   ('uuid-del-user', (SELECT id FROM devoluciones ORDER BY id DESC LIMIT 1),
--    'Producto C', 'Pantalla rota, proveedor aceptó cambio', 'Canjeada', 
--    'Proveedor XYZ', 'Canje #PO-2024-001', 75.00);

-- EJEMPLO 4: Pérdida total (producto dañado, sin canje)
-- INSERT INTO devoluciones 
--   (owner, codigo_venta, monto, cantidad, cliente, producto,
--    tipo_resolucion, estado_producto, fecha)
-- VALUES 
--   ('uuid-del-user', 'VTA-2024-004', 100.00, 1, 'Ana Rodríguez', 'Producto D',
--    'Pérdida', 'Dañado', CURRENT_DATE);
--
-- -- Luego se crea un egreso automáticamente registrando la pérdida

-- ========================================