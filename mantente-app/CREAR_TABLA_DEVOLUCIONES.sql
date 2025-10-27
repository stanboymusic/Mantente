-- ========================================
-- 📋 CREAR TABLA DEVOLUCIONES EN SUPABASE
-- ========================================
-- Ejecutar esto en: Supabase Dashboard → SQL Editor
-- 
-- Instrucciones:
-- 1. Abre tu proyecto de Supabase
-- 2. Ve a SQL Editor (lado izquierdo)
-- 3. Haz click en "+" para nueva query
-- 4. Copia todo el contenido de este archivo
-- 5. Click "Run" o presiona Ctrl+Enter
-- 6. Deberías ver: "Success. No rows returned."

-- ========================================
-- 1. CREAR TABLA DEVOLUCIONES
-- ========================================
CREATE TABLE IF NOT EXISTS devoluciones (
  id BIGSERIAL PRIMARY KEY,
  
  -- Referencia a venta
  codigo_venta VARCHAR(50) NOT NULL,        -- Ej: VTA-2024-00001
  
  -- Detalles de la devolución
  monto DECIMAL(10, 2) NOT NULL,            -- Cantidad a reembolsar
  cantidad INT DEFAULT 1,                   -- Cantidad de unidades devueltas
  razon TEXT,                               -- Motivo de devolución
  cliente VARCHAR(255),                     -- Nombre del cliente
  producto VARCHAR(255),                    -- Nombre del producto devuelto
  
  -- Seguimiento
  fecha DATE DEFAULT CURRENT_DATE,          -- Fecha de registro
  estado VARCHAR(50) DEFAULT 'Pendiente Revisión',
  
  -- Usuario propietario (FK a auth.users)
  owner UUID NOT NULL,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT fk_owner FOREIGN KEY (owner) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT check_estado CHECK (estado IN ('Pendiente Revisión', 'Aprobada', 'Rechazada'))
);

-- ========================================
-- 2. CREAR ÍNDICES
-- ========================================
CREATE INDEX IF NOT EXISTS idx_devoluciones_owner 
  ON devoluciones(owner);

CREATE INDEX IF NOT EXISTS idx_devoluciones_codigo_venta 
  ON devoluciones(codigo_venta);

CREATE INDEX IF NOT EXISTS idx_devoluciones_estado 
  ON devoluciones(estado);

CREATE INDEX IF NOT EXISTS idx_devoluciones_fecha 
  ON devoluciones(fecha);

-- ========================================
-- 3. HABILITAR RLS (SECURITY POLICIES)
-- ========================================
-- Primero, habilita RLS en la tabla
ALTER TABLE devoluciones ENABLE ROW LEVEL SECURITY;

-- Policy: Los usuarios solo ven sus propias devoluciones
CREATE POLICY "Usuarios ven solo sus devoluciones" 
  ON devoluciones 
  FOR SELECT 
  USING (auth.uid() = owner);

-- Policy: Los usuarios solo pueden crear sus propias devoluciones
CREATE POLICY "Usuarios pueden crear sus devoluciones" 
  ON devoluciones 
  FOR INSERT 
  WITH CHECK (auth.uid() = owner);

-- Policy: Los usuarios solo pueden actualizar sus propias devoluciones
CREATE POLICY "Usuarios pueden actualizar sus devoluciones" 
  ON devoluciones 
  FOR UPDATE 
  USING (auth.uid() = owner)
  WITH CHECK (auth.uid() = owner);

-- Policy: Los usuarios solo pueden eliminar sus propias devoluciones
CREATE POLICY "Usuarios pueden eliminar sus devoluciones" 
  ON devoluciones 
  FOR DELETE 
  USING (auth.uid() = owner);

-- ========================================
-- 4. VERIFICACIÓN (ejecutar después)
-- ========================================
-- Si todo salió bien, ejecuta esto para verificar:
-- SELECT * FROM devoluciones LIMIT 1;
-- 
-- Deberías ver la estructura de la tabla sin datos.

-- ========================================
-- 5. NOTAS IMPORTANTES
-- ========================================
--
-- ✅ Campos requeridos:
--    - codigo_venta (referencia a venta)
--    - monto (cantidad a reembolsar)
--    - owner (usuario propietario)
--
-- ✅ Estados válidos:
--    - 'Pendiente Revisión' (inicial)
--    - 'Aprobada' (se descuenta del balance)
--    - 'Rechazada' (se rechaza)
--
-- ✅ Los índices mejoran performance:
--    - idx_owner: búsquedas por usuario
--    - idx_codigo_venta: búsquedas por venta
--    - idx_estado: filtrado por estado
--
-- ✅ RLS asegura que cada usuario solo vea sus datos
--
-- ❗ Si tienes problemas con RLS:
--    - Desactívalo temporalmente: ALTER TABLE devoluciones DISABLE ROW LEVEL SECURITY;
--    - Luego vuelve a activarlo después de resolver
--
-- ========================================
-- 6. CONEXIÓN CON VENTAS
-- ========================================
--
-- La columna "codigo_venta" debe coincidir con valores de ventas.codigo_venta
-- Ejemplo de consulta para validar:
--
-- SELECT 
--   d.codigo_venta,
--   d.monto,
--   d.estado,
--   v.cliente,
--   v.producto,
--   v.monto as monto_original
-- FROM devoluciones d
-- LEFT JOIN ventas v ON d.codigo_venta = v.codigo_venta
-- ORDER BY d.fecha DESC;
--
-- ========================================