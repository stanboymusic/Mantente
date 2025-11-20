# 📊 PocketBase Migration Guide

This document explains the migration from Supabase to PocketBase for the Mantente App.

## What Changed

### ❌ Removed
- **Supabase dependency** (`@supabase/supabase-js`)
- All Supabase-specific authentication code
- SQL database schema dependencies

### ✅ Added
- **PocketBase SDK** (`pocketbase` npm package)
- Local self-hosted database with PocketBase
- Simplified authentication system
- Collections-based data model

## Architecture Comparison

### Before (Supabase)
```
Frontend → Supabase REST API → PostgreSQL Database (Cloud)
         (https://supabase.io)
```

### After (PocketBase)
```
Frontend → PocketBase API → SQLite Database (Local/Self-hosted)
         (http://localhost:8090)
```

## Key Improvements

1. **🚀 Faster**: Local database - no network latency for API calls
2. **💰 Cost-effective**: No cloud database fees, self-hosted on your machine
3. **🔒 More Control**: Own your data, no third-party dependency
4. **📦 Simpler**: PocketBase handles auth, DB, and API in one package
5. **🔧 Offline Support**: Can implement offline-first architecture later

## File Changes

### Frontend (mantente-app/)

#### New Files
- **`src/pocketbase.js`**: PocketBase client initialization
  ```javascript
  import PocketBase from "pocketbase";
  const pb = new PocketBase("http://localhost:8090");
  ```

#### Modified Files
- **`src/components/Login.jsx`**: Now uses `pb.collection("users")`
- **`src/context/AppContext.jsx`**: Updated to use PocketBase API calls
- **`package.json`**: Replaced Supabase with PocketBase dependency

### Backend (pocketbase-server/)

#### Key Files
- **`init-collections.js`**: Defines all data collections
  - Now includes "users" auth collection at the beginning
  - All collections properly typed as "auth" or "base"

- **`server.js`**: Initializes collections when PocketBase is running

## Database Collections

All 24+ collections are automatically created:

### Core Collections
- **users** (auth) - User accounts with email/password
- **inventario** - Product inventory
- **ventas** - Sales records
- **clientes** - Customer information
- **facturas** - Invoices
- **egreso** - Expenses

### Premium Features
- **premium_subscriptions** - PayPal subscription tracking
- **devoluciones** - Returns management
- **presupuestos** - Quotations
- **notas_entrega** - Delivery notes
- **averias** - Damaged goods tracking

### Admin Collections
- **settings** - User preferences
- **perfil_empresa** - Business profile
- **historialMeses** - Monthly history
- **cierre_mes** - Month closing

[See init-collections.js for complete list]

## Authentication

### Registration
```javascript
await pb.collection("users").create({
  email: "user@example.com",
  password: "securePassword",
  passwordConfirm: "securePassword"
});
```

### Login
```javascript
await pb.collection("users").authWithPassword(
  "user@example.com",
  "securePassword"
);
```

### JWT Token
- Automatically stored in `pb.authStore`
- Included in all API requests
- Persists across page refreshes

## API Endpoints

All requests go to `http://localhost:8090/api/`:

### User Management
- `POST /api/collections/users/records` - Create user
- `POST /api/collections/users/auth-with-password` - Login
- `POST /api/auth/logout` - Logout

### Data Operations
- `GET /api/collections/{collection}/records` - List records
- `POST /api/collections/{collection}/records` - Create record
- `PATCH /api/collections/{collection}/records/{id}` - Update record
- `DELETE /api/collections/{collection}/records/{id}` - Delete record

### Admin Panel
- `GET /_/` - PocketBase admin interface

## Row-Level Security (RLS)

Each collection's data is filtered by `user_id` on the frontend:

```javascript
const records = await pb.collection("ventas").getFullList({
  filter: `user_id="${userId}"`
});
```

PocketBase handles authentication, and the app filters by `user_id`.

## Error Handling

Common error scenarios and solutions:

### "Failed to load resource: 404"
- **Cause**: PocketBase server not running
- **Solution**: Start PocketBase with `pocketbase.exe serve`

### "Invalid credentials"
- **Cause**: Wrong email/password
- **Solution**: Check email and password are correct

### "Collection not found"
- **Cause**: Collections not initialized
- **Solution**: Run `npm run dev` in pocketbase-server

### "Cannot reach server"
- **Cause**: Wrong URL or firewall blocked
- **Solution**: Check `.env.local` has correct URL and check firewall

## Development Workflow

### First Time Setup
```bash
# 1. Terminal 1: Start PocketBase
pocketbase.exe serve --http=127.0.0.1:8090

# 2. Terminal 2: Initialize collections
cd pocketbase-server
npm install
npm run dev

# 3. Terminal 3: Start frontend
cd mantente-app
npm install
npm run dev
```

### Daily Development
```bash
# Terminal 1: PocketBase (leave running)
pocketbase.exe serve --http=127.0.0.1:8090

# Terminal 2: Frontend
cd mantente-app
npm run dev
```

## Deployment Considerations

### Local Development
- ✅ Perfect as-is
- PocketBase stores data in `pb_data/` directory

### Production Deployment
- Deploy PocketBase to a server (Fly.io, Railway, VPS, etc.)
- Update `VITE_POCKETBASE_URL` to production URL
- Backend and frontend can be hosted separately
- PocketBase binary needed on production server

### Database Backup
```bash
# PocketBase automatically backs up to pb_data/
# For production, regularly backup the entire pb_data/ directory
```

## Troubleshooting Common Issues

### Port Already in Use
```powershell
# Find what's using port 8090
netstat -ano | findstr :8090

# Kill the process
taskkill /PID <PID> /F
```

### Windows Firewall
- Allow PocketBase through Windows Defender Firewall
- Or temporarily disable for testing

### npm Module Issues
```bash
# Clear cache and reinstall
rm -r node_modules package-lock.json
npm install
```

### Collections Keep Getting Deleted
- Don't run `init-collections.js` with `--force` flag
- Check PocketBase server logs for errors

## Migration Checklist

- [x] Added users auth collection to PocketBase
- [x] Frontend updated to use PocketBase SDK
- [x] All API calls migrated from Supabase to PocketBase
- [x] Authentication updated to PocketBase auth
- [x] Collections initialized and ready
- [x] Startup scripts created for convenience
- [ ] Test user registration
- [ ] Test user login
- [ ] Test data creation (products, customers)
- [ ] Test data retrieval
- [ ] Test premium subscription flow
- [ ] Test invoicing system
- [ ] Test reports and analytics
- [ ] Deploy to production (if needed)

## Next Steps

1. **Start PocketBase**: `pocketbase.exe serve --http=127.0.0.1:8090`
2. **Initialize Collections**: `cd pocketbase-server && npm run dev`
3. **Start Frontend**: `cd mantente-app && npm run dev`
4. **Register Account**: Go to http://localhost:5173 and create account
5. **Test Features**: Try creating products, customers, and sales
6. **Monitor Logs**: Check browser console for errors

## Support Resources

- PocketBase Docs: https://pocketbase.io/docs/
- PocketBase GitHub: https://github.com/pocketbase/pocketbase
- Mantente App Repo: (Your repository URL)

---

**Last Updated**: 2025-11-20
**Status**: ✅ Migration Complete - Ready for Testing
