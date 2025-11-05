# 🔍 Diagnóstico: Clientes No Aparecen en Mantente

## Problema Identificado
- ✅ Cliente se agrega en **Mantente Connect** 
- ✅ Sistema dice "sincronización completada"
- ❌ Cliente **NO aparece** en **Mantente** (app principal)
- ❌ Lo mismo ocurre con inventario

## Causas Posibles

### 1. **Error Silencioso 400 (MÁS PROBABLE)**
El cliente se sincroniza pero Supabase rechaza la solicitud sin mostrar error visible.

**Revisión:**
- Abre DevTools (`F12`) → Console
- Busca mensajes como: `⚠️ Error sincronizando item`
- Si ves un error 400, el problema es de estructura de datos

### 2. **Desajuste de Estructura de Datos**
Mantente Connect envía campos que no existen o con nombres diferentes a los de Mantente.

**Estructura esperada en tabla `customers` de Supabase:**
```json
{
  "id": "cust_TIMESTAMP",
  "user_id": "UUID_DEL_USUARIO",
  "name": "ADRC producciones",
  "email": "email@example.com",
  "phone": "teléfono",
  "city": "ciudad",
  "address": "dirección",
  "company": "nombre empresa",
  "ruc": "número_ruc",
  "created_at": "2024-...",
  "updated_at": "2024-..."
}
```

### 3. **Problemas de Autenticación/RLS**
Los datos se guardan pero con políticas de seguridad incorrectas.

---

## ⚡ Diagnóstico Rápido (5 minutos)

### Paso 1: Verifica la sincronización
En la consola del navegador (F12), ejecuta:
```javascript
// Ver cliente en sync_queue
const result = await debugTools.getSyncQueue()
console.log('Items pendientes:', result)
```

**Resultado esperado:**
```
Items pendientes: [
  {
    action: "CREATE",
    data: {
      type: "customer",
      data: {
        id: "cust_1730818700000",
        name: "ADRC producciones",
        user_id: "123e4567-e89b-12d3-a456-426614174000",
        ...
      }
    },
    timestamp: "2024-11-05T...",
    synced: false
  }
]
```

### Paso 2: Verifica los clientes locales
```javascript
const customers = await debugTools.getCustomers()
console.log('Clientes locales:', customers)
```

### Paso 3: Verifica si hay errores de sincronización
```javascript
// Abre DevTools → Application → IndexedDB → mantente-db → customers
// Revisa si ves el cliente ADRC producciones con synced: false
```

### Paso 4: Fuerza una sincronización
En Mantente Connect:
1. Abre DevTools → Network Tab
2. Busca `customers` en las solicitudes
3. Haz click para sincronizar manualmente
4. Revisa si hay error 400

---

## 🚨 Si hay error 400

**Posible razón: Campos incompletos o tipos de datos incorrectos**

Revisa en Supabase:
1. Ve a `customers` table
2. Revisa la estructura exacta de columnas
3. Compara con lo que Mantente Connect está enviando

**Solución:** Es probable que necesites ajustar el mapeo de campos en `supabaseService.js`

---

## 💡 Próximos Pasos

1. **Ejecuta Paso 1 del diagnóstico** y cuéntame qué ves
2. **Abre DevTools → Console** y copia cualquier error rojo
3. **Revisa Network** en momento de sincronización
4. **Comparte los errores exactos** que ves

Con esa información podré identificar exactamente qué está pasando.

---

## 📋 Checklist

- [ ] Abrí DevTools (F12)
- [ ] Ejecuté `debugTools.getSyncQueue()`
- [ ] Revisé si hay errores en Console
- [ ] Checkea Network tab durante sincronización
- [ ] Verificué que cliente está en `sync_queue`
- [ ] Veo error 400 (sí/no)
