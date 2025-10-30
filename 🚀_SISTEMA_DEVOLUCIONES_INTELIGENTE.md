# 🚀 Sistema Inteligente de Devoluciones - Auditoría Completa

## 📋 Concepto Clave

Una devolución es una **transacción de modificación de venta sin alterar el registro original**.

Permite:
- ✅ Reembolsar dinero al cliente
- ✅ Cambiar producto por otro (sin modificar venta original)
- ✅ Recibir dinero adicional del cliente (cambio por producto más caro)
- ✅ Devolver dinero al cliente (cambio por producto más barato)
- ✅ **SIEMPRE quedar registrada** para auditoría completa

---

## 🏗️ Tabla `devoluciones` - Estructura Actualizada

```sql
ALTER TABLE devoluciones ADD COLUMN (
  estado_producto VARCHAR(50) DEFAULT 'Buen Estado',      -- 'Buen Estado', 'Dañado'
  tipo_resolucion VARCHAR(50) NOT NULL,                   -- 'Reembolso', 'Cambio Producto', 'Canje Proveedor'
  
  -- Para CAMBIO DE PRODUCTO
  producto_nuevo VARCHAR(255),                             -- Nombre del nuevo producto
  cantidad_nueva INT,                                      -- Cantidad del nuevo producto
  precio_nuevo DECIMAL(10, 2),                             -- Precio unitario del nuevo
  
  -- Cálculo automático
  diferencia_precio DECIMAL(10, 2),                        -- (precio_nuevo * cant) - (precio_viejo * cant)
                                                            -- POSITIVO = cliente paga
                                                            -- NEGATIVO = negocio devuelve
  registrado_como_ingreso BOOLEAN DEFAULT FALSE,           -- Si diferencia_precio > 0
  registrado_como_egreso BOOLEAN DEFAULT FALSE,            -- Si diferencia_precio < 0
  id_ingreso UUID REFERENCES ingreso(id),                  -- Para rastrear
  id_egreso UUID REFERENCES egreso(id),                    -- Para rastrear
  
  -- Para productos DAÑADOS
  tiene_cambio_proveedor BOOLEAN DEFAULT FALSE,
  
  -- Auditoria
  notas_adicionales TEXT,
  fecha_procesada TIMESTAMP,
  procesada_por UUID REFERENCES auth.users(id)
);
```

---

## 💡 Lógica de Procesamiento

### **Tipo 1: REEMBOLSO**
Producto en buen estado → Cliente devuelve dinero

```
Venta original: 
- Cliente: Juan
- Producto: Mouse ($50)
- Cantidad: 1
- Total: $50

Devolución solicitada:
- Tipo: "Reembolso"
- Estado producto: "Buen Estado"

Sistema hace:
1. ✅ Reintegra al inventario: Mouse +1 unidad
2. ✅ Crea EGRESO de $50 (reembolso al cliente)
3. ✅ Marca devolución como "Aprobada - Reembolso"
4. ✅ Balance final: REDUCE $50
5. ✅ Dashboard muestra en "Devoluciones"

BD Resultante:
- diferencia_precio: NULL (no aplica)
- tipo_resolucion: "Reembolso"
- registrado_como_egreso: TRUE
- id_egreso: (referencia al egreso de $50)
```

---

### **Tipo 2: CAMBIO POR PRODUCTO MÁS CARO**
Devuelve producto A → Toma producto B (más caro) → Cliente paga diferencia

```
Venta original:
- Cliente: María
- Producto: Teclado ($100)
- Cantidad: 1
- Total: $100

Devolución solicitada:
- Tipo: "Cambio de Producto"
- Producto nuevo: Monitor
- Precio nuevo: $250
- Cantidad nueva: 1

CÁLCULO:
Precio nuevo total = $250 × 1 = $250
Precio viejo total = $100 × 1 = $100
Diferencia = $250 - $100 = $150 ✅ (Cliente paga)

Sistema hace:
1. ✅ Quita del inventario: Teclado -1 unidad
2. ✅ Agrega al inventario: Monitor +1 unidad
3. ✅ Crea INGRESO de $150 (pago del cliente por diferencia)
4. ✅ Registra devolución con cambio
5. ✅ Balance final: AUMENTA $150

BD Resultante:
- producto_nuevo: "Monitor"
- precio_nuevo: 250.00
- cantidad_nueva: 1
- diferencia_precio: 150.00
- tipo_resolucion: "Cambio Producto"
- registrado_como_ingreso: TRUE
- id_ingreso: (referencia al ingreso de $150)
```

---

### **Tipo 3: CAMBIO POR PRODUCTO MÁS BARATO**
Devuelve producto A → Toma producto B (más barato) → Negocio devuelve diferencia

```
Venta original:
- Cliente: Pedro
- Producto: Monitor ($500)
- Cantidad: 1
- Total: $500

Devolución solicitada:
- Tipo: "Cambio de Producto"
- Producto nuevo: Teclado
- Precio nuevo: $150
- Cantidad nueva: 1

CÁLCULO:
Precio nuevo total = $150 × 1 = $150
Precio viejo total = $500 × 1 = $500
Diferencia = $150 - $500 = -$350 ❌ (Negocio devuelve)

Sistema hace:
1. ✅ Quita del inventario: Monitor -1 unidad
2. ✅ Agrega al inventario: Teclado +1 unidad
3. ✅ Crea EGRESO de $350 (devolución al cliente)
4. ✅ Registra devolución con cambio
5. ✅ Balance final: REDUCE $350

BD Resultante:
- producto_nuevo: "Teclado"
- precio_nuevo: 150.00
- cantidad_nueva: 1
- diferencia_precio: -350.00
- tipo_resolucion: "Cambio Producto"
- registrado_como_egreso: TRUE
- id_egreso: (referencia al egreso de $350)
```

---

### **Tipo 4: CAMBIO POR PRODUCTO IGUAL PRECIO**
Devuelve producto A → Toma producto B (mismo precio) → Sin movimiento de dinero

```
Venta original:
- Cliente: Laura
- Producto: Mouse Inalámbrico ($80)
- Cantidad: 1
- Total: $80

Devolución solicitada:
- Tipo: "Cambio de Producto"
- Producto nuevo: Mouse con Cable
- Precio nuevo: $80
- Cantidad nueva: 1

CÁLCULO:
Precio nuevo total = $80 × 1 = $80
Precio viejo total = $80 × 1 = $80
Diferencia = $80 - $80 = $0

Sistema hace:
1. ✅ Quita del inventario: Mouse Inalámbrico -1 unidad
2. ✅ Agrega al inventario: Mouse con Cable +1 unidad
3. ✅ NO crea ingreso ni egreso (diferencia = $0)
4. ✅ Registra devolución simple
5. ✅ Balance final: SIN CAMBIOS

BD Resultante:
- producto_nuevo: "Mouse con Cable"
- precio_nuevo: 80.00
- cantidad_nueva: 1
- diferencia_precio: 0.00
- tipo_resolucion: "Cambio Producto"
- registrado_como_ingreso: FALSE
- registrado_como_egreso: FALSE
```

---

### **Tipo 5: CAMBIO POR MÚLTIPLES UNIDADES**
Devuelve 1 unidad → Toma 2 unidades (con costo adicional)

```
Venta original:
- Cliente: Carlos
- Producto: Auriculares ($60)
- Cantidad: 1
- Total: $60

Devolución solicitada:
- Tipo: "Cambio de Producto"
- Producto nuevo: Auriculares Premium
- Precio nuevo: $45
- Cantidad nueva: 2 (compra 2 para tener más)

CÁLCULO:
Precio nuevo total = $45 × 2 = $90
Precio viejo total = $60 × 1 = $60
Diferencia = $90 - $60 = $30 (Cliente paga $30)

Sistema hace:
1. ✅ Quita del inventario: Auriculares -1 unidad
2. ✅ Agrega al inventario: Auriculares Premium +2 unidades
3. ✅ Crea INGRESO de $30
4. ✅ Balance final: AUMENTA $30

BD Resultante:
- producto_nuevo: "Auriculares Premium"
- precio_nuevo: 45.00
- cantidad_nueva: 2
- diferencia_precio: 30.00
- tipo_resolucion: "Cambio Producto"
```

---

### **Tipo 6: PRODUCTO DAÑADO CON CAMBIO PROVEEDOR**
Producto dañado → Proveedor acepta cambio → Sin dinero involucrado

```
Venta original:
- Cliente: Rosa
- Producto: Impresora ($400)
- Cantidad: 1
- Total: $400

Devolución solicitada:
- Tipo: "Canje Proveedor"
- Estado producto: "Dañado"
- Tiene cambio proveedor: SÍ

Sistema hace:
1. ✅ Registra en tabla "averias"
2. ✅ Estado: "Canjeada"
3. ✅ NO crea ingreso ni egreso
4. ✅ Marca para contactar proveedor
5. ✅ Balance final: SIN CAMBIOS

Notas para admin:
"Contactar proveedor para cambiar Impresora dañada"
```

---

### **Tipo 7: PRODUCTO DAÑADO SIN CAMBIO PROVEEDOR**
Producto dañado → Proveedor NO acepta cambio → Pérdida para el negocio

```
Venta original:
- Cliente: Bruno
- Producto: Cámara ($300)
- Cantidad: 1
- Total: $300

Devolución solicitada:
- Tipo: "Pérdida por Daño"
- Estado producto: "Dañado"
- Tiene cambio proveedor: NO

Sistema hace:
1. ✅ Registra en tabla "averias"
2. ✅ Estado: "Desechada"
3. ✅ Crea EGRESO de $300 (pérdida)
4. ✅ Marca como no recuperable
5. ✅ Balance final: REDUCE $300

IMPORTANTE:
- Este egreso representa una pérdida real
- Se registra para auditoría
- No es reembolso (cliente no recibe dinero)
```

---

## 🏗️ Tabla `averias` (Sin cambios)

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
  estado VARCHAR(50) DEFAULT 'Pendiente',  -- 'Canjeada', 'Desechada', 'Pendiente'
  fecha_resolucion TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 💻 Cambios de Código Necesarios

### 1. AppContext.jsx - Función procesarDevolucion()

```javascript
const procesarDevolucion = async (devolucion) => {
  // devolucion contiene:
  // {
  //   codigo_venta: string,
  //   cliente: string,
  //   producto_original: string,
  //   cantidad_original: number,
  //   precio_original: number,
  //   monto_original: number,
  //   estado_producto: 'Buen Estado' | 'Dañado',
  //   tipo_resolucion: 'Reembolso' | 'Cambio Producto' | 'Canje Proveedor' | 'Pérdida',
  //   producto_nuevo: string (si tipo_resolucion === 'Cambio Producto'),
  //   cantidad_nueva: number (si tipo_resolucion === 'Cambio Producto'),
  //   precio_nuevo: number (si tipo_resolucion === 'Cambio Producto'),
  //   tiene_cambio_proveedor: boolean (si estado_producto === 'Dañado'),
  //   razon: string,
  //   notas_adicionales: string
  // }

  try {
    let diferenciaPrecio = 0;
    let idIngreso = null;
    let idEgreso = null;

    // ========================
    // PASO 1: VALIDACIONES
    // ========================
    if (!devolucion.codigo_venta || !devolucion.tipo_resolucion) {
      return { success: false, message: "Faltan datos requeridos" };
    }

    // ========================
    // PASO 2: PROCESAR SEGÚN TIPO
    // ========================

    // --- TIPO: REEMBOLSO ---
    if (devolucion.tipo_resolucion === 'Reembolso') {
      // Reintegrar producto al inventario
      const productoEnInventario = inventario.find(
        p => p.nombre.toLowerCase() === devolucion.producto_original.toLowerCase()
      );
      
      if (productoEnInventario) {
        await actualizarProducto(productoEnInventario.id, {
          cantidad: productoEnInventario.cantidad + devolucion.cantidad_original
        });
      }

      // Crear EGRESO (reembolso)
      const resultadoEgreso = await crearEgreso({
        tipo: 'Devolución - Reembolso',
        monto: devolucion.monto_original,
        descripcion: `Reembolso ${devolucion.producto_original}. Cliente: ${devolucion.cliente}. Venta: ${devolucion.codigo_venta}`
      });
      
      if (resultadoEgreso.success) {
        idEgreso = resultadoEgreso.id;
      }
    }

    // --- TIPO: CAMBIO DE PRODUCTO ---
    if (devolucion.tipo_resolucion === 'Cambio Producto') {
      // Calcular diferencia
      const precioNuevoTotal = devolucion.precio_nuevo * devolucion.cantidad_nueva;
      const precioOriginalTotal = devolucion.precio_original * devolucion.cantidad_original;
      diferenciaPrecio = precioNuevoTotal - precioOriginalTotal;

      // Quitar producto original del inventario
      const productoOriginal = inventario.find(
        p => p.nombre.toLowerCase() === devolucion.producto_original.toLowerCase()
      );
      if (productoOriginal) {
        await actualizarProducto(productoOriginal.id, {
          cantidad: productoOriginal.cantidad - devolucion.cantidad_original
        });
      }

      // Agregar producto nuevo al inventario
      const productoNuevo = inventario.find(
        p => p.nombre.toLowerCase() === devolucion.producto_nuevo.toLowerCase()
      );
      if (productoNuevo) {
        await actualizarProducto(productoNuevo.id, {
          cantidad: productoNuevo.cantidad + devolucion.cantidad_nueva
        });
      } else {
        // Si producto nuevo no existe en inventario, crear aviso
        console.warn(`Producto nuevo "${devolucion.producto_nuevo}" no está en inventario`);
      }

      // Manejar diferencia de precio
      if (diferenciaPrecio > 0) {
        // Cliente paga más → INGRESO
        const resultadoIngreso = await crearIngreso({
          tipo: 'Pago por Cambio de Producto',
          monto: diferenciaPrecio,
          descripcion: `Pago adicional por cambio de ${devolucion.producto_original} a ${devolucion.producto_nuevo}. Cliente: ${devolucion.cliente}`
        });
        if (resultadoIngreso.success) {
          idIngreso = resultadoIngreso.id;
        }
      } else if (diferenciaPrecio < 0) {
        // Negocio devuelve → EGRESO
        const resultadoEgreso = await crearEgreso({
          tipo: 'Devolución por Cambio de Producto',
          monto: Math.abs(diferenciaPrecio),
          descripcion: `Devolución de diferencia por cambio de ${devolucion.producto_original} a ${devolucion.producto_nuevo}. Cliente: ${devolucion.cliente}`
        });
        if (resultadoEgreso.success) {
          idEgreso = resultadoEgreso.id;
        }
      }
      // Si diferencia = 0, no hacer nada
    }

    // --- TIPO: CANJE CON PROVEEDOR ---
    if (devolucion.tipo_resolucion === 'Canje Proveedor') {
      // Registrar en averias
      await registrarAveria({
        nombre_producto: devolucion.producto_original,
        cantidad: devolucion.cantidad_original,
        causa_dano: devolucion.razon,
        estado: 'Canjeada'
      });
    }

    // --- TIPO: PÉRDIDA POR DAÑO ---
    if (devolucion.tipo_resolucion === 'Pérdida') {
      // Registrar en averias
      await registrarAveria({
        nombre_producto: devolucion.producto_original,
        cantidad: devolucion.cantidad_original,
        causa_dano: devolucion.razon,
        estado: 'Desechada'
      });

      // Crear EGRESO (pérdida)
      const resultadoEgreso = await crearEgreso({
        tipo: 'Pérdida por Producto Dañado',
        monto: devolucion.monto_original,
        descripcion: `Pérdida: ${devolucion.producto_original} dañado (${devolucion.cantidad_original}u.). Cliente: ${devolucion.cliente}. Razón: ${devolucion.razon}`
      });
      if (resultadoEgreso.success) {
        idEgreso = resultadoEgreso.id;
      }
    }

    // ========================
    // PASO 3: GUARDAR EN BD
    // ========================
    const { data, error } = await supabase
      .from("devoluciones")
      .insert([
        {
          codigo_venta: devolucion.codigo_venta,
          cliente: devolucion.cliente,
          producto: devolucion.producto_original,
          cantidad: devolucion.cantidad_original,
          monto: devolucion.monto_original,
          razon: devolucion.razon,
          tipo_resolucion: devolucion.tipo_resolucion,
          estado_producto: devolucion.estado_producto,
          producto_nuevo: devolucion.producto_nuevo || null,
          cantidad_nueva: devolucion.cantidad_nueva || null,
          precio_nuevo: devolucion.precio_nuevo || null,
          diferencia_precio: diferenciaPrecio || null,
          tiene_cambio_proveedor: devolucion.tiene_cambio_proveedor || false,
          registrado_como_ingreso: idIngreso !== null,
          registrado_como_egreso: idEgreso !== null,
          id_ingreso: idIngreso,
          id_egreso: idEgreso,
          notas_adicionales: devolucion.notas_adicionales || "",
          fecha_procesada: new Date().toISOString(),
          procesada_por: user.id,
          estado: "Aprobada",
          fecha: new Date().toISOString().split('T')[0],
          owner: user.id,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    setDevoluciones((prev) => [data, ...prev]);
    
    return { 
      success: true, 
      message: `✅ Devolución procesada. ${diferenciaPrecio > 0 ? `Cliente pagó $${diferenciaPrecio.toFixed(2)}` : diferenciaPrecio < 0 ? `Se devolvió $${Math.abs(diferenciaPrecio).toFixed(2)}` : 'Sin movimiento de dinero'}`,
      data 
    };

  } catch (error) {
    console.error("Error al procesar devolución:", error);
    return { success: false, message: error.message };
  }
};
```

### 2. Devoluciones.jsx - UI Actualizada

**Reemplazar el formulario en el modal:**

```jsx
{ventaSeleccionada && (
  <>
    {/* Información de la venta */}
    <Alert variant="info">
      <strong>Venta Original:</strong>
      <ul className="mb-0 mt-2">
        <li>Código: {ventaSeleccionada.codigo_venta}</li>
        <li>Cliente: {ventaSeleccionada.cliente}</li>
        <li>Producto: {ventaSeleccionada.producto}</li>
        <li>Cantidad: {ventaSeleccionada.cantidad}</li>
        <li>Precio Unitario: ${ventaSeleccionada.precio_unitario}</li>
        <li>Total: ${ventaSeleccionada.monto?.toFixed(2)}</li>
      </ul>
    </Alert>

    {/* PASO 1: Estado del Producto */}
    <Form.Group className="mb-3">
      <Form.Label className="fw-bold">1️⃣ Estado del Producto</Form.Label>
      <Form.Select
        value={formData.estado_producto || 'Buen Estado'}
        onChange={(e) => {
          setFormData({
            ...formData,
            estado_producto: e.target.value,
            tipo_resolucion: e.target.value === 'Buen Estado' ? 'Reembolso' : ''
          });
        }}
      >
        <option value="Buen Estado">✅ Buen Estado</option>
        <option value="Dañado">❌ Dañado</option>
      </Form.Select>
    </Form.Group>

    {/* PASO 2: Tipo de Resolución */}
    <Form.Group className="mb-4">
      <Form.Label className="fw-bold">2️⃣ ¿Qué hacer con el producto?</Form.Label>
      
      {formData.estado_producto === 'Buen Estado' && (
        <>
          <Form.Check
            type="radio"
            name="resolucion"
            label="💰 Reembolso - Devolver dinero al cliente"
            value="Reembolso"
            checked={formData.tipo_resolucion === 'Reembolso'}
            onChange={(e) => setFormData({
              ...formData,
              tipo_resolucion: e.target.value,
              producto_nuevo: '',
              cantidad_nueva: '',
              precio_nuevo: ''
            })}
          />
          <Form.Check
            type="radio"
            name="resolucion"
            label="🔄 Cambio de Producto - El cliente toma otro"
            value="Cambio Producto"
            checked={formData.tipo_resolucion === 'Cambio Producto'}
            onChange={(e) => setFormData({
              ...formData,
              tipo_resolucion: e.target.value
            })}
          />
        </>
      )}

      {formData.estado_producto === 'Dañado' && (
        <>
          <Form.Check
            type="radio"
            name="resolucion"
            label="🔄 Cambio con Proveedor - Enviar a cambiar"
            value="Canje Proveedor"
            checked={formData.tipo_resolucion === 'Canje Proveedor'}
            onChange={(e) => setFormData({
              ...formData,
              tipo_resolucion: e.target.value,
              tiene_cambio_proveedor: true
            })}
          />
          <Form.Check
            type="radio"
            name="resolucion"
            label="❌ Pérdida Total - No hay cambio con proveedor"
            value="Pérdida"
            checked={formData.tipo_resolucion === 'Pérdida'}
            onChange={(e) => setFormData({
              ...formData,
              tipo_resolucion: e.target.value,
              tiene_cambio_proveedor: false
            })}
          />
        </>
      )}
    </Form.Group>

    {/* PASO 3: Si es CAMBIO DE PRODUCTO - Seleccionar nuevo */}
    {formData.tipo_resolucion === 'Cambio Producto' && (
      <Card className="mb-4 border-primary">
        <Card.Header className="bg-primary text-white">
          🔄 Detalles del Cambio
        </Card.Header>
        <Card.Body>
          <Form.Group className="mb-3">
            <Form.Label className="fw-bold">Producto Nuevo</Form.Label>
            <Form.Select
              value={formData.producto_nuevo || ''}
              onChange={(e) => {
                const productoSeleccionado = inventario.find(p => p.nombre === e.target.value);
                setFormData({
                  ...formData,
                  producto_nuevo: e.target.value,
                  precio_nuevo: productoSeleccionado?.precio || 0,
                  cantidad_nueva: 1
                });
              }}
            >
              <option value="">-- Seleccionar producto --</option>
              {inventario
                .filter(p => p.nombre !== ventaSeleccionada.producto)
                .map(p => (
                  <option key={p.id} value={p.nombre}>
                    {p.nombre} - ${p.precio.toFixed(2)}
                  </option>
                ))}
            </Form.Select>
          </Form.Group>

          {formData.producto_nuevo && (
            <>
              <Row className="mb-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Cantidad Nueva</Form.Label>
                    <Form.Control
                      type="number"
                      min="1"
                      value={formData.cantidad_nueva || 1}
                      onChange={(e) => setFormData({
                        ...formData,
                        cantidad_nueva: parseInt(e.target.value)
                      })}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Precio Unitario Nuevo</Form.Label>
                    <Form.Control
                      type="number"
                      step="0.01"
                      value={formData.precio_nuevo || 0}
                      onChange={(e) => setFormData({
                        ...formData,
                        precio_nuevo: parseFloat(e.target.value)
                      })}
                    />
                  </Form.Group>
                </Col>
              </Row>

              {/* CÁLCULO AUTOMÁTICO DE DIFERENCIA */}
              {formData.precio_nuevo && formData.cantidad_nueva && (
                <Alert 
                  variant={
                    (formData.precio_nuevo * formData.cantidad_nueva - ventaSeleccionada.monto) > 0
                      ? 'warning'
                      : (formData.precio_nuevo * formData.cantidad_nueva - ventaSeleccionada.monto) < 0
                      ? 'info'
                      : 'success'
                  }
                >
                  <strong>Cálculo Automático:</strong>
                  <ul className="mb-0 mt-2">
                    <li>Precio original: ${ventaSeleccionada.monto?.toFixed(2)}</li>
                    <li>Precio nuevo: ${(formData.precio_nuevo * formData.cantidad_nueva).toFixed(2)}</li>
                    <li>
                      <strong>
                        {(formData.precio_nuevo * formData.cantidad_nueva - ventaSeleccionada.monto) > 0
                          ? `✅ Cliente debe pagar: $${(formData.precio_nuevo * formData.cantidad_nueva - ventaSeleccionada.monto).toFixed(2)}`
                          : (formData.precio_nuevo * formData.cantidad_nueva - ventaSeleccionada.monto) < 0
                          ? `💰 Negocio devuelve: $${Math.abs(formData.precio_nuevo * formData.cantidad_nueva - ventaSeleccionada.monto).toFixed(2)}`
                          : `🟢 Sin cambio de dinero`
                        }
                      </strong>
                    </li>
                  </ul>
                </Alert>
              )}
            </>
          )}
        </Card.Body>
      </Card>
    )}

    {/* PASO 4: Razón y Notas */}
    <Form.Group className="mb-3">
      <Form.Label>Razón de la Devolución</Form.Label>
      <Form.Control
        as="textarea"
        rows={3}
        placeholder="Especifica el motivo..."
        value={formData.razon || ''}
        onChange={(e) => setFormData({
          ...formData,
          razon: e.target.value
        })}
      />
    </Form.Group>

    <Form.Group className="mb-3">
      <Form.Label>Notas Adicionales</Form.Label>
      <Form.Control
        as="textarea"
        rows={2}
        placeholder="Observaciones extras..."
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

---

## 📊 Cómo se ve en la Tabla de Devoluciones

| Código | Cliente | Producto Original | Tipo Resolución | Producto Nuevo | Diferencia | Estado |
|--------|---------|------------------|-----------------|----------------|-----------|--------|
| VTA-1 | Juan | Mouse | Reembolso | - | -$50 | ✅ Aprobada |
| VTA-2 | María | Teclado | Cambio Producto | Monitor | +$150 | ✅ Aprobada |
| VTA-3 | Pedro | Monitor | Cambio Producto | Teclado | -$350 | ✅ Aprobada |
| VTA-4 | Laura | Auriculares | Cambio Producto | Auriculares x2 | +$30 | ✅ Aprobada |
| VTA-5 | Rosa | Impresora | Canje Proveedor | - | $0 | ✅ Aprobada |
| VTA-6 | Bruno | Cámara | Pérdida | - | -$300 | ✅ Aprobada |

---

## 💰 Impacto en Reportes Financieros

### Dashboard muestra:
- **Reembolsos**: Suma de todas las devoluciones reembolso (egresos)
- **Cambios en inventario**: Reflejados en cantidades
- **Ingresos por cambios**: Si cliente pagó diferencia
- **Egresos por cambios**: Si negocio devolvió diferencia
- **Pérdidas**: Egreso por daños sin cambio proveedor
- **Averías pendientes**: Canjes pendientes con proveedor

### Estado Real del Negocio:
✅ Inventario siempre correcto
✅ Dinero siempre correcto
✅ Auditoria completa de cambios
✅ Sin modificar ventas originales (trazabilidad)

---

## 🎯 Pasos para Implementar

### Fase 1: Base de Datos ⏱️ 15 min
1. Ejecutar ALTER TABLE para `devoluciones`
2. Ejecutar CREATE TABLE para `averias`

### Fase 2: Backend ⏱️ 30 min
1. Crear función `procesarDevolucion()` en AppContext
2. Crear función `registrarAveria()` en AppContext
3. Actualizar `actualizarEstadoDevolucion()`

### Fase 3: Frontend ⏱️ 45 min
1. Actualizar UI del Modal en `Devoluciones.jsx`
2. Crear vista mejorada de tabla
3. Crear componente `Averias.jsx` (si lo necesitas)

### Fase 4: Testing ⏱️ 30 min
1. Probar reembolso
2. Probar cambio por más caro
3. Probar cambio por menos caro
4. Probar cambio sin diferencia
5. Probar cambio múltiples unidades
6. Probar daño con/sin cambio

---

## ✨ Resumen de Ventajas

| Aspecto | Antes | Después |
|--------|-------|---------|
| **Auditoria** | Parcial | ✅ Completa (todo registrado) |
| **Flexibilidad** | Sólo reembolso | ✅ Reembolso + Cambios |
| **Inventario** | Manual | ✅ Automático |
| **Dinero** | Manual | ✅ Calculado automático |
| **Ingresos por cambios** | No registrados | ✅ Registrados |
| **Egresos por cambios** | Manual | ✅ Automático |
| **Trazabilidad** | Baja | ✅ Alta (sin modificar venta original) |
| **Reportes** | Incompletos | ✅ Detallados |

---

## ❓ Dudas / Confirmaciones

Antes de codear, confirma si:

1. ✅ ¿Un cambio de producto debe restar del inventario original automáticamente?
2. ✅ ¿O solo se agrega el nuevo y queda pendiente que alguien devuelva el antiguo?
3. ✅ ¿Los cambios deben quedar en una tabla de "Cambios Pendientes"?
4. ✅ ¿Necesitas un componente de "Averías" en el navbar?
5. ✅ ¿Las múltiples cantidades en cambios son comunes en tu negocio?

---

## 🚀 ¿Listo para empezar?

**Opción A:** Código completo ahora (SQL + JS + React)
**Opción B:** Primero solo la base de datos, luego el código
**Opción C:** Paso a paso (empezamos por backend)

¿Cuál es tu preferencia? 🎯