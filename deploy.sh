#!/bin/bash

# 🚀 Quick Deploy Script for GitHub Pages
# This script automates the deployment process

set -e  # Exit on error

echo "
╔══════════════════════════════════════════════════════════════════════╗
║                                                                      ║
║           🚀 OKR Platform - Deploy to GitHub Pages                  ║
║                                                                      ║
╚══════════════════════════════════════════════════════════════════════╝
"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}📋 Pre-deployment Checklist${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check 1: Node modules installed
if [ -d "node_modules" ]; then
    echo -e "${GREEN}✅ node_modules exists${NC}"
else
    echo -e "${YELLOW}⚠️  node_modules not found. Running npm install...${NC}"
    npm install
fi

# Check 2: .env file exists
if [ -f ".env" ]; then
    echo -e "${GREEN}✅ .env file exists${NC}"
else
    echo -e "${RED}❌ .env file not found!${NC}"
    echo -e "${YELLOW}Please create .env with Supabase credentials${NC}"
    exit 1
fi

# Check 3: gh-pages installed
if npm list gh-pages &>/dev/null; then
    echo -e "${GREEN}✅ gh-pages package installed${NC}"
else
    echo -e "${YELLOW}⚠️  Installing gh-pages...${NC}"
    npm install --save-dev gh-pages
fi

# Check 4: Git repository status
if git rev-parse --git-dir > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Git repository initialized${NC}"
else
    echo -e "${RED}❌ Not a git repository!${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}🔨 Building Project${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Build the project
if npm run build; then
    echo -e "${GREEN}✅ Build successful!${NC}"
else
    echo -e "${RED}❌ Build failed!${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}📦 Checking Build Output${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ -d "dist" ]; then
    echo -e "${GREEN}✅ dist/ folder created${NC}"
    echo -e "${BLUE}   Files in dist/:${NC}"
    ls -lh dist/ | head -10
else
    echo -e "${RED}❌ dist/ folder not found!${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}🚀 Deploying to GitHub Pages${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Deploy using gh-pages
if npx gh-pages -d dist; then
    echo ""
    echo -e "${GREEN}✅ Deployment successful!${NC}"
    echo ""
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}🎉 Your app is deployed!${NC}"
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo -e "${BLUE}📍 Live URL:${NC}"
    echo -e "${GREEN}   https://long-dx-gh.github.io/OKR-Management/${NC}"
    echo ""
    echo -e "${YELLOW}⏱  Note: GitHub Pages may take 1-2 minutes to update${NC}"
    echo ""
    echo -e "${BLUE}📋 Next Steps:${NC}"
    echo "   1. Wait 1-2 minutes for GitHub Pages to deploy"
    echo "   2. Visit the URL above"
    echo "   3. Test login and features"
    echo "   4. Share with your team! 🎊"
    echo ""
else
    echo -e "${RED}❌ Deployment failed!${NC}"
    echo -e "${YELLOW}Check the error messages above${NC}"
    exit 1
fi

# Check if GitHub Pages is enabled
echo -e "${BLUE}💡 Tip:${NC}"
echo "   If this is your first deployment, enable GitHub Pages:"
echo "   1. Go to: https://github.com/long-dx-gh/OKR-Management/settings/pages"
echo "   2. Source: Deploy from a branch"
echo "   3. Branch: gh-pages"
echo "   4. Save"
echo ""
