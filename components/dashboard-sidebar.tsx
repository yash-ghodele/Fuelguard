"use client"

import { Car, Droplets, GaugeCircle, Home, Settings, ShieldAlert, Truck } from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export default function DashboardSidebar() {
  return (
    <Sidebar
      collapsible="icon"
      className="border-r transition-all duration-300 ease-in-out"
    >
      <SidebarHeader className="pb-4 border-b transition-all duration-300">
        <div className="flex items-center justify-center py-4 group-data-[collapsible=icon]:py-2 transition-all">
          <div className="flex items-center gap-3 text-xl font-bold">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 shrink-0 transition-all group-data-[collapsible=icon]:h-8 group-data-[collapsible=icon]:w-8"></div>
            <span className="group-data-[collapsible=icon]:hidden bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent transition-opacity duration-300">
              FuelShield
            </span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="transition-opacity duration-300">Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive tooltip="Dashboard">
                  <a href="/dashboard" className="flex items-center gap-3 transition-all duration-200 hover:translate-x-1">
                    <Home className="h-5 w-5 transition-all" />
                    <span>Dashboard</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Vehicle Tracking">
                  <a href="/vehicles" className="flex items-center gap-3 transition-all duration-200 hover:translate-x-1">
                    <Car className="h-5 w-5 transition-all" />
                    <span>Vehicle Tracking</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Fuel Statistics">
                  <a href="/fuel-statistics" className="flex items-center gap-3 transition-all duration-200 hover:translate-x-1">
                    <Droplets className="h-5 w-5 transition-all" />
                    <span>Fuel Statistics</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Theft Alerts">
                  <a href="/alerts" className="flex items-center gap-3 transition-all duration-200 hover:translate-x-1">
                    <ShieldAlert className="h-5 w-5 transition-all" />
                    <span>Theft Alerts</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Fleet Management">
                  <a href="/fleet" className="flex items-center gap-3 transition-all duration-200 hover:translate-x-1">
                    <Truck className="h-5 w-5 transition-all" />
                    <span>Fleet Management</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Admin Panel">
                  <a href="/admin" className="flex items-center gap-3 transition-all duration-200 hover:translate-x-1">
                    <ShieldAlert className="h-5 w-5 text-red-500 transition-all" />
                    <span>Admin Panel</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Settings">
                  <a href="/settings" className="flex items-center gap-3 transition-all duration-200 hover:translate-x-1">
                    <Settings className="h-5 w-5 transition-all" />
                    <span>Settings</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="group-data-[collapsible=icon]:hidden border-t mt-4 pt-4 transition-all duration-300">
          <SidebarGroupLabel className="transition-opacity duration-300">System Status</SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="space-y-3 p-3 rounded-lg bg-muted/50 transition-all duration-300">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Uptime</span>
                <span className="font-semibold text-green-600 dark:text-green-400">99.8%</span>
              </div>
              <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                <div className="h-full w-[99.8%] bg-gradient-to-r from-green-500 to-emerald-400 rounded-full transition-all duration-500"></div>
              </div>

              <div className="flex items-center justify-between text-sm pt-2">
                <span className="text-muted-foreground">Sensors</span>
                <span className="flex items-center gap-1.5">
                  <GaugeCircle className="h-3.5 w-3.5 text-green-600 dark:text-green-400 animate-pulse" />
                  <span className="font-semibold text-green-600 dark:text-green-400">Active</span>
                </span>
              </div>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
