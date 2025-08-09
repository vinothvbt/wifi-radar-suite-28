# WiFi Radar Suite - Web Edition

A modern web-based WiFi security analysis application with React frontend and FastAPI backend, designed for professional security assessments on Kali Linux.

## Features

- **Modern Web Interface**: Clean, responsive React SPA with TypeScript and shadcn/ui components
- **FastAPI Backend**: High-performance Python backend with async WiFi scanning capabilities
- **Real-time Scanning**: Auto-refreshing WiFi network discovery and analysis
- **Security Assessment**: Comprehensive threat level analysis and vulnerability scoring
- **Kali Linux Optimized**: Designed for Kali Linux with monitor mode support
- **Development Workflow**: Concurrent frontend/backend development setup

## Quick Start

### System Requirements

- **Kali Linux** (recommended) or Ubuntu/Debian
- **Python 3.8+** with pip
- **Node.js 18+** with npm
- **Root privileges** or capabilities for WiFi scanning

### Installation

```bash
# 1. Clone the repository
git clone <repository-url>
cd wifi-radar-suite-28

# 2. Install system dependencies (Kali Linux)
sudo apt update
sudo apt install wireless-tools iw python3-pip python3-venv nodejs npm

# 3. Install Python backend dependencies
cd src/backend
pip install -r requirements.txt

# 4. Install frontend dependencies
cd ../..
npm install

# 5. Start development servers
npm run dev
```

### Usage

The `npm run dev` command starts both the frontend and backend servers concurrently:

- **Frontend**: http://localhost:8080 (React + Vite)
- **Backend**: http://127.0.0.1:8000 (FastAPI)

You can also start them individually:

```bash
# Frontend only
npm run frontend

# Backend only  
npm run backend
```

### Environment Configuration

Copy `.env.example` to `.env` and adjust settings as needed:

```bash
cp .env.example .env
```

## WiFi Scanning Capabilities

### Interface Detection
- Automatic wireless interface discovery
- Support for multiple wireless adapters
- Monitor mode capability detection
- Interface status monitoring

### Network Analysis
- Real-time WiFi network scanning
- Signal strength measurement
- Security protocol identification (Open/WEP/WPA/WPA2/WPA3)
- Channel and frequency analysis
- Vendor identification via MAC OUI lookup

### Security Assessment
- Automated threat level classification
- Vulnerability scoring
- Attack vector identification
- Distance estimation
- Confidence rating

## API Endpoints

### Interface Management
- `GET /api/v1/interfaces` - List all network interfaces
- `GET /api/v1/interfaces/wireless` - List wireless interfaces only

### WiFi Scanning
- `POST /api/v1/scan/start` - Start WiFi scan on specified interface
- `GET /api/v1/scan/{scan_id}/status` - Get scan status
- `DELETE /api/v1/scan/{scan_id}` - Cancel active scan
- `GET /api/v1/scan/active` - List active scans

### Health Check
- `GET /health` - Backend health status
- `GET /api/docs` - Interactive API documentation

## Development

### Project Structure

```
wifi-radar-suite-28/
├── src/
│   ├── backend/
│   │   ├── api/
│   │   │   ├── main.py          # FastAPI application
│   │   │   ├── models.py        # Pydantic data models
│   │   │   ├── routers/         # API route handlers
│   │   │   └── services/        # Business logic
│   │   ├── run.py               # Backend entry point
│   │   ├── requirements.txt     # Python dependencies
│   │   └── legacy-desktop/      # Previous PyQt desktop version
│   ├── features/
│   │   └── scan/
│   │       └── ScanPage.tsx     # Main scanning interface
│   ├── lib/
│   │   └── api.ts               # Frontend API client
│   ├── pages/                   # React pages/routes
│   └── components/              # UI components
├── package.json                 # Node.js dependencies and scripts
├── .env.example                 # Environment configuration template
└── README.md                    # This file
```

### Technologies Used

**Frontend**:
- React 18 with TypeScript
- Vite for development and building
- shadcn/ui component library
- Tailwind CSS for styling
- React Router for navigation

**Backend**:
- FastAPI for REST API
- Pydantic for data validation
- Uvicorn ASGI server
- Async Python for performance

## Kali Linux Setup

### Required Packages

```bash
# System packages
sudo apt install wireless-tools iw python3-pip python3-venv nodejs npm

# Optional: Enable capabilities instead of running as root
sudo setcap cap_net_raw,cap_net_admin+eip /usr/bin/python3
```

### WiFi Interface Management

```bash
# Check available interfaces
iwconfig
iw dev

# Bring interface up
sudo ip link set wlan0 up

# Stop NetworkManager if scanning conflicts occur
sudo systemctl stop NetworkManager
sudo systemctl stop wpa_supplicant
```

## Troubleshooting

### Common Issues

**"No wireless interfaces detected"**
- Verify wireless hardware is present
- Check interface status with `iwconfig`
- Ensure proper drivers are installed

**"Backend API not available"**
- Verify backend server is running on port 8000
- Check firewall settings
- Ensure Python dependencies are installed

**"Permission denied" during scanning**
- Run backend with root privileges: `sudo npm run backend`
- Or configure capabilities: `sudo setcap cap_net_raw,cap_net_admin+eip /usr/bin/python3`

**Port conflicts**
- Frontend default: 8080 (Vite auto-increments if busy)
- Backend default: 8000
- Adjust ports in `.env` if needed

## Legal Notice

This tool is designed for **educational purposes** and **authorized security testing** only. Users are responsible for ensuring compliance with applicable laws and regulations. Unauthorized access to WiFi networks is illegal in most jurisdictions.

**Use responsibly and ethically.**

## Contributing

Contributions are welcome! Please ensure any modifications maintain the professional security focus and modern architecture of the project.

## License

See LICENSE file for details.
