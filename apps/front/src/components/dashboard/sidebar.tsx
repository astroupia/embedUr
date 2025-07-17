"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  BarChart3,
  Mail,
  Users,
  Settings,
  LayoutDashboard,
  TrendingUp,
  Layers,
  Menu,
  MessageSquare,
  Target,
  Activity,
  Bot,
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
    label: "Target Audience",
    href: "/dashboard/target-audience",
    icon: Target,
  },
  {
    label: "AI Personas",
    href: "/dashboard/ai-personas",
    icon: Bot,
  },
  {
    label: "Inbox",
    href: "/dashboard/inbox",
    icon: MessageSquare,
  },
  {
    label: "Analytics",
    href: "/dashboard/analytics",
    icon: BarChart3,
  },
  {
    label: "Questionnaire",
    href: "/dashboard/questionnaire",
    icon: Target,
  },
  {
    label: "Usage",
    href: "/dashboard/usage",
    icon: Activity,
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
    <aside className="hidden md:flex flex-col w-64 h-screen bg-background border-r fixed top-0 left-0 z-30">
      <SidebarContent />
    </aside>
  );
}

function SidebarContent() {
  const pathname = usePathname();
  
  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex h-16 items-center border-b px-6">
        <div className="flex items-center gap-2">
          <div className="bg-gradient-to-tr from-primary to-blue-500 rounded-lg p-2">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="2" y="2" width="20" height="20" rx="6" fill="currentColor" className="text-primary" />
              <path d="M7 9.5L12 13L17 9.5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="font-bold text-lg tracking-tight">Embedur</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4">
        <div className="space-y-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const active = pathname === link.href || (link.href !== "/dashboard" && pathname.startsWith(link.href));
            
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                  active
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                {link.label}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="border-t p-4">
        <div className="text-xs text-muted-foreground text-center">
          &copy; {new Date().getFullYear()} Embedur
        </div>
      </div>
    </div>
  );
} 