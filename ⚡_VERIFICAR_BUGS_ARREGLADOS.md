# ⚡ VERIFICAR LOS 3 BUGS ARREGLADOS - Paso a Paso

**⏱️ Tiempo total**: 5-10 minutos  
**🎯 Objetivo**: Confirmar que cada bug está realmente arreglado

---

## 🚀 PASO 0: Inicia la App

```powershell
Set-Location "c:\Users\angel\OneDrive\Documents\proyecto mantente\mantente-app"
npm run dev
```

Espera a ver:
```
Local:   http://localhost:5173
```

Abre en el navegador → `http://localhost:5173`

---

## ✅ BUG 1: Error "Completa el perfil de empresa"

### Preparación
1. **Abre DevTools**: Presiona `F12`
2. **Ve a la pestaña**: Console
3. **Limpia los logs**: `Ctrl+Shift+K`

### Paso 1: Verifica tu Perfil de Empresa
1. **Click en**: ⚙️ **Perfil de Empresa** (esquina arriba)
2. **Verifica que estén completos**:
   - ✅ Nombre: `[Tu empresa]`
   - ✅ Razón Social: `[RUC o razón]`
   - ✅ Email: `[email@empresa.com]`
3. **Si faltan campos**: Completa ahora → Click **Guardar**

### Paso 2: Crea una Venta con Auto-Factura
1. **Click en**: 📊 **Ventas**
2. **Selecciona un cliente** en el dropdown
3. **Agrega un producto**:
   - Nombre: `Ejemplo`
   - Cantidad: `1`
   - Precio: `100`
   - Click: **Agregar Producto**
4. **Activa**: ☑️ **Auto-facturar**
5. **Click**: **Registrar Venta**

### Resultado Esperado ✅
- ✅ La venta se registra SIN error
- ✅ Se crea la factura automáticamente
- ✅ Ves el log en Console:
  ```
  ✅ Venta registrada correctamente
  ✅ Factura generada: FAC-xxxxx
  ```

### Resultado Si Falla ❌
- ❌ Si ves: `❌ Debes seleccionar un cliente`
  - **Solución**: Recarga la página (F5) e intenta de nuevo
  
- ❌ Si ves: `❌ Para crear factura automática, completa estos campos: [lista]`
  - **Solución**: Ve a Perfil de Empresa y completa esos campos

---

## ✅ BUG 2: "No hay ventas asociadas al cliente"

### Preparación
1. **Limpiar Console**: `Ctrl+Shift+K`
2. **Necesitas al menos 3 ventas para un cliente**
   - Si NO las tienes, crea 3 ventas ahora (sin auto-factura)

### Paso 1: Crea 3 Ventas (si no las tienes)
1. **Click en**: 📊 **Ventas**
2. **Crea 3 ventas para el MISMO cliente**:
   - Cliente: `Juan` (o el que prefieras)
   - Producto 1: `Producto A` - Cantidad 2
   - Producto 2: `Producto B` - Cantidad 1
   - **Sin activar**: Auto-facturar
   - Click: **Registrar Venta**
3. **Repite 2 veces más** para el mismo cliente

### Paso 2: Ve al Generador de Facturas
1. **Click en**: 📋 **Facturas** → **Generar Facturas**
2. **En "Cliente", selecciona**: `Juan` (el cliente de las 3 ventas)

### Resultado Esperado ✅
- ✅ Aparecen las 3 ventas en la tabla
- ✅ Mensaje de alerta: `📦 3 venta(s) sin facturar encontrada(s)`
- ✅ En Console ves el log:
  ```
  🔍 Buscando ventas sin facturar para cliente 123...
  📊 Total de ventas del usuario: 5, 
     conClienteId: 3, 
     sinFacturar: 3, 
     conClienteIdYSinFacturar: 3
  ✅ Ventas sin facturar encontradas para cliente 123: 3
  ```

### Resultado Si Falla ❌
- ❌ Si ves: `⚠️ No se pudieron cargar las ventas`
  - **Abre Console** y busca el log `📊 Total de ventas`
  - **Si dice** `conClienteId: 0`:
    - ❌ Las ventas se crearon sin cliente_id correcto
    - ✅ Solución: Crear nuevas ventas (este bug está arreglado)
  - **Si dice** `conClienteIdYSinFacturar: 0`:
    - ❌ Las ventas podrían estar ya facturadas
    - ✅ Solución: Verifica la columna "Facturado" en Ventas

---

## ✅ BUG 3: Downgrade Involuntario Premium → Free

### Preparación
1. **Verifica que estés en modo Premium**:
   - Busca botón o indicador "Premium" ✅
   - Si NO ves Premium: Compra primero (o usa modo demo si aplica)
2. **Abre DevTools**: F12 → Console

### Paso 1: Simula Pérdida de Conexión
1. **Click en DevTools** → Pestaña **Network**
2. **En la esquina superior izquierda**, busca "Throttling"
3. **Cambiar de**: "No throttling" → **"Offline"**

### Paso 2: Intenta Una Acción
1. **Click en**: 📊 **Ventas**
2. **Click en**: ☑️ **Auto-facturar**
3. **Click en**: **Registrar Venta**
4. **Resultado esperado**: Error "Sin conexión" ✅

### Paso 3: Verifica que Premium Se Mantiene
1. **Console debería mostrar**:
   ```
   🛡️ Error de conexión detectado. Manteniendo Premium: true
   ```
2. **Vuelve a Offline mode** → cambia a **"No throttling"**
3. **Espera 2 segundos** a reconectar

### Resultado Esperado ✅
- ✅ Mientras estabas offline, no te downgradeó a Free
- ✅ Los botones siguen funcionando (aunque muestren error)
- ✅ Ves el log de protección: `🛡️ Error de conexión detectado`
- ✅ Al reconectar, todo vuelve a funcionar

### Resultado Si Falla ❌
- ❌ Si se downgradeó a Free (botones no funcionan):
  - En Console busca: `ℹ️ Usuario no tiene suscripción premium`
  - Significa: Tu suscripción realmente expiró
  - ✅ Compra Premium de nuevo

- ❌ Si NO ves el log `🛡️ Error de conexión`:
  - Significa: Los errores se están ignorando
  - Recarga la página (F5) e intenta de nuevo

---

## 🎯 Resumen Final

| Bug | Paso | Resultado |
|-----|------|-----------|
| 1️⃣ | Perfil + Auto-facturar | ✅ Se crea factura sin error |
| 2️⃣ | Seleccionar cliente en Facturas | ✅ Aparecen 3 ventas |
| 3️⃣ | Simular offline mode | ✅ Se mantiene Premium, sin downgrade |

---

## 📞 ¿Qué hago si falla algo?

### Falla Bug 1: Sigue diciendo "Completa perfil"
1. Ve a **Perfil de Empresa**
2. Verifica TODOS los campos (Nombre, Razón Social, Email)
3. Si falta algo: Completa y guarda
4. Intenta crear venta de nuevo

### Falla Bug 2: Sigue diciendo "No hay ventas"
1. Abre Console (F12)
2. Busca el log `📊 Total de ventas`
3. Si dice `conClienteId: 0`: Hay tipo de dato incorrecto
   - Crea NUEVAS ventas (las antiguas se guardaron mal)
4. Si dice `conClienteId: 3` pero la lista está vacía:
   - Recarga la página (F5)
   - Selecciona el cliente de nuevo

### Falla Bug 3: Se sigue downgradeando
1. En modo offline, verifica que Premium esté activo
2. Si se downgradeó:
   - Verifica que tu suscripción PayPal esté activa
   - Si está vencida: Compra Premium de nuevo
3. Si NO se downgradeó: ✅ El bug está arreglado

---

**✨ ¡Éxito! Si los 3 tests pasan, los bugs están completamente arreglados.**

Guarda este documento para futuras referencias.