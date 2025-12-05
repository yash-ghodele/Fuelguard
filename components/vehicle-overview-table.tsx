"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { BadgeAlertIcon as Alert } from "lucide-react"
import { Badge } from "@/components/ui/badge"

// Mock vehicle data
const vehicles = [
  {
    id: "VEH-123",
    fuelLevel: 78,
    location: "New York, NY",
    lastUpdate: "5 min ago",
    theftStatus: false,
  },
  {
    id: "VEH-456",
    fuelLevel: 45,
    location: "Chicago, IL",
    lastUpdate: "12 min ago",
    theftStatus: false,
  },
  {
    id: "VEH-789",
    fuelLevel: 92,
    location: "Los Angeles, CA",
    lastUpdate: "3 min ago",
    theftStatus: false,
  },
  {
    id: "VEH-101",
    fuelLevel: 23,
    location: "Dallas, TX",
    lastUpdate: "1 min ago",
    theftStatus: true,
  },
  {
    id: "VEH-112",
    fuelLevel: 67,
    location: "Seattle, WA",
    lastUpdate: "8 min ago",
    theftStatus: false,
  },
  {
    id: "VEH-205",
    fuelLevel: 88,
    location: "Miami, FL",
    lastUpdate: "2 min ago",
    theftStatus: false,
  },
  {
    id: "VEH-314",
    fuelLevel: 15,
    location: "Denver, CO",
    lastUpdate: "Just now",
    theftStatus: true,
  },
  {
    id: "VEH-420",
    fuelLevel: 55,
    location: "Austin, TX",
    lastUpdate: "15 min ago",
    theftStatus: false,
  },
  {
    id: "VEH-555",
    fuelLevel: 98,
    location: "San Francisco, CA",
    lastUpdate: "10 min ago",
    theftStatus: false,
  },
  {
    id: "VEH-666",
    fuelLevel: 34,
    location: "Las Vegas, NV",
    lastUpdate: "20 min ago",
    theftStatus: false,
  },
]

export function VehicleOverviewTable() {
  return (
    <div className="overflow-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Vehicle ID</TableHead>
            <TableHead>Fuel Level</TableHead>
            <TableHead className="hidden md:table-cell">Last Location</TableHead>
            <TableHead>Last Update</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {vehicles.map((vehicle) => (
            <TableRow key={vehicle.id}>
              <TableCell className="font-medium">{vehicle.id}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-full max-w-24 rounded-full bg-muted">
                    <div
                      className={`h-full rounded-full ${vehicle.fuelLevel < 25 ? "bg-red-500" : vehicle.fuelLevel < 50 ? "bg-amber-500" : "bg-green-500"
                        }`}
                      style={{ width: `${vehicle.fuelLevel}%` }}
                    />
                  </div>
                  <span className="text-xs font-medium">{vehicle.fuelLevel}%</span>
                </div>
              </TableCell>
              <TableCell className="hidden md:table-cell">{vehicle.location}</TableCell>
              <TableCell>{vehicle.lastUpdate}</TableCell>
              <TableCell>
                {vehicle.theftStatus ? (
                  <Badge variant="destructive" className="flex items-center gap-1">
                    <Alert className="h-3 w-3" />
                    <span>Theft Alert</span>
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-green-500/10 text-green-600 dark:text-green-400">
                    Safe
                  </Badge>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
