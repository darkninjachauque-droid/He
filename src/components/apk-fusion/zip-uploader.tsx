"use client";

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FileArchive, Plus, Trash2, Key, Check } from 'lucide-react';

interface ZipFile {
  zipDataUri: string;
  password: string;
  name: string;
}

interface ZipUploaderProps {
  onZipsChange: (zips: ZipFile[]) => void;
  zips: ZipFile[];
}

export function ZipUploader({ onZipsChange, zips }: ZipUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        onZipsChange([...zips, { zipDataUri: result, password: "", name: file.name }]);
      };
      reader.readAsDataURL(file);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const updatePassword = (index: number, password: string) => {
    const newZips = [...zips];
    newZips[index].password = password;
    onZipsChange(newZips);
  };

  const removeZip = (index: number) => {
    onZipsChange(zips.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <input
        type="file"
        accept=".zip"
        className="hidden"
        ref={inputRef}
        onChange={handleFileChange}
      />

      <div className="space-y-3">
        {zips.map((zip, idx) => (
          <div key={idx} className="p-4 bg-background border rounded-lg space-y-3 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileArchive className="h-4 w-4 text-accent" />
                <span className="text-sm font-semibold truncate max-w-[150px]">{zip.name}</span>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => removeZip(idx)}
                className="h-7 w-7 text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="space-y-1.5">
              <Label className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Zip Password</Label>
              <div className="relative">
                <Key className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  type="text"
                  placeholder="Enter unique password"
                  className="pl-9 h-9 text-sm border-accent/20 focus-visible:ring-accent"
                  value={zip.password}
                  onChange={(e) => updatePassword(idx, e.target.value)}
                />
              </div>
            </div>
          </div>
        ))}

        <Button 
          variant="outline" 
          onClick={() => inputRef.current?.click()}
          className="w-full border-dashed border-2 py-6 hover:bg-accent/5 hover:border-accent/50 group"
        >
          <Plus className="h-5 w-5 mr-2 text-accent group-hover:scale-110 transition-transform" />
          Add Zip Package
        </Button>
      </div>
    </div>
  );
}