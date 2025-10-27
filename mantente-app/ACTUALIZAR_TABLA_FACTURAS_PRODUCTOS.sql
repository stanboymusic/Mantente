-- Script para agregar columna de productos a la tabla facturas
-- Este script es IDEMPOTENTE (seguro ejecutar múltiples veces)

ALTER TABLE facturas ADD COLUMN IF NOT EXISTS productos_json JSONB DEFAULT '[]'::jsonb;

-- Comentario de la columna para documentación
COMMENT ON COLUMN facturas.productos_json IS 'Array JSON con los productos de la factura: [{"nombre": "Producto 1", "cantidad": 1, "precio_unitario": 100, "subtotal": 100}, ...]';

-- Fin del script