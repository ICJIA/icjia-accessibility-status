#!/bin/bash

echo "Starting ICJIA Accessibility Portal..."
echo ""
echo "Starting backend server on port 3001..."
npx tsx server/index.ts &
BACKEND_PID=$!

sleep 3

echo "Starting frontend dev server on port 5173..."
npm run dev:frontend &
FRONTEND_PID=$!

echo ""
echo "✅ Both servers started!"
echo "   - Frontend: http://localhost:5173"
echo "   - Backend:  http://localhost:3001"
echo ""
echo "Press Ctrl+C to stop both servers"
echo ""

wait
