#include <Arduino.h>
#include <TinyGsmClient.h>
#include <PubSubClient.h>
#include <TinyGPS++.h>
#include <ArduinoJson.h>
#include "config.h"

// Serial connections
#define SerialMon Serial
#define SerialGSM Serial2
#define SerialGPS Serial1

// GSM and MQTT clients
TinyGsm modem(SerialGSM);
TinyGsmClient gsmClient(modem);
PubSubClient mqtt(gsmClient);

// GPS
TinyGPSPlus gps;

// Variables
float currentFuelLevel = 0;
float previousFuelLevel = 0;
bool tamperDetected = false;
unsigned long lastReading = 0;

// Function declarations
void setupGSM();
void setupMQTT();
void readSensors();
float readUltrasonicSensor();
float readFloatSensor();
void publishData();
void checkForCommands();
void sendEmergencySMS(String message);

void setup() {
  SerialMon.begin(115200);
  delay(1000);
  
  SerialMon.println("Fuelguard ESP32 Starting...");
  
  // Initialize pins
  pinMode(PIN_ULTRASONIC_TRIG, OUTPUT);
  pinMode(PIN_ULTRASONIC_ECHO, INPUT);
  pinMode(PIN_FLOAT_SENSOR, INPUT);
  pinMode(PIN_REED_SWITCH, INPUT_PULLUP);
  pinMode(PIN_RELAY, OUTPUT);
  digitalWrite(PIN_RELAY, LOW);
  
  // Initialize GSM
  SerialGSM.begin(9600, SERIAL_8N1, SIM800_RX, SIM800_TX);
  SerialGPS.begin(9600, SERIAL_8N1, GPS_RX, GPS_TX);
  
  setupGSM();
  setupMQTT();
  
  SerialMon.println("Setup complete!");
}

void loop() {
  // Keep MQTT connection alive
  if (!mqtt.connected()) {
    SerialMon.println("MQTT disconnected, reconnecting...");
    setupMQTT();
  }
  mqtt.loop();
  
  // Read GPS data
  while (SerialGPS.available() > 0) {
    gps.encode(SerialGPS.read());
  }
  
  // Read sensors and publish data every interval
  if (millis() - lastReading >= READING_INTERVAL_MS) {
    readSensors();
    publishData();
    lastReading = millis();
  }
  
  // Check for tamper detection
  if (digitalRead(PIN_REED_SWITCH) == HIGH && !tamperDetected) {
    tamperDetected = true;
    SerialMon.println("TAMPER DETECTED!");
    sendEmergencySMS("ALERT: Fuel tank tamper detected!");
  } else if (digitalRead(PIN_REED_SWITCH) == LOW) {
    tamperDetected = false;
  }
  
  delay(100);
}

void setupGSM() {
  SerialMon.println("Initializing GSM...");
  
  // Power on SIM800L
  pinMode(SIM800_PWR, OUTPUT);
  digitalWrite(SIM800_PWR, HIGH);
  delay(3000);
  
  modem.restart();
  
  String modemInfo = modem.getModemInfo();
  SerialMon.print("Modem: ");
  SerialMon.println(modemInfo);
  
  SerialMon.print("Waiting for network...");
  if (!modem.waitForNetwork()) {
    SerialMon.println(" fail");
    delay(10000);
    return;
  }
  SerialMon.println(" OK");
  
  SerialMon.print("Connecting to GPRS...");
  if (!modem.gprsConnect(GSM_APN, GSM_USER, GSM_PASS)) {
    SerialMon.println(" fail");
    delay(10000);
    return;
  }
  SerialMon.println(" OK");
}

void setupMQTT() {
  mqtt.setServer(MQTT_BROKER, MQTT_PORT);
  mqtt.setCallback([](char* topic, byte* payload, unsigned int length) {
    SerialMon.print("Message on topic: ");
    SerialMon.println(topic);
    
    // Parse command
    StaticJsonDocument<256> doc;
    deserializeJson(doc, payload, length);
    
    String command = doc["command"];
    if (command == "relay_on") {
      digitalWrite(PIN_RELAY, HIGH);
      SerialMon.println("Relay ON");
    } else if (command == "relay_off") {
      digitalWrite(PIN_RELAY, LOW);
      SerialMon.println("Relay OFF");
    }
  });
  
  SerialMon.print("Connecting to MQTT...");
  String clientId = String(DEVICE_ID) + "-" + String(random(0xffff), HEX);
  
  if (mqtt.connect(clientId.c_str(), MQTT_USER, MQTT_PASS)) {
    SerialMon.println(" OK");
    
    // Subscribe to commands
    String commandTopic = "fuelguard/devices/" + String(DEVICE_ID) + "/commands";
    mqtt.subscribe(commandTopic.c_str());
    SerialMon.println("Subscribed to: " + commandTopic);
  } else {
    SerialMon.print(" fail, rc=");
    SerialMon.println(mqtt.state());
  }
}

void readSensors() {
  previousFuelLevel = currentFuelLevel;
  
  // Read ultrasonic sensor (primary)
  float ultrasonicDistance = readUltrasonicSensor();
  
  // Convert distance to fuel level
  float fuelHeight = TANK_HEIGHT_CM - ultrasonicDistance;
  currentFuelLevel = (fuelHeight / TANK_HEIGHT_CM) * TANK_CAPACITY_L;
  
  // Validate with float sensor
  float floatValue = readFloatSensor();
  
  SerialMon.print("Fuel Level: ");
  SerialMon.print(currentFuelLevel);
  SerialMon.print("L (");
  SerialMon.print((currentFuelLevel / TANK_CAPACITY_L) * 100);
  SerialMon.println("%)");
}

float readUltrasonicSensor() {
  digitalWrite(PIN_ULTRASONIC_TRIG, LOW);
  delayMicroseconds(2);
  digitalWrite(PIN_ULTRASONIC_TRIG, HIGH);
  delayMicroseconds(10);
  digitalWrite(PIN_ULTRASONIC_TRIG, LOW);
  
  long duration = pulseIn(PIN_ULTRASONIC_ECHO, HIGH, 30000);
  float distance = duration * 0.034 / 2;  // cm
  
  return distance;
}

float readFloatSensor() {
  int analogValue = analogRead(PIN_FLOAT_SENSOR);
  return analogValue;
}

void publishData() {
  StaticJsonDocument<512> doc;
  
  doc["deviceId"] = DEVICE_ID;
  doc["timestamp"] = millis();
  
  JsonObject data = doc.createNestedObject("data");
  
  // Fuel data
  JsonObject fuel = data.createNestedObject("fuel");
  fuel["ultrasonic"] = TANK_HEIGHT_CM - (currentFuelLevel / TANK_CAPACITY_L * TANK_HEIGHT_CM);
  fuel["float"] = readFloatSensor();
  fuel["liters"] = currentFuelLevel;
  fuel["percentage"] = (currentFuelLevel / TANK_CAPACITY_L) * 100;
  
  // GPS data
  if (gps.location.isValid()) {
    JsonObject gpsData = data.createNestedObject("gps");
    gpsData["lat"] = gps.location.lat();
    gpsData["lon"] = gps.location.lng();
    gpsData["speed"] = gps.speed.kmph();
    gpsData["satellites"] = gps.satellites.value();
    gpsData["fix"] = true;
  } else {
    data["gps"] = nullptr;
  }
  
  // Other sensors
  data["tamper"] = digitalRead(PIN_REED_SWITCH) == HIGH;
  data["battery"] = analogRead(35) * (3.3 / 4095.0) * 2;  // Voltage divider
  data["signal"] = modem.getSignalQuality();
  
  String payload;
  serializeJson(doc, payload);
  
  String topic = "fuelguard/devices/" + String(DEVICE_ID) + "/data";
  
  if (mqtt.publish(topic.c_str(), payload.c_str())) {
    SerialMon.println("Data published successfully");
  } else {
    SerialMon.println("Failed to publish data");
  }
}

void sendEmergencySMS(String message) {
  modem.sendSMS(EMERGENCY_PHONE, message);
  SerialMon.println("Emergency SMS sent");
}
