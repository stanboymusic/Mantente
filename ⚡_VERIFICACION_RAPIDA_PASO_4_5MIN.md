# ⚡ VERIFICACIÓN RÁPIDA PASO 4 (5 Minutos)

Para ejecutar esto **cuando tengas prisa** o **antes de deploy**.

---

## 🚀 Start: Servidor Corriendo

```bash
Set-Location "c:\Users\angel\OneDrive\Documents\proyecto mantente\mantente-app"
npm run dev
```

Espera a ver:
```
Local: http://localhost:5173
```

---

## ✅ Verificación #1: (1 min)

Abre: http://localhost:5173

```
✓ Carga la página (sin errores)
✓ Login funciona
✓ Ves navbar con todos los items
✓ F12 → Console está VERDE (sin errores rojos)
```

---

## ✅ Verificación #2: Premium Features (1 min)

En navbar, busca:

```
✓ ↩️ Devoluciones (debe estar)
✓ 🔧 Averías (debe estar)
```

Si NO ves ambos = usuario NO es premium, haz login con premium

---

## ✅ Verificación #3: Crear Devolución (1.5 min)

```
1. Click ↩️ Devoluciones
2. Campo "Buscar": ingresa código de venta (ej V-001)
3. Click para abrir modal
4. Selecciona "Reembolso Completo"
5. Click "Registrar"
6. ✓ Aparece en tabla
7. F12 → Console: ✓ Sin errores rojos
```

---

## ✅ Verificación #4: Crear Avería (1.5 min)

```
1. Click 🔧 Averías
2. Click "Nueva Avería"
3. Selecciona producto
4. Ingresa cantidad: 1
5. Selecciona razón
6. Click "Registrar"
7. ✓ Aparece en tabla
8. ✓ Estadísticas actualizadas
9. F12 → Console: ✓ Sin errores rojos
```

---

## ✅ Verificación #5: Persistencia (1 min)

```
1. Presiona Ctrl+Shift+R (hard refresh)
2. Login
3. ✓ Devoluciones siguen en tabla
4. ✓ Averías siguen en tabla
5. ✓ Números en estadísticas igual
```

---

## 🎯 Resultado

```
Si TODAS las verificaciones pasan:
✅ SISTEMA LISTO PARA DEPLOY

Si ALGO FALLA:
❌ Ejecuta Testing Suite Completo (40 minutos)
   Ver: ✅_TESTING_MANUAL_PASO_4_PASO_A_PASO.md
```

---

## 📊 Build & Performance Check (2 min extra)

```bash
npm run build
```

Verifica en consola:
```
✓ ✔ 14 modules transformed
✓ built in XXXms
✓ dist/index.html  X.XXkb
✓ SIN ERRORES
```

---

**¡SI TODO PASÓ? ESTAMOS LISTOS PARA STEP 6: DEPLOY** 🚀
