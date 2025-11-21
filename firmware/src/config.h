#ifndef CONFIG_H
#define CONFIG_H

// Device Configuration
#define DEVICE_ID "ESP32_001"  // Unique device identifier
#define FIRMWARE_VERSION "1.0.0"

// GSM Configuration
#define GSM_APN "internet"  // Your GSM APN
#define GSM_USER ""
#define GSM_PASS ""

// MQTT Broker Configuration
#define MQTT_BROKER "your-mqtt-broker.com"
#define MQTT_PORT 1883
#define MQTT_USER "fuelguard"
#define MQTT_PASS "your_mqtt_password"

// Pin Definitions
#define PIN_ULTRASONIC_TRIG 25
#define PIN_ULTRASONIC_ECHO 26
#define PIN_FLOAT_SENSOR 34  // Analog pin
#define PIN_REED_SWITCH 27   // Tamper detection
#define PIN_RELAY 32         // Fuel shutoff relay

// SIM800L Pins
#define SIM800_TX 17
#define SIM800_RX 16
#define SIM800_PWR 4

// GPS Pins (NEO-6M)
#define GPS_TX 22
#define GPS_RX 21

// Sensor Configuration
#define TANK_HEIGHT_CM 100.0  // Tank height in cm
#define TANK_CAPACITY_L 200.0 // Tank capacity in liters
#define READING_INTERVAL_MS 30000  // 30 seconds

// Alert Thresholds
#define FUEL_THEFT_THRESHOLD 10.0  // 10% drop triggers alert
#define LOW_BATTERY_THRESHOLD 3.3  // Volts

// Emergency SMS
#define EMERGENCY_PHONE "+1234567890"  // Phone number for SMS alerts

#endif
