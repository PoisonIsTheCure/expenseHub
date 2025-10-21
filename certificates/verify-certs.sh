#!/bin/bash
# Certificate Verification Script
# This script helps identify your SSL certificate files

echo "=== SSL Certificate File Identification ==="
echo ""

# Function to check if file exists
check_file() {
    if [ ! -f "$1" ]; then
        echo "❌ File not found: $1"
        return 1
    fi
    return 0
}

# Check domain.cert.pem
echo "1️⃣  Checking domain.cert.pem:"
echo "-----------------------------------"
if check_file "domain.cert.pem"; then
    echo "📄 File type:"
    file domain.cert.pem
    echo ""
    echo "📋 Certificate details:"
    openssl x509 -in domain.cert.pem -text -noout 2>/dev/null | head -20
    if [ $? -eq 0 ]; then
        echo ""
        echo "✅ This is your CERTIFICATE (fullchain.pem)"
        echo "   Subject: $(openssl x509 -in domain.cert.pem -noout -subject 2>/dev/null)"
        echo "   Issuer: $(openssl x509 -in domain.cert.pem -noout -issuer 2>/dev/null)"
        echo "   Valid: $(openssl x509 -in domain.cert.pem -noout -dates 2>/dev/null)"
    else
        echo "⚠️  Could not parse as X.509 certificate"
    fi
fi
echo ""
echo ""

# Check private.key.pem
echo "2️⃣  Checking private.key.pem:"
echo "-----------------------------------"
if check_file "private.key.pem"; then
    echo "📄 File type:"
    file private.key.pem
    echo ""
    echo "🔐 Private key check:"
    openssl rsa -in private.key.pem -check -noout 2>/dev/null
    if [ $? -eq 0 ]; then
        echo "✅ This is your PRIVATE KEY (privkey.pem)"
        echo "   Key size: $(openssl rsa -in private.key.pem -text -noout 2>/dev/null | grep "Private-Key:" | head -1)"
    else
        # Try as other key formats
        openssl ec -in private.key.pem -check -noout 2>/dev/null
        if [ $? -eq 0 ]; then
            echo "✅ This is your PRIVATE KEY (EC format)"
        else
            echo "⚠️  Could not parse as RSA or EC private key"
        fi
    fi
fi
echo ""
echo ""

# Check public.key.pem
echo "3️⃣  Checking public.key.pem:"
echo "-----------------------------------"
if check_file "public.key.pem"; then
    echo "📄 File type:"
    file public.key.pem
    echo ""
    echo "🔓 Public key check:"
    openssl rsa -pubin -in public.key.pem -text -noout 2>/dev/null | head -10
    if [ $? -eq 0 ]; then
        echo "ℹ️  This is a PUBLIC KEY"
        echo "   (Usually not needed - public key is embedded in the certificate)"
    else
        echo "⚠️  Could not parse as public key"
    fi
fi
echo ""
echo ""

# Verify certificate and private key match
echo "4️⃣  Verifying Certificate and Private Key Match:"
echo "-----------------------------------"
if check_file "domain.cert.pem" && check_file "private.key.pem"; then
    CERT_MODULUS=$(openssl x509 -noout -modulus -in domain.cert.pem 2>/dev/null | openssl md5)
    KEY_MODULUS=$(openssl rsa -noout -modulus -in private.key.pem 2>/dev/null | openssl md5)
    
    if [ "$CERT_MODULUS" = "$KEY_MODULUS" ]; then
        echo "✅ SUCCESS! Certificate and private key match!"
        echo "   Hash: $CERT_MODULUS"
    else
        echo "❌ WARNING! Certificate and private key DO NOT match!"
        echo "   Cert hash: $CERT_MODULUS"
        echo "   Key hash:  $KEY_MODULUS"
    fi
fi
echo ""
echo ""

# Summary and recommendations
echo "📝 SUMMARY & NEXT STEPS:"
echo "========================"
echo ""
echo "For your Ansible deployment, you need:"
echo ""
echo "1. fullchain.pem → This should be your 'domain.cert.pem'"
echo "   Command: cp domain.cert.pem fullchain.pem"
echo ""
echo "2. privkey.pem → This should be your 'private.key.pem'"
echo "   Command: cp private.key.pem privkey.pem"
echo ""
echo "3. public.key.pem → NOT needed (already in certificate)"
echo ""
echo "Quick setup:"
echo "  cd certificates/"
echo "  cp domain.cert.pem fullchain.pem"
echo "  cp private.key.pem privkey.pem"
echo "  chmod 644 fullchain.pem"
echo "  chmod 600 privkey.pem"
echo ""


