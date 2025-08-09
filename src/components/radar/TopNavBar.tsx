import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { VisualizationMode } from '@/types/wifi';
import { 
  Radar, 
  Map, 
  Play, 
  Pause, 
  RotateCcw, 
  Settings,
  Zap,
  Shield
} from 'lucide-react';

interface TopNavBarProps {
  mode: VisualizationMode;
  onModeChange: (mode: VisualizationMode) => void;
  isScanning: boolean;
  onToggleScanning: () => void;
  onReset: () => void;
  threatCounts: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    unknown: number;
  };
  totalAPs: number;
}

export const TopNavBar: React.FC<TopNavBarProps> = ({
  mode,
  onModeChange,
  isScanning,
  onToggleScanning,
  onReset,
  threatCounts,
  totalAPs
}) => {
  return (
    <div className="flex-shrink-0 px-2 sm:px-4 py-2 sm:py-3 border-b border-border/30 bg-card/50 backdrop-blur">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 lg:gap-0">
        
        {/* Top Row: Branding and Status */}
        <div className="flex items-center justify-between lg:justify-start lg:gap-6">
          <div className="flex items-center gap-2 sm:gap-4">
            <h1 className="text-lg sm:text-2xl font-bold font-mono text-primary">AIR RADAR</h1>
            <div className="hidden sm:block text-xs font-mono text-muted-foreground">
              WiFi Security Reconnaissance Suite
            </div>
          </div>
          
          {/* Status Indicators */}
          <div className="flex items-center gap-2 sm:gap-4 font-mono text-xs">
            <div className="flex items-center gap-1 sm:gap-2">
              <div className={`w-2 h-2 rounded-full ${isScanning ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
              <span className="hidden sm:inline">{isScanning ? 'SCANNING' : 'STANDBY'}</span>
            </div>
            <div className="hidden md:block">MODE: {mode}</div>
            <div>TARGETS: {totalAPs}</div>
          </div>
        </div>

        {/* Bottom Row: Controls and Threats */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
          
          {/* Main Controls */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Scan Controls */}
            <div className="flex items-center gap-2">
              <Button
                onClick={onToggleScanning}
                variant={isScanning ? "destructive" : "default"}
                size="sm"
                className="text-xs sm:text-sm"
              >
                {isScanning ? (
                  <>
                    <Pause className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                    <span className="hidden xs:inline">STOP</span>
                  </>
                ) : (
                  <>
                    <Play className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                    <span className="hidden xs:inline">SCAN</span>
                  </>
                )}
              </Button>
              <Button
                onClick={onReset}
                variant="outline"
                size="sm"
                className="text-xs sm:text-sm"
              >
                <RotateCcw className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
            </div>

            {/* Visualization Mode */}
            <div className="flex items-center gap-1 sm:gap-2">
              <Button
                onClick={() => onModeChange('POLAR')}
                variant={mode === 'POLAR' ? "default" : "outline"}
                size="sm"
                className="text-xs px-2 sm:px-3"
              >
                <Radar className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">POLAR</span>
              </Button>
              <Button
                onClick={() => onModeChange('HEATMAP')}
                variant={mode === 'HEATMAP' ? "default" : "outline"}
                size="sm"
                className="text-xs px-2 sm:px-3"
              >
                <Map className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">HEAT</span>
              </Button>
            </div>

            {/* Action Buttons */}
            <div className="hidden md:flex items-center gap-2">
              <Button variant="outline" size="sm" className="text-xs">
                <Settings className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                <span className="hidden lg:inline">Settings</span>
              </Button>
              <Button variant="outline" size="sm" className="text-xs">
                <Zap className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                <span className="hidden lg:inline">Plugins</span>
              </Button>
            </div>
          </div>

          {/* Threat Summary */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
            <div className="flex items-center gap-2">
              <Shield className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
              <span className="text-xs font-mono text-muted-foreground">THREATS:</span>
            </div>
            
            <div className="flex items-center gap-1 sm:gap-2">
              <Badge variant="destructive" className="text-xs px-1 sm:px-2">
                {threatCounts.critical}
              </Badge>
              <Badge className="bg-orange-500 text-xs px-1 sm:px-2">
                {threatCounts.high}
              </Badge>
              <Badge className="bg-yellow-500 text-xs px-1 sm:px-2">
                {threatCounts.medium}
              </Badge>
              <Badge className="bg-green-500 text-xs px-1 sm:px-2">
                {threatCounts.low}
              </Badge>
              <Badge variant="secondary" className="text-xs px-1 sm:px-2">
                {threatCounts.unknown}
              </Badge>
            </div>
            
            <div className="text-xs font-mono">
              <span className="text-muted-foreground">HIGH RISK: </span>
              <span className="text-destructive font-bold">
                {threatCounts.critical + threatCounts.high}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};