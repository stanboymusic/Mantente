-- 🔐 VERIFICAR Y ARREGLAR POLÍTICAS DE RLS PARA SINCRONIZACIÓN
-- Ejecuta esto en Supabase → SQL Editor

-- ============================================
-- 1. VERIFICAR ESTADO ACTUAL
-- ============================================

-- Ver si RLS está habilitado
SELECT 
  tablename,
  rowsecurity as rls_habilitado
FROM pg_tables 
WHERE tablename IN ('inventario', 'clientes', 'products', 'customers')
ORDER BY tablename;

-- Ver políticas existentes
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive as tipo,
  roles,
  qual as condicion
FROM pg_policies 
WHERE tablename IN ('inventario', 'clientes', 'products', 'customers')
ORDER BY tablename;

-- ============================================
-- 2. ARREGLAR TABLA 'inventario'
-- ============================================

-- HABILITAR RLS
ALTER TABLE inventario ENABLE ROW LEVEL SECURITY;

-- ELIMINAR POLÍTICAS ANTIGUAS (si existen)
DROP POLICY IF EXISTS "admin_can_create" ON inventario;
DROP POLICY IF EXISTS "admin_can_read" ON inventario;
DROP POLICY IF EXISTS "admin_can_update" ON inventario;
DROP POLICY IF EXISTS "admin_can_delete" ON inventario;
DROP POLICY IF EXISTS "Users can CRUD own records" ON inventario;

-- CREAR NUEVAS POLÍTICAS
-- Permitir SELECT: Usuario solo ve sus propios productos
CREATE POLICY "inventario_select_own"
  ON inventario
  FOR SELECT
  USING (owner = auth.uid());

-- Permitir INSERT: Usuario solo inserta con su propio owner
CREATE POLICY "inventario_insert_own"
  ON inventario
  FOR INSERT
  WITH CHECK (owner = auth.uid());

-- Permitir UPDATE: Usuario solo actualiza sus productos
CREATE POLICY "inventario_update_own"
  ON inventario
  FOR UPDATE
  USING (owner = auth.uid())
  WITH CHECK (owner = auth.uid());

-- Permitir DELETE: Usuario solo elimina sus productos
CREATE POLICY "inventario_delete_own"
  ON inventario
  FOR DELETE
  USING (owner = auth.uid());

-- ============================================
-- 3. ARREGLAR TABLA 'clientes'
-- ============================================

-- HABILITAR RLS
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;

-- ELIMINAR POLÍTICAS ANTIGUAS (si existen)
DROP POLICY IF EXISTS "admin_can_create" ON clientes;
DROP POLICY IF EXISTS "admin_can_read" ON clientes;
DROP POLICY IF EXISTS "admin_can_update" ON clientes;
DROP POLICY IF EXISTS "admin_can_delete" ON clientes;
DROP POLICY IF EXISTS "Users can CRUD own records" ON clientes;

-- CREAR NUEVAS POLÍTICAS
-- Permitir SELECT: Usuario solo ve sus propios clientes
CREATE POLICY "clientes_select_own"
  ON clientes
  FOR SELECT
  USING (owner = auth.uid());

-- Permitir INSERT: Usuario solo inserta con su propio owner
CREATE POLICY "clientes_insert_own"
  ON clientes
  FOR INSERT
  WITH CHECK (owner = auth.uid());

-- Permitir UPDATE: Usuario solo actualiza sus clientes
CREATE POLICY "clientes_update_own"
  ON clientes
  FOR UPDATE
  USING (owner = auth.uid())
  WITH CHECK (owner = auth.uid());

-- Permitir DELETE: Usuario solo elimina sus clientes
CREATE POLICY "clientes_delete_own"
  ON clientes
  FOR DELETE
  USING (owner = auth.uid());

-- ============================================
-- 4. VERIFICAR QUE FUNCIONÓ
-- ============================================

-- Deberías ver:
-- - inventario: 4 políticas (select, insert, update, delete)
-- - clientes: 4 políticas (select, insert, update, delete)

SELECT 
  tablename,
  COUNT(*) as num_policies,
  array_agg(policyname) as policy_names
FROM pg_policies 
WHERE tablename IN ('inventario', 'clientes')
GROUP BY tablename
ORDER BY tablename;

-- ============================================
-- 5. PROBAR ACCESO (como usuario autenticado)
-- ============================================

-- Después de ejecutar esto, prueba:
-- 1. Agrega un producto en Mantente Connect
-- 2. Verifica que aparece aquí (debería ver 1 fila):
SELECT * FROM inventario LIMIT 1;

-- 3. Si ves datos, el RLS está funcionando correctamente

-- ============================================
-- 6. TABLA 'products' Y 'customers' (si existen)
-- ============================================

-- Si existen tablas 'products' y 'customers', hacer lo mismo:

ALTER TABLE products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can CRUD own records" ON products;
CREATE POLICY "products_select_own" ON products FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "products_insert_own" ON products FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "products_update_own" ON products FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "products_delete_own" ON products FOR DELETE USING (user_id = auth.uid());

ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can CRUD own records" ON customers;
CREATE POLICY "customers_select_own" ON customers FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "customers_insert_own" ON customers FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "customers_update_own" ON customers FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "customers_delete_own" ON customers FOR DELETE USING (user_id = auth.uid());