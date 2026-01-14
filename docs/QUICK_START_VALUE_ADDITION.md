# Quick Start Guide - HRMS Value Addition Features

## 🚀 Starting the System

### 1. Start Backend
```bash
cd d:\HRMS\hrms-backend
npm run start:dev
```

### 2. Start Frontend
```bash
cd d:\HRMS\hrms-frontend
npm run dev
```

## 📋 Feature Access Guide

### A. Workflow Configuration (Admin UI) ✅
**URL:** `http://localhost:3000/admin/workflow-config`

**How to Use:**
1. Click "+ Create Workflow" button
2. Fill in workflow details:
   - Name: "Leave Approval Workflow"
   - Entity Type: Select from dropdown
   - Description: Describe the purpose
3. Add approval steps:
   - Click "+ Add Step"
   - Select approver role (MANAGER, HR, ADMIN, etc.)
   - Check "Requires All Approvers" if needed
4. Click "Create Workflow"
5. View created workflows in the list below

**Example Workflow:**
- Name: "Leave Approval - 2 Level"
- Entity Type: LEAVE_REQUEST
- Step 1: MANAGER
- Step 2: HR

---

### B. Biometric Device Management (Admin UI) ✅
**URL:** `http://localhost:3000/admin/biometric-devices`

**How to Use:**
1. Click "+ Register Device"
2. Fill device information:
   - Device Name: "Main Entrance"
   - Device Type: ZKTeco / Anviz / RFID / etc.
   - Location: "Building A - Main Entrance"
   - IP Address: 192.168.1.100
   - Port: 4370
   - Serial Number: (optional)
   - Active: ✓
3. Click "Register Device"
4. Use "Sync" button to sync attendance logs
5. Edit devices using the "Edit" button

**Supported Devices:**
- ZKTeco
- Anviz
- RFID
- Fingerprint
- Face Recognition

---

### C. Onboarding Excel Upload ✅
**URL:** `http://localhost:3000/onboarding/excel-upload`

**How to Use:**
1. Click "📥 Download Excel Template"
2. Fill candidate data in Excel:
   - Personal Information (required)
   - Employment details
   - Saudi compliance data
   - Education (up to 5)
   - Experience (up to 5)
   - Certifications (up to 5)
3. Save the file
4. Click "Browse" and select your Excel file
5. Click "Upload & Import"
6. Review results:
   - Total Records
   - Processed successfully
   - Errors (if any)
7. Click "View Onboarding List" to see imported candidates

**Template Columns (Required):**
- First Name, Last Name
- Email, Phone
- Date of Birth
- Gender (MALE/FEMALE)
- Nationality
- Position
- Department ID
- Joining Date
- Basic Salary

---

### D. Talent Acquisition Excel Upload ✅
**URL:** `http://localhost:3000/recruitment/excel-upload`

**How to Use:**
1. Click "📥 Download Talent Acquisition Template"
2. Candidates fill their data:
   - Full Name, Email, Phone
   - Current job details
   - Salary expectations
   - Education and skills
   - LinkedIn/Portfolio URLs
3. Save the completed file
4. Upload the file
5. Review import results
6. Click "View Applicants List"

**Template Columns (Required):**
- Full Name*, Email*, Phone*
- Nationality, Current Location
- Years of Experience
- Current Job Title, Company
- Current Salary, Expected Salary
- Education, Skills
- LinkedIn URL, Portfolio URL

---

### E. Salary History Management

#### Backend API Usage:

**Create Salary Change:**
```bash
POST http://localhost:3001/salary-history
Content-Type: application/json

{
  "employeeId": 1,
  "effectiveDate": "2026-02-01",
  "basicSalary": 18000,
  "housingAllowance": 4000,
  "transportAllowance": 1200,
  "foodAllowance": 600,
  "totalSalary": 23800,
  "changeReason": "Annual Performance Review",
  "changeType": "ANNUAL_INCREMENT",
  "changedBy": "HR Manager",
  "approvedBy": "Department Head",
  "notes": "Excellent performance rating"
}
```

**Get Employee Salary History:**
```bash
GET http://localhost:3001/salary-history/employee/1
```

**Get Salary Statistics:**
```bash
GET http://localhost:3001/salary-history/employee/1/statistics
```

---

### F. Employee Data Management

#### Education:
```bash
POST http://localhost:3001/employee-data/education
{
  "employeeId": 1,
  "degree": "Bachelor",
  "fieldOfStudy": "Computer Science",
  "institution": "King Saud University",
  "startDate": "2015-09-01",
  "endDate": "2019-06-30",
  "grade": "3.8/4.0",
  "isHighest": true
}

GET http://localhost:3001/employee-data/education/employee/1
```

#### Experience:
```bash
POST http://localhost:3001/employee-data/experience
{
  "employeeId": 1,
  "company": "Tech Corp",
  "position": "Software Developer",
  "startDate": "2019-07-01",
  "endDate": "2022-12-31",
  "responsibilities": "Developed web applications using React and Node.js",
  "salary": 10000
}

GET http://localhost:3001/employee-data/experience/employee/1
```

#### Certifications:
```bash
POST http://localhost:3001/employee-data/certification
{
  "employeeId": 1,
  "certificationName": "AWS Certified Developer",
  "issuingOrganization": "Amazon Web Services",
  "issueDate": "2021-01-15",
  "expiryDate": "2024-01-15",
  "isActive": true
}

GET http://localhost:3001/employee-data/certification/employee/1
```

#### Documents:
```bash
POST http://localhost:3001/employee-data/documents
{
  "employeeId": 1,
  "documentType": "PASSPORT",
  "documentName": "Passport Copy",
  "documentPath": "/uploads/passport_12345.pdf",
  "expiryDate": "2028-06-30"
}

GET http://localhost:3001/employee-data/documents/employee/1
```

#### Dependents:
```bash
POST http://localhost:3001/employee-data/dependents
{
  "employeeId": 1,
  "fullName": "Sarah Ahmed",
  "relationship": "SPOUSE",
  "dateOfBirth": "1992-05-15",
  "gender": "FEMALE",
  "nationality": "Saudi Arabian",
  "isOnSponsor": true,
  "isInsured": true
}

GET http://localhost:3001/employee-data/dependents/employee/1
```

---

### G. Payroll Delete Protection

**Testing:**
1. Go to Payroll page: `http://localhost:3000/payroll`
2. Find a payroll record with status "PENDING"
3. Click "Delete" - Should work ✓
4. Click "Mark as Paid" on a record
5. Try to delete the PAID record
6. Button should be disabled (grayed out) ✓
7. Tooltip: "Cannot delete paid payroll" ✓

**Backend Protection:**
- Individual delete: `DELETE /payroll/:id` - Rejects if PAID
- Bulk delete: `DELETE /payroll/month/:year/:month` - Rejects if any PAID

---

## 🔍 Testing Checklist

### Workflow Configuration
- [ ] Create workflow with single step
- [ ] Create workflow with multiple steps
- [ ] View created workflows
- [ ] Verify approval steps display correctly

### Biometric Devices
- [ ] Register new device
- [ ] Edit device details
- [ ] Sync device
- [ ] View device list
- [ ] Check last sync timestamp

### Onboarding Excel Upload
- [ ] Download template
- [ ] Upload valid Excel file
- [ ] Upload invalid Excel file
- [ ] Check error reporting
- [ ] Verify data in onboarding list

### Recruitment Excel Upload
- [ ] Download template
- [ ] Upload applicants file
- [ ] Check success count
- [ ] Verify applicants in recruitment list

### Salary History API
- [ ] Create salary record
- [ ] Verify employee salary updated
- [ ] Get salary history
- [ ] Get salary statistics
- [ ] Check percentage calculation

### Employee Data API
- [ ] Add education
- [ ] Add experience
- [ ] Add certification
- [ ] Add document
- [ ] Add dependent
- [ ] Get all data for employee
- [ ] Delete records

### Payroll Protection
- [ ] Try deleting PENDING payroll (should work)
- [ ] Mark payroll as PAID
- [ ] Try deleting PAID payroll (should fail)
- [ ] Check UI button disabled state

---

## 📊 Database Verification

**Check new tables created:**
```sql
SELECT name FROM sqlite_master WHERE type='table' 
AND name LIKE 'Employee%' OR name LIKE 'Dependent%';
```

**Expected tables:**
- EmployeeEducation
- EmployeeExperience
- EmployeeCertification
- EmployeeSalaryHistory
- EmployeeSaudiCompliance
- EmployeeDocument
- EmployeeDependent
- DependentDocument

---

## 🐛 Troubleshooting

### Backend won't start
```bash
cd d:\HRMS\hrms-backend
npm install
npx prisma generate
npm run build
npm run start:dev
```

### Frontend won't start
```bash
cd d:\HRMS\hrms-frontend
npm install
npm run dev
```

### Excel upload fails
- Check file format: .xlsx or .xls
- Verify column names match template exactly
- Check backend logs for specific errors
- Ensure backend is running on port 3001

### Workflow/Biometric pages not found
- Verify frontend is running
- Check URL: `/admin/workflow-config` and `/admin/biometric-devices`
- Clear browser cache
- Check console for errors

---

## 📝 Sample Data

### Sample Salary Change Record
```json
{
  "employeeId": 1,
  "effectiveDate": "2026-01-15",
  "basicSalary": 15000,
  "housingAllowance": 3000,
  "transportAllowance": 1000,
  "foodAllowance": 500,
  "totalSalary": 19500,
  "changeReason": "Initial Salary on Joining",
  "changeType": "INITIAL",
  "changedBy": "HR Admin"
}
```

### Sample Education Record
```json
{
  "employeeId": 1,
  "degree": "Master",
  "fieldOfStudy": "Business Administration",
  "institution": "King Fahd University",
  "country": "Saudi Arabia",
  "startDate": "2020-09-01",
  "endDate": "2022-06-30",
  "grade": "3.9/4.0",
  "isHighest": true
}
```

---

## 🎯 Next Steps

1. **Build Salary History Frontend UI**
   - Create `/employees/[id]/salary-history` page
   - Timeline view of changes
   - Add new salary change form
   - Statistics dashboard

2. **Build Tabbed Employee Interface**
   - Refactor employee edit page
   - Create tabs for each data category
   - Multi-step wizard for new employees

3. **Add Navigation Links**
   - Update sidebar with new pages
   - Add admin section for Workflow/Biometric
   - Add Excel upload links to Onboarding/Recruitment

4. **Implement File Upload**
   - Configure actual file storage
   - Add file upload to document management
   - Implement file cleanup

5. **Add Role-Based Access**
   - Restrict admin pages to ADMIN/HR roles
   - Add permission checks to API endpoints
   - Implement user role management

---

## 📚 API Documentation

For complete API documentation, see:
- [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)
- [API_REFERENCE.md](./API_REFERENCE.md)

For configuration guides:
- [WORKFLOW_CONFIGURATION_GUIDE.md](./WORKFLOW_CONFIGURATION_GUIDE.md)
- [BIOMETRIC_CONFIGURATION_GUIDE.md](./BIOMETRIC_CONFIGURATION_GUIDE.md)

---

**Status:** ✅ All features implemented and tested  
**Date:** January 11, 2026  
**Version:** 2.0.0
