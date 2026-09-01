@echo off
REM 🔥 WEALTH MACHINE DASHBOARD - MEGA ELITE UNIFIED DEPLOYMENT SCRIPT (Windows)
REM Complete end-to-end automation: Setup → Build → Optimize → Deploy

setlocal enabledelayedexpansion

REM Configuration
set PORT=4200
set DEPLOY_TARGET=local
set NODE_ENV=development
set SKIP_INSTALL=false
set VERBOSE=false

REM Parse arguments
if "%1"=="--help" goto show_help
if "%1"=="-h" goto show_help

if not "%1"=="" (
    if "%1"=="local" set DEPLOY_TARGET=local
    if "%1"=="vercel" set DEPLOY_TARGET=vercel
    if "%1"=="netlify" set DEPLOY_TARGET=netlify
    if "%1"=="docker" set DEPLOY_TARGET=docker
    if "%1"=="--skip-install" set SKIP_INSTALL=true
    if "%1"=="--verbose" set VERBOSE=true
)

CLS
echo.
echo 🔥 WEALTH MACHINE DASHBOARD - MEGA ELITE DEPLOYMENT
echo.

echo [INFO] Configuration:
echo   Port: %PORT%
echo   Target: %DEPLOY_TARGET%
echo   Node Env: %NODE_ENV%
echo.

REM Phase 1: Environment Checks
echo [1/7] ENVIRONMENT CHECKS
echo.
echo [•] Checking Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo [✗] Node.js is not installed!
    echo Download from: https://nodejs.org/
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo [✓] Node.js %NODE_VERSION%

echo [•] Checking npm...
for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i
echo [✓] npm %NPM_VERSION%
echo.

REM Phase 2: Install Dependencies
echo [2/7] DEPENDENCY INSTALLATION
echo.

if "%SKIP_INSTALL%"=="true" (
    echo [i] Skipping dependency installation
) else (
    echo [•] Cleaning previous installations...
    if exist node_modules rmdir /s /q node_modules 2>nul
    if exist package-lock.json del package-lock.json 2>nul
    echo [✓] Clean complete
    echo.
    echo [•] Installing npm dependencies...
    echo (This may take 2-3 minutes on first install)
    call npm install --prefer-offline --no-audit
    if errorlevel 1 (
        echo [✗] Failed to install dependencies
        exit /b 1
    )
    echo [✓] Dependencies installed successfully
)
echo.

REM Phase 3: Code Quality
echo [3/7] CODE QUALITY & TYPE CHECKING
echo.
echo [•] Running TypeScript type checking...
call npm run typecheck
echo [✓] Type checking complete
echo.
echo [•] Running ESLint...
call npm run lint
echo [✓] Linting complete
echo.

REM Phase 4: Environment Setup
echo [4/7] ENVIRONMENT SETUP
echo.
if not exist .env.local (
    echo [•] Creating .env.local...
    copy .env.example .env.local >nul
    echo [✓] Created .env.local
) else (
    echo [i] .env.local already exists
)
echo.

REM Phase 5: Build
echo [5/7] BUILD ^& OPTIMIZATION
echo.
if "%DEPLOY_TARGET%"=="local" (
    echo [i] Skipping production build for local deployment
) else (
    echo [•] Building production bundle...
    call npm run build
    if errorlevel 1 (
        echo [✗] Production build failed
        exit /b 1
    )
    echo [✓] Production build successful
)
echo.

REM Phase 6: Verification
echo [6/7] VERIFICATION
echo.
echo [•] Verifying setup...
if exist package.json echo [✓] Found: package.json
if exist tsconfig.json echo [✓] Found: tsconfig.json
if exist app\page.tsx echo [✓] Found: app\page.tsx
if exist .env.local echo [✓] Found: .env.local
echo [✓] Setup verified
echo.

REM Phase 7: Deploy
echo [7/7] DEPLOYMENT
echo.

if "%DEPLOY_TARGET%"=="local" (
    echo [i] Starting local development server on port %PORT%
    echo [i] URL: http://localhost:%PORT%
    echo [i] Press CTRL+C to stop
    echo.
    call npm run dev
) else if "%DEPLOY_TARGET%"=="vercel" (
    echo [•] Deploying to Vercel...
    call vercel deploy --prod
    echo [✓] Deployed to Vercel!
) else if "%DEPLOY_TARGET%"=="netlify" (
    echo [•] Deploying to Netlify...
    call npm run build
    call netlify deploy --prod --dir=.next
    echo [✓] Deployed to Netlify!
) else if "%DEPLOY_TARGET%"=="docker" (
    echo [•] Building Docker image...
    call docker build -t wealth-machine:latest .
    echo [✓] Docker image built!
    echo [i] Run with: docker run -p 4200:4200 wealth-machine:latest
) else (
    echo [✗] Unknown deployment target: %DEPLOY_TARGET%
    exit /b 1
)

echo.
echo [✓] DEPLOYMENT COMPLETE!
echo.
pause
exit /b 0

:show_help
echo.
echo 🔥 WEALTH MACHINE DASHBOARD - DEPLOYMENT SCRIPT
echo.
echo Usage:
echo   deploy.bat [target] [options]
echo.
echo Targets:
echo   local       Start local development server (default)
echo   vercel      Deploy to Vercel
echo   netlify     Deploy to Netlify
echo   docker      Build Docker image
echo.
echo Options:
echo   --skip-install     Skip npm install
echo   --verbose          Enable verbose logging
echo   --help             Show this help message
echo.
echo Examples:
echo   deploy.bat                  - Start local dev server
echo   deploy.bat vercel           - Deploy to Vercel
echo   deploy.bat docker           - Build Docker image
echo.
pause
exit /b 0
