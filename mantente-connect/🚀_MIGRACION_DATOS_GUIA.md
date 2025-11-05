# 🚀 GUÍA DE MIGRACIÓN AUTOMÁTICA DE DATOS

## 📋 Resumen

Has creado una **nueva aplicación (Mantente Connect)** que usa una base de datos diferente (**Supabase**) de la aplicación original (**Mantente con Firestore**).

Aunque ambas usan el **mismo login** (Firebase), guardan datos en lugares diferentes:

```
┌─────────────────────────────────────────┐
│    TÚ (adrcproducciones@gmail.com)      │
├─────────────────────────────────────────┤
│                 Login                   │
└──────┬──────────────────────┬───────────┘
       │                      │
   Mantente             Mantente Connect
  (Firestore)            (Supabase)
  Productos ✅          Productos ❌ (vacío)
  Clientes ✅           Clientes ❌ (vacío)
  Ventas ✅             Ventas ❌ (vacío)
```

## ✅ SOLUCIÓN: Migración Automática

Hemos creado un **servicio de migración** que:
1. Lee todos tus datos de **Mantente** (Supabase antiguo)
2. Los transforma al nuevo formato
3. Los guarda en **Mantente Connect** (Supabase nuevo)

---

## 🚀 ¿CÓMO EJECUTAR LA MIGRACIÓN?

### Paso 1: Abre la app en el navegador
```
http://localhost:3000
```

### Paso 2: Inicia sesión
- Email: `adrcproducciones@gmail.com`
- Contraseña: Tu contraseña

### Paso 3: Accede a la página de migración
Navega a:
```
http://localhost:3000/migrate
```

O haz clic en el link que aparece en la app.

### Paso 4: Haz clic en "🚀 Iniciar Migración"

La migración hará esto:

1. **📦 Migra productos**
   - De tabla: `inventario` 
   - A tabla: `products`
   - Trasforma campos: `nombre` → `name`, `cantidad` → `quantity`, etc.

2. **👥 Migra clientes**
   - De tabla: `clientes`
   - A tabla: `customers`
   - Trasforma campos: `nombre` → `name`, `telefono` → `phone`, etc.

3. **🛒 Migra ventas**
   - De tabla: `ventas`
   - A tabla: `orders`
   - Trasforma campos: `cliente_id` → `customer_id`, `fecha` → `date`, etc.

### Paso 5: Espera a que termine ⏳

Verás en pantalla:
```
🚀 INICIANDO MIGRACIÓN DE DATOS
👤 Usuario: adrcproducciones@gmail.com
🔑 ID: xxxxxxxxxxxxxxxxxxxxx

📦 Migrando productos...
  ✅ Producto migrado: Laptop
  ✅ Producto migrado: Mouse
✅ Productos: 2/2 completados

👥 Migrando clientes...
  ✅ Cliente migrado: Juan Pérez
✅ Clientes: 1/1 completados

🛒 Migrando ventas como órdenes...
  ✅ Venta migrada: Venta #1
✅ Ventas: 1/1 completados

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ MIGRACIÓN COMPLETADA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📦 Productos: X / X
👥 Clientes: X / X
🛒 Ventas: X / X
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Paso 6: Verifica los datos

Después de migrar, ve al **Dashboard** y deberías ver:
- ✅ Número de productos actualizado
- ✅ Número de clientes actualizado
- ✅ Número de ventas actualizado

---

## 🔍 ¿QUÉ PASÓ CON MIS DATOS ORIGINALES?

**No te preocupes**, tus datos originales en **Mantente** se mantienen intactos:

| Concepto | Mantente (Original) | Mantente Connect (Nueva) |
|----------|---|---|
| Datos | ✅ Se quedan igual | ✅ Se copian aquí |
| Seguridad | ✅ Protegidos | ✅ Protegidos |
| Sincronización | ⏳ Fase 2 | ⏳ Fase 2 |

---

## ⚙️ DETALLES TÉCNICOS

### Campos transformados

#### Productos
```javascript
// De (Mantente):
{
  id: 1,
  nombre: "Laptop",
  descripcion: "HP 15",
  precio: 500,
  cantidad: 3,
  categoria: "Electrónica"
}

// A (Mantente Connect):
{
  id: 1,
  user_id: "user_123",
  name: "Laptop",
  description: "HP 15",
  price: 500,
  quantity: 3,
  category: "Electrónica"
}
```

#### Clientes
```javascript
// De (Mantente):
{
  id: 1,
  nombre: "Juan Pérez",
  email: "juan@example.com",
  telefono: "3001234567",
  direccion: "Calle 5"
}

// A (Mantente Connect):
{
  id: 1,
  user_id: "user_123",
  name: "Juan Pérez",
  email: "juan@example.com",
  phone: "3001234567",
  address: "Calle 5"
}
```

#### Ventas/Órdenes
```javascript
// De (Mantente):
{
  id: 1,
  cliente_id: 1,
  total: 1500,
  estado: "completada",
  fecha: "2024-10-20"
}

// A (Mantente Connect):
{
  id: 1,
  user_id: "user_123",
  customer_id: 1,
  total: 1500,
  status: "completed",
  date: "2024-10-20"
}
```

---

## ❌ ¿ALGO SALIÓ MAL?

### Error: "Usuario no autenticado"
✅ **Solución**: Asegúrate de que iniciaste sesión correctamente

### Error: "No hay datos para migrar"
✅ **Solución**: Probablemente no tienes productos/clientes/ventas en Mantente. Esto es normal en la primera ejecución

### Algunos datos no migraron
✅ **Solución**: Revisa la consola (F12) para ver los errores específicos

### Los datos siguen siendo 0 después de migrar
✅ **Solución**: 
1. Recarga la página (F5)
2. Espera 2-3 segundos
3. Verifica que estés online ✅

---

## 🔄 ¿PUEDO MIGRAR VARIAS VECES?

**SÍ**, la migración es **segura para repetir**:
- Si ejecutas la migración 2 veces, los datos no se duplicarán
- Los datos nuevos reemplazan a los antiguos (por ID)
- Es perfecta para sincronizar cambios

---

## 📊 PRÓXIMOS PASOS

Después de la migración:

### ✅ Fase 1 (Ahora)
- [x] Migrar datos de Mantente a Mantente Connect
- [x] Ver datos en el Dashboard

### ⏳ Fase 2 (Próximamente)
- [ ] Sincronización bidireccional automática
- [ ] Cuando cambies en Mantente, se actualiza en Mantente Connect (y vice versa)
- [ ] Conflicto de datos: qué hacer si cambias lo mismo en 2 apps

### ⏳ Fase 3 (Futuro)
- [ ] Consolidar en una sola app
- [ ] Descontinuar la app antigua (opcional)

---

## 💡 TIPS

1. **Antes de migrar**: Asegúrate de que tu conexión a internet sea estable ✅
2. **Migra solo si es necesario**: Los datos ya están seguros en ambas apps
3. **Usa DevTools (F12)**: Abre la consola para ver el progreso en detalle
4. **Sin conexión**: La migración requiere internet (Lee desde Supabase)

---

## 🆘 ¿NECESITAS AYUDA?

Si algo no funciona:

1. Abre DevTools: `F12`
2. Ve a la pestaña "Console"
3. Intenta migrar de nuevo
4. Copia los errores que veas
5. Comparte conmigo el error exacto

---

## ✨ ¿ESTÁ FUNCIONANDO?

Después de migrar, deberías ver:

```
Dashboard
│
├─ 📦 Productos: 5 (no 0) ✅
├─ 👥 Clientes: 3 (no 0) ✅
├─ 🛒 Órdenes: 2 (no 0) ✅
└─ 💾 Base datos local: Lista ✅
```

Si ves esto, **¡la migración funcionó correctamente!** 🎉

---

**Creado**: 2024
**Versión**: 1.0
**Estado**: ✅ Listo para usar