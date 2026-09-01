#!/bin/bash

# 🔥 WEALTH MACHINE DASHBOARD - PRODUCTION BUILDER SCRIPT
# Builds and optimizes for production deployment

set -e

echo "🔥 WEALTH MACHINE - PRODUCTION BUILD"
echo ""

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo "${BLUE}[1/5]${NC} Cleaning previous builds..."
rm -rf .next out dist 2>/dev/null || true
echo "${GREEN}✓ Clean complete${NC}"
echo ""

echo "${BLUE}[2/5]${NC} Type checking..."
npm run typecheck
echo "${GREEN}✓ Type checking passed${NC}"
echo ""

echo "${BLUE}[3/5]${NC} Linting code..."
npm run lint || true
echo "${GREEN}✓ Linting complete${NC}"
echo ""

echo "${BLUE}[4/5]${NC} Building production bundle..."
npm run build
echo "${GREEN}✓ Build complete${NC}"
echo ""

echo "${BLUE}[5/5]${NC} Build summary..."
echo ""
echo "${GREEN}✓ PRODUCTION BUILD READY!${NC}"
echo ""
echo "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "Deploy with:"
echo "  ${BLUE}npm start${NC}         - Start production server locally"
echo "  ${BLUE}vercel deploy${NC}     - Deploy to Vercel"
echo "  ${BLUE}netlify deploy${NC}    - Deploy to Netlify"
echo ""
echo "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
