# HRMS Manual Startup Guide (Turbopack Fix)

## Issue
Turbopack has a bug with Windows paths. We'll disable it for now.

---

## ✅ Solution: Manual Start (Recommended)

### **Terminal 1 - Backend Server**

1. Open Command Prompt
2. Run:
```bash
cd d:\HRMS\hrms-backend
npm run start:dev
```

3. Wait for: `[Nest] Nest application successfully started`
4. **Keep this terminal open!**

---

### **Terminal 2 - Frontend Server**

1. Open a NEW Command Prompt (keep first one open)
2. Run:
```bash
cd d:\HRMS\hrms-frontend
npm run dev -- --turbo false
```

Or use legacy webpack mode:
```bash
npm run dev -- --no-turbopack
```

3. Wait for: `ready started server on [::]:3001`
4. **Keep this terminal open too!**

---

## 🎯 Access the System

Once both are running:
- **Frontend**: http://localhost:3001
- **Backend API**: http://localhost:3000

---

## 🔧 Permanent Fix (Optional)

Disable Turbopack permanently by updating `package.json`:

**File**: `d:\HRMS\hrms-frontend\package.json`

Change:
```json
"scripts": {
  "dev": "next dev",
```

To:
```json
"scripts": {
  "dev": "next dev --turbo false",
```

Then you can just run `npm run dev` normally.

---

## 🆘 Still Having Issues?

If frontend still won't start, try:

```bash
cd d:\HRMS\hrms-frontend

# Clear Next.js cache
rmdir /s /q .next
rmdir /s /q node_modules\.cache

# Restart
npm run dev -- --turbo false
```

---

**Use the manual method above - it's more reliable than the batch file!**
