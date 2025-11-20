# 🚀 PocketBase Setup Guide - Mantente App

This guide explains how to set up and run Mantente with PocketBase as the database.

## Prerequisites

- Node.js 16+ installed
- PocketBase executable available in the project root directory
- Administrator access to run services on port 8090 (PocketBase)

## Step 1: Start PocketBase Server

PocketBase needs to be running before the frontend app can communicate with it.

### Option A: Manual Start (Windows)

1. Open a **new Command Prompt** or **PowerShell** window
2. Navigate to the project root directory:
   ```cmd
   cd "c:\Users\angel\OneDrive\Documents\proyecto mantente"
   ```
3. Start PocketBase:
   ```cmd
   pocketbase.exe serve --http=127.0.0.1:8090
   ```
4. You should see output like:
   ```
   Server started at http://127.0.0.1:8090
   ```
5. Keep this window open - PocketBase must be running at all times

### Option B: Using Batch Script (Windows)

Simply double-click: `START_POCKETBASE.bat`

## Step 2: Initialize Database Collections

In a **different Command Prompt/PowerShell window**:

```cmd
cd "c:\Users\angel\OneDrive\Documents\proyecto mantente\pocketbase-server"
npm install
npm run dev
```

This will:
- Connect to the running PocketBase server
- Create all required collections
- Create the "users" authentication collection
- Set up indexes and permissions

You should see output like:
```
✅ Autenticado
✅ Creada: users (auth)
✅ Creada: averias (base)
✅ Creada: clientes (base)
... (more collections)
✅ ¡Todas las colecciones sincronizadas!
```

## Step 3: Start the Frontend Application

In another **Command Prompt/PowerShell window**:

```cmd
cd "c:\Users\angel\OneDrive\Documents\proyecto mantente\mantente-app"
npm install
npm run dev
```

The app will start on `http://localhost:5173`

## Step 4: Access PocketBase Admin Panel

Open your browser and go to:
```
http://localhost:8090/_/
```

You can use the admin credentials to view collections and manage data.

---

## Architecture

```
┌─────────────────────────────────────┐
│   Frontend (React/Vite)              │
│   http://localhost:5173              │
└────────────────┬────────────────────┘
                 │ HTTP API Calls
                 ▼
┌─────────────────────────────────────┐
│   PocketBase Server                  │
│   http://localhost:8090              │
│   - users (auth collection)          │
│   - inventario                       │
│   - ventas                           │
│   - clientes                         │
│   - ... (23+ collections)            │
└─────────────────────────────────────┘
```

## Authentication Flow

1. **User Registration**: Frontend sends POST to `http://localhost:8090/api/collections/users/records`
2. **User Login**: Frontend sends POST to `http://localhost:8090/api/collections/users/auth-with-password`
3. **Authentication Token**: PocketBase returns JWT token stored in browser
4. **API Requests**: All subsequent requests include the token in headers

## Key Files

- **`pocketbase-server/init-collections.js`**: Defines all collections and fields
- **`mantente-app/src/pocketbase.js`**: Frontend PocketBase client configuration
- **`mantente-app/src/components/Login.jsx`**: Login and registration UI
- **`mantente-app/src/context/AppContext.jsx`**: App state and data fetching

## Environment Variables

### Frontend (.env.local)
```
VITE_POCKETBASE_URL=http://localhost:8090
```

### Backend (.env)
```
NODE_ENV=development
PB_HOST=127.0.0.1
PB_PORT=8090
```

## Troubleshooting

### Port 8090 Already in Use
```cmd
netstat -ano | findstr :8090
taskkill /PID <PID> /F
```

### PocketBase Not Responding
- Check if PocketBase server window is still open
- Restart: `pocketbase.exe serve --http=127.0.0.1:8090`

### Collections Not Created
```cmd
cd pocketbase-server
npm run dev
```

### CORS Errors
- Ensure PocketBase is running on the correct URL
- Check `VITE_POCKETBASE_URL` in `.env.local`

### Users Collection Not Found
- Run initialization script: `pocketbase-server/npm run dev`
- Check PocketBase admin panel at `http://localhost:8090/_/`

## Stopping the Application

1. Close the PocketBase window (Ctrl+C)
2. Close the Frontend dev server (Ctrl+C)
3. Close any Command Prompt windows

## Next Steps

1. Try registering a new account at `http://localhost:5173/login`
2. Once logged in, access the dashboard
3. Create some test data (products, customers, sales)
4. Verify data appears in PocketBase admin panel at `http://localhost:8090/_/`

---

**Need help?** Check the error messages in the console windows - they usually indicate what's missing or misconfigured.
