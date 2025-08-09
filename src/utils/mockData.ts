import { WiFiAccessPoint, ThreatLevel, Vulnerability } from '@/types/wifi';

const vendors = [
  'Cisco Systems', 'TP-Link', 'Netgear', 'Linksys', 'ASUS', 'D-Link', 
  'Ubiquiti', 'Apple', 'Google', 'Amazon', 'Microsoft', 'Huawei'
];

const securityTypes = [
  ['WPA3-Personal'],
  ['WPA2-Personal'],
  ['WPA2-Enterprise'],
  ['WPA-Personal'],
  ['WEP'],
  [], // Open network
  ['WPS'],
];

const commonSSIDs = [
  'HomeNetwork_5G', 'WiFi-Guest', 'CorporateNet', 'linksys', 'NETGEAR45',
  'MySpectrumWiFi84_5G', 'xfinitywifi', 'ATT-WiFi-7831', 'Verizon_82F1G2',
  'ASUS_5G', 'TP-Link_Router', 'Airport_Express', 'AndroidAP7428',
  'iPhone_Hotspot', 'DIRECT-roku-', 'Smart_TV_WiFi', 'Ring_Doorbell',
  'Tesla_Model3', 'Sonos_Living', 'Nest_Thermostat'
];

function generateVulnerabilities(security: string[], threatLevel: ThreatLevel): Vulnerability[] {
  const vulns: Vulnerability[] = [];
  
  if (security.length === 0) {
    vulns.push({
      id: 'open-network',
      type: 'Open Network',
      severity: 'CRITICAL',
      description: 'Network has no encryption - all traffic visible to attackers',
      recommendations: ['Enable WPA3 or WPA2 encryption', 'Use strong passphrase']
    });
  }
  
  if (security.includes('WEP')) {
    vulns.push({
      id: 'wep-encryption',
      type: 'Weak Encryption',
      severity: 'CRITICAL',
      description: 'WEP encryption can be cracked in minutes',
      cve: 'CVE-2001-0540',
      recommendations: ['Upgrade to WPA2 or WPA3', 'Change default passwords']
    });
  }
  
  if (security.includes('WPS')) {
    vulns.push({
      id: 'wps-enabled',
      type: 'WPS Vulnerability',
      severity: 'HIGH',
      description: 'WPS PIN can be brute-forced',
      cve: 'CVE-2011-5053',
      recommendations: ['Disable WPS', 'Use WPA2/3 with strong password only']
    });
  }
  
  if (Math.random() > 0.7) {
    vulns.push({
      id: 'default-credentials',
      type: 'Default Credentials',
      severity: 'MEDIUM',
      description: 'Router may be using default admin credentials',
      recommendations: ['Change default admin password', 'Disable WPS', 'Update firmware']
    });
  }
  
  return vulns;
}

function calculateThreatLevel(security: string[], signalStrength: number): { level: ThreatLevel, score: number } {
  let score = 0;
  
  // Base score from security
  if (security.length === 0) score = 95; // Open network
  else if (security.includes('WEP')) score = 90;
  else if (security.includes('WPS')) score = 70;
  else if (security.includes('WPA-Personal')) score = 40;
  else if (security.includes('WPA2-Personal')) score = 25;
  else if (security.includes('WPA2-Enterprise')) score = 15;
  else if (security.includes('WPA3-Personal')) score = 10;
  
  // Adjust for signal strength (stronger signal = higher risk)
  const signalFactor = Math.max(0, (signalStrength + 30) / 70); // Normalize -100 to 0 dBm
  score += signalFactor * 20;
  
  // Add some randomness for other factors
  score += Math.random() * 15;
  
  // Clamp to 0-100
  score = Math.max(0, Math.min(100, score));
  
  let level: ThreatLevel;
  if (score >= 80) level = 'CRITICAL';
  else if (score >= 60) level = 'HIGH';
  else if (score >= 40) level = 'MEDIUM';
  else if (score >= 20) level = 'LOW';
  else level = 'UNKNOWN';
  
  return { level, score: Math.round(score) };
}

export function generateMockWiFiData(count: number = 25): WiFiAccessPoint[] {
  const accessPoints: WiFiAccessPoint[] = [];
  
  for (let i = 0; i < count; i++) {
    const security = securityTypes[Math.floor(Math.random() * securityTypes.length)];
    const signalStrength = -30 - Math.random() * 70; // -30 to -100 dBm
    const { level, score } = calculateThreatLevel(security, signalStrength);
    
    const angle = Math.random() * 360;
    const distance = 20 + Math.random() * 80; // 20-100% of radar radius
    
    const ap: WiFiAccessPoint = {
      id: `ap-${i + 1}`,
      ssid: commonSSIDs[Math.floor(Math.random() * commonSSIDs.length)] + (Math.random() > 0.8 ? `_${Math.floor(Math.random() * 99)}` : ''),
      bssid: Array.from({ length: 6 }, () => 
        Math.floor(Math.random() * 256).toString(16).padStart(2, '0')
      ).join(':').toUpperCase(),
      channel: [1, 6, 11, 36, 40, 44, 48, 149, 153, 157, 161][Math.floor(Math.random() * 11)],
      frequency: Math.random() > 0.6 ? 5000 + Math.random() * 1000 : 2400 + Math.random() * 100,
      signalStrength: Math.round(signalStrength),
      security,
      vendor: vendors[Math.floor(Math.random() * vendors.length)],
      firstSeen: new Date(Date.now() - Math.random() * 7200000), // Within last 2 hours
      lastSeen: new Date(Date.now() - Math.random() * 300000), // Within last 5 minutes
      threatLevel: level,
      threatScore: score,
      vulnerabilities: generateVulnerabilities(security, level),
      position: {
        x: Math.random() * 800,
        y: Math.random() * 600,
        angle,
        distance
      }
    };
    
    accessPoints.push(ap);
  }
  
  return accessPoints.sort((a, b) => b.threatScore - a.threatScore);
}

export function getThreatColor(level: ThreatLevel): string {
  switch (level) {
    case 'CRITICAL': return 'threat-critical';
    case 'HIGH': return 'threat-high';
    case 'MEDIUM': return 'threat-medium';
    case 'LOW': return 'threat-low';
    default: return 'threat-unknown';
  }
}

export function getThreatIcon(level: ThreatLevel): string {
  switch (level) {
    case 'CRITICAL': return '🔴';
    case 'HIGH': return '🟠';
    case 'MEDIUM': return '🟡';
    case 'LOW': return '🟢';
    default: return '⚪';
  }
}