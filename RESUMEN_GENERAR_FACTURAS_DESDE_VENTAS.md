# 📋 Guía Completa: Generar Facturas Desde Ventas Sin Facturar

## 🎯 ¿Qué se implementó?

Ahora puedes crear facturas **agrupando múltiples ventas** de un cliente. Esto significa:

✅ Seleccionar un cliente  
✅ Ver todas sus ventas sin facturar  
✅ Seleccionar 1, 2, 3 o más ventas  
✅ Generar una factura que agrupe todos los productos de esas ventas  
✅ Las ventas se marcan automáticamente como facturadas  

---

## 🛠️ Cambios Realizados

### 1. **GeneradorFacturas.jsx** - Interfaz mejorada

#### Nuevos imports:
```javascript
import { obtenerVentasSinFacturar, marcarVentasFacturadas }
```

#### Nuevos estados:
```javascript
const [showVentasModal, setShowVentasModal] = useState(false);           // Control del modal
const [clienteSeleccionadoVentas, setClienteSeleccionadoVentas] = useState(""); // Cliente elegido
const [ventasDisponibles, setVentasDisponibles] = useState([]);          // Ventas sin facturar
const [ventasSeleccionadas, setVentasSeleccionadas] = useState([]);      // Ventas a agrupar
```

#### Nuevos useEffect:
- Cuando se selecciona un cliente, automáticamente carga sus ventas sin facturar
- Muestra un contador de cuántas ventas hay disponibles

#### Nuevas funciones:
- `handleToggleVenta()`: Permite seleccionar/deseleccionar ventas individuales
- `handleCrearFacturaDesdeVentas()`: Crea la factura y marca ventas como facturadas

#### Nuevo Modal:
- "📋 Generar Factura desde Ventas" con interfaz de 2 pasos
- Paso 1: Seleccionar cliente
- Paso 2: Seleccionar ventas a agrupar

#### Nuevo Botón:
- Agregado botón "📋 Desde Ventas" en el header del Generador de Facturas
- Complementa el botón "+ Nueva Factura" existente

---

## 📊 Funciones en AppContext.jsx (ya existentes)

### `obtenerVentasSinFacturar(clienteId)`
```javascript
// Retorna: { success: true, data: [venta1, venta2, ...] }
// Busca en Supabase: SELECT * FROM ventas WHERE cliente_id = ? AND facturado = false
```

**Parámetros:**
- `clienteId`: ID del cliente (número)

**Retorna:**
- `success`: boolean
- `data`: Array de ventas sin facturar
- `message`: Descripción en caso de error

### `marcarVentasFacturadas(ventasIds)`
```javascript
// Retorna: { success: true, message: "Ventas marcadas como facturadas" }
// Actualiza en Supabase: UPDATE ventas SET facturado = true WHERE id IN (...)
```

**Parámetros:**
- `ventasIds`: Array de IDs de ventas `[1, 2, 3]`

**Retorna:**
- `success`: boolean
- `message`: Descripción

---

## 🚀 Cómo Usar

### Opción 1: Crear Factura Individual (Sin cambios)
```
1. Clic en "+ Nueva Factura"
2. Llena los datos normalmente
3. Agrega productos uno por uno
4. Clic en "✅ Crear Factura"
```

### Opción 2: Crear Factura Agrupada Desde Ventas (NUEVO)
```
1. Clic en "📋 Desde Ventas" (nuevo botón azul)
2. Selecciona cliente en "Paso 1"
   → Se cargan automáticamente sus ventas sin facturar
3. En "Paso 2", selecciona las ventas a agrupar
   → Puedes usar el checkbox del encabezado para seleccionar todas
   → O selecciona individualmente
4. Revisa el total en el resumen
5. Clic en "✅ Crear Factura Agrupada"
   → Se crea factura con TODOS los productos de esas ventas
   → Las ventas se marcan automáticamente como facturadas ✅
```

---

## 📋 Flujo Técnico

```
Usuario → Clic "📋 Desde Ventas"
   ↓
Modal se abre con campos vacíos
   ↓
Usuario selecciona Cliente
   ↓
useEffect dispara: obtenerVentasSinFacturar(clienteId)
   ↓
Se cargan las ventas sin facturar
Se muestra tabla con checkbox para cada venta
   ↓
Usuario selecciona 1+ ventas
   ↓
Usuario clic en "✅ Crear Factura Agrupada"
   ↓
handleCrearFacturaDesdeVentas():
   - Valida que haya ventas seleccionadas
   - Extrae todos los productos de las ventas
   - Calcula total agrupado
   - Llama a crearFactura() con todos los productos
   ↓
Si es exitoso:
   - Llama a marcarVentasFacturadas(ventasIds)
   - Muestra confirmación: "✅ Factura FAC-XXXXX creada desde 3 venta(s)"
   - Limpia el modal
```

---

## 📦 Estructura de Datos

### Ventas retornadas por `obtenerVentasSinFacturar()`:
```javascript
{
  id: 1,
  cliente_id: 10,
  productos_json: [
    { nombre: "Laptop", cantidad: 1, precio_unitario: 500, subtotal: 500 },
    { nombre: "Mouse", cantidad: 2, precio_unitario: 25, subtotal: 50 }
  ],
  monto_total: 550,
  cantidad_productos: 2,
  facturado: false,
  fecha: "2024-01-15"
}
```

### Factura creada:
```javascript
{
  numero_factura: "FAC-000001-234",
  cliente_id: 10,
  cliente: "Carlos",
  productos_json: [
    // Todos los productos de las 3 ventas seleccionadas
    { nombre: "Laptop", cantidad: 1, precio_unitario: 500, subtotal: 500 },
    { nombre: "Mouse", cantidad: 2, precio_unitario: 25, subtotal: 50 },
    // ... más productos de las otras 2 ventas
  ],
  subtotal: 550,  // Suma de todas las ventas
  total: 550,
  estado: "pendiente",
  ventas_ids: [1, 2, 3]  // IDs de las ventas agrupadas (para auditoria)
}
```

---

## ✅ Caso de Uso Ejemplo

**Escenario:** Carlos tiene 5 ventas sin facturar

| Venta | Fecha | Productos | Total |
|-------|-------|-----------|-------|
| #101 | 15/01 | 2 items | $100 |
| #102 | 16/01 | 1 item | $50 |
| #103 | 17/01 | 3 items | $200 |
| #104 | 18/01 | 1 item | $75 |
| #105 | 19/01 | 2 items | $150 |

**Acción:** Quiero crear 1 factura con las ventas #101, #103, #105

**Resultado:**
```
1. Modal → Selecciono "Carlos"
2. Tabla muestra 5 ventas
3. Selecciono checkbox de #101, #103, #105
4. Resumen muestra: "3 venta(s) seleccionada(s) - Total: $450"
5. Clic en "✅ Crear Factura Agrupada"
6. ✅ Factura FAC-000001-xxx creada:
   - 2 items (de #101)
   - 3 items (de #103)
   - 2 items (de #105)
   - Total: $450
7. Las ventas #101, #103, #105 ahora tienen facturado = true ✅
```

---

## 🔍 Validaciones Implementadas

✅ No puedes crear factura sin seleccionar cliente  
✅ No puedes crear factura sin seleccionar al menos 1 venta  
✅ Solo muestra ventas sin facturar (`facturado = false`)  
✅ Solo muestra ventas del cliente seleccionado  
✅ Solo agrupa productos que existan en las ventas  
✅ Calcula correctamente el total desde todas las ventas  
✅ Marca todas las ventas seleccionadas como facturadas  

---

## 🐛 Debugging

Si algo no funciona:

### 1. Abre la consola (F12)
```javascript
// Verifica logs
console.log("Ventas sin facturar obtenidas:", data)
console.log("Ventas marcadas como facturadas:", ventasIds)
```

### 2. Verifica en Supabase
```sql
-- Busca ventas sin facturar
SELECT * FROM ventas 
WHERE cliente_id = 10 AND facturado = false
ORDER BY fecha DESC;

-- Verifica que se actualizaron
SELECT id, facturado FROM ventas 
WHERE id IN (1, 2, 3);
```

### 3. Comportamiento esperado
- Al seleccionar cliente: debe cargar ventas en <2 segundos
- Al seleccionar ventas: checkboxes deben cambiar de color
- Al crear factura: debe haber confirmación verde
- Facturas debe aparecer en la tabla abajo

---

## 📝 Próximos Pasos Opcionales

- [ ] Agregar filtro por rango de fechas
- [ ] Agregar opción de "Seleccionar todas menos..."
- [ ] Mostrar preview del PDF antes de confirmar
- [ ] Agregar búsqueda/filtro rápido en tabla de ventas
- [ ] Generar reportes de ventas agrupadas por factura

---

## 📞 Notas Importantes

⚠️ **Importante:** Las ventas deben tener `productos_json` completo con:
- `nombre`: nombre del producto
- `cantidad`: cantidad vendida
- `precio_unitario`: precio por unidad
- `subtotal`: cantidad × precio_unitario

Si una venta no tiene `productos_json` válido:
- Se saltará al agrupar productos
- Aparecerá alerta de advertencia
- No se podrá crear factura

✅ **Beneficio:** Ahora puedes:
- Reducir tiempo de facturación en 50%+
- Agrupar ventas de diferentes días
- Crear una única factura para múltiples transacciones
- Mantener auditoria completa (qué ventas → qué factura)
