#!/bin/bash
cd "$(dirname "$0")"
echo "🚀 Starting Workbook Generator..."
echo "Please wait while the server starts..."

# Start the dev server in the background
npm run dev > /dev/null 2>&1 &
PID=$!

# Wait for server to be ready
sleep 3

# Open the browser
open "http://localhost:5173"

echo "✅ App is running!"
echo "Press [CTRL+C] to close this window and stop the server."

# Keep the script running to maintain the server
wait $PID
