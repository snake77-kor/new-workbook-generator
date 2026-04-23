#!/bin/bash
cd "$(dirname "$0")"
echo "🚀 Starting Workbook Generator..."

# Start the dev server in the background
npm run dev > /dev/null 2>&1 &
PID=$!

# Wait for server
sleep 3

# If a file is passed as an argument, read its content and base64 encode it
DATA_PARAM=""
if [ -n "$1" ] && [ -f "$1" ]; then
  echo "📄 Loading file: $1"
  CONTENT=$(cat "$1")
  # Use python3 or base64 command to encode
  if command -v python3 > /dev/null; then
    B64_DATA=$(echo -n "$CONTENT" | python3 -c "import base64, sys; print(base64.b64encode(sys.stdin.buffer.read()).decode())")
  else
    B64_DATA=$(echo -n "$CONTENT" | base64 | tr -d '\n')
  fi
  DATA_PARAM="#data=$B64_DATA"
fi

# Open browser (generic Linux support)
if which xdg-open > /dev/null; then
  xdg-open "http://localhost:5173$DATA_PARAM"
elif which gnome-open > /dev/null; then
  gnome-open "http://localhost:5173$DATA_PARAM"
else
  echo "Could not detect web browser. Please open http://localhost:5173 manually."
fi

echo "✅ App is running!"
echo "Press [CTRL+C] to stop."

wait $PID
