# Fuelguard ESP32 Firmware

Firmware for ESP32-based fuel monitoring device with GSM connectivity.

## Hardware Requirements

### Core Components
- **ESP32 DevKit** - Main microcontroller
- **SIM800L** - GSM module for MQTT over cellular
- **NEO-6M** - GPS module for location tracking
- **JSN-SR04T** - Waterproof ultrasonic sensor (primary)
- **Float Sensor** - Analog fuel level sensor (backup)
- **Reed Switch** - Tamper detection
- **Relay Module** - Fuel shutoff control

### Power Components
- **LM2596 Buck Converters** (2x) - 5V and 4V regulation
- **Supercapacitor** (1F, 5.5V) - GSM power stability
- **P-Channel MOSFET** - Reverse polarity protection

## Pin Connections

```
ESP32 GPIO    →  Component
─────────────────────────────────
GPIO 25       →  Ultrasonic TRIG
GPIO 26       →  Ultrasonic ECHO
GPIO 34 (ADC) →  Float Sensor
GPIO 27       →  Reed Switch
GPIO 32       →  Relay Module

GPIO 17       →  SIM800L TX
GPIO 16       →  SIM800L RX
GPIO 4        →  SIM800L PWR

GPIO 22       →  GPS TX
GPIO 21       →  GPS RX

GPIO 35 (ADC) →  Battery Monitor
```

## Power Supply

```
12V Vehicle Battery
    │
    ├─→ Reverse Polarity Protection (P-MOSFET)
    │
    ├─→ LM2596 (5V) → ESP32, Sensors, Relay
    │
    └─→ LM2596 (4V) → SIM800L + Supercapacitor (1F)
```

## Configuration

Edit `src/config.h` before uploading:

```cpp
// Device Identification
#define DEVICE_ID "ESP32_001"  // Unique per device

// GSM Configuration
#define GSM_APN "internet"     // Your carrier's APN
#define GSM_USER ""            // Leave empty if not required
#define GSM_PASS ""            // Leave empty if not required

// MQTT Broker
#define MQTT_BROKER "mqtt.yourdomain.com"
#define MQTT_PORT 1883         // 8883 for TLS
#define MQTT_USER "device_ESP32_001"
#define MQTT_PASS "your_secure_password"
#define MQTT_USE_TLS false     // Set true for production

// Tank Configuration
#define TANK_HEIGHT_CM 100.0   // Tank height in cm
#define TANK_CAPACITY_L 200.0  // Tank capacity in liters

// Sensor Pins
#define ULTRASONIC_TRIG 25
#define ULTRASONIC_ECHO 26
#define FLOAT_SENSOR_PIN 34
#define REED_SWITCH_PIN 27
#define RELAY_PIN 32
#define BATTERY_PIN 35

// Thresholds
#define THEFT_THRESHOLD 10.0   // % drop to trigger alert
#define TAMPER_DEBOUNCE 5000   // ms

// Emergency Contact
#define EMERGENCY_PHONE "+1234567890"
```

## Installation

### 1. Install PlatformIO

**VS Code Extension (Recommended):**
1. Install VS Code
2. Install PlatformIO IDE extension
3. Restart VS Code

**CLI:**
```bash
pip install platformio
```

### 2. Open Project

```bash
cd firmware
code .  # Opens in VS Code
```

### 3. Configure Device

Edit `src/config.h` with your settings:
- Device ID
- GSM APN
- MQTT broker details
- Tank dimensions
- Emergency phone

### 4. Build Firmware

```bash
pio run
```

### 5. Upload to ESP32

```bash
# Connect ESP32 via USB
pio run --target upload

# Monitor serial output
pio device monitor
```

## Calibration

### Ultrasonic Sensor Calibration

1. **Measure Tank Height**
   ```cpp
   #define TANK_HEIGHT_CM 100.0  // Your actual tank height
   ```

2. **Test Empty Tank**
   - Empty the tank completely
   - Monitor serial output
   - Should read ~0% fuel level

3. **Test Full Tank**
   - Fill tank completely
   - Should read ~100% fuel level

4. **Adjust if Needed**
   - Modify `TANK_HEIGHT_CM` for accuracy

### Float Sensor Calibration

1. **Read Analog Values**
   ```cpp
   // Monitor serial output for raw values
   // Empty: ~0-500
   // Half: ~1500-2500
   // Full: ~3500-4095
   ```

2. **Create Calibration Curve**
   - Map analog values to fuel percentage
   - Update `readFloatSensor()` function if needed

## MQTT Communication

### Publishing Topics

**Sensor Data:**
```
fuelguard/devices/{DEVICE_ID}/data
```

**Device Status:**
```
fuelguard/devices/{DEVICE_ID}/status
```

### Subscribing Topics

**Commands:**
```
fuelguard/devices/{DEVICE_ID}/commands
```

### Payload Format

**Sensor Data:**
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

**Commands:**
```json
{
  "command": "relay_on"
}
```

Available commands:
- `relay_on` - Activate fuel shutoff
- `relay_off` - Deactivate fuel shutoff
- `reboot` - Restart ESP32

## Serial Monitor Output

Expected output on successful startup:

```
Fuelguard ESP32 Starting...
Device ID: ESP32_001
Initializing GSM...
Modem: SIM800L
Waiting for network... OK
Signal strength: 25
Connecting to GPRS... OK
Connecting to MQTT broker... OK
Subscribed to: fuelguard/devices/ESP32_001/commands

GPS: Waiting for fix...
GPS: Fix acquired (8 satellites)

Fuel Level: 110.5L (55.2%)
Location: 37.7749, -122.4194
Tamper: OK
Battery: 4.1V

Data published successfully
```

## Troubleshooting

### GSM Not Connecting

**Symptoms:** "Waiting for network..." timeout

**Solutions:**
- Check SIM card is inserted and activated
- Verify APN settings for your carrier
- Ensure 4V power supply is stable (use supercap)
- Check antenna connection
- Try different location (better signal)

### GPS No Fix

**Symptoms:** GPS fix = false

**Solutions:**
- Ensure clear view of sky (outdoor)
- Wait 2-5 minutes for initial fix (cold start)
- Check antenna connection
- Verify TX/RX pins are correct
- Check GPS module LED (should blink)

### MQTT Connection Failed

**Symptoms:** "Connecting to MQTT... FAILED"

**Solutions:**
- Verify broker URL and port
- Check MQTT credentials
- Ensure GSM data connection is active
- Test broker with `mosquitto_sub`
- Check firewall rules

### Sensor Readings Incorrect

**Symptoms:** Wrong fuel percentage

**Solutions:**
- Recalibrate sensors
- Check wiring connections
- Verify power supply voltage (5V stable)
- Monitor serial output for raw values
- Ensure sensor is properly mounted

### Device Rebooting

**Symptoms:** Constant restarts

**Solutions:**
- Check power supply (needs 2A for GSM)
- Add/check supercapacitor
- Verify all ground connections
- Check for short circuits
- Monitor battery voltage

## Power Consumption

- **Idle**: ~80mA
- **GPS Active**: ~120mA
- **GSM Transmit**: ~2A (peak, <1s)
- **Average**: ~150mA

**Battery Life Calculation:**
```
12V 7Ah battery = 7000mAh
Average draw = 150mA
Runtime = 7000 / 150 = ~46 hours
```

## Production Deployment

### 1. Configure for Production

```cpp
// src/config.h
#define MQTT_BROKER "mqtt.yourdomain.com"
#define MQTT_PORT 8883
#define MQTT_USE_TLS true
```

### 2. Flash Multiple Devices

```bash
# Create script for batch flashing
#!/bin/bash
for i in {001..050}; do
  # Update DEVICE_ID in config.h
  sed -i "s/ESP32_[0-9]*/ESP32_$i/" src/config.h
  
  # Flash
  pio run --target upload
  
  # Wait for user to swap device
  read -p "Connect next device and press Enter"
done
```

### 3. Test Each Device

- Power on
- Check serial output
- Verify MQTT connection
- Check data in Firestore
- Test GPS fix
- Test relay control

## OTA Updates (Future)

Firmware supports OTA updates:
- Trigger via MQTT command
- Download from HTTP server
- Verify checksum
- Flash and reboot

## Security

### Current
- MQTT username/password authentication
- Device ID validation in backend

### Production (Recommended)
- Enable TLS for MQTT (`MQTT_USE_TLS true`)
- Use unique credentials per device
- Implement certificate pinning
- Encrypt sensitive data

## Performance

- **Sensor Reading**: Every 30 seconds
- **MQTT Publish**: Every 30 seconds
- **GPS Update**: Continuous
- **Battery Check**: Every reading
- **Tamper Check**: Continuous

## Debugging

### Enable Debug Output

```cpp
// In main.cpp
#define DEBUG_MODE 1

#if DEBUG_MODE
  Serial.println("Debug: GSM initialized");
#endif
```

### Monitor All Serial Output

```bash
pio device monitor --baud 115200
```

### Test Individual Components

```cpp
// Test ultrasonic only
void loop() {
  float distance = readUltrasonicSensor();
  Serial.printf("Distance: %.2f cm\n", distance);
  delay(1000);
}
```

## Libraries Used

- **TinyGSM** - GSM modem support
- **TinyGPS++** - GPS parsing
- **PubSubClient** - MQTT client
- **ArduinoJson** - JSON serialization

## License

MIT

## Support

- GitHub Issues: [Report a bug](https://github.com/yourusername/Fuelguard-1/issues)
- Documentation: See main [README](../README.md)
