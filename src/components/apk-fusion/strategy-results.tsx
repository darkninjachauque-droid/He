"use client";

import { OptimizeApkInjectionOutput } from '@/ai/flows/optimize-apk-injection-flow';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Terminal, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRightCircle,
  Download,
  Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export function StrategyResults({ result }: { result: OptimizeApkInjectionOutput }) {
  return (
    <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
      <Card className="border-primary/20 shadow-xl overflow-hidden">
        <CardHeader className="bg-primary/5 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-6 w-6 text-primary" />
              <CardTitle>AI Injection Strategy</CardTitle>
            </div>
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
              Optimal Match Found
            </Badge>
          </div>
          <CardDescription className="text-base text-foreground/80 pt-2 italic">
            "{result.strategyDescription}"
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="grid grid-cols-1 md:grid-cols-2">
            <div className="p-6 space-y-4 border-b md:border-b-0 md:border-r">
              <div className="flex items-center gap-2 mb-2">
                <Terminal className="h-5 w-5 text-accent" />
                <h3 className="font-bold">Implementation Steps</h3>
              </div>
              <ul className="space-y-3">
                {result.steps.map((step, idx) => (
                  <li key={idx} className="flex gap-3 text-sm group">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-accent/10 text-accent flex items-center justify-center font-bold text-xs">
                      {idx + 1}
                    </span>
                    <span className="text-muted-foreground group-hover:text-foreground transition-colors">{step}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-6 space-y-6 bg-muted/20">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-amber-600">
                  <AlertTriangle className="h-5 w-5" />
                  <h3 className="font-bold">Key Considerations</h3>
                </div>
                <ul className="space-y-2">
                  {result.considerations.map((c, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs text-muted-foreground">
                      <div className="mt-1 flex-shrink-0 w-1.5 h-1.5 rounded-full bg-amber-400" />
                      {c}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 rounded-lg bg-card border shadow-sm space-y-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  <h4 className="text-sm font-bold">Security & Integrity</h4>
                </div>
                <div className="space-y-2">
                  <div>
                    <p className="text-[10px] uppercase font-bold text-muted-foreground">Security Implications</p>
                    <p className="text-xs">{result.securityImplications}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-muted-foreground">Integrity Risk</p>
                    <p className="text-xs">{result.integrityRisk}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-accent/5 border-accent/20">
        <CardContent className="flex flex-col md:flex-row items-center justify-between p-6 gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-accent/10">
              <Download className="h-6 w-6 text-accent" />
            </div>
            <div>
              <h4 className="font-bold">Ready to implement?</h4>
              <p className="text-sm text-muted-foreground">Download the detailed instruction bundle as a PDF.</p>
            </div>
          </div>
          <Button className="bg-accent hover:bg-accent/90 shadow-lg shadow-accent/20">
            Download PDF Instructions
            <ArrowRightCircle className="ml-2 h-4 w-4" />
          </Button>
        </CardContent>
      </Card>

      <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-100 rounded-lg">
        <Info className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-blue-700 leading-relaxed">
          <strong>Note:</strong> The AI suggests a non-destructive injection method. If the APK is already obfuscated, you might need to perform resource mapping manually before following the injection steps.
        </p>
      </div>
    </div>
  );
}