#!/bin/bash

# WiFi Radar Suite Web Edition Launch Script
# Automated launcher for the web-based WiFi security analysis tool

echo "WiFi Radar Suite - Web Edition"
echo "=============================="

# Check if running as root (required for WiFi scanning)
if [ "$EUID" -ne 0 ]; then
    echo "Warning: WiFi scanning requires root privileges."
    echo "Run with sudo for full functionality: sudo ./launch.sh"
    echo "Or use capabilities: sudo setcap cap_net_raw,cap_net_admin+eip /usr/bin/python3"
    echo ""
fi

# Check Python dependencies
echo "Checking backend dependencies..."

if ! command -v python3 &> /dev/null; then
    echo "Python3 not found. Please install Python3."
    exit 1
fi

# Check if FastAPI is available
if ! python3 -c "import fastapi, uvicorn, pydantic" &> /dev/null; then
    echo "FastAPI dependencies not found. Installing..."
    pip install fastapi uvicorn pydantic requests
fi

# Check wireless tools
if ! command -v iw &> /dev/null && ! command -v iwlist &> /dev/null; then
    echo "Wireless tools not found. Installing..."
    apt install -y wireless-tools iw
fi

echo "Backend dependencies checked successfully!"
echo ""

# Check if we're in the right directory
if [ ! -f "run.py" ]; then
    echo "Error: run.py not found. Please run this script from the backend directory."
    exit 1
fi

# Launch the FastAPI backend
echo "Launching WiFi Radar Suite Backend..."
echo "API will be available at: http://127.0.0.1:8000"
echo "Frontend should be started separately with: npm run dev"
echo ""
python3 run.py
