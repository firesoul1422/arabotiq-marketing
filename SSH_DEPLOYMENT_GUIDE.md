# SSH Connection and Deployment Guide

## Prerequisites
- SSH key pair (if not generated yet)
- Server IP address
- Root or sudo access to the server

## Step 1: Generate SSH Key (if not already done)
```bash
# On your local machine
ssh-keygen -t rsa -b 4096 -C "your_email@example.com"
```

## Step 2: Copy SSH Key to Server
```bash
# Replace YOUR_SERVER_IP with your actual server IP
ssh-copy-id root@YOUR_SERVER_IP

# If ssh-copy-id is not available, use:
cat ~/.ssh/id_rsa.pub | ssh root@YOUR_SERVER_IP "mkdir -p ~/.ssh && cat >> ~/.ssh/authorized_keys"
```

## Step 3: Test SSH Connection
```bash
ssh root@YOUR_SERVER_IP
```

## Step 4: Create Project Directory on Server
```bash
# After SSH connection is established
mkdir -p /opt/arabotiq-marketing
```

## Step 5: Transfer Project Files
```bash
# From your local machine (run in PowerShell)
# Replace YOUR_SERVER_IP with your actual server IP
scp -r ./* root@YOUR_SERVER_IP:/opt/arabotiq-marketing/

# Alternative: If using Git Bash
# scp -r ./* root@YOUR_SERVER_IP:/opt/arabotiq-marketing/
```

## Step 6: Deploy the Application
```bash
# SSH into your server
ssh root@YOUR_SERVER_IP

# Navigate to project directory
cd /opt/arabotiq-marketing

# Make deploy script executable
chmod +x deploy.sh

# Run deployment script
./deploy.sh
```

## Step 7: Verify Deployment
1. The deployment script will automatically:
   - Update system packages
   - Install Docker and required dependencies
   - Configure firewall
   - Set up environment variables
   - Start Docker containers

2. At the end of deployment, you'll see the application URL

## Troubleshooting
- If you see permission errors, ensure you're using sudo or root access
- If Docker containers fail to start, check logs using:
  ```bash
  docker-compose logs
  ```
- Verify environment variables are properly set in .env.production

## Updating the Application
To update the application in the future:
```bash
# SSH into your server
ssh root@YOUR_SERVER_IP

# Navigate to project directory
cd /opt/arabotiq-marketing

# Pull latest changes (if using git)
git pull

# Rebuild and restart containers
docker-compose up -d --build
```