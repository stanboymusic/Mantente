-- 🗑️ LIMPIEZA DE DATOS DUPLICADOS DE SUPABASE
-- Ejecutar antes de hacer la migración limpia
-- ⚠️ ADVERTENCIA: Esto elimina TODOS los datos de las tablas. Hacer backup primero.

-- ═══════════════════════════════════════════════════════════
-- 1️⃣ ELIMINAR DATOS DE TABLAS RELACIONADAS PRIMERO
-- ═══════════════════════════════════════════════════════════

-- Eliminar order_items (depende de orders)
TRUNCATE TABLE order_items CASCADE;
ALTER TABLE order_items AUTO_INCREMENT = 1;

-- ═══════════════════════════════════════════════════════════
-- 2️⃣ ELIMINAR DATOS DE TABLAS PRINCIPALES
-- ═══════════════════════════════════════════════════════════

-- Eliminar orders (depende de customers)
TRUNCATE TABLE orders CASCADE;
ALTER TABLE orders AUTO_INCREMENT = 1;

-- Eliminar invoices (depende de customers)
TRUNCATE TABLE invoices CASCADE;
ALTER TABLE invoices AUTO_INCREMENT = 1;

-- Eliminar customers
TRUNCATE TABLE customers CASCADE;
ALTER TABLE customers AUTO_INCREMENT = 1;

-- Eliminar products
TRUNCATE TABLE products CASCADE;
ALTER TABLE products AUTO_INCREMENT = 1;

-- Eliminar returns (si existe)
TRUNCATE TABLE returns CASCADE;
ALTER TABLE returns AUTO_INCREMENT = 1;

-- ═══════════════════════════════════════════════════════════
-- 3️⃣ RESETEAR SECUENCIAS
-- ═══════════════════════════════════════════════════════════

-- Resetear todas las secuencias a 1
ALTER SEQUENCE order_items_id_seq RESTART WITH 1;
ALTER SEQUENCE orders_id_seq RESTART WITH 1;
ALTER SEQUENCE invoices_id_seq RESTART WITH 1;
ALTER SEQUENCE customers_id_seq RESTART WITH 1;
ALTER SEQUENCE products_id_seq RESTART WITH 1;
ALTER SEQUENCE returns_id_seq RESTART WITH 1;

-- ═══════════════════════════════════════════════════════════
-- 4️⃣ VERIFICACIÓN
-- ═══════════════════════════════════════════════════════════

-- Verificar que las tablas están vacías
SELECT 'products' as table_name, COUNT(*) as record_count FROM products
UNION ALL
SELECT 'customers', COUNT(*) FROM customers
UNION ALL
SELECT 'orders', COUNT(*) FROM orders
UNION ALL
SELECT 'order_items', COUNT(*) FROM order_items
UNION ALL
SELECT 'invoices', COUNT(*) FROM invoices
UNION ALL
SELECT 'returns', COUNT(*) FROM returns;

-- ✅ Si todo tiene COUNT = 0, las tablas están limpias