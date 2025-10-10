#!/bin/bash

echo "================================================"
echo "  Starting etrl.chat Development Environment"
echo "================================================"
echo ""

echo "[1/4] Starting Frontend Application..."
cd front-beta
npm run dev &
FRONTEND_PID=$!
cd ..

sleep 2

echo "[2/4] Starting Landing Page..."
cd landing
npm run dev &
LANDING_PID=$!
cd ..

echo ""
echo "================================================"
echo "  All services started successfully!"
echo "================================================"
echo ""
echo "  Frontend App: http://localhost:3000"
echo "  Landing Page: http://localhost:5173"
echo ""
echo "  Press Ctrl+C to stop all services"
echo ""

# Wait for both processes
wait $FRONTEND_PID $LANDING_PID

