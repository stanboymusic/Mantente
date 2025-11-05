# 🧪 TEST DE SUPABASE - PASO A PASO

## ⏱️ TIEMPO: 5 minutos

---

## ✅ PRE-REQUISITOS

```
✓ .env.local configurado ✅
✓ npm install completado ✅
✓ Supabase credenciales ✅
```

---

## 🚀 PASO 1: INICIA EL SERVIDOR

```powershell
cd "c:\Users\angel\OneDrive\Documents\proyecto mantente\mantente-connect"
npm run dev
```

**Resultado esperado:**
```
✅ Terminal muestra: "Local: http://localhost:3000"
✅ Puedes ver mensajes de compilación
```

---

## 🌐 PASO 2: ABRE EL NAVEGADOR

```
URL: http://localhost:3000
```

**Resultado esperado:**
```
✅ Ves la página de Login
✅ Título: "Mantente Connect"
✅ Icono de satélite: 🛰️
```

---

## 📊 PASO 3: ABRE LA CONSOLA (F12)

```
Presiona: F12
Ve a la pestaña: Console
```

**Resultado esperado:**
```
✅ Ves logs azules
✅ Mensaje similar a: "ℹ️ No hay sesión activa"
```

---

## 📝 PASO 4: PRUEBA 1 - REGISTRARSE

### 4.1 Haz clic en el enlace
```
Texto: "¿No tienes cuenta? Regístrate"
```

**Resultado esperado:**
```
✅ El botón cambia a "Registrarse"
✅ El enlace ahora dice: "¿Ya tienes cuenta? Inicia sesión"
```

### 4.2 Rellena los campos
```
Email:      test@ejemplo.com
Contraseña: Test1234!
```

### 4.3 Haz clic en "Registrarse"

**Resultado esperado (en Consola):**
```
✅ ℹ️ Registrando...
✅ ✅ Registro exitoso: test@ejemplo.com
✅ (Se recarga la página)
```

**En el navegador:**
```
✅ Deberías ir al Dashboard
✅ Ves: "Bienvenido a Mantente Connect"
```

---

## 🔄 PASO 5: PRUEBA 2 - RESTAURACIÓN DE SESIÓN

### 5.1 Recarga la página
```
Presiona: F5
```

**Resultado esperado (en Consola):**
```
✅ ✅ Sesión restaurada para: test@ejemplo.com
```

**En el navegador:**
```
✅ No ves la página de login
✅ Vas directamente al Dashboard
✅ Sesión se restauró correctamente
```

---

## 🚪 PASO 6: PRUEBA 3 - LOGOUT

### 6.1 Busca el botón Logout
```
Ubicación: Esquina superior derecha de la navbar
O al final de la navbar si es pequeña
```

### 6.2 Haz clic en Logout

**Resultado esperado (en Consola):**
```
✅ ✅ Logout exitoso
```

**En el navegador:**
```
✅ Regresa a la página de Login
✅ Los campos están vacíos
```

---

## 🔑 PASO 7: PRUEBA 4 - LOGIN CON USUARIO EXISTENTE

### 7.1 Haz clic en "¿Ya tienes cuenta? Inicia sesión"

**Resultado esperado:**
```
✅ El botón cambia a "Iniciar Sesión"
```

### 7.2 Rellena los campos con el usuario anterior
```
Email:      test@ejemplo.com
Contraseña: Test1234!
```

### 7.3 Haz clic en "Iniciar Sesión"

**Resultado esperado (en Consola):**
```
✅ ✅ Login exitoso: test@ejemplo.com
```

**En el navegador:**
```
✅ Vas al Dashboard
✅ Sesión activa
```

---

## ✅ PRUEBA 5: VERIFICAR EN SUPABASE

### 5.1 Ve a Supabase Dashboard
```
URL: https://app.supabase.com
```

### 5.2 Inicia sesión
```
Email: Tu email de Supabase
Contraseña: Tu contraseña
```

### 5.3 Selecciona tu proyecto
```
Project: unqdliyomljchclwwbzy
```

### 5.4 Ve a Authentication → Users

**Resultado esperado:**
```
✅ Ves el usuario: test@ejemplo.com
✅ Estado: Confirmed
✅ Última actividad: hace pocos minutos
```

---

## 🎯 CHECKLIST FINAL

```
✅ Registro funciona
✅ Login funciona
✅ Logout funciona
✅ Sesión se restaura
✅ Usuario aparece en Supabase
✅ No hay errores en consola
✅ Dashboard se carga después del login
```

---

## ❌ PROBLEMAS COMUNES

### Problema 1: "Error conectando a Supabase"
```
Solución:
1. Verifica .env.local existe
2. Verifica URL y KEY son correctas
3. Reinicia npm run dev
```

### Problema 2: "Invalid login credentials"
```
Solución:
1. Verifica email y contraseña
2. Intenta registrarse de nuevo
3. Verifica que el usuario existe en Supabase
```

### Problema 3: "No va al Dashboard"
```
Solución:
1. Abre Console (F12)
2. Busca errores en rojo
3. Recopia los errores exactos
4. Reinicia el servidor
```

### Problema 4: "Sesión no se restaura"
```
Solución:
1. Abre DevTools (F12)
2. Ve a Application → Local Storage
3. Busca "auth-store"
4. Verifica que tiene datos
5. Borra y vuelve a hacer login
```

---

## 📱 CÓMO VER LA INFORMACIÓN DEL USUARIO

### En Console:
```javascript
// Escribe en la consola (F12):
localStorage.getItem('auth-store')
```

**Verás algo como:**
```json
{
  "state": {
    "user": {
      "id": "...",
      "email": "test@ejemplo.com",
      "user_metadata": {...}
    },
    "session": {
      "access_token": "...",
      "expires_in": 3600
    }
  }
}
```

---

## 🎉 ¡ÉXITO!

Si completaste todas las pruebas sin errores:

```
✅ SUPABASE ESTÁ FUNCIONANDO CORRECTAMENTE ✅
```

**Próximos pasos:**
1. Conectar Dashboard con datos
2. Implementar sincronización
3. Agregar tablas de productos, clientes, órdenes

---

## 📞 SOPORTE

Si algo falla:

1. **Lee los errores en Consola** (F12)
2. **Verifica .env.local**
3. **Reinicia npm run dev**
4. **Limpia el cache** (Ctrl+Shift+Delete)
5. **Si persiste**, copia el error exacto

**Archivo de logs que revisar:**
```
c:\Users\angel\OneDrive\Documents\proyecto mantente\mantente-connect\
```

¡Buena suerte! 🚀