# 🔥 WEALTH MACHINE DASHBOARD - FULL SETUP & RUN GUIDE

## 🚀 ONE-COMMAND SETUP

### macOS / Linux
```bash
bash setup.sh
```

### Windows
```cmd
setup.bat
```

This automatically:
✅ Checks Node.js installation
✅ Installs all dependencies
✅ Type checks everything
✅ Creates .env.local
✅ Starts dev server
✅ Opens http://localhost:4200

---

## 📦 MANUAL SETUP (if scripts don't work)

```bash
# 1. Install dependencies
npm install

# 2. Type check
npm run typecheck

# 3. Start dev server
npm run dev

# 4. Open in browser
# http://localhost:4200
```

---

## 🏗️ PRODUCTION BUILD

### Full automated build:
```bash
bash build.sh
```

OR manually:
```bash
# Type check
npm run typecheck

# Build
npm run build

# Start production server
npm start
```

---

## ☁️ DEPLOYMENT OPTIONS

### 1. **Vercel** (Recommended)
```bash
npm i -g vercel
vercel login
vercel deploy --prod
```

### 2. **Netlify**
```bash
npm i -g netlify-cli
netlify login
netlify deploy --prod
```

### 3. **Docker**
```bash
docker build -t wealth-machine .
docker run -p 4200:4200 wealth-machine
```

### 4. **Self-hosted**
```bash
npm run build
npm start  # Server runs on port 4200
```

---

## 🔧 ENVIRONMENT VARIABLES

Create `.env.local`:

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:4200

# WebSocket (for real-time updates)
NEXT_PUBLIC_WS_URL=http://localhost:4200

# Agent settings
NEXT_PUBLIC_AGENT_UPDATE_INTERVAL=1000

# Revenue tracking
NEXT_PUBLIC_BASE_REVENUE=0
NEXT_PUBLIC_REVENUE_MULTIPLIER=1
```

---

## 📊 CUSTOMIZATION

### Change Colors
Edit `lib/colors.ts`:
```typescript
export const COLORS = {
  neon: {
    green: '#00ff41',  // Change these
    red: '#ff006e',
    blue: '#00d9ff',
    ...
  }
}
```

### Modify Revenue Streams
Edit `lib/revenue-tracker.ts`:
```typescript
const streams: RevenueStream[] = [
  {
    name: 'Your Stream Name',
    type: 'consulting',
    hourlyTarget: 1000,  // Adjust targets
    ...
  }
]
```

### Adjust Agent Behavior
Edit `lib/agent-simulator.ts`:
```typescript
export function simulateAgentActivity(agent: Agent) {
  // Modify simulation logic here
}
```

---

## 🐛 TROUBLESHOOTING

### Port 4200 already in use
```bash
# macOS/Linux: Kill process on port 4200
lsof -ti:4200 | xargs kill -9

# Windows: Find and kill in Task Manager
```

### Dependencies won't install
```bash
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

### Build fails
```bash
npm run typecheck  # Check for TS errors
npm run lint       # Check for lint errors
npm run build      # Build again
```

### Hot reload not working
Restart the dev server:
```bash
# Kill it (CTRL+C)
npm run dev  # Restart
```

---

## 📈 PERFORMANCE TIPS

- **Development**: Leave as-is, hot reload handles changes
- **Production**: Use `npm run build && npm start`
- **CI/CD**: Add to GitHub Actions or GitLab CI
- **Caching**: Next.js automatically optimizes

---

## 🚀 NEXT STEPS

1. **Customize branding** - Change colors, add logo
2. **Connect real data** - Integrate with Stripe, HubSpot, Slack
3. **Add authentication** - Supabase, Auth0, Firebase
4. **Deploy live** - Use Vercel, Netlify, or your own server
5. **Add features** - Export reports, advanced filtering, etc.

---

## 💡 PRO TIPS

- Dashboard updates every 2 seconds (configurable in `app/page.tsx`)
- All animations run at 60fps with GPU acceleration
- No external APIs required - works offline with simulated data
- Fully type-safe TypeScript codebase
- Easy to extend with new components

---

**Questions?** Check GitHub issues or create a new one.

**Ready to hunt money?** 🔥🚀
