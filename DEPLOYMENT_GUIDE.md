# Arabotiq Marketing AI Deployment Guide

This guide provides step-by-step instructions for deploying the Arabotiq Marketing AI application to a production environment.

## Prerequisites

- Docker and Docker Compose installed on your server
- Access to a domain name (for production deployment)
- API keys for all required services (OpenAI, social media platforms, etc.)

## Deployment Steps

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd arabotiq-marketing-ai
```

### 2. Configure Environment Variables

The application uses environment variables for configuration. For production deployment, you need to set up the `.env.production` file:

```bash
# If you're deploying from a fresh clone
cp .env.example .env.production

# If the .env.production file already exists
# Make sure to review and update it
```

Edit the `.env.production` file and fill in all required API keys and configuration values:

- **API Keys**: Set your OpenAI API key and other service API keys
- **Database Configuration**: The MongoDB connection string is already configured for Docker Compose
- **JWT Secret**: Ensure a strong JWT secret is set for authentication
- **API URL**: Update with your actual production domain
- **Note**: Social media credentials are collected during user onboarding and stored in user profiles, not as environment variables

### 3. Build and Start the Application

Use Docker Compose to build and start the application:

```bash
# Build and start in detached mode
docker-compose up -d
```

This command will:
- Build the Docker image using the Dockerfile
- Start the application container and MongoDB container
- Set up the required network between containers
- Mount the MongoDB data volume for persistence

### 4. Verify Deployment

Check if the containers are running:

```bash
docker-compose ps
```

Check the application logs:

```bash
docker-compose logs -f app
```

Access the API at `http://your-server-ip:3000` or your configured domain.

## Production Considerations

### Security

1. **Environment Variables**: Never commit sensitive information to your repository. Use environment variables for all secrets.

2. **JWT Secret**: Use a strong, unique JWT secret for production.

3. **HTTPS**: Set up HTTPS using a reverse proxy like Nginx with Let's Encrypt certificates.

4. **MongoDB Security**: Consider enabling authentication for MongoDB in production.

### Database Backups

Set up regular backups for your MongoDB database:

```bash
# Example backup command
docker exec -it arabotiq-marketing-ai_mongo_1 mongodump --out /backup/$(date +%Y-%m-%d)
```

### Monitoring and Logging

Consider setting up monitoring tools like:
- Prometheus and Grafana for metrics
- ELK stack for logging

### Scaling

If needed, you can scale the application horizontally by:
1. Setting up a load balancer
2. Running multiple instances of the application container
3. Using a MongoDB replica set for database redundancy

## Troubleshooting

### Common Issues

1. **Database Connection Errors**:
   - Verify MongoDB is running: `docker-compose ps`
   - Check MongoDB logs: `docker-compose logs mongo`
   - Ensure the connection string in `.env.production` is correct

2. **API Key Issues**:
   - Ensure all required API keys are properly set in the `.env.production` file
   - Check application logs for API-related errors

3. **Port Conflicts**:
   - Make sure port 3000 is not being used by another service
   - If needed, modify the port mapping in `docker-compose.yml`

### Restarting Services

```bash
# Restart the application container
docker-compose restart app

# Restart all services
docker-compose restart
```

## Updating the Application

To update the application to a new version:

```bash
# Pull the latest code
git pull

# Rebuild and restart containers
docker-compose up -d --build
```

## Backup and Restore

### Backup

```bash
# Backup MongoDB data
docker exec -it arabotiq-marketing-ai_mongo_1 mongodump --out /backup/$(date +%Y-%m-%d)

# Copy backup from container to host
docker cp arabotiq-marketing-ai_mongo_1:/backup ./backup
```

### Restore

```bash
# Copy backup to container
docker cp ./backup arabotiq-marketing-ai_mongo_1:/backup

# Restore from backup
docker exec -it arabotiq-marketing-ai_mongo_1 mongorestore /backup/your-backup-folder
```