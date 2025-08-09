import { test, expect } from '@playwright/test';

/**
 * WiFi Radar Suite - Main Scan Workflow E2E Test
 * 
 * This test covers the complete user journey:
 * 1. Interface detection and selection
 * 2. Starting WiFi scan
 * 3. Viewing network results
 * 4. Stopping scan/auto-refresh
 * 
 * Screenshots are captured at each key step for documentation purposes.
 */
test.describe('WiFi Scanner Main Workflow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the scan page
    await page.goto('/');
    
    // Wait for the page to load completely
    await page.waitForLoadState('networkidle');
  });

  test('should complete full scan workflow with screenshots', async ({ page }) => {
    // Step 1: Verify page loads and take initial screenshot
    await expect(page.locator('h1')).toContainText('WiFi Scanner');
    await page.screenshot({ 
      path: 'e2e/screenshots/01-initial-page-load.png',
      fullPage: true 
    });

    // Step 2: Check API connection status
    const apiStatus = page.locator('[data-testid="api-status"], .text-green-600, .text-red-600').first();
    await expect(apiStatus).toBeVisible();
    
    // Take screenshot of API status
    await page.screenshot({ 
      path: 'e2e/screenshots/02-api-connection-status.png',
      fullPage: true 
    });

    // Step 3: Interface Detection - Check if interfaces are loaded
    const interfaceSection = page.locator('text=Network Interfaces').first();
    await expect(interfaceSection).toBeVisible();
    
    // Wait for interfaces to load (they might be loading from API)
    // Wait for at least one interface row/item to appear (adjust selector as needed)
    await page.waitForSelector('[data-testid="interface-row"], .interface-row, li, tr');
    
    // Take screenshot of interface selection
    await page.screenshot({ 
      path: 'e2e/screenshots/03-interface-selection.png',
      fullPage: true 
    });

    // Step 4: Locate and interact with scan controls
    const scanButton = page.locator('button:has-text("Start Scan")').first();
    await expect(scanButton).toBeVisible();
    
    // Take screenshot before starting scan
    await page.screenshot({ 
      path: 'e2e/screenshots/04-before-scan-start.png',
      fullPage: true 
    });

    // Note: In a real test environment, we would click the scan button
    // However, since this requires a backend connection and actual WiFi interfaces,
    // we'll simulate the user interaction and verify UI responses
    
    // Check if the scan button is clickable (not disabled)
    const isDisabled = await scanButton.isDisabled();
    
    if (!isDisabled) {
      // Step 5: Start the scan
      await scanButton.click();
      
      // Wait for scanning state to appear
      await expect(page.locator('[data-testid="scanning-indicator"]')).toBeVisible({ timeout: 5000 });
      
      // Take screenshot during scan
      await page.screenshot({ 
        path: 'e2e/screenshots/05-scan-running.png',
        fullPage: true 
      });
      
      // Wait for scan results or error message to appear
      await Promise.race([
        page.waitForSelector('text=Scan Results', { timeout: 10000 }),
        page.waitForSelector('[role="alert"], .text-red-500', { timeout: 10000 }),
      ]);
      
      // Step 6: Check for scan results or error handling
      const hasResults = await page.locator('text=Scan Results').isVisible();
      const hasError = await page.locator('[role="alert"], .text-red-500').isVisible();
      
      if (hasResults) {
        // Take screenshot of scan results
        await page.screenshot({ 
          path: 'e2e/screenshots/06-scan-results-loaded.png',
          fullPage: true 
        });
        
        // Step 7: Check for auto-refresh controls
        const autoRefreshButton = page.locator('button:has-text("Auto-refresh")').first();
        if (await autoRefreshButton.isVisible()) {
          await page.screenshot({ 
            path: 'e2e/screenshots/07-auto-refresh-controls.png',
            fullPage: true 
          });
          
          // Test stopping auto-refresh if it's running
          const stopRefreshButton = page.locator('button:has-text("Stop Auto-refresh")');
          if (await stopRefreshButton.isVisible()) {
            await stopRefreshButton.click();
            await page.screenshot({ 
              path: 'e2e/screenshots/08-scan-stopped.png',
              fullPage: true 
            });
          }
        }
        
        // Verify scan results structure
        await expect(page.locator('text=Found')).toBeVisible();
        await expect(page.locator('text=access points')).toBeVisible();
        
      } else if (hasError) {
        // Handle error case - take screenshot of error state
        await page.screenshot({ 
          path: 'e2e/screenshots/06-scan-error-state.png',
          fullPage: true 
        });
        
        // Verify error message is displayed
        const errorMessage = page.locator('[role="alert"], .text-red-500').first();
        await expect(errorMessage).toBeVisible();
      }
      
    } else {
      // Step 5a: Handle case where scan is disabled (no interface selected or API not connected)
      await page.screenshot({ 
        path: 'e2e/screenshots/05-scan-disabled-state.png',
        fullPage: true 
      });
      
      // Verify why scan is disabled
      const interfaceInfo = page.locator('text=Please select an interface');
      const apiDisconnected = page.locator('text=API Disconnected');
      
      const hasInterfaceIssue = await interfaceInfo.isVisible();
      const hasApiIssue = await apiDisconnected.isVisible();
      
      expect(hasInterfaceIssue || hasApiIssue).toBeTruthy();
    }

    // Step 8: Final screenshot showing end state
    await page.screenshot({ 
      path: 'e2e/screenshots/09-final-state.png',
      fullPage: true 
    });

    // Verify key UI elements are present regardless of scan state
    await expect(page.locator('h1:has-text("WiFi Scanner")')).toBeVisible();
    await expect(page.locator('text=Network Interfaces')).toBeVisible();
    await expect(page.locator('text=WiFi Scan Control')).toBeVisible();
  });

  test('should handle API disconnection gracefully', async ({ page }) => {
    // Verify error handling when backend is not available
    await page.screenshot({ 
      path: 'e2e/screenshots/api-disconnected-state.png',
      fullPage: true 
    });

    // Check for API disconnection indicators
    const apiStatus = page.locator('text=API Disconnected');
    if (await apiStatus.isVisible()) {
      await expect(apiStatus).toBeVisible();
      
      // Verify scan button is disabled when API is disconnected
      const scanButton = page.locator('button:has-text("Start Scan")');
      await expect(scanButton).toBeDisabled();
    }
  });

  test('should verify responsive design elements', async ({ page }) => {
    // Test on different viewport sizes
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.screenshot({ 
      path: 'e2e/screenshots/desktop-view.png',
      fullPage: true 
    });

    await page.setViewportSize({ width: 768, height: 1024 });
    await page.screenshot({ 
      path: 'e2e/screenshots/tablet-view.png',
      fullPage: true 
    });

    await page.setViewportSize({ width: 375, height: 667 });
    await page.screenshot({ 
      path: 'e2e/screenshots/mobile-view.png',
      fullPage: true 
    });

    // Verify key elements are still visible on mobile
    await expect(page.locator('h1:has-text("WiFi Scanner")')).toBeVisible();
    await expect(page.locator('button:has-text("Start Scan")')).toBeVisible();
  });
});