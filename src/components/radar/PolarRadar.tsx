import React, { useEffect, useRef, useState } from 'react';
import { WiFiAccessPoint } from '@/types/wifi';
import { getThreatColor } from '@/utils/mockData';

interface PolarRadarProps {
  accessPoints: WiFiAccessPoint[];
  selectedAP: WiFiAccessPoint | null;
  onSelectAP: (ap: WiFiAccessPoint | null) => void;
  settings: {
    zoom: number;
    centerX: number;
    centerY: number;
    showGrid: boolean;
    showLabels: boolean;
    sweepSpeed: number;
  };
}

export const PolarRadar: React.FC<PolarRadarProps> = ({
  accessPoints,
  selectedAP,
  onSelectAP,
  settings
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [sweepAngle, setSweepAngle] = useState(0);
  const [hoveredAP, setHoveredAP] = useState<WiFiAccessPoint | null>(null);

  // Animate radar sweep
  useEffect(() => {
    const interval = setInterval(() => {
      setSweepAngle(prev => (prev + 2) % 360);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  // Draw radar
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height } = canvas;
    const centerX = width / 2;
    const centerY = height / 2;
    const maxRadius = Math.min(width, height) / 2 - 40;

    // Clear canvas
    ctx.fillStyle = 'hsl(220, 27%, 6%)';
    ctx.fillRect(0, 0, width, height);

    // Draw concentric circles (range rings)
    if (settings.showGrid) {
      ctx.strokeStyle = 'hsl(160, 30%, 25%)';
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 2]);
      
      for (let i = 1; i <= 4; i++) {
        const radius = (maxRadius / 4) * i;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        ctx.stroke();
      }
      
      // Draw radial lines
      for (let angle = 0; angle < 360; angle += 30) {
        const radians = (angle * Math.PI) / 180;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(
          centerX + maxRadius * Math.cos(radians - Math.PI / 2),
          centerY + maxRadius * Math.sin(radians - Math.PI / 2)
        );
        ctx.stroke();
      }
      
      ctx.setLineDash([]);
    }

    // Draw radar sweep
    const sweepRadians = (sweepAngle * Math.PI) / 180;
    const sweepGradient = ctx.createRadialGradient(
      centerX, centerY, 0,
      centerX, centerY, maxRadius
    );
    sweepGradient.addColorStop(0, 'hsla(160, 84%, 39%, 0.3)');
    sweepGradient.addColorStop(0.7, 'hsla(160, 84%, 39%, 0.1)');
    sweepGradient.addColorStop(1, 'hsla(160, 84%, 39%, 0)');

    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(sweepRadians - Math.PI / 2);
    ctx.fillStyle = sweepGradient;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, maxRadius, -Math.PI / 6, Math.PI / 6);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // Draw access points
    accessPoints.forEach((ap) => {
      const distance = (ap.position.distance / 100) * maxRadius;
      const angle = (ap.position.angle * Math.PI) / 180;
      const x = centerX + distance * Math.cos(angle - Math.PI / 2);
      const y = centerY + distance * Math.sin(angle - Math.PI / 2);

      // Determine colors based on threat level
      let fillColor = 'hsl(160, 20%, 50%)'; // default
      let strokeColor = fillColor;
      let glowColor = fillColor;

      switch (ap.threatLevel) {
        case 'CRITICAL':
          fillColor = 'hsl(0, 84%, 60%)';
          strokeColor = 'hsl(0, 84%, 70%)';
          glowColor = 'hsl(0, 84%, 40%)';
          break;
        case 'HIGH':
          fillColor = 'hsl(25, 95%, 53%)';
          strokeColor = 'hsl(25, 95%, 63%)';
          glowColor = 'hsl(25, 95%, 43%)';
          break;
        case 'MEDIUM':
          fillColor = 'hsl(48, 96%, 53%)';
          strokeColor = 'hsl(48, 96%, 63%)';
          glowColor = 'hsl(48, 96%, 43%)';
          break;
        case 'LOW':
          fillColor = 'hsl(160, 84%, 39%)';
          strokeColor = 'hsl(160, 84%, 49%)';
          glowColor = 'hsl(160, 84%, 29%)';
          break;
      }

      const isSelected = selectedAP?.id === ap.id;
      const isHovered = hoveredAP?.id === ap.id;
      const size = isSelected ? 8 : isHovered ? 6 : 4;

      // Draw glow effect for selected/hovered
      if (isSelected || isHovered) {
        ctx.shadowColor = glowColor;
        ctx.shadowBlur = 15;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
      }

      // Draw AP dot
      ctx.fillStyle = fillColor;
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, 2 * Math.PI);
      ctx.fill();
      ctx.stroke();

      // Reset shadow
      ctx.shadowBlur = 0;

      // Draw pulse animation for critical threats
      if (ap.threatLevel === 'CRITICAL') {
        const pulseRadius = size + Math.sin(Date.now() * 0.01) * 4;
        ctx.strokeStyle = `hsla(0, 84%, 60%, 0.4)`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(x, y, pulseRadius, 0, 2 * Math.PI);
        ctx.stroke();
      }

      // Draw labels if enabled
      if (settings.showLabels && (isSelected || isHovered)) {
        ctx.fillStyle = 'hsl(160, 84%, 78%)';
        ctx.font = '10px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(ap.ssid, x, y - size - 8);
      }
    });

    // Draw range labels
    if (settings.showGrid) {
      ctx.fillStyle = 'hsl(160, 60%, 70%)';
      ctx.font = '10px monospace';
      ctx.textAlign = 'center';
      
      for (let i = 1; i <= 4; i++) {
        const radius = (maxRadius / 4) * i;
        const range = (100 / 4) * i;
        ctx.fillText(`${range}m`, centerX + radius - 10, centerY - 5);
      }
    }
  }, [accessPoints, selectedAP, hoveredAP, sweepAngle, settings]);

  // Handle clicks
  const handleCanvasClick = (event: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const maxRadius = Math.min(canvas.width, canvas.height) / 2 - 40;

    // Find clicked AP
    let clickedAP: WiFiAccessPoint | null = null;
    let minDistance = Infinity;

    accessPoints.forEach((ap) => {
      const distance = (ap.position.distance / 100) * maxRadius;
      const angle = (ap.position.angle * Math.PI) / 180;
      const apX = centerX + distance * Math.cos(angle - Math.PI / 2);
      const apY = centerY + distance * Math.sin(angle - Math.PI / 2);

      const clickDistance = Math.sqrt((x - apX) ** 2 + (y - apY) ** 2);
      
      if (clickDistance < 10 && clickDistance < minDistance) {
        clickedAP = ap;
        minDistance = clickDistance;
      }
    });

    onSelectAP(clickedAP === selectedAP ? null : clickedAP);
  };

  // Handle hover
  const handleCanvasMouseMove = (event: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const maxRadius = Math.min(canvas.width, canvas.height) / 2 - 40;

    // Find hovered AP
    let hoveredAP: WiFiAccessPoint | null = null;
    let minDistance = Infinity;

    accessPoints.forEach((ap) => {
      const distance = (ap.position.distance / 100) * maxRadius;
      const angle = (ap.position.angle * Math.PI) / 180;
      const apX = centerX + distance * Math.cos(angle - Math.PI / 2);
      const apY = centerY + distance * Math.sin(angle - Math.PI / 2);

      const hoverDistance = Math.sqrt((x - apX) ** 2 + (y - apY) ** 2);
      
      if (hoverDistance < 10 && hoverDistance < minDistance) {
        hoveredAP = ap;
        minDistance = hoverDistance;
      }
    });

    setHoveredAP(hoveredAP);
  };

  return (
    <div className="relative w-full h-full bg-radar-background rounded-lg overflow-hidden">
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        className="w-full h-full cursor-crosshair"
        onClick={handleCanvasClick}
        onMouseMove={handleCanvasMouseMove}
        onMouseLeave={() => setHoveredAP(null)}
      />
      
      {/* Radar overlay UI */}
      <div className="absolute top-2 left-2 text-primary font-mono text-xs">{/* Smaller overlay text */}
        <div>RADAR: POLAR</div>
        <div>TARGETS: {accessPoints.length}</div>
      </div>
      
      {/* Quick hover tooltip */}
      {hoveredAP && (
        <div className="absolute bottom-2 left-2 bg-card/90 backdrop-blur border border-border rounded p-2 text-xs font-mono">
          <div className="text-foreground font-bold">{hoveredAP.ssid}</div>
          <div className="text-muted-foreground">
            {hoveredAP.signalStrength}dBm | 
            <span className={`${getThreatColor(hoveredAP.threatLevel)} font-bold ml-1`}>
              {hoveredAP.threatLevel}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};