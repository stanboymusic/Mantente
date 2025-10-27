# ✅ VERIFICACIÓN PASO A PASO - Premium + Código de Ventas

## 🎯 OBJETIVO
Verificar que los 3 cambios funcionen correctamente:
1. Premium persiste y se actualiza en tiempo real
2. Funciones premium visibles en navbar expandida
3. Cada venta tiene código único

---

## 📝 ANTES DE EMPEZAR

```bash
# En la carpeta mantente-app/
npm run dev
```

Luego accede a: `http://localhost:5173`

---

## 🧪 PRUEBA 1: Premium Persiste y Actualiza en Tiempo Real

### Paso 1.1: Login y Verificar No-Premium
```
✓ Login con usuario existente
✓ Navbar debe mostrar:
  - Dashboard, Inventario, Ventas, Clientes, etc. (funciones básicas)
  - Icono "Premium" en naranja/rojo (botón para obtener)
  - NO deben aparecer: 💰 Presupuestos, 📦 Notas, etc.
```

### Paso 1.2: Verificar Console
Abre DevTools (F12) → Console:

```javascript
// Ejecutar en console:
console.log('isPremium:', isPremium);  // Debe ser false
```

**Resultado esperado:**
```
isPremium: false
```

### Paso 1.3: Comprar Premium (Simulado)
```
✓ Click en "Premium" en navbar
✓ Se abre formulario de pago
✓ Click en "Comprar Premium" o "Suscribirse"
✓ Simular pago en PayPal (test mode)
✓ Esperar respuesta
```

### Paso 1.4: Verificar Navbar Se Actualiza EN VIVO
```
⏱️ Esperar máx 2 segundos

✓ Navbar debe mostrar NUEVOS iconos:
  - 💰 Presupuestos
  - 📦 Notas
  - ↩️ Devoluciones
  - 📊 Libro
  - 📋 Pedidos
  - 🔧 Órdenes
  
✓ Iconos deben tener animación de brillo dorado
✓ Icono de "Premium" en navbar cambió
```

### Paso 1.5: Verificar Console Actualiza
```javascript
// En console:
console.log('isPremium:', isPremium);  // Debe ser true ahora
```

**Resultado esperado:**
```
isPremium: true
🔄 Iniciando listener de premium para usuario: user-12345
📢 Cambio en premium detectado: {event: 'INSERT', ...}
```

### Paso 1.6: Refrescar Página
```
F5 o Ctrl+R para refrescar

✓ Premium debe PERSISTIR
✓ Los 6 iconos deben estar visibles
✓ No debe volver a mostrar botón "Premium"
```

### Paso 1.7: Verificar Cada Función Premium
```
✓ Click en 💰 Presupuestos → Debe cargar componente
✓ Click en 📦 Notas → Debe cargar componente
✓ Click en ↩️ Devoluciones → Debe cargar componente
✓ Click en 📊 Libro → Debe cargar componente
✓ Click en 📋 Pedidos → Debe cargar componente
✓ Click en 🔧 Órdenes → Debe cargar componente
```

---

## 🔖 PRUEBA 2: Código Único para Ventas

### Paso 2.1: Crear Primera Venta
```
✓ Click en "Ventas" en navbar
✓ Llenar formulario:
  - Producto: "Laptop"
  - Cantidad: 1
  - Precio unitario: 1200
  - Cliente: "Juan"
  - Descuento: 0
✓ Click "Registrar Venta"
```

### Paso 2.2: Verificar Código Único en Console
```javascript
// En console, después de registrar venta:
console.log('Última venta:', ventas[0]);
```

**Resultado esperado:**
```
Última venta: {
  id: 123,
  producto: "Laptop",
  monto: 1200,
  codigo_venta: "VTA-2024-00001",  // ✅ CÓDIGO GENERADO
  fecha: "2024-01-15",
  cliente: "Juan",
  ...
}
```

### Paso 2.3: Crear Segunda Venta
```
✓ Registrar segunda venta diferente:
  - Producto: "Mouse"
  - Cantidad: 2
  - Precio unitario: 25
  - Total: 50
✓ Click "Registrar Venta"
```

### Paso 2.4: Verificar Código Incrementado
```javascript
// En console:
console.log('Última venta:', ventas[0]);
```

**Resultado esperado:**
```
Última venta: {
  producto: "Mouse",
  monto: 50,
  codigo_venta: "VTA-2024-00002",  // ✅ INCREMENTADO
  ...
}
```

### Paso 2.5: Registrar 3-4 Ventas Más
```
✓ Crear ventas hasta VTA-2024-00005 (al menos)
✓ Verificar que cada una tiene código diferente
```

### Paso 2.6: Refrescar Página
```
F5 para refrescar

✓ Ventas deben mantener sus códigos
✓ Consultar BD para verificar:
  SELECT codigo_venta FROM ventas 
  ORDER BY created_at DESC LIMIT 5;
```

**Resultado esperado:**
```
VTA-2024-00005
VTA-2024-00004
VTA-2024-00003
VTA-2024-00002
VTA-2024-00001
```

---

## 🎨 PRUEBA 3: UI Premium Expandida en Navbar

### Paso 3.1: Desktop (Pantalla Completa 1200px+)
```
✓ Abrir app en ventana completa
✓ Navbar debe mostrar TODOS los 6 iconos premium:
  💰 Presupuestos (texto visible)
  📦 Notas (texto visible)
  ↩️ Devoluciones (texto visible)
  📊 Libro (texto visible)
  📋 Pedidos (texto visible)
  🔧 Órdenes (texto visible)

✓ Hover sobre cada icono:
  - Debe cambiar color más dorado
  - Debe elevarse 2px
  - Debe mostrar tooltip
```

### Paso 3.2: Tablet (768px - 992px)
```
✓ Redimensionar a 900px ancho
✓ Navbar debe comprimirse pero mostrar iconos:
  💰 📦 ↩️ 📊 📋 🔧 (sin texto)
  
✓ Debe haber scroll horizontal si es necesario
✓ Hover debe funcionar igual
```

### Paso 3.3: Mobile (< 576px)
```
✓ Redimensionar a 375px ancho
✓ Navbar debe comprimirse:
  - Menú hamburguesa (≡)
  - Al expandir debe mostrar opciones
  
✓ Premium functions deben estar accesibles:
  - En el menú expandido
  - Con emojis y texto
```

### Paso 3.4: Animaciones
```
✓ Emojis deben tener animación de bounce
✓ Al pasar mouse, animación acelera
✓ Texto "shimmer" (brillo) debe estar visible
✓ No debe haber lag en animaciones
```

---

## 🔗 PRUEBA 4: Integración Premium + Ventas

### Paso 4.1: Crear Presupuesto (Premium)
```
✓ Navegar a 💰 Presupuestos
✓ Crear presupuesto nuevo
✓ Si es posible, debe permitir ref venta:
  - Buscar por VTA-2024-00001 (si existe search)
  - O autocompletar desde última venta
✓ Generar presupuesto
```

### Paso 4.2: Crear Devolución (Premium)
```
✓ Navegar a ↩️ Devoluciones
✓ Seleccionar una venta:
  - Debe poder buscar por VTA-2024-00002
  - O listar últimas ventas
✓ Especificar qué devuelve
✓ Verificar inventario se actualiza
```

### Paso 4.3: Consultar Libro de Ventas (Premium)
```
✓ Navegar a 📊 Libro de Ventas
✓ Debe mostrar todas las ventas:
  VTA-2024-00001 - Laptop - 1200
  VTA-2024-00002 - Mouse - 50
  ...
  
✓ Debe haber búsqueda por código:
  Buscar "VTA-2024-00001" → Debe encontrar

✓ Debe permitir filtrar por fecha
```

---

## 🐛 TROUBLESHOOTING

### ❌ Premium no aparece después de comprar

```javascript
// En console, verificar:
console.log('1. Usuario autenticado:', user?.id);
console.log('2. isPremium state:', isPremium);
console.log('3. Listener activo:', supabase.realtime.state);

// En BD, ejecutar:
SELECT * FROM premium_subscriptions 
WHERE user_id = 'user-id-aqui' 
ORDER BY created_at DESC LIMIT 1;
```

**Solución:**
- Verificar que purchasePremium() insertó datos
- Verificar checkPremiumStatus() se ejecuta
- Refreshar página manualmente (F5)

### ❌ Códigos duplicados o no se incrementan

```javascript
// En console:
const codigos = ventas.map(v => v.codigo_venta);
console.log('Códigos:', codigos);

// Verificar que sean únicos y secuenciales
```

**Solución:**
- Ejecutar `generarCodigoVenta()` manualmente
- Verificar que query obtiene último código
- Asegurar que los datos en BD están correctos

### ❌ Funciones premium no cargan

```javascript
// En console:
console.log('isPremium:', isPremium);
console.log('Route:', window.location.pathname);

// En DevTools → Network, buscar 404s
```

**Solución:**
- Verificar isPremium es true
- Verificar route existe en App.jsx
- Verificar componente Premium* existe

---

## 📊 CHECKLIST FINAL

- [ ] Premium persiste después de refresh
- [ ] Premium desaparece después de cancelación
- [ ] Funciones premium visibles en navbar
- [ ] 6 iconos premium tienen animaciones
- [ ] Cada venta tiene código único VTA-2024-XXXXX
- [ ] Códigos no se duplican
- [ ] Códigos se incrementan correctamente
- [ ] Funciones premium cargan sin errores
- [ ] Responsive funciona en desktop/tablet/mobile
- [ ] Console sin errores (excepto warnings normales)
- [ ] Build compila sin errores: `npm run build`

---

## 🚀 DEPLOYMENT

```bash
# 1. Verificar build sin errores
npm run build

# 2. Verificar en preview
npm run preview

# 3. Si todo OK, hacer push
git add .
git commit -m "feat: premium persistencia + iconos expandidos + código venta"
git push origin main

# 4. Deploy a producción
# (Según tu proceso: Netlify, Vercel, etc.)
```

---

✅ **VERIFICACIÓN COMPLETA LISTA**

Si todas las pruebas pasan → ¡La solución está 100% funcional!
