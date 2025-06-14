# Production Deployment

This comprehensive guide covers deploying the Task Management WebUI to production environments, including cloud platforms, on-premises servers, and containerized deployments.

## 🌍 Deployment Overview

### Deployment Options

**Cloud Platforms**:
- **AWS**: EC2, ECS, Lambda, RDS
- **Google Cloud**: Compute Engine, Cloud Run, Cloud SQL
- **Microsoft Azure**: App Service, Container Instances, SQL Database
- **DigitalOcean**: Droplets, App Platform, Managed Databases
- **Vercel**: Frontend deployment with serverless functions
- **Netlify**: Static site deployment with edge functions

**Containerized Deployment**:
- **Docker Compose**: Single-server deployment
- **Kubernetes**: Multi-server orchestration
- **Docker Swarm**: Simple container orchestration

**Traditional Hosting**:
- **VPS**: Virtual private servers
- **Dedicated Servers**: Bare metal hosting
- **Shared Hosting**: Budget-friendly option (limited)

## 📍 Pre-Deployment Checklist

### Security Preparation

**Environment Variables**:
```bash
# Production environment variables
NODE_ENV=production
DATABASE_URL=postgresql://user:password@host:5432/database
JWT_SECRET=your-super-secure-jwt-secret-key
CORS_ORIGIN=https://yourdomain.com
SSL_CERT_PATH=/path/to/ssl/cert.pem
SSL_KEY_PATH=/path/to/ssl/private.key
```

**Security Hardening**:
- [ ] Strong database passwords
- [ ] JWT secret keys (256-bit minimum)
- [ ] SSL/TLS certificates configured
- [ ] CORS origins restricted to production domains
- [ ] Rate limiting configured
- [ ] Input validation enabled
- [ ] SQL injection protection active

### Performance Optimization

**Frontend Optimization**:
```bash
# Build optimized frontend
cd frontend
npm run build

# Verify build size
ls -la dist/

# Test production build locally
npm run preview
```

**Backend Optimization**:
```bash
# Build backend
cd backend
npm run build

# Remove development dependencies
npm ci --production
```

**Database Optimization**:
- [ ] Indexes created for frequently queried columns
- [ ] Connection pooling configured
- [ ] Database backup strategy implemented
- [ ] Monitoring and alerting set up

## 🐳 Docker Production Deployment

### Production Docker Configuration

**docker-compose.prod.yml**:
```yaml
version: '3.8'

services:
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.prod
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./ssl:/etc/nginx/ssl:ro
    environment:
      - VITE_API_URL=https://yourdomain.com/api
      - VITE_WS_URL=wss://yourdomain.com
    depends_on:
      - backend
    restart: unless-stopped

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile.prod
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - JWT_SECRET=${JWT_SECRET}
      - CORS_ORIGIN=https://yourdomain.com
    depends_on:
      - postgres
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3001/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  postgres:
    image: ankane/pgvector:latest
    environment:
      - POSTGRES_DB=mcp_learning
      - POSTGRES_USER=mcp_user
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./infrastructure/postgres/init-postgres:/docker-entrypoint-initdb.d
    ports:
      - "5432:5432"
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U mcp_user -d mcp_learning"]
      interval: 10s
      timeout: 5s
      retries: 5

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
      - frontend_dist:/usr/share/nginx/html:ro
    depends_on:
      - frontend
      - backend
    restart: unless-stopped

volumes:
  postgres_data:
  frontend_dist:

networks:
  default:
    driver: bridge
```

### Production Dockerfiles

**Frontend Dockerfile.prod**:
```dockerfile
# Build stage
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Copy built assets
COPY --from=builder /app/dist /usr/share/nginx/html

# Add health check
RUN apk add --no-cache curl
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:80/health || exit 1

EXPOSE 80 443
CMD ["nginx", "-g", "daemon off;"]
```

**Backend Dockerfile.prod**:
```dockerfile
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copy built application
COPY --from=builder /app/dist ./dist

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001
USER nodejs

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node dist/healthcheck.js || exit 1

CMD ["node", "dist/index.js"]
```

### SSL/TLS Configuration

**Nginx SSL Configuration**:
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/private.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Frontend
    location / {
        root /usr/share/nginx/html;
        index index.html;
        try_files $uri $uri/ /index.html;
        
        # Security headers
        add_header X-Frame-Options DENY;
        add_header X-Content-Type-Options nosniff;
        add_header X-XSS-Protection "1; mode=block";
        add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    }

    # Backend API
    location /api {
        proxy_pass http://backend:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # WebSocket
    location /socket.io {
        proxy_pass http://backend:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## ☁️ Cloud Platform Deployments

### AWS Deployment

**EC2 + RDS Setup**:
```bash
# Launch EC2 instance (Ubuntu 22.04 LTS)
# Instance type: t3.medium or larger
# Security groups: HTTP (80), HTTPS (443), SSH (22)

# Connect to instance
ssh -i your-key.pem ubuntu@your-ec2-instance

# Install Docker
sudo apt update
sudo apt install docker.io docker-compose-plugin
sudo usermod -aG docker ubuntu

# Clone repository
git clone https://github.com/anubissbe/task-management-webui.git
cd task-management-webui

# Configure environment
cp .env.example .env
nano .env  # Edit with production values

# Deploy
docker compose -f docker-compose.prod.yml up -d
```

**AWS RDS PostgreSQL**:
```bash
# Create RDS instance
# Engine: PostgreSQL 15
# Instance class: db.t3.micro (minimum)
# Storage: 20GB SSD
# Security group: Allow PostgreSQL (5432) from application servers

# Update DATABASE_URL in .env
DATABASE_URL=postgresql://username:password@rds-endpoint:5432/database
```

### DigitalOcean App Platform

**app.yaml**:
```yaml
name: task-management-webui
services:
- name: frontend
  source_dir: frontend
  github:
    repo: anubissbe/task-management-webui
    branch: main
  build_command: npm run build
  output_dir: dist
  routes:
  - path: /
  environment_slug: node-js
  instance_count: 1
  instance_size_slug: basic-xxs

- name: backend
  source_dir: backend
  github:
    repo: anubissbe/task-management-webui
    branch: main
  build_command: npm run build
  run_command: npm start
  environment_slug: node-js
  instance_count: 1
  instance_size_slug: basic-xxs
  envs:
  - key: NODE_ENV
    value: production
  - key: DATABASE_URL
    value: ${db.DATABASE_URL}
  routes:
  - path: /api

databases:
- name: db
  engine: PG
  version: "15"
  size: db-s-dev-database
```

### Vercel Deployment (Frontend Only)

**vercel.json**:
```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "handle": "filesystem"
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ],
  "env": {
    "VITE_API_URL": "https://your-backend-api.com/api",
    "VITE_WS_URL": "wss://your-backend-api.com"
  }
}
```

## ⚙️ Kubernetes Deployment

### Kubernetes Configuration

**namespace.yaml**:
```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: task-management
```

**configmap.yaml**:
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
  namespace: task-management
data:
  NODE_ENV: "production"
  CORS_ORIGIN: "https://yourdomain.com"
  VITE_API_URL: "https://yourdomain.com/api"
  VITE_WS_URL: "wss://yourdomain.com"
```

**secrets.yaml**:
```yaml
apiVersion: v1
kind: Secret
metadata:
  name: app-secrets
  namespace: task-management
type: Opaque
data:
  DATABASE_URL: <base64-encoded-database-url>
  JWT_SECRET: <base64-encoded-jwt-secret>
  POSTGRES_PASSWORD: <base64-encoded-password>
```

**backend-deployment.yaml**:
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: backend
  namespace: task-management
spec:
  replicas: 2
  selector:
    matchLabels:
      app: backend
  template:
    metadata:
      labels:
        app: backend
    spec:
      containers:
      - name: backend
        image: your-registry/task-management-backend:latest
        ports:
        - containerPort: 3001
        envFrom:
        - configMapRef:
            name: app-config
        - secretRef:
            name: app-secrets
        livenessProbe:
          httpGet:
            path: /api/health
            port: 3001
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /api/health
            port: 3001
          initialDelaySeconds: 5
          periodSeconds: 5
        resources:
          limits:
            cpu: 500m
            memory: 512Mi
          requests:
            cpu: 250m
            memory: 256Mi
```

**frontend-deployment.yaml**:
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: frontend
  namespace: task-management
spec:
  replicas: 2
  selector:
    matchLabels:
      app: frontend
  template:
    metadata:
      labels:
        app: frontend
    spec:
      containers:
      - name: frontend
        image: your-registry/task-management-frontend:latest
        ports:
        - containerPort: 80
        livenessProbe:
          httpGet:
            path: /health
            port: 80
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 80
          initialDelaySeconds: 5
          periodSeconds: 5
        resources:
          limits:
            cpu: 250m
            memory: 256Mi
          requests:
            cpu: 100m
            memory: 128Mi
```

**ingress.yaml**:
```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: app-ingress
  namespace: task-management
  annotations:
    kubernetes.io/ingress.class: nginx
    cert-manager.io/cluster-issuer: letsencrypt-prod
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
spec:
  tls:
  - hosts:
    - yourdomain.com
    secretName: app-tls
  rules:
  - host: yourdomain.com
    http:
      paths:
      - path: /api
        pathType: Prefix
        backend:
          service:
            name: backend-service
            port:
              number: 3001
      - path: /
        pathType: Prefix
        backend:
          service:
            name: frontend-service
            port:
              number: 80
```

## 📊 Monitoring and Logging

### Application Monitoring

**Health Check Endpoints**:
```typescript
// backend/src/routes/health.ts
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: process.env.APP_VERSION || '1.0.0'
  });
});

app.get('/api/health/detailed', async (req, res) => {
  try {
    // Check database connection
    await pool.query('SELECT 1');
    
    res.json({
      status: 'healthy',
      checks: {
        database: 'connected',
        memory: process.memoryUsage(),
        uptime: process.uptime()
      }
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: error.message
    });
  }
});
```

**Prometheus Metrics**:
```typescript
import prometheus from 'prom-client';

// Create metrics
const httpRequestDuration = new prometheus.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status']
});

const httpRequestTotal = new prometheus.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status']
});

// Middleware to collect metrics
app.use((req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    const route = req.route?.path || req.path;
    
    httpRequestDuration
      .labels(req.method, route, res.statusCode.toString())
      .observe(duration);
      
    httpRequestTotal
      .labels(req.method, route, res.statusCode.toString())
      .inc();
  });
  
  next();
});

// Metrics endpoint
app.get('/metrics', (req, res) => {
  res.set('Content-Type', prometheus.register.contentType);
  res.end(prometheus.register.metrics());
});
```

### Logging Configuration

**Winston Logger Setup**:
```typescript
import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'task-management-api' },
  transports: [
    new winston.transports.File({ 
      filename: 'logs/error.log', 
      level: 'error' 
    }),
    new winston.transports.File({ 
      filename: 'logs/combined.log' 
    })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}
```

## 🛡️ Security Hardening

### Application Security

**Security Headers**:
```typescript
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "wss:"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP'
});

app.use('/api', limiter);
```

### Database Security

**Connection Security**:
```typescript
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: false
  } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});
```

## 🗺 Deployment Pipeline

### CI/CD with GitHub Actions

**.github/workflows/deploy.yml**:
```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]
  workflow_dispatch:

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'
        cache-dependency-path: '**/package-lock.json'
    
    - name: Install and test frontend
      run: |
        cd frontend
        npm ci
        npm run lint
        npm run type-check
        npm test
        npm run build
    
    - name: Install and test backend
      run: |
        cd backend
        npm ci
        npm run lint
        npm run test
        npm run build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Setup Docker Buildx
      uses: docker/setup-buildx-action@v3
    
    - name: Login to Docker Hub
      uses: docker/login-action@v3
      with:
        username: ${{ secrets.DOCKER_USERNAME }}
        password: ${{ secrets.DOCKER_PASSWORD }}
    
    - name: Build and push images
      run: |
        docker buildx build --platform linux/amd64,linux/arm64 \
          -t ${{ secrets.DOCKER_USERNAME }}/task-management-frontend:latest \
          --push ./frontend
        
        docker buildx build --platform linux/amd64,linux/arm64 \
          -t ${{ secrets.DOCKER_USERNAME }}/task-management-backend:latest \
          --push ./backend
    
    - name: Deploy to server
      uses: appleboy/ssh-action@v0.1.5
      with:
        host: ${{ secrets.HOST }}
        username: ${{ secrets.USERNAME }}
        key: ${{ secrets.SSH_KEY }}
        script: |
          cd /opt/task-management-webui
          git pull origin main
          docker compose -f docker-compose.prod.yml pull
          docker compose -f docker-compose.prod.yml up -d
          docker system prune -f
```

### Blue-Green Deployment

**Blue-Green Script**:
```bash
#!/bin/bash
# blue-green-deploy.sh

set -e

CURRENT_ENV=$(docker compose -f docker-compose.prod.yml ps --services --filter "status=running" | head -1 | grep -o 'blue\|green' || echo 'blue')
NEW_ENV=$([ "$CURRENT_ENV" = "blue" ] && echo "green" || echo "blue")

echo "Current environment: $CURRENT_ENV"
echo "Deploying to: $NEW_ENV"

# Deploy to new environment
docker compose -f docker-compose.$NEW_ENV.yml pull
docker compose -f docker-compose.$NEW_ENV.yml up -d

# Health check
echo "Waiting for health check..."
sleep 30

if curl -f http://localhost:8080/api/health; then
    echo "Health check passed. Switching traffic..."
    
    # Update load balancer to point to new environment
    # This depends on your load balancer setup
    
    # Stop old environment
    docker compose -f docker-compose.$CURRENT_ENV.yml down
    
    echo "Deployment successful!"
else
    echo "Health check failed. Rolling back..."
    docker compose -f docker-compose.$NEW_ENV.yml down
    exit 1
fi
```

---

**Next**: Learn about [Docker Configuration](Docker-Configuration) for advanced container setup.