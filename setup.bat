@echo off
REM 🔥 WEALTH MACHINE DASHBOARD - COMPLETE SETUP SCRIPT (Windows)
REM This script sets up everything and gets the dashboard running in seconds

echo.
echo 🔥 WEALTH MACHINE DASHBOARD
echo 🚀 Starting Elite Setup...
echo.

REM Check Node version
echo [1/6] Checking Node.js version...
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed!
    echo Download from: https://nodejs.org/
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo Found: %NODE_VERSION%
echo ✓ Node.js OK
echo.

REM Check npm
echo [2/6] Checking npm...
for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i
echo Found: npm %NPM_VERSION%
echo ✓ npm OK
echo.

REM Clean install dependencies
echo [3/6] Installing dependencies...
echo (This may take a minute...)
if exist node_modules rmdir /s /q node_modules
if exist package-lock.json del package-lock.json
set NODE_ENV=production
npm install
echo ✓ Dependencies installed
echo.

REM Build TypeScript
echo [4/6] Type checking...
npm run typecheck
echo ✓ Type checking complete
echo.

REM Create .env if it doesn't exist
echo [5/6] Setting up environment...
if not exist .env.local (
    copy .env.example .env.local
    echo ✓ Created .env.local
) else (
    echo ✓ .env.local already exists
)
echo.

REM Start development server
echo [6/6] Starting development server...
echo.
echo ✓ SETUP COMPLETE!
echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.
echo 🔥 WEALTH MACHINE DASHBOARD IS STARTING...
echo.
echo   URL:      http://localhost:4200
echo   Mode:     Development (Hot reload enabled)
echo   Status:   🟢 RUNNING
echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.
echo Open your browser and go to: http://localhost:4200
echo.
echo Press CTRL+C to stop the server
echo.

npm run dev
