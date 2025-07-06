#!/bin/bash

# Build CSS with Tailwind for the Alpine.js version
echo "Building CSS with Tailwind..."

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

# Build CSS
npx tailwindcss -i ./src/index.css -o ./dist/styles.css --minify

echo "CSS build complete!"