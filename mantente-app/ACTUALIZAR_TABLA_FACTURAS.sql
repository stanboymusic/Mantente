-- ✅ SCRIPT PARA ACTUALIZAR TABLA FACTURAS CON INFORMACIÓN COMPLETA
-- Ejecutar en: https://supabase.com/dashboard/project/[tu-proyecto]/sql/new
-- Este script agrega columnas para guardar información completa de cliente y empresa

-- 1. Agregar columnas de CLIENTE (si no existen)
ALTER TABLE public.facturas
ADD COLUMN IF NOT EXISTS cliente_id BIGINT,
ADD COLUMN IF NOT EXISTS cliente_email TEXT,
ADD COLUMN IF NOT EXISTS cliente_telefono TEXT,
ADD COLUMN IF NOT EXISTS cliente_ruc TEXT,
ADD COLUMN IF NOT EXISTS cliente_direccion TEXT;

-- 2. Agregar columnas de EMPRESA (si no existen)
ALTER TABLE public.facturas
ADD COLUMN IF NOT EXISTS empresa_nombre TEXT,
ADD COLUMN IF NOT EXISTS empresa_ruc TEXT,
ADD COLUMN IF NOT EXISTS empresa_email TEXT,
ADD COLUMN IF NOT EXISTS empresa_telefono TEXT,
ADD COLUMN IF NOT EXISTS empresa_direccion TEXT,
ADD COLUMN IF NOT EXISTS empresa_logo_url TEXT;

-- 3. Verificar que el cambio se hizo correctamente
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'facturas' 
ORDER BY ordinal_position;