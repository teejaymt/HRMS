# Employee Hierarchy - Visual Structure Guide

## 📊 Organizational Hierarchy Levels

```
┌─────────────────────────────────────────────────────┐
│                      CEO                             │
│                  (JobLevel: CEO)                     │
└──────────────────────┬──────────────────────────────┘
                       │
         ┌─────────────┴─────────────┐
         │                           │
    ┌────▼─────┐              ┌──────▼────┐
    │    VP    │              │    VP     │
    │ (Level: VP)│            │ (Level: VP)│
    └────┬─────┘              └──────┬────┘
         │                           │
    ┌────▼─────┐              ┌──────▼────┐
    │ DIRECTOR │              │ DIRECTOR  │
    └────┬─────┘              └──────┬────┘
         │                           │
    ┌────▼──────────┐          ┌─────▼─────────┐
    │ SENIOR_MANAGER│          │SENIOR_MANAGER │
    └────┬──────────┘          └─────┬─────────┘
         │                           │
    ┌────▼─────┐              ┌──────▼────┐
    │ MANAGER  │              │  MANAGER  │
    └────┬─────┘              └──────┬────┘
         │                           │
    ┌────▼──────┐              ┌─────▼─────┐
    │ TEAM_LEAD │              │ TEAM_LEAD │
    └────┬──────┘              └─────┬─────┘
         │                           │
    ┌────▼──────┐              ┌─────▼──────┐
    │SUPERVISOR │              │ SUPERVISOR │
    └────┬──────┘              └─────┬──────┘
         │                           │
    ┌────▼────┬────┬────┐      ┌─────▼───┬────┬────┐
    │EMPLOYEE │EMP │EMP │      │EMPLOYEE │EMP │EMP │
    └─────────┴────┴────┘      └─────────┴────┴────┘
```

## 🗄️ Database Structure

### Employee Table
```
Employee {
  id: number
  firstName: string
  lastName: string
  employeeCode: string
  position: string
  
  // NEW HIERARCHY FIELDS
  jobLevel: JobLevel (enum)
  supervisorId: number | null  ← Points to supervisor's id
  
  // RELATIONS
  supervisor: Employee         ← The employee's manager
  subordinates: Employee[]     ← Array of direct reports
}
```

### Example Data
```sql
-- CEO (No supervisor)
id: 1, name: "Sarah Johnson", jobLevel: CEO, supervisorId: NULL

-- VP (Reports to CEO)
id: 2, name: "Mike Chen", jobLevel: VP, supervisorId: 1

-- Manager (Reports to VP)
id: 3, name: "Jane Smith", jobLevel: MANAGER, supervisorId: 2

-- Team Lead (Reports to Manager)
id: 4, name: "John Doe", jobLevel: TEAM_LEAD, supervisorId: 3

-- Employee (Reports to Team Lead)
id: 5, name: "Bob Wilson", jobLevel: EMPLOYEE, supervisorId: 4
```

## 🔄 API Data Flow

### Getting Hierarchy
```
Client Request:
GET /employees/4/hierarchy

Backend Process:
1. Find employee (id: 4)
2. Get ancestors (supervisors up)
   - id: 3 (Manager)
   - id: 2 (VP)
   - id: 1 (CEO)
3. Get descendants (subordinates down)
   - id: 5 (Employee)
   - id: 6 (Employee)

Response:
{
  employee: { id: 4, name: "John Doe", jobLevel: "TEAM_LEAD" },
  ancestors: [
    { id: 3, name: "Jane Smith", jobLevel: "MANAGER" },
    { id: 2, name: "Mike Chen", jobLevel: "VP" },
    { id: 1, name: "Sarah Johnson", jobLevel: "CEO" }
  ],
  descendants: [
    { id: 5, name: "Bob Wilson", jobLevel: "EMPLOYEE" },
    { id: 6, name: "Alice Brown", jobLevel: "EMPLOYEE" }
  ]
}
```

## 🎨 Frontend Component Structure

```
HierarchyPage
├── Employee List Panel (Left)
│   ├── Search Bar
│   └── Employee Cards
│       └── Click to load hierarchy
│
└── Hierarchy View Panel (Right)
    ├── Ancestors Section (Reports To)
    │   └── Shows chain of managers
    │
    ├── Current Employee (Highlighted)
    │   └── Selected employee details
    │
    └── Descendants Section (Direct Reports)
        └── Expandable tree of subordinates
```

## 🔐 Circular Reference Prevention

### ❌ INVALID Assignment
```
Employee A (id: 1)
  └── Employee B (id: 2)
      └── Employee C (id: 3)

Trying to assign: A.supervisorId = 3
Result: BLOCKED - Creates circular reference!

Chain would be: A → B → C → A (circular!)
```

### ✅ VALID Assignment
```
Employee A (id: 1)
  └── Employee B (id: 2)
      └── Employee C (id: 3)

Assign: C.supervisorId = 1
Result: ALLOWED

New structure:
Employee A (id: 1)
  ├── Employee B (id: 2)
  └── Employee C (id: 3)
```

## 📱 User Interface Flow

### 1. View Hierarchy
```
User → Navigates to /employees/hierarchy
     → Sees list of all employees
     → Clicks on "John Doe"
     → System fetches hierarchy
     → Displays org chart
```

### 2. Navigate Up (View Manager)
```
Viewing: John Doe (Team Lead)
Reports to: Jane Smith (Manager) ← Click here
     → Loads Jane's hierarchy
     → Shows Jane's manager
     → Shows Jane's team (including John)
```

### 3. Navigate Down (View Team Member)
```
Viewing: John Doe (Team Lead)
Direct Reports:
  - Bob Wilson (Employee) ← Click here
     → Loads Bob's hierarchy
     → Shows Bob's manager (John)
     → Shows Bob's team (if any)
```

## 🛠️ Implementation Architecture

```
┌─────────────────────────────────────────────────────┐
│                  Frontend (Next.js)                  │
│                                                      │
│  Components:                                         │
│  - HierarchyPage                                    │
│  - EmployeeList                                      │
│  - HierarchyTree                                     │
│  - EmployeeNode                                      │
└──────────────────────┬──────────────────────────────┘
                       │
                       │ HTTP REST API
                       │
┌──────────────────────▼──────────────────────────────┐
│              Backend (NestJS)                        │
│                                                      │
│  Controllers:                                        │
│  - EmployeesController                               │
│    └── GET /employees/:id/hierarchy                 │
│                                                      │
│  Services:                                           │
│  - EmployeesService                                  │
│    ├── getHierarchy()                               │
│    ├── getAncestors() (recursive)                   │
│    └── getDescendants() (recursive)                 │
└──────────────────────┬──────────────────────────────┘
                       │
                       │ Prisma ORM
                       │
┌──────────────────────▼──────────────────────────────┐
│              Database (SQLite/PostgreSQL)            │
│                                                      │
│  Tables:                                             │
│  - Employee                                          │
│    ├── id (PK)                                      │
│    ├── supervisorId (FK → Employee.id)              │
│    ├── jobLevel (enum)                              │
│    └── ... other fields                             │
└─────────────────────────────────────────────────────┘
```

## 📊 Example Use Cases

### Use Case 1: Leave Approval Chain
```
Employee submits leave request
  → System finds supervisor
  → Routes to Team Lead
  → If amount > threshold, escalates to Manager
  → Manager approves
  → HR notified
```

### Use Case 2: Team View
```
Manager logs in
  → Dashboard shows "Your Team: 12 members"
  → Click to view team
  → See all direct + indirect reports
  → Quick actions available
```

### Use Case 3: Org Chart Export
```
HR needs org chart
  → Navigate to hierarchy
  → Select CEO
  → Click "Export"
  → PDF generated with full tree
```

## 🎯 Key Features Summary

| Feature | Description | Status |
|---------|-------------|--------|
| Hierarchy Levels | 8 job levels from Employee to CEO | ✅ Implemented |
| Supervisor Assignment | Link employees to managers | ✅ Implemented |
| Circular Prevention | Block invalid assignments | ✅ Implemented |
| Tree Navigation | Click to navigate org structure | ✅ Implemented |
| Recursive Queries | Get full reporting chain | ✅ Implemented |
| Visual Indicators | Color-coded job levels | ✅ Implemented |
| Search & Filter | Find employees quickly | ✅ Implemented |
| API Endpoints | 4 new RESTful endpoints | ✅ Implemented |

---

**This visual guide helps understand the hierarchy system structure and flow.**
**Refer to HIERARCHY_SETUP_GUIDE.md for installation instructions.**
