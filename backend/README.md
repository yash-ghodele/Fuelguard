# Fuelguard Backend

Firebase Cloud Functions and MQTT bridge service for IoT fuel monitoring.

## Architecture

```
ESP32 → MQTT Broker → Bridge Service → Firestore → Cloud Functions → Frontend
                                          ↓
                                    Notifications
```

## Components

### 1. Cloud Functions (`functions/`)

Serverless API and Firestore triggers.

**API Endpoints:**
- `/api/vehicles` - Vehicle management
- `/api/devices` - Device management
- `/api/alerts` - Alert management
- `/api/dashboard` - Dashboard statistics

**Triggers:**
- `onFuelReadingCreated` - Automatic theft detection
- Scheduled functions for cleanup and reports

### 2. MQTT Bridge (`bridge/`)

Node.js service that connects MQTT broker to Firestore.

**Features:**
- Subscribes to device topics
- Validates MQTT payloads
- Writes to Firestore
- Updates device status

### 3. MQTT Broker (`mqtt-broker/`)

EMQX or Mosquitto broker for IoT communication.

**Production Features:**
- TLS encryption
- Authentication
- ACL rules
- WebSocket support

## Setup

### Prerequisites

- Node.js 20+
- Firebase CLI
- Docker
- Firebase project

### 1. Install Firebase CLI

```bash
npm install -g firebase-tools
firebase login
```

### 2. Initialize Firebase

```bash
firebase init

# Select:
# - Functions (TypeScript)
# - Firestore
# - Hosting (optional)
```

### 3. Install Dependencies

```bash
# Cloud Functions
cd functions
npm install

# Bridge Service
cd ../bridge
npm install
```

### 4. Configure Environment

```bash
# Functions
cd functions
cp .env.example .env
# Edit with your configuration

# Bridge
cd ../bridge
cp .env.example .env
# Edit with MQTT and Firebase config
```

### 5. Start MQTT Broker

```bash
# Development
docker-compose up -d

# Production (with TLS)
cd mqtt-broker
./setup-tls.sh
docker-compose -f docker-compose.prod.yml up -d
```

### 6. Deploy Firestore Rules

```bash
firebase deploy --only firestore:rules,firestore:indexes
```

### 7. Run Locally

```bash
# Start Firebase emulators
cd functions
firebase emulators:start

# In another terminal, start bridge
cd bridge
npm run dev
```

## Development

### Cloud Functions

```bash
cd functions

# Build
npm run build

# Watch mode
npm run dev

# Lint
npm run lint

# Test
npm test

# Deploy
npm run deploy
```

### Bridge Service

```bash
cd bridge

# Build
npm run build

# Development
npm run dev

# Production
npm start
```

## Testing

```bash
cd functions

# Run all tests
npm test

# Watch mode
npm run test:watch

# Coverage
npm run test:coverage
```

See [../docs/TESTING.md](../docs/TESTING.md) for detailed testing guide.

## API Documentation

### Authentication

All API endpoints require Firebase Authentication token:

```bash
Authorization: Bearer <firebase-id-token>
```

### Vehicles API

#### List Vehicles
```bash
GET /api/vehicles
```

#### Get Vehicle
```bash
GET /api/vehicles/:id
```

#### Create Vehicle
```bash
POST /api/vehicles
Content-Type: application/json

{
  "licensePlate": "ABC-123",
  "make": "Toyota",
  "model": "Camry",
  "year": 2020,
  "tankCapacity": 200,
  "driver": "John Doe"
}
```

#### Update Vehicle
```bash
PUT /api/vehicles/:id
Content-Type: application/json

{
  "driver": "Jane Doe"
}
```

#### Delete Vehicle
```bash
DELETE /api/vehicles/:id
```

#### Get Fuel History
```bash
GET /api/vehicles/:id/fuel-history?limit=100&startTime=1234567890
```

### Devices API

#### Register Device
```bash
POST /api/devices
Content-Type: application/json

{
  "deviceId": "ESP32_001",
  "serialNumber": "SN123456",
  "vehicleId": "veh123",
  "firmwareVersion": "1.0.0"
}
```

#### Update Configuration
```bash
PUT /api/devices/:id/config
Content-Type: application/json

{
  "reportInterval": 30,
  "theftThreshold": 10
}
```

#### Send Command
```bash
POST /api/devices/:id/command
Content-Type: application/json

{
  "command": "relay_on"
}
```

Available commands:
- `relay_on` - Activate fuel shutoff
- `relay_off` - Deactivate fuel shutoff
- `reboot` - Restart device

#### Get Device Health
```bash
GET /api/devices/:id/health
```

### Alerts API

#### List Alerts
```bash
GET /api/alerts?vehicleId=veh123&status=active&type=fuel_theft
```

#### Get Alert
```bash
GET /api/alerts/:id
```

#### Resolve Alert
```bash
PUT /api/alerts/:id/resolve
Content-Type: application/json

{
  "notes": "False alarm - refueling",
  "status": "false_positive"
}
```

#### Get Statistics
```bash
GET /api/alerts/stats
```

### Dashboard API

#### Get Summary
```bash
GET /api/dashboard/summary

Response:
{
  "totalVehicles": 25,
  "onlineVehicles": 23,
  "avgFuelLevel": 67.5,
  "activeAlerts": 2,
  "deviceHealth": {
    "online": 23,
    "offline": 2,
    "error": 0
  },
  "recentActivity": [...]
}
```

## Firestore Collections

### users
```typescript
{
  email: string;
  role: 'admin' | 'operator' | 'viewer';
  organizationId: string;
  notificationPreferences: {
    fcm: boolean;
    sms: boolean;
    email: boolean;
  };
  createdAt: Timestamp;
}
```

### vehicles
```typescript
{
  licensePlate: string;
  make: string;
  model: string;
  year: number;
  tankCapacity: number;
  deviceId?: string;
  status: 'online' | 'offline';
  driver?: string;
  organizationId: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### devices
```typescript
{
  deviceId: string;
  serialNumber: string;
  vehicleId?: string;
  firmwareVersion: string;
  status: 'online' | 'offline' | 'error';
  lastSeen: Timestamp;
  configuration: {
    reportInterval: number;
    theftThreshold: number;
  };
  organizationId: string;
}
```

### fuelReadings
```typescript
{
  vehicleId: string;
  deviceId: string;
  timestamp: number;
  fuelLevel: {
    liters: number;
    percentage: number;
  };
  location: {
    lat: number;
    lon: number;
    speed: number;
    satellites: number;
  } | null;
  sensors: {
    ultrasonic: {distance: number; valid: boolean};
    float: {value: number; valid: boolean};
    gps: {fix: boolean; satellites: number; speed: number};
    tamper: boolean;
    battery: number;
    signalStrength: number;
  };
  organizationId: string;
}
```

### alerts
```typescript
{
  vehicleId: string;
  deviceId: string;
  type: 'fuel_theft' | 'tampering' | 'sensor_error';
  fuelLoss: number;
  location: {lat: number; lon: number} | null;
  status: 'active' | 'resolved' | 'false_positive';
  severity: 'low' | 'medium' | 'high' | 'critical';
  detectedAt: number;
  resolvedAt?: number;
  resolvedBy?: string;
  notes?: string;
  organizationId: string;
}
```

## MQTT Topics

### Device → Cloud (Publish)

```
fuelguard/devices/{deviceId}/data
```

Payload:
```json
{
  "deviceId": "ESP32_001",
  "timestamp": 1234567890,
  "data": {
    "fuel": {
      "ultrasonic": 45.2,
      "float": 2048,
      "liters": 110.5,
      "percentage": 55.25
    },
    "gps": {
      "lat": 37.7749,
      "lon": -122.4194,
      "speed": 45.5,
      "satellites": 8,
      "fix": true
    },
    "tamper": false,
    "battery": 4.1,
    "signal": 25
  }
}
```

### Cloud → Device (Subscribe)

```
fuelguard/devices/{deviceId}/commands
```

Payload:
```json
{
  "command": "relay_on"
}
```

## Security

### Firestore Rules

- Organization-based data isolation
- Role-based access control
- Read/write permissions per collection

### MQTT Security

- TLS encryption (production)
- Username/password authentication
- ACL rules per device
- Topic-level permissions

### API Security

- Firebase Authentication required
- Token validation
- Rate limiting
- Input validation with Zod

## Monitoring

### Firebase Console

- Cloud Functions logs
- Firestore usage metrics
- Authentication activity

### EMQX Dashboard

- Connected devices
- Message throughput
- Authentication logs

### Application Logs

Winston logger with structured logging:
- Error tracking
- Performance metrics
- Request/response logging

## Deployment

See [../docs/DEPLOYMENT.md](../docs/DEPLOYMENT.md) for production deployment guide.

### Quick Deploy

```bash
# Deploy Firestore
firebase deploy --only firestore

# Deploy Functions
firebase deploy --only functions

# Start MQTT broker
docker-compose -f mqtt-broker/docker-compose.prod.yml up -d

# Start bridge (on VPS)
pm2 start npm --name fuelguard-bridge -- start
```

## Troubleshooting

### Functions Not Deploying

```bash
# Check logs
firebase functions:log

# Redeploy
firebase deploy --only functions --force
```

### Bridge Service Issues

```bash
# Check logs
pm2 logs fuelguard-bridge

# Restart
pm2 restart fuelguard-bridge
```

### MQTT Connection Issues

```bash
# Check broker
docker logs fuelguard-mqtt

# Test connection
mosquitto_sub -h localhost -p 1883 -t "#" -v
```

## Performance

- API response: <200ms average
- Alert detection: <1s from reading
- MQTT throughput: 1000+ msg/min
- Firestore writes: Real-time sync

## License

MIT
