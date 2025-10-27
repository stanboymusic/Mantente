# 🧪 Guía de Pruebas: Generar Facturas Desde Ventas

## ✅ Pre-requisitos

1. ✅ La aplicación debe estar en ejecución: `npm run dev`
2. ✅ Debes tener clientes creados en la base de datos
3. ✅ Al menos 1 cliente debe tener 2+ ventas SIN facturar
4. ✅ Las ventas deben tener `productos_json` completo

---

## 🚀 Test 1: Acceder a la Funcionalidad

**Pasos:**
1. Abre la app en http://localhost:5173
2. Navega a **📄 Facturas** → **Generador de Facturas**
3. Verifica que veas estos botones en el header:
   - 🔵 **📋 Desde Ventas** (NUEVO - botón azul)
   - ⚪ **+ Nueva Factura** (existente - botón blanco)

**Resultado Esperado:**
- ✅ Ambos botones visibles
- ✅ El botón "📋 Desde Ventas" es azul (color info)

---

## 🚀 Test 2: Abrir Modal de Ventas

**Pasos:**
1. Clic en botón "📋 Desde Ventas"
2. Se debe abrir un modal con:
   - Título: "📋 Generar Factura desde Ventas"
   - Sección "👤 Paso 1: Seleccionar Cliente"
   - Dropdown vacío

**Resultado Esperado:**
- ✅ Modal abierto y visible
- ✅ Dropdown con opción "-- Selecciona un cliente --"
- ✅ Lista de clientes aparece al hacer clic

---

## 🚀 Test 3: Seleccionar Cliente y Cargar Ventas

**Pasos:**
1. En el dropdown "Cliente", selecciona un cliente que tenga ventas sin facturar
   - *Ej: Si no tienes, crea una venta en Ventas.jsx primero*
2. Después de seleccionar, debe aparecer:
   - Sección "📦 Paso 2: Seleccionar Ventas (X)"
   - Tabla con checkboxes
   - Alerta de información mostrando: "📦 X venta(s) sin facturar encontrada(s)"

**Resultado Esperado:**
- ✅ Sección "Paso 2" aparece dinámicamente
- ✅ Tabla muestra las ventas del cliente
- ✅ Contador actualizado: "Paso 2: Seleccionar Ventas (3)" si hay 3 ventas
- ✅ Alerta verde informativa

**Si no hay ventas:**
- ⚠️ Alerta amarilla: "⚠️ No hay ventas sin facturar para este cliente"

---

## 🚀 Test 4: Tabla de Ventas

**Verificar que la tabla tenga:**

| Columna | Contenido |
|---------|-----------|
| ☐ | Checkbox para seleccionar |
| ID | #1, #2, #3... |
| Fecha | Formato fecha local |
| Productos | "2 producto(s)" |
| Total | "$100.00" |

**Resultado Esperado:**
- ✅ Checkbox en encabezado (seleccionar/deseleccionar todos)
- ✅ Cada fila tiene checkbox individual
- ✅ Los totales son números correctos
- ✅ Las fechas están formateadas correctamente

---

## 🚀 Test 5: Seleccionar Ventas (Individual)

**Pasos:**
1. Haz clic en el checkbox de la primera venta
2. Verifica que:
   - La fila se ilumina (fondo azul claro)
   - El checkbox está marcado ✓
3. Repite para una segunda venta

**Resultado Esperado:**
- ✅ Las filas se iluminan al ser seleccionadas
- ✅ Los checkboxes responden correctamente
- ✅ Bajo la tabla aparece alerta: "✅ 2 venta(s) seleccionada(s)" con total

---

## 🚀 Test 6: Seleccionar Todas las Ventas

**Pasos:**
1. Haz clic en el checkbox del encabezado (izquierda)
2. Verifica que TODOS los checkboxes se marquen

**Resultado Esperado:**
- ✅ Todos los checkboxes marcan/desmarcan juntos
- ✅ Alerta muestra cantidad correcta
- ✅ Total agrupado es correcto

---

## 🚀 Test 7: Validación - Sin Seleccionar Ventas

**Pasos:**
1. Con 0 ventas seleccionadas
2. Intenta hacer clic en "✅ Crear Factura Agrupada"

**Resultado Esperado:**
- ✅ El botón está DESHABILITADO (grisáceo)
- ✅ Al pasar mouse, no se puede hacer clic

---

## 🚀 Test 8: Crear Factura Agrupada

**Pasos:**
1. Selecciona 2 o 3 ventas
2. Verifica el total en el resumen
3. Clic en "✅ Crear Factura Agrupada"
4. Espera confirmación

**Resultado Esperado:**
- ✅ Alerta verde: "✅ Factura FAC-XXXXX creada desde X venta(s)"
- ✅ Modal se cierra automáticamente
- ✅ Nueva factura aparece en la tabla abajo
- ✅ Los productos de TODAS las ventas están en la factura

---

## 🚀 Test 9: Verificar Factura Creada

**Pasos:**
1. Busca la nueva factura en la tabla
   - Columna "Productos": debe mostrar más items de los que había en 1 venta
   - Columna "Subtotal": debe ser la suma de las ventas agrupadas
2. Clic en botón "📥 PDF" para descargar
3. Abre el PDF y verifica:
   - Todos los productos de las 3 ventas están presentes
   - Total es correcto
   - Cliente es correcto

**Resultado Esperado:**
- ✅ Factura visible con los datos correctos
- ✅ PDF descarga exitosamente
- ✅ PDF contiene todos los productos

---

## 🚀 Test 10: Verificar Ventas Marcadas como Facturadas

**Pasos:**
1. Abre nuevamente el modal "📋 Desde Ventas"
2. Selecciona el MISMO cliente
3. Verifica la cantidad de ventas sin facturar

**Resultado Esperado:**
- ✅ Las ventas que agrupaste DESAPARECEN de la lista
- ✅ El contador de "Paso 2" disminuye
- ✅ Si agrupaste todas las ventas, dice "⚠️ No hay ventas sin facturar"
- ✅ Confirma que `facturado = true` en Supabase

**SQL para verificar en Supabase:**
```sql
SELECT id, cliente_id, facturado, productos_json 
FROM ventas 
WHERE cliente_id = 10 
ORDER BY id DESC;
```

---

## 🚀 Test 11: Crear Segunda Factura (Cliente Diferente)

**Pasos:**
1. Selecciona un CLIENTE DIFERENTE en "Paso 1"
2. Carga sus ventas
3. Selecciona y agrupa sus ventas
4. Crea la factura

**Resultado Esperado:**
- ✅ La factura creada tiene el nombre del cliente correcto
- ✅ Los productos son de las ventas correctas
- ✅ No hay conflicto con la factura anterior

---

## 🚀 Test 12: Verificar Persistencia

**Pasos:**
1. Recarga la página (F5)
2. Ve a **Generador de Facturas**
3. Abre "📋 Desde Ventas"
4. Selecciona el cliente de las pruebas anteriores

**Resultado Esperado:**
- ✅ Las ventas que ya facturaste NO aparecen en la lista
- ✅ Las nuevas ventas (sin facturar) SÍ aparecen
- ✅ La persistencia funciona correctamente

---

## 📊 Test 13: Resumen de Totales

**Pasos:**
1. Crea una factura con 3 ventas:
   - Venta 1: $100
   - Venta 2: $200
   - Venta 3: $150
2. Verifica que la factura creada muestre:
   - Subtotal: $450
   - Total: $450

**Resultado Esperado:**
- ✅ El total es la suma correcta de todas las ventas

---

## 🐛 Test 14: Casos de Error (Opcional)

### Error 1: Sin perfil de empresa
**Acción:** Si aún no completaste Perfil de Empresa
**Esperado:** Alerta roja pidiendo completar perfil

### Error 2: Cliente sin email
**Acción:** Selecciona cliente sin email
**Esperado:** Factura aún se crea (email será "")

### Error 3: Desconexi ón a BD
**Acción:** Desconecta internet y selecciona cliente
**Esperado:** Alerta de error de conexión

---

## ✅ Checklist de Validación Final

- [ ] Botón "📋 Desde Ventas" visible
- [ ] Modal se abre sin errores
- [ ] Dropdown de clientes carga correctamente
- [ ] Tabla de ventas se muestra al seleccionar cliente
- [ ] Checkboxes funcionan (individual y grupal)
- [ ] Botón de crear factura solo activo con ventas seleccionadas
- [ ] Factura se crea exitosamente
- [ ] Productos están en la factura
- [ ] Total es correcto
- [ ] PDF descarga sin errores
- [ ] Ventas se marcan como facturadas
- [ ] Datos persisten después de recargar
- [ ] Funciona con múltiples clientes

---

## 📝 Notas Importantes

⚠️ **Importante:** Antes de probar, asegúrate:
1. Base de datos actualizada con columnas:
   - `cliente_id` (BIGINT)
   - `productos_json` (JSONB)
   - `facturado` (BOOLEAN)
   - `cantidad_productos` (INT)

2. Las ventas tienen `productos_json` con este formato:
```javascript
[
  {
    nombre: "Laptop",
    cantidad: 1,
    precio_unitario: 500,
    subtotal: 500
  },
  {
    nombre: "Mouse",
    cantidad: 2,
    precio_unitario: 25,
    subtotal: 50
  }
]
```

---

## 🎯 Si Todo Funciona ✅

¡Excelente! La funcionalidad está lista para producción.

**Beneficios:**
- ⚡ Reduce tiempo de facturación en 50%+
- 📊 Agrupa ventas de diferentes días en 1 factura
- 🔒 Mantiene auditoria completa de qué ventas → qué factura
- ✅ Marca automáticamente como facturado

---

## 🆘 Si Algo No Funciona

### Paso 1: Revisar Consola
```javascript
// Abre F12 → Console
// Busca errores en ROJO
// Copia el error completo
```

### Paso 2: Verificar BD
```sql
-- En Supabase SQL Editor
SELECT * FROM ventas 
WHERE cliente_id = 10 
LIMIT 5;
```

### Paso 3: Descripción
Describe exactamente:
1. Qué pasos ejecutaste
2. Qué esperabas que pasara
3. Qué pasó realmente
4. Cualquier error en rojo en la consola
