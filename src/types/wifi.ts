export interface WiFiAccessPoint {
  id: string;
  ssid: string;
  bssid: string;
  channel: number;
  frequency: number;
  signalStrength: number; // dBm
  security: string[];
  vendor: string;
  firstSeen: Date;
  lastSeen: Date;
  threatLevel: ThreatLevel;
  threatScore: number; // 0-100
  vulnerabilities: Vulnerability[];
  position: {
    x: number;
    y: number;
    angle: number; // for polar positioning
    distance: number; // relative distance
  };
}

export interface Vulnerability {
  id: string;
  type: string;
  severity: ThreatLevel;
  description: string;
  cve?: string;
  recommendations: string[];
}

export type ThreatLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'UNKNOWN';

export type VisualizationMode = 'GRID' | 'POLAR' | 'HEATMAP';

export interface ScanSettings {
  interval: number; // seconds
  range: number; // meters
  showHidden: boolean;
  minSignalStrength: number;
}

export interface RadarSettings {
  zoom: number;
  centerX: number;
  centerY: number;
  showGrid: boolean;
  showLabels: boolean;
  sweepSpeed: number;
}