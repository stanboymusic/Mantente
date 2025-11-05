# ⚡ ORDENES - COMIENZA AQUÍ (2 minutos)

## 🎯 LO QUE PASÓ

Aplicamos el mismo fix que funcionó con productos y clientes **a las órdenes**.

Ahora:
- ✅ Las órdenes se sincronizan automáticamente
- ✅ Errores visibles en DevTools Console
- ✅ Aparecen en Mantente como "Ventas"

---

## 🚀 SOLO 3 PASOS (5 minutos)

### 1️⃣ SQL en Supabase (2 minutos)

1. Ve a https://app.supabase.com → Tu proyecto → **SQL Editor**
2. **Abre:** `SQL_VERIFICAR_RLS_ORDENES.sql`
3. **Copia TODO** el contenido
4. **Pégalo** en el editor
5. **Presiona ▶️** (verde arriba a la derecha)
6. ✅ **Listo!** (debería ejecutarse sin errores)

---

### 2️⃣ Reinicia app (30 segundos)

```bash
# En la terminal:
npm run dev
```

---

### 3️⃣ Prueba crear 1 orden

1. **Mantente Connect** → Órdenes → + Nueva
2. **Llena:** Cliente, Producto, Cantidad
3. **Guarda** ✅
4. **Abre F12** (DevTools Console)
5. **Busca:** ✅ ÉXITO o ❌ ERROR

---

## ✅ VERIFICACIÓN (espera 10 segundos)

- **¿Contador bajó a 0?** → 🟢 BIEN
- **¿Aparece en Mantente/Ventas?** → 🟢 BIEN
- **¿Persiste al F5?** → 🟢 BIEN

Si TODO es SÍ → 🎉 **¡FUNCIONA!**

---

## ❌ Si algo falla

**Abre DevTools (F12 → Console) y busca el error.**

**Errores comunes:**

```
❌ "PGRST116"
→ Ejecuta SQL nuevamente en Supabase
```

```
❌ "La orden NO tiene user_id"
→ Cierra sesión y vuelve a entrar en la app
```

```
❌ Tarda >30s en sincronizar
→ Recarga la página (F5)
```

---

## 📖 GUÍA COMPLETA

**Ver detalles:** `⚡_SINCRONIZACION_ORDENES_GUIA_COMPLETA.md`

---

**¿Listo?** 🚀 Comienza con el PASO 1!