-- ============================================
-- 🛒 VERIFICACIÓN Y CONFIGURACIÓN RLS - TABLA 'orders'
-- ============================================
-- Este script verifica que la tabla 'orders' tenga:
-- 1. RLS habilitado
-- 2. Políticas de control de acceso por user_id
-- ============================================

-- 1. VERIFICAR ESTADO DE RLS EN TABLA 'orders'
-- ============================================
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_habilitado
FROM pg_tables 
WHERE tablename = 'orders'
ORDER BY tablename;

-- 2. VER POLÍTICAS EXISTENTES EN 'orders'
-- ============================================
SELECT
  schemaname,
  tablename,
  policyname,
  roles,
  qual as condicion
FROM pg_policies 
WHERE tablename = 'orders'
ORDER BY tablename, policyname;

-- ============================================
-- 3. HABILITAR RLS EN 'orders'
-- ============================================
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 4. ELIMINAR POLÍTICAS ANTIGUAS (si existen)
-- ============================================
DROP POLICY IF EXISTS "admin_can_create" ON orders;
DROP POLICY IF EXISTS "admin_can_read" ON orders;
DROP POLICY IF EXISTS "admin_can_update" ON orders;
DROP POLICY IF EXISTS "admin_can_delete" ON orders;
DROP POLICY IF EXISTS "Users can CRUD own records" ON orders;
DROP POLICY IF EXISTS "orders_select_own" ON orders;
DROP POLICY IF EXISTS "orders_insert_own" ON orders;
DROP POLICY IF EXISTS "orders_update_own" ON orders;
DROP POLICY IF EXISTS "orders_delete_own" ON orders;

-- ============================================
-- 5. CREAR NUEVAS POLÍTICAS
-- ============================================

-- Permitir SELECT: Usuario solo ve sus propias órdenes
CREATE POLICY "orders_select_own"
  ON orders
  FOR SELECT
  USING (user_id = auth.uid());

-- Permitir INSERT: Usuario solo inserta con su propio user_id
CREATE POLICY "orders_insert_own"
  ON orders
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Permitir UPDATE: Usuario solo actualiza sus órdenes
CREATE POLICY "orders_update_own"
  ON orders
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Permitir DELETE: Usuario solo elimina sus órdenes
CREATE POLICY "orders_delete_own"
  ON orders
  FOR DELETE
  USING (user_id = auth.uid());

-- ============================================
-- 6. VERIFICAR RESULTADO
-- ============================================
-- Deberías ver:
-- - orders: 4 políticas (select, insert, update, delete)

SELECT 
  tablename,
  COUNT(*) as num_policies,
  array_agg(policyname) as policy_names
FROM pg_policies 
WHERE tablename = 'orders'
GROUP BY tablename
ORDER BY tablename;

-- ============================================
-- 7. VERIFICAR DATOS EN 'orders'
-- ============================================
-- Después de ejecutar esto, prueba:
-- 1. Crea una orden en Mantente Connect
-- 2. Verifica que aparece aquí (debería ver 1 fila):
SELECT * FROM orders LIMIT 5;

-- 3. Si ves datos, el RLS está funcionando correctamente

-- ============================================
-- 8. VERIFICAR SINCRONIZACIÓN DE ÓRDENES
-- ============================================
-- Contar órdenes por usuario
SELECT 
  user_id,
  COUNT(*) as total_ordenes,
  MAX(created_at) as ultima_orden,
  status,
  payment_status
FROM orders
GROUP BY user_id, status, payment_status
ORDER BY MAX(created_at) DESC;

-- ============================================
-- RESULTADO ESPERADO
-- ============================================
-- ✅ RLS habilitado en 'orders'
-- ✅ 4 políticas de seguridad configuradas
-- ✅ Las órdenes creadas en Mantente Connect deben aparecer aquí
-- ✅ Solo el dueño (usuario) puede ver/editar sus propias órdenes