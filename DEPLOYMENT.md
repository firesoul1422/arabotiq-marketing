# Deployment Guide for Arabotiq Marketing AI

This guide provides instructions for deploying the Arabotiq Marketing AI application to a production environment.

## Prerequisites

- Docker and Docker Compose installed on your server
- Access to a domain name (for production deployment)
- API keys for all required services (OpenAI, Stripe, etc.)
- Note: Social media credentials are collected during user onboarding, not as environment variables

## Deployment Steps

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd arabotiq-marketing-ai
```

### 2. Configure Environment Variables

Create a production environment file:

```bash
cp .env.production .env
```

Edit the `.env` file and fill in all required API keys and configuration values.

**Important**: Make sure to set strong, unique values for security-sensitive variables like `JWT_SECRET`.

### 3. Build and Start the Application

```bash
docker-compose up -d
```

This will build the Docker image and start both the application and MongoDB database.

### 4. Verify Deployment

Check if the containers are running:

```bash
docker-compose ps
```

Access the API at `http://your-server-ip:3000` or your configured domain.

## Production Considerations

### Database Backups

Set up regular backups for your MongoDB database:

```bash
# Example backup command
docker exec -it arabotiq-marketing-ai_mongo_1 mongodump --out /backup/$(date +%Y-%m-%d)
```

### SSL/TLS Configuration

For production, you should set up HTTPS using a reverse proxy like Nginx with Let's Encrypt certificates.

### Monitoring

Consider setting up monitoring tools like:
- PM2 for process management
- Prometheus and Grafana for metrics
- ELK stack for logging

### Scaling

If needed, you can scale the application horizontally by:
1. Setting up a load balancer
2. Running multiple instances of the application container
3. Using a MongoDB replica set for database redundancy

## Troubleshooting

### Checking Logs

```bash
docker-compose logs -f app
```

### Restarting Services

```bash
docker-compose restart app
```

### Common Issues

- **Database Connection Errors**: Verify MongoDB is running and the connection string is correct
- **API Key Issues**: Ensure all required API keys are properly set in the .env file
- **Port Conflicts**: Make sure port 3000 is not being used by another service