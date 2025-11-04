-- ========================================
-- FIX TABLA AVERIAS
-- Problema: La tabla averias no coincide con lo que el código intenta insertar
-- Solución: Recrear tabla con EXACTAMENTE los campos que el código espera
-- ========================================

-- BORRAR TABLA EXISTENTE (CUIDADO: PERDERÁS LOS DATOS)
DROP TABLE IF EXISTS averias CASCADE;

-- CREAR NUEVA TABLA averias CON EXACTAMENTE LOS CAMPOS DEL CÓDIGO
-- Basada en: AppContext.jsx línea 1723-1785 (función crearAveria)
CREATE TABLE IF NOT EXISTS averias (
  id BIGSERIAL PRIMARY KEY,
  
  -- Relaciones
  owner UUID NOT NULL,
  
  -- Campos que el código INTENTA PASAR (línea 1729-1737)
  producto VARCHAR(255) NOT NULL,
  cantidad INT NOT NULL,
  razon_dano TEXT,
  tiene_cambio_proveedor BOOLEAN DEFAULT FALSE,
  referencia_canje VARCHAR(255),
  nombre_proveedor VARCHAR(255),
  
  -- Campos calculados por el código
  precio_unitario DECIMAL(10, 2),
  estado VARCHAR(50) DEFAULT 'desechada' CHECK (estado IN ('canjeada', 'desechada')),
  
  -- Campos adicionales
  fecha TIMESTAMP,
  registrada_por VARCHAR(255),
  notas TEXT,
  
  -- Auditoría
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT fk_averias_owner FOREIGN KEY (owner) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- CREAR ÍNDICES
CREATE INDEX IF NOT EXISTS idx_averias_owner ON averias(owner);
CREATE INDEX IF NOT EXISTS idx_averias_producto ON averias(producto);
CREATE INDEX IF NOT EXISTS idx_averias_estado ON averias(estado);
CREATE INDEX IF NOT EXISTS idx_averias_fecha ON averias(fecha);

-- HABILITAR ROW LEVEL SECURITY
ALTER TABLE averias ENABLE ROW LEVEL SECURITY;

-- CREAR POLICIES
DROP POLICY IF EXISTS "Usuarios ven sus averias" ON averias;
DROP POLICY IF EXISTS "Usuarios crean averias" ON averias;
DROP POLICY IF EXISTS "Usuarios actualizan sus averias" ON averias;

CREATE POLICY "Usuarios ven sus averias" ON averias 
  FOR SELECT USING (auth.uid() = owner);

CREATE POLICY "Usuarios crean averias" ON averias 
  FOR INSERT WITH CHECK (auth.uid() = owner);

CREATE POLICY "Usuarios actualizan sus averias" ON averias 
  FOR UPDATE USING (auth.uid() = owner);

-- ========================================
-- VERIFICACIÓN
-- ========================================

-- Ver estructura de la tabla:
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'averias'
ORDER BY ordinal_position;

-- ========================================
-- NOTAS
-- ========================================
-- Esta tabla AHORA tiene exactamente los campos que el código espera:
-- 
-- Campos que el código PASA (AppContext.jsx:1750-1763):
-- owner
-- producto
-- cantidad
-- precio_unitario (calculado como prodInventario.precio_costo)
-- razon_dano
-- estado (calculado basado en tiene_cambio_proveedor)
-- tiene_cambio_proveedor
-- referencia_canje
-- nombre_proveedor
-- fecha
-- registrada_por (user.email)
-- notas
--
-- Sin campo "descripcion" que causaba el error null not-null constraint
