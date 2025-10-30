# 📊 Cambios SQL - Vista Visual

## 🔄 ANTES vs DESPUÉS

### ❌ ANTES (Tabla Devoluciones Simple)

```
┌─────────────────────────────────────────────────┐
│ TABLA: devoluciones (Solo 9 campos)             │
├─────────────────────────────────────────────────┤
│ id                     BIGSERIAL                │
│ owner                  UUID (FK)                │
│ codigo_venta           VARCHAR(50)              │
│ monto                  DECIMAL                  │
│ cantidad               INT                      │
│ razon                  TEXT                     │
│ cliente                VARCHAR(255)             │
│ producto               VARCHAR(255)             │
│ fecha                  DATE                     │
│ estado                 VARCHAR(50)              │  ← Solo 3 valores posibles
│ created_at             TIMESTAMP                │
│ updated_at             TIMESTAMP                │
└─────────────────────────────────────────────────┘

❌ PROBLEMAS:
- No diferencia entre Reembolso / Cambio / Canje
- No sabe si el producto está dañado
- No calcula precios de cambios
- No registra lo que se canjeó
- No se vincula con ingresos/egresos
```

---

### ✅ DESPUÉS (Tabla Devoluciones Inteligente)

```
┌──────────────────────────────────────────────────────────────────────┐
│ TABLA: devoluciones (AHORA 24 campos)                               │
├──────────────────────────────────────────────────────────────────────┤
│ CAMPOS ORIGINALES (9)                                                │
├──────────────────────────────────────────────────────────────────────┤
│ id                     BIGSERIAL                                      │
│ owner                  UUID (FK)                                      │
│ codigo_venta           VARCHAR(50)                                    │
│ monto                  DECIMAL (precio original devuelto)             │
│ cantidad               INT (cantidad devuelta)                        │
│ razon                  TEXT                                           │
│ cliente                VARCHAR(255)                                   │
│ producto               VARCHAR(255) (producto devuelto)               │
│ fecha                  DATE                                           │
│ estado                 VARCHAR(50)                                    │
│ created_at             TIMESTAMP                                      │
│ updated_at             TIMESTAMP                                      │
│                                                                        │
├─ NUEVOS CAMPOS (15) ✨                                               │
├──────────────────────────────────────────────────────────────────────┤
│ tipo_resolucion        VARCHAR(50)      ← NUEVO                       │
│                        ├─ 'Reembolso'           (dinero al cliente)  │
│                        ├─ 'Cambio'              (cambio por otro)    │
│                        ├─ 'Canje Proveedor'     (daño + canje)       │
│                        └─ 'Pérdida'             (daño sin canje)     │
│                                                                        │
│ estado_producto        VARCHAR(50)      ← NUEVO                       │
│                        ├─ 'Buen estado'                               │
│                        ├─ 'Dañado'                                    │
│                        └─ 'Parcialmente dañado'                       │
│                                                                        │
│ ══════ DATOS DEL CAMBIO ══════                                        │
│ producto_nuevo         VARCHAR(255)     ← NUEVO (si aplica)           │
│ cantidad_nueva         INT              ← NUEVO (cantidad nuevo prod) │
│ precio_nuevo           DECIMAL          ← NUEVO (precio nuevo prod)   │
│ diferencia_precio      DECIMAL          ← NUEVO (cálculo auto)        │
│                                                   ├─ > 0: cliente paga│
│                                                   ├─ < 0: negocio refund│
│                                                   └─ = 0: sin cambios │
│                                                                        │
│ ══════ CANJE PROVEEDOR ══════                                         │
│ tiene_cambio_proveedor BOOLEAN          ← NUEVO (¿aceptó canje?)     │
│ referencia_canje       VARCHAR(255)     ← NUEVO (Ej: Canje #001)     │
│                                                                        │
│ ══════ TRANSACCIONES FINANCIERAS ══════                               │
│ id_ingreso             BIGINT           ← NUEVO (si cliente paga)    │
│ id_egreso              BIGINT           ← NUEVO (si reembolsamos)    │
│                                                                        │
│ ══════ AUDITORÍA ══════                                               │
│ fecha_procesada        TIMESTAMP        ← NUEVO (cuándo se procesó)  │
│ procesada_por          UUID (FK)        ← NUEVO (quién lo hizo)      │
│ notas_adicionales      TEXT             ← NUEVO (notas extra)        │
└──────────────────────────────────────────────────────────────────────┘

✅ AHORA PERMITE:
✓ Diferenciar tipos de devoluciones
✓ Registrar daños
✓ Calcular cambios de precios automáticamente
✓ Trackear canjes con proveedores
✓ Vincular con movimientos de dinero
✓ Auditoría completa
```

---

### 🆕 NUEVA TABLA: AVERIAS

```
┌──────────────────────────────────────────────────────────────────────┐
│ TABLA: averias (NUEVA - 13 campos)                                  │
├──────────────────────────────────────────────────────────────────────┤
│ id                     BIGSERIAL PRIMARY KEY                          │
│ owner                  UUID (FK) → auth.users                        │
│                                                                        │
│ ══════ RELACIONES ══════                                              │
│ id_devolucion          BIGINT (FK) → devoluciones                    │
│                        └─ Vincula con la devolución que generó daño  │
│                                                                        │
│ ══════ IDENTIFICACIÓN ══════                                          │
│ producto               VARCHAR(255) (nombre del producto dañado)     │
│ descripcion            TEXT (qué pasó: rotura, falla, etc.)          │
│                                                                        │
│ ══════ ESTADO ══════                                                  │
│ estado                 VARCHAR(50)                                    │
│                        ├─ 'Pendiente'        (reportado, sin resolver)│
│                        ├─ 'Canjeada'         (proveedor cambió)      │
│                        ├─ 'Desechada'        (producto perdido)      │
│                        └─ 'Reembolsada'      (cliente reembolsado)   │
│                                                                        │
│ ══════ PROVEEDOR (si aplica) ══════                                   │
│ proveedor              VARCHAR(255) (nombre del supplier)             │
│ referencia_canje       VARCHAR(255) (número del canje: PO-001, etc.) │
│                                                                        │
│ ══════ FECHAS ══════                                                  │
│ fecha_reporte          DATE (cuándo se reportó el daño)              │
│ fecha_resolucion       DATE (cuándo se resolvió)                     │
│                                                                        │
│ ══════ IMPACTO FINANCIERO ══════                                      │
│ monto_perdida          DECIMAL (valor del producto dañado)           │
│                                                                        │
│ ══════ DOCUMENTACIÓN ══════                                           │
│ notas                  TEXT (más detalles si necesita)               │
│ created_at             TIMESTAMP                                      │
│ updated_at             TIMESTAMP                                      │
└──────────────────────────────────────────────────────────────────────┘

USO:
- Registra TODOS los daños de productos
- Genera reportes de "Tasa de Daños"
- Trackea canjes con proveedores
- Ayuda a identificar problemas recurrentes
- Auditoría de pérdidas de inventario
```

---

## 📈 Ejemplos de Registros Creados

### Ejemplo 1: Reembolso Simple

```
┌── DEVOLUCION ──────────────────────────────┐
│ tipo_resolucion:  'Reembolso'              │
│ producto:         'Laptop XYZ'             │
│ estado_producto:  'Buen estado'            │
│ monto:            $1200.00                 │
│ diferencia_precio: $0                      │
│ id_egreso:        #234 (reembolso creado)  │
│ fecha_procesada:  2024-11-20               │
│ procesada_por:    user-uuid                │
└────────────────────────────────────────────┘

💰 IMPACTO: Balance -$1200 (egreso)
📊 Dashboard: "Reembolso: $1200"
```

### Ejemplo 2: Cambio + Precio (Cliente Paga Diferencia)

```
┌── DEVOLUCION ──────────────────────────────┐
│ tipo_resolucion:      'Cambio'             │
│ producto:             'Monitor 24"'        │
│ estado_producto:      'Buen estado'        │
│ monto:                $150.00 (original)   │
│                                             │
│ producto_nuevo:       'Monitor 32"'        │
│ cantidad_nueva:       1                    │
│ precio_nuevo:         $280.00              │
│ diferencia_precio:    +$130.00 ← CLIENTE   │
│                                    PAGA    │
│ id_ingreso:           #567 (ingreso)       │
│ fecha_procesada:      2024-11-20           │
└────────────────────────────────────────────┘

💰 IMPACTO: Balance +$130 (ingreso)
📊 Dashboard: "Cambio con aumento: +$130"
```

### Ejemplo 3: Cambio - Precio (Negocio Refunda)

```
┌── DEVOLUCION ──────────────────────────────┐
│ tipo_resolucion:      'Cambio'             │
│ producto:             'Teclado Mecánico'   │
│ estado_producto:      'Buen estado'        │
│ monto:                $200.00 (original)   │
│                                             │
│ producto_nuevo:       'Teclado Básico'     │
│ cantidad_nueva:       1                    │
│ precio_nuevo:         $80.00               │
│ diferencia_precio:    -$120.00 ← NEGOCIO   │
│                                    REFUNDA │
│ id_egreso:            #345 (egreso)        │
│ fecha_procesada:      2024-11-20           │
└────────────────────────────────────────────┘

💰 IMPACTO: Balance -$120 (egreso)
📊 Dashboard: "Cambio con descuento: -$120"
```

### Ejemplo 4: Daño + Canje Proveedor

```
┌── DEVOLUCION ──────────────────────────────┐
│ tipo_resolucion:       'Canje Proveedor'   │
│ producto:              'Monitor LG 32"'    │
│ estado_producto:       'Dañado'            │
│ cantidad_devuelta:     1                   │
│ monto:                 $300.00 (original)  │
│                                             │
│ tiene_cambio_proveedor: TRUE               │
│ referencia_canje:      'Canje #PO-2024-001'│
│ diferencia_precio:     $0 (sin movimiento) │
│ fecha_procesada:       2024-11-18          │
└────────────────────────────────────────────┘

┌── AVERIA ──────────────────────────────────┐
│ producto:             'Monitor LG 32"'     │
│ descripcion:          'Pantalla rota'      │
│ estado:               'Canjeada'           │
│ proveedor:            'LG Colombia'        │
│ referencia_canje:     'Canje #PO-2024-001'│
│ monto_perdida:        $300.00              │
│ fecha_reporte:        2024-11-17           │
│ fecha_resolucion:     2024-11-18           │
└────────────────────────────────────────────┘

💰 IMPACTO: Balance $0 (sin cambios de dinero)
📊 Dashboard: "Canje Proveedor (0 impacto financiero)"
📊 Averías: "1 producto canjeado"
```

### Ejemplo 5: Daño Total + Pérdida

```
┌── DEVOLUCION ──────────────────────────────┐
│ tipo_resolucion:       'Pérdida'           │
│ producto:              'iPad Pro'          │
│ estado_producto:       'Dañado'            │
│ monto:                 $1500.00            │
│                                             │
│ tiene_cambio_proveedor: FALSE              │
│ diferencia_precio:     $0                  │
│ id_egreso:             #789 (egreso)       │
│ fecha_procesada:       2024-11-19          │
│ notas_adicionales:     'Pantalla rota sin   │
│                        opciones de canje'  │
└────────────────────────────────────────────┘

┌── AVERIA ──────────────────────────────────┐
│ producto:             'iPad Pro'           │
│ descripcion:          'Pantalla rota'      │
│ estado:               'Desechada'          │
│ monto_perdida:        $1500.00             │
│ fecha_reporte:        2024-11-19           │
│ fecha_resolucion:     2024-11-19           │
│ notas:                'Proveedor no acepta │
│                       cambio, enviado a    │
│                       reciclaje'           │
└────────────────────────────────────────────┘

💰 IMPACTO: Balance -$1500 (pérdida/egreso)
📊 Dashboard: "Pérdida registrada: -$1500"
📊 Averías: "1 producto desechado"
```

---

## 🔗 Relaciones Entre Tablas

```
                    ┌─────────────────┐
                    │   auth.users    │
                    │  (admin/users)  │
                    └────────┬────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
        │                    │                    │
        ▼                    ▼                    ▼
   ┌────────┐           ┌────────┐          ┌──────────┐
   │ ventas │           │ egreso │          │devolucio-│
   │(FK:own)│           │(FK:own)│          │nes       │
   └────────┘           └────────┘          │(FK:owner)│
        │                    │               └──────────┘
        │  referencia        │ vinculado              │
        └────────────────────┼──────────────┬─────────┘
                             │              │
                         referencia     vincula
                             │              │
                             ▼              ▼
                        ┌──────────┐
                        │ averias  │
                        │(FK:owner)│
                        │(FK:dev.) │
                        └──────────┘
```

---

## ✅ Verificación Rápida

Después de ejecutar el SQL, verifica esto en Supabase:

```sql
-- 1. Ver campos nuevos
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'devoluciones'
ORDER BY ordinal_position;

-- 2. Contar campos (debe ser 24)
SELECT COUNT(*) 
FROM information_schema.columns 
WHERE table_name = 'devoluciones';

-- 3. Ver tabla averias existe
SELECT EXISTS (
  SELECT 1 FROM information_schema.tables 
  WHERE table_name = 'averias'
);
```

---

## 🎯 Próximo Paso

Una vez confirmado que todo funciona, pasamos a **PASO 2: Backend (AppContext.jsx)**

Allí crearemos las funciones que:
- ✅ Procesan la devolución
- ✅ Calculan diferencias de precio
- ✅ Crean ingresos/egresos automáticamente
- ✅ Actualizan inventario
- ✅ Registran en la tabla de averías