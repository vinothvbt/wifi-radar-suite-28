#!/usr/bin/env python3
"""
Pydantic models for WiFi Radar API
"""

from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum

class InterfaceStatus(str, Enum):
    """Network interface status"""
    UP = "up"
    DOWN = "down"
    UNKNOWN = "unknown"

class InterfaceType(str, Enum):
    """Network interface type"""
    WIRELESS = "wireless"
    ETHERNET = "ethernet"
    UNKNOWN = "unknown"

class NetworkInterface(BaseModel):
    """Network interface information"""
    name: str = Field(..., description="Interface name (e.g., wlan0)")
    type: InterfaceType = Field(..., description="Interface type")
    status: InterfaceStatus = Field(..., description="Interface status")
    mac_address: Optional[str] = Field(None, description="MAC address")
    is_monitor_capable: bool = Field(False, description="Can be set to monitor mode")

class InterfacesResponse(BaseModel):
    """Response for interfaces endpoint"""
    interfaces: List[NetworkInterface]
    total_count: int

class SecurityType(str, Enum):
    """WiFi security types"""
    OPEN = "Open"
    WEP = "WEP"
    WPA = "WPA"
    WPA2 = "WPA2"
    WPA3 = "WPA3"
    WPS = "WPS"
    UNKNOWN = "Unknown"

class ThreatLevel(str, Enum):
    """Security threat levels"""
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"

class AccessPoint(BaseModel):
    """WiFi Access Point information"""
    bssid: str = Field(..., description="BSSID (MAC address)")
    ssid: str = Field(..., description="Network name")
    signal_dbm: float = Field(..., description="Signal strength in dBm")
    frequency: int = Field(..., description="Frequency in MHz")
    channel: Optional[int] = Field(None, description="WiFi channel")
    security: SecurityType = Field(..., description="Security type")
    vendor: Optional[str] = Field("Unknown", description="Device vendor")
    distance: Optional[float] = Field(0.0, description="Estimated distance in meters")
    vulnerability_score: int = Field(0, description="Vulnerability score (0-100)")
    attack_vectors: List[str] = Field(default_factory=list, description="Possible attack vectors")
    threat_level: ThreatLevel = Field(ThreatLevel.LOW, description="Threat assessment")
    last_seen: datetime = Field(default_factory=datetime.now, description="Last time seen")
    confidence: float = Field(0.0, description="Detection confidence (0.0-1.0)")

class ScanRequest(BaseModel):
    """WiFi scan request"""
    interface: str = Field(..., description="Interface to scan with")
    duration: Optional[int] = Field(5, description="Scan duration in seconds", ge=1, le=60)
    monitor_mode: bool = Field(False, description="Use monitor mode if available")

class ScanResponse(BaseModel):
    """WiFi scan response"""
    scan_id: str = Field(..., description="Unique scan identifier")
    interface: str = Field(..., description="Interface used for scanning")
    access_points: List[AccessPoint]
    total_count: int
    scan_duration: float = Field(..., description="Actual scan duration in seconds")
    timestamp: datetime = Field(default_factory=datetime.now)

class ScanStatus(str, Enum):
    """Scan status types"""
    STARTING = "starting"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"

class ScanStatusResponse(BaseModel):
    """Scan status response"""
    scan_id: str
    status: ScanStatus
    progress: Optional[float] = Field(None, description="Progress percentage (0-100)")
    message: Optional[str] = Field(None, description="Status message")

class ErrorResponse(BaseModel):
    """Error response model"""
    error: str
    message: str
    details: Optional[Dict[str, Any]] = None