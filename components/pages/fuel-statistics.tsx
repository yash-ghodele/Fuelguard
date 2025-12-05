"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart3, TrendingDown, TrendingUp, DollarSign, Droplets } from "lucide-react"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from "recharts"

const fuelConsumptionData = [
    { month: "Jan", consumption: 4500, cost: 12000 },
    { month: "Feb", consumption: 4200, cost: 11500 },
    { month: "Mar", consumption: 4800, cost: 13000 },
    { month: "Apr", consumption: 4100, cost: 11000 },
    { month: "May", consumption: 5200, cost: 14500 },
    { month: "Jun", consumption: 4900, cost: 13800 },
]

export default function FuelStatistics() {
    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full p-2 md:p-4 space-y-4">
            <div className="flex items-center gap-4 rounded-xl bg-gradient-to-r from-purple-900/50 to-pink-900/50 p-6 border border-white/10 backdrop-blur-md">
                <div className="p-3 rounded-full bg-purple-500/20 text-purple-400">
                    <Droplets className="h-8 w-8" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-white">Fuel Statistics</h1>
                    <p className="text-purple-200">Analyze consumption trends and cost efficiency.</p>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card className="glass-card hover-glow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Consumption</CardTitle>
                        <BarChart3 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">27,700 L</div>
                        <p className="text-xs text-muted-foreground flex items-center mt-1">
                            <TrendingUp className="h-3 w-3 text-red-500 mr-1" />
                            +12% from last month
                        </p>
                    </CardContent>
                </Card>
                <Card className="glass-card hover-glow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Fuel Efficiency</CardTitle>
                        <TrendingDown className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">3.2 km/L</div>
                        <p className="text-xs text-muted-foreground flex items-center mt-1">
                            <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                            +5% improvement
                        </p>
                    </CardContent>
                </Card>
                <Card className="glass-card hover-glow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Estimated Cost</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">$75,800</div>
                        <p className="text-xs text-muted-foreground flex items-center mt-1">
                            <TrendingDown className="h-3 w-3 text-green-500 mr-1" />
                            -2% from budget
                        </p>
                    </CardContent>
                </Card>
            </div>

            <Card className="col-span-4 glass-card hover-glow">
                <CardHeader>
                    <CardTitle>Monthly Consumption & Cost</CardTitle>
                </CardHeader>
                <CardContent className="pl-2">
                    <div className="h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={fuelConsumptionData}>
                                <XAxis dataKey="month" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#ffffff20', color: '#f1f5f9' }}
                                    itemStyle={{ color: '#e2e8f0' }}
                                    cursor={{ fill: '#ffffff10' }}
                                />
                                <Legend />
                                <Bar dataKey="consumption" name="Consumption (L)" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="cost" name="Cost ($)" fill="#64748b" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    )
}
