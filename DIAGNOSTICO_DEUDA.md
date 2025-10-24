# 🔍 DIAGNÓSTICO: Deuda No Se Transfiere Entre Meses

## Problema Reportado
- ✗ Cerré un mes con deuda y la deuda NO se sumó en la siguiente apertura
- ✗ La "Deuda Anterior" aparece como $0 en el nuevo mes

## Pasos para Diagnosticar

### 1️⃣ Abre la Consola del Navegador
- Presiona `F12` en tu navegador
- Ve a la pestaña **Console**
- Busca mensajes con emojis 🔍 🔒 ⚠️ ✅

### 2️⃣ Cierra un Mes (si aún no lo has hecho)
En la sección "Cierre de Mes":
1. Selecciona un mes que tenga ventas
2. Haz click en "👁️ Ver Resumen" 
3. Verifica que haya "Deuda Anterior" y "Deuda Resultante"
4. Haz click en "🔒 Cerrar Mes"
5. Confirma

### 3️⃣ Revisa la Consola Después de Cerrar
Deberías ver mensajes como:
```
✅ Mes cerrado correctamente: {...}
📊 Resumen: Deuda anterior: $100.00, Deuda nueva: $50.00
```

### 4️⃣ Abre un Nuevo Mes
1. Ve a "Aperturar Mes"
2. Selecciona el mes siguiente
3. **IMPORTANTE**: Revisa en la consola los mensajes

#### Mensajes Esperados ✅:
```
🔍 Buscando deuda del mes anterior: 2024-11-01
✅ Mes anterior encontrado (2024-11-01): deuda_pendiente = $50.00
📋 Detalles del mes anterior: {mes: "2024-11-01", deuda_pendiente: 50.00, ...}
📊 Deuda anterior a transferir: $50.00
✅ Mes aperturado correctamente: {...}
📊 Deuda acumulada transferida: $50.00
```

#### Mensajes de Error ⚠️:
Si ves estos mensajes, el problema es:
```
⚠️ No se encontró registro para el mes 2024-11-01
```
Significa que **el mes anterior no existe en la BD**

### 5️⃣ Verifica en la Tabla de Historial
Después de abrir el nuevo mes:
1. Ve a la sección "Historial de Meses Cerrados"
2. Busca el mes que acabas de abrir
3. Verifica la columna "Deuda Anterior" 
   - ✅ Debe mostrar el valor del mes anterior
   - ✗ Si muestra $0, el problema está en la transferencia

## Información a Reportar

Copia esto desde la consola y comparte:

1. **Mes cerrado con deuda:**
   ```
   Mes: ________________
   Deuda anterior: $______
   Deuda resultante: $______
   ```

2. **Consola después de abrir nuevo mes:**
   ```
   [Copia aquí los mensajes de consola]
   ```

3. **Tabla de historial - Mes abierto:**
   ```
   Mes: ________________
   Deuda Anterior (mostrada): $______
   Deuda Pendiente (mostrada): $______
   ```

## Causas Posibles

### Causa 1: Mes anterior no existe en BD
**Síntoma:** Mensaje `⚠️ No se encontró registro para el mes`
**Solución:** El sistema buscará automáticamente el mes más reciente anterior

### Causa 2: Formato de fecha incorrecto
**Síntoma:** Meses en historial con formato diferente (ej: 2024-11 vs 2024-11-01)
**Solución:** Los logs mostrarán exactamente qué está buscando

### Causa 3: Datos no se refrescaron
**Síntoma:** Deuda aparece en tabla pero no en el campo de "Deuda Anterior"
**Solución:** Recarga la página (F5) y vuelve a abrir el mes

## Pruebas Realizadas ✅
- [x] Función `abrirMes()` con búsqueda mejorada
- [x] Búsqueda automática del mes más reciente si no existe exacto
- [x] Logs detallados en consola para debugging
- [x] Compilación sin errores
- [x] Mejoras en refresh de datos en AperturaMes.jsx

## Próximos Pasos
1. Compila y ejecuta la aplicación
2. Sigue los pasos 1-5 de diagnóstico
3. Si ves ✅ mensajes verdes: **¡El problema está resuelto!**
4. Si ves ⚠️ mensajes amarillos: Revisa la causa posible
