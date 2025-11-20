# 🔐 PocketBase Admin Setup

The error you're seeing means PocketBase needs an admin account to manage collections.

## The Problem

```
❌ Error: The request requires valid record authorization token.
```

This happens because:
1. PocketBase is running ✅
2. But no admin account is authenticated ❌
3. We need to authenticate before creating collections

## Solution: Use New Initialize Script

The new `initialize.js` script handles this automatically!

### Step 1: Start PocketBase (Terminal 1)
```cmd
pocketbase.exe serve --http=127.0.0.1:8090
```

### Step 2: Run Initialize Script (Terminal 2)
```cmd
cd pocketbase-server
npm run dev
```

This will:
- Check if admin exists
- Create admin if needed  
- Authenticate automatically
- Create all collections
- Show success message

---

## If You Still Get an Error

### Option A: Create Admin in UI First

1. **Stop everything** (Ctrl+C in both terminals)
2. **Delete the data folder** to reset:
   ```cmd
   rmdir /s /q pb_data
   ```
3. **Start PocketBase** again:
   ```cmd
   pocketbase.exe serve --http=127.0.0.1:8090
   ```
4. **Go to**: http://localhost:8090/_/
5. **Create admin account**:
   - Email: `mantenteapp@gmail.com`
   - Password: `31671702`
6. **Back to Terminal 2**:
   ```cmd
   cd pocketbase-server
   npm run dev
   ```

### Option B: Use the Initialization Script

The new `initialize.js` tries to create the admin automatically if it doesn't exist.

```cmd
cd pocketbase-server
npm run init
```

---

## How It Works

```
PocketBase Running
       ↓
Check if admin exists
       ↓
If not: Create admin
       ↓
Authenticate with admin credentials
       ↓
Create collections
       ↓
✅ Done!
```

---

## Admin Credentials

**Email**: `mantenteapp@gmail.com`
**Password**: `31671702`

These are stored in `initialize.js` and used for automatic authentication.

---

## What If...

### "Admin Creation Failed"
- Go to http://localhost:8090/_/ and create manually
- Use the same email/password as above

### "Authentication Still Fails"
- Restart PocketBase: `pocketbase.exe serve --http=127.0.0.1:8090`
- Wait 3 seconds for it to fully start
- Run: `npm run dev`

### "Collections Already Exist"
- That's fine! Script will see them and skip creation
- You'll see: `ℹ️  users ya existe`

### "Want Fresh Start"
- Delete: `pb_data/` folder
- Run script again

---

## Verify Success

After running `npm run dev`, you should see:

```
========================================
  MANTENTE - PocketBase Initialization
========================================

Conectando a: http://localhost:8090

🔐 Verificando cuenta de administrador...
✅ Cuenta de admin ya existe

🔐 Autenticando como administrador...
✅ Autenticado exitosamente

📊 Iniciando sincronización de colecciones...

✅ users (auth)
✅ averias (base)
✅ clientes (base)
✅ inventario (base)
✅ ventas (base)
✅ premium_subscriptions (base)
✅ facturas (base)
✅ egreso (base)
✅ perfil_empresa (base)
✅ settings (base)

✅ Inicialización completada!
📊 Colecciones nuevas: 10
📋 Total de colecciones: 10

========================================
  ✅ ¡Listo para usar!
========================================

Accede a: http://localhost:8090/_/
```

---

## Next: Start Frontend

Once initialization succeeds:

```cmd
cd mantente-app
npm run dev
```

Then go to: http://localhost:5173

---

## Key Files

| File | Purpose |
|------|---------|
| `initialize.js` | ✅ Main initialization script |
| `server.js` | Old initialization (not used now) |
| `init-collections.js` | Legacy initialization |
| `package.json` | Scripts: `npm run dev` uses `initialize.js` |

---

**Status**: ✅ All automated now
**Try running**: `npm run dev` in pocketbase-server
