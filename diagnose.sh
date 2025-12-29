#!/bin/bash

# 🔍 OKR Platform - Quick Diagnostics Script
# This script runs quick checks to diagnose common issues

echo "🚀 OKR Platform - Quick Diagnostics"
echo "===================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check 1: Environment file
echo "📋 Check 1: Environment Configuration"
echo "--------------------------------------"
if [ -f ".env" ]; then
    echo -e "${GREEN}✅ .env file exists${NC}"
    
    if grep -q "VITE_SUPABASE_URL" .env; then
        URL=$(grep VITE_SUPABASE_URL .env | cut -d '=' -f2)
        echo -e "${GREEN}✅ VITE_SUPABASE_URL found: ${URL}${NC}"
    else
        echo -e "${RED}❌ VITE_SUPABASE_URL not found${NC}"
    fi
    
    if grep -q "VITE_SUPABASE_ANON_KEY" .env; then
        KEY=$(grep VITE_SUPABASE_ANON_KEY .env | cut -d '=' -f2)
        if [[ $KEY == eyJ* ]]; then
            echo -e "${GREEN}✅ VITE_SUPABASE_ANON_KEY format is correct (starts with eyJ)${NC}"
            echo -e "   ${BLUE}Key: ${KEY:0:30}...${NC}"
        else
            echo -e "${RED}❌ VITE_SUPABASE_ANON_KEY format is WRONG${NC}"
            echo -e "   ${YELLOW}Current: ${KEY}${NC}"
            echo -e "   ${YELLOW}Should start with: eyJ...${NC}"
        fi
    else
        echo -e "${RED}❌ VITE_SUPABASE_ANON_KEY not found${NC}"
    fi
else
    echo -e "${RED}❌ .env file does not exist${NC}"
    echo -e "${YELLOW}Create .env file with:${NC}"
    echo "VITE_SUPABASE_URL=your_url"
    echo "VITE_SUPABASE_ANON_KEY=your_key"
fi
echo ""

# Check 2: Dependencies
echo "📦 Check 2: Node Modules"
echo "--------------------------------------"
if [ -d "node_modules" ]; then
    echo -e "${GREEN}✅ node_modules exists${NC}"
    
    if [ -d "node_modules/@supabase/supabase-js" ]; then
        echo -e "${GREEN}✅ @supabase/supabase-js installed${NC}"
    else
        echo -e "${RED}❌ @supabase/supabase-js not found${NC}"
        echo -e "${YELLOW}Run: npm install${NC}"
    fi
else
    echo -e "${RED}❌ node_modules not found${NC}"
    echo -e "${YELLOW}Run: npm install${NC}"
fi
echo ""

# Check 3: Required files
echo "📁 Check 3: Required Files"
echo "--------------------------------------"
files=(
    "src/lib/supabase.ts"
    "src/lib/okr-service.ts"
    "src/lib/types.ts"
    "src/contexts/AuthContext.tsx"
    "src/components/LoginPage.tsx"
    "src/components/ProtectedRoute.tsx"
    "supabase-schema.sql"
)

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✅ $file${NC}"
    else
        echo -e "${RED}❌ $file not found${NC}"
    fi
done
echo ""

# Check 4: Dev server status
echo "🖥️  Check 4: Development Server"
echo "--------------------------------------"
if lsof -Pi :5173 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo -e "${GREEN}✅ Server running on port 5173${NC}"
    echo -e "   ${BLUE}URL: http://localhost:5173${NC}"
elif lsof -Pi :5174 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo -e "${GREEN}✅ Server running on port 5174${NC}"
    echo -e "   ${BLUE}URL: http://localhost:5174${NC}"
elif lsof -Pi :5175 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo -e "${GREEN}✅ Server running on port 5175${NC}"
    echo -e "   ${BLUE}URL: http://localhost:5175${NC}"
else
    echo -e "${YELLOW}⚠️  Dev server not running${NC}"
    echo -e "${YELLOW}Run: npm run dev${NC}"
fi
echo ""

# Check 5: Build status
echo "🔨 Check 5: TypeScript Compilation"
echo "--------------------------------------"
if npm run build --dry-run 2>&1 | grep -q "error"; then
    echo -e "${RED}❌ TypeScript errors found${NC}"
    echo -e "${YELLOW}Run: npm run build to see details${NC}"
else
    echo -e "${GREEN}✅ No TypeScript errors (check with 'npm run build')${NC}"
fi
echo ""

# Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 SUMMARY"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "${BLUE}Next Steps:${NC}"
echo ""
echo "1. 🔍 Test Connection:"
echo -e "   ${YELLOW}open test-connection.html${NC}"
echo ""
echo "2. 🚀 Start Dev Server (if not running):"
echo -e "   ${YELLOW}npm run dev${NC}"
echo ""
echo "3. 🌐 Open Application:"
echo -e "   ${YELLOW}open http://localhost:5174${NC}"
echo ""
echo "4. 📖 Read Testing Guide:"
echo -e "   ${YELLOW}cat TESTING_GUIDE.md${NC}"
echo ""
echo "5. 🗄️  Check Database Schema:"
echo -e "   ${YELLOW}Go to Supabase Dashboard → SQL Editor${NC}"
echo -e "   ${YELLOW}Run: supabase-schema.sql${NC}"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
