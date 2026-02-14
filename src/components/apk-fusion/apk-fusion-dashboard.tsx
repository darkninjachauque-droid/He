"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, FileArchive, Settings2, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { ApkUploader } from './apk-uploader';
import { ZipUploader } from './zip-uploader';
import { StrategyResults } from './strategy-results';
import { optimizeApkInjection, type OptimizeApkInjectionOutput } from '@/ai/flows/optimize-apk-injection-flow';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export function APKFusionDashboard() {
  const [apkData, setApkData] = useState<string | null>(null);
  const [zipFiles, setZipFiles] = useState<{ zipDataUri: string; password: string; name: string }[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<OptimizeApkInjectionOutput | null>(null);
  const { toast } = useToast();

  const handleStartAnalysis = async () => {
    if (!apkData) {
      toast({
        variant: "destructive",
        title: "APK Missing",
        description: "Please upload an APK file first."
      });
      return;
    }

    if (zipFiles.length === 0) {
      toast({
        variant: "destructive",
        title: "ZIPs Missing",
        description: "Please add at least one ZIP file with a password."
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      const response = await optimizeApkInjection({
        apkDataUri: apkData,
        zipFiles: zipFiles.map(z => ({ zipDataUri: z.zipDataUri, password: z.password }))
      });
      setResult(response);
      toast({
        title: "Analysis Complete",
        description: "AI has successfully determined the injection strategy."
      });
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Analysis Failed",
        description: "Something went wrong while communicating with the AI."
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const reset = () => {
    setApkData(null);
    setZipFiles([]);
    setResult(null);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      <div className="lg:col-span-5 space-y-6">
        <Card className="border-2 border-dashed bg-card/50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Upload className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">1. Upload Base APK</CardTitle>
            </div>
            <CardDescription>Select the Android application you want to modify.</CardDescription>
          </CardHeader>
          <CardContent>
            <ApkUploader onUpload={setApkData} fileName={apkData ? "APK Loaded" : null} />
          </CardContent>
        </Card>

        <Card className="border-2 border-dashed bg-card/50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <FileArchive className="h-5 w-5 text-accent" />
              <CardTitle className="text-lg">2. Add ZIP Components</CardTitle>
            </div>
            <CardDescription>Upload ZIP files and set a unique password for each.</CardDescription>
          </CardHeader>
          <CardContent>
            <ZipUploader onZipsChange={setZipFiles} zips={zipFiles} />
          </CardContent>
        </Card>

        <div className="flex flex-col gap-3">
          <Button 
            size="lg" 
            className="w-full text-lg h-14 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
            disabled={!apkData || zipFiles.length === 0 || isAnalyzing}
            onClick={handleStartAnalysis}
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Analyzing Structure...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-5 w-5" />
                Generate Injection Strategy
              </>
            )}
          </Button>
          {result && (
            <Button variant="outline" className="w-full" onClick={reset}>
              Start Over
            </Button>
          )}
        </div>

        <Alert variant="default" className="bg-secondary/30 border-secondary">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Important</AlertTitle>
          <AlertDescription>
            This tool provides the AI strategy for injection. Actual modification of system-signed APKs may require re-signing with your own keys.
          </AlertDescription>
        </Alert>
      </div>

      <div className="lg:col-span-7">
        {!result && !isAnalyzing ? (
          <div className="h-[500px] flex flex-col items-center justify-center text-center space-y-4 border-2 border-dashed rounded-xl bg-card/20 text-muted-foreground p-8">
            <Settings2 className="h-16 w-16 opacity-20" />
            <p className="text-lg">Upload your files to see the AI strategy here.</p>
          </div>
        ) : isAnalyzing ? (
          <div className="h-[500px] flex flex-col items-center justify-center text-center space-y-6 border rounded-xl bg-card shadow-inner p-8">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse" />
              <Loader2 className="h-16 w-16 text-primary animate-spin relative" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-semibold">AI is Brainstorming</h3>
              <p className="text-muted-foreground max-w-sm"> Analyzing APK manifest, resources, and DEX files to find the optimal injection vectors...</p>
            </div>
          </div>
        ) : (
          <StrategyResults result={result!} />
        )}
      </div>
    </div>
  );
}