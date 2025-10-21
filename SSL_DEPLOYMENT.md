# SSL Certificate Deployment Guide

This guide explains how to deploy your ExpenseHub application with custom SSL certificates.

## Prerequisites

1. You have obtained SSL certificates from a certificate authority (e.g., Let's Encrypt, Cloudflare, commercial CA)
2. You have the following certificate files:
   - **Full chain certificate** (fullchain.pem or certificate.crt)
   - **Private key** (privkey.pem or private.key)

## Setup Steps

### 1. Place Your Certificates

Copy your certificate files to the `certificates/` directory in your project root:

```bash
# From your project root
cp /path/to/your/fullchain.pem certificates/fullchain.pem
cp /path/to/your/privkey.pem certificates/privkey.pem
```

**File naming requirements:**
- Certificate chain must be named `fullchain.pem`
- Private key must be named `privkey.pem`

### 2. Verify Certificate Files

Ensure your certificate files are in the correct format:

```bash
# Check certificate
openssl x509 -in certificates/fullchain.pem -text -noout

# Check private key
openssl rsa -in certificates/privkey.pem -check

# Verify certificate and key match
openssl x509 -noout -modulus -in certificates/fullchain.pem | openssl md5
openssl rsa -noout -modulus -in certificates/privkey.pem | openssl md5
# The two hashes should match
```

### 3. Deploy SSL Certificates

You have two deployment options:

#### Option A: SSL Only (Update Existing Deployment)

If your application is already deployed and you just want to add/update SSL:

```bash
ansible-playbook -i ansible/inventory/production.ini ansible/ssl-custom.yml
```

#### Option B: Full Deployment with SSL

Deploy the entire application including SSL certificates:

```bash
ansible-playbook -i ansible/inventory/production.ini ansible/deploy-with-ssl.yml
```

Or run them separately:

```bash
# First deploy the application
ansible-playbook -i ansible/inventory/production.ini ansible/deploy.yml

# Then deploy SSL
ansible-playbook -i ansible/inventory/production.ini ansible/ssl-custom.yml
```

## What the Deployment Does

The SSL deployment playbook will:

1. ✅ Verify certificate files exist locally
2. ✅ Create secure SSL directory on the server
3. ✅ Copy certificates to the server with proper permissions
4. ✅ Configure Nginx to use custom certificates
5. ✅ Enable HTTPS on port 443
6. ✅ Set up HTTP to HTTPS redirect
7. ✅ Apply security headers and SSL best practices
8. ✅ Restart Nginx and verify configuration

## Certificate Renewal

When your SSL certificates need to be renewed:

1. Obtain new certificates from your CA
2. Replace the files in the `certificates/` directory
3. Re-run the SSL deployment:

```bash
ansible-playbook -i ansible/inventory/production.ini ansible/ssl-custom.yml
```

## Security Notes

🔒 **Important Security Practices:**

- The `certificates/` directory is excluded from git via `.gitignore`
- Never commit certificate files to version control
- Private keys are stored with 600 permissions (owner read/write only)
- Certificate files are stored with 644 permissions (owner read/write, others read)
- All files are owned by the deployment user

## Troubleshooting

### Certificate Validation Errors

If you get certificate validation errors:

```bash
# Check certificate expiry
openssl x509 -in certificates/fullchain.pem -noout -dates

# Verify certificate chain is complete
openssl verify -CAfile certificates/fullchain.pem certificates/fullchain.pem
```

### Nginx Configuration Errors

If Nginx fails to start:

```bash
# SSH to your server and check Nginx logs
ssh user@your-server
cd /opt/expensehub  # or your app_directory
docker compose logs nginx

# Test Nginx configuration
docker compose exec nginx nginx -t
```

### Port 443 Not Accessible

Ensure your firewall allows HTTPS traffic:

```bash
# On your server
sudo ufw allow 443/tcp
sudo ufw status
```

## Nginx Configuration

The deployment creates a complete Nginx configuration at `ansible/templates/nginx-ssl-custom.conf.j2` that includes:

- **HTTP → HTTPS redirect** on port 80
- **HTTPS server** on port 443 with:
  - TLS 1.2 and 1.3 support
  - Modern cipher suites
  - Session caching
  - Security headers (X-Frame-Options, X-Content-Type-Options, etc.)
  - Gzip compression
  - Proper proxy configuration for frontend and backend
  - Health check endpoint

## Alternative: Let's Encrypt

If you prefer to use Let's Encrypt certificates with automatic renewal, use the original `ssl-setup.yml` playbook instead:

```bash
ansible-playbook -i ansible/inventory/production.ini ansible/ssl-setup.yml
```

Note: The original `ssl-setup.yml` uses Certbot and Let's Encrypt, while `ssl-custom.yml` is for custom/pre-existing certificates.

## Testing Your SSL Setup

After deployment, verify your SSL configuration:

```bash
# Test HTTPS connection
curl -I https://your-domain.com

# Check certificate details
echo | openssl s_client -connect your-domain.com:443 -servername your-domain.com 2>/dev/null | openssl x509 -noout -dates -subject

# Test SSL rating (optional)
# Visit: https://www.ssllabs.com/ssltest/analyze.html?d=your-domain.com
```

## Support

For issues or questions:
1. Check the Ansible playbook output for specific errors
2. Review server logs: `docker compose logs -f nginx`
3. Verify certificate files are valid and not expired
4. Ensure DNS is properly configured for your domain


