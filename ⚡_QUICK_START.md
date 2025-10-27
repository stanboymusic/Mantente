# ⚡ QUICK START - Haz Esto AHORA

**3 pasos para ver que todo funciona:**

---

## 1️⃣ Inicia la App (30 segundos)

Abre PowerShell y copia/pega:

```powershell
Set-Location "c:\Users\angel\OneDrive\Documents\proyecto mantente\mantente-app"; npm run dev
```

Espera a ver:
```
Local:   http://localhost:5173
```

Abre esa URL en tu navegador. ✅

---

## 2️⃣ Prueba Facturas (1 minuto)

```
1. Haz clic en FACTURAS (menú izquierdo)
2. Clic en ➕ NUEVA FACTURA
3. Selecciona un cliente (si no hay, crea uno en CLIENTES)
4. Monto: 100
5. Clic en CREAR FACTURA
```

**Resultado esperado:**
```
✅ Factura creada exitosamente
(NO debe decir "null value in column cliente")
```

---

## 3️⃣ Prueba Descuentos (1 minuto)

```
1. Haz clic en VENTAS
2. Clic en ➕ NUEVA VENTA
3. Selecciona producto, cantidad 1, precio 100
4. Cliente: "Test"
5. Descuento: 20
6. Clic en REGISTRAR VENTA
```

**Resultado esperado:**
```
En la venta:
├─ Monto: $100
├─ Descuento: $20 ✅ (en USD, no 20%)
└─ Total: $80
```

---

## 4️⃣ Prueba Persistencia (1 minuto)

```
1. Ve a NOTAS DE ENTREGA
2. Clic en ➕ NUEVA NOTA
3. Cliente: "Test", completa los campos
4. Clic en CREAR NOTA
```

**Ahora presiona F5 (recargar página)**

**Resultado esperado:**
```
✅ La nota SIGUE AQUÍ (NO desapareció)
```

---

## ✅ Si Todo Funciona

🎉 **¡Los 4 problemas están resueltos!**

- ✅ Facturas se crean
- ✅ Descuentos en USD
- ✅ Datos persisten
- ✅ Deuda se transfiere (verificado)

---

## ❌ Si Algo Falla

1. **Recarga la página (F5)**
2. **Intenta de nuevo**
3. **Si persiste, abre consola (F12) y busca errores en rojo**

---

## 📚 Documentos Completos

- 📖 `INSTRUCCIONES_FINALES.md` - Detalles completos
- 📊 `RESUMEN_EJECUTIVO_FINAL.md` - Resumen técnico
- 🔍 `CAMBIOS_EXACTOS_REALIZADOS.md` - Qué cambió
- 🧪 `GUIA_PRUEBAS_CORRECCIONES.md` - Tests detallados

---

**¡Eso es todo! Prueba ahora.** 🚀