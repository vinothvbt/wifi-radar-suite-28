/**
 * WiFi Radar Suite API Client
 * Handles all backend API communications for the React frontend
 */

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export interface NetworkInterface {
  name: string;
  type: string;
  status: string;
  mac_address?: string;
  is_monitor_capable: boolean;
}

export interface AccessPoint {
  bssid: string;
  ssid: string;
  signal_dbm: number;
  frequency: number;
  channel?: number;
  security: string;
  vendor?: string;
  threat_level: string;
  confidence: number;
  distance?: number;
  vulnerability_score?: number;
  attack_vectors?: string[];
  last_seen: string;
}

export interface ScanResponse {
  scan_id: string;
  interface: string;
  access_points: AccessPoint[];
  total_count: number;
  scan_duration: number;
  timestamp: string;
}

export interface ScanStatusResponse {
  scan_id: string;
  status: 'starting' | 'running' | 'completed' | 'failed' | 'cancelled';
  progress?: number;
  message?: string;
}

export interface ApiError {
  error: string;
  message: string;
  details?: Record<string, any>;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        error: 'Network Error',
        message: `HTTP ${response.status}: ${response.statusText}`
      }));
      
      throw new Error(errorData.message || errorData.detail || 'API request failed');
    }

    return response.json();
  }

  // Health check
  async checkHealth(): Promise<{ status: string; service: string }> {
    return this.request('/health');
  }

  // Interface management
  async getInterfaces(): Promise<{ interfaces: NetworkInterface[]; total_count: number }> {
    return this.request('/api/v1/interfaces');
  }

  async getWirelessInterfaces(): Promise<{ interfaces: NetworkInterface[]; total_count: number }> {
    return this.request('/api/v1/interfaces/wireless');
  }

  // WiFi scanning
  async startScan(
    interfaceName: string,
    duration: number = 5,
    monitorMode: boolean = false
  ): Promise<ScanResponse> {
    const params = new URLSearchParams({
      interface: interfaceName,
      duration: duration.toString(),
      monitor_mode: monitorMode.toString(),
    });

    return this.request(`/api/v1/scan/start?${params}`, {
      method: 'POST',
    });
  }

  async getScanStatus(scanId: string): Promise<ScanStatusResponse> {
    return this.request(`/api/v1/scan/${scanId}/status`);
  }

  async cancelScan(scanId: string): Promise<{ message: string }> {
    return this.request(`/api/v1/scan/${scanId}`, {
      method: 'DELETE',
    });
  }

  async getActiveScans(): Promise<{
    active_scans: Array<{
      scan_id: string;
      status: string;
      interface: string;
    }>;
    total_active: number;
  }> {
    return this.request('/api/v1/scan/active');
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Export utility functions
export const getSignalStrength = (dbm: number): string => {
  if (dbm > -50) return 'Excellent';
  if (dbm > -60) return 'Good';
  if (dbm > -70) return 'Fair';
  return 'Weak';
};

export const getThreatColor = (level: string): 'destructive' | 'secondary' | 'outline' => {
  switch (level.toLowerCase()) {
    case 'critical':
    case 'high':
      return 'destructive';
    case 'medium':
      return 'secondary';
    case 'low':
    default:
      return 'outline';
  }
};

export const formatTimestamp = (timestamp: string): string => {
  return new Date(timestamp).toLocaleString();
};