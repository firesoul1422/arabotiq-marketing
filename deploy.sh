#!/bin/bash

# Exit on error
set -e

echo "Starting Arabotiq Marketing AI deployment..."

# Update system packages
echo "Updating system packages..."
apt update && apt upgrade -y

# Install required packages
echo "Installing required packages..."
apt install -y docker.io docker-compose curl

# Start and enable Docker service
echo "Configuring Docker service..."
systemctl start docker
systemctl enable docker

# Create application directory
APP_DIR="/opt/arabotiq-marketing"
echo "Creating application directory at $APP_DIR"
mkdir -p "$APP_DIR"
cd "$APP_DIR"

# Copy application files
echo "Setting up application files..."
cp -r ./* "$APP_DIR/"

# Set up environment variables
echo "Configuring environment variables..."
if [ ! -f .env.production ]; then
    echo "Error: .env.production file not found!"
    exit 1
fi

cp .env.production .env

# Configure firewall
echo "Configuring firewall rules..."
apt install -y ufw
ufw allow ssh
ufw allow 3000/tcp
ufw --force enable

# Pull and start containers
echo "Starting Docker containers..."
docker-compose pull
docker-compose up -d

echo "Deployment completed successfully!"
echo "Application should be running at http://$(curl -s ifconfig.me):3000"