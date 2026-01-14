const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

class ApiClient {
  private baseURL: string;

  constructor() {
    this.baseURL = API_BASE_URL;
  }

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options?.headers,
    };

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'An error occurred' }));
        throw new Error(error.message || 'Request failed');
      }

      return response.json();
    } catch (error: any) {
      // Handle network errors or fetch failures
      if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
        throw new Error(`Cannot connect to server at ${this.baseURL}. Please make sure the backend server is running.`);
      }
      throw error;
    }
  }

  // Auth
  async register(data: { email: string; password: string; role?: string }) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async login(data: { email: string; password: string }) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Users
  async getUsers() {
    return this.request('/auth/users');
  }

  async getUserById(id: number) {
    return this.request(`/auth/users/${id}`);
  }

  async updateUser(id: number, data: { email?: string; role?: string; isActive?: boolean; password?: string }) {
    return this.request(`/auth/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteUser(id: number) {
    return this.request(`/auth/users/${id}`, {
      method: 'DELETE',
    });
  }

  async toggleUserActive(id: number) {
    return this.request(`/auth/users/${id}/toggle-active`, {
      method: 'PATCH',
    });
  }

  // Employees
  async getEmployees(params?: { departmentId?: number; status?: string; search?: string }) {
    const query = new URLSearchParams(params as any).toString();
    return this.request(`/employees?${query}`);
  }

  async getEmployee(id: number) {
    return this.request(`/employees/${id}`);
  }

  async getEmployeeById(id: number) {
    return this.request(`/employees/${id}`);
  }

  async createEmployee(data: any) {
    return this.request('/employees', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateEmployee(id: number, data: any) {
    return this.request(`/employees/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteEmployee(id: number) {
    return this.request(`/employees/${id}`, {
      method: 'DELETE',
    });
  }

  async getEmployeeStats() {
    return this.request('/employees/stats');
  }

  // Departments
  async getDepartmentById(id: number) {
    return this.request(`/departments/${id}`);
  }

  async getDepartments() {
    return this.request('/departments');
  }

  async createDepartment(data: { 
    name: string; 
    nameArabic?: string;
    description?: string;
    saudiCount?: number;
    nonSaudiCount?: number;
  }) {
    return this.request('/departments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateDepartment(id: number, data: any) {
    return this.request(`/departments/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteDepartment(id: number) {
    return this.request(`/departments/${id}`, {
      method: 'DELETE',
    });
  }

  // Leaves
  async getLeaves(params?: { employeeId?: number; status?: string }) {
    const query = new URLSearchParams(params as any).toString();
    return this.request(`/leaves?${query}`);
  }

  async getLeaveById(id: number) {
    return this.request(`/leaves/${id}`);
  }

  async createLeave(data: any) {
    return this.request('/leaves', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateLeave(id: number, data: any) {
    return this.request(`/leaves/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteLeave(id: number) {
    return this.request(`/leaves/${id}`, {
      method: 'DELETE',
    });
  }

  async approveLeave(id: number, approvedBy: string) {
    return this.request(`/leaves/${id}/approve`, {
      method: 'PATCH',
      body: JSON.stringify({ approvedBy }),
    });
  }

  async rejectLeave(id: number, rejectedBy: string, comments?: string) {
    return this.request(`/leaves/${id}/reject`, {
      method: 'PATCH',
      body: JSON.stringify({ rejectedBy, comments }),
    });
  }

  // Attendance
  async checkIn(employeeId: number) {
    return this.request('/attendance/check-in', {
      method: 'POST',
      body: JSON.stringify({ employeeId }),
    });
  }

  async checkOut(employeeId: number) {
    return this.request('/attendance/check-out', {
      method: 'POST',
      body: JSON.stringify({ employeeId }),
    });
  }

  async getAttendance(params?: { employeeId?: number; startDate?: string; endDate?: string }) {
    const query = new URLSearchParams(params as any).toString();
    return this.request(`/attendance?${query}`);
  }

  async getAttendances(params?: { employeeId?: number; startDate?: string; endDate?: string }) {
    const query = new URLSearchParams(params as any).toString();
    return this.request(`/attendance?${query}`);
  }

  async getAttendanceById(id: number) {
    return this.request(`/attendance/${id}`);
  }

  async updateAttendance(id: number, data: any) {
    return this.request(`/attendance/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteAttendance(id: number) {
    return this.request(`/attendance/${id}`, {
      method: 'DELETE',
    });
  }

  // Payroll
  async getPayroll(params?: { employeeId?: number; year?: number; month?: number }) {
    const query = new URLSearchParams(params as any).toString();
    return this.request(`/payroll?${query}`);
  }

  async createPayroll(data: any) {
    return this.request('/payroll', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async createBulkPayroll(data: {
    payrolls: any[];
    processedBy: string;
    month: number;
    year: number;
  }) {
    return this.request('/payroll/bulk', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getPayrollAuditLogs(params?: { month?: number; year?: number; processType?: string }) {
    const query = new URLSearchParams(params as any).toString();
    return this.request(`/payroll/audit-logs?${query}`);
  }

  async markPayrollAsPaid(id: number, paymentMethod: string) {
    return this.request(`/payroll/${id}/paid`, {
      method: 'PATCH',
      body: JSON.stringify({ paymentMethod }),
    });
  }

  async deletePayrollByMonthYear(year: number, month: number) {
    return this.request(`/payroll/month/${year}/${month}`, {
      method: 'DELETE',
    });
  }

  async deletePayroll(id: number) {
    return this.request(`/payroll/${id}`, {
      method: 'DELETE',
    });
  }

  // Onboarding
  async getOnboardings(params?: { status?: string }) {
    const query = new URLSearchParams(params as any).toString();
    return this.request(`/onboarding?${query}`);
  }

  async getOnboarding(id: number) {
    return this.request(`/onboarding/${id}`);
  }

  async createOnboarding(data: any) {
    return this.request('/onboarding', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateOnboarding(id: number, data: any) {
    return this.request(`/onboarding/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteOnboarding(id: number) {
    return this.request(`/onboarding/${id}`, {
      method: 'DELETE',
    });
  }

  async completeOnboarding(id: number, completedBy: string) {
    return this.request(`/onboarding/${id}/complete`, {
      method: 'POST',
      body: JSON.stringify({ completedBy }),
    });
  }
}

export const api = new ApiClient();
