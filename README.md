# ExpenseHub - Full-Stack Expense Tracking Application

A comprehensive expense tracking and sharing application built with TypeScript, React, Express, MongoDB, and Docker.

## 🚀 Features

- **Authentication & Authorization**: JWT-based authentication with role-based access control (Admin/User)
- **User Management**: Admin-controlled user creation and management
- **Personal Expenses**: Track individual expenses with categories and descriptions
- **Household Sharing**: Create households and share expenses among members
- **Responsive UI**: Modern, mobile-friendly interface built with Tailwind CSS
- **Fully Dockerized**: Easy deployment with Docker Compose

## 🏗️ Architecture

```
expenseHub/
├── frontend/          # React + TypeScript + Vite + Tailwind CSS
├── backend/           # Node.js + Express + TypeScript + MongoDB
├── nginx/             # Nginx reverse proxy configuration
└── docker-compose.yml # Orchestration for all services
```

## 🛠️ Tech Stack

### Backend
- Node.js & Express.js
- TypeScript
- MongoDB with Mongoose ODM
- JWT Authentication
- Express Validator

### Frontend
- React 18
- TypeScript
- Vite
- Tailwind CSS
- Redux Toolkit
- React Router
- Axios

### DevOps
- Docker & Docker Compose
- Nginx (Reverse Proxy)
- MongoDB (Database)

## 📋 Prerequisites

- Docker and Docker Compose installed
- Node.js 18+ and npm/pnpm (for local development)

## 🚀 Quick Start

### Using Docker (Recommended)

1. Clone the repository:
```bash
git clone <repository-url>
cd expenseHub
```

2. Create environment file:
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. Start all services:
```bash
docker-compose up --build
```

4. Access the application:
- Frontend: http://localhost
- Backend API: http://localhost/api
- Direct Backend: http://localhost:5000

5. Login with default admin credentials:
- Email: admin@expensehub.com (or your ADMIN_EMAIL)
- Password: Admin@123456 (or your ADMIN_PASSWORD)

### Local Development

#### Backend

```bash
cd backend
npm install
cp .env.example .env
# Edit .env and set MONGODB_URI to your local MongoDB
npm run dev
```

#### Frontend

```bash
cd frontend
npm install
npm run dev
```

## 📚 API Documentation

### Authentication
- `POST /api/auth/register` - Register new user (Admin only)
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Users (Admin Only)
- `GET /api/users` - List all users
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Households
- `GET /api/households` - List user's households
- `POST /api/households` - Create household
- `GET /api/households/:id` - Get household details
- `PUT /api/households/:id` - Update household
- `DELETE /api/households/:id` - Delete household
- `POST /api/households/:id/join` - Join household
- `POST /api/households/:id/leave` - Leave household

### Expenses
- `GET /api/expenses` - List expenses (personal + household)
- `POST /api/expenses` - Create expense
- `GET /api/expenses/:id` - Get expense details
- `PUT /api/expenses/:id` - Update expense
- `DELETE /api/expenses/:id` - Delete expense
- `GET /api/expenses/household/:householdId` - Get household expenses

## 🔐 Environment Variables

See `.env.example` for all available configuration options.

Key variables:
- `JWT_SECRET` - Secret key for JWT tokens
- `ADMIN_EMAIL` - Default admin email
- `ADMIN_PASSWORD` - Default admin password
- `MONGODB_URI` - MongoDB connection string

## 🎨 Default Admin Account

The application creates a default admin account on first startup:
- Email: Configured via `ADMIN_EMAIL` (default: admin@expensehub.com)
- Password: Configured via `ADMIN_PASSWORD` (default: Admin@123456)

**⚠️ Important**: Change these credentials in production!

## 📝 User Roles

- **Admin**: Can create/manage users, access admin panel, manage all data
- **User**: Can manage personal expenses, join/create households, view shared expenses

## 🐳 Docker Commands

```bash
# Start all services
docker-compose up

# Start with rebuild
docker-compose up --build

# Start in detached mode
docker-compose up -d

# Stop all services
docker-compose down

# Stop and remove volumes
docker-compose down -v

# View logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend
```

## 🧪 Development

### Backend
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server

### Frontend
- `npm run dev` - Start Vite dev server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## 📦 Project Structure

### Backend
```
backend/
├── src/
│   ├── config/        # Configuration files
│   ├── controllers/   # Route controllers
│   ├── middleware/    # Custom middleware
│   ├── models/        # Mongoose models
│   ├── routes/        # API routes
│   ├── types/         # TypeScript types
│   ├── utils/         # Utility functions
│   └── index.ts       # Application entry point
├── Dockerfile
├── package.json
└── tsconfig.json
```

### Frontend
```
frontend/
├── src/
│   ├── components/    # Reusable components
│   ├── pages/         # Page components
│   ├── store/         # Redux store
│   ├── services/      # API services
│   ├── types/         # TypeScript types
│   ├── App.tsx        # Main app component
│   └── main.tsx       # Entry point
├── Dockerfile
├── package.json
└── tailwind.config.js
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 🐛 Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB container is running: `docker-compose ps`
- Check MongoDB logs: `docker-compose logs mongodb`

### Port Already in Use
- Stop conflicting services or change ports in `docker-compose.yml`

### Frontend Can't Connect to Backend
- Verify Nginx configuration in `nginx/nginx.conf`
- Check backend is running: `docker-compose logs backend`

## 📧 Support

For issues and questions, please open an issue on GitHub.

