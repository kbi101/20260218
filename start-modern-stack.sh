#!/bin/bash

# Start the Modern Job Search Stack (Backend + React Frontend)

echo "🚿 Cleaning up existing processes on Ports 8080 and 5173..."
lsof -i :8080 -t | xargs kill -9 > /dev/null 2>&1
lsof -i :5173 -t | xargs kill -9 > /dev/null 2>&1

echo "🚀 Starting PAO Modern Stack..."

# Set environment variables for the backend if needed
# export SPRING_PROFILES_ACTIVE=dev

# Start Backend (Spring Boot)
echo "☕ Starting Spring Boot Backend (Port 8080)..."
(cd pao-backend && mvn spring-boot:run) &

# Wait for backend to be ready (optional, but good for logs)
# sleep 10 

# Start Modern Frontend (React + Vite)
echo "⚛️ Starting Modern React Frontend (Port 5173)..."
(cd pao-frontend-react && npm run dev) &

echo "✅ Modern UI will be available at: http://localhost:5173"
echo "✅ Backend API available at: http://localhost:8080/api"
echo "✅ Legacy UI remains at: http://localhost:4200 (if running manually)"

# Keep the script running to catch logs from both
wait
