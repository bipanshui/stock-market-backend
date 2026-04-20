#!/bin/bash
echo "Starting server"
node src/app.js &
PID=$!

sleep 5
echo "Checking health"

if curl -s http://localhost:5000/health 2> /dev/null; then
   echo "Server is healthy"
else 
   echo "Server is not healthy"
fi

sleep 15

echo "Stopping server .. "
kill $PID
wait $PID 2> /dev/null

echo "Done"
