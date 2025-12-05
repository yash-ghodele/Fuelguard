# FuelShield Firmware 🔌

IoT device firmware for vehicle monitoring and fuel sensing using ESP32/ESP8266.

## 📋 Overview

This firmware enables real-time vehicle monitoring by reading fuel levels, GPS coordinates, and detecting tampering. Data is transmitted via MQTT to the FuelShield cloud backend.

---

## 🛠️ Hardware Requirements

### Microcontroller
- **ESP32** or **ESP8266**
- Minimum 4MB flash memory
- WiFi capability  
- 2 UART ports (GPS + Debug)

### Sensors
- **Fuel Level Sensor** - Ultrasonic (HC-SR04) or Float sensor
- **GPS Module** - NEO-6M, NEO-7M, or NEO-M8N
- **Accelerometer** - MPU6050 (optional, for tamper detection)
- **Temperature Sensor** - DHT22 (optional)

### Additional Components
- 12V to 5V/3.3V converter (vehicle power supply)
- SD Card module (for offline logging)
- LED indicators (status, power, error)
- Housing (weatherproof enclosure)

---

## 🔧 Software Setup

### Prerequisites
- Arduino IDE 2.0+ or PlatformIO
- ESP32/ESP8266 board support
- Required libraries (see below)

### Required Libraries

Install via Arduino Library Manager:

```
- WiFi.h (built-in)
- PubSubClient (MQTT client)
- TinyGPSPlus (GPS parsing)
- ArduinoJson (JSON serialization)
- NewPing (ultrasonic sensor)
- Wire.h (I2C, built-in)
```

### Installation

1. **Install Arduino IDE**
   - Download from [arduino.cc](https://www.arduino.cc/en/software)

2. **Add ESP32 Board Support**
   ```
   File → Preferences → Additional Board Manager URLs:
   https://dl.espressif.com/dl/package_esp32_index.json
   ```

3. **Install Libraries**
   ```
   Tools → Manage Libraries
   Search and install all required libraries
   ```

4. **Configure WiFi & MQTT**
   
   Create `config.h` in firmware directory:
   ```cpp
   #ifndef CONFIG_H
   #define CONFIG_H
   
   // WiFi Configuration
   #define WIFI_SSID "your_wifi_ssid"
   #define WIFI_PASSWORD "your_wifi_password"
   
   // MQTT Configuration
   #define MQTT_BROKER "broker.hivemq.com"
   #define MQTT_PORT 1883
   #define MQTT_USERNAME ""
   #define MQTT_PASSWORD ""
   #define MQTT_TOPIC "FuelShield/devices"
   
   // Device Configuration
   #define DEVICE_ID "ESP32_001"
   #define READING_INTERVAL 30000  // 30 seconds
   
   // Tank Dimensions (cm)
   #define TANK_HEIGHT 50
   #define TANK_CAPACITY 60  // liters
   
   #endif
   ```

5. **Upload Firmware**
   ```
   Select Board → ESP32 Dev Module (or your board)
   Select Port → Your COM port
   Click Upload
   ```

---

## 📡 Data Transmission

Device sends JSON payloads every 30 seconds via MQTT:

```json
{
  "deviceId": "ESP32_001",
  "timestamp": 1701234567,
  "data": {
    "fuel": {
      "ultrasonic": 25.3,
      "float": 24.8,
      "liters": 42.5,
      "percentage": 70.8
    },
    "gps": {
      "lat": 19.8762,
      "lng": 75.3433,
      "speed": 45.2,
      "satellites": 8,
      "fix": true
    },
    "tamper": false,
    "battery": 3.8,
    "signal": 25
  }
}
```

---

## 🔋 Power Management

**Features**:
- Deep sleep mode when vehicle is stationary
- Wake on motion detection (via accelerometer)
- Low battery alerts (< 3.3V)
- Power-saving WiFi modes

**Sleep Configuration**:
```cpp
#define SLEEP_DURATION 60  // seconds
#define MOTION_THRESHOLD 0.5  // g-force

// Enter deep sleep
esp_sleep_enable_timer_wakeup(SLEEP_DURATION * 1000000);
esp_deep_sleep_start();
```

---

## ⚙️ Configuration

### WiFi Setup
- Device creates AP mode if connection fails
- Connect to `FuelShield-Setup` network
- Navigate to `192.168.4.1`
- Enter WiFi credentials via web interface

### Over-the-Air (OTA) Updates
```cpp
#include <ArduinoOTA.h>

ArduinoOTA.setHostname("FuelShield-esp32");
ArduinoOTA.setPassword("your_ota_password");
ArduinoOTA.begin();
```

Update firmware via network:
```bash
arduino-cli upload -p network://FuelShield-esp32.local
```

---

## 🐛 Debugging

### Serial Monitor
- Baud Rate: **115200**
- Line Ending: Both NL & CR
- Enable timestamps

### LED Indicators
- **Solid Blue**: WiFi Connected, Running
- **Blinking Blue**: Connecting to WiFi
- **Solid Red**: Error State
- **Blinking Green**: Data Transmission
- **Off**: Deep Sleep

### Common Issues

**No WiFi Connection**:
- Check SSID/password in config.h
- Verify 2.4GHz network (ESP32 doesn't support 5GHz)
- Check distance from router

**No GPS Fix**:
- Ensure GPS antenna has clear sky view
- Wait 1-2 minutes for initial fix
- Check GPS module power (3.3V)

**Fuel Reading Errors**:
- Verify sensor wiring
- Check sensor height above tank bottom
- Calibrate tank dimensions in config.h

---

## 📊 Pin Configuration

**ESP32 Default Pinout**:

```
GPS Module:
  RX → GPIO 16
  TX → GPIO 17
  VCC → 3.3V
  GND → GND

Fuel Sensor (Ultrasonic):
  TRIG → GPIO 26
  ECHO → GPIO 27
  VCC → 5V
  GND → GND

Fuel Sensor (Float):
  SIGNAL → GPIO 34 (ADC1)
  VCC → 3.3V
  GND → GND

LED Indicators:
  Blue LED → GPIO 2
  Red LED → GPIO 4
  Green LED → GPIO 5

SD Card:
  MISO → GPIO 19
  MOSI → GPIO 23
  CLK → GPIO 18
  CS → GPIO 5
```

---

## 📝 Development

### Compile
```bash
arduino-cli compile --fqbn esp32:esp32:esp32dev
```

### Upload
```bash
arduino-cli upload -p /dev/ttyUSB0 --fqbn esp32:esp32:esp32dev
```

### Monitor
```bash
arduino-cli monitor -p /dev/ttyUSB0 -c baudrate=115200
```

### PlatformIO (Alternative)
```bash
# Initialize project
platformio init --board esp32dev

# Build
platformio run

# Upload
platformio run --target upload

# Monitor
platformio device monitor
```

---

## 🔒 Security

- **WiFi Encryption**: WPA2 required
- **MQTT TLS**: Enable for production
- **Device Auth**: Unique device ID + token
- **Secure Boot**: Enable on ESP32
- **Firmware Signing**: Sign releases

---

## 📈 Performance

- **Boot Time**: ~200ms (normal), ~100ms (wake from sleep)
- **Current Draw**: 80mA (active), 10μA (deep sleep)
- **WiFi Range**: 50-100m (outdoor)
- **GPS Accuracy**: ±2.5m (with good signal)
- **Battery Life**: 1-2 weeks (sleep mode, 3000mAh)

---

## 🤝 Contributing

Follow the main project contribution guidelines.

---

## 📚 Resources

- [ESP32 Documentation](https://docs.espressif.com/projects/esp-idf/en/latest/esp32/)
- [Arduino Reference](https://www.arduino.cc/reference/en/)
- [TinyGPS++ Library](https://github.com/mikalhart/TinyGPSPlus)
- [PubSubClient (MQTT)](https://github.com/knolleary/pubsubclient)
- [ArduinoJson](https://arduinojson.org/)

---

## 📞 Support

For firmware support, email yashghodele.work@gmail.com or open an issue on GitHub.

---

**Part of the FuelShield project by Yash Ghodele**
