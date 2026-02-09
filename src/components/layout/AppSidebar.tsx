import { BarChart3, Users, Settings, Bot, Workflow, UserCog } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useGetProfile } from "@/services/auth.service";
import { useMemo } from "react";

import { ROLES, PERMISSIONS } from "@/constants/common";

export function AppSidebar() {
  const { open } = useSidebar();
  const location = useLocation();
  const { data: user } = useGetProfile();

  const items = useMemo(() => {
    const allItems = [
      { title: "Analytics", url: "/", icon: BarChart3, permission: PERMISSIONS.ANALYTICS },
      { title: "Clients", url: "/clients", icon: Users, permission: PERMISSIONS.MANAGE_CLIENTS },
      { title: "MultiBot", url: "/multibot", icon: Bot, permission: PERMISSIONS.MANAGE_MULTIBOT },
      {
        title: "Flows",
        url: "/flows",
        icon: Workflow,
        permission: PERMISSIONS.FLOW_BUILDER
      },
      {
        title: "Users",
        url: "/users",
        icon: UserCog,
        permission: PERMISSIONS.MANAGE_USERS
      },
      // { title: "Settings", url: "/settings", icon: Settings, permission: PERMISSIONS.MANAGE_SETTINGS },
    ];

    return allItems.filter(item => {
      if (!item.permission) return true; // Public items
      if (user?.role === ROLES.ADMIN) return true; // Admin sees everything
      return user?.permissions?.includes(item.permission);
    });
  }, [user]);

  return (
    <Sidebar className={open ? "w-60" : "w-14"} collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end
                      className="hover:bg-sidebar-accent"
                      activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
                    >
                      <item.icon className="h-4 w-4" />
                      {open && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
