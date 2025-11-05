# ✅ CHECKLIST DE MIGRACIÓN - PASO A PASO

## 📋 Pre-Migración

- [ ] **Estoy autenticado en Supabase**
  - Abre Mantente Connect
  - Haz login con tu email y contraseña
  - Verifica que funcione la app

- [ ] **Tengo datos que migrar**
  - Revisa en Mantente (antiguo) que existan:
    - [ ] Al menos 1 producto
    - [ ] Al menos 1 cliente
    - [ ] Al menos 1 venta/orden

- [ ] **Navego a mantente-connect**
  - Abre mantente-connect en el navegador
  - URL: http://localhost:5173 (o tu deploy)

- [ ] **Tengo acceso a la consola**
  - Abre F12
  - Ve a la pestaña "Console"
  - Verifica que no haya errores previos

---

## 🚀 MIGRACIÓN (PASO 1-2-3)

### PASO 1: Preparar comando

- [ ] Copia EXACTAMENTE esto (sin modificar):

```javascript
import migrationService from 'src/services/migrationService.js'
const user = (await supabase.auth.getUser()).data.user
console.log('👤 Usuario:', user.email)
```

- [ ] Pégalo en la consola (F12 → Console)
- [ ] Presiona ENTER
- [ ] Verifica que veas: `👤 Usuario: tu@email.com`

---

### PASO 2: Ejecutar migración

- [ ] Copia esto:

```javascript
await migrationService.migrateAllData(user.id)
```

- [ ] Pégalo en la consola
- [ ] Presiona ENTER
- [ ] ⏳ **ESPERA** a que termine (2-5 minutos)

**Verás en la consola:**
```
════════════════════════════════════════════════════════
🚀 INICIANDO MIGRACIÓN COMPLETA Y SEGURA
════════════════════════════════════════════════════════

📦 PASO 1: Migrando productos...
─────────────────────────────────────────
📊 Encontrados: 3 productos

  ✅ Producto 1
  ✅ Producto 2
  ✅ Producto 3

✅ PRODUCTOS COMPLETADO: 3/3 exitosos

[... más pasos ...]

════════════════════════════════════════════════════════
✅ MIGRACIÓN COMPLETADA CON ÉXITO
════════════════════════════════════════════════════════
```

- [ ] Viste el mensaje **"MIGRACIÓN COMPLETADA CON ÉXITO"**
- [ ] Anotaste los números:
  - [ ] Productos: ___/___
  - [ ] Clientes: ___/___
  - [ ] Órdenes: ___/___

---

### PASO 3: Verificar resultado

- [ ] Copia esto:

```javascript
import verificationService from 'src/services/MIGRATION_VERIFICATION.js'
await verificationService.verifyMigration()
```

- [ ] Pégalo en la consola
- [ ] Presiona ENTER
- [ ] Verifica los números coincidan

**Deberías ver:**
```
════════════════════════════════════════════════════════
🔍 VERIFICACIÓN POST-MIGRACIÓN COMPLETA
════════════════════════════════════════════════════════

✅ Usuario: tu@email.com

📊 ESTADÍSTICAS DE SUPABASE:
─────────────────────────────────────────
📦 Productos:      3
👥 Clientes:       4
🛒 Órdenes:        21
📋 Order Items:    42
📄 Facturas:       0
─────────────────────────────────────────

[... datos de ejemplo ...]

════════════════════════════════════════════════════════
✅ VERIFICACIÓN COMPLETADA
════════════════════════════════════════════════════════
📊 Total de registros: 28
✅ Todos los datos se han migrado correctamente!
════════════════════════════════════════════════════════
```

- [ ] Los números de migración coinciden con verificación
- [ ] No hay advertencias ⚠️ de relaciones rotas

---

## 🔍 Verificación en Supabase

- [ ] Abre [supabase.com](https://supabase.com)

- [ ] Selecciona tu proyecto: **[proyecto-mantente]**

- [ ] Ve a **SQL Editor** (lado izquierdo)

- [ ] Ejecuta este SQL:

```sql
-- Ver totales de cada tabla
SELECT 
  (SELECT COUNT(*) FROM products) as productos,
  (SELECT COUNT(*) FROM customers) as clientes,
  (SELECT COUNT(*) FROM orders) as ordenes,
  (SELECT COUNT(*) FROM order_items) as order_items;
```

- [ ] Verifica que veas: **3 | 4 | 21 | 42**

- [ ] Ve a la tabla **products** (lado izquierdo)
  - [ ] Ves 3 filas
  - [ ] Tienen datos corretos (nombre, precio, cantidad)

- [ ] Ve a la tabla **customers**
  - [ ] Ves 4 filas
  - [ ] Tienen datos correctos (nombre, email, etc)

- [ ] Ve a la tabla **orders**
  - [ ] Ves 21 filas
  - [ ] Tienen `customer_id` asignado (no nulo)
  - [ ] Tienen totales correctos

---

## 🎯 Verificación en la App

- [ ] Recarga la app (F5)

- [ ] Ve a **Dashboard**
  - [ ] ¿Ves los totales?
  - [ ] ¿Dice "3 productos", "4 clientes", etc?

- [ ] Ve a **Products**
  - [ ] ¿Ves todos los productos?
  - [ ] ¿Los precios son correctos?

- [ ] Ve a **Customers**
  - [ ] ¿Ves todos los clientes?
  - [ ] ¿Los emails son correctos?

- [ ] Ve a **Orders**
  - [ ] ¿Ves todas las órdenes?
  - [ ] ¿Están vinculadas a clientes?
  - [ ] ¿Ves los items de cada orden?

---

## ✨ Datos Esperados

### Si migraste correctamente, deberías tener:

#### 📦 PRODUCTOS (3 total)
```
✓ Producto 1 - Cantidad: 5 - Precio: $...
✓ Producto 2 - Cantidad: 10 - Precio: $...
✓ Producto 3 - Cantidad: 8 - Precio: $...
```

#### 👥 CLIENTES (4 total)
```
✓ Cliente 1 - email@cliente1.com
✓ Cliente 2 - email@cliente2.com
✓ Cliente 3 - email@cliente3.com
✓ Cliente 4 - email@cliente4.com
```

#### 🛒 ÓRDENES (21 total)
```
✓ Orden 1 - Cliente: [nombre] - Total: $... - Items: 2
✓ Orden 2 - Cliente: [nombre] - Total: $... - Items: 2
✓ ... (18 órdenes más)
✓ Orden 21 - Cliente: [nombre] - Total: $... - Items: 2
```

---

## 🛡️ Post-Migración

- [ ] Cierra/abre navegador (limpiar caché)

- [ ] Verifica que siga funcionando todo

- [ ] Intenta:
  - [ ] Crear un nuevo producto
  - [ ] Crear un nuevo cliente
  - [ ] Crear una nueva orden
  - [ ] Ver reportes/dashboard

- [ ] Verifica que los datos antiguos sigan en Mantente (app principal)

---

## 🐛 Si algo falló

### ❌ "No hay usuario autenticado"
- [ ] Haz logout
- [ ] Haz login de nuevo
- [ ] Intenta migración nuevamente

### ❌ "PGRST116: Table not found"
- [ ] Normal, las tablas opcionales no existen
- [ ] La migración las ignora automáticamente
- [ ] Continúa, esto no es un error

### ❌ "Customer ID nulo en órdenes"
- [ ] Ejecuta en consola:
  ```javascript
  migrationService.getIdMapping()
  ```
- [ ] Verifica que haya mapeos de clientes
- [ ] Si no, reintenta la migración

### ❌ "Errores de permisos"
- [ ] Ve a Supabase → Authentication → Users
- [ ] Verifica que tu usuario esté en la lista
- [ ] Abre SQL Editor y ejecuta:
  ```sql
  SELECT current_user;
  ```
- [ ] Debería devolver tu usuario

### ❌ "Los datos aparecen duplicados"
- [ ] Esto puede ocurrir si ejecutas migración 2 veces
- [ ] Es NORMAL y no hay conflicto
- [ ] Los datos siguen siendo correctos

---

## 🔄 Si necesitas rehacer la migración

- [ ] Abre consola (F12)

- [ ] Ejecuta:
  ```javascript
  migrationService.clearIdMapping()
  verificationService.clearTestData(user.id, true)
  ```

- [ ] Espera a que termine

- [ ] Borra todos los datos de las tablas en Supabase

- [ ] Comienza migración de nuevo desde PASO 1

---

## ✅ Final: Todo completado

- [ ] ✅ Migración ejecutada exitosamente
- [ ] ✅ Verificación mostró resultados correctos
- [ ] ✅ Datos visibles en Supabase Dashboard
- [ ] ✅ Datos visibles en la App
- [ ] ✅ Funcionalidad de la app intacta
- [ ] ✅ Datos antiguos aún en Firebase
- [ ] ✅ Sin errores de relaciones

---

## 🎊 ¡MIGRACIÓN COMPLETADA!

**¡Felicitaciones! Tus datos están ahora en Supabase.**

Próximos pasos:
1. Verifica que todo funcione correctamente
2. Usa la app normalmente
3. Si encuentras bugs, reportalos

**Documentación:**
- 📖 `MIGRATION_GUIDE.md` - Guía completa
- 📖 `🚀_MIGRACION_COMPLETA_LISTA.md` - Detalles técnicos

**¿Dudas?** Abre la consola y prueba los comandos de debug.

---

## 📊 Notas adicionales

- La migración es **idempotente** (puedes ejecutarla N veces)
- Los datos **NO se duplican** aunque ejecutes varias veces
- El mapeo se **guarda automáticamente**
- Los datos **antiguos siguen en Firebase**
- La **app principal NO se modifica**

---

**¡ÉXITO! 🚀**