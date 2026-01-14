# Frontend Coding Standards (Next.js)

## 📋 Table of Contents
1. [App Router Structure](#app-router-structure)
2. [Page Components](#page-components)
3. [Client vs Server Components](#client-vs-server-components)
4. [State Management](#state-management)
5. [API Integration](#api-integration)
6. [Styling with Tailwind](#styling-with-tailwind)
7. [TypeScript Standards](#typescript-standards)
8. [Form Handling](#form-handling)
9. [Error Handling](#error-handling)
10. [Performance Optimization](#performance-optimization)

## 🗂️ App Router Structure

### Directory Organization
```
app/
├── layout.tsx              # Root layout
├── page.tsx                # Home page
├── globals.css             # Global styles
├── auth/
│   └── login/
│       └── page.tsx        # Login page
├── dashboard/
│   └── page.tsx            # Dashboard page
├── employees/
│   ├── page.tsx            # Employee list
│   ├── [id]/
│   │   └── page.tsx        # Employee detail
│   └── new/
│       └── page.tsx        # Create employee
```

### Route Conventions
- **Folders** define route segments
- **page.tsx** creates a publicly accessible route
- **layout.tsx** creates shared UI for segments
- **[id]** creates dynamic route segments
- **loading.tsx** for loading states
- **error.tsx** for error boundaries

## 📄 Page Components

### Page Template
```typescript
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

export default function EmployeesPage() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchEmployees();
  }, []);

  async function fetchEmployees() {
    try {
      setLoading(true);
      const data = await api.employees.getAll();
      setEmployees(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Employees</h1>
        <button
          onClick={() => router.push('/employees/new')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg"
        >
          Add Employee
        </button>
      </div>

      <div className="grid gap-4">
        {employees.map((employee) => (
          <EmployeeCard key={employee.id} employee={employee} />
        ))}
      </div>
    </div>
  );
}
```

### Dynamic Route Template
```typescript
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';

export default function EmployeeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetchEmployee(params.id as string);
    }
  }, [params.id]);

  async function fetchEmployee(id: string) {
    try {
      const data = await api.employees.getOne(parseInt(id));
      setEmployee(data);
    } catch (error) {
      console.error('Failed to fetch employee:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <LoadingSpinner />;
  if (!employee) return <NotFound />;

  return (
    <div className="p-6">
      <h1>{employee.firstName} {employee.lastName}</h1>
      {/* Employee details */}
    </div>
  );
}
```

## ⚡ Client vs Server Components

### Use 'use client' When You Need:
- React hooks (useState, useEffect, etc.)
- Event handlers (onClick, onChange, etc.)
- Browser APIs (localStorage, window, etc.)
- Context providers/consumers
- Client-side libraries

```typescript
'use client';

import { useState } from 'react';

export default function Counter() {
  const [count, setCount] = useState(0);
  
  return (
    <button onClick={() => setCount(count + 1)}>
      Count: {count}
    </button>
  );
}
```

### Server Components (Default)
```typescript
// No 'use client' directive - this is a server component
async function EmployeesList() {
  // Can fetch data directly
  const employees = await fetchEmployees();
  
  return (
    <div>
      {employees.map(emp => (
        <div key={emp.id}>{emp.name}</div>
      ))}
    </div>
  );
}
```

### Best Practice
- **Start with Server Components** - Only add 'use client' when necessary
- **Keep client boundaries small** - Move interactivity to smaller components
- **Fetch on server when possible** - Better performance and SEO

## 🔄 State Management

### Local State (useState)
```typescript
'use client';

import { useState } from 'react';

export default function SearchBar() {
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ status: 'ACTIVE' });

  return (
    <input
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      placeholder="Search..."
    />
  );
}
```

### Context API for Shared State
```typescript
// lib/auth-context.tsx
'use client';

import { createContext, useContext, useState, useEffect } from 'react';

interface AuthContextType {
  user: any | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any | null>(null);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (token) {
      // Fetch user data
      fetchUser();
    }
  }, []);

  async function login(email: string, password: string) {
    const response = await api.auth.login({ email, password });
    localStorage.setItem('token', response.access_token);
    setUser(response.user);
  }

  function logout() {
    localStorage.removeItem('token');
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
```

### Using Context
```typescript
'use client';

import { useAuth } from '@/lib/auth-context';

export default function ProfilePage() {
  const { user, logout } = useAuth();

  return (
    <div>
      <h1>Welcome, {user?.name}</h1>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

## 🌐 API Integration

### API Client Structure
```typescript
// lib/api.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

class ApiClient {
  private baseURL: string;

  constructor() {
    this.baseURL = API_BASE_URL;
  }

  private async request<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> {
    const token = typeof window !== 'undefined' 
      ? localStorage.getItem('token') 
      : null;
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options?.headers,
    };

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ 
        message: 'An error occurred' 
      }));
      throw new Error(error.message || 'Request failed');
    }

    return response.json();
  }

  // Auth
  auth = {
    login: (data: { email: string; password: string }) =>
      this.request('/auth/login', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    register: (data: any) =>
      this.request('/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  };

  // Employees
  employees = {
    getAll: (filters?: any) => {
      const params = new URLSearchParams(filters).toString();
      return this.request(`/employees?${params}`);
    },

    getOne: (id: number) =>
      this.request(`/employees/${id}`),

    create: (data: any) =>
      this.request('/employees', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    update: (id: number, data: any) =>
      this.request(`/employees/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),

    delete: (id: number) =>
      this.request(`/employees/${id}`, {
        method: 'DELETE',
      }),
  };

  // Add more resources as needed
}

const api = new ApiClient();
export default api;
```

### Using the API Client
```typescript
'use client';

import { useState } from 'react';
import api from '@/lib/api';

export default function CreateEmployeePage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(data: any) {
    try {
      setLoading(true);
      setError(null);
      await api.employees.create(data);
      router.push('/employees');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
    </form>
  );
}
```

## 🎨 Styling with Tailwind

### Tailwind Best Practices

#### 1. Use Utility Classes
```typescript
// GOOD
<div className="flex items-center justify-between p-4 bg-white rounded-lg shadow">
  <h2 className="text-xl font-semibold text-gray-900">Title</h2>
  <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
    Action
  </button>
</div>

// AVOID - Don't create custom CSS classes unless necessary
```

#### 2. Responsive Design
```typescript
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Mobile: 1 column, Tablet: 2 columns, Desktop: 3 columns */}
</div>

<div className="text-sm md:text-base lg:text-lg">
  {/* Responsive text sizing */}
</div>
```

#### 3. Consistent Spacing
```typescript
// Use consistent spacing scale
<div className="p-4">       {/* Padding */}
<div className="m-4">       {/* Margin */}
<div className="space-y-4"> {/* Vertical spacing between children */}
<div className="gap-4">     {/* Grid/Flex gap */}
```

#### 4. Color Palette
```typescript
// Use semantic colors
<div className="bg-blue-600">      {/* Primary */}
<div className="bg-green-600">     {/* Success */}
<div className="bg-red-600">       {/* Danger */}
<div className="bg-yellow-600">    {/* Warning */}
<div className="bg-gray-600">      {/* Neutral */}
```

#### 5. Component Composition
```typescript
// Extract repeated patterns
const buttonClasses = "px-4 py-2 rounded-lg font-medium transition-colors";
const primaryButton = `${buttonClasses} bg-blue-600 text-white hover:bg-blue-700`;
const secondaryButton = `${buttonClasses} bg-gray-200 text-gray-900 hover:bg-gray-300`;

<button className={primaryButton}>Primary</button>
<button className={secondaryButton}>Secondary</button>
```

## 📘 TypeScript Standards

### Component Props
```typescript
interface EmployeeCardProps {
  employee: {
    id: number;
    firstName: string;
    lastName: string;
    position: string;
    department?: {
      name: string;
    };
  };
  onEdit?: (id: number) => void;
  onDelete?: (id: number) => void;
}

export default function EmployeeCard({ 
  employee, 
  onEdit, 
  onDelete 
}: EmployeeCardProps) {
  return (
    <div>
      <h3>{employee.firstName} {employee.lastName}</h3>
      <p>{employee.position}</p>
    </div>
  );
}
```

### Type Imports
```typescript
// Import types from Prisma
import type { Employee, Department } from '@prisma/client';

// Create composite types
type EmployeeWithDepartment = Employee & {
  department: Department;
};

// Use in components
function EmployeeList({ employees }: { employees: EmployeeWithDepartment[] }) {
  // ...
}
```

### Event Handlers
```typescript
function handleClick(e: React.MouseEvent<HTMLButtonElement>) {
  e.preventDefault();
  // ...
}

function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
  setValue(e.target.value);
}

function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
  e.preventDefault();
  // ...
}
```

## 📝 Form Handling

### Controlled Form Template
```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

export default function CreateEmployeeForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    position: '',
    departmentId: '',
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);
      await api.employees.create(formData);
      router.push('/employees');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium mb-1">
          First Name
        </label>
        <input
          type="text"
          name="firstName"
          value={formData.firstName}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border rounded-lg"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          Email
        </label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border rounded-lg"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          Department
        </label>
        <select
          name="departmentId"
          value={formData.departmentId}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border rounded-lg"
        >
          <option value="">Select Department</option>
          {/* Map departments */}
        </select>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50"
      >
        {loading ? 'Creating...' : 'Create Employee'}
      </button>
    </form>
  );
}
```

### Form Validation
```typescript
function validateForm(data: any) {
  const errors: any = {};

  if (!data.email.includes('@')) {
    errors.email = 'Invalid email format';
  }

  if (data.password.length < 8) {
    errors.password = 'Password must be at least 8 characters';
  }

  return errors;
}
```

## ⚠️ Error Handling

### Error Boundary
```typescript
'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h2 className="text-2xl font-bold mb-4">Something went wrong!</h2>
      <button
        onClick={reset}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg"
      >
        Try again
      </button>
    </div>
  );
}
```

### Error Message Component
```typescript
interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
  return (
    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
      <p className="text-red-600">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-2 text-sm text-red-600 underline"
        >
          Retry
        </button>
      )}
    </div>
  );
}
```

## ⚡ Performance Optimization

### Loading States
```typescript
// loading.tsx
export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
    </div>
  );
}
```

### Lazy Loading
```typescript
import dynamic from 'next/dynamic';

const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <p>Loading...</p>,
  ssr: false, // Disable server-side rendering if needed
});
```

### Memoization
```typescript
import { useMemo, useCallback } from 'react';

function EmployeeList({ employees }) {
  // Memoize expensive calculations
  const sortedEmployees = useMemo(() => {
    return employees.sort((a, b) => a.name.localeCompare(b.name));
  }, [employees]);

  // Memoize callbacks
  const handleDelete = useCallback((id: number) => {
    // Delete logic
  }, []);

  return (
    <div>
      {sortedEmployees.map(emp => (
        <EmployeeCard 
          key={emp.id} 
          employee={emp}
          onDelete={handleDelete}
        />
      ))}
    </div>
  );
}
```

## 📚 Common Patterns

### Data Table Pattern
```typescript
interface Column {
  key: string;
  label: string;
  render?: (value: any, row: any) => React.ReactNode;
}

interface DataTableProps {
  columns: Column[];
  data: any[];
}

export function DataTable({ columns, data }: DataTableProps) {
  return (
    <table className="w-full border-collapse">
      <thead>
        <tr className="bg-gray-100">
          {columns.map((col) => (
            <th key={col.key} className="p-3 text-left">
              {col.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row, i) => (
          <tr key={i} className="border-t">
            {columns.map((col) => (
              <td key={col.key} className="p-3">
                {col.render 
                  ? col.render(row[col.key], row)
                  : row[col.key]
                }
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

### Modal Pattern
```typescript
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black opacity-50" onClick={onClose} />
      <div className="relative bg-white rounded-lg p-6 max-w-lg w-full">
        <h2 className="text-xl font-bold mb-4">{title}</h2>
        {children}
      </div>
    </div>
  );
}
```

---

**Next**: [Database & Prisma Conventions](04-database-standards.md)
