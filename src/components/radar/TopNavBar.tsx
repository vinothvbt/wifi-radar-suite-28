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
    <div className="flex-shrink-0 px-4 py-3 border-b border-border/30 bg-card/50 backdrop-blur">
      <div className="flex items-center justify-between">
        {/* Left: Branding */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold font-mono text-primary">AIR RADAR</h1>
            <div className="text-xs font-mono text-muted-foreground">
              WiFi Security Reconnaissance Suite
            </div>
          </div>
          
          {/* Status Indicators */}
          <div className="flex items-center gap-4 font-mono text-xs">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isScanning ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
              <span>{isScanning ? 'SCANNING' : 'STANDBY'}</span>
            </div>
            <div>MODE: {mode}</div>
            <div>TARGETS: {totalAPs}</div>
          </div>
        </div>

        {/* Center: Main Controls */}
        <div className="flex items-center gap-4">
          {/* Scan Controls */}
          <div className="flex items-center gap-2">
            <Button
              onClick={onToggleScanning}
              variant={isScanning ? "destructive" : "default"}
              size="sm"
            >
              {isScanning ? (
                <>
                  <Pause className="h-4 w-4 mr-2" />
                  STOP
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  SCAN
                </>
              )}
            </Button>
            <Button
              onClick={onReset}
              variant="outline"
              size="sm"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>

          {/* Visualization Mode */}
          <div className="flex items-center gap-2">
            <Button
              onClick={() => onModeChange('POLAR')}
              variant={mode === 'POLAR' ? "default" : "outline"}
              size="sm"
            >
              <Radar className="h-4 w-4 mr-2" />
              POLAR
            </Button>
            <Button
              onClick={() => onModeChange('HEATMAP')}
              variant={mode === 'HEATMAP' ? "default" : "outline"}
              size="sm"
            >
              <Map className="h-4 w-4 mr-2" />
              HEATMAP
            </Button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
            <Button variant="outline" size="sm">
              <Zap className="h-4 w-4 mr-2" />
              Plugins
            </Button>
          </div>
        </div>

        {/* Right: Threat Summary */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs font-mono text-muted-foreground">THREATS:</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant="destructive" className="text-xs">
              {threatCounts.critical}
            </Badge>
            <Badge className="bg-orange-500 text-xs">
              {threatCounts.high}
            </Badge>
            <Badge className="bg-yellow-500 text-xs">
              {threatCounts.medium}
            </Badge>
            <Badge className="bg-green-500 text-xs">
              {threatCounts.low}
            </Badge>
            <Badge variant="secondary" className="text-xs">
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
  );
};