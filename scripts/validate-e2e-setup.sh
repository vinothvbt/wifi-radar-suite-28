#!/bin/bash

# WiFi Radar Suite - E2E Test Validation Script
# 
# This script validates that Playwright E2E testing is properly configured
# and can be run in a real environment with browser support.

set -e

echo "🔍 WiFi Radar Suite - E2E Test Validation"
echo "========================================"

# Check if Playwright is installed
echo "📦 Checking Playwright installation..."
if npx playwright --version; then
    echo "✅ Playwright is installed"
else
    echo "❌ Playwright not found. Run: npm install"
    exit 1
fi

# Check if browsers are installed
echo "🌐 Checking browser installation..."
if npx playwright install --list | grep -q 'chromium'; then
    echo "✅ Chromium browser is available"
else
    echo "⚠️  Installing Chromium browser..."
    npx playwright install chromium
fi

# Check test configuration
echo "⚙️  Checking test configuration..."
if [ -f "playwright.config.ts" ]; then
    echo "✅ playwright.config.ts found"
else
    echo "❌ playwright.config.ts missing"
    exit 1
fi

# Check test files
echo "📝 Checking test files..."
if [ -d "e2e" ]; then
    echo "✅ e2e directory found"
    if [ -f "e2e/scan.spec.ts" ]; then
        echo "✅ scan.spec.ts test file found"
    else
        echo "❌ scan.spec.ts missing"
        exit 1
    fi
else
    echo "❌ e2e directory missing"
    exit 1
fi

# Check screenshots directory
echo "📸 Checking screenshots directory..."
if [ -d "e2e/screenshots" ]; then
    echo "✅ Screenshots directory found"
else
    echo "❌ Creating screenshots directory..."
    mkdir -p e2e/screenshots
fi

# List available tests
echo "📋 Available tests:"
npx playwright test --list

echo ""
echo "🚀 Ready to run E2E tests!"
echo "Commands to try:"
echo "  npm run test:ui          # Run all tests (headless)"
echo "  npm run test:ui:headed   # Run with visible browser"
echo "  npm run test:ui:debug    # Debug tests step-by-step"
echo ""
echo "📸 Screenshots will be saved to: e2e/screenshots/"
echo "📊 Test reports available at: playwright-report/"

# Check if frontend server is running
if curl -s http://localhost:8080 > /dev/null 2>&1; then
    echo "✅ Frontend server is running on port 8080"
else
    echo "⚠️  Frontend server not detected. Start with: npm run frontend"
fi