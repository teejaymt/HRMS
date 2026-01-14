'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import {
  HomeIcon,
  UsersIcon,
  BuildingOfficeIcon,
  CalendarIcon,
  ClockIcon,
  CurrencyDollarIcon,
  ArrowRightOnRectangleIcon,
  UserGroupIcon,
  Cog6ToothIcon,
  ChartBarIcon,
  BanknotesIcon,
  TicketIcon,
  FingerPrintIcon,
  BriefcaseIcon,
  ArrowPathIcon,
  Squares2X2Icon,
} from '@heroicons/react/24/outline';

interface NavigationItem {
  name: string;
  href: string;
  icon: any;
  roles: string[];
  badge?: string;
}

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const navigation: NavigationItem[] = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon, roles: ['ADMIN', 'HR', 'MANAGER', 'EMPLOYEE'] },
    { name: 'Employees', href: '/employees', icon: UsersIcon, roles: ['ADMIN', 'HR', 'MANAGER', 'EMPLOYEE'] },
    { name: 'Onboarding', href: '/onboarding', icon: UserGroupIcon, roles: ['ADMIN', 'HR'] },
    { name: 'Departments', href: '/departments', icon: BuildingOfficeIcon, roles: ['ADMIN', 'HR', 'MANAGER', 'EMPLOYEE'] },
    { name: 'Leaves', href: '/leaves', icon: CalendarIcon, roles: ['ADMIN', 'HR', 'MANAGER', 'EMPLOYEE'] },
    { name: 'Attendance', href: '/attendance', icon: ClockIcon, roles: ['ADMIN', 'HR', 'MANAGER', 'EMPLOYEE'] },
    { name: 'Payroll', href: '/payroll', icon: CurrencyDollarIcon, roles: ['ADMIN', 'HR', 'MANAGER', 'EMPLOYEE'] },
    
    // Advanced Modules (Admin Only)
    { name: 'Workflows', href: '/workflows', icon: Squares2X2Icon, roles: ['ADMIN'], badge: 'New' },
    { name: 'Advance Requests', href: '/advance-requests', icon: BanknotesIcon, roles: ['ADMIN'], badge: 'New' },
    { name: 'Ticket Requests', href: '/ticket-requests', icon: TicketIcon, roles: ['ADMIN'], badge: 'New' },
    { name: 'Biometric Devices', href: '/biometric', icon: FingerPrintIcon, roles: ['ADMIN'], badge: 'New' },
    { name: 'Recruitment', href: '/recruitment', icon: BriefcaseIcon, roles: ['ADMIN'], badge: 'New' },
    { name: 'ERP Integration', href: '/erp-integration', icon: ArrowPathIcon, roles: ['ADMIN'], badge: 'New' },
    
    { name: 'Reports & Analytics', href: '/reports', icon: ChartBarIcon, roles: ['ADMIN', 'HR', 'MANAGER'] },
    { name: 'Audit Logs', href: '/audit-logs', icon: Cog6ToothIcon, roles: ['ADMIN', 'HR'] },
    { name: 'User Management', href: '/admin/users', icon: UserGroupIcon, roles: ['ADMIN', 'HR'] },
  ];

  // Filter navigation based on user role
  const filteredNavigation = navigation.filter(item => 
    !item.roles || item.roles.includes(user?.role || '')
  );

  return (
    <div className="flex h-screen w-64 flex-col bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 text-white shadow-2xl">
      <div className="flex h-20 items-center px-4 border-b border-cyan-500/20 bg-slate-900/50">
        <img src="/logo-icon.svg" alt="BOA Logo" className="h-12 w-12 mr-3" />
        <div>
          <h1 className="text-lg font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">Business on Air</h1>
          <p className="text-xs text-cyan-300/80">HRMS</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto scrollbar-thin">
        {filteredNavigation.map((item, index) => {
          const isActive = pathname === item.href;
          const showDivider = index > 0 && filteredNavigation[index - 1]?.href === '/payroll' && item.href === '/workflows';
          
          return (
            <div key={item.name}>
              {showDivider && (
                <div className="my-4 border-t border-cyan-500/20 pt-4">
                  <p className="px-3 text-xs font-semibold text-cyan-400 uppercase tracking-wider">
                    Advanced Modules
                  </p>
                </div>
              )}
              <Link
                href={item.href}
                className={`${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/20'
                    : 'text-slate-300 hover:bg-slate-700/70 hover:text-white hover:shadow-md'
                } group flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200`}
              >
                <div className="flex items-center">
                  <item.icon className={`mr-3 h-5 w-5 ${isActive ? 'text-white' : 'text-cyan-400'}`} aria-hidden="true" />
                  {item.name}
                </div>
                {item.badge && (
                  <span className="inline-flex items-center rounded-full bg-gradient-to-r from-orange-500 to-pink-500 px-2 py-0.5 text-xs font-bold text-white shadow-lg animate-pulse">
                    {item.badge}
                  </span>
                )}
              </Link>
            </div>
          );
        })}
      </nav>

      <div className="border-t border-cyan-500/20 p-4 bg-slate-900/80">
        <div className="mb-3 bg-slate-800/50 rounded-lg p-3 border border-cyan-500/10">
          <p className="text-sm font-medium text-white">{user?.email || 'Not logged in'}</p>
          <p className="text-xs text-cyan-400 mt-1">{user?.role || 'No role'}</p>
        </div>
        <button
          onClick={logout}
          className="flex w-full items-center rounded-lg bg-gradient-to-r from-red-500 to-red-600 px-3 py-2.5 text-sm font-medium text-white hover:from-red-600 hover:to-red-700 shadow-lg hover:shadow-red-500/50 transition-all duration-200"
        >
          <ArrowRightOnRectangleIcon className="mr-3 h-5 w-5" />
          Logout
        </button>
        <div className="mt-4 pt-4 border-t border-cyan-500/20 text-center">
          <p className="text-xs text-cyan-400/70">© 2026 Business on Air</p>
          <p className="text-xs text-slate-500 mt-1">v1.0.0</p>
        </div>
      </div>
    </div>
  );
}
