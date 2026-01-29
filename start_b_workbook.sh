#!/bin/bash
cd "$(dirname "$0")"
echo "🚀 Starting Workbook Generator..."

# Start the dev server in the background
npm run dev > /dev/null 2>&1 &
PID=$!

# Wait for server
sleep 3

# Open browser (generic Linux support)
if which xdg-open > /dev/null; then
  xdg-open "http://localhost:5173"
elif which gnome-open > /dev/null; then
  gnome-open "http://localhost:5173"
else
  echo "Could not detect web browser. Please open http://localhost:5173 manually."
fi

echo "✅ App is running!"
echo "Press [CTRL+C] to stop."

wait $PID
