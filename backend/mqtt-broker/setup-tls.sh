#!/bin/bash

# Setup TLS certificates for MQTT broker
# This script uses Let's Encrypt via certbot

DOMAIN="mqtt.yourdomain.com"
EMAIL="admin@yourdomain.com"
CERT_DIR="./certs"

echo "Setting up TLS certificates for MQTT broker..."

# Install certbot if not already installed
if ! command -v certbot &> /dev/null; then
    echo "Installing certbot..."
    sudo apt-get update
    sudo apt-get install -y certbot
fi

# Generate certificates
echo "Generating Let's Encrypt certificates..."
sudo certbot certonly --standalone \
    -d $DOMAIN \
    --email $EMAIL \
    --agree-tos \
    --non-interactive

# Create cert directory
mkdir -p $CERT_DIR

# Copy certificates
echo "Copying certificates..."
sudo cp /etc/letsencrypt/live/$DOMAIN/fullchain.pem $CERT_DIR/cert.pem
sudo cp /etc/letsencrypt/live/$DOMAIN/privkey.pem $CERT_DIR/key.pem
sudo cp /etc/letsencrypt/live/$DOMAIN/chain.pem $CERT_DIR/cacert.pem

# Set permissions
sudo chmod 644 $CERT_DIR/cert.pem
sudo chmod 600 $CERT_DIR/key.pem
sudo chmod 644 $CERT_DIR/cacert.pem

echo "✅ TLS certificates setup complete!"
echo "Certificates location: $CERT_DIR"
echo ""
echo "Configure EMQX to use these certificates:"
echo "  - Certificate: /opt/emqx/etc/certs/cert.pem"
echo "  - Private Key: /opt/emqx/etc/certs/key.pem"
echo "  - CA Certificate: /opt/emqx/etc/certs/cacert.pem"
echo ""
echo "To renew certificates, run:"
echo "  sudo certbot renew"
