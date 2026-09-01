#!/bin/bash

# 🔥 WEALTH MACHINE - QUICK START SCRIPT
# One command to get everything running

echo ""
echo "🔥 WEALTH MACHINE DASHBOARD - QUICK START"
echo ""

# Make master script executable
chmod +x master.sh deploy.sh setup.sh build.sh 2>/dev/null || true

# Check for master.sh
if [ ! -f "master.sh" ]; then
    echo "Error: master.sh not found"
    exit 1
fi

# Run master script with interactive menu
./master.sh
