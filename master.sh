#!/bin/bash

################################################################################
# 🔥 WEALTH MACHINE - ULTIMATE MASTER ORCHESTRATOR
# Complete automated system for setup, deployment, and management
################################################################################

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
NC='\033[0m'

# Version
VERSION="1.0.0-elite"
PROJECT_NAME="WEALTH MACHINE DASHBOARD"

################################################################################
# DISPLAY FUNCTIONS
################################################################################

display_banner() {
    clear
    echo ""
    echo "${PURPLE}"
    echo "  ███████  ██████   ██████   ████  ██████  ██  ██
  ██      ██    ██  ██      ██  ██  ██    ██  ██
  ██████  ██████   █████   ████  █████   ██  ██
      ██ ██         ██  ██    ██      ██  ██  ██
  ██████  ██    ██  ██████  ██████  ██  ██
  ${NC}"
    echo "${CYAN}   Cinematic 3D Interactive Revenue Hunting System${NC}"
    echo "${GREEN}   🔥 Ruthless Money Machine Operating System${NC}"
    echo ""
    echo "${YELLOW}   Version: $VERSION${NC}"
    echo ""
}

show_menu() {
    echo ""
    echo "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
    echo "${BLUE}║${NC} ${WHITE}MAIN MENU${NC}${BLUE}                                                      ║${NC}"
    echo "${BLUE}╠════════════════════════════════════════════════════════════╣${NC}"
    echo "${BLUE}║${NC}"
    echo "${BLUE}║${NC}  ${GREEN}1${NC} ${WHITE}⚡ Quick Start${NC} (Install & Run Locally)"
    echo "${BLUE}║${NC}  ${GREEN}2${NC} ${WHITE}🚀 Deploy to Vercel${NC}"
    echo "${BLUE}║${NC}  ${GREEN}3${NC} ${WHITE}📡 Deploy to Netlify${NC}"
    echo "${BLUE}║${NC}  ${GREEN}4${NC} ${WHITE}🐳 Build Docker Image${NC}"
    echo "${BLUE}║${NC}  ${GREEN}5${NC} ${WHITE}🔧 Development Setup${NC}"
    echo "${BLUE}║${NC}  ${GREEN}6${NC} ${WHITE}🏗️ Production Build${NC}"
    echo "${BLUE}║${NC}  ${GREEN}7${NC} ${WHITE}🧹 Clean & Reset${NC}"
    echo "${BLUE}║${NC}  ${GREEN}8${NC} ${WHITE}📚 View Documentation${NC}"
    echo "${BLUE}║${NC}  ${GREEN}9${NC} ${WHITE}ℹ️ System Information${NC}"
    echo "${BLUE}║${NC}  ${GREEN}0${NC} ${WHITE}❌ Exit${NC}"
    echo "${BLUE}║${NC}"
    echo "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -n "${CYAN}Select option [0-9]:${NC} "
}

print_section() {
    echo ""
    echo "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo "${GREEN}$1${NC}"
    echo "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
}

print_status() {
    echo "${GREEN}[✓]${NC} $1"
}

print_step() {
    echo "${BLUE}[•]${NC} $1"
}

print_error() {
    echo "${RED}[✗]${NC} $1"
}

print_info() {
    echo "${CYAN}[ℹ]${NC} $1"
}

print_success() {
    echo ""
    echo "${GREEN}╔$(printf '═%.0s' {1..60})╗${NC}"
    echo "${GREEN}║${NC}  ✨ $1"
    echo "${GREEN}╚$(printf '═%.0s' {1..60})╝${NC}"
    echo ""
}

################################################################################
# CORE FUNCTIONS
################################################################################

quick_start() {
    print_section "⚡ QUICK START - INSTALL & RUN"
    
    print_step "Checking prerequisites..."
    if ! command -v node &> /dev/null; then
        print_error "Node.js not found"
        print_info "Download: https://nodejs.org/"
        return 1
    fi
    print_status "Node.js $(node -v) found"
    
    print_step "Installing dependencies..."
    npm install --prefer-offline --no-audit > /dev/null 2>&1
    print_status "Dependencies installed"
    
    print_step "Type checking..."
    npm run typecheck > /dev/null 2>&1 || true
    print_status "Type check complete"
    
    print_step "Creating .env.local..."
    [ ! -f .env.local ] && cp .env.example .env.local
    print_status "Environment configured"
    
    print_success "Setup Complete! Starting server on http://localhost:4200"
    print_info "Press CTRL+C to stop"
    echo ""
    npm run dev
}

deploy_vercel() {
    print_section "🚀 DEPLOY TO VERCEL"
    
    if ! command -v vercel &> /dev/null; then
        print_step "Installing Vercel CLI..."
        npm install -g vercel
    fi
    
    print_step "Building for production..."
    npm run build
    print_status "Build complete"
    
    print_step "Deploying to Vercel..."
    vercel deploy --prod
    
    print_success "Deployed to Vercel!"
}

deploy_netlify() {
    print_section "📡 DEPLOY TO NETLIFY"
    
    if ! command -v netlify &> /dev/null; then
        print_step "Installing Netlify CLI..."
        npm install -g netlify-cli
    fi
    
    print_step "Building for production..."
    npm run build
    print_status "Build complete"
    
    print_step "Deploying to Netlify..."
    netlify deploy --prod --dir=.next
    
    print_success "Deployed to Netlify!"
}

build_docker() {
    print_section "🐳 BUILD DOCKER IMAGE"
    
    if ! command -v docker &> /dev/null; then
        print_error "Docker not found"
        print_info "Download: https://www.docker.com/"
        return 1
    fi
    
    if [ ! -f "Dockerfile" ]; then
        print_error "Dockerfile not found"
        return 1
    fi
    
    print_step "Building Docker image..."
    docker build -t wealth-machine:latest . || return 1
    print_status "Docker image built"
    
    print_success "Docker Image Ready!"
    print_info "Run: docker run -p 4200:4200 wealth-machine:latest"
}

dev_setup() {
    print_section "🔧 DEVELOPMENT SETUP"
    
    print_step "Cleaning..."
    rm -rf node_modules .next package-lock.json 2>/dev/null || true
    
    print_step "Installing dependencies..."
    npm install
    
    print_step "Setting up environment..."
    [ ! -f .env.local ] && cp .env.example .env.local
    
    print_success "Development Setup Complete!"
    echo ""
    echo "Next steps:"
    echo "  ${CYAN}npm run dev${NC}         - Start development server"
    echo "  ${CYAN}npm run build${NC}       - Build for production"
    echo "  ${CYAN}npm run typecheck${NC}   - Check types"
    echo ""
}

production_build() {
    print_section "🏗️ PRODUCTION BUILD"
    
    print_step "Type checking..."
    npm run typecheck || return 1
    print_status "Type check passed"
    
    print_step "Linting..."
    npm run lint 2>/dev/null || true
    print_status "Linting complete"
    
    print_step "Building production bundle..."
    npm run build || return 1
    print_status "Build complete"
    
    if [ -d ".next" ]; then
        SIZE=$(du -sh .next | cut -f1)
        print_info "Bundle size: $SIZE"
    fi
    
    print_success "Production Build Ready!"
    print_info "Run: npm start"
}

clean_reset() {
    print_section "🧹 CLEAN & RESET"
    
    echo -n "${YELLOW}Remove node_modules? [y/N]:${NC} "
    read -r response
    if [ "$response" = "y" ] || [ "$response" = "Y" ]; then
        print_step "Removing node_modules..."
        rm -rf node_modules package-lock.json
        print_status "Removed"
    fi
    
    echo -n "${YELLOW}Remove .next build? [y/N]:${NC} "
    read -r response
    if [ "$response" = "y" ] || [ "$response" = "Y" ]; then
        print_step "Removing .next..."
        rm -rf .next
        print_status "Removed"
    fi
    
    echo -n "${YELLOW}Reset .env.local? [y/N]:${NC} "
    read -r response
    if [ "$response" = "y" ] || [ "$response" = "Y" ]; then
        print_step "Resetting .env.local..."
        cp .env.example .env.local
        print_status "Reset"
    fi
    
    print_success "Clean & Reset Complete!"
}

show_docs() {
    print_section "📚 DOCUMENTATION"
    
    if [ -f "README.md" ]; then
        less README.md
    else
        print_error "README.md not found"
    fi
}

show_info() {
    print_section "ℹ️ SYSTEM INFORMATION"
    
    echo "${CYAN}Project:${NC}"
    echo "  Name: $PROJECT_NAME"
    echo "  Version: $VERSION"
    echo ""
    
    echo "${CYAN}System:${NC}"
    echo "  OS: $(uname -s)"
    echo "  Node: $(node -v)"
    echo "  npm: $(npm -v)"
    echo ""
    
    if command -v git &> /dev/null; then
        echo "${CYAN}Git:${NC}"
        echo "  Branch: $(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo 'N/A')"
        echo "  Commit: $(git rev-parse --short HEAD 2>/dev/null || echo 'N/A')"
        echo ""
    fi
    
    echo "${CYAN}Project Files:${NC}"
    [ -f "package.json" ] && echo "  ✓ package.json"
    [ -f "tsconfig.json" ] && echo "  ✓ tsconfig.json"
    [ -f "tailwind.config.ts" ] && echo "  ✓ tailwind.config.ts"
    [ -f ".env.local" ] && echo "  ✓ .env.local"
    [ -f "Dockerfile" ] && echo "  ✓ Dockerfile"
    echo ""
    
    echo "${CYAN}Dependencies Status:${NC}"
    if [ -d "node_modules" ]; then
        PACKAGE_COUNT=$(ls -1 node_modules | wc -l)
        echo "  ✓ $PACKAGE_COUNT packages installed"
    else
        echo "  ✗ node_modules not found (run: npm install)"
    fi
    echo ""
}

################################################################################
# MAIN LOOP
################################################################################

main_loop() {
    while true; do
        display_banner
        show_menu
        read -r choice
        
        case $choice in
            1)
                quick_start
                ;;
            2)
                deploy_vercel
                ;;
            3)
                deploy_netlify
                ;;
            4)
                build_docker
                ;;
            5)
                dev_setup
                ;;
            6)
                production_build
                ;;
            7)
                clean_reset
                ;;
            8)
                show_docs
                ;;
            9)
                show_info
                ;;
            0)
                echo ""
                echo "${PURPLE}Exiting Wealth Machine Dashboard${NC}"
                echo "${CYAN}Keep hunting money! 🔥${NC}"
                echo ""
                exit 0
                ;;
            *)
                print_error "Invalid option"
                echo ""
                read -p "Press Enter to continue..."
                ;;
        esac
    done
}

################################################################################
# ENTRY POINT
################################################################################

if [ "$1" = "--help" ] || [ "$1" = "-h" ]; then
    display_banner
    echo "${CYAN}Usage:${NC}"
    echo "  $0              Interactive menu"
    echo "  $0 quick        Quick start"
    echo "  $0 deploy-v     Deploy to Vercel"
    echo "  $0 deploy-n     Deploy to Netlify"
    echo "  $0 docker       Build Docker image"
    echo "  $0 dev          Development setup"
    echo "  $0 build        Production build"
    echo "  $0 clean        Clean & reset"
    echo "  $0 info         System information"
    echo ""
    exit 0
elif [ $# -gt 0 ]; then
    case $1 in
        quick)
            display_banner
            quick_start
            ;;
        deploy-v)
            display_banner
            deploy_vercel
            ;;
        deploy-n)
            display_banner
            deploy_netlify
            ;;
        docker)
            display_banner
            build_docker
            ;;
        dev)
            display_banner
            dev_setup
            ;;
        build)
            display_banner
            production_build
            ;;
        clean)
            display_banner
            clean_reset
            ;;
        info)
            display_banner
            show_info
            ;;
        *)
            display_banner
            print_error "Unknown command: $1"
            echo ""
            $0 --help
            exit 1
            ;;
    esac
else
    main_loop
fi
