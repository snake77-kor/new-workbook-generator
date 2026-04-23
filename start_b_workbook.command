#!/bin/bash
cd "$(dirname "$0")"

echo "🚀 Starting Workbook Generator..."

# Check if port 5173 is already in use
PORT_PID=$(lsof -ti:5173)

if [ -n "$PORT_PID" ]; then
  echo "💡 Server is already running (PID: $PORT_PID). Using existing server."
  SERVER_ALREADY_RUNNING=true
else
  echo "⏳ Starting background dev server..."
  npm run dev > /dev/null 2>&1 &
  PID=$!
  SERVER_ALREADY_RUNNING=false
  # Wait for server to be ready
  sleep 3
fi

# If a file is passed as an argument, read its content and base64 encode it
DATA_PARAM=""
if [ -n "$1" ] && [ -f "$1" ]; then
  echo "📄 Loading file: $1"
  CONTENT=$(cat "$1")
  # Use python3 or base64 command to encode without newlines
  if command -v python3 >/dev/null 2>&1; then
    B64_DATA=$(echo -n "$CONTENT" | python3 -c "import base64, sys; print(base64.b64encode(sys.stdin.buffer.read()).decode())")
  else
    B64_DATA=$(echo -n "$CONTENT" | base64 | tr -d '\12\15')
  fi
  DATA_PARAM="#data=$B64_DATA"
fi

# Open the browser
open "http://localhost:5173$DATA_PARAM"

echo "✅ App is running!"

if [ "$SERVER_ALREADY_RUNNING" = false ]; then
  echo "Press [CTRL+C] to close this window and stop the server."
  # Keep the script running to maintain the server
  wait $PID
else
  echo "Terminal will close in 3 seconds as the server is already managed."
  sleep 3
  exit 0
fi
