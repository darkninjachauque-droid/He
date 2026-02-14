import { APKFusionDashboard } from '@/components/apk-fusion/apk-fusion-dashboard';
import { Header } from '@/components/apk-fusion/header';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 flex flex-col items-center justify-center p-4 md:p-8">
        <div className="max-w-5xl w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-primary font-headline">
              Inject Secure Data Into Your APKs
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              APKFusion uses AI to intelligently analyze your application and determine the safest, most efficient way to embed password-protected ZIP files.
            </p>
          </div>
          <APKFusionDashboard />
        </div>
      </main>
      <footer className="py-6 text-center text-sm text-muted-foreground border-t border-border mt-12">
        <p>&copy; {new Date().getFullYear()} APKFusion. Securely modified with AI intelligence.</p>
      </footer>
    </div>
  );
}