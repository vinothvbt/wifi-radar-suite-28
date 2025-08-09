import React, { useState, useEffect } from 'react';
import { WiFiAccessPoint, VisualizationMode } from '@/types/wifi';
import { generateMockWiFiData } from '@/utils/mockData';
import { PolarRadar } from '@/components/radar/PolarRadar';
import { ThreatPanelTabs } from '@/components/radar/ThreatPanelTabs';
import { TopNavBar } from '@/components/radar/TopNavBar';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
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
      <div className="relative z-10 h-screen flex flex-col overflow-hidden">
        {/* Top Navigation Bar */}
        <TopNavBar
          mode={mode}
          onModeChange={setMode}
          isScanning={isScanning}
          onToggleScanning={toggleScanning}
          onReset={resetRadar}
          threatCounts={calculateThreatCounts()}
          totalAPs={accessPoints.length}
        />

        {/* Main radar interface with resizable panels */}
        <div className="flex-1 min-h-0">
          <ResizablePanelGroup direction="horizontal" className="h-full">
            {/* Radar display - Main area */}
            <ResizablePanel defaultSize={75} minSize={50}>
              <div className="h-full flex justify-center items-center p-4">
                <div className="w-full h-full bg-card/50 backdrop-blur border border-border rounded-lg overflow-hidden">
                  <PolarRadar
                    accessPoints={accessPoints}
                    selectedAP={selectedAP}
                    onSelectAP={setSelectedAP}
                    settings={radarSettings}
                  />
                </div>
              </div>
            </ResizablePanel>

            {/* Resizable handle */}
            <ResizableHandle withHandle />

            {/* Threat analysis panel - Resizable */}
            <ResizablePanel defaultSize={25} minSize={20} maxSize={40}>
              <div className="h-full p-4">
                <ThreatPanelTabs
                  selectedAP={selectedAP}
                  onClose={() => setSelectedAP(null)}
                />
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
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