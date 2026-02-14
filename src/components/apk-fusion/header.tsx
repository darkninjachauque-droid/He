import { Shield, Package } from 'lucide-react';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4 md:px-8">
        <div className="flex items-center gap-2">
          <div className="bg-primary p-2 rounded-lg">
            <Package className="h-6 w-6 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold tracking-tight text-primary">APKFusion</span>
        </div>
        <div className="flex items-center gap-4 text-sm font-medium">
          <div className="hidden sm:flex items-center gap-1 text-muted-foreground">
            <Shield className="h-4 w-4" />
            <span>Secure Enterprise Platform</span>
          </div>
        </div>
      </div>
    </header>
  );
}