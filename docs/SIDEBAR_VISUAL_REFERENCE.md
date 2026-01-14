# HRMS Sidebar - Visual Reference

## Admin User View

```
┌──────────────────────────────────┐
│       HRMS System               │
├──────────────────────────────────┤
│                                  │
│  🏠 Dashboard                    │
│  👥 Employees                    │
│  👤 Onboarding                   │
│  🏢 Departments                  │
│  📅 Leaves                       │
│  🕐 Attendance                   │
│  💰 Payroll                      │
│                                  │
│  ─────────────────────────────  │
│  ADVANCED MODULES                │
│  ─────────────────────────────  │
│                                  │
│  🔲 Workflows            [New]  │
│  💵 Advance Requests     [New]  │
│  🎫 Ticket Requests      [New]  │
│  👆 Biometric Devices    [New]  │
│  💼 Recruitment          [New]  │
│  🔄 ERP Integration      [New]  │
│                                  │
│  📊 Reports & Analytics         │
│  ⚙️  Audit Logs                 │
│  👥 User Management             │
│                                  │
├──────────────────────────────────┤
│  admin@company.com              │
│  ADMIN                          │
│  [➡️  Logout]                   │
└──────────────────────────────────┘
```

## HR User View

```
┌──────────────────────────────────┐
│       HRMS System               │
├──────────────────────────────────┤
│                                  │
│  🏠 Dashboard                    │
│  👥 Employees                    │
│  👤 Onboarding                   │
│  🏢 Departments                  │
│  📅 Leaves                       │
│  🕐 Attendance                   │
│  💰 Payroll                      │
│                                  │
│  📊 Reports & Analytics         │
│  ⚙️  Audit Logs                 │
│  👥 User Management             │
│                                  │
├──────────────────────────────────┤
│  hr@company.com                 │
│  HR                             │
│  [➡️  Logout]                   │
└──────────────────────────────────┘
```

## Manager User View

```
┌──────────────────────────────────┐
│       HRMS System               │
├──────────────────────────────────┤
│                                  │
│  🏠 Dashboard                    │
│  👥 Employees                    │
│  🏢 Departments                  │
│  📅 Leaves                       │
│  🕐 Attendance                   │
│  💰 Payroll                      │
│  📊 Reports & Analytics         │
│                                  │
├──────────────────────────────────┤
│  manager@company.com            │
│  MANAGER                        │
│  [➡️  Logout]                   │
└──────────────────────────────────┘
```

## Employee User View

```
┌──────────────────────────────────┐
│       HRMS System               │
├──────────────────────────────────┤
│                                  │
│  🏠 Dashboard                    │
│  👥 Employees                    │
│  🏢 Departments                  │
│  📅 Leaves                       │
│  🕐 Attendance                   │
│  💰 Payroll                      │
│                                  │
├──────────────────────────────────┤
│  employee@company.com           │
│  EMPLOYEE                       │
│  [➡️  Logout]                   │
└──────────────────────────────────┘
```

---

## Module Access Matrix

| Module                | ADMIN | HR | MANAGER | EMPLOYEE |
|----------------------|-------|----|---------| ---------|
| Dashboard            | ✅    | ✅ | ✅      | ✅       |
| Employees            | ✅    | ✅ | ✅      | ✅       |
| Onboarding           | ✅    | ✅ | ❌      | ❌       |
| Departments          | ✅    | ✅ | ✅      | ✅       |
| Leaves               | ✅    | ✅ | ✅      | ✅       |
| Attendance           | ✅    | ✅ | ✅      | ✅       |
| Payroll              | ✅    | ✅ | ✅      | ✅       |
| **Workflows**        | ✅    | ❌ | ❌      | ❌       |
| **Advance Requests** | ✅    | ❌ | ❌      | ❌       |
| **Ticket Requests**  | ✅    | ❌ | ❌      | ❌       |
| **Biometric Devices**| ✅    | ❌ | ❌      | ❌       |
| **Recruitment**      | ✅    | ❌ | ❌      | ❌       |
| **ERP Integration**  | ✅    | ❌ | ❌      | ❌       |
| Reports & Analytics  | ✅    | ✅ | ✅      | ❌       |
| Audit Logs           | ✅    | ✅ | ❌      | ❌       |
| User Management      | ✅    | ✅ | ❌      | ❌       |

**Total Items**:
- **ADMIN**: 16 items (all)
- **HR**: 10 items (no advanced modules)
- **MANAGER**: 8 items
- **EMPLOYEE**: 7 items

---

## Color Coding

### Background Colors
- **Active Item**: Dark gray (`bg-gray-800`)
- **Inactive Item**: Transparent, hover gray (`hover:bg-gray-800`)
- **Sidebar**: Dark (`bg-gray-900`)

### Text Colors
- **Active Item**: White (`text-white`)
- **Inactive Item**: Light gray (`text-gray-300`)
- **Section Header**: Gray uppercase (`text-gray-400`)
- **User Info**: White & gray

### Badge
- **Background**: Green (`bg-green-500`)
- **Text**: White
- **Size**: Extra small (`text-xs`)
- **Shape**: Rounded full pill

---

## Interactive States

### Hover State
```
Before Hover:
  text-gray-300 bg-transparent

On Hover:
  text-white bg-gray-800
```

### Active State
```
When Current Page:
  text-white bg-gray-800
```

### Badge Visibility
```
Visible on: All 6 advanced modules
Text: "New"
Color: Green with white text
Position: Right side of menu item
```

---

## Responsive Behavior

- **Width**: Fixed at 256px (w-64)
- **Height**: Full screen (h-screen)
- **Scroll**: Navigation area scrolls if content overflows
- **Position**: Fixed left side

---

## Icons Used

| Module | Icon | Heroicon Name |
|--------|------|---------------|
| Dashboard | 🏠 | HomeIcon |
| Employees | 👥 | UsersIcon |
| Onboarding | 👤 | UserGroupIcon |
| Departments | 🏢 | BuildingOfficeIcon |
| Leaves | 📅 | CalendarIcon |
| Attendance | 🕐 | ClockIcon |
| Payroll | 💰 | CurrencyDollarIcon |
| **Workflows** | 🔲 | Squares2X2Icon |
| **Advance Requests** | 💵 | BanknotesIcon |
| **Ticket Requests** | 🎫 | TicketIcon |
| **Biometric Devices** | 👆 | FingerprintIcon |
| **Recruitment** | 💼 | BriefcaseIcon |
| **ERP Integration** | 🔄 | ArrowPathIcon |
| Reports | 📊 | ChartBarIcon |
| Audit Logs | ⚙️ | Cog6ToothIcon |
| User Management | 👥 | UserGroupIcon |
| Logout | ➡️ | ArrowRightOnRectangleIcon |

All icons are 24x24px outline style from Heroicons.

---

## Implementation Notes

### Role Filtering Logic
```typescript
const filteredNavigation = navigation.filter(item => 
  !item.roles || item.roles.includes(user?.role || '')
);
```

### Section Divider Logic
```typescript
const showDivider = 
  index > 0 && 
  filteredNavigation[index - 1]?.href === '/payroll' && 
  item.href === '/workflows';
```

The divider appears between "Payroll" and "Workflows" for ADMIN users only.

---

**Last Updated**: January 2026  
**Component**: `components/layout/Sidebar.tsx`  
**Status**: ✅ Production Ready
