# 🎨 GUÍA VISUAL PASO A PASO - FACTURAS COMPLETAS

## 🎬 VIDEO DE PASOS (Como si fuera un video tutorial)

---

## PASO 1️⃣: EJECUTAR SCRIPT SQL EN SUPABASE

### Pantalla 1: Dashboard de Supabase
```
https://supabase.com/dashboard
┌──────────────────────────────────────────────┐
│ 🏠 Supabase                                   │
│ Proyectos > [Tu Proyecto]                    │
└──────────────────────────────────────────────┘
     ↓
   Click en tu proyecto
```

### Pantalla 2: Menú izquierdo
```
┌─────────────────────────────┐
│ • SQL Editor          ◄──── CLICK AQUÍ
│ • Database
│ • Tables
│ • Auth
│ • Storage
│ • Realtime
└─────────────────────────────┘
```

### Pantalla 3: SQL Editor
```
┌─────────────────────────────────────────────┐
│ SQL Editor                                   │
├─────────────────────────────────────────────┤
│ [+ New Query] [Saved Queries]               │
├─────────────────────────────────────────────┤
│ -- Pega el contenido aquí ↓                 │
│ ALTER TABLE public.facturas                 │
│ ADD COLUMN IF NOT EXISTS cliente_id BIGINT, │
│ ...                                         │
│                                             │
│ [▶ RUN]  [Save]  [Cancel]                  │
└─────────────────────────────────────────────┘
     ↓
   Click ▶ RUN (botón verde)
```

### Pantalla 4: Resultado
```
┌──────────────────────────────┐
│ ✅ Success                    │
│ Query completed successfully  │
│ No results returned           │
└──────────────────────────────┘
```

---

## PASO 2️⃣: COMPLETAR PERFIL DE EMPRESA

### Pantalla 1: Aplicación Mantente abierta
```
http://localhost:5173
┌────────────────────────────────────────────┐
│ 🏠 MANTENTE                          ☰ Menu │
│                                             │
│ Dashboard / Facturas / Inventario...       │
└────────────────────────────────────────────┘
```

### Pantalla 2: Abrir menú
```
┌────────────────────────────────────────────┐
│ ☰ Menu      ◄──── CLICK AQUÍ               │
└────────────────────────────────────────────┘

Aparece:
┌────────────────────────────────────────────┐
│ ✕ Menú Principal                           │
├────────────────────────────────────────────┤
│ 🏠 Dashboard                               │
│ 📊 Ventas                                  │
│ 📦 Inventario                              │
│ 👥 Clientes                                │
│ 📋 Facturas                                │
│ ⚙️  Configuración      ◄──── CLICK AQUÍ    │
│ 📞 Soporte                                 │
│ 🚪 Cerrar Sesión                           │
└────────────────────────────────────────────┘
```

### Pantalla 3: Configuración
```
┌────────────────────────────────────────────┐
│ ⚙️  Configuración                           │
├────────────────────────────────────────────┤
│ 🏢 Perfil de Empresa  ◄──── CLICK AQUÍ     │
│ 👤 Mi Perfil                               │
│ 🔐 Cambiar Contraseña                      │
│ 📱 Mis Dispositivos                        │
│ 💳 Mi Suscripción Premium                  │
│ 📊 Reportes                                │
│ ⚡ Optimización                             │
└────────────────────────────────────────────┘
```

### Pantalla 4: Formulario Perfil Empresa
```
┌────────────────────────────────────────────┐
│ 🏢 Perfil de la Empresa                    │
├────────────────────────────────────────────┤
│ Nombre de Empresa *                        │
│ [Mi Empresa S.A.         ] ◄─ LLÉNA AQUÍ  │
│                                             │
│ Identificación Fiscal (RUC, NIT, etc.) *   │
│ [12345678-9              ] ◄─ LLÉNA AQUÍ  │
│                                             │
│ Email *                                    │
│ [contacto@miempresa.com  ] ◄─ LLÉNA AQUÍ  │
│                                             │
│ Teléfono *                                 │
│ [+593 1234567890         ] ◄─ LLÉNA AQUÍ  │
│                                             │
│ Dirección *                                │
│ [Calle Principal 123     ] ◄─ LLÉNA AQUÍ  │
│                                             │
│ URL del Logo (Opcional)                    │
│ [https://...             ]                 │
│                                             │
│ [💾 Guardar Perfil]                        │
└────────────────────────────────────────────┘
     ↓
   Click "Guardar Perfil"
```

### Pantalla 5: Confirmación
```
┌────────────────────────────────────────────┐
│ ✅ Perfil de empresa guardado exitosamente │
└────────────────────────────────────────────┘
```

---

## PASO 3️⃣: CREAR UNA FACTURA

### Pantalla 1: Ir a Facturas
```
┌────────────────────────────────────────────┐
│ ☰ Menu                                      │
│ 📋 Facturas  ◄──── CLICK AQUÍ              │
└────────────────────────────────────────────┘
```

### Pantalla 2: Tabla de Facturas
```
┌────────────────────────────────────────────┐
│ 📄 Generador de Facturas  [+ Nueva Factura]│
├────────────────────────────────────────────┤
│ Número  │ Cliente    │ Subtotal │ Total   │
├─────────┼────────────┼──────────┼─────────┤
│ FAC-001 │ Juan García│   500    │   450   │
└────────────────────────────────────────────┘
     ↓
   Click [+ Nueva Factura]
```

### Pantalla 3: Modal Nueva Factura
```
┌────────────────────────────────────────────┐
│ ✕ Crear Nueva Factura                      │
├────────────────────────────────────────────┤
│ Tipo de Factura *                          │
│ [Factura Fiscal ▼]                         │
│                                             │
│ Número de Factura                          │
│ [FAC-000001-XYZ] (Auto)                    │
│                                             │
│ Cliente *                                  │
│ [-- Selecciona un cliente ▼]               │
│   • Juan García (juan@....) ◄─ SELECCIONA │
│   • María López (maria@...)                │
│   • Carlos Pérez (carlos@...)              │
│                                             │
│ Venta (Opcional)                           │
│ [-- Sin venta asociada ▼]                  │
│                                             │
│ Método de Pago                             │
│ [Efectivo ▼]                               │
│                                             │
│ Subtotal *                                 │
│ [500.00] ◄─ INGRESA MONTO                  │
│                                             │
│ Descuento                                  │
│ [50.00]                                    │
│                                             │
│ Impuesto                                   │
│ [0.00]                                     │
│                                             │
│ Total                                      │
│ [450.00] (Auto)                            │
│                                             │
│ [Crear Factura]                            │
└────────────────────────────────────────────┘
```

### Pantalla 4: Llenar datos
```
✅ Tipo: Factura Fiscal (ya está)
✅ Número: FAC-000001-XYZ (ya está)
✅ Cliente: Juan García ◄─ ELIGE
✅ Venta: (Dejar en blanco está OK)
✅ Método: Efectivo (ya está)
✅ Subtotal: 500.00 ◄─ INGRESA
✅ Descuento: 50.00 ◄─ INGRESA
✅ Impuesto: 0.00 (OK)
✅ Total: 450.00 (se calcula solo)

   ↓
   Click [Crear Factura]
```

### Pantalla 5a: SI ALGO FALLA
```
┌────────────────────────────────────────────┐
│ ❌ DEBE COMPLETAR el Perfil de la Empresa  │
│    primero (nombre, RUC, email, teléfono,  │
│    dirección).                             │
│    Ir a Configuración > Perfil de Empresa. │
└────────────────────────────────────────────┘

SOLUCIÓN:
1. Cierra este modal
2. Va a ⚙️ > 🏢 Perfil de Empresa
3. Rellena TODOS los campos
4. Intenta crear factura de nuevo
```

### Pantalla 5b: SI SALE BIEN
```
┌────────────────────────────────────────────┐
│ ✅ Factura creada exitosamente             │
└────────────────────────────────────────────┘

Luego aparece en la tabla:

┌──────────────────────────────────────────────┐
│ 📄 Generador de Facturas                     │
├──────────────────────────────────────────────┤
│ Número    │ Cliente        │ Subtotal │ Total│
├───────────┼────────────────┼──────────┼──────┤
│ FAC-000001│ Juan García    │   500    │  450 │
│           │ juan@email.com │          │      │
├───────────┼────────────────┼──────────┼──────┤
│ FAC-001   │ Cliente anterior│  ...   │  ... │
└──────────────────────────────────────────────┘
     ↓
   Verifica que aparezca tu factura
```

---

## PASO 4️⃣: DESCARGAR PDF

### Pantalla 1: Tabla de Facturas
```
┌──────────────────────────────────────────────┐
│ FAC-000001│ Juan García    │ ... │ [🔄 Estado] │ [📥 PDF] │
│           │ juan@email.com │     │ [Button]    │ [Button] │
└──────────────────────────────────────────────┘
     ↓
   Click [📥 PDF]
```

### Pantalla 2: Generando
```
┌────────────────────────────────────────────┐
│ ℹ️  📄 Generando PDF...                     │
└────────────────────────────────────────────┘
```

### Pantalla 3: Descargado
```
┌────────────────────────────────────────────┐
│ ✅ PDF descargado exitosamente             │
└────────────────────────────────────────────┘

Tu navegador descarga: Factura_FAC-000001_2025-01-15.pdf
```

### Pantalla 4: PDF Generado
```
════════════════════════════════════════════════════
                    [LOGO]
                  FACTURA
                FAC-000001
          Fecha: 15 de Enero de 2025
════════════════════════════════════════════════════

📋 EMITIDO POR:              👤 CLIENTE:
Mi Empresa S.A.              Juan García
RUC: 12345678-9              Email: juan@email.com
Email: contacto@...          RUC: 98765432-1
Tel: +593 1234567890         Tel: +593 9876543210
Calle Principal 123, Quito   Av. Secundaria 456, GYE

════════════════════════════════════════════════════

Descripción                        Monto
─────────────────────────────────────────
Producto/Servicio                 $500.00

Subtotal:                         $500.00
Descuento:                       -$50.00
Impuesto:                         $0.00
════════════════════════════════════════════════════
TOTAL:                            $450.00

Método pago: Efectivo
Estado: Pendiente

════════════════════════════════════════════════════
```

---

## ✨ CHECKLIST DE ÉXITO

Debes ver TODAS estas cosas en tu PDF:

- [ ] **Logo de tu empresa** en la parte superior
- [ ] **Nombre de tu empresa** (lado izquierdo)
- [ ] **RUC de tu empresa**
- [ ] **Email y teléfono de tu empresa**
- [ ] **Dirección de tu empresa**
- [ ] **Nombre del cliente** (lado derecho)
- [ ] **Email del cliente**
- [ ] **RUC del cliente** (si tiene)
- [ ] **Monto detallado** con subtotal, descuento, total
- [ ] **Número de factura** y fecha
- [ ] **Método de pago** y estado

Si ves TODAS estas cosas: **¡Perfecto!** ✅

---

## 🆘 SOLUCIÓN DE PROBLEMAS

### Problema 1: "DEBE COMPLETAR el Perfil de la Empresa"
**Solución:**
1. Ve a ⚙️ Configuración
2. Click en 🏢 Perfil de Empresa
3. Rellena:
   - Nombre de Empresa
   - RUC/NIT
   - Email
   - Teléfono
   - Dirección
4. Click Guardar
5. Intenta crear factura de nuevo

### Problema 2: Factura creada pero no aparece en tabla
**Solución:**
1. Presiona F5 para recargar
2. Verifica que aparezca

### Problema 3: PDF no descarga
**Solución:**
1. Abre consola (F12)
2. Mira si hay errores rojos
3. Recarga página (F5)
4. Intenta de nuevo

### Problema 4: PDF descarga pero falta información
**Solución:**
1. Verifica que Perfil de Empresa esté completo
2. Verifica que el cliente tenga email
3. Recarga página
4. Crea nueva factura

---

## 📞 SI NADA FUNCIONA

1. Abre consola (F12)
2. Copia TODOS los errores rojos
3. Cuéntame exactamente qué pasos hiciste
4. Envíame el error

**¡Y listo!** Te ayudaré a resolver. 💪