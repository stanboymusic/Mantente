# 📧 Configuración de EmailJS para Formulario de Contacto

El formulario de contacto ahora envía emails a `mantenteapp@gmail.com` usando **EmailJS**.

## 📋 Pasos de Configuración:

### 1. Crear una Cuenta en EmailJS
- Visita: https://www.emailjs.com/
- Regístrate gratis
- Confirma tu email

### 2. Obtener tu Public Key
- Ve a: https://dashboard.emailjs.com/
- En la sección "Account", copia tu **Public Key**
- Reemplaza el valor en `Contact.jsx` (línea 18):
  ```javascript
  emailjs.init("TU_PUBLIC_KEY_AQUI");
  ```

### 3. Configurar Gmail como Servicio de Email
- En EmailJS Dashboard, ve a "Email Services"
- Haz click en "+ Add Service"
- Selecciona "Gmail"
- Ingresa tu cuenta: `mantenteapp@gmail.com`
- Obtén una "App Password" desde Google (no la contraseña normal):
  - Ve a: https://myaccount.google.com/apppasswords
  - Selecciona: Mail > Windows Computer (o tu dispositivo)
  - Gmail generará una contraseña de 16 caracteres
  - Usa esa contraseña en EmailJS

### 4. Crear una Plantilla de Email
- Ve a "Email Templates"
- Haz click en "+ Create New Template"
- Asigna el nombre: `template_mantente`
- En el campo "Service ID", usa: `service_mantente`
- Configura la plantilla así:

**Subject:**
```
Nuevo mensaje de contacto: {{subject}}
```

**Content:**
```
De: {{from_name}} ({{from_email}})

Asunto: {{subject}}

Mensaje:
{{message}}

---
Responde a: {{from_email}}
```

**To Email:** (déjalo con la variable)
```
{{to_email}}
```

### 5. Usar en el Código
Los valores en `Contact.jsx` son:
- **Service ID**: `service_mantente`
- **Template ID**: `template_mantente`
- **Destinatario**: `mantenteapp@gmail.com` (configurado en el código)

## ✅ Verificación

Una vez configurado:

1. Instala las dependencias:
```bash
npm install
```

2. Inicia la aplicación:
```bash
npm run dev
```

3. Ve al formulario de contacto (`/contact`)

4. Envía un mensaje de prueba

5. Deberías recibir un email en `mantenteapp@gmail.com`

## 🔒 Notas de Seguridad

- Tu **Public Key** está visible en el código (es públicamente seguro)
- No compartas tu **Private Key** (no lo necesitas para esto)
- Gmail generará una App Password específica para EmailJS (no uses tu contraseña normal)

## 📞 Soporte

Si tienes problemas:
- Verifica que la App Password de Gmail sea correcta
- Asegúrate de que Gmail esté habilitado en EmailJS
- Revisa la consola del navegador para ver mensajes de error