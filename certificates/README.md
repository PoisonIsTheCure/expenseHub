# SSL Certificates Directory

This directory is used to store your SSL certificates for deployment to the production server.

## Required Files

Place the following files in this directory:

1. **fullchain.pem** - Your SSL certificate including the full certificate chain
2. **privkey.pem** - Your SSL private key

## Security Notes

⚠️ **IMPORTANT**: This directory is excluded from git to prevent accidentally committing private keys.

- Never commit these files to version control
- Keep your private key secure
- Ensure proper file permissions (600 for private keys)

## File Format

Your certificate files should be in PEM format. Example structure:

```
certificates/
├── fullchain.pem    # Your certificate + intermediate certificates
├── privkey.pem      # Your private key
└── README.md        # This file
```

## Usage

Once you've placed your certificates in this directory, run the deployment:

```bash
# Deploy with custom SSL certificates
ansible-playbook -i ansible/inventory/production.ini ansible/ssl-custom.yml

# Or deploy everything including SSL in one go
ansible-playbook -i ansible/inventory/production.ini ansible/deploy.yml --tags ssl
```

## Certificate Renewal

When your certificates are renewed, simply replace the files in this directory and re-run the deployment playbook.


