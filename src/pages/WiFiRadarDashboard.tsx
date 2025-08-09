import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Wifi, WifiOff, Shield, AlertTriangle } from 'lucide-react';

interface NetworkInterface {
  name: string;
  type: string;
  status: string;
  mac_address?: string;
  is_monitor_capable: boolean;
}

interface AccessPoint {
  bssid: string;
  ssid: string;
  signal_dbm: number;
  frequency: number;
  channel?: number;
  security: string;
  vendor?: string;
  threat_level: string;
  confidence: number;
}

interface ScanResponse {
  scan_id: string;
  interface: string;
  access_points: AccessPoint[];
  total_count: number;
  scan_duration: number;
  timestamp: string;
}

const API_BASE = 'http://127.0.0.1:8000/api/v1';

export default function WiFiRadarDashboard() {
  const [interfaces, setInterfaces] = useState<NetworkInterface[]>([]);
  const [selectedInterface, setSelectedInterface] = useState<string>('');
  const [scanning, setScanning] = useState(false);
  const [scanResults, setScanResults] = useState<ScanResponse | null>(null);
  const [error, setError] = useState<string>('');
  const [apiConnected, setApiConnected] = useState(false);

  useEffect(() => {
    checkApiHealth();
    loadInterfaces();
  }, []);

  const checkApiHealth = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/health');
      if (response.ok) {
        setApiConnected(true);
      }
    } catch (err) {
      setApiConnected(false);
      setError('Backend API not available. Please start the FastAPI server.');
    }
  };

  const loadInterfaces = async () => {
    try {
      const response = await fetch(`${API_BASE}/interfaces`);
      const data = await response.json();
      
      if (response.ok) {
        setInterfaces(data.interfaces);
        if (data.interfaces.length > 0) {
          setSelectedInterface(data.interfaces[0].name);
        }
        setError('');
      } else {
        setError(data.detail || 'Failed to load interfaces');
      }
    } catch (err) {
      setError('Failed to connect to backend API');
    }
  };

  const startScan = async () => {
    if (!selectedInterface) {
      setError('Please select an interface');
      return;
    }

    setScanning(true);
    setScanResults(null);
    setError('');

    try {
      const response = await fetch(`${API_BASE}/scan/start?interface=${selectedInterface}&duration=10`, {
        method: 'POST'
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setScanResults(data);
      } else {
        setError(data.detail || 'Scan failed');
      }
    } catch (err) {
      setError('Failed to start scan');
    } finally {
      setScanning(false);
    }
  };

  const getThreatColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const getSignalStrength = (dbm: number) => {
    if (dbm > -50) return 'Excellent';
    if (dbm > -60) return 'Good';
    if (dbm > -70) return 'Fair';
    return 'Weak';
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">WiFi Radar Suite</h1>
            <p className="text-muted-foreground">Web-based WiFi security analysis tool</p>
          </div>
          <div className="flex items-center gap-2">
            {apiConnected ? (
              <Badge variant="outline" className="text-green-600">
                <Wifi className="w-4 h-4 mr-1" />
                API Connected
              </Badge>
            ) : (
              <Badge variant="destructive">
                <WifiOff className="w-4 h-4 mr-1" />
                API Disconnected
              </Badge>
            )}
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Interface Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Network Interfaces</CardTitle>
            <CardDescription>
              Select a wireless interface for scanning
            </CardDescription>
          </CardHeader>
          <CardContent>
            {interfaces.length === 0 ? (
              <div className="text-center py-6">
                <WifiOff className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
                <p className="text-muted-foreground">No wireless interfaces detected</p>
                <p className="text-sm text-muted-foreground mt-1">
                  This may be due to running in a sandboxed environment
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {interfaces.map((iface) => (
                  <div
                    key={iface.name}
                    className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedInterface === iface.name ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
                    }`}
                    onClick={() => setSelectedInterface(iface.name)}
                  >
                    <div className="flex items-center gap-3">
                      <Wifi className="w-5 h-5" />
                      <div>
                        <p className="font-medium">{iface.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {iface.mac_address || 'No MAC'}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant={iface.status === 'up' ? 'default' : 'secondary'}>
                        {iface.status}
                      </Badge>
                      {iface.is_monitor_capable && (
                        <Badge variant="outline">Monitor</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Scan Control */}
        <Card>
          <CardHeader>
            <CardTitle>WiFi Scan</CardTitle>
            <CardDescription>
              Discover nearby wireless networks and assess security
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={startScan} 
              disabled={!selectedInterface || scanning}
              className="w-full sm:w-auto"
            >
              {scanning ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Scanning...
                </>
              ) : (
                <>
                  <Wifi className="w-4 h-4 mr-2" />
                  Start Scan
                </>
              )}
            </Button>
            {selectedInterface && (
              <p className="text-sm text-muted-foreground mt-2">
                Scanning on {selectedInterface}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Scan Results */}
        {scanResults && (
          <Card>
            <CardHeader>
              <CardTitle>Scan Results</CardTitle>
              <CardDescription>
                Found {scanResults.total_count} access points in {scanResults.scan_duration.toFixed(2)} seconds
              </CardDescription>
            </CardHeader>
            <CardContent>
              {scanResults.access_points.length === 0 ? (
                <div className="text-center py-6">
                  <WifiOff className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">No access points detected</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {scanResults.access_points.map((ap) => (
                    <div key={ap.bssid} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-medium">{ap.ssid}</h3>
                          <p className="text-sm text-muted-foreground">{ap.bssid}</p>
                        </div>
                        <Badge variant={getThreatColor(ap.threat_level)}>
                          <Shield className="w-3 h-3 mr-1" />
                          {ap.threat_level}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                        <div>
                          <p className="text-muted-foreground">Signal</p>
                          <p className="font-medium">{ap.signal_dbm} dBm</p>
                          <p className="text-xs text-muted-foreground">
                            {getSignalStrength(ap.signal_dbm)}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Security</p>
                          <p className="font-medium">{ap.security}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Channel</p>
                          <p className="font-medium">{ap.channel || 'Unknown'}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Frequency</p>
                          <p className="font-medium">{ap.frequency} MHz</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}