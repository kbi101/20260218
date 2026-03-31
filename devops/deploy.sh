#!/bin/bash
# PAO Unified Build and Deploy Script (Robust Docker Version)

echo "--- PAO Robust Build and Deploy using Docker ---"

# 1. Build the production application in a container
# This handles all dependencies (Java, Maven, Node, etc.) automatically.
# Assuming this is run from the 'pao' root directory
docker build --no-cache -f devops/Dockerfile -t pao-app .

if [ $? -eq 0 ]; then
    echo "--- Build Successful ---"
    
    # 2. Deploy locally by running the container
    echo "Stopping existing container if running..."
    docker stop pao-app-instance 2>/dev/null || true
    docker rm pao-app-instance 2>/dev/null || true
    
    # Load .env.local or .env if they exist, otherwise use property defaults
    ENV_FILE_ARG=""
    if [ -f .env.local ]; then
      ENV_FILE_ARG="--env-file .env.local"
      echo "Using .env.local for configuration."
    elif [ -f .env ]; then
      ENV_FILE_ARG="--env-file .env"
      echo "Using .env for configuration."
    fi

    docker run -d --name pao-app-instance -p 3012:8080 \
      $ENV_FILE_ARG \
      -v "$(pwd)/data:/app/data" \
      --add-host host.docker.internal:host-gateway \
      pao-app
    
    if [ $? -eq 0 ]; then
        echo "--- Deployment Successful ---"
        echo "Application is running at: http://localhost:3012"
        echo "H2 Console (if enabled): http://localhost:3012/h2-console"
    else
        echo "--- Deployment Failed ---"
        exit 1
    fi
else
    echo "--- Build Failed ---"
    exit 1
fi
