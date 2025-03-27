
// Re-export all sidebar components from this file
import { TooltipProvider } from "@/components/ui/tooltip"

import { SidebarProvider, useSidebar } from "./context"
import { Sidebar } from "./sidebar"
import { SidebarContent, SidebarFooter, SidebarHeader, SidebarInset, SidebarSeparator } from "./sidebar-sections"
import { SidebarRail, SidebarTrigger } from "./sidebar-rail"
import { SidebarGroup, SidebarGroupAction, SidebarGroupContent, SidebarGroupLabel } from "./sidebar-groups"
import { SidebarMenu, SidebarMenuAction, SidebarMenuBadge, SidebarMenuButton, SidebarMenuItem, SidebarMenuSkeleton } from "./sidebar-menu"
import { SidebarMenuSub, SidebarMenuSubButton, SidebarMenuSubItem } from "./sidebar-menu-sub"
import { SidebarInput } from "./sidebar-input"

// Wrap SidebarProvider to include TooltipProvider
const WrappedSidebarProvider: typeof SidebarProvider = (props) => (
  <TooltipProvider delayDuration={0}>
    <SidebarProvider
      className="group/sidebar-wrapper flex min-h-svh w-full has-[[data-variant=inset]]:bg-sidebar"
      {...props}
    />
  </TooltipProvider>
)
WrappedSidebarProvider.displayName = "SidebarProvider"

export {
  WrappedSidebarProvider as SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarInset,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider as OriginalSidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
}
