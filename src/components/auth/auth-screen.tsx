
'use client';

import { useState, useEffect } from 'react';
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
  const [currentDomain, setCurrentDomain] = useState('');
  const [detailedError, setDetailedError] = useState<{ code: string; message: string; link?: string; instruction?: string } | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentDomain(window.location.hostname);
    }
  }, []);

  const handleAuthError = (error: any) => {
    console.error("Auth Error:", error.code, error.message);
    
    let errorInfo = {
      code: error.code || 'unknown',
      message: "Ocorreu um problema ao acessar seu cofre HelioTech.",
      link: "",
      instruction: ""
    };

    if (error.code === 'auth/unauthorized-domain') {
      errorInfo.message = "DOMÍNIO NÃO AUTORIZADO!";
      errorInfo.instruction = `Copie isto: "${currentDomain}" e adicione na lista de Domínios Autorizados no Firebase.`;
      errorInfo.link = `https://console.firebase.google.com/project/${firebaseConfig.projectId}/authentication/settings`;
    } else if (error.code === 'auth/configuration-not-found' || error.code === 'auth/operation-not-allowed') {
      errorInfo.message = "MÉTODO DE LOGIN DESATIVADO!";
      errorInfo.instruction = "Ative o login por 'E-mail e senha' e 'Google' no painel do projeto HelioTech.";
      errorInfo.link = `https://console.firebase.google.com/project/${firebaseConfig.projectId}/authentication/providers`;
    } else if (error.code === 'auth/invalid-credential') {
      errorInfo.message = "E-mail ou senha incorretos.";
    } else if (error.code === 'auth/email-already-in-use') {
      errorInfo.message = "Este e-mail já está sendo usado.";
    } else if (error.code === 'auth/weak-password') {
      errorInfo.message = "A senha deve ter pelo menos 6 caracteres.";
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
        <div className="mx-auto bg-primary/10 w-16 h-16 rounded-2xl flex items-center justify-center mb-4 border border-primary/20 shadow-lg">
          <FileArchive className="h-10 w-10 text-primary" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-primary">HelioTech</h1>
        <p className="text-muted-foreground text-xs uppercase tracking-widest font-bold">Salva Arquivos ZIP</p>
      </div>

      {detailedError && (
        <Alert variant="destructive" className="mb-6 border-2 shadow-lg bg-destructive/5">
          <AlertCircle className="h-5 w-5" />
          <AlertTitle className="font-bold">Ação Necessária no Firebase</AlertTitle>
          <AlertDescription className="space-y-3">
            <p className="text-sm font-semibold">{detailedError.message}</p>
            {detailedError.instruction && (
              <p className="text-xs bg-destructive/10 p-2 rounded border border-destructive/20 font-mono break-all font-bold">
                {detailedError.instruction}
              </p>
            )}
            {detailedError.link && (
              <Button variant="destructive" size="sm" className="w-full font-bold" asChild>
                <a href={detailedError.link} target="_blank" rel="noopener noreferrer">
                  ATIVAR NESTE PROJETO AGORA <ExternalLink className="ml-2 h-4 w-4" />
                </a>
              </Button>
            )}
          </AlertDescription>
        </Alert>
      )}

      <Card className="w-full shadow-xl border-t-4 border-t-primary">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">{isLogin ? 'Entrar no HelioTech' : 'Criar Conta HelioTech'}</CardTitle>
          <CardDescription>
            {isLogin 
              ? 'Acesse seus arquivos ZIP protegidos por Helio.' 
              : 'Comece a salvar seus ZIPs hoje.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            variant="outline" 
            className="w-full h-12 gap-2 border-primary/20" 
            onClick={handleGoogleSignIn}
            disabled={loading}
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Google
          </Button>

          <div className="relative flex items-center justify-center text-xs uppercase text-muted-foreground py-2">
            <span className="bg-card px-2 z-10">Ou e-mail</span>
            <div className="absolute w-full border-t" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>E-mail</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input className="pl-10" type="email" placeholder="seu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Senha</Label>
              <div className="relative">
                <Key className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input className="pl-10" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>
            </div>
            <Button type="submit" className="w-full h-11" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : isLogin ? 'Entrar no HelioTech' : 'Criar Conta'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="bg-muted/30 flex justify-center py-4 border-t">
          <Button variant="link" size="sm" onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? 'Não tem conta HelioTech? Clique aqui' : 'Já tem conta? Faça login'}
          </Button>
        </CardFooter>
      </Card>
      <div className="mt-4 flex flex-col items-center gap-1 text-[10px] text-muted-foreground opacity-50 font-mono">
        <div className="flex items-center gap-1">
          <ShieldCheck className="h-3 w-3" />
          <span>PROJETO: {firebaseConfig.projectId}</span>
        </div>
      </div>
    </div>
  );
}
