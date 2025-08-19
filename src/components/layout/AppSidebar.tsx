import { NavLink, useLocation } from "react-router-dom";
import {
  Users,
  Ticket,
  Calendar,
  BarChart3,
  Settings,
  Home,
  UserCheck,
  Building2
} from "lucide-react";

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

const mainItems = [
  { title: "Dashboard", url: "/", icon: Home },
  { title: "Pessoas", url: "/pessoas", icon: Users },
  { title: "Atendimentos", url: "/tickets", icon: Ticket },
  { title: "Agenda", url: "/agenda", icon: Calendar },
];

const managementItems = [
  { title: "Relatórios", url: "/relatorios", icon: BarChart3 },
  { title: "Usuários", url: "/usuarios", icon: UserCheck },
  { title: "Configurações", url: "/configuracoes", icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const isCollapsed = state === "collapsed";

  const isActive = (path: string) => currentPath === path;
  const getNavClass = ({ isActive }: { isActive: boolean }) =>
    isActive 
      ? "bg-primary text-primary-foreground font-medium" 
      : "hover:bg-surface-hover text-muted-foreground hover:text-foreground";

  return (
    <Sidebar className={isCollapsed ? "w-16" : "w-64"} collapsible="icon">
      <SidebarContent className="bg-surface border-r border-border">
        {/* Logo */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary-hover rounded-lg flex items-center justify-center">
              <Building2 className="w-5 h-5 text-primary-foreground" />
            </div>
            {!isCollapsed && (
              <div>
                <h1 className="font-semibold text-sm text-foreground">Gabinete Digital</h1>
                <p className="text-xs text-muted-foreground">Sistema de Atendimento</p>
              </div>
            )}
          </div>
        </div>

        {/* Menu Principal */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-muted-foreground text-xs font-medium uppercase tracking-wider px-4 py-2">
            Principal
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1 px-2">
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      end 
                      className={({ isActive }) => `
                        flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-all duration-200
                        ${getNavClass({ isActive })}
                      `}
                    >
                      <item.icon className="w-4 h-4 flex-shrink-0" />
                      {!isCollapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Menu Gestão */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-muted-foreground text-xs font-medium uppercase tracking-wider px-4 py-2">
            Gestão
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1 px-2">
              {managementItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      className={({ isActive }) => `
                        flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-all duration-200
                        ${getNavClass({ isActive })}
                      `}
                    >
                      <item.icon className="w-4 h-4 flex-shrink-0" />
                      {!isCollapsed && <span>{item.title}</span>}
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