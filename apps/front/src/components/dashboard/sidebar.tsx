"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  BarChart3,
  Mail,
  Users,
  Settings,
  LayoutDashboard,
  TrendingUp,
  Layers,
} from "lucide-react";

const navLinks = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Leads",
    href: "/dashboard/leads",
    icon: Users,
  },
  {
    label: "Campaigns",
    href: "/dashboard/campaigns",
    icon: Mail,
  },
  {
    label: "Analytics",
    href: "/dashboard/analytics",
    icon: BarChart3,
  },
  {
    label: "Templates",
    href: "/dashboard/templates",
    icon: Layers,
  },
  {
    label: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="hidden md:flex flex-col w-64 h-screen bg-white dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800 shadow-sm py-6 px-4 fixed top-0 left-0 z-30">
      <div className="flex items-center gap-2 mb-10 px-2">
        <div className="bg-gradient-to-tr from-primary to-blue-500 rounded-lg p-2">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="2" y="2" width="20" height="20" rx="6" fill="currentColor" className="text-primary" />
            <path d="M7 9.5L12 13L17 9.5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <span className="font-extrabold text-xl tracking-tight text-zinc-900 dark:text-white">Embedur</span>
      </div>
      <nav className="flex-1 space-y-2">
        {navLinks.map((link) => {
          const Icon = link.icon;
          const active = pathname === link.href || (link.href !== "/dashboard" && pathname.startsWith(link.href));
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-colors",
                active
                  ? "bg-primary/10 text-primary dark:bg-primary/20"
                  : "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-900"
              )}
            >
              <Icon className="h-5 w-5" />
              <span>{link.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto text-xs text-zinc-400 px-2 pt-8">&copy; {new Date().getFullYear()} Embedur</div>
    </aside>
  );
} 