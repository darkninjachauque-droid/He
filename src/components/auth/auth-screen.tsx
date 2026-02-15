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
import { Lock, Mail, Loader2, ShieldCheck, AlertCircle, ExternalLink, Settings, AlertTriangle } from 'lucide-react';
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
  const [detailedError, setDetailedError] = useState<{ code: string; message: string; link?: string; debug?: string } | null>(null);

  const handleAuthError = (error: any) => {
    console.error("Auth Error:", error.code, error.message);
    
    let errorInfo = {
      code: error.code || 'unknown',
      message: "Ocorreu um problema ao tentar acessar o seu cofre.",
      link: "",
      debug: ""
    };

    if (error.code === 'auth/configuration-not-found' || error.code === 'auth/operation-not-allowed') {
      errorInfo.message = `LOGIN NÃO ATIVADO NO PAINEL!`;
      errorInfo.debug = `Você precisa ativar o login por Google ou E-mail no seu projeto "${firebaseConfig.projectId}".`;
      errorInfo.link = `https://console.firebase.google.com/project/${firebaseConfig.projectId}/authentication/providers`;
    } else if (error.code === 'auth/unauthorized-domain') {
      errorInfo.message = "Domínio não autorizado. Adicione o link do site no painel do Firebase.";
      errorInfo.link = `https://console.firebase.google.com/project/${firebaseConfig.projectId}/authentication/settings`;
    } else if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
      errorInfo.message = "Cofre não encontrado ou credenciais inválidas. Verifique seu e-mail e senha.";
    } else if (error.code === 'auth/wrong-password') {
      errorInfo.message = "Senha incorreta para este cofre.";
    } else {
      errorInfo.message = error.message || "Erro ao tentar entrar.";
    }

    setDetailedError(errorInfo);
    
    toast({
      variant: "destructive",
      title: "Erro de Acesso",
      description: `Código: ${error.code || 'Desconhecido'}`
    });
  };

  const handleGoogleSignIn = async () => {
    if (!auth) return;
    setLoading(true);
    setDetailedError(null);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      await signInWithPopup(auth, provider);
      toast({ title: "Bem-vindo!", description: "Seu cofre foi aberto." });
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
      toast({ title: "Sucesso!", description: "Cofre desbloqueado." });
    } catch (error: any) {
      handleAuthError(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-10 px-4 max-w-md mx-auto">
      <div className="mb-8 text-center space-y-2 animate-in fade-in zoom-in duration-500">
        <div className="mx-auto bg-primary/10 w-20 h-20 rounded-3xl flex items-center justify-center mb-4 shadow-xl border border-primary/20">
          <ShieldCheck className="h-12 w-12 text-primary" />
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight text-primary">MeuVault</h1>
        <p className="text-muted-foreground text-sm uppercase tracking-widest font-bold">Acessando: APKFusion</p>
      </div>

      {detailedError && (
        <Alert variant="destructive" className="mb-6 animate-in slide-in-from-top-2 border-2 shadow-lg bg-destructive/5">
          <AlertCircle className="h-5 w-5" />
          <AlertTitle className="font-bold uppercase tracking-wider text-sm">Ação Necessária</AlertTitle>
          <AlertDescription className="space-y-4">
            <p className="text-sm leading-relaxed font-bold">{detailedError.message}</p>
            
            <div className="bg-white/50 p-4 rounded-lg text-[11px] font-mono border border-destructive/20 text-destructive">
              <div className="flex items-center gap-1 mb-2 font-bold uppercase text-amber-600">
                <AlertTriangle className="h-4 w-4" /> Diagnóstico:
              </div>
              ID do Projeto: {firebaseConfig.projectId}
              <br />
              {detailedError.debug || "Verifique se este projeto tem o login ativado no Console."}
            </div>

            {detailedError.link && (
              <Button variant="destructive" size="sm" className="w-full font-bold shadow-md" asChild>
                <a href={detailedError.link} target="_blank" rel="noopener noreferrer">
                  ATIVAR NESTE PROJETO AGORA <ExternalLink className="ml-2 h-4 w-4" />
                </a>
              </Button>
            )}
          </AlertDescription>
        </Alert>
      )}

      <Card className="w-full shadow-2xl border-none bg-card/80 backdrop-blur-md overflow-hidden ring-1 ring-black/5">
        <CardHeader className="space-y-1 text-center pb-8 bg-primary/5 border-b">
          <CardTitle className="text-2xl font-bold">{isLogin ? 'Abrir Cofre' : 'Criar Novo Cofre'}</CardTitle>
          <CardDescription>
            Segurança total no projeto APKFusion.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-8">
          <Button 
            variant="outline" 
            className="w-full h-14 font-semibold border-primary/20 hover:bg-primary/5 transition-all" 
            onClick={handleGoogleSignIn}
            disabled={loading}
          >
            <div className="flex items-center justify-center gap-3">
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              <span>Continuar com Google</span>
            </div>
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
            <div className="relative flex justify-center text-xs uppercase text-muted-foreground">
              <span className="bg-card px-3">Ou e-mail e senha</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" type="email" placeholder="seu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <Button type="submit" className="w-full h-11" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLogin ? 'Entrar' : 'Criar Conta'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col pt-4 border-t bg-muted/20">
          <Button variant="link" className="text-xs" onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? 'Não tem conta? Crie aqui' : 'Já tem conta? Faça login'}
          </Button>
        </CardFooter>
      </Card>

      <div className="mt-8 text-center">
        <p className="text-[10px] text-muted-foreground uppercase font-bold">Conectado ao Projeto:</p>
        <p className="font-mono text-xs font-bold text-primary">{firebaseConfig.projectId}</p>
      </div>
    </div>
  );
}
