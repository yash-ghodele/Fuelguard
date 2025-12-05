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
    <Sidebar collapsible="icon">
      <SidebarHeader className="pb-4">
        <div className="flex items-center justify-center py-4 group-data-[collapsible=icon]:py-2">
          <div className="flex items-center gap-2 text-xl font-bold">
            <div className="h-8 w-8 rounded-full bg-primary shrink-0"></div>
            <span className="group-data-[collapsible=icon]:hidden">FuelGuard</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Main Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive tooltip="Dashboard" className="hover-glow">
                  <a href="/dashboard">
                    <Home className="h-5 w-5" />
                    <span>Dashboard</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Vehicle Tracking" className="hover-glow">
                  <a href="/vehicles">
                    <Car className="h-5 w-5" />
                    <span>Vehicle Tracking</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Fuel Statistics" className="hover-glow">
                  <a href="/fuel-statistics">
                    <Droplets className="h-5 w-5" />
                    <span>Fuel Statistics</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Theft Alerts" className="hover-glow">
                  <a href="/alerts">
                    <ShieldAlert className="h-5 w-5" />
                    <span>Theft Alerts</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Fleet Management" className="hover-glow">
                  <a href="/fleet">
                    <Truck className="h-5 w-5" />
                    <span>Fleet Management</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Admin Panel" className="hover-glow">
                  <a href="/admin">
                    <ShieldAlert className="h-5 w-5 text-red-400" />
                    <span>Admin Panel</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Settings" className="hover-glow">
                  <a href="/settings">
                    <Settings className="h-5 w-5" />
                    <span>Settings</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup className="group-data-[collapsible=icon]:hidden">
          <SidebarGroupLabel>System Stats</SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="space-y-2 p-2">
              <div className="flex items-center justify-between text-sm">
                <span>System Uptime</span>
                <span className="font-medium">99.8%</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Sensor Status</span>
                <span className="flex items-center gap-1">
                  <GaugeCircle className="h-3 w-3 text-green-500" />
                  <span className="font-medium">Healthy</span>
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Last Update</span>
                <span className="font-medium">2 mins ago</span>
              </div>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
