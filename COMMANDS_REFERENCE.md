# 🎯 Commands Reference

Quick reference for all common commands.

## Starting the Application

### Using Batch File (Windows)
```cmd
START_POCKETBASE.bat
```

### Manual Start (3 Terminals)

**Terminal 1: PocketBase Server**
```cmd
pocketbase.exe serve --http=127.0.0.1:8090
```

**Terminal 2: Initialize Collections**
```cmd
cd pocketbase-server
npm install
npm run dev
```

**Terminal 3: Frontend Development**
```cmd
cd mantente-app
npm install
npm run dev
```

---

## Frontend Commands

Navigate to `mantente-app/` directory:

```cmd
# Start development server (http://localhost:5173)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint
```

---

## Backend Commands

Navigate to `pocketbase-server/` directory:

```cmd
# Install dependencies
npm install

# Start server and initialize collections
npm run dev

# Run linter (if available)
npm run lint
```

---

## PocketBase Commands

From project root:

```cmd
# Start PocketBase server
pocketbase.exe serve --http=127.0.0.1:8090

# Other port
pocketbase.exe serve --http=127.0.0.1:9000

# See help
pocketbase.exe -h
```

---

## Database Management

### Access Admin Panel
- Open browser: http://localhost:8090/_/
- Manage collections, users, and data

### View Collections in Admin
1. Go to http://localhost:8090/_/
2. Collections listed in left sidebar
3. View/edit records directly

### Backup Database
```bash
# All data stored in pb_data/ folder
# Copy entire folder to backup location
cp -r pb_data/ backup/pb_data/
```

---

## Troubleshooting Commands

### Check if ports are in use
```cmd
# Windows
netstat -ano | findstr :8090
netstat -ano | findstr :5173

# Check specific process
tasklist | findstr pocketbase
```

### Free up port
```cmd
# Find PID (Process ID) then kill it
taskkill /PID <PID> /F

# Example:
taskkill /PID 12345 /F
```

### Clear npm cache
```cmd
npm cache clean --force
```

### Reinstall dependencies
```cmd
rm node_modules package-lock.json
npm install
```

---

## Git Commands (if using version control)

```cmd
# Check status
git status

# Add changes
git add .

# Commit changes
git commit -m "Description of changes"

# Push to remote
git push origin main
```

---

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

---

## Testing

### Manual Testing Checklist
```
[ ] Navigate to http://localhost:5173
[ ] Click "Create Account"
[ ] Fill in email and password
[ ] Click "Create Account" button
[ ] Should redirect to dashboard
[ ] Try creating a product
[ ] Verify data appears in PocketBase admin
[ ] Try logging out
[ ] Try logging back in
[ ] Verify all data is still there
```

### Check Browser Console
```
F12 or Right-click → Inspect → Console tab
Look for any red errors
```

---

## Useful URLs

| Purpose | URL |
|---------|-----|
| Frontend App | http://localhost:5173 |
| PocketBase API | http://localhost:8090/api |
| PocketBase Admin | http://localhost:8090/_ |
| Collections | http://localhost:8090/api/collections |
| Records | http://localhost:8090/api/collections/{name}/records |

---

## API Examples

### Create User
```bash
curl -X POST http://localhost:8090/api/collections/users/records \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "passwordConfirm": "password123"
  }'
```

### Login
```bash
curl -X POST http://localhost:8090/api/collections/users/auth-with-password \
  -H "Content-Type: application/json" \
  -d '{
    "identity": "test@example.com",
    "password": "password123"
  }'
```

### Get All Records
```bash
curl http://localhost:8090/api/collections/inventario/records
```

---

## Common Issues & Fixes

### Issue: "Cannot connect to PocketBase"
```cmd
# Solution: Make sure PocketBase is running
pocketbase.exe serve --http=127.0.0.1:8090
```

### Issue: "Collections not found"
```cmd
# Solution: Run initialization
cd pocketbase-server
npm run dev
```

### Issue: "Port 8090 already in use"
```cmd
# Solution: Free the port
netstat -ano | findstr :8090
taskkill /PID <PID> /F
```

### Issue: "npm ERR! ENOENT"
```cmd
# Solution: Make sure you're in the correct directory
cd mantente-app  # or cd pocketbase-server
```

---

**Quick Help**: Check QUICK_START.md or SETUP_POCKETBASE.md for detailed guides.
