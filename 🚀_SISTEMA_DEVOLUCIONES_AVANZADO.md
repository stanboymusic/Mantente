# 🚀 Sistema Avanzado de Devoluciones - Integración Inventario

## 📋 Visión General

Actualmente las devoluciones solo registran dinero. Necesitamos un sistema que:

1. **Reintegre productos al inventario** (cuando están en buen estado)
2. **Registre en "Averías"** (cuando están dañados)
3. **Maneje cambios con proveedor** (si el proveedor acepta cambio)
4. **Registre pérdidas como egresos** (si no hay cambio con proveedor)

---

## 🏗️ Estructura de Datos Requerida

### 1. Mejora de la Tabla `devoluciones`

```sql
ALTER TABLE devoluciones ADD COLUMN (
  estado_producto VARCHAR(50) DEFAULT 'Buen Estado',  -- 'Buen Estado', 'Dañado'
  tiene_cambio_proveedor BOOLEAN DEFAULT FALSE,
  registrado_como_egreso BOOLEAN DEFAULT FALSE,
  id_egreso UUID REFERENCES egreso(id),
  notas_adicionales TEXT
);
```

**Estados del Producto:**
- `Buen Estado` → Reintegrar al inventario
- `Dañado` → Registrar en Averías (nueva tabla)
- `Cambio Proveedor` → Usar si proveedor acepta cambio
- `Pérdida Total` → Registrar como egreso

---

### 2. Nueva Tabla: `averias`

Para rastrear productos dañados:

```sql
CREATE TABLE averias (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  owner UUID NOT NULL REFERENCES auth.users(id),
  producto_id UUID REFERENCES inventario(id),
  nombre_producto VARCHAR(255) NOT NULL,
  cantidad INT DEFAULT 1,
  causa_dano TEXT,
  id_devolucion UUID REFERENCES devoluciones(id),
  fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  estado VARCHAR(50) DEFAULT 'Pendiente',  -- 'Pendiente', 'Canjeada', 'Desechada'
  fecha_resolucion TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🔄 Flujo Completo de Devoluciones

### Caso 1: Producto en Buen Estado
```
1. Usuario registra devolución
2. Selecciona "Buen Estado"
3. Sistema:
   - Busca el producto en inventario
   - Suma la cantidad devuelta a: inventario.cantidad
   - Crea egreso reversible (entrada de dinero al cliente)
   - Marca devolución como "Aprobada - Reintegrado"
```

### Caso 2: Producto Dañado - CON Cambio de Proveedor
```
1. Usuario registra devolución
2. Selecciona "Dañado" + marca "Tiene cambio con proveedor"
3. Sistema:
   - Registra en tabla "averias" con estado = "Canjeada"
   - NO crea egreso (se canjea por nuevo producto)
   - Marca devolución como "Aprobada - Canjeada con Proveedor"
```

### Caso 3: Producto Dañado - SIN Cambio de Proveedor
```
1. Usuario registra devolución
2. Selecciona "Dañado" + marca "Sin cambio con proveedor"
3. Sistema:
   - Registra en tabla "averias" con estado = "Desechada"
   - Crea EGRESO por el valor del producto
     (representa pérdida del negocio)
   - Marca devolución como "Aprobada - Egreso Registrado"
   - Guarda referencia del egreso
```

---

## 💻 Cambios de Código Necesarios

### 1. AppContext.jsx - Nueva función

```javascript
const registrarDevolucionAvanzada = async (devolucion) => {
  // devolucion contiene:
  // {
  //   codigo_venta: string,
  //   cliente: string,
  //   producto: string,
  //   cantidad: number,
  //   monto: number,
  //   razon: string,
  //   estado_producto: 'Buen Estado' | 'Dañado',
  //   tiene_cambio_proveedor: boolean,
  //   notas_adicionales: string
  // }

  try {
    // 1. Buscar producto en inventario
    const productoEnInventario = inventario.find(
      p => p.nombre.toLowerCase() === devolucion.producto.toLowerCase()
    );

    // 2. Si es "Buen Estado" → Reintegrar al inventario
    if (devolucion.estado_producto === 'Buen Estado') {
      if (productoEnInventario) {
        await actualizarProducto(productoEnInventario.id, {
          cantidad: productoEnInventario.cantidad + devolucion.cantidad
        });
      }
      // Crear entrada de dinero (egreso negativo)
      await crearEgreso({
        tipo: 'Devolución - Reembolso',
        monto: -devolucion.monto,  // Negativo = entrada de dinero
        descripcion: `Reembolso por devolución de ${devolucion.producto}`
      });
    }
    
    // 3. Si es "Dañado"
    if (devolucion.estado_producto === 'Dañado') {
      // Registrar en averias
      const nuevoRegistroAveria = await registrarAveria({
        nombre_producto: devolucion.producto,
        cantidad: devolucion.cantidad,
        causa_dano: devolucion.razon,
        id_devolucion: devolucion.id,
        estado: devolucion.tiene_cambio_proveedor ? 'Canjeada' : 'Desechada'
      });

      // Si NO tiene cambio con proveedor → crear egreso (pérdida)
      if (!devolucion.tiene_cambio_proveedor) {
        const egresoCreado = await crearEgreso({
          tipo: 'Pérdida por Daño',
          monto: devolucion.monto,  // Egreso normal
          descripcion: `Pérdida: ${devolucion.producto} dañado (${devolucion.cantidad}u.)`
        });

        // Actualizar devolución con referencia del egreso
        await actualizarDevolución(devolucion.id, {
          registrado_como_egreso: true,
          id_egreso: egresoCreado.id
        });
      }
    }

    // 4. Actualizar estado de devolución a "Aprobada"
    await actualizarEstadoDevolucion(devolucion.id, 'Aprobada');

    return { success: true, message: 'Devolución procesada correctamente' };
  } catch (error) {
    return { success: false, message: error.message };
  }
};
```

### 2. Devoluciones.jsx - Mejoras en UI

**Agregar en el modal campos nuevos:**

```jsx
{ventaSeleccionada && (
  <>
    {/* ... campos existentes ... */}

    {/* NUEVO: Estado del Producto */}
    <Form.Group className="mb-3">
      <Form.Label>Estado del Producto</Form.Label>
      <Form.Select
        value={formData.estado_producto || 'Buen Estado'}
        onChange={(e) => setFormData({ 
          ...formData, 
          estado_producto: e.target.value,
          tiene_cambio_proveedor: false  // resetear
        })}
      >
        <option value="Buen Estado">✅ Buen Estado - Reintegrar</option>
        <option value="Dañado">❌ Dañado</option>
      </Form.Select>
    </Form.Group>

    {/* NUEVO: Si está dañado, preguntar por cambio */}
    {formData.estado_producto === 'Dañado' && (
      <Form.Group className="mb-3">
        <Form.Check
          type="checkbox"
          label="✅ El proveedor acepta cambio"
          checked={formData.tiene_cambio_proveedor || false}
          onChange={(e) => setFormData({
            ...formData,
            tiene_cambio_proveedor: e.target.checked
          })}
        />
        <small className="text-muted d-block mt-2">
          {formData.tiene_cambio_proveedor
            ? "✅ Se canjeará con el proveedor (sin egreso)"
            : "⚠️ Se registrará como pérdida (egreso del negocio)"}
        </small>
      </Form.Group>
    )}

    {/* NUEVO: Notas adicionales */}
    <Form.Group className="mb-3">
      <Form.Label>Notas Adicionales</Form.Label>
      <Form.Control
        as="textarea"
        rows={2}
        placeholder="Detalles adicionales sobre la devolución"
        value={formData.notas_adicionales || ''}
        onChange={(e) => setFormData({ 
          ...formData, 
          notas_adicionales: e.target.value 
        })}
      />
    </Form.Group>
  </>
)}
```

### 3. Dashboard.jsx - Agregar resumen de Averías

```jsx
// En el dashboard, mostrar:
const totalAverias = averias.length;
const averiasPendientes = averias.filter(a => a.estado === 'Pendiente').length;

<Card>
  <Card.Body className="text-center">
    <h6>Productos en Averías</h6>
    <h4>{totalAverias}</h4>
    <small className="text-warning">{averiasPendientes} pendientes</small>
  </Card.Body>
</Card>
```

---

## 📊 Ejemplos de Uso

### Ejemplo 1: Cliente devuelve producto en buen estado
```
Venta: VTA-2024-001 | Cliente: Juan | Producto: Mouse | Monto: $50

Devolución registrada:
✅ Producto: Buen Estado
✅ Cantidad: 1

Sistema hace:
1. Actualiza inventario: Mouse +1 unidad
2. Crea egreso de -$50 (reembolso)
3. Estado devolución: "Aprobada - Reintegrado"
4. Dashboard muestra ingreso en Egresos
```

### Ejemplo 2: Cliente devuelve producto dañado - con cambio
```
Venta: VTA-2024-002 | Cliente: María | Producto: Teclado | Monto: $150

Devolución registrada:
❌ Producto: Dañado
✅ Tiene cambio: SÍ

Sistema hace:
1. Registra en Averías: "Canjeada"
2. NO crea egreso (se canjea)
3. Estado devolución: "Aprobada - Canjeada"
4. Nota para admin: "Enviar a proveedor para canje"
```

### Ejemplo 3: Cliente devuelve producto dañado - sin cambio
```
Venta: VTA-2024-003 | Cliente: Pedro | Producto: Monitor | Monto: $800

Devolución registrada:
❌ Producto: Dañado
❌ Tiene cambio: NO

Sistema hace:
1. Registra en Averías: "Desechada"
2. Crea egreso de $800 (pérdida del negocio)
3. Estado devolución: "Aprobada - Egreso Registrado"
4. Dashboard muestra egreso de $800
5. Nota financiera: "Pérdida documentada"
```

---

## 🎯 Pasos para Implementar

### Fase 1: Base de Datos
1. ✅ Ejecutar SQL para alterar tabla `devoluciones`
2. ✅ Ejecutar SQL para crear tabla `averias`
3. ✅ Crear índices para performance

### Fase 2: Backend (AppContext.jsx)
1. ✅ Crear `registrarAveria()`
2. ✅ Crear `obtenerAverias()`
3. ✅ Mejorar `registrarDevolucion()` → versión avanzada
4. ✅ Mejorar `actualizarEstadoDevolucion()`

### Fase 3: Frontend
1. ✅ Mejorar UI de `Devoluciones.jsx` con nuevos campos
2. ✅ Crear componente `Averias.jsx` para ver/gestionar averías
3. ✅ Actualizar `Dashboard.jsx` con resumen de averías
4. ✅ Agregar al navbar si es necesario

### Fase 4: Testing
1. ✅ Probar devolución de producto en buen estado
2. ✅ Probar devolución de producto dañado con cambio
3. ✅ Probar devolución de producto dañado sin cambio
4. ✅ Verificar que egresos se registren correctamente
5. ✅ Verificar que inventario se actualice

---

## 🔍 Beneficios

| Aspecto | Antes | Después |
|--------|-------|---------|
| **Seguimiento inventario** | ❌ Perdía productos | ✅ Reintegración automática |
| **Control de daños** | ❌ Sin registro | ✅ Tabla de Averías |
| **Cambios proveedor** | ❌ Manual | ✅ Automático |
| **Pérdidas financieras** | ⚠️ Parcial | ✅ Egreso documentado |
| **Reportes** | ❌ Incompletos | ✅ Detallados |
| **Auditoría** | ❌ Difícil | ✅ Completa |

---

## ❓ Preguntas Pendientes

Antes de implementar, confirma:

1. ¿Necesitas un componente de "Averías" en el navbar?
2. ¿Los cambios con proveedor necesitan flujo de aprobación?
3. ¿Quieres reportes mensuales de devoluciones/averías?
4. ¿Los egresos de devoluciones deben afectar "Deuda" del mes?

---

## 📞 Próximos Pasos

**Opción A:** Implemento todo de una vez (más trabajo, pero completo)
**Opción B:** Implementamos por fases (más rápido, por partes)

¿Cuál prefieres? 🚀