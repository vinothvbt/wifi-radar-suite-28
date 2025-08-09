import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { VisualizationMode } from '@/types/wifi';
import { 
  Grid3X3, 
  Radar, 
  Map, 
  Play, 
  Pause, 
  RotateCcw, 
  Settings,
  Zap
} from 'lucide-react';

interface RadarControlsProps {
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
}

export const RadarControls: React.FC<RadarControlsProps> = ({
  mode,
  onModeChange,
  isScanning,
  onToggleScanning,
  onReset,
  threatCounts
}) => {
  return (
    <div className="h-full bg-card/50 backdrop-blur border border-border rounded-lg">
      <div className="p-3 space-y-3">{/* Reduced padding and spacing */}
        {/* Scan Controls */}
        <div className="space-y-2">
          <h3 className="font-semibold text-xs font-mono">SCAN CONTROL</h3>{/* Smaller heading */}
          <div className="flex gap-2">
            <Button
              onClick={onToggleScanning}
              variant={isScanning ? "destructive" : "default"}
              size="sm"
              className="flex-1"
            >
              {isScanning ? (
                <>
                  <Pause className="h-4 w-4 mr-2" />
                  STOP SCAN
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  START SCAN
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
          {isScanning && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className="animate-pulse-glow w-2 h-2 bg-primary rounded-full" />
              Active scan in progress...
            </div>
          )}
        </div>

        <Separator className="my-2" />{/* Reduced separator spacing */}

        {/* Visualization Mode */}
        <div className="space-y-2">
          <h3 className="font-semibold text-xs font-mono">VISUALIZATION</h3>
          <div className="grid grid-cols-2 gap-1">
            <Button
              onClick={() => onModeChange('POLAR')}
              variant={mode === 'POLAR' ? "default" : "outline"}
              size="sm"
              className="flex flex-col gap-1 h-auto py-2"
            >
              <Radar className="h-4 w-4" />
              <span className="text-xs">POLAR</span>
            </Button>
            <Button
              onClick={() => onModeChange('HEATMAP')}
              variant={mode === 'HEATMAP' ? "default" : "outline"}
              size="sm"
              className="flex flex-col gap-1 h-auto py-2"
            >
              <Map className="h-4 w-4" />
              <span className="text-xs">HEAT</span>
            </Button>
          </div>
        </div>

        <Separator className="my-2" />

        {/* Threat Summary */}
        <div className="space-y-2">
          <h3 className="font-semibold text-xs font-mono">THREAT SUMMARY</h3>{/* Smaller heading */}
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-xs">Critical</span>
              <Badge variant="destructive" className="threat-critical text-xs">
                {threatCounts.critical}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs">High</span>
              <Badge className="threat-high text-xs">
                {threatCounts.high}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs">Medium</span>
              <Badge className="threat-medium text-xs">
                {threatCounts.medium}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs">Low</span>
              <Badge className="threat-low text-xs">
                {threatCounts.low}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs">Unknown</span>
              <Badge variant="secondary" className="threat-unknown text-xs">
                {threatCounts.unknown}
              </Badge>
            </div>
          </div>
        </div>

        <Separator className="my-2" />

        {/* Quick Stats */}
        <div className="space-y-2">
          <h3 className="font-semibold text-xs font-mono">STATISTICS</h3>{/* Smaller heading */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="text-center p-2 bg-muted/50 rounded">
              <div className="font-mono font-bold">
                {threatCounts.critical + threatCounts.high + threatCounts.medium + threatCounts.low + threatCounts.unknown}
              </div>
              <div className="text-muted-foreground">Total APs</div>
            </div>
            <div className="text-center p-2 bg-muted/50 rounded">
              <div className="font-mono font-bold text-destructive">
                {threatCounts.critical + threatCounts.high}
              </div>
              <div className="text-muted-foreground">High Risk</div>
            </div>
          </div>
        </div>

        <Separator className="my-2" />

        {/* Action Buttons */}
        <div className="space-y-1">{/* Reduced spacing */}
          <Button variant="outline" size="sm" className="w-full">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
          <Button variant="outline" size="sm" className="w-full">
            <Zap className="h-4 w-4 mr-2" />
            Plugins
          </Button>
        </div>
      </div>
    </div>
  );
};