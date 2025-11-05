# 📊 MAPEO COMPLETO: LEGACY → SUPABASE

**Fecha**: 2025-11-05  
**Status**: ✅ Análisis COMPLETO

---

## 🎯 TABLAS PRINCIPALES (PRIORIDAD ALTA)

### 1️⃣ **CLIENTES → CUSTOMERS**

| Legacy (`clientes`) | Supabase (`customers`) | Tipo | Notas |
|---|---|---|---|
| `id` (bigint) | ❌ NO MAPEAR | AUTO UUID | Supabase genera UUID |
| `owner` (uuid) | `user_id` (uuid) | ✅ DIRECTO | Cambiar nombre |
| `nombre` (varchar) | `name` (varchar) | ✅ DIRECTO | Renombrar |
| `email` (varchar) | `email` (varchar) | ✅ DIRECTO | - |
| `telefono` (varchar) | `phone` (varchar) | ✅ DIRECTO | Renombrar |
| `direccion` (text) | `address` (text) | ✅ DIRECTO | Renombrar |
| `ciudad` (varchar) | `city` (varchar) | ✅ DIRECTO | - |
| `departamento` (varchar) | `state` (varchar) | ✅ DIRECTO | Renombrar |
| `ruc` (varchar) | `tax_id` (varchar) | ✅ DIRECTO | Renombrar |
| `razon_social` (varchar) | ❌ NO EXISTE | - | DESCARTADO |
| `notas` (text) | `notes` (text) | ✅ DIRECTO | Renombrar |
| `estado` (varchar) | `is_active` (boolean) | 🔄 CONVERTIR | 'activo' → true |
| `fecha_creacion` (timestamp) | `created_at` (timestamp) | ✅ DIRECTO | Renombrar |
| `updated_at` (timestamp) | `updated_at` (timestamp) | ✅ DIRECTO | - |
| **NUEVOS** | `code` (varchar) | 🆕 GENERAR | "CLI-{numero}" |
| **NUEVOS** | `zip_code` (varchar) | 🆕 NULL | No existe en legacy |
| **NUEVOS** | `country` (varchar) | 🆕 NULL | No existe en legacy |
| **NUEVOS** | `contact_person` (varchar) | 🆕 NULL | No existe en legacy |
| **NUEVOS** | `payment_terms` (varchar) | 🆕 NULL | No existe en legacy |
| **NUEVOS** | `credit_limit` (numeric) | 🆕 0 | No existe en legacy |

**Leyenda de mapeo:**
- ✅ DIRECTO = Mismo campo y tipo
- 🔄 CONVERTIR = Cambio de tipo/valor
- 🆕 GENERAR = Crear nuevo valor
- 🆕 NULL = Dejar NULL
- ❌ NO MAPEAR = Saltar

---

### 2️⃣ **INVENTARIO → PRODUCTS**

| Legacy (`inventario`) | Supabase (`products`) | Tipo | Notas |
|---|---|---|---|
| `id` (bigint) | ❌ NO MAPEAR | AUTO UUID | Supabase genera UUID |
| `owner` (uuid) | `user_id` (uuid) | ✅ DIRECTO | Cambiar nombre |
| `nombre` (varchar) | `name` (varchar) | ✅ DIRECTO | - |
| `cantidad` (int) | `quantity` (int) | ✅ DIRECTO | - |
| `precio` (numeric) | `price` (numeric) | ✅ DIRECTO | - |
| `descripcion` (text) | `description` (text) | ✅ DIRECTO | - |
| `categoria` (varchar) | `category` (varchar) | ✅ DIRECTO | - |
| `stock_minimo` (int) | ❌ NO EXISTE | - | DESCARTADO |
| `fecha_agregado` (date) | ❌ NO EXISTE | - | USAR `created_at` |
| `created_at` (timestamp) | `created_at` (timestamp) | ✅ DIRECTO | - |
| `updated_at` (timestamp) | `updated_at` (timestamp) | ✅ DIRECTO | - |
| **NUEVOS** | `code` (varchar) | 🆕 GENERAR | "INV-{id}" |
| **NUEVOS** | `cost` (numeric) | 🆕 NULL | No existe en legacy |
| **NUEVOS** | `image_url` (text) | 🆕 NULL | No existe en legacy |
| **NUEVOS** | `sku` (varchar) | 🆕 NULL | No existe en legacy |
| **NUEVOS** | `barcode` (varchar) | 🆕 NULL | No existe en legacy |
| **NUEVOS** | `is_active` (boolean) | 🆕 true | Default: activo |

---

### 3️⃣ **VENTAS → ORDERS + ORDER_ITEMS**

| Legacy (`ventas`) | Supabase (`orders`) | Tipo | Notas |
|---|---|---|---|
| `id` (bigint) | ❌ NO MAPEAR | AUTO UUID | Supabase genera UUID |
| `owner` (uuid) | `user_id` (uuid) | ✅ DIRECTO | - |
| `codigo_venta` (varchar) | `code` (varchar) | ✅ DIRECTO | Renombrar |
| `cliente` (varchar) | ❌ NO MAPEAR | - | Usar `customer_id` UUID |
| `cliente_id` (bigint) | `customer_id` (uuid) | 🔗 MAPEAR | Buscar en `customers` |
| `monto` (numeric) | `subtotal` (numeric) | ✅ DIRECTO | Renombrar |
| `descuento` (numeric) | `discount` (numeric) | ✅ DIRECTO | - |
| `total` (numeric) | `total` (numeric) | ✅ DIRECTO | - |
| `metodo_pago` (varchar) | `payment_method` (varchar) | ✅ DIRECTO | - |
| `fecha` (date) | `order_date` (timestamp) | 🔄 CONVERTIR | date → timestamp |
| `mes_cierre` (date) | ❌ NO EXISTE | - | DESCARTADO |
| `notas` (text) | `notes` (text) | ✅ DIRECTO | - |
| `created_at` (timestamp) | `created_at` (timestamp) | ✅ DIRECTO | - |
| `updated_at` (timestamp) | `updated_at` (timestamp) | ✅ DIRECTO | - |
| `facturado` (boolean) | ❌ NO EXISTE | - | DESCARTADO |
| **NUEVOS** | `status` (varchar) | 🆕 GENERAR | 'completed' |
| **NUEVOS** | `delivery_date` (timestamp) | 🆕 NULL | No existe en legacy |
| **NUEVOS** | `tax` (numeric) | 🆕 0 | No existe en legacy |
| **NUEVOS** | `payment_status` (varchar) | 🆕 'pending' | No existe en legacy |

**Para `productos_json` → `order_items`:**

```json
// Legacy estructura:
{
  "producto": "Collar Perlado",
  "cantidad": 6,
  "monto": 300
}

// Convertir a:
{
  "order_id": "uuid_de_la_orden",
  "product_id": "uuid_del_producto",
  "quantity": 6,
  "unit_price": 50,  // monto / cantidad
  "discount_percentage": 0,
  "line_total": 300,
  "notes": null
}
```

---

## 📦 TABLAS SECUNDARIAS (Verificar si migrar)

### 4️⃣ **DEVOLUCIONES** (Tabla Legacy)
- ✅ EXISTE en legacy, pero NO tiene tabla en Supabase
- **DECISIÓN**: ¿Crear tabla `returns` o guardar en otra tabla?

### 5️⃣ **FACTURAS** (Tabla Legacy)
- ✅ EXISTE en legacy
- 🔄 SUPABASE: Tiene tabla `invoices`
- **NOTA**: Estructura es similar pero campos extras

### 6️⃣ **HISTORIALMES** (Tabla Legacy)
- ✅ EXISTE en legacy
- ❌ NO EXISTE en Supabase
- **DECISIÓN**: ¿Mantener datos históricos?

---

## 🚀 PROCESO DE MIGRACIÓN RECOMENDADO

```
PASO 1: PRODUCTS (sin dependencias)
  └─ 3 productos → migrar

PASO 2: CUSTOMERS (sin dependencias)
  └─ 4 clientes → migrar
  └─ Generar mapeo: clientes.id → customers.id (nuevo UUID)

PASO 3: ORDERS (depende de CUSTOMERS)
  └─ 21 órdenes → migrar
  └─ Usar mapeo de clientes para customer_id

PASO 4: ORDER_ITEMS (depende de ORDERS + PRODUCTS)
  └─ Parsear productos_json
  └─ Insertar en order_items
```

---

## 🔍 TABLAS NO MAPEADAS (LEGACY)

| Tabla | Registros | ¿Migrar? | Notas |
|---|---|---|---|
| `averias` | ? | ❓ | No tiene equivalente en Supabase |
| `cierre_mes` | ? | ❓ | No tiene equivalente en Supabase |
| `devoluciones` | ? | ❓ | No tiene equivalente en Supabase |
| `egreso` | ? | ❓ | No tiene equivalente en Supabase |
| `facturas` | ? | ✅ REVISAR | Podría mapearse a `invoices` |
| `historialMeses` | ? | ❓ | No tiene equivalente en Supabase |
| `notas_entrega` | ? | ❓ | No tiene equivalente en Supabase |
| `pedidos` | ? | ❓ | No tiene equivalente en Supabase |
| `presupuestos` | ? | ❓ | No tiene equivalente en Supabase |

---

## 🎯 MAPEO DE IDs (CRÍTICO)

**Problema**: Legacy usa `bigint`, Supabase usa `uuid`

**Solución**: Crear tabla de mapeo temporal:

```javascript
// Durante migración, guardar:
{
  "tabla": "clientes",
  "id_legacy": 1,
  "id_nuevo": "40ad8ba9-1ffb-4092-b1d6-6c0d...",
  "codigo": "CLI-1"
}

// Usar este mapeo para:
// - ventas.cliente_id → orders.customer_id
// - productos en JSON → product_id UUIDs
```

---

## ✅ CHECKLIST

- [ ] Confirmar campos de mapeo
- [ ] Decidir qué tablas secundarias migrar
- [ ] Crear función de mapeo de IDs
- [ ] Crear función `migrateCustomers()`
- [ ] Crear función `migrateProducts()`
- [ ] Crear función `migrateOrders()`
- [ ] Crear función `migrateOrderItems()`
- [ ] Pruebas de integridad referencial
- [ ] Ejecutar migración completa
- [ ] Verificar datos duplicados
