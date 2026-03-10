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
- **Infrastructure:** Docker, Docker Compose, Nginx
- **Deployment Automation:** Ansible playbooks in `ansible/`

## Architecture

```text
Browser -> Nginx -> Frontend + Backend API -> MongoDB
```

- Nginx serves the frontend and proxies API requests
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
- `http://localhost`

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

### Docker Deployment

- Build/start: `docker-compose up --build -d`
- Stop: `docker-compose down`
- Logs: `docker-compose logs -f`

### Ansible Deployment

Use playbooks in `ansible/` for remote deployment and SSL setup.

Typical flow:

1. Configure server inventory in `ansible/inventory/production.ini`
2. Configure production vars in `ansible/vars/production.yml`
3. Deploy:

```bash
ansible-playbook -i ansible/inventory/production.ini ansible/deploy.yml
```

For custom SSL certificates:

```bash
ansible-playbook -i ansible/inventory/production.ini ansible/ssl-custom.yml
```

Place certificate files in `certificates/` as:
- `fullchain.pem`
- `privkey.pem`

## Useful Commands

```bash
# service status
docker-compose ps

# logs
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f nginx
docker-compose logs -f mongodb

# rebuild and restart
docker-compose up --build -d
```

## Project Layout

```text
expenseHub/
  backend/        API and business logic
  frontend/       Web application
  nginx/          Reverse proxy configuration
  ansible/        Deployment automation
  certificates/   SSL certificate files (not committed)
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
- Never commit SSL private keys
- Keep production environment secrets outside version control

## License

MIT
