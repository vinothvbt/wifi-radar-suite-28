import React from 'react';
import { WiFiAccessPoint } from '@/types/wifi';
import { getThreatColor, getThreatIcon } from '@/utils/mockData';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Shield, Wifi, Clock, MapPin, AlertTriangle, Copy, Download } from 'lucide-react';

interface ThreatPanelProps {
  selectedAP: WiFiAccessPoint | null;
  onClose: () => void;
}

export const ThreatPanel: React.FC<ThreatPanelProps> = ({ selectedAP, onClose }) => {
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

  return (
    <div className="h-full flex flex-col bg-card/50 backdrop-blur border border-border rounded-lg">
      <div className="flex-shrink-0 p-3 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="text-sm font-mono font-semibold flex items-center gap-2">
            <Wifi className="h-4 w-4" />
            Target Analysis
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-6 w-6 p-0">
            ×
          </Button>
        </div>
      </div>
      
      <div className="flex-1 min-h-0 overflow-y-auto p-3 space-y-3">
        <div className="space-y-4">
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

          <Separator className="my-2" />

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
                    selectedAP.threatScore >= 80 ? 'bg-threat-critical' :
                    selectedAP.threatScore >= 60 ? 'bg-threat-high' :
                    selectedAP.threatScore >= 40 ? 'bg-threat-medium' :
                    selectedAP.threatScore >= 20 ? 'bg-threat-low' : 'bg-threat-unknown'
                  }`}
                  style={{ width: `${selectedAP.threatScore}%` }}
                />
              </div>
            </div>
          </div>

          <Separator className="my-2" />

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

          <Separator className="my-2" />

          {/* Vulnerabilities */}
          <div className="space-y-2">
            <h4 className="font-semibold">Detected Vulnerabilities</h4>
            
            {selectedAP.vulnerabilities.length > 0 ? (
              <div className="space-y-2">
                {selectedAP.vulnerabilities.map((vuln, index) => (
                  <Card key={index} className={`${getThreatColor(vuln.severity)} border`}>
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
                      
                      <div className="space-y-1">
                        <div className="text-xs font-semibold">Recommendations:</div>
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
              <div className="text-center text-muted-foreground py-4">
                <Shield className="h-8 w-8 mx-auto mb-2" />
                <div>No known vulnerabilities detected</div>
              </div>
            )}
          </div>

          <Separator className="my-2" />

          {/* Activity Timeline */}
          <div className="space-y-2">
            <h4 className="font-semibold text-sm flex items-center gap-2">
              <Clock className="h-3 w-3" />
              Activity Timeline
            </h4>
            
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">First Seen</span>
                <span className="font-mono">{formatTime(selectedAP.firstSeen)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Last Seen</span>
                <span className="font-mono">{formatTime(selectedAP.lastSeen)}</span>
              </div>
            </div>
          </div>

          <Separator className="my-2" />

          {/* Position Info */}
          <div className="space-y-2">
            <h4 className="font-semibold text-sm flex items-center gap-2">
              <MapPin className="h-3 w-3" />
              Position Data
            </h4>
            
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div>
                <div className="text-muted-foreground">Angle</div>
                <div>{selectedAP.position.angle.toFixed(1)}°</div>
              </div>
              <div>
                <div className="text-muted-foreground">Distance</div>
                <div>{selectedAP.position.distance.toFixed(0)}m</div>
              </div>
            </div>
          </div>

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
      </div>
    </div>
  );
};