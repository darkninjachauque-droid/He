
'use client';

import { useState } from 'react';
import { useAuth } from '@/firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider 
} from 'firebase/auth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, Loader2, FileArchive, AlertCircle, ExternalLink, Key, ShieldCheck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { firebaseConfig } from '@/firebase/config';

export function AuthScreen() {
  const auth = useAuth();
  const { toast } = useToast();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [detailedError, setDetailedError] = useState<{ code: string; message: string; link?: string; instruction?: string } | null>(null);

  const handleAuthError = (error: any) => {
    // Silencia o erro se o usuário apenas fechar o popup
    if (error.code === 'auth/popup-closed-by-user') {
      return;
    }

    let errorInfo = {
      code: error.code || 'unknown',
      message: "Ocorreu um problema ao acessar seu cofre HelioTech.",
      link: "",
      instruction: ""
    };

    if (error.code === 'auth/unauthorized-domain') {
      errorInfo.message = "DOMÍNIO NÃO AUTORIZADO!";
      errorInfo.instruction = `Adicione "heliotech-arquivo-seguro.netlify.app" na lista de Domínios Autorizados no Firebase.`;
      errorInfo.link = `https://console.firebase.google.com/project/${firebaseConfig.projectId}/authentication/settings`;
    } else if (error.code === 'auth/configuration-not-found' || error.code === 'auth/operation-not-allowed') {
      errorInfo.message = "MÉTODO DE LOGIN DESATIVADO!";
      errorInfo.instruction = "Ative o login por 'E-mail e senha' no painel do Firebase.";
      errorInfo.link = `https://console.firebase.google.com/project/${firebaseConfig.projectId}/authentication/providers`;
    }

    setDetailedError(errorInfo);
    toast({
      variant: "destructive",
      title: "Erro de Acesso",
      description: error.code
    });
  };

  const handleGoogleSignIn = async () => {
    if (!auth) return;
    setLoading(true);
    setDetailedError(null);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      handleAuthError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) return;
    setLoading(true);
    setDetailedError(null);
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
    } catch (error: any) {
      handleAuthError(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-10 px-4 max-w-md mx-auto">
      <div className="mb-8 text-center space-y-2">
        <div className="mx-auto bg-primary/20 w-16 h-16 rounded-2xl flex items-center justify-center mb-4 border border-primary/30 shadow-2xl shadow-primary/20 animate-pulse">
          <FileArchive className="h-10 w-10 text-primary" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-white">HelioTech</h1>
        <p className="text-primary text-[10px] uppercase tracking-widest font-bold">Arquivo Seguro • Modo Cofre</p>
      </div>

      {detailedError && (
        <Alert variant="destructive" className="mb-6 border-2 shadow-lg bg-destructive/10 text-white animate-in slide-in-from-top-4">
          <AlertCircle className="h-5 w-5" />
          <AlertTitle className="font-bold">Ação Necessária</AlertTitle>
          <AlertDescription className="space-y-3">
            <p className="text-sm">{detailedError.message}</p>
            {detailedError.instruction && (
              <p className="text-xs bg-black/40 p-2 rounded border border-white/10 font-mono break-all font-bold">
                {detailedError.instruction}
              </p>
            )}
            {detailedError.link && (
              <Button variant="destructive" size="sm" className="w-full font-bold" asChild>
                <a href={detailedError.link} target="_blank" rel="noopener noreferrer">
                  ABRIR PAINEL DO FIREBASE <ExternalLink className="ml-2 h-4 w-4" />
                </a>
              </Button>
            )}
          </AlertDescription>
        </Alert>
      )}

      <Card className="w-full shadow-2xl border-white/5 bg-secondary/20 backdrop-blur-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-xl text-white">{isLogin ? 'Acessar seu Cofre' : 'Criar Conta Segura'}</CardTitle>
          <CardDescription className="text-muted-foreground/80">
            {isLogin 
              ? 'Identifique-se para gerenciar seus arquivos ZIP.' 
              : 'Comece a guardar seus arquivos hoje mesmo.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            variant="outline" 
            className="w-full h-12 gap-2 border-white/10 bg-white/5 hover:bg-white/10 text-white transition-all" 
            onClick={handleGoogleSignIn}
            disabled={loading}
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Entrar com Google
          </Button>

          <div className="relative flex items-center justify-center text-xs uppercase text-muted-foreground py-2">
            <span className="bg-background/50 backdrop-blur-sm px-2 z-10">Ou e-mail</span>
            <div className="absolute w-full border-t border-white/5" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-white/70">E-mail</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input className="pl-10 bg-white/5 border-white/10 text-white focus:border-primary" type="email" placeholder="seu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-white/70">Senha</Label>
              <div className="relative">
                <Key className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input className="pl-10 bg-white/5 border-white/10 text-white focus:border-primary" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>
            </div>
            <Button type="submit" className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-lg shadow-primary/20" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : isLogin ? 'Acessar Cofre' : 'Registrar Conta'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="bg-black/20 flex justify-center py-4 border-t border-white/5 rounded-b-lg">
          <Button variant="link" size="sm" className="text-primary hover:text-primary/80 font-semibold" onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? 'Ainda não tem conta? Clique aqui' : 'Já tem conta? Faça login'}
          </Button>
        </CardFooter>
      </Card>
      
      <div className="mt-8 flex flex-col items-center gap-2 text-[10px] text-muted-foreground/50 font-mono">
        <div className="flex items-center gap-1">
          <ShieldCheck className="h-3 w-3" />
          <span>SISTEMA HELIOTECH V1.0</span>
        </div>
        <p>Acesso Protegido via Netlify SSL</p>
      </div>
    </div>
  );
}
