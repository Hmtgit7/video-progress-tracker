# Deployment Guide for Video Progress Tracker

This guide provides instructions for deploying the Video Progress Tracker application in various environments using Docker.

## Local Development Deployment

For local development with hot reloading:

1. Clone the repository:
   ```bash
   git clone https://github.com/Hmtgit7/video-progress-tracker.git
   cd video-progress-tracker
   ```

2. Create a `.env` file in the root directory using the template in `.env.template`.

3. Start the development environment:
   ```bash
   docker-compose up
   ```

4. Access the application:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## Production Deployment

For production deployment:

1. Clone the repository:
   ```bash
   git clone https://github.com/Hmtgit7/video-progress-tracker.git
   cd video-progress-tracker
   ```

2. Create a `.env` file with production settings:
   ```
   PGUSER=postgres
   PGPASSWORD=secure_password_here
   PGDATABASE=video_progress_tracker
   JWT_SECRET=your_secure_jwt_secret
   JWT_REFRESH_SECRET=your_secure_refresh_token_secret
   NODE_ENV=production
   ```

3. Deploy using the production Docker Compose configuration:
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

4. Access the application at http://your-server-ip

## Deployment on Cloud Providers

### AWS Elastic Beanstalk

1. Install the EB CLI:
   ```bash
   pip install awsebcli
   ```

2. Initialize EB application:
   ```bash
   eb init -p docker video-progress-tracker
   ```

3. Create and deploy to an environment:
   ```bash
   eb create production
   ```

### Digital Ocean App Platform

1. Create a new app on the Digital Ocean App Platform
2. Connect your GitHub repository
3. Set up the environment variables (as listed in `.env.template`)
4. Deploy the application

## Database Migrations

When updating the database schema:

1. Run migrations in the Docker container:
   ```bash
   docker-compose exec backend npm run db:migrate
   ```

## Backup and Restore

### Backup the Database

```bash
docker-compose exec postgres pg_dump -U postgres video_progress_tracker > backup.sql
```

### Restore the Database

```bash
cat backup.sql | docker-compose exec -T postgres psql -U postgres video_progress_tracker
```

## SSL Configuration

For production deployment with SSL:

1. Update the `nginx.conf` in the client directory to include SSL settings
2. Use a reverse proxy like Traefik or Nginx to handle SSL termination
3. Use Let's Encrypt for free SSL certificates

## Monitoring

To monitor the application:

1. Set up Prometheus and Grafana containers:
   ```bash
   # Add to docker-compose.prod.yml
   prometheus:
     image: prom/prometheus
     volumes:
       - ./prometheus.yml:/etc/prometheus/prometheus.yml
     ports:
       - "9090:9090"
   
   grafana:
     image: grafana/grafana
     ports:
       - "3001:3000"
     depends_on:
       - prometheus
   ```

2. Configure Prometheus to scrape metrics from your services

## Troubleshooting

### Common Issues

1. **Database Connection Issues**:
   - Ensure PostgreSQL is running: `docker-compose ps`
   - Check logs: `docker-compose logs postgres`
   - Verify environment variables: `docker-compose exec backend printenv | grep PG`

2. **API Connection Issues**:
   - Check if the backend is running: `docker-compose ps`
   - Verify network connectivity: `docker-compose exec frontend ping backend`
   - Check logs: `docker-compose logs backend`

3. **Frontend Not Loading**:
   - Verify Nginx configuration: `docker-compose exec frontend cat /etc/nginx/conf.d/default.conf`
   - Check logs: `docker-compose logs frontend`

### Getting Help

If you encounter issues not covered here, please:

1. Check the GitHub repository issues: https://github.com/Hmtgit7/video-progress-tracker/issues
2. Create a new issue with detailed information about your problem
3. Include logs, error messages, and environment details