# ERP & Legacy System Integration Guide - Step by Step

## Complete Guide to Integrating SAP, Oracle, Odoo, and Other ERP Systems

This comprehensive guide walks you through integrating your HRMS with external ERP and legacy systems for bidirectional data synchronization.

---

## 📋 Table of Contents

1. [Understanding ERP Integration](#understanding-erp-integration)
2. [Pre-Integration Checklist](#pre-integration-checklist)
3. [SAP Integration Setup](#sap-integration-setup)
4. [Oracle ERP Integration](#oracle-erp-integration)
5. [Odoo Integration](#odoo-integration)
6. [Legacy System Integration](#legacy-system-integration)
7. [Field Mapping Configuration](#field-mapping-configuration)
8. [Testing the Integration](#testing-the-integration)
9. [Monitoring & Troubleshooting](#monitoring-troubleshooting)

---

## Understanding ERP Integration

### What Gets Synchronized?

```
┌─────────────────────────────────────────────────────────┐
│                 HRMS ↔ ERP Sync                        │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Employee Master Data:                                 │
│  • Employee Code, Name, Department                     │
│  • Position, Grade, Join Date                          │
│  • Salary Details, Bank Account                        │
│                                                         │
│  Payroll Transactions:                                 │
│  • Monthly Payroll Records                             │
│  • Salary Components (Basic, HRA, etc.)                │
│  • Deductions (Tax, GOSI, Advance)                     │
│                                                         │
│  Organizational Structure:                             │
│  • Departments, Cost Centers                           │
│  • Budget Allocations                                  │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Sync Directions

**Option 1: HRMS → ERP (One-way)**
- HRMS is source of truth
- Employee data pushed to ERP
- Use case: New ERP system, HRMS established

**Option 2: ERP → HRMS (One-way)**
- ERP is source of truth
- Employee data pulled from ERP
- Use case: Established ERP, new HRMS

**Option 3: Bidirectional (Recommended)**
- Employee master: HRMS → ERP
- Payroll transactions: HRMS → ERP
- Cost centers: ERP → HRMS
- Use case: Both systems coexist

---

## Pre-Integration Checklist

### Before You Start

#### ✅ Information to Gather

1. **ERP System Details:**
   - [ ] ERP System Name (SAP, Oracle, Odoo, etc.)
   - [ ] Version Number
   - [ ] API Endpoint URL
   - [ ] Authentication Method (API Key, OAuth, Basic Auth)
   - [ ] API Documentation URL

2. **Access Credentials:**
   - [ ] Username/API Key
   - [ ] Password/Secret Key
   - [ ] Client ID (if OAuth)
   - [ ] Authorization URL

3. **Network Information:**
   - [ ] Is ERP on-premise or cloud?
   - [ ] IP Address/Domain
   - [ ] Port Number
   - [ ] Firewall Rules (if needed)

4. **Data Mapping:**
   - [ ] List of fields to sync
   - [ ] Field names in ERP
   - [ ] Field names in HRMS
   - [ ] Data type conversions needed

---

## SAP Integration Setup

### Step 1: Access ERP Integration Page

**Screen Description:**
1. Login to HRMS: `http://localhost:3001`
2. Click: **ERP Integration** (in Advanced Modules - sidebar)
3. You'll see: "ERP Integration Management" page

**What You See:**
```
┌─────────────────────────────────────────────────────────┐
│ ERP Integration Management                              │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ Active Integrations (0)                                │
│ ┌─────────────────────────────────────────────────┐   │
│ │ No ERP integrations configured                   │   │
│ │                                                  │   │
│ │ [+ Add New Integration]                         │   │
│ └─────────────────────────────────────────────────┘   │
│                                                         │
│ Recent Sync Logs                                       │
│ ┌─────────────────────────────────────────────────┐   │
│ │ No sync logs available                          │   │
│ └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### Step 2: Configure SAP Connection

**Use Postman or API Client:**

```http
POST http://localhost:3000/erp/integrations
Content-Type: application/json
Authorization: Bearer YOUR_JWT_TOKEN
```

**Request Body (SAP):**
```json
{
  "erpSystem": "SAP",
  "erpVersion": "S/4HANA 2021",
  "isActive": true,
  "apiEndpoint": "https://sap.company.com:8000/sap/bc/rest",
  "username": "HRMS_INTEGRATION",
  "password": "YourSecurePassword123",
  "syncFrequency": "DAILY",
  "syncDirection": "BIDIRECTIONAL",
  "syncTime": "02:00",
  "employeeFieldMap": {
    "HRMS_TO_ERP": {
      "employeeCode": "PERNR",
      "firstName": "VORNA",
      "lastName": "NACHN",
      "email": "USRID",
      "departmentId": "ORGEH",
      "position": "PLANS",
      "basicSalary": "BETRG",
      "joinDate": "BEGDA",
      "bankAccount": "BANKN",
      "taxId": "TAXID"
    },
    "ERP_TO_HRMS": {
      "KOSTL": "costCenter",
      "BUKRS": "companyCode"
    }
  },
  "payrollFieldMap": {
    "HRMS_TO_ERP": {
      "month": "MONAT",
      "year": "GJAHR",
      "basicSalary": "LGART_1000",
      "housingAllowance": "LGART_2000",
      "transportAllowance": "LGART_3000",
      "gosiEmployee": "LGART_8001",
      "gosiEmployer": "LGART_8002",
      "incomeTax": "LGART_9001",
      "netSalary": "BETRG"
    }
  }
}
```

**SAP Field Mappings Explained:**
```
HRMS Field         SAP Field    Description
─────────────────────────────────────────────
employeeCode    →  PERNR       Personnel Number
firstName       →  VORNA       First Name
lastName        →  NACHN       Last Name
departmentId    →  ORGEH       Organizational Unit
position        →  PLANS       Position
basicSalary     →  BETRG       Amount
joinDate        →  BEGDA       Begin Date
```

**Expected Response:**
```json
{
  "id": 1,
  "erpSystem": "SAP",
  "isActive": true,
  "apiEndpoint": "https://sap.company.com:8000/sap/bc/rest",
  "syncFrequency": "DAILY",
  "lastSync": null,
  "createdAt": "2026-01-09T16:00:00.000Z"
}
```

---

### Step 3: Test SAP Connection

**API Request:**
```http
POST http://localhost:3000/erp/integrations/1/test-connection
```

**Expected Response:**
```json
{
  "status": "SUCCESS",
  "message": "Successfully connected to SAP",
  "details": {
    "system": "SAP S/4HANA",
    "version": "2021",
    "responseTime": "245ms"
  }
}
```

**If Connection Fails:**
```json
{
  "status": "FAILED",
  "message": "Connection refused",
  "error": "Unable to reach SAP endpoint at https://sap.company.com:8000"
}
```

**Troubleshooting:**
- Check if SAP server is reachable: `ping sap.company.com`
- Verify port is open: `telnet sap.company.com 8000`
- Check firewall rules
- Verify credentials in SAP (transaction SU01)

---

### Step 4: Perform Initial Employee Sync

**Manual Sync Trigger:**
```http
POST http://localhost:3000/erp/sync/employees/1
```

**What Happens:**
```
Step 1: Fetch Employees from HRMS
  ↓
  SELECT * FROM Employee WHERE isActive = true
  Found: 150 employees
  
Step 2: Transform to SAP Format
  ↓
  Map HRMS fields → SAP fields using fieldMap
  Example: employeeCode → PERNR
  
Step 3: Send to SAP via API
  ↓
  POST https://sap.company.com/api/employees
  Batch size: 50 records per request
  
Step 4: Log Results
  ↓
  Success: 148 employees
  Failed: 2 employees (validation errors)
```

**Response:**
```json
{
  "syncId": 1,
  "syncType": "EMPLOYEE",
  "direction": "TO_ERP",
  "status": "PARTIAL",
  "recordsProcessed": 150,
  "recordsSuccess": 148,
  "recordsFailed": 2,
  "syncStarted": "2026-01-09T14:00:00Z",
  "syncCompleted": "2026-01-09T14:05:30Z",
  "duration": "5m 30s",
  "errors": [
    {
      "employeeCode": "EMP001",
      "error": "Invalid department code: DEPT999"
    },
    {
      "employeeCode": "EMP055",
      "error": "Missing required field: KOSTL"
    }
  ]
}
```

---

### Step 5: Schedule Automatic Sync

**Update Integration Settings:**
```http
PATCH http://localhost:3000/erp/integrations/1
Content-Type: application/json
```

**Request Body:**
```json
{
  "syncFrequency": "DAILY",
  "syncTime": "02:00",
  "autoSync": true,
  "notifyOnError": true,
  "notificationEmail": "admin@company.com"
}
```

**Cron Schedule Created:**
```
Daily at 2:00 AM:
  1. Sync employees (HRMS → SAP)
  2. Sync payroll (HRMS → SAP)
  3. Sync cost centers (SAP → HRMS)
  4. Send summary email
```

---

## Oracle ERP Integration

### Step 1: Configure Oracle Connection

```http
POST http://localhost:3000/erp/integrations
```

**Request Body (Oracle):**
```json
{
  "erpSystem": "ORACLE",
  "erpVersion": "Oracle Fusion Cloud HCM",
  "isActive": true,
  "apiEndpoint": "https://oracle-cloud.company.com/hcmRestApi/resources/11.13.18.05",
  "username": "hrms.integration",
  "password": "SecurePassword456",
  "syncFrequency": "DAILY",
  "syncDirection": "BIDIRECTIONAL",
  "employeeFieldMap": {
    "HRMS_TO_ERP": {
      "employeeCode": "PersonNumber",
      "firstName": "FirstName",
      "lastName": "LastName",
      "email": "EmailAddress",
      "departmentId": "DepartmentId",
      "position": "JobId",
      "basicSalary": "BaseSalary",
      "joinDate": "HireDate"
    },
    "ERP_TO_HRMS": {
      "OrganizationId": "organizationId",
      "LocationId": "locationId"
    }
  },
  "payrollFieldMap": {
    "HRMS_TO_ERP": {
      "month": "PayrollPeriod",
      "basicSalary": "ElementName_Basic",
      "housingAllowance": "ElementName_Housing",
      "netSalary": "NetPay"
    }
  }
}
```

**Oracle API Endpoints:**
```
Employee Sync:
POST /hcmRestApi/resources/11.13.18.05/workers

Payroll Sync:
POST /hcmRestApi/resources/11.13.18.05/payrollResults

Department Sync:
GET /hcmRestApi/resources/11.13.18.05/departments
```

---

## Odoo Integration

### Step 1: Configure Odoo Connection

```http
POST http://localhost:3000/erp/integrations
```

**Request Body (Odoo):**
```json
{
  "erpSystem": "ODOO",
  "erpVersion": "Odoo 16 Enterprise",
  "isActive": true,
  "apiEndpoint": "https://odoo.company.com/xmlrpc/2",
  "database": "company_db",
  "username": "admin",
  "password": "OdooPassword789",
  "syncFrequency": "DAILY",
  "syncDirection": "BIDIRECTIONAL",
  "employeeFieldMap": {
    "HRMS_TO_ERP": {
      "employeeCode": "identification_id",
      "firstName": "name",
      "email": "work_email",
      "departmentId": "department_id",
      "position": "job_id",
      "basicSalary": "wage",
      "joinDate": "first_contract_date"
    }
  },
  "payrollFieldMap": {
    "HRMS_TO_ERP": {
      "basicSalary": "basic_wage",
      "housingAllowance": "housing_allowance",
      "netSalary": "net_wage"
    }
  }
}
```

**Odoo XML-RPC Authentication:**
```python
# Example Odoo connection (backend handles this)
import xmlrpc.client

url = "https://odoo.company.com"
db = "company_db"
username = "admin"
password = "OdooPassword789"

common = xmlrpc.client.ServerProxy(f'{url}/xmlrpc/2/common')
uid = common.authenticate(db, username, password, {})

models = xmlrpc.client.ServerProxy(f'{url}/xmlrpc/2/object')

# Create employee
employee_id = models.execute_kw(db, uid, password,
    'hr.employee', 'create',
    [{
        'name': 'John Doe',
        'work_email': 'john@company.com'
    }]
)
```

---

## Legacy System Integration

### Scenario: Custom SQL Database

For custom legacy systems with SQL databases:

### Step 1: Configure Database Connection

```http
POST http://localhost:3000/erp/integrations
```

**Request Body (Legacy SQL):**
```json
{
  "erpSystem": "LEGACY_SQL",
  "erpVersion": "Custom HRMS v3.2",
  "isActive": true,
  "connectionType": "DATABASE",
  "dbType": "MSSQL",
  "dbHost": "legacy-db.company.local",
  "dbPort": 1433,
  "dbName": "LEGACY_HRMS",
  "dbUsername": "hrms_sync",
  "dbPassword": "LegacyPassword123",
  "syncFrequency": "HOURLY",
  "syncDirection": "FROM_ERP",
  "employeeQuery": "SELECT EmployeeID, FirstName, LastName, Department, Salary FROM tblEmployees WHERE Active = 1",
  "employeeFieldMap": {
    "ERP_TO_HRMS": {
      "EmployeeID": "employeeCode",
      "FirstName": "firstName",
      "LastName": "lastName",
      "Department": "departmentName",
      "Salary": "basicSalary"
    }
  }
}
```

### Step 2: Test Legacy Database Connection

```http
POST http://localhost:3000/erp/integrations/1/test-connection
```

**Backend executes:**
```sql
-- Test query
SELECT COUNT(*) FROM tblEmployees WHERE Active = 1;

-- Expected result: Connection successful, 150 employees found
```

### Step 3: Sync from Legacy System

```http
POST http://localhost:3000/erp/sync/employees/1
```

**Process:**
```
1. Connect to Legacy DB
   ↓
2. Execute SELECT query
   ↓
3. Map fields: EmployeeID → employeeCode
   ↓
4. Upsert into HRMS database
   ↓
5. Log results
```

---

## Field Mapping Configuration

### Understanding Field Maps

**Field Map Structure:**
```json
{
  "HRMS_TO_ERP": {
    "hrmsFieldName": "erpFieldName"
  },
  "ERP_TO_HRMS": {
    "erpFieldName": "hrmsFieldName"
  }
}
```

### Common Field Mappings

#### Employee Master Data

| HRMS Field | SAP | Oracle | Odoo |
|------------|-----|--------|------|
| employeeCode | PERNR | PersonNumber | identification_id |
| firstName | VORNA | FirstName | name |
| lastName | NACHN | LastName | (combined in name) |
| email | USRID | EmailAddress | work_email |
| departmentId | ORGEH | DepartmentId | department_id |
| position | PLANS | JobId | job_id |
| basicSalary | BETRG | BaseSalary | wage |
| joinDate | BEGDA | HireDate | first_contract_date |

#### Payroll Data

| HRMS Field | SAP Wage Type | Oracle Element | Odoo Field |
|------------|---------------|----------------|------------|
| Basic Salary | /001 or 1000 | Basic | basic_wage |
| Housing | /101 or 2000 | Housing | housing_allowance |
| Transport | /102 or 3000 | Transport | transport_allowance |
| GOSI Employee | /801 or 8001 | GOSI_EE | gosi_employee |
| GOSI Employer | /802 or 8002 | GOSI_ER | gosi_employer |
| Tax | /901 or 9001 | Tax | income_tax |
| Net Pay | /999 | NetPay | net_wage |

---

### Step-by-Step: Create Custom Field Map

**Example: Mapping a new field "Mobile Number"**

1. **Identify HRMS Field:**
   ```
   Field name in HRMS: phoneNumber
   Table: Employee
   Type: String
   ```

2. **Find ERP Equivalent:**
   ```
   SAP: TEL_NUMBER
   Oracle: PhoneNumber  
   Odoo: mobile_phone
   ```

3. **Update Field Map:**
   ```http
   PATCH http://localhost:3000/erp/integrations/1
   ```

   ```json
   {
     "employeeFieldMap": {
       "HRMS_TO_ERP": {
         "employeeCode": "PERNR",
         "firstName": "VORNA",
         "phoneNumber": "TEL_NUMBER"  // ← Added
       }
     }
   }
   ```

4. **Test Sync:**
   ```http
   POST http://localhost:3000/erp/sync/employees/1
   ```

5. **Verify in SAP:**
   ```
   Transaction: PA30
   Info type: 0105 (Communication)
   Check: TEL_NUMBER field populated
   ```

---

## Testing the Integration

### Test Plan

#### Test 1: Employee Creation Flow

**Scenario:** New employee hired in HRMS, should sync to ERP

**Steps:**
1. Create employee in HRMS:
   ```http
   POST http://localhost:3000/employees
   {
     "firstName": "Ahmed",
     "lastName": "Al-Saud",
     "employeeCode": "EMP999",
     "email": "ahmed@company.com",
     "departmentId": 1,
     "basicSalary": 15000
   }
   ```

2. Trigger manual sync:
   ```http
   POST http://localhost:3000/erp/sync/employees/1
   ```

3. Check ERP:
   - **SAP**: Transaction PA20, enter PERNR EMP999
   - **Oracle**: Navigate to Workforce Structures → Person Management
   - **Odoo**: Employees menu, search "Ahmed"

**Expected Result:**
```
✅ Employee created in HRMS
✅ Sync triggered successfully
✅ Employee appears in ERP with correct data
✅ All mapped fields populated
✅ Sync log shows SUCCESS
```

---

#### Test 2: Salary Update Flow

**Scenario:** Salary increased in HRMS, should update ERP

**Steps:**
1. Update employee salary:
   ```http
   PATCH http://localhost:3000/employees/999
   {
     "basicSalary": 17000
   }
   ```

2. Wait for scheduled sync (or trigger manually)

3. Verify in ERP:
   - Check salary field updated to 17000

**Expected Result:**
```
✅ Salary updated in HRMS
✅ Sync runs at scheduled time
✅ ERP salary field updated
✅ Sync log shows 1 record updated
```

---

#### Test 3: Bidirectional Sync

**Scenario:** Cost center changed in ERP, should update HRMS

**Steps:**
1. Change cost center in SAP:
   ```
   Transaction: KS02
   Cost Center: 1000 → 1100
   ```

2. Run reverse sync:
   ```http
   POST http://localhost:3000/erp/sync/from-erp/1
   ```

3. Check HRMS employee record:
   ```http
   GET http://localhost:3000/employees/999
   ```

**Expected Result:**
```json
{
  "id": 999,
  "employeeCode": "EMP999",
  "costCenter": "1100",  // ← Updated from ERP
  "lastSyncedAt": "2026-01-09T15:30:00Z"
}
```

---

## Monitoring & Troubleshooting

### View Sync Logs

**Access Logs Page:**
`http://localhost:3001/erp-integration/logs`

**Screen Display:**
```
┌─────────────────────────────────────────────────────────┐
│ ERP Sync Logs                                           │
├──────┬─────────┬───────────┬─────────┬─────────┬────────┤
│ Date │ Type    │ Direction │ Status  │ Records │ Time   │
├──────┼─────────┼───────────┼─────────┼─────────┼────────┤
│ 01/09│EMPLOYEE │ TO_ERP    │ SUCCESS │ 150/150 │ 5m 30s │
│ 01/09│PAYROLL  │ TO_ERP    │ SUCCESS │ 150/150 │ 2m 15s │
│ 01/08│EMPLOYEE │ TO_ERP    │ PARTIAL │ 148/150 │ 5m 45s │
│ 01/08│EMPLOYEE │ FROM_ERP  │ SUCCESS │  25/25  │ 1m 10s │
└──────┴─────────┴───────────┴─────────┴─────────┴────────┘

[View Details] [Download Logs] [Retry Failed]
```

**API to Get Logs:**
```http
GET http://localhost:3000/erp/logs?status=FAILED&limit=10
```

---

### Common Issues & Solutions

#### Issue 1: Authentication Failed

**Error:**
```json
{
  "error": "401 Unauthorized",
  "message": "Invalid credentials"
}
```

**Solutions:**
1. Verify username/password in ERP system
2. Check if API user has correct permissions
3. Regenerate API key if using token auth
4. Check password expiry in ERP

**Fix:**
```http
PATCH http://localhost:3000/erp/integrations/1
{
  "username": "new_username",
  "password": "new_password"
}
```

---

#### Issue 2: Field Mapping Error

**Error:**
```json
{
  "error": "Field 'KOSTL' not found in employee data"
}
```

**Solutions:**
1. Check if field exists in HRMS Employee model
2. Verify field name spelling
3. Add missing field to HRMS or remove from mapping

**Fix:**
```http
PATCH http://localhost:3000/erp/integrations/1
{
  "employeeFieldMap": {
    "HRMS_TO_ERP": {
      "costCenter": "KOSTL"  // Add missing field
    }
  }
}
```

---

#### Issue 3: Duplicate Records

**Error:**
```
Employee EMP001 already exists in ERP
```

**Solutions:**
1. Change sync mode to UPDATE instead of CREATE
2. Add unique constraint checking
3. Use UPSERT operation

**Configuration:**
```http
PATCH http://localhost:3000/erp/integrations/1
{
  "syncMode": "UPSERT",  // Create if not exists, update if exists
  "uniqueKey": "employeeCode"
}
```

---

#### Issue 4: Performance - Slow Sync

**Symptom:** Sync takes 30+ minutes for 500 employees

**Solutions:**
1. Increase batch size:
   ```json
   {
     "batchSize": 100  // Default: 50
   }
   ```

2. Use parallel processing:
   ```json
   {
     "parallelRequests": 5  // Process 5 batches simultaneously
   }
   ```

3. Sync only changed records:
   ```json
   {
     "syncStrategy": "INCREMENTAL",  // Only sync records modified since last sync
     "lastSyncTimestamp": "2026-01-09T00:00:00Z"
   }
   ```

---

## Summary

**You've learned:**
- ✅ How to integrate SAP, Oracle, and Odoo
- ✅ How to configure field mappings
- ✅ How to handle legacy SQL databases
- ✅ How to schedule automatic syncs
- ✅ How to monitor and troubleshoot

**Next Steps:**
1. Choose your ERP system
2. Gather credentials and field mappings
3. Configure integration using this guide
4. Test with sample data
5. Schedule production sync

**Next Guide:** Biometric Device Configuration (see BIOMETRIC_CONFIGURATION_GUIDE.md)

---

**Document Version**: 1.0  
**Last Updated**: January 2026  
**Author**: HRMS Integration Team
