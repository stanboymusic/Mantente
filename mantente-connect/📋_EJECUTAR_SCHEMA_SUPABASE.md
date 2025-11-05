# 📋 GUÍA: Crear Tablas en Supabase

## 🎯 OBJETIVO

Ejecutar el schema SQL en Supabase para crear todas las tablas que necesita Mantente Connect:
- ✅ products (Productos)
- ✅ customers (Clientes)
- ✅ orders (Órdenes)
- ✅ order_items (Detalles de órdenes)
- ✅ invoices (Facturas)
- ✅ sync_log (Log de sincronización)

**Tiempo estimado: 3 minutos** ⏱️

---

## 📍 PASO 1: Abre Supabase

### 1.1 Ve a https://supabase.co

```
1. Abre en tu navegador:
   https://supabase.co

2. Inicia sesión con tu cuenta
   (la que creaste con el proyecto)
```

### 1.2 Selecciona tu proyecto

```
Dashboard de Supabase
  ↓
Busca "unqdliyomljchclwwbzy"
  ↓
Haz clic para abrir
```

---

## 📍 PASO 2: Abre SQL Editor

```
Dentro de tu proyecto:
  ├─ Sidebar izquierdo
  ├─ Busca "SQL Editor"
  └─ Haz clic

Verás:
┌─────────────────────────────┐
│  SQL Editor                 │
├─────────────────────────────┤
│                             │
│  [Espacio para escribir SQL]│
│                             │
│  [Botón: Run]               │
└─────────────────────────────┘
```

---

## 📍 PASO 3: Copia el SQL

### 3.1 Abre el archivo SQL

```
Desde tu IDE:
  1. Abre: SCHEMA_SUPABASE_COMPLETO.sql
  2. Selecciona TODO (Ctrl+A)
  3. Copia (Ctrl+C)
```

### 3.2 Pega en Supabase

```
En la página de SQL Editor:
  1. Haz clic en el área de texto
  2. Pega (Ctrl+V)
  3. Deberías ver todo el SQL
```

---

## 📍 PASO 4: Ejecuta el SQL

```
EN SUPABASE SQL EDITOR:

1. Busca el botón "RUN" (esquina superior derecha)
2. Haz clic en "RUN"
3. Espera a que se complete...

ESPERARÁS:
┌────────────────────────────┐
│ ✅ Query executed          │
│                            │
│ Execution time: 2.5s       │
│ Rows affected: N/A         │
└────────────────────────────┘
```

---

## ✅ VERIFICAR QUE FUNCIONÓ

### Opción 1: Ver en SQL Editor

```
SQL Editor → Click en ↻ (refresh)
Busca en la consola:
✅ Query executed successfully
```

### Opción 2: Ver en Database

```
1. Sidebar izquierdo
2. Busca "Database"
3. Haz clic en "Tables"
4. Deberías ver las 6 tablas:
   ✅ products
   ✅ customers
   ✅ orders
   ✅ order_items
   ✅ invoices
   ✅ sync_log
```

### Opción 3: Hacer Query de Prueba

```
En SQL Editor, escribe y ejecuta:

SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

Resultado:
┌────────────────┐
│ table_name     │
├────────────────┤
│ invoices       │
│ order_items    │
│ orders         │
│ products       │
│ customers      │
│ sync_log       │
└────────────────┘
```

---

## 🎯 ESTRUCTURA DE TABLAS CREADAS

```
┌─────────────────────────────────────────┐
│         DATABASE SUPABASE               │
├─────────────────────────────────────────┤
│                                         │
│  TABLAS PRINCIPALES:                  │
│  ├─ products (Inventario)             │
│  ├─ customers (Clientes)              │
│  ├─ orders (Pedidos)                  │
│  ├─ order_items (Detalles)            │
│  ├─ invoices (Facturas)               │
│  └─ sync_log (Sincronización)         │
│                                         │
│  RELACIONES:                           │
│  products → user_id (propietario)     │
│  customers → user_id (propietario)    │
│  orders → customer_id, user_id        │
│  order_items → order_id, product_id   │
│  invoices → customer_id, order_id     │
│                                         │
│  SEGURIDAD (RLS):                     │
│  ✅ Cada tabla tiene políticas       │
│  ✅ Los usuarios solo ven sus datos   │
│  ✅ Imposible acceder datos ajenos    │
│                                         │
└─────────────────────────────────────────┘
```

---

## 📊 ESQUEMA DE CADA TABLA

### 1. PRODUCTS (Productos)
```sql
id              UUID (PK)
user_id         UUID (FK → auth.users)
code            VARCHAR UNIQUE
name            VARCHAR
description     TEXT
price           DECIMAL
cost            DECIMAL
quantity        INTEGER
category        VARCHAR
image_url       TEXT
sku             VARCHAR
barcode         VARCHAR
is_active       BOOLEAN
created_at      TIMESTAMP
updated_at      TIMESTAMP
```

### 2. CUSTOMERS (Clientes)
```sql
id              UUID (PK)
user_id         UUID (FK → auth.users)
code            VARCHAR UNIQUE
name            VARCHAR
email           VARCHAR
phone           VARCHAR
address         TEXT
city            VARCHAR
state           VARCHAR
zip_code        VARCHAR
country         VARCHAR
tax_id          VARCHAR
contact_person  VARCHAR
payment_terms   VARCHAR
credit_limit    DECIMAL
is_active       BOOLEAN
notes           TEXT
created_at      TIMESTAMP
updated_at      TIMESTAMP
```

### 3. ORDERS (Pedidos)
```sql
id              UUID (PK)
user_id         UUID (FK → auth.users)
customer_id     UUID (FK → customers)
code            VARCHAR UNIQUE
status          VARCHAR (pending, processing, completed, cancelled)
order_date      TIMESTAMP
delivery_date   TIMESTAMP
subtotal        DECIMAL
tax             DECIMAL
discount        DECIMAL
total           DECIMAL
payment_method  VARCHAR
payment_status  VARCHAR (pending, paid, partial)
notes           TEXT
created_at      TIMESTAMP
updated_at      TIMESTAMP
```

### 4. ORDER_ITEMS (Detalles de Órdenes)
```sql
id              UUID (PK)
order_id        UUID (FK → orders)
product_id      UUID (FK → products)
quantity        INTEGER
unit_price      DECIMAL
discount_percentage DECIMAL
line_total      DECIMAL
notes           TEXT
created_at      TIMESTAMP
```

### 5. INVOICES (Facturas)
```sql
id              UUID (PK)
user_id         UUID (FK → auth.users)
order_id        UUID (FK → orders, nullable)
customer_id     UUID (FK → customers)
invoice_number  VARCHAR UNIQUE
invoice_date    TIMESTAMP
due_date        TIMESTAMP
status          VARCHAR (draft, sent, partial, paid, overdue, cancelled)
subtotal        DECIMAL
tax             DECIMAL
discount        DECIMAL
total           DECIMAL
paid_amount     DECIMAL
payment_method  VARCHAR
notes           TEXT
created_at      TIMESTAMP
updated_at      TIMESTAMP
```

### 6. SYNC_LOG (Log de Sincronización)
```sql
id              UUID (PK)
user_id         UUID (FK → auth.users)
table_name      VARCHAR
action          VARCHAR (INSERT, UPDATE, DELETE)
record_id       UUID
synced_at       TIMESTAMP
synced          BOOLEAN
error           TEXT
```

---

## 🔒 ROW LEVEL SECURITY (RLS)

Cada tabla tiene políticas de seguridad:

```
Para PRODUCTS:
┌──────────────────────────────────────┐
│ SELECT: user_id = auth.uid()        │
│ INSERT: user_id = auth.uid()        │
│ UPDATE: user_id = auth.uid()        │
│ DELETE: user_id = auth.uid()        │
└──────────────────────────────────────┘

Resultado:
✅ Juan solo ve sus productos
✅ María solo ve sus productos
✅ Imposible ver datos ajenos
✅ Protegido a nivel BD
```

---

## ⚡ ÍNDICES PARA RENDIMIENTO

Se crean automáticamente:

```
products:
├─ idx_products_user_id (búsqueda por usuario)
├─ idx_products_code (búsqueda por código)
├─ idx_products_category (búsqueda por categoría)
└─ idx_products_is_active (filtro de activos)

customers:
├─ idx_customers_user_id
├─ idx_customers_code
├─ idx_customers_email
└─ idx_customers_is_active

orders:
├─ idx_orders_user_id
├─ idx_orders_customer_id
├─ idx_orders_code
├─ idx_orders_status
├─ idx_orders_payment_status
└─ idx_orders_order_date

(+ índices en invoices y sync_log)
```

---

## 🚨 SI ALGO FALLA

### Error 1: "Relation already exists"
```
Significado: Las tablas ya existen
Solución: 
  - Ignora el error
  - Las tablas ya están creadas
  - Continúa adelante
```

### Error 2: "Permission denied"
```
Significado: No tienes permisos
Solución:
  - Verifica que estés en tu propio proyecto
  - Cierra sesión y vuelve a iniciar en Supabase
  - Intenta de nuevo
```

### Error 3: "Syntax error"
```
Significado: Error en el SQL
Solución:
  - Copia TODO el SQL nuevamente
  - Asegúrate de copiar sin espacios extras
  - Pega en un editor de texto limpio primero
  - Luego copia a Supabase
```

### Error 4: Nada pasó
```
Significado: Desconocido
Solución:
  - Recarga la página (F5)
  - Abre Supabase en otro navegador
  - Intenta con SQL Editor en incógnito
```

---

## ✅ CHECKLIST DE VERIFICACIÓN

```
DESPUÉS DE EJECUTAR EL SQL:

□ 1. Veo "Query executed successfully"
□ 2. Veo 6 tablas en Database → Tables:
    □ products
    □ customers
    □ orders
    □ order_items
    □ invoices
    □ sync_log
□ 3. Cada tabla tiene columnas correctas
□ 4. Veo "RLS Enabled" en cada tabla
□ 5. Veo índices en Database → Indexes
□ 6. user_statistics view existe
```

---

## 🔄 PRÓXIMO PASO

Una vez creadas las tablas:

1. ✅ Tablas en Supabase (ESTE PASO)
2. → Conectar métodos de sincronización
3. → Implementar upload/download
4. → Probar offline → online

---

## 📝 NOTAS IMPORTANTES

```
📍 Credenciales seguras:
   - Las tablas están en TU proyecto
   - Solo TÚ accedes (RLS habilitado)
   - Los usuarios ven solo sus datos

📍 Relaciones:
   - products relacionado con users
   - customers relacionado con users
   - orders relacionado con customers y users
   - order_items relacionado con orders y products

📍 Sincronización:
   - sync_log registra qué cambios sincronizar
   - IndexedDB ↔ Supabase

📍 Rendimiento:
   - Índices creados automáticamente
   - Queries optimizadas
   - Listo para datos reales
```

---

## 🎊 RESULTADO FINAL

```
Antes:
├─ Supabase sin tablas
└─ App sin BD

Después:
├─ Supabase con 6 tablas
├─ RLS en cada tabla
├─ Índices para rendimiento
├─ Relaciones completas
├─ Sync log preparado
└─ ¡Listo para sincronizar! 🚀
```

---

**¡Las tablas están creadas!** 🎉
**Ahora puedes sincronizar datos.** ✨