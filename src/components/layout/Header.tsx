import { Moon, Sun, LogOut, Workflow } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useNavigate } from "react-router-dom";
import { useGetProfile } from "@/services/auth.service";

import { ROLES, PERMISSIONS } from "@/constants/common";

export function Header() {
  const { theme, toggleTheme } = useTheme();
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const { data: user } = useGetProfile();

  return (
    <header className="h-16 min-h-16 border-b border-border bg-card flex items-center justify-between px-6 sticky top-0 z-10">
      <div className="flex items-center gap-4">
        <SidebarTrigger />
        <h1 className="text-xl font-semibold text-foreground">WhatsApp Webhook Manager</h1>
      </div>

      <div className="flex items-center gap-2">
        {(user?.role === ROLES.ADMIN || user?.permissions?.includes(PERMISSIONS.FLOW_BUILDER)) && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/flow-builder")}
            className="hidden md:flex gap-2"
          >
            <Workflow className="w-4 h-4" />
            Open Flow Builder
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="hover:bg-accent"
        >
          {theme === "light" ? (
            <Moon className="h-5 w-5" />
          ) : (
            <Sun className="h-5 w-5" />
          )}
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={signOut}
          className="hover:bg-accent"
        >
          <LogOut className="h-5 w-5" />
        </Button>

        {user && (
          <div className="flex flex-col items-end ml-2 px-2 border-l border-border">
            <span className="text-xs font-medium text-foreground">{user.name}</span>
            <span className="text-[10px] text-muted-foreground leading-none capitalize">{user.role}</span>
          </div>
        )}
      </div>
    </header>
  );
}