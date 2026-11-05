import {
  BadgeDollarSign,
  BarChart3,
  BookOpen,
  Briefcase,
  Building2,
  CalendarClock,
  CreditCard,
  FileText,
  Gauge,
  Gift,
  GraduationCap,
  Headphones,
  LayoutDashboard,
  LifeBuoy,
  LineChart,
  Settings,
  ShieldCheck,
  Store,
  TicketCheck,
  TrendingUp,
  UserSquare,
  Users,
  UsersRound,
  Workflow,
  Star,
  FilePen,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  title: string;
  to: string;
  icon: LucideIcon;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

export const navGroups: NavGroup[] = [
  {
    label: "Client",
    items: [
      { title: "Dashboard", to: "/dashboard", icon: LayoutDashboard },
      { title: "My Cyberbackers", to: "/my-cyberbackers", icon: Users },
      { title: "Hiring Marketplace", to: "/marketplace", icon: Store },
      { title: "Job Description Builder", to: "/job-builder", icon: FilePen },
      { title: "Reviews & Ratings", to: "/reviews", icon: Star },
      { title: "Attendance", to: "/attendance", icon: CalendarClock },
      { title: "Performance Reports", to: "/performance", icon: TrendingUp },
      { title: "Support Center", to: "/support", icon: LifeBuoy },
      { title: "Knowledge Base", to: "/knowledge-base", icon: BookOpen },
      { title: "Cyberbacker University", to: "/cyberbacker-university", icon: GraduationCap },
      { title: "Contracts", to: "/contracts", icon: FileText },
      { title: "Billing", to: "/billing", icon: CreditCard },
      { title: "Rewards & Coupons", to: "/rewards", icon: Gift },
      { title: "Settings", to: "/settings", icon: Settings },
    ],
  },
  {
    label: "Internal",
    items: [
      { title: "Operations Dashboard", to: "/internal", icon: LayoutDashboard },
      { title: "Client Management", to: "/internal/clients", icon: Building2 },
      { title: "Cyberbacker Management", to: "/internal/cyberbackers", icon: UserSquare },
      { title: "Recruitment Pipeline", to: "/internal/recruitment", icon: Workflow },
      { title: "Support Tickets", to: "/internal/tickets", icon: TicketCheck },
      { title: "Knowledge Base", to: "/internal/knowledge-base", icon: BookOpen },
      { title: "Finance Dashboard", to: "/internal/finance", icon: BadgeDollarSign },
      { title: "Analytics Dashboard", to: "/internal/analytics", icon: BarChart3 },
      { title: "Executive Dashboard", to: "/internal/executive", icon: Gauge },
      { title: "System Administration", to: "/internal/admin", icon: ShieldCheck },
      { title: "User Management", to: "/internal/users", icon: UsersRound },
    ],
  },
];

// Re-exported for use elsewhere if needed.
export const navIcons = {
  Briefcase,
  Headphones,
  LineChart,
};
