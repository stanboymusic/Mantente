# ⚡ INICIO RÁPIDO - Validar Correcciones

## 🚀 Paso 1: Iniciar Aplicación en Desarrollo

```bash
cd c:\Users\angel\OneDrive\Documents\proyecto mantente\mantente-app
npm run dev
```

**Espera el mensaje:**
```
  VITE v7.1.11  ready in XXX ms

  ➜  Local:   http://localhost:5173/
  ➜  press h to show help
```

**Abre en tu navegador:** http://localhost:5173/

---

## ✅ Test 1: Validar Deuda (2 minutos)

### Paso A: Configura Gastos Fijos
1. Ve al **Dashboard**
2. Busca la tarjeta "Gastos Fijos Mensuales"
3. Click en "Editar" 
4. Ingresa: **100**
5. Guarda
6. ✅ Debe actualizar instantáneamente

### Paso B: Crea una Venta Baja
1. Ve a **Ventas**
2. Click "Crear Nueva Venta"
3. Ingresa:
   - Producto: "Test"
   - Monto: **50**
   - Fecha: Hoy
4. Crea la venta

### Paso C: Verifica el Dashboard
```
Resultado esperado:

Ingresos Totales:      $50
Egresos Totales:       $0
Gastos Fijos:          $100
Deuda Acumulada:       $50  ← IMPORTANTE: Solo aparece UNA VEZ
────────────────────────────
Balance Final:         -$50

✅ Correcto si:
  • Deuda aparece en una sola línea
  • Balance = $50 - $100 = -$50
  • NO aparece balance duplicado
```

---

## ✅ Test 2: Validar Email (3 minutos)

### Paso A: Ve al Formulario de Contacto
1. Scroll down en la app o click en "Contacto"
2. Deberías ver el formulario

### Paso B: Llena el Formulario
```
Nombre:    Test User
Email:     tuEmail@gmail.com  ← Tu email real para recibir respuesta
Asunto:    Test de Formulario
Mensaje:   Este es un mensaje de prueba
```

### Paso C: Envía
1. Click "Enviar"
2. Deberías ver: **✅ Mensaje enviado exitosamente**

### Paso D: Verifica Email
1. Abre Gmail (mantenteapp@gmail.com)
2. Busca el email con asunto: "Test de Formulario"
3. Verifica que tenga:
   - ✅ Asunto correcto
   - ✅ Tu nombre
   - ✅ Opción de responder al email que proporcionaste

---

## ✅ Test 3: Validar PDF (3 minutos)

### Paso A: Crea una Factura
1. Ve a **Generador de Facturas**
2. Click "Crear Nueva Factura"
3. Llena:
   - **Número:** 001
   - **Cliente:** (crea uno si no existe)
   - **Subtotal:** 150
   - **Descuento:** 10
   - **Impuesto:** 5
4. Click "Crear Factura"

### Paso B: Descargar PDF
1. En la tabla de facturas, busca tu factura
2. Click **"📥 Descargar PDF"**
3. Espera el mensaje: **📄 Generando PDF...**
4. Luego: **✅ PDF descargado exitosamente**
5. El archivo se descargará: `Factura_001_2024-XX-XX.pdf`

### Paso C: Abre y Valida
1. Abre el PDF descargado
2. Verifica que tenga:
   - ✅ Título "FACTURA"
   - ✅ Número de factura
   - ✅ Datos de tu empresa (DE:)
   - ✅ Datos del cliente (PARA:)
   - ✅ Monto: $150
   - ✅ Descuento: -$10
   - ✅ Impuesto: +$5
   - ✅ Total: $145
   - ✅ Fecha
   - ✅ Mensaje de agradecimiento

---

## 📊 Checklist Rápido

```
DEUDA:
  [ ] Deuda aparece en una sola línea
  [ ] Balance es correcto
  [ ] No hay valores duplicados

EMAIL:
  [ ] Formulario se envía sin errores
  [ ] Email llega a mantenteapp@gmail.com
  [ ] Puedo responder al usuario

PDF:
  [ ] PDF se descarga sin errores
  [ ] PDF tiene toda la información
  [ ] Nombre del archivo es válido
  [ ] PDF se abre correctamente
```

---

## 🔧 Si Algo Falla

### PDF no descarga
```
1. Abre la consola (F12 → Console)
2. Intenta descargar PDF nuevamente
3. Busca el error en la consola
4. Reporta el error exacto
```

### Email no se envía
```
1. Abre la consola (F12 → Console)
2. Busca logs de error
3. Verifica que todos los campos estén llenos
4. Intenta nuevamente
```

### Deuda aparece duplicada
```
1. Limpia cache: Ctrl + Shift + Delete
2. Recarga la página: F5
3. Vuelve a verificar el Dashboard
```

### Build falla
```
npm install
npm run dev
```

---

## 📁 Documentos de Referencia

Tenemos 4 documentos creados para ti:

1. **GUIA_PRUEBAS_FINALES.md**
   - Guía detallada de todas las pruebas
   - Paso a paso completo
   - Explicaciones de qué validar

2. **RESUMEN_TECNICO_CORRECCIONES.md**
   - Explicación técnica de cada cambio
   - Código antes y después
   - Ejemplos de flujo correcto

3. **CAMBIOS_VISUALES.md**
   - Visualización gráfica de cambios
   - Comparativas antes/después
   - Diagramas de flujo

4. **INICIO_RAPIDO.md** (este archivo)
   - Pruebas rápidas de 2-3 minutos cada una
   - Checklist rápido

---

## 🎯 Resumen de Correcciones

| Problema | Solución | Ubicación |
|----------|----------|-----------|
| Deuda duplicada | Fórmula única en Dashboard | Dashboard.jsx:43 |
| Deuda no acumula | Lógica de cerrarMes() mejorada | AppContext.jsx:659 |
| PDF no genera | Validaciones y visibilidad | GeneradorFacturas.jsx:116 |
| Emails no llegan | Verificado destino | Contact.jsx:41 |

---

## ✨ Próximo Paso

Después de validar todo, puedes hacer:

### Para producción:
```bash
npm run build
```

### Para desplegar (ejemplo con Vercel):
```bash
npm install -g vercel
vercel
```

---

**¡Listo! Empieza las pruebas ahora mismo. ⚡**

Todos los cambios están implementados y el build está exitoso ✅