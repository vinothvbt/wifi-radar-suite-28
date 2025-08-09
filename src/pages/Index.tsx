import React, { useState, useEffect } from 'react';
import { WiFiAccessPoint, VisualizationMode } from '@/types/wifi';
import { generateMockWiFiData } from '@/utils/mockData';
import { PolarRadar } from '@/components/radar/PolarRadar';
import { ThreatPanel } from '@/components/radar/ThreatPanel';
import { RadarControls } from '@/components/radar/RadarControls';
import radarBackground from '@/assets/radar-background.jpg';

const Index = () => {
  const [accessPoints, setAccessPoints] = useState<WiFiAccessPoint[]>([]);
  const [selectedAP, setSelectedAP] = useState<WiFiAccessPoint | null>(null);
  const [mode, setMode] = useState<VisualizationMode>('POLAR');
  const [isScanning, setIsScanning] = useState(false);
  const [radarSettings, setRadarSettings] = useState({
    zoom: 1,
    centerX: 0,
    centerY: 0,
    showGrid: true,
    showLabels: true,
    sweepSpeed: 1
  });

  // Initialize with mock data
  useEffect(() => {
    setAccessPoints(generateMockWiFiData(20));
  }, []);

  // Simulate scanning
  useEffect(() => {
    if (!isScanning) return;

    const interval = setInterval(() => {
      setAccessPoints(prev => {
        // Randomly update some APs or add new ones
        if (Math.random() > 0.7) {
          return generateMockWiFiData(Math.floor(Math.random() * 5) + 15);
        }
        return prev;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [isScanning]);

  const toggleScanning = () => {
    setIsScanning(!isScanning);
  };

  const resetRadar = () => {
    setAccessPoints(generateMockWiFiData(20));
    setSelectedAP(null);
    setRadarSettings(prev => ({ ...prev, zoom: 1, centerX: 0, centerY: 0 }));
  };

  const calculateThreatCounts = () => {
    return accessPoints.reduce(
      (counts, ap) => {
        counts[ap.threatLevel.toLowerCase() as keyof typeof counts]++;
        return counts;
      },
      { critical: 0, high: 0, medium: 0, low: 0, unknown: 0 }
    );
  };

  return (
    <div 
      className="min-h-screen bg-background relative"
      style={{
        backgroundImage: `url(${radarBackground})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-background/70 backdrop-blur-sm" />
      
      {/* Main content */}
      <div className="relative z-10 h-screen flex flex-col overflow-hidden">{/* Prevent any scrolling */}
        {/* Compact Header */}
        <div className="flex-shrink-0 px-4 py-2 border-b border-border/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold font-mono text-primary">AIR RADAR</h1>
              <div className="text-xs font-mono text-muted-foreground">
                WiFi Security Reconnaissance Suite
              </div>
            </div>
            <div className="flex items-center gap-6 font-mono text-xs">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${isScanning ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                <span>{isScanning ? 'SCANNING' : 'STANDBY'}</span>
              </div>
              <div>MODE: {mode}</div>
              <div>TARGETS: {accessPoints.length}</div>
            </div>
          </div>
        </div>

        {/* Main radar interface - Single row layout */}
        <div className="flex-1 flex gap-3 px-4 py-2 min-h-0 overflow-hidden">
          {/* Controls sidebar - Compact */}
          <div className="w-72 flex-shrink-0">
            <RadarControls
              mode={mode}
              onModeChange={setMode}
              isScanning={isScanning}
              onToggleScanning={toggleScanning}
              onReset={resetRadar}
              threatCounts={calculateThreatCounts()}
            />
          </div>

          {/* Radar display - Takes remaining space */}
          <div className="flex-1 min-w-0">
            <div className="w-full h-full bg-card/50 backdrop-blur border border-border rounded-lg overflow-hidden">
              {mode === 'POLAR' && (
                <PolarRadar
                  accessPoints={accessPoints}
                  selectedAP={selectedAP}
                  onSelectAP={setSelectedAP}
                  settings={radarSettings}
                />
              )}
              {mode === 'GRID' && (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <div className="text-center">
                    <div className="text-4xl mb-2">🚧</div>
                    <div>Grid Mode Coming Soon</div>
                  </div>
                </div>
              )}
              {mode === 'HEATMAP' && (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <div className="text-center">
                    <div className="text-4xl mb-2">🚧</div>
                    <div>Heatmap Mode Coming Soon</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Threat analysis panel - Fixed width, shows inline with radar */}
          <div className="w-80 flex-shrink-0">
            <ThreatPanel
              selectedAP={selectedAP}
              onClose={() => setSelectedAP(null)}
            />
          </div>
        </div>

        {/* Compact Footer */}
        <div className="flex-shrink-0 px-4 py-1 border-t border-border/30 text-center text-xs text-muted-foreground font-mono">
          Air Radar v1.0 | For authorized penetration testing only
        </div>
      </div>
    </div>
  );
};

export default Index;