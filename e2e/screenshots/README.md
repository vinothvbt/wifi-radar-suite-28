# E2E Test Screenshots

This directory contains screenshots captured during end-to-end testing of the WiFi Radar Suite.

## Screenshot Categories

### Main Workflow Screenshots
- `01-initial-page-load.png` - Application startup and initial rendering
- `02-api-connection-status.png` - Backend API connection status
- `03-interface-selection.png` - Network interface detection and selection
- `04-before-scan-start.png` - Pre-scan state with controls ready
- `05-scan-running.png` - Active scanning state with progress indicators
- `06-scan-results-loaded.png` - WiFi networks list and results display
- `07-auto-refresh-controls.png` - Auto-refresh functionality controls
- `08-scan-stopped.png` - Scan completion and final results
- `09-final-state.png` - Final application state after workflow

### Error State Screenshots
- `scan-error-state.png` - Error handling during scan operations
- `api-disconnected-state.png` - API disconnection error state
- `scan-disabled-state.png` - Disabled scan controls state

### Responsive Design Screenshots
- `desktop-view.png` - Desktop layout (1280x720)
- `tablet-view.png` - Tablet layout (768x1024)
- `mobile-view.png` - Mobile layout (375x667)

## Viewing Screenshots

Screenshots are automatically generated during test execution and can be viewed:

1. **File Explorer**: Navigate to this directory and open PNG files
2. **Test Reports**: View in HTML test reports via `npx playwright show-report`
3. **CI/CD**: Screenshots are available in test artifacts when tests run in continuous integration

## Screenshot Guidelines

- All screenshots are full-page captures for complete context
- Screenshots are taken at key user interaction points
- Error states are documented for debugging purposes
- Multiple viewport sizes are tested for responsive design verification