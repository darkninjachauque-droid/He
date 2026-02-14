"use client";

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Package, X, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ApkUploaderProps {
  onUpload: (dataUri: string) => void;
  fileName: string | null;
}

export function ApkUploader({ onUpload, fileName }: ApkUploaderProps) {
  const [currentName, setCurrentName] = useState<string | null>(fileName);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        onUpload(result);
        setCurrentName(file.name);
      };
      reader.readAsDataURL(file);
    }
  };

  const clear = () => {
    setCurrentName(null);
    onUpload("");
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="space-y-4">
      <input
        type="file"
        accept=".apk"
        className="hidden"
        ref={inputRef}
        onChange={handleFileChange}
      />
      
      {!currentName ? (
        <div 
          onClick={() => inputRef.current?.click()}
          className="flex flex-col items-center justify-center py-10 border-2 border-dashed border-muted rounded-xl cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all group"
        >
          <Package className="h-10 w-10 text-muted-foreground group-hover:text-primary transition-colors mb-2" />
          <p className="text-sm font-medium">Click or drag APK file</p>
          <p className="text-xs text-muted-foreground mt-1">Maximum size 50MB</p>
        </div>
      ) : (
        <div className="flex items-center justify-between p-4 bg-primary/10 border border-primary/20 rounded-lg">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-primary" />
            <span className="font-medium text-sm truncate max-w-[200px]">{currentName}</span>
          </div>
          <Button variant="ghost" size="icon" onClick={clear} className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive">
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}