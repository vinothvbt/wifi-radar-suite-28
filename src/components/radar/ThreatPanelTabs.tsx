import React from 'react';
import { WiFiAccessPoint } from '@/types/wifi';
import { getThreatColor, getThreatIcon } from '@/utils/mockData';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  Shield, 
  Wifi, 
  Clock, 
  MapPin, 
  AlertTriangle, 
  Copy, 
  Download,
  Zap,
  Target,
  Activity,
  Settings,
  Bug,
  Sword,
  Crosshair,
  Radar
} from 'lucide-react';

interface ThreatPanelTabsProps {
  selectedAP: WiFiAccessPoint | null;
  onClose: () => void;
}

export const ThreatPanelTabs: React.FC<ThreatPanelTabsProps> = ({ selectedAP, onClose }) => {
  if (!selectedAP) {
    return (
      <div className="h-full flex flex-col bg-card/50 backdrop-blur border border-border rounded-lg">
        <div className="flex-1 flex items-center justify-center text-center p-4">
          <div className="space-y-3">
            <Shield className="h-12 w-12 mx-auto text-muted-foreground" />
            <div>
              <h3 className="text-base font-semibold">No Target Selected</h3>
              <p className="text-sm text-muted-foreground">Click on an access point to analyze threats</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const attackVectors = [
    { name: 'WPS PIN Attack', difficulty: 'Easy', impact: 'High', tools: ['Reaver', 'Bully'] },
    { name: 'Deauth Attack', difficulty: 'Easy', impact: 'Medium', tools: ['Aireplay-ng', 'mdk3'] },
    { name: 'Evil Twin', difficulty: 'Medium', impact: 'High', tools: ['Hostapd', 'DNSMasq'] },
    { name: 'KRACK Attack', difficulty: 'Hard', impact: 'Critical', tools: ['krackattacks-scripts'] },
    { name: 'Brute Force', difficulty: 'Medium', impact: 'High', tools: ['Aircrack-ng', 'Hashcat'] }
  ];

  const toolsKit = [
    { category: 'Reconnaissance', tools: ['Airodump-ng', 'Kismet', 'Wireshark', 'Nmap'] },
    { category: 'Attack', tools: ['Aircrack-ng', 'Reaver', 'Wifite', 'Fluxion'] },
    { category: 'Analysis', tools: ['Wireshark', 'tshark', 'NetworkMiner', 'Fern'] },
    { category: 'Post-Exploitation', tools: ['Ettercap', 'Bettercap', 'MITMf', 'SSLstrip'] }
  ];

  return (
    <div className="h-full flex flex-col bg-card/50 backdrop-blur border border-border rounded-lg">
      <div className="flex-shrink-0 p-3 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="text-sm font-mono font-semibold flex items-center gap-2">
            <Target className="h-4 w-4" />
            {selectedAP.ssid}
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-6 w-6 p-0">
            ×
          </Button>
        </div>
      </div>
      
      <div className="flex-1 min-h-0 overflow-hidden">
        <Tabs defaultValue="overview" className="h-full flex flex-col">
          <TabsList className="grid w-full grid-cols-5 mx-3 mt-3">
            <TabsTrigger value="overview" className="text-xs">
              <Wifi className="h-3 w-3 mr-1" />
              Info
            </TabsTrigger>
            <TabsTrigger value="vulnerabilities" className="text-xs">
              <Bug className="h-3 w-3 mr-1" />
              Vulns
            </TabsTrigger>
            <TabsTrigger value="attacks" className="text-xs">
              <Sword className="h-3 w-3 mr-1" />
              Attacks
            </TabsTrigger>
            <TabsTrigger value="tools" className="text-xs">
              <Settings className="h-3 w-3 mr-1" />
              Tools
            </TabsTrigger>
            <TabsTrigger value="activity" className="text-xs">
              <Activity className="h-3 w-3 mr-1" />
              Activity
            </TabsTrigger>
          </TabsList>
          
          <div className="flex-1 min-h-0 overflow-y-auto p-3 space-y-3">
            <TabsContent value="overview" className="mt-0 space-y-4">
              {/* Basic Info */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-mono text-base font-bold">{selectedAP.ssid}</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(selectedAP.ssid)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div>
                    <div className="text-muted-foreground">BSSID</div>
                    <div className="flex items-center gap-2">
                      <span>{selectedAP.bssid}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(selectedAP.bssid)}
                        className="h-4 w-4 p-0"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Channel</div>
                    <div>{selectedAP.channel}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Frequency</div>
                    <div>{selectedAP.frequency.toFixed(0)} MHz</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Signal</div>
                    <div>{selectedAP.signalStrength} dBm</div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Aggressive Reconnaissance Actions */}
              <div className="space-y-3">
                <h4 className="font-semibold flex items-center gap-2">
                  <Crosshair className="h-4 w-4" />
                  Advanced Reconnaissance
                </h4>
                
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-xs h-8"
                    onClick={() => alert('Getting MAC details...')}
                  >
                    <Activity className="h-3 w-3 mr-1" />
                    MAC Details
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-xs h-8"
                    onClick={() => alert('Deep scanning...')}
                  >
                    <Radar className="h-3 w-3 mr-1" />
                    Deep Scan
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-xs h-8"
                    onClick={() => alert('Probing clients...')}
                  >
                    <Wifi className="h-3 w-3 mr-1" />
                    Client Probe
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-xs h-8"
                    onClick={() => alert('Signal analysis...')}
                  >
                    <Target className="h-3 w-3 mr-1" />
                    Signal Intel
                  </Button>
                </div>
                
                <Button 
                  variant="destructive" 
                  size="sm" 
                  className="w-full text-xs"
                  onClick={() => alert('Initiating aggressive fingerprinting...')}
                >
                  <Sword className="h-3 w-3 mr-1" />
                  Aggressive Fingerprint
                </Button>
              </div>

              <Separator />

              {/* Threat Assessment */}
              <div className="space-y-2">
                <h4 className="font-semibold flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Threat Assessment
                </h4>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span>Threat Level</span>
                    <Badge className={getThreatColor(selectedAP.threatLevel)}>
                      {getThreatIcon(selectedAP.threatLevel)} {selectedAP.threatLevel}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span>Risk Score</span>
                    <span className="font-mono font-bold">{selectedAP.threatScore}/100</span>
                  </div>
                  
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${
                        selectedAP.threatScore >= 80 ? 'bg-red-500' :
                        selectedAP.threatScore >= 60 ? 'bg-orange-500' :
                        selectedAP.threatScore >= 40 ? 'bg-yellow-500' :
                        selectedAP.threatScore >= 20 ? 'bg-green-500' : 'bg-gray-500'
                      }`}
                      style={{ width: `${selectedAP.threatScore}%` }}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Security Info */}
              <div className="space-y-2">
                <h4 className="font-semibold flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Security
                </h4>
                
                <div className="space-y-2">
                  <div>
                    <div className="text-muted-foreground text-sm">Encryption</div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedAP.security.length > 0 ? (
                        selectedAP.security.map((sec, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {sec}
                          </Badge>
                        ))
                      ) : (
                        <Badge variant="destructive" className="text-xs">
                          OPEN - No Encryption
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-muted-foreground text-sm">Vendor</div>
                    <div>{selectedAP.vendor}</div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="vulnerabilities" className="mt-0 space-y-4">
              {selectedAP.vulnerabilities.length > 0 ? (
                <div className="space-y-3">
                  {selectedAP.vulnerabilities.map((vuln, index) => (
                    <Card key={index} className="border">
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="font-semibold text-sm">{vuln.type}</h5>
                          <Badge className={getThreatColor(vuln.severity)}>
                            {vuln.severity}
                          </Badge>
                        </div>
                        
                        <p className="text-xs text-muted-foreground mb-2">
                          {vuln.description}
                        </p>
                        
                        {vuln.cve && (
                          <div className="text-xs font-mono text-muted-foreground mb-2">
                            CVE: {vuln.cve}
                          </div>
                        )}

                        {/* Detailed Vulnerability Information */}
                        <div className="space-y-2 mt-3">
                          <div className="text-xs space-y-1">
                            <div className="font-semibold">CVSS Score:</div>
                            <div className="font-mono text-muted-foreground">
                              {vuln.severity === 'CRITICAL' ? '9.0-10.0' :
                               vuln.severity === 'HIGH' ? '7.0-8.9' :
                               vuln.severity === 'MEDIUM' ? '4.0-6.9' : '0.1-3.9'}
                            </div>
                          </div>
                          
                          <div className="text-xs space-y-1">
                            <div className="font-semibold">Attack Vector:</div>
                            <div className="text-muted-foreground">
                              {vuln.type.includes('WPS') ? 'Network Adjacent' :
                               vuln.type.includes('WEP') ? 'Network Adjacent' :
                               vuln.type.includes('Management') ? 'Network Adjacent' : 'Remote'}
                            </div>
                          </div>

                          <div className="text-xs space-y-1">
                            <div className="font-semibold">Exploitation Complexity:</div>
                            <div className="text-muted-foreground">
                              {vuln.severity === 'CRITICAL' ? 'Low' :
                               vuln.severity === 'HIGH' ? 'Low' :
                               vuln.severity === 'MEDIUM' ? 'Medium' : 'High'}
                            </div>
                          </div>

                          <div className="text-xs space-y-1">
                            <div className="font-semibold">Potential Impact:</div>
                            <div className="text-muted-foreground">
                              {vuln.type.includes('WPS') ? 'Complete network compromise' :
                               vuln.type.includes('WEP') ? 'Traffic interception and injection' :
                               vuln.type.includes('Management') ? 'Client disconnection and MitM' : 
                               'Information disclosure'}
                            </div>
                          </div>

                          <div className="text-xs space-y-1">
                            <div className="font-semibold">Common Exploits:</div>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {vuln.type.includes('WPS') ? (
                                <>
                                  <Badge variant="outline" className="text-xs">Reaver</Badge>
                                  <Badge variant="outline" className="text-xs">Bully</Badge>
                                  <Badge variant="outline" className="text-xs">PixieWPS</Badge>
                                </>
                              ) : vuln.type.includes('WEP') ? (
                                <>
                                  <Badge variant="outline" className="text-xs">Aircrack-ng</Badge>
                                  <Badge variant="outline" className="text-xs">ChopChop</Badge>
                                  <Badge variant="outline" className="text-xs">Fragmentation</Badge>
                                </>
                              ) : (
                                <>
                                  <Badge variant="outline" className="text-xs">Aireplay-ng</Badge>
                                  <Badge variant="outline" className="text-xs">mdk3</Badge>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-1 mt-3">
                          <div className="text-xs font-semibold">Remediation Steps:</div>
                          <ul className="text-xs space-y-0.5">
                            {vuln.recommendations.map((rec, recIndex) => (
                              <li key={recIndex} className="list-disc list-inside text-muted-foreground">
                                {rec}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  <Shield className="h-12 w-12 mx-auto mb-2" />
                  <div>No known vulnerabilities detected</div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="attacks" className="mt-0 space-y-4">
              <div className="space-y-3">
                <h4 className="font-semibold flex items-center gap-2">
                  <Crosshair className="h-4 w-4" />
                  Attack Vectors
                </h4>
                {attackVectors.map((attack, index) => (
                  <Card key={index} className="border">
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-semibold text-sm">{attack.name}</h5>
                        <div className="flex gap-1">
                          <Badge variant="outline" className="text-xs">
                            {attack.difficulty}
                          </Badge>
                          <Badge 
                            className={`text-xs ${
                              attack.impact === 'Critical' ? 'bg-red-500' :
                              attack.impact === 'High' ? 'bg-orange-500' :
                              'bg-yellow-500'
                            }`}
                          >
                            {attack.impact}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="space-y-1">
                        <div className="text-xs font-semibold">Required Tools:</div>
                        <div className="flex flex-wrap gap-1">
                          {attack.tools.map((tool, toolIndex) => (
                            <Badge key={toolIndex} variant="secondary" className="text-xs">
                              {tool}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="tools" className="mt-0 space-y-4">
              <div className="space-y-3">
                <h4 className="font-semibold flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  Penetration Testing Toolkit
                </h4>
                {toolsKit.map((category, index) => (
                  <Card key={index} className="border">
                    <CardContent className="p-3">
                      <h5 className="font-semibold text-sm mb-2">{category.category}</h5>
                      <div className="flex flex-wrap gap-1">
                        {category.tools.map((tool, toolIndex) => (
                          <Badge key={toolIndex} variant="outline" className="text-xs">
                            {tool}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="activity" className="mt-0 space-y-4">
              <div className="space-y-3">
                <h4 className="font-semibold flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Activity Timeline
                </h4>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">First Seen</span>
                    <span className="font-mono">{formatTime(selectedAP.firstSeen)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Last Seen</span>
                    <span className="font-mono">{formatTime(selectedAP.lastSeen)}</span>
                  </div>
                </div>

                <Separator />

                <h4 className="font-semibold flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Position Data
                </h4>
                
                <div className="grid grid-cols-2 gap-2 text-sm font-mono">
                  <div>
                    <div className="text-muted-foreground">Angle</div>
                    <div>{selectedAP.position.angle.toFixed(1)}°</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Distance</div>
                    <div>{selectedAP.position.distance.toFixed(0)}m</div>
                  </div>
                </div>

                <Separator />

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2">
                  <Button size="sm" className="flex-1 text-xs">
                    <Download className="h-3 w-3 mr-1" />
                    Export
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1 text-xs">
                    Monitor
                  </Button>
                </div>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
};