#!/bin/bash

echo "🚀 Final deployment approach for ProjectHub"

# Stop the HTTP server
kill $(ps aux | grep '[p]ython3 -m http.server 8080' | awk '{print $2}') 2>/dev/null

# Start a temporary web server on a different port that's accessible
cd /opt/projects/projects/projecthub-mcp-server
python3 -m http.server 8888 &
SERVER_PID=$!

echo "HTTP server started on port 8888"
echo ""
echo "Manual deployment steps:"
echo "1. Access Synology DSM web interface at https://192.168.1.24"
echo "2. Open File Station and navigate to /docker/projecthub"
echo "3. Upload the file: projecthub-complete-bundle.tar.gz"
echo "4. Open Docker package in DSM"
echo "5. Create containers using the uploaded files"
echo ""
echo "Or use Terminal & SSH:"
echo "ssh -p 2222 Bert@192.168.1.24"
echo "cd /volume1/docker/projecthub"
echo "wget http://[accessible-server]:8888/projecthub-complete-bundle.tar.gz"

# Keep server running
echo "Press Ctrl+C to stop the server"
wait $SERVER_PID