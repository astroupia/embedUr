'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import {
  HomeIcon,
  MegaphoneIcon,
  UsersIcon,
  CogIcon,
  ChartBarIcon,
  DocumentTextIcon,
  PlusIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'Campaigns', href: '/dashboard/campaigns', icon: MegaphoneIcon },
  { name: 'Leads', href: '/dashboard/leads', icon: UsersIcon },
  { name: 'Workflows', href: '/dashboard/workflows', icon: CogIcon },
  { name: 'Analytics', href: '/dashboard/analytics', icon: ChartBarIcon },
  { name: 'Templates', href: '/dashboard/templates', icon: DocumentTextIcon },
];

const adminNavigation = [
  { name: 'Admin', href: '/dashboard/admin', icon: CogIcon },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile sidebar overlay */}
      <div className="lg:hidden">
        <div className="fixed inset-0 z-40 flex">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" />
          <div className="relative flex w-full max-w-xs flex-1 flex-col bg-white">
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <button
                type="button"
                className="ml-1 flex h-10 w-10 items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              >
                <span className="sr-only">Close sidebar</span>
                <ChevronLeftIcon className="h-6 w-6 text-white" />
              </button>
            </div>
            <SidebarContent />
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex min-h-0 flex-1 flex-col border-r border-gray-200 bg-white">
          <SidebarContent collapsed={collapsed} setCollapsed={setCollapsed} />
        </div>
      </div>
    </>
  );
}

function SidebarContent({ collapsed, setCollapsed }: { collapsed?: boolean; setCollapsed?: (collapsed: boolean) => void }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Logo */}
      <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
        <div className="flex flex-shrink-0 items-center px-4">
          <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center">
            <span className="text-white font-bold text-sm">E</span>
          </div>
          {!collapsed && (
            <h1 className="ml-3 text-xl font-semibold text-gray-900">EmbedUr</h1>
          )}
        </div>

        {/* Navigation */}
        <nav className="mt-5 flex-1 space-y-1 px-2">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                isActive(item.href)
                  ? 'bg-blue-100 text-blue-900'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <item.icon
                className={`mr-3 h-6 w-6 flex-shrink-0 ${
                  isActive(item.href) ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                }`}
              />
              {!collapsed && item.name}
            </Link>
          ))}

          {/* Admin navigation */}
          {user?.role === 'ADMIN' && (
            <>
              <div className="pt-4">
                <div className="px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Admin
                </div>
              </div>
              {adminNavigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                    isActive(item.href)
                      ? 'bg-red-100 text-red-900'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <item.icon
                    className={`mr-3 h-6 w-6 flex-shrink-0 ${
                      isActive(item.href) ? 'text-red-500' : 'text-gray-400 group-hover:text-gray-500'
                    }`}
                  />
                  {!collapsed && item.name}
                </Link>
              ))}
            </>
          )}
        </nav>
      </div>

      {/* User menu */}
      <div className="flex flex-shrink-0 border-t border-gray-200 p-4">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
              <span className="text-sm font-medium text-gray-700">
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </span>
            </div>
          </div>
          {!collapsed && (
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-700">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>
          )}
        </div>
        {setCollapsed && (
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="ml-auto flex-shrink-0 p-1 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
          >
            {collapsed ? (
              <ChevronRightIcon className="h-5 w-5" />
            ) : (
              <ChevronLeftIcon className="h-5 w-5" />
            )}
          </button>
        )}
      </div>
    </>
  );
} 