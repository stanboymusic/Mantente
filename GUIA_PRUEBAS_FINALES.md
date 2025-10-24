# 🧪 GUÍA DE PRUEBAS FINALES - Mantente App

## ✅ Estado de las Correcciones

### Resumen de Cambios Realizados

1. **✅ Lógica de Deuda Acumulada (CORREGIDA)**
   - Dashboard.jsx: Balance = Ingresos - Egresos - Gastos Fijos - Deuda Acumulada
   - AppContext.jsx: Función `cerrarMes()` calcula correctamente la deuda
   - La deuda solo se refleja UNA vez en el balance final (no duplicada)

2. **✅ Formulario de Contacto (VERIFICADO)**
   - Contact.jsx: Todos los emails se envían a `mantenteapp@gmail.com`
   - EmailJS configurado correctamente
   - Mensajes incluyen: nombre, email del usuario, asunto, mensaje y reply_to

3. **✅ Generación de PDF de Facturas (CORREGIDA)**
   - GeneradorFacturas.jsx: Función `descargarPDF()` mejorada
   - Validaciones agregadas para captura de canvas
   - Plantilla profesional con toda la información
   - Manejo correcto de múltiples páginas
   - Nombres de archivo válidos

4. **✅ Build: EXITOSO**
   - npm run build completado sin errores
   - Todos los módulos transformados correctamente
   - Aplicación lista para producción

---

## 📋 PLAN DE PRUEBAS

### PRUEBA 1: Validar Acumulación de Deuda 💰

#### Objetivo
Verificar que la deuda se calcula y acumula correctamente sin duplicarse.

#### Pasos

1. **Acceder al Dashboard**
   - Ve a http://localhost:5173 (desarrollo) o tu URL de producción
   - Inicia sesión en tu cuenta

2. **Configura Gastos Fijos**
   - Click en el botón "Editar" en la sección de Gastos Fijos
   - Ingresa un monto: **$100** (como ejemplo)
   - Guarda los cambios
   - Verifica que se actualice en el Dashboard

3. **Primera Prueba: Ingresos < Gastos Fijos**
   - Crea una venta con monto: **$50**
   - Fecha: **Este mes**
   - Verifica en el Dashboard:
     - Ingresos: $50
     - Gastos Fijos: $100
     - **Deuda mostrada: $50** ← (diferencia)
     - **Balance Final = $50 - $100 = -$50** ← Negativo normal

4. **Segunda Prueba: Cierre de Mes**
   - Ve a la sección de "Cerrar Mes"
   - Haz click en "Cerrar mes actual" o "Cerrar [mes]"
   - Verifica que se cree un registro en "Historial de Meses"
   - El registro debe mostrar:
     - Deuda Anterior: $0 (primer mes)
     - Deuda Nueva: $50
     - Deuda Acumulada: $50

5. **Tercera Prueba: Recuperación de Deuda en Siguiente Mes**
   - Cambia la fecha de tu sistema AL SIGUIENTE MES (o espera a que llegue)
   - Crea una venta con monto: **$150**
   - Verifica en el Dashboard:
     - Ingresos: $150
     - Gastos Fijos: $100
     - **Deuda Anterior: $50** (del mes pasado)
     - **Deuda Nueva: $0** (porque $150 > $100)
     - **Deuda Acumulada: Debe bajar** ← Esto es lo importante

6. **Cierre del Segundo Mes**
   - Cierra el mes actual
   - Verifica en "Historial de Meses":
     - Deuda Anterior: $50
     - Deuda Nueva: $0 (recuperada)
     - Deuda Acumulada: $0 ← ¡La deuda fue eliminada!

**✓ Prueba exitosa si:**
- La deuda aparece UNA sola vez en el balance final (no duplicada)
- La deuda acumulada aumenta cuando hay gastos no cubiertos
- La deuda acumulada disminuye cuando hay ingresos excedentes
- El balance final refleja correctamente: Ingresos - Egresos - Gastos Fijos - Deuda

---

### PRUEBA 2: Validar Envío de Emails a Contacto 📧

#### Objetivo
Verificar que los mensajes del formulario de contacto lleguen a `mantenteapp@gmail.com`.

#### Pasos

1. **Acceder al Formulario de Contacto**
   - Ve a la sección "Contacto" en tu aplicación
   - O accede directamente si tienes una URL específica

2. **Enviar Mensaje de Prueba**
   - **Nombre:** "Test Usuario"
   - **Email:** Tu correo personal (ej: tu@gmail.com)
   - **Asunto:** "Mensaje de Prueba Automatizado"
   - **Mensaje:** "Este es un mensaje de prueba de la aplicación Mantente"
   - Haz click en "Enviar"

3. **Verificar Respuesta**
   - Deberías ver un mensaje: "✅ Mensaje enviado exitosamente"
   - Check la consola (F12 → Console) para ver logs de éxito
   - El mensaje desaparece después de 5 segundos

4. **Verificar en mantenteapp@gmail.com**
   - Abre tu correo en Gmail (o el cliente que uses)
   - Ve a la bandeja de "mantenteapp@gmail.com"
   - Deberías recibir un email con:
     - **Asunto:** "Mensaje de Prueba Automatizado"
     - **De:** "Test Usuario"
     - **Contenido:** El mensaje que escribiste
     - **Para responder:** Debe tener tu email (tu@gmail.com)

5. **Prueba de Respuesta**
   - Haz click en "Responder" en el email
   - El email debe ir a la dirección del usuario que envió el mensaje
   - Esto verifica que el `reply_to` está configurado correctamente

**✓ Prueba exitosa si:**
- El email llega a mantenteapp@gmail.com
- El email contiene toda la información del formulario
- El email tiene reply_to configurado al email del usuario
- Puedes responder directamente al usuario

---

### PRUEBA 3: Validar Generación de PDF de Facturas 📄

#### Objetivo
Verificar que el PDF se genera correctamente y tiene toda la información.

#### Pasos

1. **Acceder a Generador de Facturas**
   - Ve a la sección "Generador de Facturas"
   - Si aún no hay facturas creadas, crea una:
     - **Número:** 001
     - **Cliente:** (selecciona o crea uno)
     - **Subtotal:** $150.00
     - **Descuento:** $10.00 (opcional)
     - **Impuesto:** $5.00 (opcional)
     - **Método de Pago:** Efectivo/Tarjeta/Transferencia
     - Haz click en "Crear Factura"

2. **Ver Lista de Facturas**
   - Deberías ver la factura creada en la tabla
   - Debe mostrar:
     - Número de factura
     - Cliente
     - Total
     - Estado (Pendiente/Pagada)

3. **Descargar PDF**
   - Haz click en el botón "📥 Descargar PDF" en la fila de la factura
   - Deberías ver el mensaje: "📄 Generando PDF..."
   - Después de 2-3 segundos: "✅ PDF descargado exitosamente"
   - El archivo debería descargarse automáticamente

4. **Verificar Contenido del PDF**
   - Abre el archivo PDF descargado (ej: `Factura_001_2024-01-15.pdf`)
   - Verifica que contenga:
     - ✅ FACTURA como título
     - ✅ Número de factura
     - ✅ Fecha actual
     - ✅ Datos de tu empresa (DE:)
       - Nombre
       - Email
       - Teléfono
       - Dirección
     - ✅ Datos del cliente (PARA:)
       - Nombre
       - Email
       - Identificación
       - Teléfono
       - Dirección
     - ✅ Tabla de detalles con descripción y monto
     - ✅ Subtotal
     - ✅ Descuento (si aplica)
     - ✅ Impuesto (si aplica)
     - ✅ TOTAL destacado
     - ✅ Método de pago
     - ✅ Estado (Pendiente/Pagada)
     - ✅ "¡Gracias por su compra!"
     - ✅ Fecha de generación

5. **Prueba de Múltiples Páginas** (Opcional)
   - Si la factura tiene mucho contenido, verifica que se divida en múltiples páginas
   - Cada página debe tener el contenido bien formateado

6. **Cambiar Estado a Pagada**
   - En la tabla de facturas, haz click en "Cambiar Estado"
   - Selecciona "Pagada"
   - Ingresa la fecha de pago
   - Guarda
   - Descarga nuevamente el PDF
   - Verifica que muestre "Estado: PAGADA" en el PDF

**✓ Prueba exitosa si:**
- El PDF se descarga sin errores
- El PDF contiene toda la información de la factura
- Los datos se formatean correctamente
- El nombre del archivo es válido: `Factura_[numero]_[fecha].pdf`
- El estado se refleja correctamente en el PDF
- Las múltiples páginas se manejan correctamente (si aplica)

---

## 🔍 VERIFICACIÓN DE CÓDIGO

### Archivos Modificados
```
✅ src/components/Dashboard.jsx (línea 43)
   - Balance = Ingresos - Egresos - Gastos Fijos - Deuda Acumulada

✅ src/context/AppContext.jsx (líneas 659-717)
   - Función cerrarMes() con lógica correcta de deuda
   - Función obtenerDeudaAcumulada()
   - Función calcularDeudaPendiente()

✅ src/components/Contact.jsx (línea 41)
   - to_email: "mantenteapp@gmail.com"

✅ src/components/GeneradorFacturas.jsx
   - Función descargarPDF() (líneas 116-214)
   - Plantilla FacturaTemplate (líneas 530-686)
```

---

## 🚀 PRÓXIMOS PASOS

### Para ejecutar en desarrollo
```bash
cd c:\Users\angel\OneDrive\Documents\proyecto mantente\mantente-app
npm run dev
```

### Para producción
```bash
cd c:\Users\angel\OneDrive\Documents\proyecto mantente\mantente-app
npm run build
# Luego desplegar la carpeta 'dist'
```

---

## ⚠️ PUNTOS CLAVE A RECORDAR

1. **Deuda Acumulada:**
   - Nace cuando Gastos Fijos > Ingresos
   - Se suma al balance final (una sola vez)
   - Se recupera cuando hay ingresos excedentes
   - Persiste entre meses hasta ser recuperada

2. **Formulario de Contacto:**
   - Requiere EmailJS configurado
   - Public Key: `1Fs2UrN3YMN0e8yNc` (ya está en el código)
   - Service ID: `service_mantente`
   - Template ID: `template_mantente`
   - Todos los correos van a: `mantenteapp@gmail.com`

3. **PDF de Facturas:**
   - Se genera usando html2canvas + jsPDF
   - El elemento se oculta (display: none) durante la captura
   - Se valida que el canvas sea válido antes de crear el PDF
   - Maneja múltiples páginas automáticamente

---

## 📞 SOLUCIÓN DE PROBLEMAS

| Problema | Solución |
|----------|----------|
| El PDF no se descarga | Verifica la consola (F12) para ver el error exacto |
| La deuda aparece duplicada | Limpia el cache del navegador (Ctrl+Shift+Del) |
| Los emails no llegan | Verifica la carpeta de spam en Gmail |
| Build falla | Ejecuta `npm install` nuevamente |
| El formulario no envía | Verifica que EmailJS esté inicializado en Contact.jsx |

---

## ✅ CHECKLIST FINAL

- [ ] Build ejecutado correctamente con `npm run build`
- [ ] El Balance se calcula sin duplicar deuda
- [ ] Prueba 1: Deuda se acumula correctamente
- [ ] Prueba 2: Emails llegan a mantenteapp@gmail.com
- [ ] Prueba 3: PDF se genera con toda la información
- [ ] Todas las pruebas pasadas

**¡Cuando todas las pruebas pasen, el proyecto está listo para usar! 🎉**

---

**Última actualización:** 2024
**Versión:** 1.0 - Correcciones Finales