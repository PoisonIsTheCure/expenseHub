# ExpenseHub Deployment Guide

This guide covers deployment options for ExpenseHub in various environments.

## Table of Contents

1. [Local Development](#local-development)
2. [Docker Production Deployment](#docker-production-deployment)
3. [Environment Variables](#environment-variables)
4. [Database Backup](#database-backup)
5. [Scaling](#scaling)

---

## Local Development

### Prerequisites

- Node.js 18+
- MongoDB (or Docker)
- npm or pnpm

### Backend Development

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your configuration
npm run dev
```

The backend will start on `http://localhost:5000`

### Frontend Development

```bash
cd frontend
npm install
npm run dev
```

The frontend will start on `http://localhost:3000`

### Using Docker Compose for Development

```bash
docker-compose -f docker-compose.dev.yml up
```

This starts all services with hot-reload enabled.

---

## Docker Production Deployment

### Quick Start

1. **Clone and configure**:
```bash
git clone <your-repo>
cd expenseHub
cp .env.example .env
```

2. **Edit `.env` file** with production values:
```bash
JWT_SECRET=your-super-secret-production-key-min-32-characters
ADMIN_EMAIL=your-admin@email.com
ADMIN_PASSWORD=YourStrongPassword123!
```

3. **Build and start**:
```bash
docker-compose up --build -d
```

4. **Access the application**:
- Application: http://your-server-ip
- Backend API: http://your-server-ip/api

### Stopping the Application

```bash
docker-compose down
```

To stop and remove all data (including database):
```bash
docker-compose down -v
```

---

## Environment Variables

### Backend Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `NODE_ENV` | Environment (development/production) | development | No |
| `PORT` | Backend server port | 5000 | No |
| `MONGODB_URI` | MongoDB connection string | mongodb://localhost:27017/expensehub | Yes |
| `JWT_SECRET` | Secret key for JWT tokens | - | Yes |
| `JWT_EXPIRES_IN` | JWT token expiration | 7d | No |
| `ADMIN_EMAIL` | Default admin email | admin@expensehub.com | No |
| `ADMIN_PASSWORD` | Default admin password | Admin@123456 | No |

### Frontend Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | API base URL | /api |

---

## Database Backup

### Backup MongoDB

```bash
# Backup
docker exec expensehub-mongodb mongodump --db expensehub --out /backup
docker cp expensehub-mongodb:/backup ./backup

# Or with docker-compose
docker-compose exec mongodb mongodump --db expensehub --out /backup
```

### Restore MongoDB

```bash
# Restore
docker cp ./backup expensehub-mongodb:/backup
docker exec expensehub-mongodb mongorestore --db expensehub /backup/expensehub

# Or with docker-compose
docker-compose exec -T mongodb mongorestore --db expensehub /backup/expensehub
```

### Automated Backup Script

Create a backup script `backup.sh`:

```bash
#!/bin/bash
BACKUP_DIR="./backups"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

docker-compose exec -T mongodb mongodump --db expensehub --archive > $BACKUP_DIR/expensehub_$DATE.archive

# Keep only last 7 days of backups
find $BACKUP_DIR -name "expensehub_*.archive" -mtime +7 -delete
```

---

## Scaling

### Horizontal Scaling

To scale the backend:

```bash
docker-compose up --scale backend=3
```

Update nginx.conf to use multiple backend instances:

```nginx
upstream backend {
    server backend:5000;
    server backend:5000;
    server backend:5000;
}
```

### Load Balancing

Nginx is already configured as a reverse proxy. For production, consider:

1. **SSL/TLS**: Add SSL certificates using Let's Encrypt
2. **CDN**: Use a CDN for static assets
3. **Database Replication**: Configure MongoDB replica set

---

## Production Checklist

- [ ] Change `JWT_SECRET` to a strong random value
- [ ] Change default admin credentials
- [ ] Configure firewall rules
- [ ] Set up SSL/TLS certificates
- [ ] Configure automated backups
- [ ] Set up monitoring and logging
- [ ] Configure environment-specific CORS origins
- [ ] Review and harden security settings
- [ ] Set up CI/CD pipeline
- [ ] Configure domain name and DNS

---

## Troubleshooting

### Container won't start

Check logs:
```bash
docker-compose logs backend
docker-compose logs frontend
docker-compose logs mongodb
```

### Database connection issues

1. Ensure MongoDB is running:
```bash
docker-compose ps
```

2. Check MongoDB logs:
```bash
docker-compose logs mongodb
```

3. Test connection:
```bash
docker-compose exec backend ping mongodb
```

### Frontend can't connect to backend

1. Check nginx configuration
2. Verify backend is responding:
```bash
curl http://localhost:5000/health
```

---

## Support

For issues and questions, please open an issue on GitHub.

