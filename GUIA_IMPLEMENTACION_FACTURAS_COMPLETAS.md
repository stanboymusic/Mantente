# 🎯 GUÍA IMPLEMENTACIÓN: FACTURAS CON INFORMACIÓN COMPLETA

## Estado: 🔴 CRÍTICO - Debes completar esto para que funcione

He realizado cambios en tu aplicación para guardar **TODA la información** del cliente y empresa en cada factura. Pero hay **UN PASO OBLIGATORIO** que debes hacer manualmente en Supabase.

---

## ⚠️ PASO 1: ACTUALIZAR TABLA FACTURAS EN SUPABASE

### Lo que necesitas hacer:
Agregar nuevas columnas a la tabla `facturas` para guardar información completa.

### Instrucciones:

#### Opción A: Usando SQL (Recomendado - 30 segundos)
1. Abre https://supabase.com/dashboard
2. Selecciona tu proyecto
3. Ve a **SQL Editor** (izquierda)
4. Click **New Query**
5. Copia TODO el contenido del archivo: `ACTUALIZAR_TABLA_FACTURAS.sql`
6. Pega en el editor SQL
7. Click **▶ Run** (botón verde)
8. ✅ Espera el mensaje de éxito

#### Opción B: Usando interfaz gráfica (Manual)
1. Abre https://supabase.com/dashboard
2. Ve a **Tables → facturas**
3. Click **+ Add Column** para cada uno:
   - `cliente_id` (Type: BIGINT)
   - `cliente_email` (Type: TEXT)
   - `cliente_telefono` (Type: TEXT)
   - `cliente_ruc` (Type: TEXT)
   - `cliente_direccion` (Type: TEXT)
   - `empresa_nombre` (Type: TEXT)
   - `empresa_ruc` (Type: TEXT)
   - `empresa_email` (Type: TEXT)
   - `empresa_telefono` (Type: TEXT)
   - `empresa_direccion` (Type: TEXT)
   - `empresa_logo_url` (Type: TEXT)

---

## ✅ PASO 2: COMPLETAR PERFIL DE LA EMPRESA

**⚠️ ESTO ES OBLIGATORIO**. Sin esto, **NO podrás crear facturas**.

### En la aplicación:
1. Abre tu aplicación Mantente
2. Ve a **☰ Menú (esquina superior)** → **Configuración** → **Perfil de Empresa**
3. Llena TODOS estos campos:
   - ✅ **Nombre de Empresa** (tu nombre comercial)
   - ✅ **RUC/NIT** (tu identificación fiscal)
   - ✅ **Email** (contacto de la empresa)
   - ✅ **Teléfono** (número de contacto)
   - ✅ **Dirección** (domicilio de la empresa)
   - 📸 **Logo** (opcional, URL de tu logo)
4. Click **💾 Guardar Perfil**
5. ✅ Verifica que se guardó correctamente

**IMPORTANTE**: Cada vez que crees una factura, esta información será registrada permanentemente en ella.

---

## 🧪 PASO 3: PROBAR LA NUEVA FUNCIONALIDAD

### Prueba crear una factura:

1. Abre la aplicación
2. Ve a **Facturas → + Nueva Factura**
3. Completa el formulario
4. Click **Crear Factura**

### Qué debería pasar:
✅ Si vees un **error rojo** diciendo "DEBE COMPLETAR el Perfil de la Empresa"
→ Significa que el perfil está incompleto. Vuelve al Paso 2.

✅ Si la factura se **crea exitosamente**
→ Felicidades! Ahora ve a la tabla y verás:
- **Nombre del cliente** (en grande)
- **Email del cliente** (debajo del nombre)

### Descargar PDF:
1. Click **📥 PDF** en la factura
2. Se descargará un PDF con:
   - ✅ **Logo de tu empresa** (si agregaste URL)
   - ✅ **Nombre y datos de tu empresa**
   - ✅ **Nombre y datos del cliente**
   - ✅ **Monto, descuentos, impuestos**

---

## 📊 CAMBIOS REALIZADOS EN EL CÓDIGO

### 1. AppContext.jsx (crearFactura)
```javascript
// Ahora guarda información completa:
- cliente_id: ID del cliente
- cliente: Nombre del cliente
- cliente_email, cliente_telefono, cliente_ruc, cliente_direccion
- empresa_nombre, empresa_ruc, empresa_email, empresa_telefono, empresa_direccion, empresa_logo_url
```

### 2. GeneradorFacturas.jsx
```javascript
// VALIDACIÓN: Verifica que perfil empresa esté completo
if (!perfilEmpresa?.nombre || !perfilEmpresa?.identificacion_fiscal || ...) {
  return error "DEBE COMPLETAR el Perfil de la Empresa"
}

// RECOPILACIÓN: Junta toda la información
const resultado = await crearFactura({
  cliente_id, cliente, cliente_email, cliente_telefono, cliente_ruc, cliente_direccion,
  empresa_nombre, empresa_ruc, empresa_email, empresa_telefono, empresa_direccion, empresa_logo_url,
  // ... resto de datos
})
```

### 3. FacturaTemplate (PDF)
```javascript
// Usa información guardada en la factura (no solo props)
const empresaInfo = {
  nombre: factura.empresa_nombre || perfilEmpresa?.nombre,
  ruc: factura.empresa_ruc || perfilEmpresa?.identificacion_fiscal,
  // ... resto
}
const clienteInfo = {
  nombre: factura.cliente,
  email: factura.cliente_email,
  // ... resto
}
// Muestra TODA la información en el PDF
```

---

## 🚨 POSIBLES ERRORES Y SOLUCIONES

### Error: "DEBE COMPLETAR el Perfil de la Empresa"
**Solución:** Completa todos los campos requeridos en **Configuración → Perfil de Empresa**

### Error: "Debes seleccionar un cliente"
**Solución:** Selecciona un cliente válido en el dropdown

### Factura creada pero falta información en la tabla
**Solución:** 
- Recarga la página (F5)
- Verifica que ejecutaste el script SQL para agregar columnas

### PDF no descarga
**Solución:**
- Abre consola (F12) y mira los errores
- Verifica que el campo email no esté vacío
- Intenta en otro navegador

---

## ✨ RESULTADO FINAL

Cuando todo esté configurado:

**Tabla de Facturas:**
```
Número    | Cliente          | Subtotal | Descuento | Impuesto | Total
FAC-000001| Juan García      |    500   |    50     |    0     |  450
          | juan@email.com   |
FAC-000002| María López      |    750   |     0     |    75    |  825
          | maria@empresa.com|
```

**PDF Descargado:**
```
═════════════════════════════════════════════════════════════
                     [LOGO DE TU EMPRESA]
                          FACTURA
                        FAC-000001

📋 EMITIDO POR:                  👤 CLIENTE:
Mi Empresa S.A.                   Juan García
RUC: 12345678-9                   Email: juan@email.com
Email: contacto@miempresa.com      RUC: 98765432-1
Tel: +5931234567890               Tel: +5939876543210
Calle Principal 123, Quito        Av. Secundaria 456, Guayaquil

═════════════════════════════════════════════════════════════
Descripción          Monto
─────────────────────────────
Producto/Servicio    $500.00

Subtotal:            $500.00
Descuento:          -$50.00
Impuesto:            +$0.00
═════════════════════════════════════════════════════════════
TOTAL:              $450.00

Método pago: Efectivo
Estado: Pendiente
═════════════════════════════════════════════════════════════
```

---

## 📞 ¿Dudas?

Si algo no funciona:
1. Verifica que ejecutaste el script SQL
2. Verifica que completaste TODOS los campos del Perfil de Empresa
3. Abre consola (F12) y copia cualquier error rojo
4. Recarga la página (F5)
5. Intenta nuevamente

---

## 🚀 Procede con:

```powershell
# En tu terminal
Set-Location "c:\Users\angel\OneDrive\Documents\proyecto mantente\mantente-app"
npm run dev
```

Luego sigue esta guía paso a paso. ✅