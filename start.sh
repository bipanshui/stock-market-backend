#!/bin/bash
while true; do
    echo "Starting server..."
    fuser -k 5000/tcp 2>/dev/null
    node src/app.js &
    PID=$!
    sleep 3
    if curl -s http://localhost:5000/health > /dev/null 2>&1; then
        echo "Server running on PID $PID"
    else
        echo "Server failed, restarting..."
        sleep 2
    fi
    wait
done