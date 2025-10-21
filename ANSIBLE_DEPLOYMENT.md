# 🚀 Ansible Deployment Guide for ExpenseHub

This guide will help you deploy ExpenseHub to your Digital Ocean droplet using Ansible.

## 📋 Prerequisites

### 1. Local Machine Requirements
- Ansible installed (version 2.9 or higher)
- SSH access to your Digital Ocean droplet
- Git repository with your code (GitHub, GitLab, etc.)

### 2. Digital Ocean Droplet Requirements
- Ubuntu 20.04/22.04 LTS
- At least 2GB RAM (4GB recommended)
- 50GB storage
- Root or sudo access
- SSH key configured

## 🔧 Installation Steps

### Step 1: Install Ansible (if not already installed)

**On macOS:**
```bash
brew install ansible
```

**On Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install ansible
```

**Verify installation:**
```bash
ansible --version
```

### Step 2: Configure Your Droplet IP

Edit the inventory file:
```bash
nano ansible/inventory/production.ini
```

Replace `YOUR_DROPLET_IP` with your actual droplet IP address:
```ini
[production]
droplet ansible_host=YOUR_DROPLET_IP ansible_user=root ansible_python_interpreter=/usr/bin/python3
```

### Step 3: Configure Production Variables

Edit the production variables:
```bash
nano ansible/vars/production.yml
```

**Important: Update these values:**

1. **Git Repository:**
   ```yaml
   git_repo: https://github.com/YOUR_USERNAME/expenseHub.git
   git_branch: main
   ```

2. **JWT Secret (REQUIRED):**
   ```yaml
   jwt_secret: YOUR_SECURE_RANDOM_STRING_AT_LEAST_32_CHARS
   ```
   
   Generate a secure secret:
   ```bash
   openssl rand -base64 32
   ```

3. **Admin Credentials:**
   ```yaml
   admin_email: your-admin@example.com
   admin_password: YOUR_SECURE_PASSWORD
   admin_name: Admin User
   ```

4. **Domain (if using SSL):**
   ```yaml
   use_ssl: true
   domain_name: your-domain.com
   ssl_email: your-email@example.com
   ```

### Step 4: Test SSH Connection

```bash
ansible production -i ansible/inventory/production.ini -m ping
```

You should see:
```
droplet | SUCCESS => {
    "changed": false,
    "ping": "pong"
}
```

### Step 5: Deploy Application

Run the deployment playbook:
```bash
ansible-playbook -i ansible/inventory/production.ini ansible/deploy.yml
```

This will:
- ✅ Install Docker and Docker Compose
- ✅ Clone your repository
- ✅ Set up environment variables
- ✅ Build and start containers
- ✅ Configure log rotation
- ✅ Set up database backups

**Deployment time:** ~5-10 minutes

### Step 6: (Optional) Set Up SSL

If you have a domain name, enable SSL:

1. Point your domain's A record to your droplet IP
2. Wait for DNS propagation (5-30 minutes)
3. Run SSL setup:

```bash
ansible-playbook -i ansible/inventory/production.ini ansible/ssl-setup.yml
```

## 🔍 Post-Deployment Verification

### Check Application Status

```bash
# SSH into your droplet
ssh root@YOUR_DROPLET_IP

# Check running containers
cd /opt/expensehub
docker compose ps

# View logs
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f nginx
```

### Access Your Application

**Without SSL:**
```
http://YOUR_DROPLET_IP
```

**With SSL:**
```
https://your-domain.com
```

### Test API Health

```bash
curl http://YOUR_DROPLET_IP/api/health
```

Expected response:
```json
{"status":"ok","message":"ExpenseHub API is running"}
```

## 🔄 Updating Your Application

### Deploy Updates

```bash
ansible-playbook -i ansible/inventory/production.ini ansible/deploy.yml
```

This will:
1. Pull latest code from git
2. Rebuild containers
3. Restart services
4. Zero downtime (nginx handles gracefully)

### Manual Updates on Droplet

```bash
ssh root@YOUR_DROPLET_IP
cd /opt/expensehub
git pull origin main
docker compose down
docker compose up -d --build
```

## 🗄️ Database Management

### Backup Database

**Automatic:** Runs daily at 2 AM (configured in playbook)

**Manual backup:**
```bash
ssh root@YOUR_DROPLET_IP
cd /opt/expensehub
docker compose exec -T mongodb mongodump --db expensehub --archive > backup_$(date +%Y%m%d).archive
```

### Restore Database

```bash
ssh root@YOUR_DROPLET_IP
cd /opt/expensehub
docker compose exec -T mongodb mongorestore --db expensehub --archive < backup_YYYYMMDD.archive
```

### Access MongoDB Shell

```bash
ssh root@YOUR_DROPLET_IP
cd /opt/expensehub
docker compose exec mongodb mongosh expensehub
```

## 📊 Monitoring

### View Application Logs

```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f nginx
docker compose logs -f mongodb
```

### Check Container Status

```bash
docker compose ps
```

### Check Resource Usage

```bash
docker stats
```

### Check Disk Space

```bash
df -h
```

## 🔒 Security Recommendations

### 1. Firewall Configuration

```bash
# Allow only necessary ports
ufw allow 22/tcp    # SSH
ufw allow 80/tcp    # HTTP
ufw allow 443/tcp   # HTTPS
ufw enable
```

### 2. Change Default SSH Port (Recommended)

```bash
nano /etc/ssh/sshd_config
# Change Port 22 to Port 2222
systemctl restart ssh
```

Don't forget to update your inventory:
```ini
droplet ansible_host=YOUR_IP ansible_user=root ansible_port=2222
```

### 3. Set Up Fail2Ban

```bash
apt install fail2ban
systemctl enable fail2ban
systemctl start fail2ban
```

### 4. Regular Updates

```bash
apt update && apt upgrade -y
```

## 🐛 Troubleshooting

### Issue: Containers not starting

**Check logs:**
```bash
docker compose logs backend
```

**Common causes:**
- Missing environment variables
- MongoDB connection issues
- Port conflicts

**Solution:**
```bash
docker compose down
docker compose up -d
```

### Issue: Application not accessible

**Check nginx status:**
```bash
docker compose ps nginx
docker compose logs nginx
```

**Check firewall:**
```bash
ufw status
```

### Issue: Database connection failed

**Check MongoDB:**
```bash
docker compose logs mongodb
docker compose exec mongodb mongosh --eval "db.adminCommand('ping')"
```

### Issue: Out of disk space

**Check disk usage:**
```bash
df -h
du -sh /var/lib/docker
```

**Clean up:**
```bash
docker system prune -a --volumes
```

## 📁 Directory Structure on Server

```
/opt/expensehub/
├── backend/
├── frontend/
├── nginx/
├── docker-compose.yml
├── .env
└── uploads/

/var/backups/
└── expensehub_YYYYMMDD.archive
```

## 🔄 Continuous Deployment (Optional)

### Set Up GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Deploy via Ansible
        env:
          ANSIBLE_HOST_KEY_CHECKING: False
        run: |
          ansible-playbook -i ansible/inventory/production.ini ansible/deploy.yml
```

## 📞 Support

If you encounter issues:
1. Check the logs: `docker compose logs`
2. Verify environment variables: `cat .env`
3. Check container status: `docker compose ps`
4. Review the deployment logs

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Ansible Documentation](https://docs.ansible.com/)
- [Digital Ocean Tutorials](https://www.digitalocean.com/community/tutorials)
- [Let's Encrypt Documentation](https://letsencrypt.org/docs/)

---

**Deployment completed successfully! Your ExpenseHub application is now running in production! 🎉**

