# ⚡ Quick Start - Mantente with PocketBase

## TL;DR - 3 Simple Steps

### Step 1: Start PocketBase (Terminal 1)
```cmd
pocketbase.exe serve --http=127.0.0.1:8090
```
Keep this window open.

### Step 2: Initialize Collections (Terminal 2)
```cmd
cd pocketbase-server
npm install
npm run dev
```

### Step 3: Start Frontend (Terminal 3)
```cmd
cd mantente-app
npm install
npm run dev
```

Open: **http://localhost:5173**

---

## ✅ Your App is Ready!

- **Create Account** at http://localhost:5173/login
- **Use Dashboard** once logged in
- **Add Products** to inventory
- **Create Sales** transactions
- **View Reports** and analytics

---

## 🔗 Important URLs

| Component | URL |
|-----------|-----|
| Frontend App | http://localhost:5173 |
| PocketBase API | http://localhost:8090/api |
| Admin Dashboard | http://localhost:8090/_ |

---

## ⚠️ If Something Goes Wrong

### "404 Not Found" Error
→ Make sure PocketBase server is running (Step 1)

### Collections Not Created
→ Run `npm run dev` in pocketbase-server (Step 2)

### Can't Register Account
→ Check browser console for error details

### Port 8090 Already in Use
```cmd
netstat -ano | findstr :8090
taskkill /PID <PID> /F
```

---

## 📚 Full Docs

- **Setup Guide**: `SETUP_POCKETBASE.md`
- **Migration Details**: `POCKETBASE_MIGRATION.md`
- **Architecture**: `POCKETBASE_MIGRATION.md` (Architecture section)

---

**That's it! Enjoy using Mantente! 🚀**
