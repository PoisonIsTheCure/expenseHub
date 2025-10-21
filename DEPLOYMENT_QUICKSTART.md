# 🚀 Quick Start: Deploy to Digital Ocean

## One-Command Deployment

```bash
make deploy-prod
```

## Prerequisites (5 minutes)

1. **Install Ansible** (if needed):
   ```bash
   # macOS
   brew install ansible
   
   # Ubuntu/Debian
   sudo apt install ansible
   ```

2. **Configure Droplet IP**:
   ```bash
   nano ansible/inventory/production.ini
   ```
   Replace `YOUR_DROPLET_IP` with your actual IP

3. **Set Secrets**:
   ```bash
   nano ansible/vars/production.yml
   ```
   Update:
   - `git_repo`: Your GitHub repo URL
   - `jwt_secret`: Generate with `openssl rand -base64 32`
   - `admin_email` and `admin_password`

4. **Test Connection**:
   ```bash
   make deploy-check
   ```

## Deployment Commands

```bash
# Full deployment
make deploy-prod

# Check connection first
make deploy-check

# View production logs
make deploy-logs DROPLET_IP=YOUR_IP

# Check production status
make deploy-status DROPLET_IP=YOUR_IP

# Set up SSL (with domain)
make deploy-ssl

# Rollback if needed
make deploy-rollback
```

## Manual Deployment

```bash
ansible-playbook -i ansible/inventory/production.ini ansible/deploy.yml
```

## Post-Deployment

Your app will be available at:
- **HTTP**: `http://YOUR_DROPLET_IP`
- **API Health**: `http://YOUR_DROPLET_IP/api/health`

## Common Issues

### "Cannot connect to droplet"
```bash
# Check SSH key
ssh root@YOUR_DROPLET_IP

# Update inventory if using non-root user
ansible_user=your_username
```

### "Git clone failed"
- Make sure git repository is accessible
- For private repos, add deploy keys

### "Port 80 already in use"
```bash
ssh root@YOUR_DROPLET_IP
sudo lsof -i :80
# Kill conflicting process
```

## Files Structure

```
ansible/
├── deploy.yml              # Main deployment playbook
├── ssl-setup.yml          # SSL configuration
├── rollback.yml           # Rollback playbook
├── inventory/
│   └── production.ini     # Server configuration
├── vars/
│   └── production.yml     # Environment variables
└── templates/
    ├── env.j2             # .env template
    ├── nginx-ssl.conf.j2  # Nginx SSL config
    └── logrotate.j2       # Log rotation config
```

## Need Help?

See full documentation: [ANSIBLE_DEPLOYMENT.md](./ANSIBLE_DEPLOYMENT.md)

