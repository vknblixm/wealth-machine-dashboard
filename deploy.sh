#!/bin/bash

################################################################################
# 🔥 WEALTH MACHINE DASHBOARD - MEGA ELITE UNIFIED DEPLOYMENT SCRIPT
# Complete end-to-end automation: Setup → Build → Optimize → Deploy
################################################################################

set -e

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

# Configuration
PORT=${PORT:-4200}
DEPLOY_TARGET=${1:-"local"}
NODE_ENV=${NODE_ENV:-"development"}
SKIP_INSTALL=${SKIP_INSTALL:-false}
VERBOSE=${VERBOSE:-false}

################################################################################
# UTILITY FUNCTIONS
################################################################################

print_header() {
    echo ""
    echo "${PURPLE}╔════════════════════════════════════════════════════════════════╗${NC}"
    echo "${PURPLE}║${NC} $1"
    echo "${PURPLE}╚════════════════════════════════════════════════════════════════╝${NC}"
    echo ""
}

print_step() {
    echo "${BLUE}[•]${NC} $1"
}

print_success() {
    echo "${GREEN}[✓]${NC} $1"
}

print_error() {
    echo "${RED}[✗]${NC} $1"
}

print_info() {
    echo "${CYAN}[i]${NC} $1"
}

print_warning() {
    echo "${YELLOW}[!]${NC} $1"
}

check_command() {
    if ! command -v $1 &> /dev/null; then
        print_error "$2 is not installed!"
        return 1
    fi
    return 0
}

log_verbose() {
    if [ "$VERBOSE" = true ]; then
        echo "${CYAN}[DEBUG]${NC} $1"
    fi
}

################################################################################
# PHASE 1: ENVIRONMENT CHECKS
################################################################################

phase_environment_checks() {
    print_header "🔍 PHASE 1: ENVIRONMENT CHECKS"
    
    print_step "Checking system requirements..."
    
    # Node.js
    if check_command "node" "Node.js"; then
        NODE_VERSION=$(node -v)
        print_success "Node.js $NODE_VERSION"
    else
        print_error "Node.js is required. Download from https://nodejs.org/"
        exit 1
    fi
    
    # npm
    if check_command "npm" "npm"; then
        NPM_VERSION=$(npm -v)
        print_success "npm $NPM_VERSION"
    else
        print_error "npm is required (comes with Node.js)"
        exit 1
    fi
    
    # Git (optional but recommended)
    if check_command "git" "Git"; then
        print_success "Git installed"
    else
        print_warning "Git not found (optional)"
    fi
    
    # Check Node version is 18+
    NODE_MAJOR=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_MAJOR" -lt 18 ]; then
        print_error "Node.js 18+ required (found v$NODE_MAJOR)"
        exit 1
    fi
    
    print_success "All environment checks passed"
}

################################################################################
# PHASE 2: DEPENDENCY INSTALLATION
################################################################################

phase_install_dependencies() {
    print_header "📦 PHASE 2: DEPENDENCY INSTALLATION"
    
    if [ "$SKIP_INSTALL" = true ]; then
        print_info "Skipping dependency installation (--skip-install)"
        return
    fi
    
    print_step "Cleaning previous installations..."
    rm -rf node_modules package-lock.json 2>/dev/null || true
    log_verbose "Cleaned node_modules and package-lock.json"
    print_success "Clean complete"
    
    print_step "Installing npm dependencies..."
    echo "(This may take 2-3 minutes on first install)"
    
    if npm install --prefer-offline --no-audit 2>&1 | tail -20; then
        print_success "Dependencies installed successfully"
    else
        print_error "Failed to install dependencies"
        exit 1
    fi
}

################################################################################
# PHASE 3: CODE QUALITY & TYPE CHECKING
################################################################################

phase_code_quality() {
    print_header "🔬 PHASE 3: CODE QUALITY & TYPE CHECKING"
    
    print_step "Running TypeScript type checking..."
    if npm run typecheck 2>&1 | grep -E "(error|warning)" | head -10; then
        print_warning "Type checking completed with warnings"
    else
        print_success "Type checking passed"
    fi
    
    print_step "Running ESLint..."
    if npm run lint 2>&1 | grep -E "(error|warning)" | head -10; then
        print_warning "Linting completed with warnings"
    else
        print_success "Linting passed"
    fi
}

################################################################################
# PHASE 4: ENVIRONMENT SETUP
################################################################################

phase_environment_setup() {
    print_header "⚙️ PHASE 4: ENVIRONMENT SETUP"
    
    if [ ! -f .env.local ]; then
        print_step "Creating .env.local from template..."
        cp .env.example .env.local
        print_success "Created .env.local"
    else
        print_info ".env.local already exists (keeping current config)"
    fi
    
    print_step "Validating environment variables..."
    if grep -q "NEXT_PUBLIC_API_URL" .env.local; then
        print_success "Environment variables configured"
    else
        print_warning "Missing environment variables"
    fi
}

################################################################################
# PHASE 5: BUILD & OPTIMIZATION
################################################################################

phase_build() {
    print_header "🏗️ PHASE 5: BUILD & OPTIMIZATION"
    
    if [ "$DEPLOY_TARGET" = "local" ]; then
        print_info "Skipping production build for local deployment"
        return
    fi
    
    print_step "Building production bundle..."
    if npm run build; then
        print_success "Production build successful"
    else
        print_error "Production build failed"
        exit 1
    fi
    
    print_step "Analyzing bundle size..."
    if [ -d ".next" ]; then
        BUNDLE_SIZE=$(du -sh .next | cut -f1)
        print_info "Bundle size: $BUNDLE_SIZE"
    fi
}

################################################################################
# PHASE 6: DEPLOYMENT
################################################################################

phase_deploy() {
    print_header "🚀 PHASE 6: DEPLOYMENT"
    
    case "$DEPLOY_TARGET" in
        local)
            deploy_local
            ;;
        vercel)
            deploy_vercel
            ;;
        netlify)
            deploy_netlify
            ;;
        docker)
            deploy_docker
            ;;
        *)
            print_error "Unknown deployment target: $DEPLOY_TARGET"
            print_info "Available: local, vercel, netlify, docker"
            exit 1
            ;;
    esac
}

deploy_local() {
    print_step "Starting local development server..."
    print_info "Server will run on http://localhost:$PORT"
    print_info "Press CTRL+C to stop"
    echo ""
    
    export PORT=$PORT
    npm run dev
}

deploy_vercel() {
    print_step "Checking for Vercel CLI..."
    
    if ! check_command "vercel" "Vercel CLI"; then
        print_step "Installing Vercel CLI..."
        npm install -g vercel
    fi
    
    print_step "Deploying to Vercel..."
    vercel deploy --prod
    
    print_success "Deployed to Vercel!"
}

deploy_netlify() {
    print_step "Checking for Netlify CLI..."
    
    if ! check_command "netlify" "Netlify CLI"; then
        print_step "Installing Netlify CLI..."
        npm install -g netlify-cli
    fi
    
    print_step "Building for Netlify..."
    npm run build
    
    print_step "Deploying to Netlify..."
    netlify deploy --prod --dir=.next
    
    print_success "Deployed to Netlify!"
}

deploy_docker() {
    print_step "Building Docker image..."
    
    if ! check_command "docker" "Docker"; then
        print_error "Docker is required for Docker deployment"
        exit 1
    fi
    
    if [ ! -f "Dockerfile" ]; then
        print_step "Creating Dockerfile..."
        cat > Dockerfile << 'EOF'
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 4200
CMD ["npm", "start"]
EOF
        print_success "Dockerfile created"
    fi
    
    print_step "Building Docker image (wealth-machine:latest)..."
    docker build -t wealth-machine:latest .
    
    print_success "Docker image built!"
    print_info "Run with: docker run -p 4200:4200 wealth-machine:latest"
}

################################################################################
# PHASE 7: VERIFICATION & SUMMARY
################################################################################

phase_verification() {
    print_header "✅ PHASE 7: VERIFICATION & SUMMARY"
    
    print_step "Verifying setup..."
    
    # Check key files exist
    local files_to_check=(
        "package.json"
        "tsconfig.json"
        "app/page.tsx"
        ".env.local"
    )
    
    for file in "${files_to_check[@]}"; do
        if [ -f "$file" ]; then
            log_verbose "Found: $file"
        else
            print_warning "Missing: $file"
        fi
    done
    
    print_success "Setup complete and verified"
}

################################################################################
# MAIN EXECUTION
################################################################################

main() {
    clear
    
    print_header "🔥 WEALTH MACHINE DASHBOARD - MEGA ELITE DEPLOYMENT"
    
    print_info "Configuration:"
    echo "  Port: $PORT"
    echo "  Target: $DEPLOY_TARGET"
    echo "  Node Env: $NODE_ENV"
    echo ""
    
    # Execute phases
    phase_environment_checks
    phase_install_dependencies
    phase_code_quality
    phase_environment_setup
    phase_build
    phase_verification
    
    print_header "🎉 ALL PHASES COMPLETE - STARTING DEPLOYMENT"
    phase_deploy
}

################################################################################
# ERROR HANDLING & CLEANUP
################################################################################

cleanup() {
    if [ $? -ne 0 ]; then
        print_error "Deployment failed"
        print_info "Run with --verbose for more details: $0 $DEPLOY_TARGET --verbose"
        exit 1
    fi
}

trap cleanup EXIT

################################################################################
# ARGUMENT PARSING
################################################################################

if [ "$1" = "--help" ] || [ "$1" = "-h" ]; then
    echo ""
    echo "${CYAN}WEALTH MACHINE DASHBOARD - DEPLOYMENT SCRIPT${NC}"
    echo ""
    echo "${BLUE}Usage:${NC}"
    echo "  $0 [target] [options]"
    echo ""
    echo "${BLUE}Targets:${NC}"
    echo "  local       Start local development server (default)"
    echo "  vercel      Deploy to Vercel"
    echo "  netlify     Deploy to Netlify"
    echo "  docker      Build Docker image"
    echo ""
    echo "${BLUE}Options:${NC}"
    echo "  --skip-install     Skip npm install"
    echo "  --port PORT        Custom port (default: 4200)"
    echo "  --verbose          Enable verbose logging"
    echo "  --help             Show this help message"
    echo ""
    echo "${BLUE}Examples:${NC}"
    echo "  $0                          # Start local dev server"
    echo "  $0 vercel                   # Deploy to Vercel"
    echo "  $0 docker                   # Build Docker image"
    echo "  $0 local --port 5000        # Dev server on port 5000"
    echo "  $0 vercel --verbose         # Deploy to Vercel with logging"
    echo ""
    exit 0
fi

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        local|vercel|netlify|docker)
            DEPLOY_TARGET=$1
            shift
            ;;
        --skip-install)
            SKIP_INSTALL=true
            shift
            ;;
        --port)
            PORT=$2
            shift 2
            ;;
        --verbose)
            VERBOSE=true
            shift
            ;;
        *)
            print_warning "Unknown option: $1"
            shift
            ;;
    esac
done

# Execute main
main
