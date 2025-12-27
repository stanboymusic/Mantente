-- =====================================================
-- CONFIGURACIÓN BACKEND AUTOMÁTICO PARA MANTENTE
-- Procesamiento automático de ventas offline-first
-- =====================================================

-- 1. HABILITAR RLS EN TODAS LAS TABLAS
-- =====================================================

ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventario ENABLE ROW LEVEL SECURITY;
ALTER TABLE ventas ENABLE ROW LEVEL SECURITY;

-- 2. POLÍTICAS RLS PARA clientes
-- =====================================================

DROP POLICY IF EXISTS "clientes_select_own" ON clientes;
DROP POLICY IF EXISTS "clientes_insert_own" ON clientes;
DROP POLICY IF EXISTS "clientes_update_own" ON clientes;
DROP POLICY IF EXISTS "clientes_delete_own" ON clientes;

CREATE POLICY "clientes_select_own"
  ON clientes FOR SELECT
  USING (user_id = @request.auth.id);

CREATE POLICY "clientes_insert_own"
  ON clientes FOR INSERT
  WITH CHECK (user_id = @request.auth.id);

CREATE POLICY "clientes_update_own"
  ON clientes FOR UPDATE
  USING (user_id = @request.auth.id)
  WITH CHECK (user_id = @request.auth.id);

CREATE POLICY "clientes_delete_own"
  ON clientes FOR DELETE
  USING (user_id = @request.auth.id);

-- 3. POLÍTICAS RLS PARA inventario
-- =====================================================

DROP POLICY IF EXISTS "inventario_select_own" ON inventario;
DROP POLICY IF EXISTS "inventario_insert_own" ON inventario;
DROP POLICY IF EXISTS "inventario_update_own" ON inventario;
DROP POLICY IF EXISTS "inventario_delete_own" ON inventario;

CREATE POLICY "inventario_select_own"
  ON inventario FOR SELECT
  USING (user_id = @request.auth.id);

CREATE POLICY "inventario_insert_own"
  ON inventario FOR INSERT
  WITH CHECK (user_id = @request.auth.id);

CREATE POLICY "inventario_update_own"
  ON inventario FOR UPDATE
  USING (user_id = @request.auth.id)
  WITH CHECK (user_id = @request.auth.id);

CREATE POLICY "inventario_delete_own"
  ON inventario FOR DELETE
  USING (user_id = @request.auth.id);

-- 4. POLÍTICAS RLS PARA ventas
-- =====================================================

DROP POLICY IF EXISTS "ventas_select_own" ON ventas;
DROP POLICY IF EXISTS "ventas_insert_own" ON ventas;
DROP POLICY IF EXISTS "ventas_update_own" ON ventas;
DROP POLICY IF EXISTS "ventas_delete_own" ON ventas;

CREATE POLICY "ventas_select_own"
  ON ventas FOR SELECT
  USING (user_id = @request.auth.id);

CREATE POLICY "ventas_insert_own"
  ON ventas FOR INSERT
  WITH CHECK (user_id = @request.auth.id);

CREATE POLICY "ventas_update_own"
  ON ventas FOR UPDATE
  USING (user_id = @request.auth.id)
  WITH CHECK (user_id = @request.auth.id);

CREATE POLICY "ventas_delete_own"
  ON ventas FOR DELETE
  USING (user_id = @request.auth.id);

-- 5. FUNCIÓN PARA PROCESAR VENTAS AUTOMÁTICAMENTE
-- =====================================================

CREATE OR REPLACE FUNCTION procesar_venta_automatica()
RETURNS TRIGGER AS $$
DECLARE
    producto_record RECORD;
    cantidad_disponible INTEGER;
    cantidad_solicitada INTEGER;
    total_a_descontar INTEGER := 0;
BEGIN
    -- Solo procesar ventas con estado 'orden' y origen 'mantente_connect'
    IF NEW.estado = 'orden' AND NEW.origen = 'mantente_connect' THEN

        -- Verificar stock para todos los productos
        FOR producto_record IN
            SELECT
                (jsonb_array_elements(NEW.productos_json))->>'nombre' as nombre,
                ((jsonb_array_elements(NEW.productos_json))->>'cantidad')::INTEGER as cantidad
        LOOP
            -- Buscar producto en inventario
            SELECT cantidad INTO cantidad_disponible
            FROM inventario
            WHERE nombre = producto_record.nombre AND user_id = NEW.user_id;

            IF cantidad_disponible IS NULL THEN
                cantidad_disponible := 0;
            END IF;

            -- Verificar si hay suficiente stock
            IF cantidad_disponible < producto_record.cantidad THEN
                -- Marcar venta como error de stock
                UPDATE ventas
                SET estado = 'error_stock',
                    notas = COALESCE(notas, '') || ' | ERROR: Stock insuficiente para ' || producto_record.nombre
                WHERE id = NEW.id;

                -- Notificar error (opcional)
                RAISE NOTICE 'Stock insuficiente para producto %: solicitado %, disponible %',
                    producto_record.nombre, producto_record.cantidad, cantidad_disponible;

                RETURN NEW;
            END IF;

            total_a_descontar := total_a_descontar + producto_record.cantidad;
        END LOOP;

        -- Si hay stock suficiente, procesar la venta
        -- Descontar inventario
        FOR producto_record IN
            SELECT
                (jsonb_array_elements(NEW.productos_json))->>'nombre' as nombre,
                ((jsonb_array_elements(NEW.productos_json))->>'cantidad')::INTEGER as cantidad
        LOOP
            UPDATE inventario
            SET cantidad = cantidad - producto_record.cantidad,
                updated = NOW()
            WHERE nombre = producto_record.nombre AND user_id = NEW.user_id;
        END LOOP;

        -- Cambiar estado de la venta a 'confirmada'
        UPDATE ventas
        SET estado = 'confirmada',
            notas = COALESCE(notas, '') || ' | Procesada automáticamente desde Mantente Connect'
        WHERE id = NEW.id;

        -- Aquí se podría agregar lógica para generar factura automáticamente
        -- Por ahora, solo marcamos como confirmada

        RAISE NOTICE 'Venta % procesada automáticamente: % productos descontados del inventario',
            NEW.id, total_a_descontar;

    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. CREAR TRIGGER PARA PROCESAMIENTO AUTOMÁTICO
-- =====================================================

DROP TRIGGER IF EXISTS trigger_procesar_venta_automatica ON ventas;

CREATE TRIGGER trigger_procesar_venta_automatica
    AFTER INSERT ON ventas
    FOR EACH ROW
    EXECUTE FUNCTION procesar_venta_automatica();

-- 7. VERIFICACIÓN DE CONFIGURACIÓN
-- =====================================================

-- Verificar que RLS esté habilitado
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('clientes', 'inventario', 'ventas')
ORDER BY tablename;

-- Verificar políticas RLS
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('clientes', 'inventario', 'ventas')
ORDER BY tablename, policyname;

-- Verificar trigger
SELECT event_object_table, trigger_name, event_manipulation, action_timing
FROM information_schema.triggers
WHERE event_object_table = 'ventas'
AND trigger_name = 'trigger_procesar_venta_automatica';

-- 8. MENSAJE DE CONFIRMACIÓN
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '=================================================';
    RAISE NOTICE 'CONFIGURACIÓN BACKEND AUTOMÁTICA COMPLETADA';
    RAISE NOTICE '=================================================';
    RAISE NOTICE '✓ RLS habilitado en todas las tablas';
    RAISE NOTICE '✓ Políticas de seguridad configuradas';
    RAISE NOTICE '✓ Procesamiento automático de ventas activado';
    RAISE NOTICE '✓ Trigger para descontar inventario operativo';
    RAISE NOTICE '';
    RAISE NOTICE 'Ahora las ventas con estado=''orden'' y origen=''mantente_connect''';
    RAISE NOTICE 'se procesarán automáticamente al sincronizarse.';
    RAISE NOTICE '=================================================';
END $$;