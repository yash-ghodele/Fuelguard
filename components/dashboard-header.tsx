"use client"

import { useState } from "react"
import { Bell, Moon, Sun, User } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { SidebarTrigger } from "@/components/ui/sidebar"

export default function DashboardHeader() {
  const { setTheme } = useTheme()
  const [notificationCount, setNotificationCount] = useState(3)

  return (
    <header className="sticky top-0 z-30 border-b bg-background">
      <div className="flex h-14 items-center px-2 md:px-4">
        <SidebarTrigger className="mr-2" />
        <div className="flex items-center gap-2 font-semibold">
          <div className="h-6 w-6 rounded-full bg-primary"></div>
          <span className="hidden md:inline-flex">FuelGuard</span>
        </div>
        <div className="ml-auto flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                {notificationCount > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-[10px]"
                  >
                    {notificationCount}
                  </Badge>
                )}
                <span className="sr-only">Notifications</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>New fuel drop alert for Vehicle XYZ-123</DropdownMenuItem>
              <DropdownMenuItem>GPS signal lost for Vehicle ABC-456</DropdownMenuItem>
              <DropdownMenuItem>Vehicle MNO-789 sensor disconnected</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setTheme("light")}>Light</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("dark")}>Dark</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("system")}>System</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="ghost" size="icon" className="rounded-full" asChild>
            <a href="/profile">
              <User className="h-5 w-5" />
              <span className="sr-only">User profile</span>
            </a>
          </Button>
        </div>
      </div>
    </header>
  )
}
