#!/bin/bash

echo "================================================"
echo "  Building etrl.chat for Production"
echo "================================================"
echo ""

echo "[1/2] Building Frontend Application..."
cd front-beta
npm run build
if [ $? -ne 0 ]; then
    echo "Error building frontend!"
    exit 1
fi
cd ..

echo ""
echo "[2/2] Building Landing Page..."
cd landing
npm run build
if [ $? -ne 0 ]; then
    echo "Error building landing!"
    exit 1
fi
cd ..

echo ""
echo "================================================"
echo "  Build completed successfully!"
echo "================================================"
echo ""
echo "  Frontend: front-beta/dist"
echo "  Landing: landing/dist"
echo ""

