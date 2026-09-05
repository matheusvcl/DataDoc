#!/usr/bin/env bash
PORT="${1:-8000}"
echo "DataDoc dev server:"
echo "  http://localhost:$PORT"
echo "  Ctrl+C para parar"
echo ""
python3 -m http.server "$PORT" 2>/dev/null || python -m http.server "$PORT"
