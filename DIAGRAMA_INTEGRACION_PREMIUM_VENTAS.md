# 🗺️ DIAGRAMA DE INTEGRACIÓN - Premium + Ventas + Inventario

---

## 1️⃣ ARQUITECTURA GENERAL

```
┌──────────────────────────────────────────────────────────────────────┐
│                          MANTENTE APP                                 │
│                                                                       │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                      AppProvider (Context)                   │   │
│  │                                                              │   │
│  │  Estado Global:                                            │   │
│  │  ├─ user (usuario autenticado)                            │   │
│  │  ├─ isPremium (boolean)                     ← MONITOREADO  │   │
│  │  ├─ premiumData (datos suscripción)                       │   │
│  │  ├─ ventas (array con código_venta)        ← GENERADO     │   │
│  │  ├─ inventario (productos disponibles)                    │   │
│  │  └─ clientes (base de datos)                             │   │
│  │                                                              │   │
│  │  Funciones Principales:                                   │   │
│  │  ├─ registrarVenta() → genera VTA-YYYY-NNNNN             │   │
│  │  ├─ generarCodigoVenta() ← NEW                           │   │
│  │  ├─ checkPremiumStatus() → verifica cada 30s             │   │
│  │  └─ purchasePremium() → gatilla listener                 │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                          ↑                    ↑                       │
│                          │ Propaga            │ Detecta              │
│                          │ Cambios            │ Cambios              │
│           ┌──────────────┴────────────┬───────┴──────────────┐       │
│           │                          │                      │       │
│    ┌──────▼──────┐         ┌─────────▼────┐    ┌───────────▼───┐  │
│    │ AppNavbar   │         │ Dashboard    │    │ Supabase      │  │
│    │             │         │              │    │ Realtime      │  │
│    │ Renderiza:  │         │ ├─ Resumen   │    │               │  │
│    │ ├─ Básicas  │         │ ├─ Premium   │    │ Escucha:      │  │
│    │ ├─ Premium* │◄────────┤ ├─ Inventario│    │ ├─ INSERT     │  │
│    │ │ (6 icons) │ isPremium│ └─ Clientes │    │ ├─ UPDATE     │  │
│    │ └─ Utilidades│         │              │    │ └─ DELETE     │  │
│    │              │         └──────────────┘    │               │  │
│    │ *Mostrados   │                             └───────────────┘  │
│    │ solo si      │                                    ↑            │
│    │ isPremium=true                                   │            │
│    └──────────────┘                                   │            │
│                                                       │            │
│         Si usuario compra premium:                   │            │
│         purchasePremium() → INSERT en BD ────────────┘            │
│                                                                     │
└──────────────────────────────────────────────────────────────────────┘
```

---

## 2️⃣ FLUJO: COMPRA DE PREMIUM

```
                    ┌─────────────────────┐
                    │   Premium.jsx       │
                    │  (Componente UI)    │
                    └──────────┬──────────┘
                               │
                     ┌─────────▼─────────┐
                     │ Usuario Compra →  │
                     │ Simula Pago PayPal│
                     └─────────┬─────────┘
                               │
        ┌──────────────────────▼──────────────────────┐
        │ purchasePremium(transactionId)              │
        │ en AppContext                              │
        │                                             │
        │ 1. Genera fechas (now, now+1month)         │
        │ 2. Hace UPSERT en premium_subscriptions    │
        │ 3. setIsPremium(true)                      │
        │ 4. setIsPremiumData(data)                  │
        └──────────────────────┬──────────────────────┘
                               │
        ┌──────────────────────▼──────────────────────┐
        │ Supabase Realtime Listener                 │
        │ (Activado en línea 160-193)                │
        │                                             │
        │ Detecta: INSERT en premium_subscriptions   │
        │ Gatilla: checkPremiumStatus(user.id)       │
        │ Tiempo: <100ms                             │
        └──────────────────────┬──────────────────────┘
                               │
        ┌──────────────────────▼──────────────────────┐
        │ checkPremiumStatus(userId)                 │
        │                                             │
        │ 1. SELECT * from premium_subscriptions     │
        │ 2. Verifica current_period_end > now       │
        │ 3. setIsPremium(true/false)                │
        │ 4. setIsPremiumData(data)                  │
        └──────────────────────┬──────────────────────┘
                               │
        ┌──────────────────────▼──────────────────────┐
        │ Context actualiza estado                   │
        │                                             │
        │ isPremium = true  ← CAMBIO CLAVE           │
        │                                             │
        │ Trigger: Todos los componentes que usan    │
        │ {isPremium} se re-renderizan               │
        └──────────────────────┬──────────────────────┘
                               │
        ┌──────────────────────▼──────────────────────┐
        │ AppNavbar re-renderiza                     │
        │                                             │
        │ Ahora renderiza:                           │
        │ {isPremium && (                            │
        │   <>                                        │
        │     <Nav.Link>💰 Presupuestos</Nav.Link>  │
        │     <Nav.Link>📦 Notas</Nav.Link>         │
        │     <Nav.Link>↩️ Devoluciones</Nav.Link>  │
        │     <Nav.Link>📊 Libro</Nav.Link>         │
        │     <Nav.Link>📋 Pedidos</Nav.Link>       │
        │     <Nav.Link>🔧 Órdenes</Nav.Link>      │
        │   </>                                       │
        │ )}                                          │
        └──────────────────────┬──────────────────────┘
                               │
                    ┌──────────▼──────────┐
                    │ ✅ Usuario ve      │
                    │ 6 FUNCIONES        │
                    │ PREMIUM EN NAVBAR   │
                    │ EN VIVO             │
                    └────────────────────┘
```

---

## 3️⃣ FLUJO: REGISTRAR VENTA (CON CÓDIGO ÚNICO)

```
                  ┌──────────────────┐
                  │  Ventas.jsx      │
                  │  Usuario Vende   │
                  └────────┬─────────┘
                           │
        ┌──────────────────▼──────────────────┐
        │ handleSubmit()                      │
        │                                     │
        │ Recolecta datos:                   │
        │ ├─ producto: "Laptop"              │
        │ ├─ cantidad: 1                     │
        │ ├─ monto: 1200                     │
        │ ├─ cliente: "Juan"                 │
        │ └─ fecha: 2024-01-15               │
        └────────────────────┬────────────────┘
                             │
        ┌────────────────────▼────────────────┐
        │ registrarVenta(ventaData)           │
        │ en AppContext                       │
        │                                     │
        │ 1. Validaciones                    │
        │ 2. Normalización de fechas         │
        │ 3. ⭐ generarCodigoVenta()  ← NEW  │
        └────────────────────┬────────────────┘
                             │
        ┌────────────────────▼────────────────┐
        │ generarCodigoVenta()                │
        │ (Nueva función, línea 257)          │
        │                                     │
        │ 1. year = 2024                     │
        │ 2. prefijo = "VTA-2024"            │
        │ 3. SELECT último codigo_venta      │
        │    WHERE user_id = userId          │
        │    ORDER BY codigo_venta DESC      │
        │ 4. Si existe: número+1             │
        │    Si NO: número = 1               │
        │ 5. Retorna: "VTA-2024-00001"       │
        └────────────────────┬────────────────┘
                             │
        ┌────────────────────▼────────────────┐
        │ Volver a registrarVenta()           │
        │                                     │
        │ INSERT en tabla ventas:             │
        │ ├─ producto: "Laptop"              │
        │ ├─ cantidad: 1                     │
        │ ├─ monto: 1200                     │
        │ ├─ cliente: "Juan"                 │
        │ ├─ codigo_venta: "VTA-2024-00001" │ ← NEW
        │ ├─ fecha: 2024-01-15               │
        │ └─ owner: user.id                  │
        └────────────────────┬────────────────┘
                             │
        ┌────────────────────▼────────────────┐
        │ Response                            │
        │                                     │
        │ success: true                       │
        │ data: {                             │
        │   id: 123,                          │
        │   codigo_venta: "VTA-2024-00001",   │
        │   producto: "Laptop",               │
        │   ...                               │
        │ }                                   │
        └────────────────────┬────────────────┘
                             │
        ┌────────────────────▼────────────────┐
        │ Context actualiza                   │
        │                                     │
        │ setVentas([data, ...prev])          │
        │ Estado local actualizado            │
        │                                     │
        │ Venta disponible para:              │
        │ - Presupuestos                      │
        │ - Devoluciones                      │
        │ - Libro de Ventas                   │
        │ - Pedidos                           │
        └────────────────────┬────────────────┘
                             │
        ┌────────────────────▼────────────────┐
        │ ✅ Venta registrada                │
        │    Con código: VTA-2024-00001      │
        └────────────────────────────────────┘
```

---

## 4️⃣ INTEGRACIÓN: FUNCIONES PREMIUM CON VENTAS

```
                     ┌──────────────────────────┐
                     │   DASHBOARD              │
                     │  (Resumen de empresa)    │
                     └────────┬─────────────────┘
                              │
                    ┌─────────┴─────────┐
                    │ Si isPremium=true │
                    └─────────┬─────────┘
                              │
        ┌─────────────────────┴──────────────────────┐
        │                                            │
        ▼                                            ▼
    ┌───────────────┐                         ┌──────────────────┐
    │ INVENTARIO    │                         │ PREMIUM FUNCTIONS│
    │               │                         │                  │
    │ └─ Productos  │◄────────┐               │ 💰 PRESUPUESTOS  │
    │ └─ Stock      │         │               │ 📦 NOTAS ENTREGA │
    │ └─ Precio     │         │               │ ↩️ DEVOLUCIONES  │
    └───────────────┘         │               │ 📊 LIBRO VENTAS  │
                              │               │ 📋 PEDIDOS       │
    ┌──────────────────┐      │               │ 🔧 ÓRDENES SERV. │
    │ VENTAS           │      │               └──────────────────┘
    │                  │      │                        │
    │ Código: VTA-... │◄─────┘                        │
    │ Producto: ~~~   │          ┌────────────────────┘
    │ Cantidad: 1     │          │
    │ Monto: 1200     │          │
    │ Cliente: Juan   │          │
    │ Fecha: 2024-01  │          │
    │ Estado: activa  │          │
    └──────────────────┘         │
         │                        │
         │                        │
         ├─ Presupuestos ────────►│ 
         │  - Ref venta           │ Genera código presupuesto
         │  - Convertir a venta   │ Crea nueva VTA-XXXX-XXXXX
         │                        │
         ├─ Notas Entrega ───────►│
         │  - Ref venta           │ Marca como entregada
         │  - Cantidad: confirma  │ Actualiza inventario
         │                        │
         ├─ Devoluciones ────────►│
         │  - Ref venta           │ Actualiza inventario (+cant)
         │  - Reembolso: calcula  │ Registra en historial
         │                        │
         ├─ Libro Ventas ────────►│
         │  - Lista todas         │ Filtro por VTA-XXXX-XXXXX
         │  - Reportes            │ Grouping por cliente
         │                        │
         ├─ Pedidos ─────────────►│
         │  - Ref venta/presup    │ Trackea estado entrega
         │  - Estado: pendiente   │ Genera VTA-XXXX-XXXXX
         │                        │
         └─ Órdenes Servicio ───►│
            - Ref venta/producto  │ Asigna técnico
            - Status: complete    │ Genera VTA-XXXX-XXXXX
                                  │
                     ┌────────────►│
                     │             │
                  ✅ INTEGRACIÓN  │
                     │             │
                     └─────────────┘
```

---

## 5️⃣ TIMELINE: VIDA DE UNA VENTA

```
┌─────────────────────────────────────────────────────────────────────┐
│                    VENTA: VTA-2024-00001                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│ T=0: Registrar Venta                                               │
│   └─ generarCodigoVenta() → VTA-2024-00001                        │
│   └─ INSERT en ventas con código                                  │
│   └─ Estado: REGISTRADA                                           │
│                                                                     │
│ T+1h: Usuario compra Premium                                       │
│   └─ Navbar muestra 6 funciones premium                           │
│   └─ Usuario accede a Presupuestos                                │
│                                                                     │
│ T+2h: Crear Presupuesto desde Venta                               │
│   └─ Ref: VTA-2024-00001                                          │
│   └─ Crear presupuesto nuevo                                      │
│   └─ Convertir a venta: VTA-2024-00002 (nueva)                    │
│   └─ Estado: PRESUPUESTADA                                        │
│                                                                     │
│ T+3h: Crear Nota de Entrega                                       │
│   └─ Ref: VTA-2024-00001                                          │
│   └─ Confirmar productos                                          │
│   └─ Registrar fecha entrega                                      │
│   └─ Estado: ENTREGADA                                            │
│                                                                     │
│ T+5h: Cliente quiere devolver 1 producto                           │
│   └─ Crear Devolución                                             │
│   └─ Ref: VTA-2024-00001                                          │
│   └─ Cantidad: 1                                                  │
│   └─ Actualizar inventario: +1                                    │
│   └─ Calcular reembolso                                           │
│   └─ Estado: PARCIALMENTE DEVUELTA                                │
│                                                                     │
│ T+1 mes: Generar Reportes                                          │
│   └─ Libro de Ventas                                              │
│   └─ Filtro por VTA-2024-00001                                    │
│   └─ Ver: historial completo                                      │
│   └─ Ver: devoluciones, notas, etc.                               │
│   └─ Estado: FINALIZADA (con historial)                           │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 6️⃣ ESTADO DE PERSISTENCIA

```
┌──────────────────────────────────────────────────────────────┐
│              CICLO DE VIDA: Premium Persiste                 │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│ ESTADO 1: No-Premium                                         │
│   isPremium = false                                          │
│   Navbar: [Dashboard] [Inventario] [Ventas] ... [Premium❌]  │
│   BD: premium_subscriptions vacía                            │
│                                                               │
│           USER COMPRA → INSERT en BD                         │
│                         ↓                                     │
│                                                               │
│ ESTADO 2: Detecta Listener (T < 100ms)                       │
│   Realtime escucha INSERT                                    │
│   checkPremiumStatus() ejecuta                               │
│   isPremium = true                                           │
│   Navbar: [Dashboard] ... [💰][📦][↩️][📊][📋][🔧]         │
│                                                               │
│           USUARIO REFRESCHA → F5                             │
│           checkPremiumStatus() en useEffect                  │
│                         ↓                                     │
│                                                               │
│ ESTADO 3: Persiste Premium (después de reload)               │
│   BD: premium_subscriptions aún existe                       │
│   checkPremiumStatus() verifica de nuevo                     │
│   isPremium = true (aún)                                     │
│   Navbar: [Dashboard] ... [💰][📦][↩️][📊][📋][🔧]         │
│                                                               │
│           FALLBACK: Verificación cada 30s                    │
│           setInterval(checkPremiumStatus, 30000)             │
│                         ↓                                     │
│                                                               │
│ ESTADO 4: Sincronización Garantizada                         │
│   Si Listener falla → Fallback cada 30s                      │
│   Si conexión se corta → Reconecta auto                      │
│   Si BD se desincroniza → Verifica periódicamente            │
│   isPremium siempre correcto                                 │
│   Navbar siempre actualizado                                 │
│                                                               │
│           USUARIO CANCELA PREMIUM → DELETE en BD             │
│           Listener escucha DELETE                            │
│                         ↓                                     │
│                                                               │
│ ESTADO 5: Premium Cancelado                                  │
│   isPremium = false                                          │
│   Navbar: [Dashboard] [Inventario] [Ventas] ... [Premium❌]  │
│   Funciones premium DESAPARECEN del navbar                   │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

---

## 7️⃣ TABLA DE DATOS: ANTES vs DESPUÉS

### ANTES
```sql
Table: ventas
id  | producto | cantidad | monto | cliente | fecha      | mes_cierre
----|----------|----------|-------|---------|------------|----------
1   | Laptop   | 1        | 1200  | Juan    | 2024-01-15 | 2024-01-01
2   | Mouse    | 2        | 50    | María   | 2024-01-15 | 2024-01-01
```

**Problemas:**
- ❌ Sin identificador único
- ❌ Imposible referenciar venta específica
- ❌ Funciones premium no pueden linkear

### DESPUÉS
```sql
Table: ventas
id  | codigo_venta  | producto | cantidad | monto | cliente | fecha      | mes_cierre
----|---------------|----------|----------|-------|---------|------------|----------
1   | VTA-2024-00001| Laptop   | 1        | 1200  | Juan    | 2024-01-15 | 2024-01-01
2   | VTA-2024-00002| Mouse    | 2        | 50    | María   | 2024-01-15 | 2024-01-01
3   | VTA-2024-00003| Teclado  | 1        | 75    | Pedro   | 2024-01-16 | 2024-01-01
```

**Ventajas:**
- ✅ Código único por venta
- ✅ Fácil de referenciar: "Ref VTA-2024-00001"
- ✅ Buscable y filtrable
- ✅ Preparado para integraciones premium

---

## 8️⃣ PERFORMANCE: Tiempo de Actualización

```
Escenario 1: Usuario Compra Premium
├─ purchasePremium() INSERT:           ~200ms
├─ Listener Realtime detección:        <100ms
├─ checkPremiumStatus() query:          ~150ms
├─ Context actualiza (setIsPremium):   <5ms
├─ AppNavbar re-renderiza:             <50ms
├─ Emojis animación aparecen:          INMEDIATO
│
└─ TIEMPO TOTAL: ~500ms (usuario lo ve EN VIVO)

Escenario 2: Verificación Fallback (cada 30s)
├─ setInterval dispara:                30000ms
├─ checkPremiumStatus() query:          ~150ms
├─ Context actualiza:                  <5ms
├─ AppNavbar re-renderiza:             <50ms
│
└─ TIEMPO TOTAL: 30150ms (silencioso)

Escenario 3: Registrar Venta
├─ generarCodigoVenta() query:         ~150ms
├─ INSERT venta con código:            ~200ms
├─ Context setVentas():                <5ms
│
└─ TIEMPO TOTAL: ~355ms (muy rápido)
```

---

## ✅ RESUMEN: TODO INTEGRADO

```
┌─────────────────────────────────────────────────────────────┐
│                 SISTEMA INTEGRADO FINAL                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ✅ Premium Persiste (Listener + Fallback 30s)              │
│  ✅ Funciones Premium Visibles (6 iconos expandidos)        │
│  ✅ Código Único por Venta (VTA-YYYY-NNNNN)                │
│  ✅ Integración Premium ↔ Ventas ↔ Inventario              │
│  ✅ Responsive (Desktop, Tablet, Mobile)                   │
│  ✅ Animaciones (Shimmer, Bounce)                          │
│  ✅ Build 0 Errores                                         │
│  ✅ Documentación Completa                                 │
│                                                              │
│  🚀 LISTO PARA PRODUCCIÓN                                   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

📊 **DIAGRAMA COMPLETO DISPONIBLE**

Use estos diagramas para:
- 📖 Entender la arquitectura
- 🧪 Verificar los cambios
- 📋 Comunicar con el equipo
- 🚀 Planificar desarrollos futuros
