# Custom SSH Deployment Guide

## Step 1: Your SSH Key
Your generated SSH key is:
```
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAINZAxGdYJ4m1IJNQQ6ntC+oJTAffYCIr5NcAUzfGfSUE ooo7ammoodyooogmail.com
```

## Step 2: Save SSH Key to Server
Create a new file on your local machine with your SSH key:
```bash
# Create .ssh directory if it doesn't exist (run in PowerShell)
New-Item -ItemType Directory -Force -Path "$env:USERPROFILE\.ssh"

# Create authorized_keys file and add your key (run in PowerShell)
$sshKey = 'ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAINZAxGdYJ4m1IJNQQ6ntC+oJTAffYCIr5NcAUzfGfSUE ooo7ammoodyooogmail.com'
Add-Content -Path "$env:USERPROFILE\.ssh\authorized_keys" -Value $sshKey

# Note: Windows handles file permissions differently from Linux
# The .ssh directory and authorized_keys file should be secured by default
```

## Step 3: Test SSH Connection
```bash
# Test the connection (run in PowerShell)
ssh root@172.236.20.100

# If you get a warning about host authenticity, type 'yes' to continue
```

## Step 4: Project Setup
After successful SSH connection:
```bash
# Create project directory
mkdir -p /opt/arabotiq-marketing

# Navigate to project directory
cd /opt/arabotiq-marketing
```

## Step 5: Transfer Project Files
From your local machine:
```bash
# Transfer files (run in PowerShell from your project directory)
scp -r ./* root@172.236.20.100:/opt/arabotiq-marketing/

# Alternative: If using Git Bash
# scp -r ./* root@172.236.20.100:/opt/arabotiq-marketing/
```

## Step 6: Deploy Application
On the server:
```bash
# Make deploy script executable
chmod +x deploy.sh

# Run deployment script
./deploy.sh
```

## Step 7: Verify Deployment
After deployment:
```bash
# Check Docker containers status
docker ps

# View container logs if needed
docker-compose logs
```

## Updating Application
To update in the future:
```bash
# SSH to server
ssh root@172.236.20.100

# Navigate to project
cd /opt/arabotiq-marketing

# Rebuild and restart
docker-compose up -d --build
```