# Production Deployment Guide

Complete guide for deploying Fuelguard to production.

## Prerequisites

- Firebase project (production)
- Domain name for MQTT broker
- VPS/Cloud server for MQTT bridge
- GitHub repository
- Vercel account (for frontend) or Firebase Hosting

## 1. Firebase Production Setup

### Create Production Project

```bash
# Login to Firebase
firebase login

# Create new project or select existing
firebase use --add

# Select production project
firebase use production
```

### Configure Environment

```bash
cd backend/functions

# Create production environment file
cp .env.example .env.production

# Edit with production values
# - MQTT broker URL
# - Twilio credentials
# - SendGrid API key
```

### Deploy Firestore Rules

```bash
cd backend
firebase deploy --only firestore:rules,firestore:indexes
```

### Deploy Cloud Functions

```bash
cd backend
firebase deploy --only functions
```

## 2. MQTT Broker with TLS

### Setup Server

```bash
# SSH into your VPS
ssh user@your-server.com

# Install Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER

# Clone repository
git clone https://github.com/yourusername/Fuelguard-1.git
cd Fuelguard-1/backend/mqtt-broker
```

### Generate TLS Certificates

```bash
# Make script executable
chmod +x setup-tls.sh

# Edit domain and email
nano setup-tls.sh

# Run setup
./setup-tls.sh
```

### Configure EMQX

```bash
# Edit EMQX configuration
nano emqx/etc/emqx.conf

# Add TLS listener configuration:
# listener.ssl.external = 8883
# listener.ssl.external.keyfile = etc/certs/key.pem
# listener.ssl.external.certfile = etc/certs/cert.pem
# listener.ssl.external.cacertfile = etc/certs/cacert.pem
```

### Start MQTT Broker

```bash
docker-compose -f docker-compose.prod.yml up -d

# Check logs
docker logs -f fuelguard-emqx-prod

# Access dashboard
# https://your-server.com:18083
# Default: admin / public
```

### Configure Authentication

```bash
# Access EMQX dashboard
# Go to Authentication → Create

# Add device credentials
# Username: device_<deviceId>
# Password: <secure_password>

# Add bridge service credentials
# Username: fuelguard_bridge
# Password: <secure_password>
```

## 3. Bridge Service Deployment

### Setup on VPS

```bash
# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2
sudo npm install -g pm2

# Navigate to bridge directory
cd ~/Fuelguard-1/backend/bridge

# Install dependencies
npm install

# Create production .env
cp .env.example .env
nano .env

# Set:
# MQTT_BROKER_URL=mqtts://your-server.com:8883
# MQTT_USERNAME=fuelguard_bridge
# MQTT_PASSWORD=<password>
# FIREBASE_PROJECT_ID=your-production-project
# FIREBASE_SERVICE_ACCOUNT_PATH=./serviceAccountKey.json
```

### Get Firebase Service Account

```bash
# In Firebase Console:
# Project Settings → Service Accounts → Generate New Private Key

# Upload to server
scp serviceAccountKey.json user@your-server.com:~/Fuelguard-1/backend/bridge/
```

### Start Bridge Service

```bash
# Build
npm run build

# Start with PM2
pm2 start npm --name "fuelguard-bridge" -- start

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup

# Check status
pm2 status
pm2 logs fuelguard-bridge
```

## 4. Frontend Deployment

### Configure Environment

```bash
# Create .env.local
cp .env.example .env.local

# Add Firebase config from Firebase Console
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...

# Add API URL
NEXT_PUBLIC_API_URL=https://your-region-your-project.cloudfunctions.net/api
```

### Deploy to Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel --prod

# Or link to GitHub for automatic deployments
```

### Alternative: Firebase Hosting

```bash
# Build frontend
npm run build

# Deploy to Firebase Hosting
firebase deploy --only hosting
```

## 5. GitHub Secrets Configuration

Add these secrets to your GitHub repository:

```
Settings → Secrets and variables → Actions → New repository secret
```

**Required Secrets:**
- `FIREBASE_TOKEN` - Get with `firebase login:ci`
- `FIREBASE_PROJECT_ID` - Your production project ID
- `VERCEL_TOKEN` - From Vercel account settings
- `FIREBASE_API_KEY` - From Firebase console

## 6. ESP32 Production Configuration

### Update Firmware Config

```cpp
// firmware/src/config.h

#define DEVICE_ID "ESP32_XXX"  // Unique per device
#define MQTT_BROKER "mqtts://your-server.com"
#define MQTT_PORT 8883
#define MQTT_USER "device_ESP32_XXX"
#define MQTT_PASS "secure_password"

// Enable TLS
#define MQTT_USE_TLS true
```

### Flash Devices

```bash
cd firmware

# Update config for each device
nano src/config.h

# Flash
pio run --target upload

# Monitor
pio device monitor
```

## 7. Monitoring Setup

### Firebase Console

- Monitor Cloud Functions logs
- Check Firestore usage
- Review authentication activity

### EMQX Dashboard

- Monitor connected devices
- Check message throughput
- Review authentication logs

### PM2 Monitoring

```bash
# View logs
pm2 logs fuelguard-bridge

# Monitor resources
pm2 monit

# View dashboard
pm2 web
```

### Setup Alerts

```bash
# Configure Firebase Performance Monitoring
# Firebase Console → Performance

# Setup error alerts
# Firebase Console → Alerts
```

## 8. Testing Production

### Test MQTT Connection

```bash
# Install mosquitto clients
sudo apt-get install mosquitto-clients

# Test TLS connection
mosquitto_sub -h your-server.com -p 8883 \
  -t "fuelguard/devices/+/data" \
  -u fuelguard_bridge \
  -P <password> \
  --cafile ./certs/cacert.pem
```

### Test API Endpoints

```bash
# Get auth token from frontend
# Then test API

curl -H "Authorization: Bearer <token>" \
  https://your-region-your-project.cloudfunctions.net/api/vehicles
```

### Test Real Device

1. Flash ESP32 with production config
2. Power on device
3. Check EMQX dashboard for connection
4. Verify data in Firestore
5. Check frontend for real-time updates

## 9. Security Checklist

- [ ] Firestore rules deployed and tested
- [ ] MQTT broker uses TLS
- [ ] Strong passwords for MQTT authentication
- [ ] Firebase service account key secured
- [ ] Environment variables not in git
- [ ] API endpoints require authentication
- [ ] CORS configured correctly
- [ ] Rate limiting enabled (Cloud Functions)

## 10. Backup & Disaster Recovery

### Firestore Backup

```bash
# Enable automated backups
# Firebase Console → Firestore → Backups

# Or use gcloud
gcloud firestore export gs://your-backup-bucket
```

### MQTT Broker Backup

```bash
# Backup EMQX data
tar -czf emqx-backup-$(date +%Y%m%d).tar.gz emqx/data

# Upload to cloud storage
```

## Troubleshooting

### Cloud Functions Not Deploying

```bash
# Check logs
firebase functions:log

# Redeploy specific function
firebase deploy --only functions:api
```

### MQTT Connection Issues

```bash
# Check broker logs
docker logs fuelguard-emqx-prod

# Test connection
telnet your-server.com 8883
```

### Bridge Service Crashes

```bash
# Check logs
pm2 logs fuelguard-bridge

# Restart
pm2 restart fuelguard-bridge
```

## Maintenance

### Certificate Renewal

```bash
# Renew Let's Encrypt certificates (every 90 days)
sudo certbot renew

# Restart EMQX
docker-compose -f docker-compose.prod.yml restart
```

### Update Dependencies

```bash
# Backend Functions
cd backend/functions
npm update
npm audit fix

# Bridge Service
cd backend/bridge
npm update

# Frontend
npm update
```

### Monitor Costs

- Firebase Console → Usage and billing
- Check Cloud Functions invocations
- Monitor Firestore reads/writes
- Review bandwidth usage

## Support

For issues:
1. Check logs (Firebase, PM2, EMQX)
2. Review monitoring dashboards
3. Test individual components
4. Contact support if needed
