.PHONY: help build up down logs clean install dev prod backup restore

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-15s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

install: ## Install dependencies for both frontend and backend
	@echo "Installing backend dependencies..."
	cd backend && npm install
	@echo "Installing frontend dependencies..."
	cd frontend && npm install
	@echo "Done!"

build: ## Build Docker images
	docker compose build

up: ## Start all services
	docker compose up -d

down: ## Stop all services
	docker compose down

logs: ## View logs from all services
	docker compose logs -f

logs-backend: ## View backend logs
	docker compose logs -f backend

logs-frontend: ## View frontend logs
	docker compose logs -f frontend

logs-nginx: ## View nginx logs
	docker compose logs -f nginx

clean: ## Remove all containers, volumes, and images
	docker compose down -v --rmi all

dev: ## Start development environment
	docker compose -f docker-compose.dev.yml up

dev-down: ## Stop development environment
	docker compose -f docker-compose.dev.yml down

prod: ## Start production environment
	docker compose up --build -d

restart: down up ## Restart all services

backup: ## Backup MongoDB database
	@mkdir -p backups
	@docker compose exec -T mongodb mongodump --db expensehub --archive > backups/expensehub_$$(date +%Y%m%d_%H%M%S).archive
	@echo "Backup created in backups/ directory"

restore: ## Restore MongoDB database (use BACKUP_FILE variable)
	@if [ -z "$(BACKUP_FILE)" ]; then \
		echo "Usage: make restore BACKUP_FILE=backups/expensehub_YYYYMMDD_HHMMSS.archive"; \
		exit 1; \
	fi
	@docker compose exec -T mongodb mongorestore --db expensehub --archive < $(BACKUP_FILE)
	@echo "Database restored from $(BACKUP_FILE)"

shell-backend: ## Access backend container shell
	docker compose exec backend sh

shell-frontend: ## Access frontend container shell
	docker compose exec frontend sh

shell-mongodb: ## Access MongoDB shell
	docker compose exec mongodb mongosh expensehub

health: ## Check health status of all services
	@echo "Checking service health..."
	@docker compose ps

# Deployment targets
deploy-prod: ## Deploy to production (Digital Ocean)
	@echo "Deploying to production..."
	@./scripts/deploy.sh

deploy-check: ## Test connection to production server
	@ansible production -i ansible/inventory/production.ini -m ping

deploy-ssl: ## Set up SSL on production
	@ansible-playbook -i ansible/inventory/production.ini ansible/ssl-setup.yml

deploy-rollback: ## Rollback to previous version
	@ansible-playbook -i ansible/inventory/production.ini ansible/rollback.yml

deploy-logs: ## View production logs (requires DROPLET_IP env var)
	@ssh root@$(DROPLET_IP) 'cd /opt/expensehub && docker compose logs -f'

deploy-status: ## Check production status (requires DROPLET_IP env var)
	@ssh root@$(DROPLET_IP) 'cd /opt/expensehub && docker compose ps'

