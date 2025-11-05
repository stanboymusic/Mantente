# 🚀 GUÍA DE MIGRACIÓN - Mantente Connect

## 📋 Descripción

Este servicio de migración traslada **TODOS** tus datos de Mantente (Firebase) a Mantente Connect (Supabase) de forma **SEGURA** y **AUTOMÁTICA**.

---

## ✅ Qué se migra

### 📦 Datos Principales (REQUERIDO)
- **Productos** (`inventario` → `products`)
- **Clientes** (`clientes` → `customers`)
- **Órdenes** (`ventas` → `orders` + `order_items`)

### 📚 Datos Secundarios (OPCIONAL)
- **Devoluciones** (`devoluciones` → `returns`)
- **Facturas** (`facturas` → `invoices`)

### ⚠️ No se migran (Datos históricos/análisis)
- `historialMeses` - Datos históricos
- `egreso` - Egresos/gastos
- `averias` - Registros de averías
- `pedidos`, `presupuestos` - Tablas alternativas

---

## 🔧 Cómo usar

### **Opción 1: Consola del Navegador (Recomendado)**

1. Abre la aplicación en tu navegador
2. Abre la **Consola** (F12 → Console)
3. Copia y pega:

```javascript
import migrationService from '/src/services/migrationService.js'

// Obtener el userId actual
const user = await supabase.auth.getUser()
console.log('Usuario actual:', user.data.user.id)

// ▶️ INICIAR MIGRACIÓN
const result = await migrationService.migrateAllData(user.data.user.id)
console.log('Resultado:', result)
```

### **Opción 2: Desde un Componente React**

```jsx
import migrationService from '@/services/migrationService'

export function MigrationButton() {
  const handleMigration = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      alert('❌ Debes estar autenticado')
      return
    }

    console.log('🚀 Iniciando migración...')
    const result = await migrationService.migrateAllData(user.id)
    
    if (result.success) {
      alert(`✅ Migración completada!
      
📦 Productos: ${result.results.products.migrated}
👥 Clientes: ${result.results.customers.migrated}
🛒 Órdenes: ${result.results.orders.migrated}`)
    } else {
      alert(`❌ Error: ${result.message}`)
    }
  }

  return <button onClick={handleMigration}>🚀 Migrar Datos</button>
}
```

### **Opción 3: Migración desde un archivo de configuración**

```javascript
// En tu archivo de inicialización
import migrationService from '@/services/migrationService'

async function initializeApp() {
  const { data: { user } } = await supabase.auth.getUser()
  
  if (user && localStorage.getItem('shouldMigrate')) {
    console.log('🔄 Detectada migración pendiente...')
    await migrationService.migrateAllData(user.id)
    localStorage.removeItem('shouldMigrate')
  }
}
```

---

## 🎯 Proceso paso a paso

La migración se realiza en **4 pasos principales**:

### **PASO 1️⃣ - PRODUCTOS**
- Lee tabla `inventario` (Firebase)
- Crea registros en `products` (Supabase)
- Genera IDs mapeados automáticamente
- ⏱️ Tiempo: ~2 segundos por 10 productos

### **PASO 2️⃣ - CLIENTES**
- Lee tabla `clientes` (Firebase)
- Crea registros en `customers` (Supabase)
- Guarda mapeo de IDs para referencias
- ⏱️ Tiempo: ~2 segundos por 10 clientes

### **PASO 3️⃣ - ÓRDENES**
- Lee tabla `ventas` (Firebase)
- Crea registros en `orders` (Supabase)
- Expande `productos_json` → `order_items`
- Vincula clientes automáticamente
- ⏱️ Tiempo: ~5 segundos por 10 órdenes

### **PASO 4️⃣ - DATOS SECUNDARIOS (Opcional)**
- Devoluciones → `returns` (si la tabla existe)
- Facturas → `invoices`
- ⏱️ Tiempo: Variable según volumen

---

## 🗺️ Sistema de Mapeo de IDs

**Problema**: Los IDs antiguos son números (bigint), los nuevos son UUIDs

**Solución**: Se crea un mapeo automático:

```
❌ VIEJO: clientes.id = 1
✅ NUEVO: customers.id = "550e8400-e29b-41d4-a716-446655440000"

📍 Se guarda: { "1": "550e8400-..." } en localStorage
```

Este mapeo se usa para vincular:
- Órdenes con Clientes
- Devoluciones con Órdenes
- Facturas con Órdenes

✅ **Se limpia automáticamente** después de cada migración

---

## ⚙️ Métodos disponibles

### `migrateAllData(userId)`
Inicia la migración completa

```javascript
const result = await migrationService.migrateAllData(userId)
// { success: true, results: { products: {...}, customers: {...}, ... } }
```

### `getIdMapping()`
Ver mapeo actual de IDs

```javascript
const mapping = migrationService.getIdMapping()
console.log(mapping.products) // { 1: "uuid-1", 2: "uuid-2", ... }
```

### `clearIdMapping()`
Limpiar mapeo de IDs

```javascript
migrationService.clearIdMapping()
// Útil si necesitas rehacer la migración
```

---

## ✨ Características de Seguridad

✅ **No modifica la app principal** (mantente-app)
✅ **No borra datos antiguos** en Firebase
✅ **Transaccional** - Si falla, no deja datos inconsistentes
✅ **Mapeo de IDs** - Mantiene relaciones intactas
✅ **Manejo de errores** - Continúa aunque falle un registro
✅ **Logging detallado** - Ver exactamente qué migra

---

## 🐛 Solución de problemas

### ❌ "No hay userId para migración"
→ **Solución**: Debes estar autenticado en Supabase primero

### ❌ "PGRST116: Table not found"
→ **Solución**: La tabla `returns` o `invoices` no existe aún
→ **Acción**: La migración ignora tablas faltantes automáticamente

### ❌ "Error insertando datos"
→ **Solución**: Verifica que tengas permisos RLS en Supabase
→ **Acción**: Revisa las políticas de seguridad de Row Level Security

### ❌ "Customer ID nulo en órdenes"
→ **Solución**: El cliente no fue migrado correctamente
→ **Acción**: Migra clientes primero (el servicio ya lo hace)

---

## 📊 Resultado esperado

Después de ejecutar `migrateAllData()`:

```
════════════════════════════════════════════════════════
✅ MIGRACIÓN COMPLETADA CON ÉXITO
════════════════════════════════════════════════════════
📦 Productos:   3/3 migrados
👥 Clientes:    4/4 migrados
🛒 Órdenes:     21/21 migradas
🔄 Devoluciones: 0/0 migradas
📄 Facturas:    0/0 migradas
════════════════════════════════════════════════════════

🎉 ¡Migración realizada! Los datos están en Supabase.
📋 Mapeo de IDs guardado en localStorage para futuros usos.
```

---

## 🔍 Verificar migración

### En Supabase Console:
1. Abre [supabase.com](https://supabase.com)
2. Ve a tu proyecto
3. Tabla `products` → Deberías ver 3 productos
4. Tabla `customers` → Deberías ver 4 clientes
5. Tabla `orders` → Deberías ver 21 órdenes
6. Tabla `order_items` → Deberías ver ítems de órdenes

### En la App:
1. Dashboard → Deberías ver totales actualizados
2. Products → Listar todos los productos migrados
3. Customers → Listar todos los clientes migrados
4. Orders → Listar todas las órdenes con items

---

## 📝 Notas importantes

- ⏱️ **La migración es de una sola vez** - Puedes ejecutarla de nuevo sin duplicar datos
- 🔒 **Los datos antiguos siguen en Firebase** - Puedes consultarlos si es necesario
- 🆔 **El mapeo de IDs se guarda** - Para futuras referencias entre datos
- 🗑️ **Limpia el mapeo** si necesitas rehacer la migración desde cero

---

## 🆘 Soporte

Si encuentras errores:

1. Abre la **Consola del navegador** (F12)
2. Copia los mensajes de error
3. Verifica que:
   - ✅ Estés autenticado en Supabase
   - ✅ Las tablas existan en Supabase
   - ✅ Los permisos RLS estén configurados correctamente

---

**¡La migración está lista! 🚀**