# Cost-Effective Deployment Guide for Arabotiq Marketing AI

This guide provides instructions for deploying the Arabotiq Marketing AI application with minimal cost while maintaining functionality and security.

## Recommended Hosting Options

### Option 1: Low-Cost VPS (Recommended)

**Estimated Cost**: $5-10/month

**Providers**:
- DigitalOcean (Basic Droplet - $5/month)
- Linode (Nanode - $5/month)
- Vultr (Cloud Compute - $5/month)
- Hetzner (CX11 - €4.15/month)

**Specifications**:
- 1 vCPU
- 1-2 GB RAM
- 25 GB SSD Storage
- 1 TB Transfer

This option provides the best balance of cost, performance, and control.

### Option 2: Shared Hosting with Node.js Support

**Estimated Cost**: $3-7/month

**Providers**:
- A2 Hosting
- Hostinger
- DreamHost

**Note**: Make sure the provider supports Node.js and MongoDB. This option may have limitations for long-running processes.

## Deployment Steps

### 1. Set Up Your VPS

1. Sign up for a VPS provider (DigitalOcean, Linode, etc.)
2. Create the smallest available instance/droplet with Ubuntu LTS
3. Set up SSH access and secure your server

### 2. Install Required Software

```bash
# Update package lists
sudo apt update
sudo apt upgrade -y

# Install Docker and Docker Compose
sudo apt install -y docker.io docker-compose

# Start and enable Docker
sudo systemctl start docker
sudo systemctl enable docker

# Add your user to the docker group (optional, for convenience)
sudo usermod -aG docker $USER
```

### 3. Clone and Configure the Application

```bash
# Clone the repository
git clone <your-repository-url>
cd arabotiq-marketing-ai

# Configure environment variables
cp .env.production .env
```

Edit the `.env` file:
- Update `API_URL` with your server's IP address: `http://YOUR_SERVER_IP:3000/api`
- Set a strong `JWT_SECRET`
- Add your OpenAI API key and other required API keys

### 4. Optimize Docker Compose for Low Resource Usage

Edit the `docker-compose.yml` file to limit resource usage:

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - MONGODB_URI=mongodb://mongo:27017/arabotiq-marketing
      - PORT=3000
    depends_on:
      - mongo
    restart: always
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 512M

  mongo:
    image: mongo:latest
    command: mongod --wiredTigerCacheSizeGB 0.25
    ports:
      - "27017:27017"
    volumes:
      - mongo-data:/data/db
    restart: always
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 512M

volumes:
  mongo-data:
```

### 5. Build and Start the Application

```bash
# Build and start in detached mode
docker-compose up -d
```

### 6. Set Up Free SSL with Let's Encrypt (Optional but Recommended)

If you have a domain name, you can set up free SSL:

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Install Nginx
sudo apt install -y nginx

# Get SSL certificate
sudo certbot --nginx -d yourdomain.com
```

Configure Nginx as a reverse proxy:

```
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Cost-Saving Tips

### 1. Optimize API Usage

- Monitor your OpenAI API usage and set usage limits
- Implement caching for API responses to reduce API calls
- Consider using a smaller model (e.g., GPT-3.5-Turbo instead of GPT-4) for less critical tasks

### 2. Database Optimization

- Limit MongoDB's memory usage as shown in the docker-compose.yml example
- Set up regular database cleanups to remove old or unnecessary data
- Use indexes for frequently queried fields

### 3. Scaling Considerations

- Start with the smallest viable server and only scale up when necessary
- Consider serverless options for specific functions if they become costly to run continuously

## Monitoring

Set up basic monitoring to keep track of resource usage:

```bash
# Install basic monitoring tools
sudo apt install -y htop

# Monitor disk usage
df -h

# Monitor memory and CPU
htop
```

## Backup Strategy

Set up a simple backup script for MongoDB:

```bash
#!/bin/bash
BACKUP_DIR="/home/user/backups"
DATE=$(date +%Y-%m-%d)
mkdir -p $BACKUP_DIR
docker exec arabotiq-marketing-ai_mongo_1 mongodump --out /tmp/backup
docker cp arabotiq-marketing-ai_mongo_1:/tmp/backup $BACKUP_DIR/$DATE
```

Add this to crontab to run weekly:

```
0 0 * * 0 /path/to/backup-script.sh
```

## Conclusion

This deployment approach provides a cost-effective way to run the Arabotiq Marketing AI application while maintaining essential functionality and security. The total cost should be around $5-10 per month for the VPS, plus any API usage costs.