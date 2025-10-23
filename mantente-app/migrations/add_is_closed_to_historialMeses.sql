-- Migración: Agregar columna is_closed a historialMeses
-- Esta columna distingue entre meses abiertos (false) y cerrados (true)

ALTER TABLE historialMeses 
ADD COLUMN is_closed BOOLEAN DEFAULT false;

-- Establecer meses existentes como cerrados (asumimos que si existen, ya están cerrados)
UPDATE historialMeses 
SET is_closed = true 
WHERE is_closed IS NULL OR is_closed = false;