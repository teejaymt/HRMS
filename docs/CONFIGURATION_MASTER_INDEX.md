# HRMS Configuration Master Guide

## Complete Step-by-Step Configuration Documentation with Screen References

This master guide provides links to all configuration documentation for your advanced HRMS modules.

---

## 📚 Documentation Library

### 1. Workflow Configuration Guide
**File:** `WORKFLOW_CONFIGURATION_GUIDE.md`

**Topics Covered:**
- Understanding workflow concepts
- Creating leave approval workflows (2-step, 3-step)
- Configuring advance request workflows
- Setting up ticket request workflows
- Creating custom workflows for any process
- Testing and troubleshooting workflows

**When to Use:**
- Setting up automated approvals for leave, advances, tickets
- Creating multi-level approval chains
- Configuring conditional routing based on amounts or days
- Auditing approval history

**Estimated Time:** 2-3 hours to configure all workflows

**🔗 [Open Workflow Configuration Guide](WORKFLOW_CONFIGURATION_GUIDE.md)**

---

### 2. ERP Integration Guide
**File:** `ERP_INTEGRATION_GUIDE.md`

**Topics Covered:**
- SAP integration step-by-step
- Oracle ERP Cloud integration
- Odoo integration
- Legacy SQL database integration
- Field mapping configuration
- Scheduled sync setup
- Monitoring and troubleshooting

**When to Use:**
- Integrating with SAP, Oracle, Odoo, or custom ERP
- Syncing employee master data
- Pushing payroll to finance systems
- Pulling cost centers and org structure
- Bidirectional data synchronization

**Estimated Time:** 4-6 hours initial setup + testing

**🔗 [Open ERP Integration Guide](ERP_INTEGRATION_GUIDE.md)**

---

### 3. Biometric Device Configuration Guide
**File:** `BIOMETRIC_CONFIGURATION_GUIDE.md`

**Topics Covered:**
- ZKTeco device setup (fingerprint, face)
- Anviz device configuration
- Generic REST API devices
- Employee enrollment procedures
- Testing attendance capture
- Troubleshooting device issues

**When to Use:**
- Installing fingerprint scanners
- Configuring face recognition devices
- Setting up RFID card readers
- Enrolling employees for biometric attendance
- Automating attendance data collection

**Estimated Time:** 1-2 hours per device + employee enrollment

**🔗 [Open Biometric Configuration Guide](BIOMETRIC_CONFIGURATION_GUIDE.md)**

---

## 🚀 Quick Start Paths

### For New Installations

**Day 1: Workflows**
1. Read workflow concepts
2. Create standard leave approval workflow
3. Test with sample leave request
4. Create advance and ticket workflows

**Day 2: Biometrics**
1. Install first fingerprint device
2. Configure network settings
3. Register in HRMS
4. Enroll 5-10 test employees
5. Verify attendance capture

**Day 3: ERP (Optional)**
1. Gather ERP credentials and API docs
2. Configure integration
3. Test connection
4. Perform initial employee sync
5. Schedule automatic syncs

---

### For Existing System Upgrades

**Week 1: Workflows**
- Days 1-2: Configure and test workflows
- Days 3-5: Migrate existing approval processes

**Week 2: Biometrics**
- Days 1-2: Install and configure devices
- Days 3-5: Enroll all employees (batches)

**Week 3: ERP**
- Days 1-2: Configure integration
- Days 3-4: Test with sample data
- Day 5: Go live with production sync

---

## 📊 Configuration Cheat Sheets

### Workflow Quick Reference

**Create Leave Workflow:**
```json
POST /workflows/definitions
{
  "name": "Leave Approval - Standard",
  "entityType": "LEAVE",
  "steps": [
    {"stepOrder": 1, "approverRole": "MANAGER"},
    {"stepOrder": 2, "approverRole": "HR"}
  ]
}
```

**Test Workflow:**
```json
POST /leaves
{
  "employeeId": 1,
  "leaveType": "ANNUAL",
  "startDate": "2026-02-01",
  "endDate": "2026-02-05"
}
// Workflow auto-starts
```

---

### ERP Integration Quick Reference

**Register SAP Integration:**
```json
POST /erp/integrations
{
  "erpSystem": "SAP",
  "apiEndpoint": "https://sap.company.com:8000/sap/bc/rest",
  "username": "HRMS_INTEGRATION",
  "syncFrequency": "DAILY",
  "employeeFieldMap": {
    "HRMS_TO_ERP": {
      "employeeCode": "PERNR",
      "firstName": "VORNA"
    }
  }
}
```

**Sync Employees:**
```bash
POST /erp/sync/employees/1
```

---

### Biometric Device Quick Reference

**Register ZKTeco Device:**
```json
POST /biometric/devices
{
  "deviceName": "Main Gate - Fingerprint",
  "deviceType": "FINGERPRINT",
  "ipAddress": "192.168.1.100",
  "port": 4370,
  "location": "Main Entrance"
}
```

**Manual Sync:**
```bash
POST /biometric/devices/1/sync
```

---

## 🎯 Common Scenarios

### Scenario 1: Small Office (50 employees)

**Recommended Setup:**
- ✅ 1 fingerprint device at entrance
- ✅ Simple 2-step leave workflow (Manager → HR)
- ❌ ERP integration not needed (use HRMS standalone)

**Estimated Setup Time:** 1 day

**Configuration Order:**
1. Configure workflows (2 hours)
2. Install biometric device (1 hour)
3. Enroll employees (2-3 hours)
4. Test for 1 week

---

### Scenario 2: Medium Company (200 employees)

**Recommended Setup:**
- ✅ 2-3 biometric devices (main gate + side gates)
- ✅ Multi-step workflows with conditions
- ✅ Light ERP integration (employee sync only)

**Estimated Setup Time:** 1 week

**Configuration Order:**
1. Configure all workflows (1 day)
2. Set up basic ERP sync (1 day)
3. Install biometric devices (1 day)
4. Enroll employees in batches (2 days)
5. Test everything (2 days)

---

### Scenario 3: Large Enterprise (1000+ employees)

**Recommended Setup:**
- ✅ 5-10 biometric devices across locations
- ✅ Complex workflows with CEO approvals
- ✅ Full ERP integration (bidirectional)
- ✅ Multiple device types (face + fingerprint)

**Estimated Setup Time:** 3-4 weeks

**Configuration Order:**
1. Week 1: Configure all workflows + ERP
2. Week 2: Install all devices
3. Week 3: Enroll employees (department by department)
4. Week 4: Testing and go-live

---

## 🛠️ Tools & Resources

### API Testing Tools

**Postman Collection:**
Download pre-configured API requests for all modules:
- Workflow APIs
- Biometric APIs
- ERP APIs

**Recommended Tools:**
- Postman (API testing)
- Ping/Telnet (network testing)
- ZKAccess (ZKTeco management)
- Browser DevTools (debugging)

---

### Sample Data

**Test Employees CSV:**
```csv
employeeCode,firstName,lastName,email,departmentId
EMP001,Ahmed,Al-Saud,ahmed@company.com,1
EMP002,Fatima,Hassan,fatima@company.com,1
EMP003,Mohammed,Ali,mohammed@company.com,2
```

**Test Leave Requests:**
```json
[
  {
    "employeeId": 1,
    "leaveType": "ANNUAL",
    "startDate": "2026-02-01",
    "endDate": "2026-02-05",
    "days": 5
  }
]
```

---

## 📞 Support & Help

### Getting Help

**Documentation:**
1. Check the specific guide (Workflows, ERP, Biometric)
2. Review troubleshooting sections
3. Check API reference

**Common Issues:**
- Workflow not starting → Check workflow definition exists
- ERP sync failing → Verify credentials and network
- Device not syncing → Check IP address and firewall

**Contact Points:**
- Technical Issues: Check backend logs
- Configuration Help: Review guide examples
- API Errors: Check browser console

---

## ✅ Go-Live Checklist

### Before Production Launch

#### Workflows
- [ ] All workflow definitions created
- [ ] Test approvals completed successfully
- [ ] Approval chains verified
- [ ] Notification emails configured (optional)
- [ ] Workflow history reviewed

#### ERP Integration
- [ ] Connection tested successfully
- [ ] Field mappings verified
- [ ] Initial sync completed without errors
- [ ] Automatic sync schedule configured
- [ ] Error notification configured
- [ ] Backup plan documented

#### Biometric Devices
- [ ] All devices installed and powered
- [ ] Network connectivity verified
- [ ] Devices registered in HRMS
- [ ] Auto-sync enabled (every 15 min)
- [ ] All employees enrolled
- [ ] Test punches successful
- [ ] Attendance records verified

#### Testing
- [ ] End-to-end workflow tested
- [ ] Employee punch creates attendance
- [ ] Attendance syncs to ERP
- [ ] Manual overrides work
- [ ] Reports generate correctly
- [ ] Performance acceptable

#### Training
- [ ] HR team trained on workflows
- [ ] IT team trained on device management
- [ ] Employees trained on biometric usage
- [ ] Managers trained on approvals
- [ ] Documentation distributed

---

## 📈 Post-Launch Monitoring

### First Week

**Daily Checks:**
- [ ] Review sync logs (biometric + ERP)
- [ ] Check for failed approvals
- [ ] Verify attendance accuracy
- [ ] Monitor error rates
- [ ] Collect user feedback

**Metrics to Track:**
```
Biometric Sync Success Rate: _____% (Target: >95%)
ERP Sync Success Rate:       _____% (Target: >98%)
Workflow Completion Rate:    _____% (Target: >90%)
Device Uptime:               _____% (Target: >99%)
```

### First Month

**Weekly Reviews:**
- Analyze attendance patterns
- Review workflow bottlenecks
- Optimize sync schedules
- Fix recurring issues
- Train additional users

---

## 🎓 Training Materials

### For HR Staff

**Topics:**
1. How to approve leave requests
2. How to view workflow history
3. How to handle failed syncs
4. How to generate reports

**Duration:** 2 hours

### For Employees

**Topics:**
1. How to use biometric devices
2. How to submit leave requests
3. How to check attendance records
4. What to do if fingerprint fails

**Duration:** 30 minutes

### For IT Staff

**Topics:**
1. Device troubleshooting
2. Network configuration
3. Database backup
4. Error log interpretation

**Duration:** 4 hours

---

## 📝 Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | Jan 2026 | Initial release - All 3 guides |
| 1.1 | TBD | Add notification guide |
| 1.2 | TBD | Add mobile app guide |

---

## 🎯 Next Steps

**You should now:**
1. ✅ Read the guide for your priority module
2. ✅ Gather required information (credentials, IPs, etc.)
3. ✅ Follow step-by-step instructions
4. ✅ Test in development first
5. ✅ Plan production rollout

**Recommended Reading Order:**
1. Start with Workflows (easiest, immediate value)
2. Then Biometrics (visible impact)
3. Finally ERP (most complex, long-term value)

---

## 📚 Additional Resources

**Other Documentation Files:**
- `HRMS_ADVANCED_FEATURES.md` - Feature overview
- `API_REFERENCE.md` - Complete API documentation
- `QUICK_START.md` - 5-minute setup
- `IMPLEMENTATION_CHECKLIST.md` - Deployment checklist
- `FURTHER_CONSIDERATIONS.md` - Design decisions

---

**Master Guide Version**: 1.0  
**Last Updated**: January 2026  
**Total Pages**: 150+ across all guides  
**Estimated Reading Time**: 6-8 hours for all guides  

**Happy Configuring! 🚀**
