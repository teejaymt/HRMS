# Employee Hierarchy Implementation - Complete Guide

## 📋 Overview
This implementation adds a complete employee hierarchy system to the HRMS, allowing you to manage organizational structures with supervisors, team leads, managers, and senior management levels.

## ✅ What Has Been Implemented

### 1. Database Schema Changes
**File: `hrms-backend/prisma/schema.prisma`**

Added JobLevel enum:
```prisma
enum JobLevel {
  EMPLOYEE           // Regular employee
  SUPERVISOR         // Team supervisor
  TEAM_LEAD          // Team lead
  MANAGER            // Department manager
  SENIOR_MANAGER     // Senior manager
  DIRECTOR           // Director
  VP                 // Vice President
  CEO                // Chief Executive Officer
}
```

Added hierarchy fields to Employee model:
- `jobLevel`: Position in organizational hierarchy
- `supervisorId`: Reference to direct manager (foreign key)
- `supervisor`: Relation to supervisor employee
- `subordinates`: Array of direct reports

### 2. Backend API (NestJS)

**Updated Files:**
- `hrms-backend/src/employees/employees.service.ts`
- `hrms-backend/src/employees/employees.controller.ts`

**New API Endpoints:**
```
GET    /employees/:id/hierarchy          - Get complete hierarchy tree
GET    /employees/:id/team                - Get all team members
POST   /employees/:id/supervisor          - Assign a supervisor
DELETE /employees/:id/supervisor          - Remove supervisor
```

**New Service Methods:**
- `getHierarchy(employeeId)` - Returns ancestors, employee, and descendants
- `getAncestors(employeeId)` - Recursive function to get all supervisors up the chain
- `getDescendants(employeeId)` - Recursive function to get all subordinates down the chain
- `getTeamMembers(managerId)` - Get all employees under a manager
- `assignSupervisor(employeeId, supervisorId)` - Assign supervisor with circular reference prevention
- `removeSupervisor(employeeId)` - Remove supervisor assignment

### 3. Frontend Component

**New Page Component:**
- Location: `HierarchyPage.tsx` (ready to be placed in `hrms-frontend/app/employees/hierarchy/`)

**Features:**
- Interactive organizational chart
- Click to view any employee's hierarchy
- Shows reporting chain (ancestors)
- Shows direct reports (descendants)
- Expandable/collapsible tree view
- Search functionality
- Visual indicators for job levels

### 4. Helper Files Created

- `migrate-hierarchy.bat` - Batch file to run migration
- `run-hierarchy-migration.ts` - TypeScript migration runner
- `create-hierarchy-structure.bat` - Creates necessary directories
- `HIERARCHY_IMPLEMENTATION.md` - Detailed documentation

## 🚀 Installation Steps

### Step 1: Run Database Migration

Choose ONE of the following options:

**Option A: Using NPX (Recommended)**
```bash
cd hrms-backend
npx prisma migrate dev --name add_employee_hierarchy
```

**Option B: Using Batch File**
```bash
cd hrms-backend
migrate-hierarchy.bat
```

**Option C: Using TypeScript**
```bash
cd hrms-backend
npx ts-node run-hierarchy-migration.ts
```

### Step 2: Generate Prisma Client
```bash
cd hrms-backend
npx prisma generate
```

### Step 3: Set Up Frontend Component

1. Create the hierarchy directory:
```bash
mkdir hrms-frontend\app\employees\hierarchy
```

2. Copy the hierarchy page:
```bash
copy HierarchyPage.tsx hrms-frontend\app\employees\hierarchy\page.tsx
```

Or run the batch file:
```bash
create-hierarchy-structure.bat
```

Then manually copy `HierarchyPage.tsx` to `hrms-frontend\app\employees\hierarchy\page.tsx`

### Step 4: Restart Applications
```bash
# Stop current instances if running
# Then start fresh:
start-all.bat
```

## 📚 Usage Examples

### API Usage

**1. Get Employee Hierarchy**
```typescript
GET /employees/5/hierarchy

Response:
{
  "employee": {
    "id": 5,
    "firstName": "John",
    "lastName": "Doe",
    "employeeCode": "EMP00005",
    "position": "Team Lead",
    "jobLevel": "TEAM_LEAD"
  },
  "ancestors": [
    {
      "id": 3,
      "firstName": "Jane",
      "lastName": "Smith",
      "position": "Manager",
      "jobLevel": "MANAGER"
    }
  ],
  "descendants": [
    {
      "id": 8,
      "firstName": "Bob",
      "lastName": "Johnson",
      "position": "Developer",
      "jobLevel": "EMPLOYEE"
    }
  ]
}
```

**2. Assign Supervisor**
```typescript
POST /employees/8/supervisor
Body: { "supervisorId": 5 }

Response:
{
  "id": 8,
  "firstName": "Bob",
  "lastName": "Johnson",
  "supervisorId": 5,
  "supervisor": { ... },
  "subordinates": []
}
```

**3. Get Team Members**
```typescript
GET /employees/5/team

Response: [
  // All direct and indirect reports
]
```

**4. Remove Supervisor**
```typescript
DELETE /employees/8/supervisor

Response:
{
  "id": 8,
  "supervisorId": null,
  ...
}
```

### Frontend Usage

1. Navigate to `/employees/hierarchy` in your browser
2. Select an employee from the list
3. View their complete organizational hierarchy
4. Click on any manager to navigate up the chain
5. Expand/collapse subordinates to explore the tree

### Creating Hierarchy in Employee Forms

Update your employee creation/edit forms to include:

```typescript
<select name="jobLevel">
  <option value="EMPLOYEE">Employee</option>
  <option value="SUPERVISOR">Supervisor</option>
  <option value="TEAM_LEAD">Team Lead</option>
  <option value="MANAGER">Manager</option>
  <option value="SENIOR_MANAGER">Senior Manager</option>
  <option value="DIRECTOR">Director</option>
  <option value="VP">Vice President</option>
  <option value="CEO">CEO</option>
</select>

<select name="supervisorId">
  <option value="">No Supervisor</option>
  {employees.map(emp => (
    <option key={emp.id} value={emp.id}>
      {emp.firstName} {emp.lastName} - {emp.position}
    </option>
  ))}
</select>
```

## 🔒 Security Features

- **Circular Reference Prevention**: System prevents assigning supervisors that would create circular hierarchies
- **Validation**: Supervisor existence is validated before assignment
- **Cascade Delete Protection**: Uses `onDelete: SetNull` to prevent orphaned records
- **Authorization**: Can be extended to check user permissions for hierarchy modifications

## 🎯 Next Steps / Future Enhancements

1. **Add to Sidebar Navigation**
   - Add "Hierarchy" link in the sidebar menu
   - Update `components/layout/Sidebar.tsx`

2. **Enhanced Visualizations**
   - Add org chart diagram view
   - Export hierarchy as PDF
   - Print-friendly layouts

3. **Bulk Operations**
   - Bulk assign supervisors
   - Transfer entire teams
   - Reorganize departments

4. **Reporting**
   - Span of control reports
   - Hierarchy depth analysis
   - Manager workload distribution

5. **Permissions**
   - Role-based access for hierarchy viewing
   - Manager-only edit permissions
   - HR approval workflows

6. **Integration**
   - Link with performance reviews
   - Integrate with approval workflows
   - Connect to leave approval chains

## 🐛 Troubleshooting

### Migration Fails
- Ensure no backend instance is running
- Check database connection
- Verify schema.prisma syntax

### Circular Reference Error
```
Cannot assign supervisor: circular hierarchy detected
```
- This is expected behavior preventing invalid structures
- Review the reporting chain before assignment

### Frontend Not Loading
- Verify API endpoints are accessible
- Check browser console for errors
- Ensure backend is running on correct port

### TypeScript Errors
- Run `npx prisma generate` after migration
- Restart your IDE/editor
- Clear node_modules and reinstall if needed

## 📞 Support

For issues or questions:
1. Check the console logs (browser and backend)
2. Verify all migration steps completed
3. Review API responses in Network tab
4. Check database schema with `npx prisma studio`

## 📝 Summary of Files Changed/Created

**Modified:**
- `hrms-backend/prisma/schema.prisma`
- `hrms-backend/src/employees/employees.service.ts`
- `hrms-backend/src/employees/employees.controller.ts`

**Created:**
- `HIERARCHY_IMPLEMENTATION.md`
- `HierarchyPage.tsx`
- `migrate-hierarchy.bat`
- `run-hierarchy-migration.ts`
- `create-hierarchy-structure.bat`
- `HIERARCHY_SETUP_GUIDE.md` (this file)

## ✨ Benefits

✅ Clear organizational structure
✅ Easy navigation of reporting relationships
✅ Automated approval chain routing
✅ Better workforce planning
✅ Improved communication pathways
✅ Compliance with organizational policies
✅ Enhanced HR analytics capabilities

---

**Implementation Complete! 🎉**

The hierarchy system is now ready to use. Follow the installation steps above to activate it in your HRMS system.
