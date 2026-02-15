'use client';

import { useUser } from '@/firebase';
import { FileManager } from '@/components/file-storage/file-manager';
import { AuthScreen } from '@/components/auth/auth-screen';
import { VerificationPending } from '@/components/auth/verification-pending';
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

  // Verifica se o usuário está logado e se o e-mail está verificado
  // Contas Google são consideradas verificadas automaticamente pelo Firebase
  const isVerified = user?.emailVerified || user?.providerData.some(p => p.providerId === 'google.com');

  const renderContent = () => {
    if (!user) return <AuthScreen />;
    if (!isVerified) return <VerificationPending user={user} />;
    return <FileManager user={user} />;
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        {renderContent()}
      </main>
      <footer className="border-t py-6 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} HelioTech - Arquivo Seguro. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}
