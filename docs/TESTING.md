# Testing Guide

Comprehensive testing strategy for Fuelguard IoT system.

## Testing Stack

- **Unit Tests**: Jest + ts-jest
- **Integration Tests**: Firebase Functions Test SDK
- **E2E Tests**: Cypress (optional)
- **API Testing**: curl / Postman
- **Load Testing**: Artillery (optional)

## Running Tests

### Backend Functions

```bash
cd backend/functions

# Install dependencies
npm install

# Run all tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

### Bridge Service

```bash
cd backend/bridge

# Build
npm run build

# Test MQTT connection
node dist/index.js
```

### Frontend

```bash
# Run tests (when implemented)
npm test

# E2E tests with Cypress
npx cypress open
```

## Unit Tests

### Validation Tests

Test Zod schemas for MQTT payloads and API requests.

**File**: `backend/functions/tests/utils/validators.test.ts`

```bash
npm test -- validators.test.ts
```

### Alert Detection Tests

Test theft detection logic with various scenarios.

**File**: `backend/functions/tests/triggers/alertTrigger.test.ts`

```bash
npm test -- alertTrigger.test.ts
```

## Integration Tests

### MQTT to Firestore Flow

1. Start Firebase emulators
2. Start MQTT broker
3. Publish test message
4. Verify Firestore write
5. Check alert creation

```bash
# Terminal 1: Start emulators
cd backend/functions
firebase emulators:start

# Terminal 2: Start bridge
cd backend/bridge
npm run dev

# Terminal 3: Publish test data
mosquitto_pub -h localhost -p 1883 \
  -t "fuelguard/devices/TEST001/data" \
  -m '{"deviceId":"TEST001","timestamp":1234567890,"data":{"fuel":{"ultrasonic":45.2,"float":2048,"liters":110.5,"percentage":55.25},"gps":null,"tamper":false,"battery":4.1,"signal":25}}'
```

## API Testing

### Get Auth Token

```javascript
// In browser console on your app
import {auth} from './lib/firebase';
const token = await auth.currentUser.getIdToken();
console.log(token);
```

### Test Endpoints

```bash
# Set token
TOKEN="your-firebase-token"
API_URL="https://your-project.cloudfunctions.net/api"

# List vehicles
curl -H "Authorization: Bearer $TOKEN" \
  $API_URL/vehicles

# Get vehicle
curl -H "Authorization: Bearer $TOKEN" \
  $API_URL/vehicles/veh123

# Create vehicle
curl -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"licensePlate":"ABC-123","make":"Toyota","model":"Camry","year":2020,"tankCapacity":200}' \
  $API_URL/vehicles

# List alerts
curl -H "Authorization: Bearer $TOKEN" \
  $API_URL/alerts?status=active

# Dashboard stats
curl -H "Authorization: Bearer $TOKEN" \
  $API_URL/dashboard/summary
```

## ESP32 Testing

### Serial Monitor

```bash
cd firmware
pio device monitor

# Expected output:
# Fuelguard ESP32 Starting...
# Initializing GSM...
# Modem: SIM800L
# Waiting for network... OK
# Connecting to GPRS... OK
# Connecting to MQTT... OK
# Subscribed to: fuelguard/devices/ESP32_001/commands
# Fuel Level: 110.5L (55.2%)
# Data published successfully
```

### Test Commands

```bash
# Send relay command
mosquitto_pub -h your-server.com -p 8883 \
  -t "fuelguard/devices/ESP32_001/commands" \
  -m '{"command":"relay_on"}' \
  -u device_ESP32_001 \
  -P password \
  --cafile certs/cacert.pem
```

## Load Testing

### Artillery Configuration

```yaml
# artillery-config.yml
config:
  target: "https://your-project.cloudfunctions.net"
  phases:
    - duration: 60
      arrivalRate: 10
scenarios:
  - name: "Get Vehicles"
    flow:
      - get:
          url: "/api/vehicles"
          headers:
            Authorization: "Bearer {{token}}"
```

### Run Load Test

```bash
npm install -g artillery

artillery run artillery-config.yml
```

## CI/CD Testing

### GitHub Actions

Tests run automatically on:
- Pull requests
- Push to main/develop

View results:
- GitHub → Actions tab
- Check workflow runs

### Local CI Simulation

```bash
# Install act (GitHub Actions locally)
brew install act  # macOS
# or
curl https://raw.githubusercontent.com/nektos/act/master/install.sh | sudo bash

# Run CI workflow
act pull_request
```

## Test Coverage

### View Coverage Report

```bash
cd backend/functions
npm run test:coverage

# Open coverage report
open coverage/lcov-report/index.html
```

### Coverage Goals

- **Statements**: > 70%
- **Branches**: > 70%
- **Functions**: > 70%
- **Lines**: > 70%

## Smoke Tests

### Production Deployment

After deploying to production, run these smoke tests:

1. **Authentication**
   ```bash
   # Login to frontend
   # Verify token generation
   ```

2. **API Endpoints**
   ```bash
   # Test each endpoint
   curl $API_URL/vehicles
   curl $API_URL/devices
   curl $API_URL/alerts
   curl $API_URL/dashboard/summary
   ```

3. **Real-time Updates**
   - Open dashboard
   - Publish MQTT message
   - Verify data appears in real-time

4. **Alert Detection**
   - Simulate fuel drop
   - Check alert creation
   - Verify notification sent

5. **ESP32 Connection**
   - Power on device
   - Check MQTT broker logs
   - Verify data in Firestore

## Troubleshooting Tests

### Tests Failing

```bash
# Clear cache
npm run test -- --clearCache

# Run specific test
npm test -- validators.test.ts

# Debug mode
node --inspect-brk node_modules/.bin/jest --runInBand
```

### Firebase Emulator Issues

```bash
# Kill existing emulators
lsof -ti:8080 | xargs kill -9

# Clear emulator data
firebase emulators:start --clear-data
```

### MQTT Connection Issues

```bash
# Check broker is running
docker ps | grep mqtt

# Test connection
mosquitto_sub -h localhost -p 1883 -t "#" -v

# Check logs
docker logs fuelguard-mqtt
```

## Best Practices

1. **Write tests first** (TDD when possible)
2. **Test edge cases** (null values, invalid data)
3. **Mock external services** (Firebase, MQTT)
4. **Keep tests fast** (< 5 seconds total)
5. **Test real scenarios** (actual user flows)
6. **Maintain coverage** (> 70%)
7. **Run tests in CI** (automated)

## Next Steps

- [ ] Add E2E tests with Cypress
- [ ] Implement API integration tests
- [ ] Add load testing
- [ ] Setup continuous testing
- [ ] Monitor test performance
