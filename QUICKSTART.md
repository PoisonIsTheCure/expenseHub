# ExpenseHub - Quick Start Guide

Get ExpenseHub up and running in 5 minutes!

## Prerequisites

- Docker and Docker Compose installed
- 2GB free RAM
- Ports 80, 5000, and 27017 available

## Installation

### Option 1: Using Make (Recommended)

```bash
# Start production environment
make prod

# View logs
make logs

# Access the app at http://localhost
```

### Option 2: Using Docker Compose

```bash
# Start all services
docker-compose up --build -d

# View logs
docker-compose logs -f

# Access the app at http://localhost
```

### Option 3: Development Environment

```bash
# For local development with hot-reload
cd backend
npm install
npm run dev

# In another terminal
cd frontend
npm install
npm run dev

# Backend: http://localhost:5000
# Frontend: http://localhost:3000
```

## First Login

1. Open http://localhost in your browser
2. Login with default admin credentials:
   - **Email**: admin@expensehub.com
   - **Password**: Admin@123456

⚠️ **IMPORTANT**: Change these credentials immediately in production!

## Quick Tour

### 1. Dashboard
- View your expense summary
- See charts and statistics
- Quick access to recent expenses

### 2. Add Expenses
- Click "Add Expense" button
- Fill in amount, description, category
- Choose personal or household expense

### 3. Create Household
- Go to "Households" tab
- Click "Create Household"
- Invite members to share expenses

### 4. Admin Panel (Admin Only)
- Go to "Admin" tab
- Create new users
- Manage existing users

## Common Commands

```bash
# View all services status
make health

# Stop all services
make down

# Restart services
make restart

# View backend logs
make logs-backend

# Backup database
make backup

# Access MongoDB shell
make shell-mongodb

# Clean everything (removes data!)
make clean
```

## Configuration

### Change Admin Credentials

Edit `.env` file:
```bash
ADMIN_EMAIL=your-email@domain.com
ADMIN_PASSWORD=YourStrongPassword123!
```

Then restart:
```bash
make restart
```

### Change JWT Secret

For production, use a strong secret:
```bash
JWT_SECRET=$(openssl rand -base64 32)
```

Add this to your `.env` file.

## Troubleshooting

### Port Already in Use

Change the port in `docker-compose.yml`:
```yaml
nginx:
  ports:
    - "8080:80"  # Change 80 to 8080
```

### Can't Connect to Database

```bash
# Check if MongoDB is running
docker-compose ps

# View MongoDB logs
docker-compose logs mongodb

# Restart MongoDB
docker-compose restart mongodb
```

### Frontend Not Loading

```bash
# Check Nginx logs
docker-compose logs nginx

# Restart Nginx
docker-compose restart nginx
```

### Clear All Data and Start Fresh

```bash
make clean
make build
make up
```

## Next Steps

1. **Change Admin Password**: Go to Admin panel and create a new admin
2. **Create Users**: Add team members or family
3. **Create Household**: Set up shared expense tracking
4. **Add Expenses**: Start tracking your spending
5. **Explore Features**: Check out categories, filters, and charts

## Production Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for:
- SSL/TLS configuration
- Environment configuration
- Backup strategies
- Scaling options

## Need Help?

- Check [README.md](./README.md) for detailed documentation
- See [DEPLOYMENT.md](./DEPLOYMENT.md) for deployment guides
- View [CONTRIBUTING.md](./CONTRIBUTING.md) for development guidelines
- Open an issue on GitHub for bugs or questions

## Useful Links

- API Documentation: http://localhost/api
- Backend Health Check: http://localhost:5000/health
- MongoDB: localhost:27017

---

**Happy Expense Tracking! 🎉**

