# ExpenseHub - Full-Stack Expense Tracking Application

A comprehensive expense tracking and sharing application built with TypeScript, React, Express, MongoDB, and Docker. Now enhanced with budget management, multi-currency support, receipt uploads, and mobile-first responsive design.

## 🚀 Features

### Core Features
- **Authentication & Authorization**: JWT-based authentication with role-based access control (Admin/User)
- **User Management**: Admin-controlled user creation and management
- **Personal Expenses**: Track individual expenses with categories and descriptions
- **Household Sharing**: Create households and share expenses among members

### New Features ✨
- **Budget Management**: Personal and household budget tracking with visual progress indicators
- **Multi-Currency Support**: Support for 8 major currencies (EUR, USD, GBP, JPY, CAD, AUD, CHF, CNY) with EUR as default
- **Receipt Uploads**: Upload and attach receipts (PDF and images) to expenses
- **Mobile-First Design**: Fully responsive interface optimized for mobile devices
- **Enhanced UX**: Loading states, empty states, and toast notifications
- **File Storage**: Persistent storage for uploaded receipts with Docker volumes

### Technical Features
- **Responsive UI**: Modern, mobile-friendly interface built with Tailwind CSS
- **Fully Dockerized**: Easy deployment with Docker Compose and Nginx
- **Type Safety**: Full TypeScript implementation across frontend and backend
- **Error Handling**: Comprehensive error handling and user feedback

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
- Multer (File Uploads)
- Currency Conversion Utilities

### Frontend
- React 18
- TypeScript
- Vite
- Tailwind CSS
- Redux Toolkit
- React Router
- Axios
- Context API (Toast Notifications)

### DevOps
- Docker & Docker Compose
- Nginx (Reverse Proxy)
- MongoDB (Database)
- Persistent Volumes (File Storage)

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
cp env.example .env
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
cp ../env.example .env
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
- `POST /api/expenses` - Create expense (supports file uploads)
- `GET /api/expenses/:id` - Get expense details
- `PUT /api/expenses/:id` - Update expense
- `DELETE /api/expenses/:id` - Delete expense
- `GET /api/expenses/household/:householdId` - Get household expenses

### Budget Management
- `GET /api/budgets/personal` - Get personal budget information
- `PUT /api/budgets/personal` - Update personal budget
- `GET /api/budgets/household/:householdId` - Get household budget information
- `PUT /api/budgets/household/:householdId` - Update household budget
- `POST /api/budgets/household/:householdId/contribution` - Add household budget contribution

## 🔐 Environment Variables

See `env.example` for all available configuration options.

Key variables:
- `JWT_SECRET` - Secret key for JWT tokens
- `ADMIN_EMAIL` - Default admin email
- `ADMIN_PASSWORD` - Default admin password
- `MONGODB_URI` - MongoDB connection string
- `NODE_ENV` - Environment (development/production)
- `PORT` - Backend server port (default: 5000)
- `CORS_ORIGIN` - CORS allowed origins

## 🎨 Default Admin Account

The application creates a default admin account on first startup:
- Email: Configured via `ADMIN_EMAIL` (default: admin@expensehub.com)
- Password: Configured via `ADMIN_PASSWORD` (default: Admin@123456)

**⚠️ Important**: Change these credentials in production!

## 📝 User Roles

- **Admin**: Can create/manage users, access admin panel, manage all data
- **User**: Can manage personal expenses, join/create households, view shared expenses

## 💰 Budget Management

### Personal Budgets
- Set monthly spending limits in your preferred currency
- Visual progress indicators showing spent vs remaining budget
- Automatic monthly reset based on date
- Real-time budget tracking with expense integration

### Household Budgets
- Shared budget limits for household expenses
- Member contributions tracking
- Visual breakdown of spending vs budget
- Collaborative budget management

## 💱 Multi-Currency Support

ExpenseHub supports 8 major currencies:
- **EUR** (Euro) - Default currency
- **USD** (US Dollar)
- **GBP** (British Pound)
- **JPY** (Japanese Yen)
- **CAD** (Canadian Dollar)
- **AUD** (Australian Dollar)
- **CHF** (Swiss Franc)
- **CNY** (Chinese Yuan)

All amounts are stored internally in EUR and converted dynamically for display based on user preferences.

## 📎 Receipt Management

- Upload multiple receipt files (PDF and images)
- Support for up to 5 files per expense
- Maximum file size: 10MB per file
- Persistent storage with Docker volumes
- Direct file access through Nginx proxy

## 📱 Mobile-First Design

- Responsive design optimized for mobile devices
- Touch-friendly interface elements
- Mobile bottom navigation bar
- Single-column layouts for small screens
- Optimized for screen widths from 360px to 1440px

## 🔒 SSL/HTTPS Deployment

ExpenseHub supports deployment with custom SSL certificates for secure HTTPS access.

### Quick SSL Setup

1. Place your SSL certificates in the `certificates/` directory:
   - `certificates/fullchain.pem` - Your certificate chain
   - `certificates/privkey.pem` - Your private key

2. Deploy with SSL:
```bash
ansible-playbook -i ansible/inventory/production.ini ansible/ssl-custom.yml
```

📚 **For detailed SSL setup instructions, see [SSL_DEPLOYMENT.md](SSL_DEPLOYMENT.md)**

Features:
- ✅ Custom SSL certificate support
- ✅ Automatic HTTP to HTTPS redirect
- ✅ TLS 1.2 and 1.3 support
- ✅ Security headers and best practices
- ✅ Easy certificate renewal process

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

