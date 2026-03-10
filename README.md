# ExpenseHub

ExpenseHub is a full-stack expense tracking app for personal and household finances.

It supports user authentication, expense management, shared households, budgets, multi-currency amounts, receipt uploads, analytics, recurring expenses, and settlement workflows.

## Main Capabilities

- Secure authentication with admin and user roles
- Personal and household expense tracking
- Household member management and shared contributions
- Budget tracking (personal and household)
- Multi-currency support (stored consistently, displayed per user preference)
- Receipt uploads for expense records
- Analytics and spending insights
- Recurring expense automation
- Balance and settlement tracking for shared costs

## Tech Stack

- **Frontend:** React, TypeScript, Vite, Tailwind CSS, Redux Toolkit
- **Backend:** Node.js, Express, TypeScript, MongoDB (Mongoose), JWT
- **Infrastructure:** Docker, Docker Compose, Host Nginx
- **Deployment Automation:** Jenkins + Ansible (`ansible/deploy-nginx.yml`)

## Architecture

```text
Browser -> Host Nginx -> Frontend container + Backend container -> MongoDB container
```

- Nginx runs on the server host and loads config from `/etc/nginx/conf.d`
- Frontend, backend, and MongoDB each run in separate Docker containers
- MongoDB data is persisted on a host path (`DB_DATA_PATH`) mounted into the container
- Backend exposes REST endpoints under `/api`
- MongoDB stores users, households, expenses, budgets, settlements, and recurring expenses

## Quick Start (Docker)

1. Clone the repository and move into the project root.
2. Create your environment file:

```bash
cp env.example .env
```

3. Start all services:

```bash
docker-compose up --build -d
```

4. Open the app:
- `http://localhost:3000`

5. Default admin credentials (change for production):
- Email: value from `ADMIN_EMAIL` (default `admin@expensehub.com`)
- Password: value from `ADMIN_PASSWORD` (default `Admin@123456`)

## Local Development

Backend:

```bash
cd backend
npm install
npm run dev
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```

## Environment Configuration

Copy defaults and update values:

```bash
cp env.example .env
```

Important variables:

- `JWT_SECRET`
- `MONGODB_URI`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`
- `NODE_ENV`
- `PORT`
- `CORS_ORIGIN`

## Deployment

### Docker Deployment (containers only)

- Build/start: `docker-compose up --build -d`
- Stop: `docker-compose down`
- Logs: `docker-compose logs -f`

### Ansible Deployment (Jenkins)

Deployment does two things:
- Starts/updates Docker containers (`mongodb`, `backend`, `frontend`) on the target server
- Renders and copies host Nginx config into `/etc/nginx/conf.d`, then reloads Nginx

Jenkins parameters control:
- `SERVER_NAME`, `NGINX_LISTEN_PORT`
- `FRONTEND_PORT`, `BACKEND_PORT`, `DB_PORT`
- `DB_DATA_PATH`

Setup:

1. Copy inventory example:
```bash
cp ansible/inventory/production.ini.example ansible/inventory/production.ini
```
2. Copy vars example:
```bash
cp ansible/vars/production.yml.example ansible/vars/production.yml
```
3. Update:
- `ansible/inventory/production.ini`
- `ansible/vars/production.yml`

Run:

```bash
ansible-playbook -i ansible/inventory/production.ini ansible/deploy-nginx.yml
```

Jenkins stage example:

```bash
cp ansible/inventory/production.ini.example ansible/inventory/production.ini
cp ansible/vars/production.yml.example ansible/vars/production.yml
ansible-playbook -i ansible/inventory/production.ini ansible/deploy-nginx.yml
```

## Useful Commands

```bash
# service status
docker-compose ps

# logs
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mongodb

# rebuild and restart
docker-compose up --build -d
```

## Project Layout

```text
expenseHub/
  backend/        API and business logic
  frontend/       Web application
  nginx/          Sample host nginx vhost configuration
  ansible/        Deployment automation (nginx template + copy/reload)
```

## API Surface (High Level)

- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET/POST/PUT/DELETE /api/expenses`
- `GET/POST/PUT/DELETE /api/households`
- `GET/PUT /api/budgets/*`
- `GET/POST/PATCH /api/settlements/*`
- `GET/POST/PUT/DELETE /api/recurring-expenses/*`
- `GET /api/analytics/*`

## Security Notes

- Change default admin credentials in production
- Use a strong `JWT_SECRET`
- Keep production environment secrets outside version control

## License

MIT
