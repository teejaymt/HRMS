# Biometric Device Configuration Guide - Step by Step

## Complete Guide to Setting Up Fingerprint, Face Recognition & RFID Attendance Devices

This comprehensive guide walks you through registering, configuring, and managing biometric attendance devices including ZKTeco, Anviz, and other vendors.

---

## 📋 Table of Contents

1. [Understanding Biometric Integration](#understanding-biometric-integration)
2. [Supported Device Types](#supported-device-types)
3. [Pre-Configuration Checklist](#pre-configuration-checklist)
4. [ZKTeco Device Setup](#zkteco-device-setup)
5. [Anviz Device Setup](#anviz-device-setup)
6. [Generic REST API Devices](#generic-rest-api-devices)
7. [Employee Enrollment](#employee-enrollment)
8. [Testing & Verification](#testing-verification)
9. [Troubleshooting](#troubleshooting)

---

## Understanding Biometric Integration

### How It Works

```
┌─────────────────────────────────────────────────────────┐
│              Biometric Attendance Flow                  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Step 1: Employee Punches In                           │
│  ┌──────────┐                                          │
│  │👆 Finger  │  →  Device scans fingerprint            │
│  │   Scan   │      Stores log locally                  │
│  └──────────┘                                          │
│       ↓                                                 │
│                                                         │
│  Step 2: HRMS Polls Device (Every 15 minutes)          │
│  ┌──────────┐                                          │
│  │  HRMS    │  →  Fetches new attendance logs          │
│  │  Server  │  ←  Receives punch records               │
│  └──────────┘                                          │
│       ↓                                                 │
│                                                         │
│  Step 3: Create Attendance Record                      │
│  ┌──────────┐                                          │
│  │ Database │  ←  Stores: Employee, Time, Type         │
│  └──────────┘      Creates work hours record           │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Benefits

✅ **Accuracy**: Eliminates buddy punching  
✅ **Automation**: No manual attendance entry  
✅ **Real-time**: Instant visibility of who's in/out  
✅ **Audit Trail**: Complete timestamp history  
✅ **Integration**: Direct link to payroll  

---

## Supported Device Types

### 1. Fingerprint Scanners
- **Technology**: Optical or capacitive fingerprint sensors
- **Brands**: ZKTeco, Anviz, eSSL, Suprema
- **Accuracy**: 99.9%
- **Speed**: < 1 second per scan

### 2. Face Recognition
- **Technology**: Camera + AI facial recognition
- **Brands**: ZKTeco, Hikvision, Dahua
- **Accuracy**: 98.5%
- **Speed**: < 2 seconds
- **Advantage**: Contactless, works with masks

### 3. RFID Card Readers
- **Technology**: Proximity cards (13.56 MHz)
- **Brands**: HID, Mifare, ZKTeco
- **Accuracy**: 100%
- **Speed**: Instant
- **Advantage**: Cheap, simple

### 4. Palm Vein Scanners
- **Technology**: Infrared palm vein pattern
- **Brands**: Fujitsu, Hitachi
- **Accuracy**: 99.999%
- **Advantage**: Most secure, works with gloves

### 5. Iris Scanners
- **Technology**: Iris pattern recognition
- **Brands**: IrisGuard, Eyelock
- **Accuracy**: 99.9999%
- **Advantage**: Highest security

---

## Pre-Configuration Checklist

### Before You Start

#### ✅ Information to Gather

1. **Device Information:**
   - [ ] Device brand and model
   - [ ] Serial number
   - [ ] Firmware version
   - [ ] User manual PDF

2. **Network Information:**
   - [ ] Device IP address (static preferred)
   - [ ] Subnet mask
   - [ ] Gateway
   - [ ] DNS server
   - [ ] Port number (default: 4370 for ZKTeco)

3. **Access Credentials:**
   - [ ] Admin username
   - [ ] Admin password
   - [ ] Communication key (if applicable)

4. **Installation Details:**
   - [ ] Physical location (Main Gate, Side Entrance, etc.)
   - [ ] Power source (PoE, DC adapter)
   - [ ] Network connection (Ethernet, WiFi)

---

## ZKTeco Device Setup

### Most Popular Models
- **F18**: Fingerprint + RFID
- **K40**: Fingerprint + Password
- **SpeedFace-V5L**: Face Recognition + Temperature
- **MB560**: Multi-biometric (Fingerprint + Face + RFID)

---

### Step 1: Physical Installation

**Equipment Needed:**
- ZKTeco device
- Network cable (Cat5e or better)
- Power adapter (12V DC) or PoE switch
- Mounting screws
- Drill

**Installation Steps:**

1. **Choose Location:**
   - Height: 120-150cm from floor
   - Lighting: Adequate but not direct sunlight
   - Weather: Sheltered if outdoor model

2. **Mount Device:**
   ```
   ┌─────────────────────┐
   │                     │
   │   ZKTeco Device     │  ← 140cm from floor
   │   [◉ Sensor]        │
   │   [  Display  ]     │
   └─────────────────────┘
         ║ (Cables)
         ║
   ─────╨──────────────── Floor
   ```

3. **Connect Cables:**
   - Ethernet: Connect to network switch
   - Power: Connect 12V adapter or use PoE

4. **Power On:**
   - Device boots in 30-60 seconds
   - Display shows: "Welcome" or logo

---

### Step 2: Configure Device Network Settings

**Access Device:**
1. Connect PC to same network
2. Use ZKAccess software or web browser
3. Default IP: `192.168.1.201`
4. Default credentials: `admin / admin`

**Web Interface Configuration:**

**Screen: Device Configuration**
```
┌─────────────────────────────────────────────────────────┐
│ ZKTeco Device Configuration                             │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Network Settings:                                     │
│  ┌─────────────────────────────────────────────────┐   │
│  │ IP Address:     [192.168.1.100    ] (Static)   │   │
│  │ Subnet Mask:    [255.255.255.0    ]            │   │
│  │ Gateway:        [192.168.1.1      ]            │   │
│  │ DNS Server:     [8.8.8.8          ]            │   │
│  │ Port:           [4370             ]            │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  [Save] [Test Connection] [Cancel]                     │
└─────────────────────────────────────────────────────────┘
```

**Configuration Values:**
```
IP Address:    192.168.1.100 (Change to match your network)
Subnet:        255.255.255.0
Gateway:       192.168.1.1   (Your router IP)
DNS:           8.8.8.8       (Google DNS)
Port:          4370          (Default ZKTeco port)
```

**Save Settings:**
- Click "Save"
- Device will restart
- Reconnect using new IP: `http://192.168.1.100`

---

### Step 3: Register Device in HRMS

**Access HRMS:**
1. Login: `http://localhost:3001`
2. Navigate to: **Biometric Devices** (Advanced Modules)

**Screen: Biometric Devices Page**
```
┌─────────────────────────────────────────────────────────┐
│ Biometric Devices Management                            │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ Active Devices (0)                                     │
│ ┌─────────────────────────────────────────────────┐   │
│ │ No devices registered                            │   │
│ │                                                  │   │
│ │ [+ Register New Device]                         │   │
│ └─────────────────────────────────────────────────┘   │
│                                                         │
│ Recent Sync Logs                                       │
│ ┌─────────────────────────────────────────────────┐   │
│ │ No sync logs available                          │   │
│ └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

**Use API to Register:**

```http
POST http://localhost:3000/biometric/devices
Content-Type: application/json
Authorization: Bearer YOUR_JWT_TOKEN
```

**Request Body (ZKTeco):**
```json
{
  "deviceName": "Main Gate - Fingerprint Scanner",
  "deviceType": "FINGERPRINT",
  "vendor": "ZKTeco",
  "model": "F18",
  "serialNumber": "ZK123456789",
  "ipAddress": "192.168.1.100",
  "port": 4370,
  "location": "Main Building Entrance",
  "isActive": true,
  "communicationKey": "",
  "syncInterval": 15
}
```

**Expected Response:**
```json
{
  "id": 1,
  "deviceName": "Main Gate - Fingerprint Scanner",
  "deviceType": "FINGERPRINT",
  "ipAddress": "192.168.1.100",
  "port": 4370,
  "location": "Main Building Entrance",
  "isActive": true,
  "lastSync": null,
  "createdAt": "2026-01-09T16:00:00.000Z"
}
```

**Verify on Screen:**
```
┌─────────────────────────────────────────────────────────┐
│ Active Devices (1)                                      │
├─────────────────────────────────────────────────────────┤
│ ┌───────────────────────────────────────────────────┐  │
│ │ Main Gate - Fingerprint Scanner                   │  │
│ │ Type: FINGERPRINT  │  Status: ●Online             │  │
│ │ IP: 192.168.1.100  │  Last Sync: Never            │  │
│ │ Location: Main Building Entrance                  │  │
│ │                                                    │  │
│ │ [Sync Now] [Edit] [Disable]                       │  │
│ └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

---

### Step 4: Test Connection

**Manual Sync Test:**
```http
POST http://localhost:3000/biometric/devices/1/sync
```

**What Happens:**
```
1. HRMS connects to device at 192.168.1.100:4370
   ↓
2. Authenticates using SDK
   ↓
3. Fetches attendance logs
   ↓
4. Returns results
```

**Success Response:**
```json
{
  "status": "SUCCESS",
  "deviceId": 1,
  "logsRetrieved": 0,
  "message": "Connected successfully. No attendance logs found.",
  "connectionTime": "150ms"
}
```

**If connection fails:**
```json
{
  "status": "FAILED",
  "deviceId": 1,
  "error": "Connection timeout",
  "message": "Unable to connect to device at 192.168.1.100:4370"
}
```

**Troubleshooting:**
- Ping device: `ping 192.168.1.100`
- Check firewall: Open port 4370
- Verify device is powered on
- Check network cable

---

### Step 5: Enable Automatic Sync

**Update Device Settings:**
```http
PATCH http://localhost:3000/biometric/devices/1
```

**Request Body:**
```json
{
  "autoSync": true,
  "syncInterval": 15,
  "syncStartTime": "00:00",
  "syncEndTime": "23:59"
}
```

**Cron Schedule Created:**
```
Every 15 minutes (24/7):
  - Connect to device
  - Fetch new attendance logs
  - Convert to Attendance records
  - Update last sync timestamp
```

**Backend Log:**
```
[2026-01-09 16:15:00] Starting biometric sync...
[2026-01-09 16:15:01] Connected to device #1 (192.168.1.100)
[2026-01-09 16:15:02] Retrieved 0 attendance logs
[2026-01-09 16:15:02] Sync completed successfully
```

---

## Anviz Device Setup

### Popular Models
- **A300**: Face + Fingerprint
- **W1**: WiFi Fingerprint
- **OA1000**: Outdoor Access Control

### Step 1: Configure Anviz Device

**Access Web Interface:**
1. Connect to device WiFi: `ANVIZ-xxxx`
2. Open browser: `http://192.168.1.1`
3. Login: `admin / 12345`

**Network Settings:**
```
IP Address:    192.168.1.101
Subnet:        255.255.255.0
Gateway:       192.168.1.1
Port:          5010 (Anviz default)
```

### Step 2: Register in HRMS

```http
POST http://localhost:3000/biometric/devices
```

**Request Body (Anviz):**
```json
{
  "deviceName": "Side Gate - Face Recognition",
  "deviceType": "FACE",
  "vendor": "Anviz",
  "model": "A300",
  "serialNumber": "AN987654321",
  "ipAddress": "192.168.1.101",
  "port": 5010,
  "location": "Side Entrance",
  "isActive": true,
  "apiEndpoint": "http://192.168.1.101:5010/api",
  "communicationKey": "AnvizKey123"
}
```

---

## Generic REST API Devices

### For Devices with HTTP APIs

### Step 1: Get API Documentation

**Required Information:**
- API Base URL: `http://device-ip/api/v1`
- Authentication: API Key, OAuth, or Basic Auth
- Endpoints:
  - Get logs: `/attendance/logs`
  - Get users: `/users`

### Step 2: Configure in HRMS

```http
POST http://localhost:3000/biometric/devices
```

**Request Body (REST API):**
```json
{
  "deviceName": "Parking - RFID Reader",
  "deviceType": "RFID",
  "vendor": "Generic",
  "model": "REST-API",
  "ipAddress": "192.168.1.102",
  "port": 80,
  "location": "Parking Entrance",
  "isActive": true,
  "apiEndpoint": "http://192.168.1.102/api/v1",
  "apiKey": "your-api-key-here",
  "authMethod": "API_KEY",
  "logsEndpoint": "/attendance/logs",
  "usersEndpoint": "/users"
}
```

---

## Employee Enrollment

### Process Overview

```
Step 1: Export Employees from HRMS
   ↓
Step 2: Upload to Device
   ↓
Step 3: Enroll Biometric Data
   ↓
Step 4: Verify Recognition
```

---

### Method 1: Enroll on Device Directly

**ZKTeco Device Menu:**
```
┌─────────────────────────────────────┐
│ ZKTeco F18                          │
├─────────────────────────────────────┤
│                                     │
│ 1. User Management                  │
│    > New User                       │
│    > Delete User                    │
│    > Edit User                      │
│                                     │
│ 2. Attendance Report                │
│ 3. System Options                   │
│ 4. Communication                    │
│                                     │
└─────────────────────────────────────┘
```

**Enrollment Steps:**

1. **Select Menu:**
   - Press OK button
   - Navigate to: User Management → New User

2. **Enter User ID:**
   ```
   Enter User ID: [EMP001_____]
   
   (Must match employeeCode in HRMS)
   ```

3. **Scan Fingerprint:**
   ```
   Place Finger on Sensor
   
   [████████████████] Scanning...
   
   Press same finger 3 times
   ```

4. **Confirmation:**
   ```
   User EMP001 Enrolled ✓
   
   Fingerprint Template Saved
   ```

**Repeat for all employees (150 employees = ~2 hours)**

---

### Method 2: Bulk Upload via Software

**Use ZKAccess Software:**

1. **Export Employees from HRMS:**
   ```http
   GET http://localhost:3000/employees?format=zkbio
   ```

2. **Import to ZKAccess:**
   - Open ZKAccess software
   - File → Import → Employees
   - Select exported CSV file
   - Map fields:
     ```
     employeeCode → User ID
     firstName → Name
     departmentId → Department
     ```

3. **Upload to Device:**
   - Select device from list
   - Click "Upload Users"
   - Wait for completion

4. **Enroll Fingerprints:**
   - Employees visit device one by one
   - Device prompts: "Place finger for EMP001"
   - Scan 3 times
   - Next employee

---

## Testing & Verification

### Test 1: Single Punch Test

**Scenario:** Employee punches in

**Steps:**
1. Employee approaches device
2. Places finger on sensor
3. Device beeps and shows:
   ```
   ┌─────────────────────────────┐
   │                             │
   │    Ahmed Al-Saud            │
   │    EMP001                   │
   │                             │
   │    Check In                 │
   │    14:25:30                 │
   │                             │
   │    ✓ Recorded               │
   │                             │
   └─────────────────────────────┘
   ```

4. Wait for next sync (up to 15 minutes)

5. Check HRMS:
   ```http
   GET http://localhost:3000/biometric/logs?employeeCode=EMP001
   ```

**Expected Result:**
```json
{
  "logs": [
    {
      "id": 1,
      "deviceId": 1,
      "employeeCode": "EMP001",
      "timestamp": "2026-01-09T14:25:30Z",
      "logType": "CHECK_IN",
      "verifyMode": "FINGERPRINT",
      "isProcessed": true,
      "attendanceId": 45
    }
  ]
}
```

6. Check Attendance Record:
   ```http
   GET http://localhost:3000/attendance?employeeId=1&date=2026-01-09
   ```

**Expected Result:**
```json
{
  "id": 45,
  "employeeId": 1,
  "date": "2026-01-09",
  "checkIn": "2026-01-09T14:25:30Z",
  "checkOut": null,
  "status": "PRESENT",
  "deviceId": 1
}
```

✅ **Test Passed!**

---

### Test 2: Check-In & Check-Out

**Morning:**
```
08:00 - Employee punches IN
        ↓
        Device logs: CHECK_IN
        ↓
        HRMS creates Attendance record
```

**Evening:**
```
17:00 - Employee punches OUT
        ↓
        Device logs: CHECK_OUT
        ↓
        HRMS updates same Attendance record
        ↓
        Calculates hours: 9 hours worked
```

**Final Record:**
```json
{
  "id": 45,
  "checkIn": "2026-01-09T08:00:15Z",
  "checkOut": "2026-01-09T17:00:42Z",
  "hoursWorked": 9.0,
  "status": "PRESENT"
}
```

---

### Test 3: Multiple Devices

**Scenario:** Employee checks in at Main Gate, checks out at Side Gate

**Flow:**
```
08:00 @ Main Gate (Device #1)
  Employee: EMP001
  Action: CHECK_IN
  ↓
  
17:00 @ Side Gate (Device #2)
  Employee: EMP001
  Action: CHECK_OUT
  ↓
  
HRMS matches both punches to same Attendance record
```

**Expected Behavior:**
```json
{
  "id": 45,
  "checkIn": "08:00",
  "checkInDevice": "Main Gate",
  "checkOut": "17:00",
  "checkOutDevice": "Side Gate",
  "status": "PRESENT"
}
```

✅ **System correctly handles multi-device scenario**

---

## Troubleshooting

### Issue 1: Device Not Syncing

**Symptoms:**
- Last sync shows "Never" or old timestamp
- No new attendance logs appearing

**Diagnostics:**
```http
GET http://localhost:3000/biometric/devices/1
```

**Check:**
```json
{
  "isActive": true,     // Should be true
  "lastSync": null,      // Problem: Never synced
  "lastError": "Connection timeout"
}
```

**Solutions:**

1. **Test Network Connectivity:**
   ```bash
   ping 192.168.1.100
   
   # Should respond:
   Reply from 192.168.1.100: bytes=32 time=1ms TTL=64
   ```

2. **Check Device is Online:**
   - Look at device screen - should show menu
   - Check power cable
   - Check network cable (LED should blink)

3. **Verify Port is Open:**
   ```bash
   telnet 192.168.1.100 4370
   
   # Should connect successfully
   ```

4. **Check Firewall:**
   - Windows Firewall might block port 4370
   - Add inbound rule for port 4370

5. **Manual Sync:**
   ```http
   POST http://localhost:3000/biometric/devices/1/sync
   ```

6. **Check Backend Logs:**
   ```bash
   # In backend terminal, look for:
   [BiometricService] Attempting sync for device #1
   [BiometricService] Error: ETIMEDOUT
   ```

---

### Issue 2: Employee Not Recognized

**Symptoms:**
- Device shows "Not Authorized" or beeps error
- Fingerprint enrolled but not working

**Solutions:**

1. **Re-enroll Fingerprint:**
   - Device Menu → User Management → Edit User
   - Select employee
   - Delete fingerprint
   - Re-enroll (try different finger)

2. **Check Finger Quality:**
   - Dry hands: Breathe on finger or use hand cream
   - Dirty finger: Clean with tissue
   - Wet finger: Dry completely

3. **Verify Employee Code Matches:**
   ```http
   GET http://localhost:3000/employees?search=Ahmed
   
   # HRMS shows: employeeCode: "EMP001"
   # Device must have same ID: "EMP001"
   ```

4. **Check Device User List:**
   - Device Menu → User Management → User List
   - Verify employee appears in list
   - Check enrollment status (should show fingerprint icon)

---

### Issue 3: Duplicate Attendance Records

**Symptoms:**
- Employee appears checked-in multiple times
- Same punch recorded twice

**Cause:** Device sends same log again during sync

**Solution:**

**Backend checks for duplicates:**
```typescript
// System prevents this automatically
if (existingLog.timestamp === newLog.timestamp && 
    existingLog.employeeCode === newLog.employeeCode) {
  console.log('Duplicate log ignored');
  return;
}
```

**If duplicates still occur:**
```http
DELETE http://localhost:3000/attendance/45
```

---

### Issue 4: Attendance Not Auto-Creating

**Symptoms:**
- Biometric logs appear in system
- But no Attendance record created

**Check Logs:**
```http
GET http://localhost:3000/biometric/logs?isProcessed=false
```

**If logs show `isProcessed: false`:**

**Manually trigger processing:**
```http
POST http://localhost:3000/biometric/process-logs
```

**Backend should:**
```
1. Find unprocessed logs
2. Match employeeCode to Employee table
3. Create/update Attendance record
4. Mark log as processed
```

**If still failing, check:**
- Employee exists in system
- employeeCode matches exactly
- Date/time format is valid

---

## Summary

**You've learned:**
- ✅ How to set up ZKTeco, Anviz, and REST API devices
- ✅ How to configure network settings
- ✅ How to enroll employees
- ✅ How to test and verify attendance
- ✅ How to troubleshoot common issues

**Deployment Checklist:**
- [ ] Devices physically installed
- [ ] Network configured (static IPs)
- [ ] Devices registered in HRMS
- [ ] Test connection successful
- [ ] Auto-sync enabled
- [ ] All employees enrolled
- [ ] Test punches verified
- [ ] Monitor for 1 week

**Next:** Review all configuration guides and go live!

---

**Document Version**: 1.0  
**Last Updated**: January 2026  
**Author**: HRMS Biometric Team
