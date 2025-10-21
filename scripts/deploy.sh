#!/bin/bash

# ExpenseHub Deployment Script
# Quick deployment to Digital Ocean droplet

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}╔════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║   ExpenseHub Deployment Script        ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════╝${NC}"
echo ""

# Check if Ansible is installed
if ! command -v ansible &> /dev/null; then
    echo -e "${RED}❌ Ansible is not installed${NC}"
    echo "Please install Ansible first:"
    echo "  macOS: brew install ansible"
    echo "  Ubuntu: sudo apt install ansible"
    exit 1
fi

echo -e "${GREEN}✅ Ansible is installed${NC}"

# Check if inventory file exists
if [ ! -f "ansible/inventory/production.ini" ]; then
    echo -e "${RED}❌ Inventory file not found${NC}"
    echo "Please create ansible/inventory/production.ini"
    exit 1
fi

# Check if variables file exists
if [ ! -f "ansible/vars/production.yml" ]; then
    echo -e "${RED}❌ Variables file not found${NC}"
    echo "Please create ansible/vars/production.yml"
    exit 1
fi

echo -e "${GREEN}✅ Configuration files found${NC}"

# Test connection
echo ""
echo -e "${YELLOW}🔍 Testing connection to droplet...${NC}"
if ansible production -i ansible/inventory/production.ini -m ping &> /dev/null; then
    echo -e "${GREEN}✅ Connection successful${NC}"
else
    echo -e "${RED}❌ Cannot connect to droplet${NC}"
    echo "Please check:"
    echo "  1. Droplet IP is correct in inventory"
    echo "  2. SSH key is configured"
    echo "  3. Firewall allows SSH connections"
    exit 1
fi

# Ask for confirmation
echo ""
echo -e "${YELLOW}⚠️  This will deploy ExpenseHub to production${NC}"
read -p "Continue? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Deployment cancelled"
    exit 0
fi

# Run deployment
echo ""
echo -e "${GREEN}🚀 Starting deployment...${NC}"
echo ""

ansible-playbook -i ansible/inventory/production.ini ansible/deploy.yml

# Check if deployment was successful
if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}╔════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║   ✅ Deployment Successful!           ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════╝${NC}"
    echo ""
    echo "Your application is now running!"
    echo ""
    
    # Get droplet IP from inventory
    DROPLET_IP=$(grep ansible_host ansible/inventory/production.ini | cut -d'=' -f2 | awk '{print $1}')
    
    echo "Access your application:"
    echo "  🌐 Application: http://${DROPLET_IP}"
    echo "  ⚕️  Health Check: http://${DROPLET_IP}/api/health"
    echo ""
    echo "Useful commands:"
    echo "  📊 View logs: ssh root@${DROPLET_IP} 'cd /opt/expensehub && docker compose logs -f'"
    echo "  🔄 Restart: ssh root@${DROPLET_IP} 'cd /opt/expensehub && docker compose restart'"
    echo "  📈 Status: ssh root@${DROPLET_IP} 'cd /opt/expensehub && docker compose ps'"
else
    echo ""
    echo -e "${RED}╔════════════════════════════════════════╗${NC}"
    echo -e "${RED}║   ❌ Deployment Failed                ║${NC}"
    echo -e "${RED}╚════════════════════════════════════════╝${NC}"
    echo ""
    echo "Please check the error messages above"
    exit 1
fi

