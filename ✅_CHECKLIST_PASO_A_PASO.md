# ✅ CHECKLIST PASO A PASO - SIGUE ESTO

## FASE 1: PREPARACIÓN

- [ ] Abre Supabase: https://supabase.com
- [ ] Haz login con tu cuenta
- [ ] Selecciona tu proyecto "Mantente"
- [ ] Click en: SQL Editor (sidebar)
- [ ] Click en: New Query (botón azul)

**Status Fase 1**: ⏳ Esperando que abras Supabase

---

## FASE 2: COPIAR SQL

- [ ] Abre el archivo: 🎯_GUIA_PASO_A_PASO_SUPABASE.md
- [ ] Ve a la sección: "PASO 3: COPIA TODO ESTE SQL"
- [ ] Selecciona TODO el código SQL (desde `-- ✅ CREAR` hasta la última línea `});`)
- [ ] Presiona: Ctrl + C (copiar)
- [ ] Verifica que has copiado unas 80 líneas

**Status Fase 2**: ⏳ Esperando que copies el SQL

---

## FASE 3: PEGAR EN SUPABASE

- [ ] En Supabase, click en el área blanca del editor
- [ ] Presiona: Ctrl + A (selecciona todo lo que haya)
- [ ] Presiona: Ctrl + V (pega el SQL que copiaste)
- [ ] Verifica que el código aparece en el editor
- [ ] Verifica que el código tiene unas 80 líneas

**Status Fase 3**: ⏳ Esperando que pegues en Supabase

---

## FASE 4: EJECUTAR

- [ ] Presiona: Ctrl + Enter
- [ ] Espera a que aparezca un mensaje
- [ ] **Si ves**: ✅ Query executed successfully
  - [ ] Marca este paso como completado
  - [ ] Ve a FASE 5

- [ ] **Si ves**: ❌ Error
  - [ ] Abre la consola (F12)
  - [ ] Copia el error exacto
  - [ ] Avísame con el error y qué hiciste

**Status Fase 4**: ⏳ Ejecutando SQL

---

## FASE 5: VERIFICAR TABLAS

- [ ] Click en: Table Editor (sidebar)
- [ ] En la lista de tablas, busca:
  - [ ] ¿Ves "notas_entrega"? → Si sí, ✅
  - [ ] ¿Ves "pedidos"? → Si sí, ✅
  
- [ ] **Si ves ambas tablas**:
  - [ ] ✅ Las tablas se crearon correctamente
  - [ ] Ve a FASE 6

- [ ] **Si NO ves las tablas**:
  - [ ] Recarga Supabase (F5)
  - [ ] Espera 5 segundos
  - [ ] Verifica nuevamente
  - [ ] Si sigue sin aparecer → Avísame

**Status Fase 5**: ⏳ Verificando tablas en Supabase

---

## FASE 6: RECARGA LA APP

```powershell
# En PowerShell:
Set-Location "c:\Users\angel\OneDrive\Documents\proyecto mantente\mantente-app"
npm run dev
```

- [ ] Presiona: Enter
- [ ] Espera a que veas:
  ```
  Local: http://localhost:5173
  ```
- [ ] Copia esa URL: http://localhost:5173
- [ ] Abre esa URL en el navegador

**Status Fase 6**: ⏳ Recargando la app

---

## FASE 7: LOGIN Y VERIFICACIÓN

- [ ] ¿Ves la app cargada?
  - [ ] Si: ✅ Continúa
  - [ ] No: ❌ Avísame qué ves

- [ ] Haz login con tu cuenta
- [ ] Espera a que cargue el Dashboard

**Status Fase 7**: ⏳ Login en la app

---

## FASE 8: PRUEBA 1 - CREAR NOTA DE ENTREGA

- [ ] Click en el menú: Premium
- [ ] Click en: Notas de Entrega
- [ ] Click en: ➕ Nueva Nota
- [ ] Completa los datos:
  - [ ] Cliente: "Test Cliente"
  - [ ] Fecha: Hoy
  - [ ] Artículos: Agrega al menos uno
    - [ ] Descripción: "Producto Test"
    - [ ] Cantidad: 1
- [ ] Click en: Crear Nota

**Resultado esperado:**
- [ ] ¿Ves: "✅ Nota de entrega creada exitosamente"?
  - [ ] Si: ✅ FUNCIONA
  - [ ] No: ❌ Abre consola (F12) y copia el error

- [ ] ¿Aparece la nota en la lista?
  - [ ] Si: ✅ PERFECTO
  - [ ] No: ❌ Recarga la página

**Status Prueba 1**: ⏳ Probando Notas

---

## FASE 9: PRUEBA 2 - CREAR PEDIDO

- [ ] Click en el menú: Premium
- [ ] Click en: Pedidos
- [ ] Click en: ➕ Nuevo Pedido
- [ ] Completa los datos:
  - [ ] Cliente: "Test Cliente 2"
  - [ ] Fecha Est. Entrega: Mañana
  - [ ] Artículos: Agrega al menos uno
    - [ ] Producto: Selecciona uno del inventario
    - [ ] Cantidad: 2
    - [ ] Precio: Debe llenar automáticamente
- [ ] Click en: Crear Pedido

**Resultado esperado:**
- [ ] ¿Ves: "✅ Pedido creado exitosamente"?
  - [ ] Si: ✅ FUNCIONA
  - [ ] No: ❌ Abre consola (F12) y copia el error

- [ ] ¿Aparece el pedido en la lista?
  - [ ] Si: ✅ PERFECTO
  - [ ] No: ❌ Recarga la página

- [ ] ¿El pedido tiene número PED-xxxxx?
  - [ ] Si: ✅ PERFECTO
  - [ ] No: ❌ Abre consola y copia el error

**Status Prueba 2**: ⏳ Probando Pedidos

---

## FASE 10: PRUEBA 3 - DEVOLUCIONES EN BALANCE

- [ ] Click en: Dashboard
- [ ] Busca el card: "↩️ Devoluciones Aprobadas"
  - [ ] ¿Lo ves?
    - [ ] Si: ✅ Card visible
    - [ ] No: ❌ Recarga la página

- [ ] Nota el monto actual de devoluciones
- [ ] Click en: Devoluciones
- [ ] Si hay devoluciones, marca una como "Aprobada"
  - [ ] Si no hay, crea una con monto $100
- [ ] Regresa al Dashboard

- [ ] ¿El monto en "Devoluciones Aprobadas" cambió?
  - [ ] Si: ✅ Se actualiza
  - [ ] No: ⚠️ Recarga la página

- [ ] ¿El "Balance Final" se reduce?
  - [ ] Si: ✅ PERFECTO (funciona correctamente)
  - [ ] No: ❌ Avísame

**Status Prueba 3**: ⏳ Verificando Devoluciones

---

## FASE 11: PRUEBA 4 - EGRESOS

- [ ] Click en: Egresos
- [ ] Completa:
  - [ ] Descripción: "Test Egreso"
  - [ ] Monto: 50
  - [ ] Categoría: "Otros"
  - [ ] Fecha: Hoy
- [ ] Click en: ➕ Registrar Egreso

- [ ] ¿Ves: "✅ Egreso creado"?
  - [ ] Si: ✅ FUNCIONA
  - [ ] No: ❌ Copia el error

- [ ] ¿Aparece en la tabla "Egresos"?
  - [ ] Si: ✅ PERFECTO
  - [ ] No: ❌ Recarga la página

- [ ] Click en: Dashboard
- [ ] ¿El card "📉 Egresos" muestra $50?
  - [ ] Si: ✅ FUNCIONA
  - [ ] No: ❌ Recarga y verifica

- [ ] ¿El "Balance Final" se reduce en $50?
  - [ ] Si: ✅ PERFECTO
  - [ ] No: ❌ Avísame

**Status Prueba 4**: ⏳ Verificando Egresos

---

## 🎉 RESUMEN FINAL

**Marca lo que funcionó:**

- [ ] ✅ Notas de Entrega - FUNCIONA
- [ ] ✅ Pedidos - FUNCIONA
- [ ] ✅ Devoluciones en Balance - FUNCIONA
- [ ] ✅ Egresos - FUNCIONA
- [ ] ✅ Dashboard - FUNCIONA

**Si todo está marcado:**
```
🎉 ¡ÉXITO! TODO FUNCIONA PERFECTAMENTE
```

**Si algo NO está marcado:**
```
⚠️ Hay algo que no funciona
→ Copia el error exacto
→ Avísame con los pasos que hiciste
→ Yo voy a revisar
```

---

## 📞 AYUDA RÁPIDA

### Si ves: "relation 'notas_entrega' does not exist"
```
❌ La tabla no se creó
→ Repite FASE 2, 3, 4
→ Verifica que ejecutaste el SQL
```

### Si ves: "Query executed successfully" pero NO ves las tablas
```
⚠️ Las tablas pueden tardar
→ Recarga Supabase (F5)
→ Espera 10 segundos
→ Verifica de nuevo
```

### Si aparece el modal pero después sale error
```
⚠️ Hay problema con los datos
→ Abre consola (F12)
→ Copia el error en rojo
→ Avísame
```

### Si todo funciona pero no ves números de nota/pedido
```
⚠️ Problema visual
→ Recarga la página
→ Verifica que la tabla muestra el dato
→ Si sigue, avísame
```

---

## ✅ CUANDO HAYAS TERMINADO

- [ ] Todas las pruebas pasaron
- [ ] Viste los mensajes de éxito
- [ ] Los datos aparecen en la lista
- [ ] El Balance refleja todos los cambios

**Próximo paso**: ¡Usa la app! 🚀

---

**Tiempo total esperado**: 15-20 minutos
**Complejidad**: Baja
**Resultado**: Todo funciona perfectamente

¡Adelante! 💪