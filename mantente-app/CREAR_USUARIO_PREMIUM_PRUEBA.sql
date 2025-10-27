-- ================================================================
-- SCRIPT PARA CREAR USUARIO PREMIUM DE PRUEBA EN SUPABASE
-- ================================================================
-- Este script crea un usuario de prueba con suscripción premium activa
-- Úsalo en el SQL Editor de Supabase

-- ================================================================
-- PASO 1: Crear usuario de prueba (ejecutar en Supabase Auth)
-- ================================================================
-- Ve a Supabase Dashboard > Authentication > Users
-- Haz clic en "Add user" y completa:
-- Email: test-premium@mantente.app
-- Password: TestPremium123!
-- (O cualquier email/contraseña que prefieras)
-- El ID del usuario se generará automáticamente (ej: 550e8400-e29b-41d4-a716-446655440000)

-- ================================================================
-- PASO 2: Ejecuta este SQL en el SQL Editor de Supabase
-- ================================================================
-- IMPORTANTE: Reemplaza 'USER_ID_AQUI' con el ID real del usuario creado

BEGIN;

-- Insertar suscripción premium
INSERT INTO public.premium_subscriptions (
  user_id,
  status,
  payment_method,
  transaction_id,
  price,
  billing_cycle_anchor,
  current_period_start,
  current_period_end,
  updated_at,
  created_at
) VALUES (
  'USER_ID_AQUI',  -- ← REEMPLAZA ESTO CON EL ID REAL DEL USUARIO
  'active',
  'test',
  'TEST_MANUAL_PREMIUM_' || to_char(now(), 'YYYYMMDDHH24MISS'),
  20.00,
  now(),
  now(),
  now() + interval '30 days',
  now(),
  now()
)
ON CONFLICT (user_id) DO UPDATE SET
  status = 'active',
  payment_method = 'test',
  price = 20.00,
  current_period_end = now() + interval '30 days',
  updated_at = now();

COMMIT;

-- ================================================================
-- Verificación: Consulta para confirmar que se creó correctamente
-- ================================================================
SELECT 
  user_id,
  status,
  price,
  current_period_start,
  current_period_end,
  created_at,
  updated_at
FROM public.premium_subscriptions
WHERE user_id = 'USER_ID_AQUI'
LIMIT 1;