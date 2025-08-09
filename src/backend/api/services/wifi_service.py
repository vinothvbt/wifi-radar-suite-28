#!/usr/bin/env python3
"""
WiFi Service - Core WiFi functionality without PyQt dependencies
Extracted from original PyQt-based WiFi scanner
"""

import os
import re
import subprocess
import logging
import time
from typing import List, Dict, Optional, Tuple
from dataclasses import dataclass
from datetime import datetime

from ..models import NetworkInterface, InterfaceStatus, InterfaceType, AccessPoint, SecurityType, ThreatLevel

logger = logging.getLogger(__name__)

@dataclass 
class WiFiScanResult:
    """Result of a WiFi scan operation"""
    access_points: List[AccessPoint]
    duration: float
    interface: str
    timestamp: datetime
    success: bool
    error_message: Optional[str] = None

class WiFiService:
    """WiFi interface detection and scanning service"""
    
    def __init__(self):
        self._available_interfaces: List[str] = []
        self._compile_patterns()
        
    def _compile_patterns(self):
        """Compile regex patterns for parsing WiFi scan output"""
        try:
            self.mac_pattern = re.compile(r"([0-9a-fA-F]{2}:[0-9a-fA-F]{2}:[0-9a-fA-F]{2}:[0-9a-fA-F]{2}:[0-9a-fA-F]{2}:[0-9a-fA-F]{2})")
            self.signal_pattern = re.compile(r"signal:\s*(-\d+\.?\d*)\s*dBm")
            self.freq_pattern = re.compile(r"freq:\s*(\d+)")
            self.ssid_pattern = re.compile(r"SSID:\s*(.+)")
            logger.info("WiFi parsing patterns compiled successfully")
        except re.error as e:
            logger.error(f"Error compiling regex patterns: {e}")
            raise
    
    async def get_interfaces(self) -> List[NetworkInterface]:
        """Get all available network interfaces"""
        interfaces = []
        
        # Detect wireless interfaces
        wireless_interfaces = await self._detect_wireless_interfaces()
        
        for iface_name in wireless_interfaces:
            # Get interface details
            interface_info = await self._get_interface_info(iface_name)
            interfaces.append(interface_info)
            
        self._available_interfaces = [iface.name for iface in interfaces if iface.type == InterfaceType.WIRELESS]
        logger.info(f"Found {len(interfaces)} interfaces, {len(self._available_interfaces)} wireless")
        
        return interfaces
    
    async def _detect_wireless_interfaces(self) -> List[str]:
        """Detect available wireless interfaces using multiple methods"""
        interfaces = []
        
        try:
            # Method 1: iw dev
            iw_interfaces = await self._try_iw_detection()
            interfaces.extend(iw_interfaces)
            
            # Method 2: iwconfig (fallback)
            if not interfaces:
                iwconfig_interfaces = await self._try_iwconfig_detection()
                interfaces.extend(iwconfig_interfaces)
            
            # Method 3: Check /sys/class/net (last resort)
            if not interfaces:
                sys_interfaces = await self._try_sys_detection()
                interfaces.extend(sys_interfaces)
                
        except Exception as e:
            logger.error(f"Interface detection failed: {e}")
            
        # Remove duplicates while preserving order
        seen = set()
        unique_interfaces = []
        for iface in interfaces:
            if iface not in seen:
                seen.add(iface)
                unique_interfaces.append(iface)
                
        return unique_interfaces
    
    async def _try_iw_detection(self) -> List[str]:
        """Try detecting interfaces using iw command"""
        interfaces = []
        try:
            result = subprocess.run(['iw', 'dev'], capture_output=True, text=True, timeout=5)
            if result.returncode == 0:
                for line in result.stdout.split('\n'):
                    if 'Interface' in line:
                        interface = line.split()[-1]
                        if interface:
                            interfaces.append(interface)
            logger.debug(f"iw detected interfaces: {interfaces}")
        except (subprocess.TimeoutExpired, FileNotFoundError, subprocess.SubprocessError) as e:
            logger.debug(f"iw detection failed: {e}")
            
        return interfaces
    
    async def _try_iwconfig_detection(self) -> List[str]:
        """Try detecting interfaces using iwconfig command"""
        interfaces = []
        try:
            result = subprocess.run(['iwconfig'], capture_output=True, text=True, timeout=5)
            if result.returncode == 0:
                for line in result.stdout.split('\n'):
                    if 'IEEE 802.11' in line:
                        interface = line.split()[0]
                        if interface:
                            interfaces.append(interface)
            logger.debug(f"iwconfig detected interfaces: {interfaces}")
        except (subprocess.TimeoutExpired, FileNotFoundError, subprocess.SubprocessError) as e:
            logger.debug(f"iwconfig detection failed: {e}")
            
        return interfaces
    
    async def _try_sys_detection(self) -> List[str]:
        """Try detecting interfaces from /sys/class/net"""
        interfaces = []
        try:
            common_names = ['wlan0', 'wlan1', 'wlp2s0', 'wlp3s0', 'wifi0']
            
            for name in common_names:
                if os.path.exists(f'/sys/class/net/{name}'):
                    # Verify it's a wireless interface
                    if os.path.exists(f'/sys/class/net/{name}/wireless'):
                        interfaces.append(name)
            
            # Check for USB WiFi adapters with pattern wlx*
            try:
                for entry in os.listdir('/sys/class/net'):
                    if entry.startswith('wlx') and os.path.exists(f'/sys/class/net/{entry}/wireless'):
                        interfaces.append(entry)
            except OSError:
                pass
                
            logger.debug(f"sys detection found interfaces: {interfaces}")
        except Exception as e:
            logger.debug(f"sys detection failed: {e}")
            
        return interfaces
    
    async def _get_interface_info(self, interface_name: str) -> NetworkInterface:
        """Get detailed information about a network interface"""
        try:
            # Check if interface exists
            if not os.path.exists(f'/sys/class/net/{interface_name}'):
                return NetworkInterface(
                    name=interface_name,
                    type=InterfaceType.UNKNOWN,
                    status=InterfaceStatus.UNKNOWN
                )
            
            # Determine interface type
            is_wireless = os.path.exists(f'/sys/class/net/{interface_name}/wireless')
            interface_type = InterfaceType.WIRELESS if is_wireless else InterfaceType.ETHERNET
            
            # Get interface status
            status = InterfaceStatus.UNKNOWN
            try:
                with open(f'/sys/class/net/{interface_name}/operstate', 'r') as f:
                    state = f.read().strip().lower()
                    if state == 'up':
                        status = InterfaceStatus.UP
                    elif state == 'down':
                        status = InterfaceStatus.DOWN
            except (OSError, IOError):
                pass
            
            # Get MAC address
            mac_address = None
            try:
                with open(f'/sys/class/net/{interface_name}/address', 'r') as f:
                    mac_address = f.read().strip()
            except (OSError, IOError):
                pass
            
            # Check monitor mode capability (for wireless interfaces)
            is_monitor_capable = False
            if is_wireless:
                is_monitor_capable = await self._check_monitor_capability(interface_name)
            
            return NetworkInterface(
                name=interface_name,
                type=interface_type,
                status=status,
                mac_address=mac_address,
                is_monitor_capable=is_monitor_capable
            )
            
        except Exception as e:
            logger.error(f"Error getting interface info for {interface_name}: {e}")
            return NetworkInterface(
                name=interface_name,
                type=InterfaceType.UNKNOWN,
                status=InterfaceStatus.UNKNOWN
            )
    
    async def _check_monitor_capability(self, interface: str) -> bool:
        """Check if interface supports monitor mode"""
        try:
            result = subprocess.run(['iw', interface, 'info'], capture_output=True, text=True, timeout=5)
            if result.returncode == 0:
                # Check supported interface modes
                result = subprocess.run(['iw', 'phy', f'phy{interface[-1] if interface[-1].isdigit() else "0"}', 'info'], 
                                      capture_output=True, text=True, timeout=5)
                if result.returncode == 0 and 'monitor' in result.stdout:
                    return True
        except (subprocess.TimeoutExpired, FileNotFoundError, subprocess.SubprocessError):
            pass
        return False
    
    async def scan_wifi(self, interface: str, duration: int = 5) -> WiFiScanResult:
        """Perform WiFi scan on specified interface"""
        start_time = time.time()
        
        if interface not in self._available_interfaces:
            available = await self.get_interfaces()
            wireless_names = [iface.name for iface in available if iface.type == InterfaceType.WIRELESS]
            if interface not in wireless_names:
                return WiFiScanResult(
                    access_points=[],
                    duration=0.0,
                    interface=interface,
                    timestamp=datetime.now(),
                    success=False,
                    error_message=f"Interface {interface} not found or not wireless"
                )
        
        try:
            logger.info(f"Starting WiFi scan on {interface} for {duration} seconds")
            
            # Try iw scan first
            access_points = await self._scan_with_iw(interface)
            
            # Fallback to iwlist if iw fails
            if not access_points:
                access_points = await self._scan_with_iwlist(interface)
            
            end_time = time.time()
            scan_duration = end_time - start_time
            
            logger.info(f"Scan completed. Found {len(access_points)} access points in {scan_duration:.2f}s")
            
            return WiFiScanResult(
                access_points=access_points,
                duration=scan_duration,
                interface=interface,
                timestamp=datetime.now(),
                success=True
            )
            
        except Exception as e:
            logger.error(f"WiFi scan failed: {e}")
            return WiFiScanResult(
                access_points=[],
                duration=time.time() - start_time,
                interface=interface,
                timestamp=datetime.now(),
                success=False,
                error_message=str(e)
            )
    
    async def _scan_with_iw(self, interface: str) -> List[AccessPoint]:
        """Perform scan using iw command"""
        try:
            cmd = ['sudo', 'iw', 'dev', interface, 'scan']
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
            
            if result.returncode == 0:
                return self._parse_iw_output(result.stdout)
            else:
                logger.warning(f"iw scan failed with code {result.returncode}: {result.stderr}")
                
        except (subprocess.TimeoutExpired, FileNotFoundError, subprocess.SubprocessError) as e:
            logger.warning(f"iw scan command failed: {e}")
            
        return []
    
    async def _scan_with_iwlist(self, interface: str) -> List[AccessPoint]:
        """Perform scan using iwlist command (fallback)"""
        try:
            cmd = ['sudo', 'iwlist', interface, 'scan']
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
            
            if result.returncode == 0:
                return self._parse_iwlist_output(result.stdout)
            else:
                logger.warning(f"iwlist scan failed with code {result.returncode}: {result.stderr}")
                
        except (subprocess.TimeoutExpired, FileNotFoundError, subprocess.SubprocessError) as e:
            logger.warning(f"iwlist scan command failed: {e}")
            
        return []
    
    def _parse_iw_output(self, output: str) -> List[AccessPoint]:
        """Parse iw scan output"""
        access_points = []
        current_ap = {}
        
        for line in output.split('\n'):
            line = line.strip()
            
            # New BSS entry
            if line.startswith('BSS '):
                if current_ap and 'bssid' in current_ap:
                    ap = self._create_access_point(current_ap)
                    if ap:
                        access_points.append(ap)
                current_ap = {'bssid': line.split()[1].split('(')[0]}
            
            # SSID
            elif line.startswith('SSID: '):
                current_ap['ssid'] = line[6:] or f"Hidden_{current_ap.get('bssid', 'Unknown')}"
            
            # Signal strength
            elif 'signal:' in line:
                match = self.signal_pattern.search(line)
                if match:
                    current_ap['signal_dbm'] = float(match.group(1))
            
            # Frequency
            elif 'freq:' in line:
                match = self.freq_pattern.search(line)
                if match:
                    current_ap['frequency'] = int(match.group(1))
            
            # Security information
            elif any(sec in line.lower() for sec in ['wpa', 'wep', 'privacy']):
                current_ap.setdefault('security_info', []).append(line)
        
        # Process the last AP
        if current_ap and 'bssid' in current_ap:
            ap = self._create_access_point(current_ap)
            if ap:
                access_points.append(ap)
        
        return access_points
    
    def _parse_iwlist_output(self, output: str) -> List[AccessPoint]:
        """Parse iwlist scan output"""
        access_points = []
        current_ap = {}
        
        for line in output.split('\n'):
            line = line.strip()
            
            # Cell/Access Point entry
            if 'Address:' in line and 'Cell' in line:
                if current_ap and 'bssid' in current_ap:
                    ap = self._create_access_point(current_ap)
                    if ap:
                        access_points.append(ap)
                        
                mac_match = self.mac_pattern.search(line)
                if mac_match:
                    current_ap = {'bssid': mac_match.group(1)}
            
            # ESSID/SSID
            elif 'ESSID:' in line:
                essid = line.split('ESSID:')[1].strip().strip('"')
                current_ap['ssid'] = essid or f"Hidden_{current_ap.get('bssid', 'Unknown')}"
            
            # Signal level
            elif 'Signal level=' in line:
                signal_str = line.split('Signal level=')[1].split()[0]
                if 'dBm' in signal_str:
                    try:
                        current_ap['signal_dbm'] = float(signal_str.replace('dBm', ''))
                    except ValueError:
                        pass
            
            # Frequency
            elif 'Frequency:' in line:
                freq_str = line.split('Frequency:')[1].split()[0]
                try:
                    # Convert GHz to MHz
                    freq_ghz = float(freq_str)
                    current_ap['frequency'] = int(freq_ghz * 1000)
                except ValueError:
                    pass
            
            # Security information
            elif any(sec in line for sec in ['Encryption', 'Authentication', 'WPA', 'WEP']):
                current_ap.setdefault('security_info', []).append(line)
        
        # Process the last AP
        if current_ap and 'bssid' in current_ap:
            ap = self._create_access_point(current_ap)
            if ap:
                access_points.append(ap)
        
        return access_points
    
    def _create_access_point(self, ap_data: Dict) -> Optional[AccessPoint]:
        """Create AccessPoint object from parsed data"""
        try:
            bssid = ap_data.get('bssid', '')
            ssid = ap_data.get('ssid', f"Hidden_{bssid}")
            signal_dbm = ap_data.get('signal_dbm', -100.0)
            frequency = ap_data.get('frequency', 0)
            
            if not bssid:
                return None
            
            # Determine security type
            security = self._determine_security_type(ap_data.get('security_info', []))
            
            # Calculate channel from frequency
            channel = self._frequency_to_channel(frequency)
            
            # Basic threat assessment
            threat_level = self._assess_threat_level(security, signal_dbm)
            
            return AccessPoint(
                bssid=bssid,
                ssid=ssid,
                signal_dbm=signal_dbm,
                frequency=frequency,
                channel=channel,
                security=security,
                threat_level=threat_level,
                confidence=0.8  # Default confidence for successful parse
            )
            
        except Exception as e:
            logger.warning(f"Failed to create AccessPoint from data {ap_data}: {e}")
            return None
    
    def _determine_security_type(self, security_info: List[str]) -> SecurityType:
        """Determine security type from security information"""
        security_text = ' '.join(security_info).lower()
        
        if 'wpa3' in security_text:
            return SecurityType.WPA3
        elif 'wpa2' in security_text or 'rsn' in security_text:
            return SecurityType.WPA2
        elif 'wpa' in security_text:
            return SecurityType.WPA
        elif 'wep' in security_text or 'privacy' in security_text:
            return SecurityType.WEP
        elif 'wps' in security_text:
            return SecurityType.WPS
        elif not security_info or 'none' in security_text:
            return SecurityType.OPEN
        else:
            return SecurityType.UNKNOWN
    
    def _frequency_to_channel(self, frequency: int) -> Optional[int]:
        """Convert frequency to WiFi channel"""
        if frequency == 0:
            return None
            
        # 2.4 GHz channels
        if 2412 <= frequency <= 2484:
            if frequency == 2484:
                return 14
            else:
                return (frequency - 2412) // 5 + 1
        
        # 5 GHz channels (simplified)
        elif 5170 <= frequency <= 5825:
            return (frequency - 5000) // 5
        
        return None
    
    def _assess_threat_level(self, security: SecurityType, signal_dbm: float) -> ThreatLevel:
        """Basic threat level assessment"""
        if security == SecurityType.OPEN:
            return ThreatLevel.HIGH if signal_dbm > -60 else ThreatLevel.MEDIUM
        elif security in [SecurityType.WEP, SecurityType.WPS]:
            return ThreatLevel.MEDIUM if signal_dbm > -70 else ThreatLevel.LOW
        elif security in [SecurityType.WPA, SecurityType.WPA2]:
            return ThreatLevel.LOW
        elif security == SecurityType.WPA3:
            return ThreatLevel.LOW
        else:
            return ThreatLevel.LOW

# Global service instance
wifi_service = WiFiService()