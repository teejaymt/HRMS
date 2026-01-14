# Workflow Configuration Guide - Step by Step

## Complete Guide to Configuring Workflows for All Request Types

This guide will walk you through setting up automated approval workflows for Leave Requests, Advance Requests, Ticket Requests, and other processes.

---

## 📋 Table of Contents

1. [Understanding Workflow Concepts](#understanding-workflow-concepts)
2. [Creating a Leave Approval Workflow](#creating-a-leave-approval-workflow)
3. [Creating an Advance Request Workflow](#creating-an-advance-request-workflow)
4. [Creating a Ticket Request Workflow](#creating-a-ticket-request-workflow)
5. [Creating Custom Workflows](#creating-custom-workflows)
6. [Testing Workflows](#testing-workflows)
7. [Troubleshooting](#troubleshooting)

---

## Understanding Workflow Concepts

### What is a Workflow?

A workflow is an automated process that routes requests through multiple approval steps. Each step can have:
- **Approver Role**: Who can approve (MANAGER, HR, ADMIN)
- **Order**: Sequential step number
- **Conditions**: Optional rules (e.g., amount > 5000)
- **Required/Optional**: Whether the step can be skipped

### Workflow Components

```
┌─────────────────────────────────────┐
│  Workflow Definition                │
│  (Template/Blueprint)               │
├─────────────────────────────────────┤
│  • Name: "Leave Approval Standard" │
│  • Entity Type: LEAVE               │
│  • Steps: 1, 2, 3...                │
└─────────────────────────────────────┘
           ↓
┌─────────────────────────────────────┐
│  Workflow Instance                  │
│  (Active Request)                   │
├─────────────────────────────────────┤
│  • Request ID: #123                 │
│  • Current Step: 2                  │
│  • Status: IN_PROGRESS              │
└─────────────────────────────────────┘
           ↓
┌─────────────────────────────────────┐
│  Workflow History                   │
│  (Audit Trail)                      │
├─────────────────────────────────────┤
│  • Step 1: Approved by John (Mgr)  │
│  • Step 2: Pending HR approval      │
└─────────────────────────────────────┘
```

---

## Creating a Leave Approval Workflow

### Step 1: Access Workflow Management

**Screen Description:**
1. Login to HRMS at: `http://localhost:3001`
2. Navigate to: **Workflows** (in Advanced Modules section - left sidebar)
3. You'll see: "Workflow Management" page with two sections:
   - **Pending Approvals** (top)
   - **Workflow Definitions** (bottom)

**What You See:**
```
┌─────────────────────────────────────────────────────────┐
│ Workflow Management                                     │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ Pending Approvals (0)                                  │
│ ┌─────────────────────────────────────────────────┐   │
│ │ No pending approvals                             │   │
│ └─────────────────────────────────────────────────┘   │
│                                                         │
│ Workflow Definitions                                   │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐               │
│ │ Leave    │ │ Advance  │ │ Ticket   │               │
│ │ Approval │ │ Request  │ │ Request  │               │
│ │ [Active] │ │ [Active] │ │ [Active] │               │
│ └──────────┘ └──────────┘ └──────────┘               │
└─────────────────────────────────────────────────────────┘
```

---

### Step 2: Create Leave Workflow via API

Since the UI for creating workflows isn't built yet, use the API directly:

**Open Postman or any REST client and make this request:**

#### API Request: Create Leave Workflow

```http
POST http://localhost:3000/workflows/definitions
Content-Type: application/json
Authorization: Bearer YOUR_JWT_TOKEN
```

**Request Body:**
```json
{
  "name": "Leave Approval - Standard (2-Step)",
  "description": "Standard leave approval: Manager → HR",
  "entityType": "LEAVE",
  "isActive": true,
  "steps": [
    {
      "stepOrder": 1,
      "stepName": "Manager Approval",
      "approverRole": "MANAGER",
      "requiresApproval": true,
      "isOptional": false
    },
    {
      "stepOrder": 2,
      "stepName": "HR Final Approval",
      "approverRole": "HR",
      "requiresApproval": true,
      "isOptional": false
    }
  ]
}
```

**Expected Response (Success):**
```json
{
  "id": 1,
  "name": "Leave Approval - Standard (2-Step)",
  "description": "Standard leave approval: Manager → HR",
  "entityType": "LEAVE",
  "isActive": true,
  "createdAt": "2026-01-09T16:00:00.000Z",
  "steps": [
    {
      "id": 1,
      "stepOrder": 1,
      "stepName": "Manager Approval",
      "approverRole": "MANAGER"
    },
    {
      "id": 2,
      "stepOrder": 2,
      "stepName": "HR Final Approval",
      "approverRole": "HR"
    }
  ]
}
```

---

### Step 3: Create Extended Leave Workflow (For Long Leaves)

For leaves longer than 7 days, create a 3-step workflow:

**API Request:**
```http
POST http://localhost:3000/workflows/definitions
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Leave Approval - Extended (3-Step)",
  "description": "For leaves > 7 days: Manager → Department Head → HR",
  "entityType": "LEAVE",
  "isActive": false,
  "steps": [
    {
      "stepOrder": 1,
      "stepName": "Direct Manager Approval",
      "approverRole": "MANAGER",
      "requiresApproval": true,
      "isOptional": false
    },
    {
      "stepOrder": 2,
      "stepName": "Department Head Approval",
      "approverRole": "MANAGER",
      "requiresApproval": true,
      "isOptional": false,
      "conditionField": "days",
      "conditionValue": ">7"
    },
    {
      "stepOrder": 3,
      "stepName": "HR Director Approval",
      "approverRole": "HR",
      "requiresApproval": true,
      "isOptional": false
    }
  ]
}
```

**Note:** Set `isActive: false` initially. Activate it when you want to use it for specific scenarios.

---

### Step 4: Verify Workflow Creation

**Refresh the Workflows page** in your browser.

**What You Should See:**
```
┌─────────────────────────────────────────────────────────┐
│ Workflow Definitions                                    │
├─────────────────────────────────────────────────────────┤
│ ┌───────────────────────────────────────────────┐      │
│ │ Leave Approval - Standard (2-Step)            │      │
│ │ Standard leave approval: Manager → HR         │      │
│ │ LEAVE                              [Active]   │      │
│ └───────────────────────────────────────────────┘      │
│                                                         │
│ ┌───────────────────────────────────────────────┐      │
│ │ Leave Approval - Extended (3-Step)            │      │
│ │ For leaves > 7 days: Manager → Dept → HR      │      │
│ │ LEAVE                            [Inactive]   │      │
│ └───────────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────────┘
```

---

### Step 5: Test Leave Workflow

#### A. Submit a Leave Request

**Go to:** `http://localhost:3001/leaves`

**Screen:**
1. Click: **"Create Leave"** button (top right)
2. Fill in the form:
   - **Employee**: Select employee from dropdown
   - **Leave Type**: ANNUAL
   - **Start Date**: 2026-02-01
   - **End Date**: 2026-02-05 (5 days)
   - **Reason**: Family vacation

**What Happens:**
```
User Action → System Response
───────────────────────────────────────
Submit Form  → ✅ Leave created (ID: 1)
             → ✅ Workflow started automatically
             → ✅ Status: PENDING
             → ✅ Current Step: 1 (Manager Approval)
             → ✅ Email sent to manager (if configured)
```

#### B. View Pending Approval

**Go to:** `http://localhost:3001/workflows`

**You Should See:**
```
┌─────────────────────────────────────────────────────────┐
│ Pending Approvals (1)                                   │
├──────┬─────────┬──────────┬─────────┬────────────┬──────┤
│ ID   │ Type    │ Entity   │ Status  │ Initiated  │ Step │
├──────┼─────────┼──────────┼─────────┼────────────┼──────┤
│ 1    │ LEAVE   │ #1       │ PENDING │ john@co... │ 1    │
│      │         │          │         │            │      │
│      │         │          │ Actions: [Approve] [Reject] │
└──────┴─────────┴──────────┴─────────┴────────────┴──────┘
```

#### C. Approve Step 1 (As Manager)

**Click:** "Approve" button

**Backend Request:**
```http
PATCH http://localhost:3000/workflows/instances/1/approve
{
  "stepOrder": 1,
  "actionBy": "manager@company.com",
  "comments": "Approved - dates are clear"
}
```

**Result:**
- ✅ Step 1 marked as APPROVED
- ✅ Workflow advances to Step 2 (HR Approval)
- ✅ History entry created
- ✅ Notification sent to HR (if configured)

#### D. Approve Step 2 (As HR)

Login as HR user and approve:

**What Happens:**
```
HR Action   → System Response
───────────────────────────────────────
Approve     → ✅ Step 2 marked APPROVED
            → ✅ All steps complete
            → ✅ Workflow status: COMPLETED
            → ✅ Leave status: APPROVED
            → ✅ Employee notified
```

---

## Creating an Advance Request Workflow

### Step 1: Create Advance Workflow Definition

**API Request:**
```http
POST http://localhost:3000/workflows/definitions
```

**Request Body:**
```json
{
  "name": "Advance Request - Standard",
  "description": "Salary advance approval: Manager → HR → Finance",
  "entityType": "ADVANCE",
  "isActive": true,
  "steps": [
    {
      "stepOrder": 1,
      "stepName": "Manager Review",
      "approverRole": "MANAGER",
      "requiresApproval": true,
      "isOptional": false
    },
    {
      "stepOrder": 2,
      "stepName": "HR Verification",
      "approverRole": "HR",
      "requiresApproval": true,
      "isOptional": false
    },
    {
      "stepOrder": 3,
      "stepName": "Finance Approval",
      "approverRole": "ADMIN",
      "requiresApproval": true,
      "isOptional": false
    }
  ]
}
```

### Step 2: Create High-Value Advance Workflow

For advances over 10,000 SAR, add CEO approval:

```json
{
  "name": "Advance Request - High Value",
  "description": "For advances > 10,000 SAR: Manager → HR → Finance → CEO",
  "entityType": "ADVANCE",
  "isActive": false,
  "steps": [
    {
      "stepOrder": 1,
      "stepName": "Manager Review",
      "approverRole": "MANAGER",
      "requiresApproval": true,
      "conditionField": "amount",
      "conditionValue": ">10000"
    },
    {
      "stepOrder": 2,
      "stepName": "HR Verification",
      "approverRole": "HR",
      "requiresApproval": true
    },
    {
      "stepOrder": 3,
      "stepName": "Finance Director",
      "approverRole": "ADMIN",
      "requiresApproval": true
    },
    {
      "stepOrder": 4,
      "stepName": "CEO Final Approval",
      "approverRole": "ADMIN",
      "requiresApproval": true
    }
  ]
}
```

### Step 3: Test Advance Request

**Go to:** `http://localhost:3001/advance-requests`

1. Click: **"Request Advance"**
2. Fill form:
   - **Amount**: 5000 SAR
   - **Reason**: Medical emergency
   - **Repayment Months**: 5
3. Submit

**System Actions:**
```
✅ Advance request created
✅ Repayment schedule generated (1000 × 5 months)
✅ Workflow started (3-step approval)
✅ Manager notified
```

**Repayment Schedule Preview:**
```
Month 1 (Feb 2026): 1,000 SAR
Month 2 (Mar 2026): 1,000 SAR
Month 3 (Apr 2026): 1,000 SAR
Month 4 (May 2026): 1,000 SAR
Month 5 (Jun 2026): 1,000 SAR
─────────────────────────────
Total: 5,000 SAR
```

---

## Creating a Ticket Request Workflow

### Step 1: Create Ticket Workflow

```http
POST http://localhost:3000/workflows/definitions
```

**Request Body:**
```json
{
  "name": "Air Ticket Request - Standard",
  "description": "Annual leave ticket: Manager → HR",
  "entityType": "TICKET",
  "isActive": true,
  "steps": [
    {
      "stepOrder": 1,
      "stepName": "Manager Approval",
      "approverRole": "MANAGER",
      "requiresApproval": true,
      "isOptional": false
    },
    {
      "stepOrder": 2,
      "stepName": "HR Booking Confirmation",
      "approverRole": "HR",
      "requiresApproval": true,
      "isOptional": false
    }
  ]
}
```

### Step 2: Create Hajj Ticket Workflow

For Hajj tickets (special approval):

```json
{
  "name": "Hajj Ticket Request",
  "description": "Hajj pilgrimage ticket: Manager → HR → Admin",
  "entityType": "TICKET",
  "isActive": true,
  "steps": [
    {
      "stepOrder": 1,
      "stepName": "Manager Approval",
      "approverRole": "MANAGER",
      "requiresApproval": true
    },
    {
      "stepOrder": 2,
      "stepName": "HR Eligibility Check",
      "approverRole": "HR",
      "requiresApproval": true
    },
    {
      "stepOrder": 3,
      "stepName": "Admin Final Approval",
      "approverRole": "ADMIN",
      "requiresApproval": true
    }
  ]
}
```

---

## Creating Custom Workflows

### Example: Overtime Approval Workflow

```json
{
  "name": "Overtime Request",
  "description": "Overtime approval: Manager → HR",
  "entityType": "OVERTIME",
  "isActive": true,
  "steps": [
    {
      "stepOrder": 1,
      "stepName": "Manager Approval",
      "approverRole": "MANAGER",
      "requiresApproval": true,
      "isOptional": false
    },
    {
      "stepOrder": 2,
      "stepName": "HR Validation",
      "approverRole": "HR",
      "requiresApproval": true,
      "isOptional": false
    }
  ]
}
```

---

## Testing Workflows

### Test Checklist

#### ✅ Test 1: Submit Request
- [ ] Create a leave/advance/ticket request
- [ ] Verify workflow instance created
- [ ] Check status is "PENDING"
- [ ] Verify current step is 1

#### ✅ Test 2: Approve Step 1
- [ ] Login as Manager
- [ ] Go to Workflows page
- [ ] See pending approval
- [ ] Click "Approve"
- [ ] Verify step advances to 2

#### ✅ Test 3: Reject Workflow
- [ ] Submit a test request
- [ ] Click "Reject" as Manager
- [ ] Verify workflow status: REJECTED
- [ ] Verify request status: REJECTED

#### ✅ Test 4: Complete Workflow
- [ ] Submit request
- [ ] Approve all steps sequentially
- [ ] Verify final status: COMPLETED
- [ ] Verify request status: APPROVED

---

## Troubleshooting

### Issue: Workflow Not Starting

**Problem:** Leave created but no workflow instance

**Solution:**
```sql
-- Check if workflow definition exists
SELECT * FROM WorkflowDefinition WHERE entityType = 'LEAVE' AND isActive = true;

-- If missing, create it via API (see Step 2 above)
```

### Issue: Approval Button Not Working

**Problem:** Click approve but nothing happens

**Check:**
1. Browser console for errors
2. Backend logs for API errors
3. User has correct role (MANAGER/HR/ADMIN)

### Issue: Multiple Active Workflows

**Problem:** Two workflows for same entity type both active

**Solution:**
```http
PATCH http://localhost:3000/workflows/definitions/1
{
  "isActive": false
}
```

Only one workflow per entity type should be active at a time.

---

## Quick Reference: API Endpoints

### Workflow Management
```
GET    /workflows/definitions           - List all workflows
GET    /workflows/definitions/:id       - Get single workflow
POST   /workflows/definitions           - Create workflow
PATCH  /workflows/definitions/:id       - Update workflow
DELETE /workflows/definitions/:id       - Delete workflow

GET    /workflows/instances/:id         - Get workflow instance
PATCH  /workflows/instances/:id/approve - Approve current step
PATCH  /workflows/instances/:id/reject  - Reject workflow
```

---

## Summary

**You've learned:**
- ✅ How to create workflow definitions
- ✅ How to configure multi-step approvals
- ✅ How to test workflows end-to-end
- ✅ How to troubleshoot common issues

**Next:** Configure ERP Integration (see ERP_INTEGRATION_GUIDE.md)

---

**Document Version**: 1.0  
**Last Updated**: January 2026  
**Author**: HRMS Configuration Team
