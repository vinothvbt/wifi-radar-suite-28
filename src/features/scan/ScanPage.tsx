import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Wifi, WifiOff, Shield, AlertTriangle, RefreshCw } from 'lucide-react';
import {
  apiClient,
  NetworkInterface,
  AccessPoint,
  ScanResponse,
  getSignalStrength,
  getThreatColor,
  formatTimestamp
} from '@/lib/api';

const DEFAULT_SCAN_DURATION = 5;
const AUTO_REFRESH_INTERVAL = 2000; // 2 seconds

export default function ScanPage() {
  const [interfaces, setInterfaces] = useState<NetworkInterface[]>([]);
  const [selectedInterface, setSelectedInterface] = useState<string>('');
  const [scanning, setScanning] = useState(false);
  const [scanResults, setScanResults] = useState<ScanResponse | null>(null);
  const [error, setError] = useState<string>('');
  const [apiConnected, setApiConnected] = useState(false);
  const [lastScanId, setLastScanId] = useState<string>('');
  const [autoRefresh, setAutoRefresh] = useState(false);

  // Auto-refresh effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (autoRefresh && scanResults) {
      interval = setInterval(() => {
        refreshScanResults();
      }, AUTO_REFRESH_INTERVAL);
    }
    
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [autoRefresh, scanResults]);

  // Initial load
  useEffect(() => {
    checkApiHealth();
    loadInterfaces();
  }, []);

  const checkApiHealth = async () => {
    try {
      await apiClient.checkHealth();
      setApiConnected(true);
      setError('');
    } catch (err) {
      setApiConnected(false);
      setError('Backend API not available. Please start the FastAPI server.');
    }
  };

  const loadInterfaces = async () => {
    try {
      const data = await apiClient.getInterfaces();
      setInterfaces(data.interfaces);
      
      if (data.interfaces.length > 0) {
        setSelectedInterface(data.interfaces[0].name);
      }
      setError('');
    } catch (err) {
      setError(`Failed to load interfaces: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const refreshScanResults = useCallback(async () => {
    if (!lastScanId || !selectedInterface) return;
    
    try {
      // For demo purposes, we'll re-scan. In production, you might want to cache results
      // or implement a different refresh strategy
      const data = await apiClient.startScan(selectedInterface, DEFAULT_SCAN_DURATION);
      setScanResults(data);
      setLastScanId(data.scan_id);
    } catch (err) {
      console.warn('Auto-refresh failed:', err);
    }
  }, [lastScanId, selectedInterface]);

  const startScan = async () => {
    if (!selectedInterface) {
      setError('Please select an interface');
      return;
    }

    setScanning(true);
    setScanResults(null);
    setError('');
    setAutoRefresh(false);

    try {
      const data = await apiClient.startScan(selectedInterface, DEFAULT_SCAN_DURATION);
      setScanResults(data);
      setLastScanId(data.scan_id);
      setAutoRefresh(true); // Start auto-refresh after successful scan
    } catch (err) {
      setError(`Scan failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setScanning(false);
    }
  };

  const stopAutoRefresh = () => {
    setAutoRefresh(false);
  };

  const startAutoRefresh = () => {
    if (scanResults) {
      setAutoRefresh(true);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">WiFi Scanner</h1>
            <p className="text-muted-foreground">Real-time wireless network discovery and analysis</p>
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
            {autoRefresh && scanResults && (
              <Badge variant="secondary">
                <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
                Auto-refresh
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
                  This may be due to running in a sandboxed environment or missing wireless hardware
                </p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-3" 
                  onClick={loadInterfaces}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh Interfaces
                </Button>
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
                          {iface.mac_address || 'No MAC available'}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant={iface.status === 'up' ? 'default' : 'secondary'}>
                        {iface.status.toUpperCase()}
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
            <CardTitle>WiFi Scan Control</CardTitle>
            <CardDescription>
              Discover nearby wireless networks and assess security threats
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <Button 
                onClick={startScan} 
                disabled={!selectedInterface || scanning}
                className="flex-shrink-0"
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
              
              {scanResults && (
                <>
                  {autoRefresh ? (
                    <Button variant="outline" onClick={stopAutoRefresh}>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Stop Auto-refresh
                    </Button>
                  ) : (
                    <Button variant="outline" onClick={startAutoRefresh}>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Start Auto-refresh
                    </Button>
                  )}
                </>
              )}
            </div>
            
            {selectedInterface && (
              <div className="mt-3 space-y-1">
                <p className="text-sm text-muted-foreground">
                  Scanning interface: <span className="font-mono">{selectedInterface}</span>
                </p>
                <p className="text-xs text-muted-foreground">
                  Scan duration: {DEFAULT_SCAN_DURATION} seconds
                  {autoRefresh && " • Auto-refresh every 2 seconds"}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Scan Results */}
        {scanResults && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Scan Results</CardTitle>
                  <CardDescription>
                    Found {scanResults.total_count} access points in {scanResults.scan_duration.toFixed(2)} seconds
                    {scanResults.timestamp && (
                      <> • Last scan: {formatTimestamp(scanResults.timestamp)}</>
                    )}
                  </CardDescription>
                </div>
                {autoRefresh && (
                  <Badge variant="secondary" className="animate-pulse">
                    <RefreshCw className="w-3 h-3 mr-1" />
                    Live
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {scanResults.access_points.length === 0 ? (
                <div className="text-center py-8">
                  <WifiOff className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <p className="text-lg text-muted-foreground mb-2">No access points detected</p>
                  <p className="text-sm text-muted-foreground">
                    Try a different interface or check if WiFi networks are available in the area
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {scanResults.access_points.map((ap) => (
                    <div key={ap.bssid} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                      <div className="flex items-start justify-between mb-3">
                        <div className="min-w-0 flex-1">
                          <h3 className="font-medium text-lg truncate">{ap.ssid}</h3>
                          <p className="text-sm text-muted-foreground font-mono">{ap.bssid}</p>
                          {ap.vendor && (
                            <p className="text-xs text-muted-foreground mt-1">Vendor: {ap.vendor}</p>
                          )}
                        </div>
                        <Badge variant={getThreatColor(ap.threat_level)} className="flex-shrink-0 ml-3">
                          <Shield className="w-3 h-3 mr-1" />
                          {ap.threat_level}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground mb-1">Signal Strength</p>
                          <p className="font-medium">{ap.signal_dbm} dBm</p>
                          <p className="text-xs text-muted-foreground">
                            {getSignalStrength(ap.signal_dbm)}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground mb-1">Security</p>
                          <p className="font-medium">{ap.security}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground mb-1">Channel</p>
                          <p className="font-medium">{ap.channel || 'Unknown'}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground mb-1">Frequency</p>
                          <p className="font-medium">{ap.frequency} MHz</p>
                        </div>
                      </div>
                      
                      {(ap.distance !== undefined || ap.confidence !== undefined) && (
                        <div className="grid grid-cols-2 gap-4 text-sm mt-3 pt-3 border-t">
                          {ap.distance !== undefined && (
                            <div>
                              <p className="text-muted-foreground mb-1">Est. Distance</p>
                              <p className="font-medium">{ap.distance.toFixed(1)} meters</p>
                            </div>
                          )}
                          {ap.confidence !== undefined && (
                            <div>
                              <p className="text-muted-foreground mb-1">Detection Confidence</p>
                              <p className="font-medium">{(ap.confidence * 100).toFixed(1)}%</p>
                            </div>
                          )}
                        </div>
                      )}
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