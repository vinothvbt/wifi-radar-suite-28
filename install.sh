#!/bin/bash

# WiFi Radar Suite - Automated Installer
# For Kali Linux, Ubuntu, or Debian (must have root privileges)

set -e

echo "==> Updating package list..."
sudo apt update

echo "==> Installing system dependencies..."
sudo apt install -y wireless-tools iw python3-pip python3-venv nodejs npm

echo "==> Setting up Python backend..."
cd src/backend
if [ ! -d "venv" ]; then
  python3 -m venv venv
fi
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
deactivate

echo "==> Setting up frontend..."
cd ../..
npm install

echo "==> Installation complete!"

echo ""
echo "To start development servers:"
echo "  cd src/backend && source venv/bin/activate"
echo "  cd ../.."
echo "  npm run dev"
echo ""
echo "For production build:"
echo "  npm run build"
echo ""
echo "Refer to README.md or KALI_SETUP.md for advanced usage and troubleshooting."
