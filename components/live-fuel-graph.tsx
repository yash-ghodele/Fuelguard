"use client"

import { useState, useMemo } from "react"
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { Button } from "@/components/ui/button"
import { ChartTooltip } from "@/components/ui/chart"

// Generate mock data for the fuel graph
const generateMockData = (hours: number) => {
  const data = []
  let value = 85

  for (let i = 0; i < hours; i++) {
    // Add some randomness to the fuel level
    value = Math.max(0, Math.min(100, value + (Math.random() - 0.5) * 10))

    // Add sudden drops to simulate potential theft
    if (i === 8 || i === 20) {
      value -= 15
    }

    const timestamp = new Date()
    timestamp.setHours(timestamp.getHours() - (hours - i))

    data.push({
      timestamp: timestamp.toISOString(),
      level: Math.round(value),
    })
  }

  return data
}

// Time range options
const timeRanges = [
  { label: "1h", hours: 1 },
  { label: "24h", hours: 24 },
  { label: "7d", hours: 24 * 7 },
]

export default function LiveFuelGraph() {
  const [selectedRange, setSelectedRange] = useState(timeRanges[1])
  const data = useMemo(() => generateMockData(selectedRange.hours), [selectedRange.hours])

  const formatXAxis = (tickItem: string) => {
    const date = new Date(tickItem)
    return selectedRange.hours <= 24
      ? date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      : date.toLocaleDateString([], { month: "short", day: "numeric" })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="text-2xl font-bold">67%</div>
          <p className="text-xs text-muted-foreground">Average fuel level across fleet</p>
        </div>
        <div className="flex items-center gap-2">
          {timeRanges.map((range) => (
            <Button
              key={range.label}
              variant={selectedRange.label === range.label ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedRange(range)}
            >
              {range.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <XAxis
              dataKey="timestamp"
              tickFormatter={formatXAxis}
              tick={{ fontSize: 12 }}
              axisLine={{ stroke: "#ddd" }}
              tickLine={{ stroke: "#ddd" }}
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fontSize: 12 }}
              axisLine={{ stroke: "#ddd" }}
              tickLine={{ stroke: "#ddd" }}
              label={{ value: "Fuel %", angle: -90, position: "insideLeft", style: { textAnchor: "middle" } }}
            />
            <Tooltip content={<ChartTooltip />} />
            <Line
              type="monotone"
              dataKey="level"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 6, fill: "hsl(var(--primary))" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
