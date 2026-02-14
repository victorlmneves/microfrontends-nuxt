# How to Start the Project

There are multiple ways to start the development servers. Choose the one that works best for your system:

---

## ✅ Recommended: Direct Command

This is the simplest and most reliable method:

```bash
pnpm run dev
```

**That's it!** This command starts all three applications.

---

## 🐧 Linux/macOS: Using Shell Script

### Option 1: Make executable and run
```bash
chmod +x start.sh
./start.sh
```

### Option 2: Run with sh
```bash
sh start.sh
```

### Option 3: Run with bash
```bash
bash start.sh
```

---

## 🪟 Windows: Multiple Options

### Option 1: Direct command (recommended)
```cmd
pnpm run dev
```

### Option 2: Batch script
```cmd
start.bat
```

### Option 3: PowerShell script
```powershell
.\start.ps1
```

**Note:** If PowerShell blocks the script, run:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
.\start.ps1
```

---

## 🎯 What Happens When You Start

When you run `pnpm run dev`, Turborepo:

1. **Starts Host App** on port 3000
2. **Starts Products Remote** on port 3001
3. **Starts Cart Remote** on port 3002

All three run **simultaneously** in development mode with hot module replacement (HMR).

---

## 🌐 Access the Applications

Once started, open your browser:

- **Host Application**: http://localhost:3000
  - Main app with navigation
  - Consumes remote microfrontends

- **Products Remote**: http://localhost:3001
  - Standalone products app
  - Runs independently

- **Cart Remote**: http://localhost:3002
  - Standalone cart app
  - Runs independently

---

## 🛑 Stopping the Applications

Press `Ctrl + C` in the terminal where the apps are running.

If apps don't stop cleanly, you can force kill them:

### Linux/macOS:
```bash
# Kill processes on ports 3000-3002
lsof -ti:3000 | xargs kill -9
lsof -ti:3001 | xargs kill -9
lsof -ti:3002 | xargs kill -9
```

### Windows:
```cmd
# Kill processes on ports 3000-3002
netstat -ano | findstr :3000
netstat -ano | findstr :3001
netstat -ano | findstr :3002
# Then use the PID to kill: taskkill /PID <PID> /F
```

---

## 🔧 Running Individual Apps

If you want to run apps separately:

### Terminal 1: Host App
```bash
cd apps/host
pnpm run dev
```

### Terminal 2: Products Remote
```bash
cd apps/remote-products
pnpm run dev
```

### Terminal 3: Cart Remote
```bash
cd apps/remote-cart
pnpm run dev
```

**Important:** For Module Federation to work, the **host must be able to access the remotes**, so if you're testing the host, make sure the remote apps are also running.

---

## 🚨 Troubleshooting Startup

### Error: "command not found: pnpm"

**Solution:** Install pnpm first
```bash
npm install -g pnpm
```

### Error: "Port already in use"

**Solution:** Kill the process using the port
```bash
# Linux/macOS
lsof -ti:3000 | xargs kill -9

# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Error: "Cannot find module"

**Solution:** Reinstall dependencies
```bash
rm -rf node_modules apps/*/node_modules
pnpm install
```

### Error: Module Federation errors

**Solution:** Clear Nuxt cache
```bash
rm -rf apps/*/.nuxt
pnpm run dev
```

---

## 💡 Pro Tips

1. **Use the direct command** (`pnpm run dev`) for most reliable startup
2. **Keep all three apps running** for the best experience
3. **Check the browser console** if remotes don't load
4. **Use Turbo's cache** for faster rebuilds (already configured)

---

## 📊 Monitoring the Apps

Once started, you can monitor:

- **Terminal output** - Shows build status and errors
- **Browser DevTools** - Network tab shows remote module loading
- **Nuxt DevTools** - Press Shift+Alt+D in the browser

---

## 🔄 Restarting After Changes

Most changes will hot-reload automatically, but if you need to restart:

1. Press `Ctrl + C` to stop
2. Run `pnpm run dev` again

Clear cache if changes don't appear:
```bash
rm -rf apps/*/.nuxt
pnpm run dev
```

---

**Ready to start?** Just run: `pnpm run dev` 🚀
