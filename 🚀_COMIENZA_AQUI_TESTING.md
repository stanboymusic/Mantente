# 🚀 Instrucciones de Testing - Nuevas Features

## ⚡ Quick Start

```powershell
# 1. Abre PowerShell y navega al proyecto
Set-Location "c:\Users\angel\OneDrive\Documents\proyecto mantente\mantente-app"

# 2. Inicia el servidor de desarrollo
npm run dev

# Espera el mensaje:
# ➜  Local:   http://localhost:5174/
```

---

## ✅ Tests a Realizar

### Test 1: Landing Page con Nuevo Navbar
**URL:** http://localhost:5174/

```
Checklist:
□ Navbar aparece en la parte superior
□ Logo "Mantente" es clickeable (vuelve a landing)
□ Link "Landing" funciona
□ Link "Características" hace scroll suave
□ Link "Precios" hace scroll suave (ve las tarjetas centradas ✨)
□ Link "Cómo Funciona" va a /first-steps
□ Botón "Iniciar Sesión" va a /login
□ Botón "Registrarse" va a /register
□ Navbar es sticky (se queda en top al scroll)
```

### Test 2: Login con Nuevo Navbar
**URL:** http://localhost:5174/login

```
Checklist:
□ Navbar aparece en la parte superior
□ Logo "Mantente" es clickeable (vuelve a landing)
□ Botones auth funcionan
□ Form de login funciona normalmente
□ Navbar es responsive en móvil
```

### Test 3: Register con Nuevo Navbar
**URL:** http://localhost:5174/register

```
Checklist:
□ Navbar aparece en la parte superior
□ Logo "Mantente" es clickeable (vuelve a landing)
□ Botones auth funcionan
□ Form de register funciona normalmente
□ Link "Inicia sesión" va a /login
```

### Test 4: FirstSteps Page (Nueva)
**URL:** http://localhost:5174/first-steps

```
Checklist:
□ Hero section se ve bien
□ 3 tabs son clickeables
□ Tab "Configuración Inicial":
  □ Muestra 7 pasos numerados
  □ Cada paso tiene descripción clara
  □ Highlights en amarillo son visibles
  □ Campos obligatorios están listados
  □ Botones CTA funcionan
□ Tab "Cómo Usar":
  □ Muestra 7 módulos de la app
  □ Explicación clara de cada uno
  □ Botón "Comenzar Ahora" funciona
□ Tab "Características":
  □ Comparativa Plan Gratis vs Premium
  □ FAQ con 6 preguntas
  □ Botones CTA funcionan
□ FAQ es visible y completa
□ Navbar funciona correctamente
```

### Test 5: Sección de Precios Centrada
**URL:** http://localhost:5174/ (scroll hasta precios)

```
Checklist:
□ Las tarjetas de precios están en el CENTRO (no en los costados)
□ Plan Premium tiene badge "MÁS POPULAR"
□ Plan Premium es ligeramente más grande
□ Ambas tarjetas están lado a lado (en desktop)
□ En móvil, se apilan verticalmente
□ Botones de CTA funcionan
```

### Test 6: Responsive - Móvil
**Instrucciones:**
1. Presiona F12 en el navegador
2. Clica en "Device Toolbar" (o Ctrl+Shift+M)
3. Selecciona "iPhone 12" o similar

```
Checklist:
□ Navbar muestra hamburguesa (≡)
□ Clicando hamburguesa se abre menú
□ Clicando un link, menú se cierra automáticamente
□ Logo de Mantente es visible
□ Botones de auth son accesibles
□ Landing Page:
  □ Contenido se ve correctamente
  □ Precios están centrados
  □ Botones son clickeables
□ FirstSteps:
  □ Tabs son clickeables
  □ Contenido es legible
  □ CTA buttons son accesibles
```

### Test 7: Responsive - Tablet
**Instrucciones:**
1. F12 → Device Toolbar
2. Selecciona "iPad Pro" o similar

```
Checklist:
□ Layout se ve bien
□ Navbar no rompe
□ Precios están centrados
□ Espaciado es correcto
□ Todo es clickeable
```

---

## 🎯 Tests de Navegación

### Flujo 1: Landing → FirstSteps → Register
```
1. Ve a http://localhost:5174/
2. Clica "Cómo Funciona" en navbar
3. Verifica que llegas a /first-steps
4. Lee el contenido
5. Clica "Crear Cuenta Ahora"
6. Verifica que llegas a /register
7. Clica logo en navbar
8. Verifica que vuelves a landing
```

### Flujo 2: Scroll Suave
```
1. Ve a http://localhost:5174/
2. Clica "Características" en navbar
3. Verifica scroll suave a features section
4. Sube a navbar
5. Clica "Precios"
6. Verifica scroll suave a pricing section
7. Verifica que precios están CENTRADOS ✨
```

### Flujo 3: Autenticación
```
1. Ve a http://localhost:5174/
2. Clica "Iniciar Sesión" en navbar
3. Verifica que llegas a /login
4. Clica "Crear cuenta" en el form
5. Verifica que cambias a modo registro
6. Clica navbar logo
7. Vuelve a landing
8. Clica "Registrarse"
9. Verifica que llegas a /register
```

---

## 🔍 Verificación Visual

### Navbar:
```
┌─ Elemento ──────────────── Color ────────────── Estado ┐
│ Logo                      Dorado claro         ✨      │
│ Links                     Gris claro          ✨      │
│ Link activo              Dorado               ✨      │
│ Botón Login              Border dorado        ✨      │
│ Botón Register           Fondo dorado         ✨      │
│ Fondo                    Gradiente marrón     ✨      │
└──────────────────────────────────────────────────────────┘
```

### Precios:
```
┌─ Elemento ──────────────── Posición ─────── Estado ┐
│ Plan Gratis              Centro-izquierda   ✨     │
│ Plan Premium             Centro-derecha     ✨     │
│ Badge "MÁS POPULAR"      Arriba plan premium ✨    │
│ Ambos centrados          En el medio        ✨     │
└───────────────────────────────────────────────────────┘
```

---

## 📊 Checklist Final

### ✅ Componentes Nuevos
- [ ] AuthNavbar.jsx existe
- [ ] FirstSteps.jsx existe
- [ ] AuthNavbar.css existe
- [ ] FirstSteps.css existe

### ✅ Archivos Modificados
- [ ] Landing.jsx importa AuthNavbar
- [ ] Login.jsx importa AuthNavbar
- [ ] Register.jsx importa AuthNavbar
- [ ] Landing.css tiene pricing centrado
- [ ] App.jsx importa FirstSteps
- [ ] App.jsx tiene ruta /first-steps

### ✅ Funcionalidad
- [ ] Landing page tiene navbar sticky
- [ ] Login page tiene navbar sticky
- [ ] Register page tiene navbar sticky
- [ ] FirstSteps es una página completa
- [ ] Todos los links funcionan
- [ ] Scroll suave en landing
- [ ] Precios están centrados
- [ ] Responsive en todos los dispositivos

### ✅ Identidad Visual
- [ ] Colores Mantente se mantienen
- [ ] Logo es visible
- [ ] Tipografía es consistente
- [ ] Buttons tienen hover effects
- [ ] Animaciones son suaves

---

## 🐛 Posibles Errores y Soluciones

### Error: "Cannot find module 'AuthNavbar'"
**Solución:** Verifica que `src/components/AuthNavbar.jsx` existe

### Error: "Port 5173 is in use"
**Solución:** Usa el puerto alternativo (5174, 5175, etc.) o cierra otra instancia

### Navbar no aparece en Landing
**Solución:** Verifica que `<AuthNavbar />` está en el return de Landing.jsx

### FirstSteps no carga
**Solución:** Verifica que FirstSteps.jsx está importado en App.jsx y la ruta existe

### CSS no se aplica
**Solución:** Verifica que AuthNavbar.css y FirstSteps.css están importados en App.jsx

### Precios no están centrados
**Solución:** Verifica que .pricing-grid tiene `max-width: 800px` y está centrado

---

## 📞 Comandos Útiles

```powershell
# Limpiar cache y reinstalar dependencias
npm cache clean --force
npm install

# Ejecutar dev con puerto específico
npm run dev -- --port 5175

# Detener el servidor (en PowerShell)
Ctrl + C

# Construir para producción
npm run build

# Ver errores en consola
# Presiona F12 → Console
```

---

## 🎬 Grabación Mental - Qué Debería Ver

**Landing Page:**
- Navbar profesional con logo Mantente
- Navegación clara (Landing, Características, Precios, Cómo Funciona)
- Botones auth prominentes
- Sección de precios **CENTRADA** (no a los costados)
- Scroll suave al hacer clic en links

**FirstSteps:**
- Hero section profesional
- 3 tabs: Configuración, Uso, Características
- Instrucciones paso a paso con énfasis en **Perfil de Empresa**
- FAQ visible
- Botones CTA

**Navbar Móvil:**
- Hamburguesa visible
- Menú desplegable funcional
- Botones accesibles

---

## ✨ Resumen de Cambios Principales

1. **AuthNavbar** - Nuevo navbar en todas las auth pages
2. **FirstSteps** - Nueva página educativa (3 tabs + FAQ)
3. **Precios Centrados** - Sección de precios ahora está en el centro
4. **Landing con Navbar** - Landing page ahora tiene navbar sticky
5. **Identidad Visual** - Todo mantiene colores Mantente (dorado/marrón)

---

## 🚀 Si Todo Funciona

¡**Felicidades!** 🎉

Ahora tienes:
- ✅ Navbar funcional en todas las auth pages
- ✅ Nueva página FirstSteps educativa
- ✅ Precios centrados y más atractivos
- ✅ Mejor experiencia de usuario

---

¿Preguntas? 💬

Prueba todo y reporta cualquier problema que encuentres.

**Disfruta!** 🎊