# Ansible Deployment Configuration

This directory contains Ansible playbooks and configuration for deploying ExpenseHub to production.

## Structure

```
ansible/
├── deploy.yml                    # Main deployment playbook
├── deploy-with-ssl.yml          # Full deployment including custom SSL
├── ssl-setup.yml                # SSL/HTTPS with Let's Encrypt (auto-renewal)
├── ssl-custom.yml               # SSL/HTTPS with custom certificates
├── rollback.yml                 # Rollback to previous version
├── inventory/
│   └── production.ini           # Production server configuration
├── vars/
│   └── production.yml           # Production environment variables
└── templates/
    ├── env.j2                   # Environment file template
    ├── nginx-ssl.conf.j2        # Nginx SSL config (Let's Encrypt)
    ├── nginx-ssl-custom.conf.j2 # Nginx SSL config (Custom certs)
    └── logrotate.j2             # Log rotation configuration
```

## Quick Start

1. **Configure your server**:
   ```bash
   nano inventory/production.ini
   # Update YOUR_DROPLET_IP
   ```

2. **Set environment variables**:
   ```bash
   nano vars/production.yml
   # Update git_repo, jwt_secret, admin credentials
   ```

3. **Deploy**:
   ```bash
   ansible-playbook -i inventory/production.ini deploy.yml
   ```

## Playbooks

### deploy.yml
Main deployment playbook that:
- Installs Docker and dependencies
- Clones repository
- Configures environment
- Builds and starts containers
- Sets up backups and log rotation

**Usage:**
```bash
ansible-playbook -i inventory/production.ini deploy.yml
```

### ssl-setup.yml
Configures SSL certificates with Let's Encrypt (automatic renewal).

**Prerequisites:**
- Domain name pointing to your server
- Port 80 and 443 open

**Usage:**
```bash
# Update vars/production.yml first:
# use_ssl: true
# domain_name: your-domain.com
# ssl_email: your-email@example.com

ansible-playbook -i inventory/production.ini ssl-setup.yml
```

### ssl-custom.yml
Deploys custom SSL certificates (for pre-existing certificates).

**Prerequisites:**
- Your SSL certificates in `../certificates/` directory:
  - `fullchain.pem` - Certificate chain
  - `privkey.pem` - Private key
- Domain name pointing to your server
- Port 443 open

**Usage:**
```bash
# Place certificates first:
cp /path/to/your/fullchain.pem ../certificates/
cp /path/to/your/privkey.pem ../certificates/

# Deploy SSL
ansible-playbook -i inventory/production.ini ssl-custom.yml
```

📚 **See [../SSL_DEPLOYMENT.md](../SSL_DEPLOYMENT.md) for detailed SSL setup guide**

### deploy-with-ssl.yml
Convenience playbook that runs full deployment + custom SSL setup.

**Usage:**
```bash
ansible-playbook -i inventory/production.ini deploy-with-ssl.yml
```

### rollback.yml
Rolls back to the previous git commit.

**Usage:**
```bash
ansible-playbook -i inventory/production.ini rollback.yml
```

## Configuration Files

### inventory/production.ini
Defines your production server(s).

**Required changes:**
- `ansible_host`: Your droplet IP address
- `ansible_user`: SSH user (usually `root`)
- `ansible_ssh_private_key_file`: Path to your SSH key

### vars/production.yml
Production environment configuration.

**Required changes:**
- `git_repo`: Your repository URL
- `jwt_secret`: Secure random string (use `openssl rand -base64 32`)
- `admin_email`, `admin_password`, `admin_name`: Admin credentials

**Optional changes:**
- `app_directory`: Installation path (default: `/opt/expensehub`)
- `use_ssl`: Enable SSL (default: `false`)
- `domain_name`: Your domain for SSL
- `cors_origin`: CORS settings

## Templates

### env.j2
Generates the `.env` file on the server using variables from `vars/production.yml`.

### nginx-ssl.conf.j2
Nginx configuration with SSL enabled. Used when `use_ssl: true`.

### logrotate.j2
Configures automatic log rotation to prevent disk space issues.

## Tips

### Testing Connection
```bash
ansible production -i inventory/production.ini -m ping
```

### Running Specific Tasks
```bash
# Only install Docker
ansible-playbook -i inventory/production.ini deploy.yml --tags docker

# Skip certain tasks
ansible-playbook -i inventory/production.ini deploy.yml --skip-tags backups
```

### Dry Run
```bash
ansible-playbook -i inventory/production.ini deploy.yml --check
```

### Verbose Output
```bash
ansible-playbook -i inventory/production.ini deploy.yml -vvv
```

## Security Notes

1. **Never commit secrets** to git:
   - Add `vars/production.yml` to `.gitignore` if it contains sensitive data
   - Use Ansible Vault for sensitive variables

2. **Using Ansible Vault** (recommended):
   ```bash
   # Encrypt sensitive variables
   ansible-vault encrypt vars/production.yml
   
   # Deploy with vault
   ansible-playbook -i inventory/production.ini deploy.yml --ask-vault-pass
   ```

3. **SSH Key Authentication**:
   - Always use SSH keys, never passwords
   - Protect your private key: `chmod 600 ~/.ssh/id_rsa`

## Troubleshooting

### Connection Issues
```bash
# Test SSH directly
ssh root@YOUR_DROPLET_IP

# Check SSH key permissions
ls -la ~/.ssh/

# Verify inventory syntax
ansible-inventory -i inventory/production.ini --list
```

### Deployment Failures
```bash
# Check what went wrong
ansible-playbook -i inventory/production.ini deploy.yml -vvv

# SSH into server and check manually
ssh root@YOUR_DROPLET_IP
cd /opt/expensehub
docker compose ps
docker compose logs
```

### SSL Issues
```bash
# Check if ports are open
nmap YOUR_DROPLET_IP -p 80,443

# Verify DNS
dig your-domain.com

# Check certificate
openssl s_client -connect your-domain.com:443
```

## Support

For detailed deployment guide, see: [../ANSIBLE_DEPLOYMENT.md](../ANSIBLE_DEPLOYMENT.md)

For quick start, see: [../DEPLOYMENT_QUICKSTART.md](../DEPLOYMENT_QUICKSTART.md)

