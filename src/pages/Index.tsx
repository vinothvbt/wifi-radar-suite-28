import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wifi, Shield, Radar, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/50">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-6">
            <Radar className="w-16 h-16 text-primary mr-4" />
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              WiFi Radar Suite
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Professional WiFi security analysis and penetration testing toolkit with modern web interface
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-12">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Wifi className="w-6 h-6 mr-2 text-primary" />
                Network Discovery
              </CardTitle>
              <CardDescription>
                Discover and analyze nearby wireless networks with advanced scanning capabilities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Interface detection and management</li>
                <li>• Real-time WiFi network scanning</li>
                <li>• Signal strength analysis</li>
                <li>• Channel and frequency mapping</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="w-6 h-6 mr-2 text-primary" />
                Security Analysis
              </CardTitle>
              <CardDescription>
                Comprehensive security assessment and vulnerability detection
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Security protocol identification</li>
                <li>• Threat level assessment</li>
                <li>• Vulnerability scoring</li>
                <li>• Attack vector analysis</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          <Link to="/wifi-radar">
            <Button size="lg" className="text-lg px-8 py-3">
              Launch WiFi Radar
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
          <p className="text-sm text-muted-foreground mt-4">
            Requires FastAPI backend running on port 8000
          </p>
        </div>

        <div className="mt-16 text-center">
          <h2 className="text-2xl font-semibold mb-6">Features</h2>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Wifi className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-medium mb-2">Modern Web UI</h3>
              <p className="text-sm text-muted-foreground">
                Clean, responsive interface built with React and Tailwind CSS
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Radar className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-medium mb-2">FastAPI Backend</h3>
              <p className="text-sm text-muted-foreground">
                High-performance Python backend with async WiFi scanning
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-medium mb-2">Kali Linux Ready</h3>
              <p className="text-sm text-muted-foreground">
                Optimized for Kali Linux with monitor mode support
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;