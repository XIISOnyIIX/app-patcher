# Deployment Guide

This guide covers deploying FoodDealSniper to various production environments.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Docker Deployment](#docker-deployment)
- [Cloud Platform Deployment](#cloud-platform-deployment)
- [Kubernetes Deployment](#kubernetes-deployment)
- [Monitoring & Logging](#monitoring--logging)
- [Backup & Recovery](#backup--recovery)
- [Scaling](#scaling)

## Prerequisites

Before deploying, ensure you have:

1. **Environment Variables** configured (see [ENVIRONMENT.md](./ENVIRONMENT.md))
2. **Docker** installed (for containerized deployments)
3. **Domain name** configured with DNS
4. **SSL certificates** for HTTPS (Let's Encrypt recommended)
5. **CI/CD pipeline** set up (GitHub Actions included)

## Docker Deployment

### Local Docker Deployment

For local testing with Docker:

```bash
# Build and run with development configuration
docker-compose up --build

# Access the application
# Frontend: http://localhost:5173
# Backend: http://localhost:4000
```

### Production Docker Deployment

1. **Configure environment variables:**

```bash
cp .env.example .env.production
# Edit .env.production with production values
```

2. **Build production images:**

```bash
docker-compose -f docker-compose.production.yml build
```

3. **Run production services:**

```bash
docker-compose -f docker-compose.production.yml up -d
```

4. **Verify deployment:**

```bash
# Check service status
docker-compose -f docker-compose.production.yml ps

# View logs
docker-compose -f docker-compose.production.yml logs -f

# Check health
curl http://localhost:4000/health
```

### Docker Registry

Push images to a registry for deployment:

```bash
# Tag images
docker tag fooddealsniper:latest your-registry.com/fooddealsniper:latest

# Push to registry
docker push your-registry.com/fooddealsniper:latest

# Pull and run on production server
docker pull your-registry.com/fooddealsniper:latest
docker run -d -p 4000:4000 --env-file .env.production your-registry.com/fooddealsniper:latest
```

## Cloud Platform Deployment

### AWS Elastic Beanstalk

1. **Install EB CLI:**

```bash
pip install awsebcli
```

2. **Initialize EB application:**

```bash
eb init -p docker fooddealsniper
```

3. **Create environment:**

```bash
eb create fooddealsniper-prod
```

4. **Configure environment variables:**

```bash
eb setenv NODE_ENV=production PORT=4000 CORS_ORIGIN=https://yourdomain.com
```

5. **Deploy:**

```bash
eb deploy
```

### AWS ECS (Elastic Container Service)

1. **Create ECR repository:**

```bash
aws ecr create-repository --repository-name fooddealsniper
```

2. **Build and push image:**

```bash
# Authenticate Docker to ECR
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com

# Build and tag
docker build -f Dockerfile.production -t fooddealsniper .
docker tag fooddealsniper:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/fooddealsniper:latest

# Push
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/fooddealsniper:latest
```

3. **Create ECS task definition:**

```json
{
  "family": "fooddealsniper",
  "networkMode": "awsvpc",
  "containerDefinitions": [
    {
      "name": "backend",
      "image": "<account-id>.dkr.ecr.us-east-1.amazonaws.com/fooddealsniper:latest",
      "portMappings": [
        {
          "containerPort": 4000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        }
      ],
      "secrets": [
        {
          "name": "DATABASE_URL",
          "valueFrom": "arn:aws:secretsmanager:region:account-id:secret:prod/database-url"
        }
      ]
    }
  ]
}
```

### Google Cloud Platform (Cloud Run)

1. **Build and submit image:**

```bash
gcloud builds submit --tag gcr.io/PROJECT-ID/fooddealsniper
```

2. **Deploy to Cloud Run:**

```bash
gcloud run deploy fooddealsniper \
  --image gcr.io/PROJECT-ID/fooddealsniper \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars NODE_ENV=production,PORT=4000
```

3. **Set secrets:**

```bash
gcloud run services update fooddealsniper \
  --update-secrets DATABASE_URL=database-url:latest
```

### Heroku

1. **Create Heroku app:**

```bash
heroku create fooddealsniper
```

2. **Add buildpack:**

```bash
heroku buildpacks:set heroku/nodejs
```

3. **Set environment variables:**

```bash
heroku config:set NODE_ENV=production
heroku config:set PORT=4000
```

4. **Deploy:**

```bash
git push heroku main
```

### DigitalOcean App Platform

1. **Create `app.yaml`:**

```yaml
name: fooddealsniper
services:
  - name: backend
    dockerfile_path: Dockerfile.production
    github:
      repo: yourusername/fooddealsniper
      branch: main
      deploy_on_push: true
    envs:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: '4000'
    http_port: 4000
    health_check:
      http_path: /health
    instance_count: 1
    instance_size_slug: basic-xxs
```

2. **Deploy:**

```bash
doctl apps create --spec app.yaml
```

### Azure Container Instances

1. **Create resource group:**

```bash
az group create --name fooddealsniper-rg --location eastus
```

2. **Create container instance:**

```bash
az container create \
  --resource-group fooddealsniper-rg \
  --name fooddealsniper \
  --image youracr.azurecr.io/fooddealsniper:latest \
  --dns-name-label fooddealsniper \
  --ports 4000 \
  --environment-variables NODE_ENV=production PORT=4000
```

## Kubernetes Deployment

### 1. Create Kubernetes Manifests

**deployment.yaml:**

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: fooddealsniper-backend
  labels:
    app: fooddealsniper
    component: backend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: fooddealsniper
      component: backend
  template:
    metadata:
      labels:
        app: fooddealsniper
        component: backend
    spec:
      containers:
        - name: backend
          image: your-registry.com/fooddealsniper:latest
          ports:
            - containerPort: 4000
          env:
            - name: NODE_ENV
              value: 'production'
            - name: PORT
              value: '4000'
          envFrom:
            - secretRef:
                name: fooddealsniper-secrets
          livenessProbe:
            httpGet:
              path: /health
              port: 4000
            initialDelaySeconds: 30
            periodSeconds: 10
          readinessProbe:
            httpGet:
              path: /health
              port: 4000
            initialDelaySeconds: 5
            periodSeconds: 5
          resources:
            requests:
              memory: '256Mi'
              cpu: '250m'
            limits:
              memory: '512Mi'
              cpu: '500m'
---
apiVersion: v1
kind: Service
metadata:
  name: fooddealsniper-backend
spec:
  selector:
    app: fooddealsniper
    component: backend
  ports:
    - protocol: TCP
      port: 4000
      targetPort: 4000
  type: ClusterIP
---
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: fooddealsniper-ingress
  annotations:
    cert-manager.io/cluster-issuer: 'letsencrypt-prod'
    nginx.ingress.kubernetes.io/ssl-redirect: 'true'
spec:
  tls:
    - hosts:
        - api.fooddealsniper.com
      secretName: fooddealsniper-tls
  rules:
    - host: api.fooddealsniper.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: fooddealsniper-backend
                port:
                  number: 4000
```

**secrets.yaml:**

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: fooddealsniper-secrets
type: Opaque
stringData:
  DATABASE_URL: postgresql://user:password@host:5432/db
  JWT_SECRET: your-secret-key
  SCRAPER_PROXY_URL: http://proxy:8080
```

### 2. Deploy to Kubernetes

```bash
# Create namespace
kubectl create namespace fooddealsniper

# Apply secrets
kubectl apply -f secrets.yaml -n fooddealsniper

# Apply deployment
kubectl apply -f deployment.yaml -n fooddealsniper

# Check status
kubectl get pods -n fooddealsniper
kubectl get services -n fooddealsniper
kubectl get ingress -n fooddealsniper

# View logs
kubectl logs -f deployment/fooddealsniper-backend -n fooddealsniper
```

### 3. Horizontal Pod Autoscaling

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: fooddealsniper-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: fooddealsniper-backend
  minReplicas: 2
  maxReplicas: 10
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70
    - type: Resource
      resource:
        name: memory
        target:
          type: Utilization
          averageUtilization: 80
```

## Monitoring & Logging

### Application Logging

**Structured logging with Winston:**

```typescript
import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
  );
}
```

### Monitoring with Prometheus

**metrics endpoint:**

```typescript
import promClient from 'prom-client';

const register = new promClient.Registry();
promClient.collectDefaultMetrics({ register });

const httpRequestDuration = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register],
});

app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});
```

### Error Tracking with Sentry

```typescript
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});

app.use(Sentry.Handlers.requestHandler());
app.use(Sentry.Handlers.errorHandler());
```

### Health Checks

```typescript
app.get('/health', async (req, res) => {
  const health = {
    uptime: process.uptime(),
    timestamp: Date.now(),
    status: 'ok',
    checks: {
      database: await checkDatabase(),
      memory: checkMemory(),
      scraper: checkScraper(),
    },
  };

  const isHealthy = Object.values(health.checks).every((check) => check.status === 'ok');
  res.status(isHealthy ? 200 : 503).json(health);
});
```

## Backup & Recovery

### Data Backup Strategy

1. **Automated backups** - Schedule daily backups
2. **Retention policy** - Keep 30 daily, 12 monthly backups
3. **Off-site storage** - Store backups in different region/provider
4. **Encryption** - Encrypt backups at rest
5. **Testing** - Regularly test restore procedures

### Database Backup (PostgreSQL example)

```bash
# Backup
pg_dump -h localhost -U postgres -d fooddealsniper | \
  gzip > backup-$(date +%Y%m%d-%H%M%S).sql.gz

# Restore
gunzip < backup-20240101-120000.sql.gz | \
  psql -h localhost -U postgres -d fooddealsniper
```

### Docker Volume Backup

```bash
# Backup volume
docker run --rm -v app-data:/data -v $(pwd):/backup \
  alpine tar czf /backup/data-backup-$(date +%Y%m%d).tar.gz /data

# Restore volume
docker run --rm -v app-data:/data -v $(pwd):/backup \
  alpine tar xzf /backup/data-backup-20240101.tar.gz -C /
```

## Scaling

### Vertical Scaling

Increase resources for single instance:

```bash
# Docker
docker-compose -f docker-compose.production.yml up -d --scale backend=1 \
  --no-recreate

# Update resource limits in docker-compose.production.yml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
```

### Horizontal Scaling

Run multiple instances:

```bash
# Docker Compose
docker-compose -f docker-compose.production.yml up -d --scale backend=3

# Kubernetes
kubectl scale deployment fooddealsniper-backend --replicas=5 -n fooddealsniper
```

### Load Balancing

**Nginx configuration:**

```nginx
upstream backend {
    least_conn;
    server backend1:4000;
    server backend2:4000;
    server backend3:4000;
}

server {
    listen 80;
    server_name api.fooddealsniper.com;

    location / {
        proxy_pass http://backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### Caching Strategy

**Redis for caching:**

```typescript
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

async function getDealsWithCache(): Promise<Deal[]> {
  const cached = await redis.get('deals');
  if (cached) {
    return JSON.parse(cached);
  }

  const deals = await dealService.searchAndFilter({});
  await redis.setex('deals', 300, JSON.stringify(deals)); // 5 min TTL
  return deals;
}
```

## SSL/TLS Configuration

### Let's Encrypt with Certbot

```bash
# Install certbot
sudo apt-get install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal is configured by default
# Test renewal
sudo certbot renew --dry-run
```

### Docker with Let's Encrypt

Use a reverse proxy container:

```yaml
services:
  nginx-proxy:
    image: nginxproxy/nginx-proxy
    ports:
      - '80:80'
      - '443:443'
    volumes:
      - /var/run/docker.sock:/tmp/docker.sock:ro
      - certs:/etc/nginx/certs
      - vhost:/etc/nginx/vhost.d
      - html:/usr/share/nginx/html

  acme-companion:
    image: nginxproxy/acme-companion
    volumes_from:
      - nginx-proxy
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
      - acme:/etc/acme.sh

  backend:
    environment:
      - VIRTUAL_HOST=api.yourdomain.com
      - LETSENCRYPT_HOST=api.yourdomain.com
      - LETSENCRYPT_EMAIL=admin@yourdomain.com
```

## Rollback Procedures

### Docker Rollback

```bash
# List previous images
docker images fooddealsniper

# Stop current version
docker-compose -f docker-compose.production.yml down

# Run previous version
docker run -d -p 4000:4000 --env-file .env.production \
  fooddealsniper:previous-tag

# Or update docker-compose.yml with previous tag and restart
docker-compose -f docker-compose.production.yml up -d
```

### Kubernetes Rollback

```bash
# View rollout history
kubectl rollout history deployment/fooddealsniper-backend -n fooddealsniper

# Rollback to previous revision
kubectl rollout undo deployment/fooddealsniper-backend -n fooddealsniper

# Rollback to specific revision
kubectl rollout undo deployment/fooddealsniper-backend --to-revision=2 -n fooddealsniper
```

## Troubleshooting

### Common Issues

**1. Container won't start**

```bash
# Check logs
docker logs <container-id>

# Check resource constraints
docker stats

# Verify environment variables
docker exec <container-id> env
```

**2. High memory usage**

```bash
# Check Node.js heap
docker exec <container-id> node -e "console.log(process.memoryUsage())"

# Increase memory limit
docker run -m 512m ...
```

**3. Connection issues**

```bash
# Test connectivity
docker exec <container-id> curl http://localhost:4000/health

# Check network
docker network inspect fooddealsniper

# Verify DNS
docker exec <container-id> nslookup database-host
```

## Security Checklist

- [ ] Environment variables properly secured
- [ ] SSL/TLS certificates installed and auto-renewing
- [ ] Firewall rules configured
- [ ] Regular security updates applied
- [ ] Secrets rotated regularly
- [ ] Access logs monitored
- [ ] Rate limiting enabled
- [ ] CORS properly configured
- [ ] Security headers set
- [ ] Dependencies regularly updated

## Performance Checklist

- [ ] Caching implemented
- [ ] Database indexes optimized
- [ ] Static assets compressed
- [ ] CDN configured for frontend
- [ ] Connection pooling enabled
- [ ] Response compression enabled
- [ ] Monitoring and alerting set up
- [ ] Load testing performed

## Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [AWS Documentation](https://docs.aws.amazon.com/)
- [Node.js Production Best Practices](https://nodejs.org/en/docs/guides/nodejs-docker-webapp/)
- [12-Factor App Methodology](https://12factor.net/)
