import { Link, useNavigate } from "@tanstack/react-router";
import { CreditCard, LifeBuoy, LogOut, Settings, User } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { InitialsAvatar } from "@/components/shared/InitialsAvatar";
import { signOut, useDemoAccount } from "@/lib/demo-auth";

export function UserMenu() {
  const user = useDemoAccount();
  const navigate = useNavigate();
  if (!user) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring">
        <InitialsAvatar initials={user.initials} size="sm" />
        <span className="hidden min-w-0 flex-col items-start leading-tight md:flex">
          <span className="truncate text-sm font-medium text-foreground">
            {user.name}
          </span>
          <span className="truncate text-xs text-muted-foreground">{user.title}</span>
        </span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col">
            <span className="text-sm font-medium">{user.name}</span>
            <span className="text-xs font-normal text-muted-foreground">{user.email}</span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/settings">
            <User className="mr-2 h-4 w-4" /> Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/settings">
            <Settings className="mr-2 h-4 w-4" /> Settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/billing">
            <CreditCard className="mr-2 h-4 w-4" /> Billing
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/support">
            <LifeBuoy className="mr-2 h-4 w-4" /> Support
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-destructive focus:text-destructive" onSelect={() => { signOut(); void navigate({ to: "/", replace: true }); }}>
          <LogOut className="mr-2 h-4 w-4" /> Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
