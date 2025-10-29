import { Sidebar, SidebarContent, useSidebar } from "@/components/ui/sidebar";
import { SidebarNavigation } from "./SidebarNavigation";

export function AppSidebar() {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  return (
    <Sidebar className={`hidden md:flex ${isCollapsed ? "w-16" : "w-64"}`} collapsible="icon">
      <SidebarContent className="bg-surface border-r border-border">
        <SidebarNavigation isCollapsed={isCollapsed} />
      </SidebarContent>
    </Sidebar>
  );
}