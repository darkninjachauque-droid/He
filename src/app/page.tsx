
'use client';

import { useUser } from '@/firebase';
import { FileManager } from '@/components/file-storage/file-manager';
import { AuthScreen } from '@/components/auth/auth-screen';
import { Header } from '@/components/layout/header';
import { Loader2 } from 'lucide-react';

export default function HomePage() {
  const { user, loading } = useUser();

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background text-primary">
        <Loader2 className="h-10 w-10 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        {user ? <FileManager user={user} /> : <AuthScreen />}
      </main>
      <footer className="border-t py-6 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} ZipVault Secure Storage. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}
