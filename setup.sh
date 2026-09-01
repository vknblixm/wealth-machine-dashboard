#!/bin/bash

# 🔥 WEALTH MACHINE DASHBOARD - COMPLETE SETUP SCRIPT
# This script sets up everything and gets the dashboard running in seconds

set -e

echo "🔥 WEALTH MACHINE DASHBOARD"
echo "🚀 Starting Elite Setup..."
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check Node version
echo "${BLUE}[1/6]${NC} Checking Node.js version..."
NODE_VERSION=$(node -v)
echo "Found: $NODE_VERSION"

if ! command -v node &> /dev/null; then
    echo "${RED}❌ Node.js is not installed!${NC}"
    echo "Download from: https://nodejs.org/"
    exit 1
fi

echo "${GREEN}✓ Node.js OK${NC}"
echo ""

# Check npm
echo "${BLUE}[2/6]${NC} Checking npm..."
NPM_VERSION=$(npm -v)
echo "Found: npm $NPM_VERSION"
echo "${GREEN}✓ npm OK${NC}"
echo ""

# Clean install dependencies
echo "${BLUE}[3/6]${NC} Installing dependencies..."
echo "(This may take a minute...)"
rm -rf node_modules package-lock.json 2>/dev/null || true
npm install
echo "${GREEN}✓ Dependencies installed${NC}"
echo ""

# Build TypeScript
echo "${BLUE}[4/6]${NC} Type checking..."
npm run typecheck
echo "${GREEN}✓ Type checking complete${NC}"
echo ""

# Create .env if it doesn't exist
echo "${BLUE}[5/6]${NC} Setting up environment..."
if [ ! -f .env.local ]; then
    cp .env.example .env.local
    echo "${GREEN}✓ Created .env.local${NC}"
else
    echo "${GREEN}✓ .env.local already exists${NC}"
fi
echo ""

# Start development server
echo "${BLUE}[6/6]${NC} Starting development server..."
echo ""
echo "${GREEN}✓ SETUP COMPLETE!${NC}"
echo ""
echo "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "🔥 WEALTH MACHINE DASHBOARD IS STARTING..."
echo ""
echo "  ${BLUE}URL:${NC}      http://localhost:4200"
echo "  ${BLUE}Mode:${NC}     Development (Hot reload enabled)"
echo "  ${BLUE}Status:${NC}   🟢 RUNNING"
echo ""
echo "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "Open your browser and go to: ${BLUE}http://localhost:4200${NC}"
echo ""
echo "Press ${YELLOW}CTRL+C${NC} to stop the server"
echo ""

npm run dev
