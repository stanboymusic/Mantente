# 🔧 REPARACIÓN COMPLETA: Notas, Pedidos, Devoluciones

## ⚠️ EL PROBLEMA

Tienes 3 funcionalidades Premium que necesitan arreglarse:

1. **Notas de Entrega**: ❌ Error al crear (tabla no existe)
2. **Pedidos**: ❌ No genera número de pedido (tabla no existe)  
3. **Devoluciones**: ⚠️ Se descuentan del balance (necesita verificación)

---

## 🎯 SOLUCIÓN EN 4 PASOS

### PASO 1: EJECUTAR SQL EN SUPABASE ⚡

**CRÍTICO**: Las tablas `notas_entrega` y `pedidos` no existen. Necesitas crearlas.

#### 1.1 Abre Supabase
```
https://supabase.com → Tu Proyecto → SQL Editor → New Query
```

#### 1.2 Copia TODO esto y ejecuta:

```sql
-- ✅ CREAR TABLA: notas_entrega
CREATE TABLE IF NOT EXISTS public.notas_entrega (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  owner UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  numero_nota TEXT NOT NULL,
  cliente TEXT NOT NULL,
  items JSONB NOT NULL DEFAULT '[]',
  observaciones TEXT,
  fecha_entrega DATE NOT NULL,
  estado TEXT DEFAULT 'pendiente',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notas_entrega_owner ON public.notas_entrega(owner);
CREATE INDEX IF NOT EXISTS idx_notas_entrega_fecha ON public.notas_entrega(fecha_entrega);

-- ✅ CREAR TABLA: pedidos
CREATE TABLE IF NOT EXISTS public.pedidos (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  owner UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  numero_pedido TEXT NOT NULL UNIQUE,
  cliente TEXT NOT NULL,
  items JSONB NOT NULL DEFAULT '[]',
  total NUMERIC(10, 2) DEFAULT 0,
  estado TEXT DEFAULT 'pendiente',
  fecha_entrega_estimada DATE,
  observaciones TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pedidos_owner ON public.pedidos(owner);
CREATE INDEX IF NOT EXISTS idx_pedidos_numero ON public.pedidos(numero_pedido);

-- ✅ POLÍTICAS RLS PARA notas_entrega
ALTER TABLE public.notas_entrega ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS notas_entrega_select ON public.notas_entrega;
DROP POLICY IF EXISTS notas_entrega_insert ON public.notas_entrega;
DROP POLICY IF EXISTS notas_entrega_update ON public.notas_entrega;
DROP POLICY IF EXISTS notas_entrega_delete ON public.notas_entrega;

CREATE POLICY notas_entrega_select ON public.notas_entrega
  FOR SELECT USING (auth.uid() = owner);

CREATE POLICY notas_entrega_insert ON public.notas_entrega
  FOR INSERT WITH CHECK (auth.uid() = owner);

CREATE POLICY notas_entrega_update ON public.notas_entrega
  FOR UPDATE USING (auth.uid() = owner);

CREATE POLICY notas_entrega_delete ON public.notas_entrega
  FOR DELETE USING (auth.uid() = owner);

-- ✅ POLÍTICAS RLS PARA pedidos
ALTER TABLE public.pedidos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS pedidos_select ON public.pedidos;
DROP POLICY IF EXISTS pedidos_insert ON public.pedidos;
DROP POLICY IF EXISTS pedidos_update ON public.pedidos;
DROP POLICY IF EXISTS pedidos_delete ON public.pedidos;

CREATE POLICY pedidos_select ON public.pedidos
  FOR SELECT USING (auth.uid() = owner);

CREATE POLICY pedidos_insert ON public.pedidos
  FOR INSERT WITH CHECK (auth.uid() = owner);

CREATE POLICY pedidos_update ON public.pedidos
  FOR UPDATE USING (auth.uid() = owner);

CREATE POLICY pedidos_delete ON public.pedidos
  FOR DELETE USING (auth.uid() = owner);
```

#### 1.3 Presiona: **Ctrl + Enter** para ejecutar

**✅ Deberías ver verde y las tablas se crearán**

---

### PASO 2: VERIFICAR LÓGICA DE NOTAS DE ENTREGA ✅

**Archivo**: `NotasEntrega.jsx`

La lógica YA está correcta:

```javascript
// ✅ CORRECTO - Línea 61-68
const resultado = await crearNotaEntrega({
  cliente: formData.cliente,
  items: formData.items,
  numero_nota: `ENT-${Date.now()}`,  // ✅ Genera único por timestamp
  observaciones: formData.observaciones || '',
  fecha_entrega: formData.fecha_entrega,
  estado: 'Pendiente'
});
```

**¿Qué hace?**
- Valida cliente e items
- Genera número único: `ENT-1729999999`
- Guarda en tabla `notas_entrega`
- Muestra mensaje de éxito

**Después de ejecutar el SQL, esto ya funcionará.**

---

### PASO 3: VERIFICAR LÓGICA DE PEDIDOS ✅

**Archivo**: `Pedidos.jsx` y `AppContext.jsx`

La lógica YA está correcta:

```javascript
// ✅ CORRECTO - Pedidos.jsx línea 64
numero_pedido: `PED-${Date.now()}`,  // ✅ Genera único por timestamp

// ✅ CORRECTO - AppContext.jsx línea 1637-1650
const crearPedido = async (pedido) => {
  const { data, error } = await supabase
    .from("pedidos")  // ✅ Tabla correcta (NO presupuestos)
    .insert([{
      owner: user.id,
      numero_pedido: pedido.numero_pedido || `PED-${Date.now()}`,
      cliente: pedido.cliente,
      items: pedido.items || [],
      total: pedido.total || 0,
      estado: pedido.estado || "pendiente",
      observaciones: pedido.observaciones || "",
      fecha_entrega_estimada: pedido.fecha_entrega_estimada || null,
    }])
    .select()
    .single();
  // ...
};
```

**¿Qué hace?**
- Valida cliente e items
- Calcula total: `suma(cantidad × precio_unitario)`
- Genera número único: `PED-1729999999`
- Guarda en tabla `pedidos` (NO en presupuestos)
- Devuelve éxito/error

**Después de ejecutar el SQL, esto ya funcionará.**

---

### PASO 4: VERIFICAR DEVOLUCIONES EN BALANCE ✅

**Archivo**: `Dashboard.jsx`

Las devoluciones YA se descuentan del balance:

```javascript
// ✅ LÍNEA 47 - Fórmula correcta
const balanceFinal = 
  ingresosTotales 
  - egresosTotales 
  - gastosFijosGuardados 
  - deudaAcumulada 
  - devolucionesAprobadas;  // ✅ RESTA LAS DEVOLUCIONES

// ✅ LÍNEA 73 - Cuando guardas gastos fijos, también se restan
setBalance((prev) => ({
  ...prev,
  gastosFijos: monto,
  total: prev.ingresos - prev.egresos - monto - prev.deuda - prev.devoluciones,
  //                                                          ↑ INCLUYE DEVOLUCIONES
}));

// ✅ LÍNEA 27 - Se obtienen las devoluciones
const devolucionesAprobadas = calcularTotalDevolucionesAprobadas();

// ✅ LÍNEA 40 - Se guardan en el estado
setDevoluciones(devolucionesAprobadas);

// ✅ LÍNEA 169-180 - Card visual de devoluciones
<Col md={3}>
  <Card>
    <Card.Body className="text-center">
      <h4>↩️ Devoluciones Aprobadas</h4>
      <h2 className="text-secondary">${devoluciones.toLocaleString('es-ES')}</h2>
      {devoluciones > 0 && <p>Reembolsos aprobados</p>}
    </Card.Body>
  </Card>
</Col>
```

**¿Qué hace?**
- Obtiene todas las devoluciones aprobadas
- Suma el monto total
- Resta del Balance Final automáticamente
- Muestra card visual

**✅ ESTO YA FUNCIONA**

---

## 📋 PANEL DE EGRESOS - VERIFICACIÓN

**Archivo**: `Egresos.jsx` (en components/)

El panel de egresos está bien. Verifica:

1. ✅ Puedes crear egresos
2. ✅ Se suma al total de egresos
3. ✅ Se refleja en el Dashboard
4. ✅ Se guarda en Supabase

Si algo falla aquí, avísame para revisar la lógica.

---

## 🚀 RESUMEN: QUÉ HACER AHORA

### ✅ LISTA DE TAREAS

- [ ] **PASO 1**: Ejecutar SQL en Supabase (crear tablas)
- [ ] **PASO 2**: Recargar la aplicación (`npm run dev`)
- [ ] **PASO 3**: Ir a **Premium → Notas de Entrega**
- [ ] **PASO 4**: Crear una nota de entrega (debe funcionar)
- [ ] **PASO 5**: Ir a **Premium → Pedidos**
- [ ] **PASO 6**: Crear un pedido (debe funcionar y mostrar número)
- [ ] **PASO 7**: Ir a **Dashboard**
- [ ] **PASO 8**: Verificar que las devoluciones se resten del balance

---

## 🧪 TEST DE VERIFICACIÓN

### Test 1: Notas de Entrega
```
✅ Abre: Premium → Notas de Entrega
✅ Click: "➕ Nueva Nota"
✅ Completa: Cliente, Artículos, Fecha
✅ Click: "Crear Nota"
✅ Resultado: Debes ver "✅ Nota de entrega creada exitosamente"
✅ La nota aparece en la lista con número ENT-xxxxx
```

### Test 2: Pedidos
```
✅ Abre: Premium → Pedidos
✅ Click: "➕ Nuevo Pedido"
✅ Completa: Cliente, Productos, Cantidades, Precios
✅ Click: "Crear Pedido"
✅ Resultado: Debes ver "✅ Pedido creado exitosamente"
✅ El pedido aparece en la lista con número PED-xxxxx
✅ El total es correcto: suma(cantidad × precio)
```

### Test 3: Devoluciones en Balance
```
✅ Abre: Devoluciones
✅ Crea una devolución con estado "Aprobada"
✅ Ve a: Dashboard
✅ Card "↩️ Devoluciones Aprobadas" muestra el monto
✅ "Balance Final" se reduce en ese monto
```

### Test 4: Panel de Egresos
```
✅ Abre: Egresos
✅ Crea un egreso con monto = $100
✅ Ve a: Dashboard
✅ Card "📉 Egresos" muestra $100
✅ "Balance Final" se reduce en $100
✅ El egreso aparece en lista
```

---

## ⚠️ SI SIGUE FALLANDO

### Error: "relation 'notas_entrega' does not exist"
→ **No ejecutaste el SQL en Supabase**
→ Ir a PASO 1 y ejecutar

### Error: "duplicate key value violates unique constraint"
→ **El numero_pedido es duplicado**
→ Usar `PED-${Date.now()}` genera único, OK

### Las devoluciones no se restan
→ Revisar que estén marcadas como "Aprobada"
→ Revisar que `calcularTotalDevolucionesAprobadas()` existe

### Los egresos no aparecen
→ Verificar que se guardan en `egresos` tabla
→ Revisar que el usuario está autenticado

---

## 📞 PRÓXIMO PASO

**Ejecuta el SQL ahora** y luego avísame si:
- ✅ Las tablas se crearon
- ❌ Hay algún error
- ❌ Sigue sin funcionar algo

Voy a estar aquí para revisar. 💪

---

**Guía creada:** 2024
**Estado**: Listo para ejecutar
**Tiempo estimado**: 5 minutos