# WiFi Radar Suite - Kali Linux Setup Guide

## Overview

WiFi Radar Suite is a modern web-based WiFi security analysis tool that migrates the original PyQt5 desktop application to a FastAPI backend with React frontend. This guide covers the specific setup requirements for Kali Linux.

## Architecture

- **Frontend**: React + Vite + TypeScript with Tailwind CSS
- **Backend**: FastAPI with async WiFi scanning
- **Database**: None required for basic scanning
- **Platform**: Optimized for Kali Linux with monitor mode support

## System Requirements

### Kali Linux Version
- Kali Linux 2023.1 or newer
- Python 3.8+ (included in Kali)
- Node.js 18+ (for frontend development)

### WiFi Hardware Requirements
- Wireless network adapter with monitor mode support
- Recommended: USB WiFi adapters with Atheros, Ralink, or Realtek chipsets
- Internal WiFi cards may work but USB adapters provide better flexibility

### Required Packages

```bash
# Update package list
sudo apt update

# Install Python dependencies
sudo apt install python3-pip python3-venv

# Install WiFi tools (usually pre-installed in Kali)
sudo apt install aircrack-ng wireless-tools iw

# Install Node.js (for frontend development)
sudo apt install nodejs npm

# Optional: Additional WiFi analysis tools
sudo apt install wavemon wireshark-gtk kismet
```

## Installation

### 1. Clone Repository

```bash
git clone https://github.com/vinothvbt/wifi-radar-suite-28.git
cd wifi-radar-suite-28
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd src/backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt
```

### 3. Frontend Setup

```bash
# Navigate to project root
cd ../..

# Install frontend dependencies
npm install

# Build frontend for production (optional)
npm run build
```

## Running the Application

### 1. Start Backend API

```bash
# From src/backend directory with venv activated
cd src/backend/api
python main.py
```

The API will be available at: `http://127.0.0.1:8000`
- API Documentation: `http://127.0.0.1:8000/api/docs`
- Health Check: `http://127.0.0.1:8000/health`

### 2. Start Frontend (Development)

```bash
# From project root directory
npm run dev
```

The frontend will be available at: `http://localhost:5173`

### 3. Access the Application

1. Open your browser to `http://localhost:5173`
2. Click "Launch WiFi Radar" to access the main interface
3. Verify "API Connected" status in the top-right corner

## WiFi Interface Configuration

### Checking Available Interfaces

```bash
# List all network interfaces
ip link show

# List wireless interfaces
iwconfig

# List interfaces with iw (modern tool)
iw dev
```

### Setting Up Monitor Mode

For advanced WiFi analysis, you may need to enable monitor mode:

```bash
# Replace wlan0 with your interface name
sudo ip link set wlan0 down
sudo iw dev wlan0 set type monitor
sudo ip link set wlan0 up

# Verify monitor mode
iwconfig wlan0
```

### Restoring Managed Mode

```bash
# Return to normal mode
sudo ip link set wlan0 down
sudo iw dev wlan0 set type managed
sudo ip link set wlan0 up
```

## Permissions and Capabilities

### Running with Sudo
WiFi scanning typically requires elevated privileges:

```bash
# Backend may need sudo for scanning
sudo python main.py
```

### Alternative: Capabilities (Preferred)
Set capabilities to avoid running as root:

```bash
# Give Python scanning capabilities
sudo setcap cap_net_raw,cap_net_admin+eip $(which python3)

# Or for specific script
sudo setcap cap_net_raw,cap_net_admin+eip /path/to/your/python
```

## API Endpoints

### Core Endpoints

- `GET /api/v1/interfaces` - List all network interfaces
- `GET /api/v1/interfaces/wireless` - List wireless interfaces only
- `POST /api/v1/scan/start?interface={name}` - Start WiFi scan
- `GET /api/v1/scan/{scan_id}/status` - Get scan status
- `GET /health` - Health check

### Example Usage

```bash
# Check health
curl http://127.0.0.1:8000/health

# List interfaces
curl http://127.0.0.1:8000/api/v1/interfaces

# Start scan (requires existing interface)
curl -X POST "http://127.0.0.1:8000/api/v1/scan/start?interface=wlan0"
```

## Troubleshooting

### Common Issues

1. **No interfaces detected**
   - Check if wireless tools are installed: `which iw iwconfig`
   - Verify WiFi hardware: `lsusb | grep -i wireless`
   - Run with sudo if permission denied

2. **Scan fails**
   - Ensure interface is up: `sudo ip link set wlan0 up`
   - Check for conflicting processes: `sudo airmon-ng check kill`
   - Verify interface supports scanning: `iw dev wlan0 scan`

3. **API connection issues**
   - Verify backend is running: `curl http://127.0.0.1:8000/health`
   - Check CORS configuration for your frontend port
   - Ensure no firewall blocking port 8000

4. **Frontend build errors**
   - Check Node.js version: `node --version` (should be 18+)
   - Clear npm cache: `npm cache clean --force`
   - Delete node_modules and reinstall: `rm -rf node_modules && npm install`

### Logs and Debugging

```bash
# Backend logs
tail -f /tmp/wifi_pentest_radar.log

# Frontend console
# Open browser dev tools (F12) for React errors

# System WiFi logs
sudo journalctl -u NetworkManager -f
```

## Security Considerations

### Legal Notice
This tool is designed for authorized penetration testing and security research only. Ensure you have proper authorization before scanning networks you don't own.

### Best Practices
- Use in controlled environments or with written permission
- Monitor mode can interfere with normal WiFi operations
- Some scanning techniques may be detected by intrusion detection systems
- Always restore interfaces to managed mode when finished

## Development Setup

### Hot Reload Development

```bash
# Terminal 1: Backend with auto-reload
cd src/backend/api
python main.py

# Terminal 2: Frontend with hot reload
npm run dev
```

### Building for Production

```bash
# Build frontend
npm run build

# Serve static files (optional)
npm run preview
```

## Performance Tuning

### Backend Optimization
- Adjust scan timeouts in `wifi_service.py`
- Configure interface detection methods based on your hardware
- Monitor memory usage during long scanning sessions

### Frontend Optimization
- Use production build for better performance
- Consider implementing WebSocket for real-time updates
- Optimize API polling intervals based on use case

## Contributing

See the main README.md for contribution guidelines and development setup instructions.