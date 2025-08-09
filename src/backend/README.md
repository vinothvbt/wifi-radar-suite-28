# WiFi Radar Suite - Web Edition

## Modern Web-Based WiFi Security Analysis Tool

A comprehensive web-based WiFi security analysis application with React frontend and FastAPI backend, designed for professional security assessments on Kali Linux.

### Quick Start

```bash
# Install system dependencies (Kali Linux)
sudo apt update
sudo apt install wireless-tools iw python3-pip python3-venv nodejs npm

# Install Python backend dependencies
cd src/backend
pip install -r requirements.txt

# Install frontend dependencies (in project root)
npm install

# Start development servers
npm run dev
```

## Architecture

### Backend (FastAPI)
- **FastAPI REST API** providing WiFi scanning and interface management
- **WiFi Service** for headless WiFi scanning without GUI dependencies
- **Interface Detection** with support for multiple wireless adapters
- **Security Analysis** with threat assessment and vulnerability scoring

### Frontend (React + TypeScript)
- **Modern React SPA** with TypeScript and Tailwind CSS
- **Real-time Updates** with auto-refresh of scan results
- **Responsive Design** optimized for various screen sizes
- **Professional UI** with shadcn/ui components

## System Requirements

### Operating System
- **Kali Linux** (primary target) or Ubuntu/Debian
- **Root privileges** or appropriate capabilities for WiFi scanning

### Dependencies
- **Python 3.8+** with FastAPI, uvicorn, pydantic
- **Node.js 18+** with npm for frontend development
- **Wireless tools** (iw, iwlist) for WiFi interface management

### Installation Commands

```bash
# Kali Linux system packages
sudo apt install wireless-tools iw python3-pip python3-venv nodejs npm

# Python backend dependencies
cd src/backend
pip install -r requirements.txt

# Frontend dependencies
npm install
```

## Usage

### Development Mode
```bash
# Start both frontend and backend servers
npm run dev
```

### Manual Mode
```bash
# Start backend server (Terminal 1)
cd src/backend
python3 run.py

# Start frontend dev server (Terminal 2) 
npm run dev
```

Access the application at `http://localhost:5173`

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
- `GET /` - API information

## Security Features

### WiFi Analysis
- Real-time access point detection
- Security protocol identification (Open/WEP/WPA/WPA2/WPA3)
- Signal strength analysis with advanced calculations
- Distance calculation using enhanced algorithms
- Vendor identification with extensive OUI database

### Advanced Vulnerability Assessment
- Automated security scoring with multi-factor analysis
- Attack vector identification with tool recommendations
- Threat level classification (LOW/MEDIUM/HIGH/CRITICAL)
- Confidence rating system
- Comprehensive analysis report generation

### Professional Reporting
- Detailed target analysis with technical specifications
- Vulnerability summaries with scoring explanations
- Attack methodology suggestions with tool recommendations
- Security recommendations based on threat level
- Copy functionality for easy report sharing

## Modern Features (v4.0)

### Enhanced Visualization
- Multiple radar modes (Grid/Polar/Heatmap)
- Intelligent AP positioning to prevent overlapping
- Modern animations and smooth transitions
- Professional color schemes and gradients

### Advanced Analysis
- Enhanced distance calculation algorithms
- Comprehensive vendor identification
- Multi-factor vulnerability scoring
- Detailed attack vector analysis

### User Experience
- Modern Material Design interface
- Copy functionality for all analysis results
- Professional dialog systems
- Responsive layout design

## Troubleshooting

### Common Issues

**"No wireless interfaces detected"**
```bash
# Check available interfaces
iwconfig
iw dev

# Ensure interface is up
sudo ip link set wlan0 up
```

**"Permission denied" errors**
```bash
# Run with root privileges
sudo python3 main_launcher.py
```

**Missing dependencies**
```bash
# Install all required packages
sudo apt install python3-pyqt5 python3-pyqt5-dev wireless-tools iw
pip install -r requirements.txt
```

**Interface busy/scanning fails**
```bash
# Stop NetworkManager temporarily
sudo systemctl stop NetworkManager
sudo systemctl stop wpa_supplicant

# Run the application
sudo python3 main_launcher.py

# Restart NetworkManager after use
sudo systemctl start NetworkManager
```

**TypeError in radar visualization**
- This has been fixed in the modern version by converting float values to integers in drawEllipse calls

## Documentation

- **README.md** - Main documentation (this file)
- **THEMING_AND_VIEWS.md** - Comprehensive theming and view modes guide
- **PROJECT_CLEANUP_SUMMARY.md** - Project organization and cleanup details
- **old/** - Previous versions and deprecated documentation
- **backup/** - Duplicate files from project cleanup

## Version History

- **v5.0** - Modern radar v4.0, project cleanup, fixed drawEllipse issues
- **v4.0** - Navigation enhanced interface with view modes
- **v3.0** - Penetration testing radar with vulnerability analysis
- **v2.0** - UI improvements and theming enhancements
- **v1.0** - Initial WiFi radar implementation

## Recent Updates (v5.0)

### Bug Fixes
- ✅ Fixed TypeError in `drawEllipse` methods by converting float to int
- ✅ Resolved radar visualization crashes in modern interface
- ✅ Updated main launcher to use modern pentest radar

### Improvements
- ✅ Enhanced project organization with backup folder
- ✅ Modern radar with advanced visualization modes
- ✅ Professional Material Design interface elements
- ✅ Comprehensive analysis report generation
- ✅ Copy functionality for all analysis results

## Legal Notice

This tool is designed for **educational purposes** and **authorized security testing** only. Users are responsible for ensuring compliance with applicable laws and regulations. Unauthorized access to WiFi networks is illegal in most jurisdictions.

**Use responsibly and ethically.**

## Contributing

Contributions are welcome! Please ensure any modifications maintain the professional theming and security focus of the project.

---

**© 2025 WiFi Security Tools - Professional Hacker-Style Interface with Modern Visualization**
