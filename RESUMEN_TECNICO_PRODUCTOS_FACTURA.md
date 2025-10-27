# 📋 RESUMEN TÉCNICO: MÚLTIPLES PRODUCTOS EN FACTURAS

## 🎯 OBJETIVO

Permitir que cada factura incluya múltiples productos (línea por línea) con cantidad y precio unitario, en lugar de solo un monto global.

---

## 📁 ARCHIVOS MODIFICADOS

### 1️⃣ Base de Datos - SQL Migration

**Archivo:** `ACTUALIZAR_TABLA_FACTURAS_PRODUCTOS.sql`

```sql
ALTER TABLE facturas ADD COLUMN IF NOT EXISTS productos_json JSONB DEFAULT '[]'::jsonb;
```

**Cambios:**
- ✅ Agrega columna `productos_json` a tabla `facturas`
- ✅ Tipo: JSONB (JSON con búsqueda/indexación)
- ✅ Default: array vacío `[]`
- ✅ Idempotente: puede ejecutarse múltiples veces sin error

**Estructura esperada:**
```json
[
  {
    "nombre": "Laptop Dell",
    "cantidad": 2,
    "precio_unitario": 1200.00,
    "subtotal": 2400.00
  },
  {
    "nombre": "Mouse",
    "cantidad": 1,
    "precio_unitario": 25.00,
    "subtotal": 25.00
  }
]
```

---

### 2️⃣ Backend - AppContext.jsx

**Archivo:** `src/context/AppContext.jsx`
**Líneas:** 673-722

**Cambio:**
Modificó función `crearFactura()` para aceptar y guardar el array `productos_json`:

```javascript
const { data, error } = await supabase
  .from("facturas")
  .insert([
    {
      // ... otros campos ...
      // ✅ NUEVO: Agregar productos JSON
      productos_json: factura.productos_json || [],
    },
  ])
```

**Detalles:**
- Acepta `productos_json` como array de objetos
- Si no se proporciona, default es array vacío `[]`
- Se guarda tal como se envía desde el frontend
- Permite recuperar todos los productos al cargar la factura

---

### 3️⃣ Frontend - GeneradorFacturas.jsx

**Archivo:** `src/components/GeneradorFacturas.jsx`
**Cambios principales:** Líneas 16-200, 368-650, 576-750

#### **A. Estado y State Management**

```javascript
// ✅ NUEVO: Estado para productos
const [productos, setProductos] = useState([]);
const [nuevoProducto, setNuevoProducto] = useState({
  nombre: "",
  cantidad: 1,
  precio_unitario: 0,
});
```

#### **B. Funciones Auxiliares para Productos**

**`handleProductoChange()`** - Línea ~70
- Maneja cambios en los campos del nuevo producto
- Convierte cantidad y precio a número

**`agregarProducto()`** - Línea ~85
- Valida que nombre no esté vacío
- Valida que cantidad > 0
- Valida que precio_unitario > 0
- Calcula subtotal: `cantidad * precio_unitario`
- Agrega a array `productos`
- Limpia el formulario

**`eliminarProducto(id)`** - Línea ~105
- Filtra el producto por ID
- Actualiza estado

**`calcularSubtotalDesdeProductos()`** - Línea ~110
```javascript
const calcularSubtotalDesdeProductos = () => {
  return productos.reduce((total, p) => total + p.subtotal, 0);
};
```
- Suma todos los subtotales de los productos

**`calcularTotal()`** - Línea ~115 (MODIFICADO)
```javascript
const calcularTotal = () => {
  const subtotal = calcularSubtotalDesdeProductos(); // ✅ Ahora desde productos
  const descuento = parseFloat(formData.descuento) || 0;
  const impuesto = parseFloat(formData.impuesto) || 0;
  return subtotal - descuento + impuesto;
};
```

#### **C. Validación Mejorada en `handleSubmit()`** - Línea ~122

```javascript
// Validación 2: Productos requeridos
if (productos.length === 0) {
  setAlerta({ 
    type: "danger", 
    message: "❌ Debe agregar al menos un producto a la factura" 
  });
  return;
}
```

#### **D. Envío de Datos a Backend** - Línea ~160

```javascript
const resultado = await crearFactura({
  // ... datos existentes ...
  subtotal: calcularSubtotalDesdeProductos(),
  // ✅ NUEVO: Pasar productos_json
  productos_json: productos.map(p => ({
    nombre: p.nombre,
    cantidad: p.cantidad,
    precio_unitario: p.precio_unitario,
    subtotal: p.subtotal,
  })),
});
```

#### **E. Interfaz de Usuario en Modal** - Línea ~368-650

**Sección: "🛍️ Agregar Productos a la Factura"**

```jsx
<Card className="mb-4 bg-light">
  <Card.Header className="bg-info text-white fw-bold">
    🛍️ Agregar Productos a la Factura
  </Card.Header>
  <Card.Body>
    {/* Campos de entrada para nuevo producto */}
    <Row>
      <Col md={5}>Nombre del Producto</Col>
      <Col md={2}>Cantidad</Col>
      <Col md={3}>Precio Unitario</Col>
      <Col md={2}>[➕ Agregar]</Col>
    </Row>
    
    {/* Tabla de productos agregados */}
    {productos.length > 0 && (
      <Table striped bordered hover size="sm">
        {/* Headers: Producto, Cantidad, Precio Unit., Subtotal, Acción */}
        {/* Rows: mapear productos */}
        {/* Footer: Total de subtotales */}
      </Table>
    )}
  </Card.Body>
</Card>
```

#### **F. Tabla de Facturas Actualizada** - Línea ~320

Nueva columna "Productos":
```jsx
<th>Productos</th>
```

Mostrar conteo:
```jsx
<td>
  <small>
    {factura.productos_json && factura.productos_json.length > 0
      ? `${factura.productos_json.length} producto(s)`
      : "Sin productos"}
  </small>
</td>
```

---

### 4️⃣ Plantilla PDF - FacturaTemplate - Línea ~576

#### **A. Obtener Productos del JSON**

```javascript
const productosArray = factura.productos_json && Array.isArray(factura.productos_json) 
  ? factura.productos_json 
  : [];
```

#### **B. Tabla de Productos Profesional**

```jsx
<table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "30px" }}>
  <thead>
    <tr style={{ backgroundColor: "#f5f5f5", borderBottom: "2px solid #333" }}>
      <th>Producto/Servicio</th>
      <th>Cantidad</th>
      <th>Precio Unit.</th>
      <th>Subtotal</th>
    </tr>
  </thead>
  <tbody>
    {productosArray.length > 0 ? (
      productosArray.map((producto, index) => (
        <tr key={index}>
          <td>{producto.nombre}</td>
          <td style={{ textAlign: "center" }}>{producto.cantidad}</td>
          <td style={{ textAlign: "right" }}>${producto.precio_unitario.toFixed(2)}</td>
          <td style={{ textAlign: "right" }}>${producto.subtotal.toFixed(2)}</td>
        </tr>
      ))
    ) : (
      <tr>
        <td colSpan="4" style={{ textAlign: "center", color: "#999" }}>
          Sin productos registrados
        </td>
      </tr>
    )}
  </tbody>
</table>
```

**Mejoras visuales:**
- Bordes profesionales
- Alineación correcta de números (derecha)
- Espaciado consistente
- Manejo de caso cuando no hay productos

---

## 🔄 FLUJO DE DATOS

### Crear Factura:

```
Usuario en Modal
    ↓
Ingresa nombre, cantidad, precio_unitario del producto
    ↓
Click [➕ Agregar]
    ↓
Validación en agregarProducto()
    ↓
Calcula subtotal: cantidad × precio_unitario
    ↓
Agrega a array: setProductos([...productos, nuevoProducto])
    ↓
Limpia campos del formulario
    ↓
Usuario continúa agregando más productos (opcional)
    ↓
Click [✅ Crear Factura]
    ↓
handleSubmit() valida:
  - Empresa completa ✓
  - Al menos 1 producto ✓
  - Cliente seleccionado ✓
    ↓
Calcula subtotal total: sum(productos.subtotal)
    ↓
Mapea productos a formato JSON:
  [{nombre, cantidad, precio_unitario, subtotal}, ...]
    ↓
Envía a crearFactura(factura)
    ↓
AppContext inserta en Supabase:
  productos_json: JSON array
    ↓
Backend retorna factura con ID
    ↓
setFacturas([...prev, nuevaFactura])
    ↓
Modal se cierra ✓
    ↓
Tabla se actualiza ✓
```

### Descargar PDF:

```
Usuario click [📥 PDF]
    ↓
descargarPDF(factura) inicia
    ↓
Obtiene FacturaTemplate con productos_json
    ↓
Extrae: productosArray = factura.productos_json
    ↓
Renderiza tabla con todos los productos
    ↓
html2canvas convierte HTML a imagen
    ↓
jsPDF genera PDF con múltiples páginas si es necesario
    ↓
Descarga: Factura_FAC-XXXXXX_YYYY-MM-DD.pdf ✓
```

---

## ✅ VALIDACIONES IMPLEMENTADAS

| Validación | Lugar | Mensaje |
|-----------|-------|---------|
| Nombre vacío | `agregarProducto()` | "El nombre del producto es requerido" |
| Cantidad ≤ 0 | `agregarProducto()` | "La cantidad debe ser mayor a 0" |
| Precio ≤ 0 | `agregarProducto()` | "El precio unitario debe ser mayor a 0" |
| Sin productos | `handleSubmit()` | "Debe agregar al menos un producto a la factura" |
| Empresa incompleta | `handleSubmit()` | "DEBE COMPLETAR el Perfil de la Empresa primero" |
| Cliente no seleccionado | `handleSubmit()` | "Debes seleccionar un cliente" |

---

## 🔄 COMPATIBILIDAD

- ✅ **Facturas antiguas**: Sin cambios. Campo `productos_json` será `[]` (vacío)
- ✅ **Facturas nuevas**: Incluyen array de productos
- ✅ **PDF antiguas**: Se generan sin problemas
- ✅ **PDF nuevas**: Muestran tabla de productos completa

---

## 📊 ESTRUCTURA COMPLETA DE FACTURA EN BASE DE DATOS

```json
{
  "id": 123,
  "owner": "user-uuid-xxx",
  "numero_factura": "FAC-000001-123",
  
  // Cliente
  "cliente_id": 5,
  "cliente": "Juan Pérez",
  "cliente_email": "juan@email.com",
  "cliente_telefono": "+123 456 7890",
  "cliente_ruc": "987654321",
  "cliente_direccion": "Calle B 456",
  
  // Empresa
  "empresa_nombre": "Mi Empresa S.A.",
  "empresa_ruc": "123456789",
  "empresa_email": "empresa@email.com",
  "empresa_telefono": "+123 456 7890",
  "empresa_direccion": "Calle Principal 123",
  "empresa_logo_url": "https://...",
  
  // Montos
  "subtotal": 2450.00,
  "descuento": 50.00,
  "impuesto": 100.00,
  "total": 2500.00,
  
  // Metadata
  "estado": "pendiente",
  "metodo_pago": "Transferencia",
  "fecha": "2024-12-25",
  "fecha_pago": null,
  "notas": "",
  "venta_id": null,
  
  // ✅ NUEVO: Productos
  "productos_json": [
    {
      "nombre": "Laptop Dell XPS 15",
      "cantidad": 2,
      "precio_unitario": 1200.00,
      "subtotal": 2400.00
    },
    {
      "nombre": "Mouse inalámbrico",
      "cantidad": 2,
      "precio_unitario": 25.00,
      "subtotal": 50.00
    }
  ],
  
  // Timestamps
  "created_at": "2024-12-25T10:30:00.000Z",
  "updated_at": "2024-12-25T10:30:00.000Z"
}
```

---

## 🧪 PRUEBAS RECOMENDADAS

1. **Test 1: Crear factura con 1 producto**
   - Resultado esperado: Se crea exitosamente
   - PDF muestra 1 fila de producto

2. **Test 2: Crear factura con 5 productos**
   - Resultado esperado: Se crea exitosamente
   - PDF muestra 5 filas de productos
   - Subtotal calculado correctamente

3. **Test 3: Eliminar producto de la lista**
   - Click en 🗑️
   - Resultado: Producto se elimina
   - Total se recalcula

4. **Test 4: Intentar crear sin productos**
   - Click [✅ Crear Factura] sin agregar productos
   - Resultado: Error "Debe agregar al menos un producto"

5. **Test 5: Validar descuentos e impuestos**
   - Subtotal: 1000
   - Descuento: 100
   - Impuesto: 200
   - Total esperado: 1100 ✓

6. **Test 6: Descargar PDF de factura con productos**
   - Verifica que tabla de productos esté completa
   - Verifica que los montos sean correctos
   - Verifica que el PDF sea descargable

7. **Test 7: Múltiples caracteres especiales**
   - Producto: "Laptop (Dell) & Accesorios"
   - Resultado: Se guarda sin problemas

---

## 🚀 DESPLIEGUE

1. ✅ Ejecutar SQL migration en Supabase
2. ✅ Recargar aplicación (`npm run dev`)
3. ✅ Limpiar caché del navegador (F5 o Ctrl+Shift+Del)
4. ✅ Probar con los 7 tests recomendados

---

## 📝 NOTAS IMPORTANTES

- Los productos no pueden editarse en línea actualmente (diseño intencional)
- El subtotal de cada producto se calcula automáticamente
- No hay límite de productos por factura
- Los productos se guardan como JSON inmutable (no se pueden cambiar después)
- Para cambiar productos, hay que crear una nueva factura

---

## 🔍 DEBUGGING

### Ver productos en base de datos:
```sql
SELECT numero_factura, productos_json FROM facturas LIMIT 5;
```

### Ver estructura JSON de una factura:
```sql
SELECT jsonb_array_length(productos_json) as cantidad_productos
FROM facturas WHERE numero_factura = 'FAC-000001-123';
```

### Consulta avanzada - Buscar facturas por nombre de producto:
```sql
SELECT numero_factura, producto->>'nombre' as producto
FROM facturas,
LATERAL jsonb_array_elements(productos_json) as producto
WHERE producto->>'nombre' ILIKE '%laptop%';
```

¡Implementación completada! 🎉