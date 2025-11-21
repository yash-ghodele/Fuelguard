"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Copy, CheckCircle2, AlertTriangle } from "lucide-react";

export default function ProvisionDevicePage() {
    const [serialNumber, setSerialNumber] = useState("");
    const [firmwareVersion, setFirmwareVersion] = useState("1.0.0");
    const [vehicleId, setVehicleId] = useState("");
    const [loading, setLoading] = useState(false);
    const [credentials, setCredentials] = useState<{ deviceId: string; token: string } | null>(null);
    const [copied, setCopied] = useState(false);
    const router = useRouter();
    const { toast } = useToast();

    const handleProvision = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!serialNumber.trim()) return;

        setLoading(true);
        try {
            const response = await fetch("/api/devices/provision", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    serialNumber,
                    firmwareVersion,
                    vehicleId: vehicleId || undefined,
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to provision device");
            }

            const data = await response.json();
            setCredentials(data.credentials);

            toast({
                title: "Device Provisioned",
                description: "Device has been successfully provisioned.",
            });
        } catch (error: any) {
            console.error("Error provisioning device:", error);
            toast({
                title: "Error",
                description: error.message || "Failed to provision device. Please try again.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleCopyToken = () => {
        if (credentials) {
            navigator.clipboard.writeText(credentials.token);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
            toast({
                title: "Copied",
                description: "Device token copied to clipboard.",
            });
        }
    };

    if (credentials) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
                <Card className="w-full max-w-2xl">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CheckCircle2 className="h-6 w-6 text-green-500" />
                            Device Provisioned Successfully
                        </CardTitle>
                        <CardDescription>
                            Save these credentials securely. They will not be shown again.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Alert variant="destructive">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertDescription>
                                <strong>Warning:</strong> This token will only be displayed once. Make sure to save it securely before leaving this page.
                            </AlertDescription>
                        </Alert>

                        <div className="space-y-2">
                            <Label>Device ID</Label>
                            <Input value={credentials.deviceId} readOnly />
                        </div>

                        <div className="space-y-2">
                            <Label>Device Token (JWT)</Label>
                            <div className="flex gap-2">
                                <Input
                                    value={credentials.token}
                                    readOnly
                                    className="font-mono text-xs"
                                />
                                <Button
                                    onClick={handleCopyToken}
                                    variant="outline"
                                    size="icon"
                                >
                                    {copied ? (
                                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                                    ) : (
                                        <Copy className="h-4 w-4" />
                                    )}
                                </Button>
                            </div>
                        </div>

                        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md">
                            <h4 className="font-semibold mb-2">Next Steps:</h4>
                            <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600 dark:text-gray-400">
                                <li>Copy the device token above</li>
                                <li>Flash the token to your ESP32 device</li>
                                <li>Configure the device to connect to the MQTT broker</li>
                                <li>The device will authenticate using this token</li>
                            </ol>
                        </div>
                    </CardContent>
                    <CardFooter className="flex gap-2">
                        <Button onClick={() => router.push("/devices")} variant="outline">
                            View Devices
                        </Button>
                        <Button onClick={() => window.location.reload()}>
                            Provision Another Device
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>Provision New Device</CardTitle>
                    <CardDescription>
                        Register a new IoT device and generate secure credentials.
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleProvision}>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="serialNumber">Serial Number *</Label>
                            <Input
                                id="serialNumber"
                                placeholder="ESP32-ABC123"
                                value={serialNumber}
                                onChange={(e) => setSerialNumber(e.target.value)}
                                disabled={loading}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="firmwareVersion">Firmware Version *</Label>
                            <Input
                                id="firmwareVersion"
                                placeholder="1.0.0"
                                value={firmwareVersion}
                                onChange={(e) => setFirmwareVersion(e.target.value)}
                                disabled={loading}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="vehicleId">Vehicle ID (Optional)</Label>
                            <Input
                                id="vehicleId"
                                placeholder="Leave empty to assign later"
                                value={vehicleId}
                                onChange={(e) => setVehicleId(e.target.value)}
                                disabled={loading}
                            />
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? "Provisioning..." : "Provision Device"}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
