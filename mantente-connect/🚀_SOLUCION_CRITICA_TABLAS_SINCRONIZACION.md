# 🚀 SOLUCIÓN CRÍTICA: Corrección de Sincronización Mantente ↔ Mantente Connect

## 🔴 El Problema

Los datos desaparecían porque **Mantente Connect escribía en tablas diferentes que Mantente leía**:

| Dato | Mantente Connect | Mantente | Estado |
|------|------------------|----------|--------|
| **Clientes** | `customers` ❌ | `clientes` ✅ | **INCOMPATIBLE** |
| **Productos** | `products` ❌ | `inventario` ✅ | **INCOMPATIBLE** |

**Resultado:** Los datos se guardaban en IndexedDB local, se sincronizaban a las tablas `customers` y `products`, pero Mantente buscaba en `clientes` e `inventario`. **Siempre vacío.**

---

## ✅ La Solución

He corregido **`supabaseService.js`** para:

### 1️⃣ **Usar las tablas correctas de Mantente**
```javascript
// ANTES ❌
await supabase.from('customers').insert([customer])
await supabase.from('products').insert([product])

// AHORA ✅
await supabase.from('clientes').insert([mapped_customer])
await supabase.from('inventario').insert([mapped_product])
```

### 2️⃣ **Mapear campos automáticamente**

Creé funciones que convierten el formato de Mantente Connect al formato de Mantente:

**Clientes:**
```javascript
customer.name → cliente.nombre
customer.phone → cliente.telefono
customer.address → cliente.direccion
customer.city → cliente.ciudad
customer.state → cliente.departamento
customer.tax_id → cliente.ruc
customer.user_id → cliente.owner (el campo de usuario)
customer.is_active → cliente.estado ("activo" o "inactivo")
```

**Productos:**
```javascript
product.name → product.nombre
product.quantity → product.cantidad
product.price → product.precio
product.description → product.descripcion
product.category → product.categoria
product.user_id → product.owner
```

---

## 📋 Cambios Realizados

**Archivo:** `mantente-connect/src/services/supabaseService.js`

✅ Agregadas 4 funciones de mapeo:
- `mapProductToMantente()` - Convierte producto al formato Mantente
- `mapProductFromMantente()` - Convierte producto del formato Mantente
- `mapCustomerToMantente()` - Convierte cliente al formato Mantente  
- `mapCustomerFromMantente()` - Convierte cliente del formato Mantente

✅ Actualizado `supabaseSyncService`:
- `createProduct()` - Usa tabla `inventario` + mapeo
- `updateProduct()` - Usa tabla `inventario` + mapeo
- `deleteProduct()` - Usa tabla `inventario`
- `createCustomer()` - Usa tabla `clientes` + mapeo
- `updateCustomer()` - Usa tabla `clientes` + mapeo
- `deleteCustomer()` - Usa tabla `clientes`
- `getProducts()` - Lee de `inventario` + mapea respuesta
- `getCustomers()` - Lee de `clientes` + mapea respuesta

---

## 🧪 PRUEBA AHORA (5 minutos)

### Paso 1: Reinicia la app
```bash
npm run dev
```

### Paso 2: Abre DevTools (F12)
Ve a Console y busca mensajes como:
```
👥 Cliente mapeado a formato Mantente: { nombre: "ADRC", owner: "...", ... }
📊 Producto mapeado a formato Mantente: { nombre: "Test", cantidad: 5, ... }
✅ Sincronización completada - 2 exitosos, 0 fallidos
```

### Paso 3: Agrega un cliente de prueba
1. **Mantente Connect** → **Clientes** → **+ Nuevo Cliente**
2. Llena datos (ej: "TEST SYNC" - datos ficticios)
3. Click **Guardar**
4. Espera a que sincronice

### Paso 4: Verifica en Mantente
1. **Mantente** (otra tab) → **Clientes**
2. **Refresca la página** (F5)
3. ¿Aparece "TEST SYNC"? ✅

### Paso 5: Refresca Mantente Connect
¿Los datos **persisten**? ✅

---

## 🎯 Resultados Esperados

| Acción | Antes ❌ | Ahora ✅ |
|--------|---------|---------|
| Agregar cliente en MC | ✅ Se guarda | ✅ Se guarda |
| Sincronización MC | ✅ Dice "Completada" | ✅ Se sincroniza a Supabase |
| Ver en Mantente | ❌ No aparece | ✅ **APARECE** |
| Refrescar MC | ❌ Desaparece | ✅ **PERSISTE** |
| Refrescar Mantente | ❌ No aparece | ✅ **APARECE** |

---

## 🔍 Debugging: Si Aún No Funciona

### Escenario 1: Los datos aún desaparecen al refrescar
**Verifica:**
```javascript
// En DevTools Console:
// 1. ¿El localStorage/IndexedDB mantiene datos?
await (await indexedDB.databases())[0] // Debe mostrar mantente-db

// 2. Después de sincronizar, verifica sync_queue
const stores = await (await indexedDB.open('mantente-db')).getAll('sync_queue')
console.log(stores) // Debe estar vacío si sincronizó
```

**Posible causa:** Las RLS policies de Supabase están bloqueando las inserciones

### Escenario 2: Console dice "Resultado vacío"
**Significa:** Supabase rechaza silenciosamente (probablemente violación de RLS)

**Solución:**
1. Ve a Supabase Dashboard → SQL Editor
2. Ejecuta:
```sql
-- Permite insert a la tabla clientes para el usuario
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;

ALTER POLICY "Usuarios solo ven sus propios datos" ON clientes
  USING (owner = auth.uid());
```

### Escenario 3: Console muestra error "Column X does not exist"
**Significa:** Falta ajustar el mapeo de campos

**Solución:** Comparte el error exacto

---

## 📊 Mapeo Completo de Campos

### CLIENTES (customers → clientes)

| Mantente Connect | Mantente | Tipo | Valor |
|------------------|----------|------|-------|
| `id` | `id` | uuid | Mismo |
| `user_id` | `owner` | uuid | Mismo |
| `code` | (descartado) | - | - |
| `name` | `nombre` | string | Mismo |
| `email` | `email` | string | Mismo |
| `phone` | `telefono` | string | Mismo |
| `address` | `direccion` | text | Mismo |
| `city` | `ciudad` | string | Mismo |
| `state` | `departamento` | string | Mismo |
| `zip_code` | (descartado) | - | - |
| `country` | (descartado) | - | - |
| `tax_id` | `ruc` | string | Mismo |
| `contact_person` | `razon_social` | string | Mismo |
| `payment_terms` | (descartado) | - | - |
| `credit_limit` | (descartado) | - | - |
| `is_active` | `estado` | boolean→string | "activo"/"inactivo" |
| `notes` | `notas` | text | Mismo |
| `created_at` | `fecha_creacion` | timestamp | Mismo |
| `updated_at` | `updated_at` | timestamp | Mismo |

### PRODUCTOS (products → inventario)

| Mantente Connect | Mantente | Tipo | Valor |
|------------------|----------|------|-------|
| `id` | `id` | uuid | Mismo |
| `user_id` | `owner` | uuid | Mismo |
| `code` | (descartado) | - | - |
| `name` | `nombre` | string | Mismo |
| `quantity` | `cantidad` | integer | Mismo |
| `price` | `precio` | numeric | Mismo |
| `cost` | (descartado) | - | - |
| `description` | `descripcion` | text | Mismo |
| `category` | `categoria` | string | Mismo |
| `image_url` | (descartado) | - | - |
| `sku` | (descartado) | - | - |
| `barcode` | (descartado) | - | - |
| `is_active` | (descartado) | - | - |
| (nuevo) | `stock_minimo` | integer | Copia de `cantidad` |
| (nuevo) | `fecha_agregado` | date | Hoy |
| `created_at` | `created_at` | timestamp | Mismo |
| `updated_at` | `updated_at` | timestamp | Mismo |

---

## ✨ Próximos Pasos

1. **Prueba ahora** (sección de arriba)
2. **Reporta resultados** - Comparte:
   - Screenshot de DevTools Console
   - Si aparece en Mantente ¿sí o no?
   - Si persiste al refrescar ¿sí o no?
3. **Si hay errores** - Copia el mensaje exacto de Console

---

## 🎉 Resultado Final

Cuando todo funcione:

✅ Agregas cliente en Mantente Connect  
✅ Console muestra "Cliente mapeado..." y "Sincronización completada"  
✅ Refrescas Mantente (otra tab)  
✅ **El cliente aparece** en la lista de Mantente  
✅ Refrescas Mantente Connect  
✅ **El cliente persiste** en Mantente Connect  
✅ La app es funcional 🚀
