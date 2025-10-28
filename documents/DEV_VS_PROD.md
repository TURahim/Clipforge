# ClipForge - Development vs Production Workflow

## 🎯 Quick Reference

| Mode | Command | Entry Point | Output | Use Case |
|------|---------|-------------|--------|----------|
| **Development** | `pnpm dev` | `out/main/main.cjs` | Regular CommonJS | Fast iteration, hot reload |
| **Production** | `pnpm build` + `npx electron .` | `out/main/bytecode-loader.cjs` | Bytecode (`.jsc`) | Testing, packaging |

---

## 🔧 Development Mode

### Command
```bash
pnpm dev
```

### What Happens
1. ✅ Builds main process → `out/main/main.cjs`
2. ✅ Builds preload → `out/preload/preload.cjs`
3. ✅ Starts dev server on `http://127.0.0.1:5174`
4. ✅ Launches Electron automatically
5. ✅ Watches for file changes (hot reload)

### Output Files
```
out/
├── main/
│   └── main.cjs          ← Regular CommonJS (NOT bytecode)
├── preload/
│   └── preload.cjs       ← Regular CommonJS
└── (renderer runs from dev server, not files)
```

### Features
- ✅ **Hot Reload** - Changes reflect immediately
- ✅ **Source Maps** - Easy debugging
- ✅ **Fast Builds** - No bytecode compilation
- ✅ **DevTools** - Opens automatically

### `package.json` State
```json
{
  "main": "out/main/main.cjs"  // ← Points to regular CJS
}
```

---

## 📦 Production Build

### Commands
```bash
# 1. Build
pnpm build

# 2. Test production build
npx electron .
```

### What Happens
1. ✅ Builds main process → `main.js`
2. ✅ Compiles to bytecode → `main.jsc`
3. ✅ Creates bytecode loader → `bytecode-loader.cjs`
4. ✅ Same for preload
5. ✅ Builds renderer to static files
6. ✅ **Auto-updates package.json** main field

### Output Files
```
out/
├── main/
│   ├── bytecode-loader.cjs   ← Entry point (loads .jsc)
│   ├── main.js               ← Intermediate (not used directly)
│   └── main.jsc              ← Bytecode compiled ⚡
├── preload/
│   ├── bytecode-loader.cjs
│   ├── preload.js
│   └── preload.jsc
└── renderer/
    ├── index.html
    └── assets/
        ├── index-[hash].css
        └── index-[hash].js
```

### Features
- ⚡ **Faster Startup** - Bytecode loads quicker
- 🔒 **Better Security** - Source code not exposed
- 📦 **Smaller Size** - Optimized bundles
- ✅ **Production Ready** - Ready for packaging

### `package.json` State (Auto-Updated)
```json
{
  "main": "out/main/bytecode-loader.cjs"  // ← Points to bytecode loader
}
```

---

## 🔄 Switching Between Modes

### From Dev to Production
```bash
# Just build - package.json updates automatically
pnpm build

# Run production
npx electron .
```

### From Production Back to Dev
```bash
# No changes needed! Just run dev
pnpm dev
# Dev mode ignores the main field and uses its own entry points
```

**Note:** `package.json` will show `bytecode-loader.cjs` after building, but `pnpm dev` still works because electron-vite handles entry points internally.

---

## ⚠️ Common Issues & Solutions

### Issue 1: "Only Electron icon appears, no window"

**Cause:** Running `npx electron .` without building first, or package.json pointing to wrong file.

**Solution:**
```bash
pnpm build           # This auto-updates package.json
npx electron .       # Should work now
```

### Issue 2: "Entry file not found: bytecode-loader.cjs"

**Cause:** Trying to run dev mode but package.json points to bytecode loader.

**Solution:** This is fine! Just use `pnpm dev` instead of `npx electron .`

### Issue 3: Port EPERM error (127.0.0.1:5174)

**Cause:** macOS blocking port access.

**Solutions:**
1. **Grant Terminal network permissions:**
   - System Settings → Privacy & Security → Local Network
   - Enable for Terminal/iTerm

2. **Change port in `electron.vite.config.ts`:**
   ```typescript
   server: {
     port: 5175,  // Try different port
   }
   ```

3. **Use production build instead:**
   ```bash
   pnpm build && npx electron .
   ```

---

## 📊 Build Script Details

### The `pnpm build` Script

```json
"build": "electron-vite build && node -e \"const fs=require('fs');const pkg=JSON.parse(fs.readFileSync('package.json'));pkg.main='out/main/bytecode-loader.cjs';fs.writeFileSync('package.json',JSON.stringify(pkg,null,2))\""
```

**What it does:**
1. Runs `electron-vite build` (creates bytecode files)
2. Reads `package.json`
3. Updates `main` field to `out/main/bytecode-loader.cjs`
4. Saves `package.json`
5. Triggers `postbuild` hook (echoes success message)

---

## 🎬 Recommended Workflow

### Daily Development
```bash
# Start developing
pnpm dev

# Make changes → Hot reload happens automatically
# Test features → Immediate feedback

# Before committing, test production build
pnpm build
npx electron .

# If production works, commit
git add .
git commit -m "feat: add new feature"
```

### Testing Features
```bash
# Quick testing → Dev mode
pnpm dev

# Production testing → Build mode
pnpm build && npx electron .

# Both should work identically!
```

### Packaging for Distribution
```bash
# 1. Build with bytecode
pnpm build

# 2. Test that it works
npx electron .

# 3. Package for macOS/Windows
pnpm package:mac
# or
pnpm package:win

# Output: Distributable .dmg or .exe in dist/
```

---

## 🔍 Debugging

### Dev Mode Debugging
```bash
pnpm dev
# DevTools opens automatically
# Check Console tab for:
# - [FFmpeg] logs
# - Error messages
# - Component logs
```

### Production Build Debugging
```bash
pnpm build
npx electron .

# Open DevTools manually:
# macOS: Cmd+Option+I
# Windows: Ctrl+Shift+I
```

### Check Build Output
```bash
# See what files were created
ls -la out/main/
ls -la out/preload/
ls -la out/renderer/

# Verify bytecode compilation
file out/main/main.jsc
# Should show: "data" or "bytecode"
```

---

## ✅ Verification Checklist

### Dev Mode Works If:
- [ ] `pnpm dev` launches app
- [ ] UI loads at `http://127.0.0.1:5174`
- [ ] Hot reload works (edit file → auto-refresh)
- [ ] Import video works
- [ ] Drag-and-drop works
- [ ] Console shows `[FFmpeg]` logs

### Production Works If:
- [ ] `pnpm build` completes without errors
- [ ] `out/main/bytecode-loader.cjs` exists
- [ ] `out/main/main.jsc` exists
- [ ] `package.json` main points to `bytecode-loader.cjs`
- [ ] `npx electron .` launches app
- [ ] All features work identically to dev mode

---

## 🚀 Summary

**Key Points:**
1. **Dev mode** (`pnpm dev`) - Use for development, hot reload, debugging
2. **Production** (`pnpm build`) - Use for testing final build, packaging
3. **Build script auto-updates** `package.json` - No manual changes needed
4. **Both modes work independently** - Switch freely between them
5. **Bytecode is production-only** - Dev uses regular CJS for speed

**Remember:**
- ✅ `pnpm dev` - Daily development
- ✅ `pnpm build` - Before committing/packaging
- ✅ Both should work! If one fails, debug that mode specifically

---

## 📞 Quick Help

**App won't start in production?**
```bash
rm -rf out && pnpm build && npx electron .
```

**Dev mode port issues?**
```bash
# Use production build instead
pnpm build && npx electron .
```

**Changes not reflecting?**
```bash
# Dev mode: Should auto-reload
# If not, restart: Ctrl+C then pnpm dev

# Production: Must rebuild
pnpm build && npx electron .
```

---

**You're all set!** 🎉 Use `pnpm dev` for development and `pnpm build` + `npx electron .` for production testing.

