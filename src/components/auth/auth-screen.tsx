
'use client';

import { useState } from 'react';
import { useAuth } from '@/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Lock, Mail, Loader2, ShieldCheck, ExternalLink, CheckCircle2, AlertCircle, Info } from 'lucide-react';
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
  const [apiError, setApiError] = useState<{ 
    message: string; 
    link: string; 
    type: 'enable' | 'blocked' | 'config' | 'mfa' | 'setup'
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) return;
    setLoading(true);
    setApiError(null);
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
      toast({ title: "Bem-vindo!", description: "Acesso liberado ao seu cofre." });
    } catch (error: any) {
      handleAuthError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (!auth) return;
    setLoading(true);
    setApiError(null);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      handleAuthError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAuthError = (error: any) => {
    const errorCode = error.code || '';
    const projectId = firebaseConfig.projectId;
    
    if (errorCode.includes('identity-toolkit-api-has-not-been-used') || errorCode.includes('api-not-enabled')) {
      setApiError({
        type: 'enable',
        message: 'A API de Autenticação precisa ser ativada no Google Cloud.',
        link: `https://console.developers.google.com/apis/api/identitytoolkit.googleapis.com/overview?project=${projectId}`
      });
    } 
    else if (errorCode.includes('requests-to-this-api-identitytoolkit-are-blocked')) {
      setApiError({
        type: 'blocked',
        message: 'A sua Chave de API está restringindo o acesso. Mude para "Não restringir" no painel do Google Cloud.',
        link: `https://console.cloud.google.com/apis/credentials?project=${projectId}`
      });
    }
    else if (errorCode.includes('configuration-not-found') || errorCode.includes('project-not-found')) {
      setApiError({
        type: 'config',
        message: 'O login do Google não está ativo no Firebase. Clique no botão abaixo para ativar.',
        link: `https://console.firebase.google.com/project/${projectId}/authentication/providers`
      });
    }
    else {
      toast({
        variant: "destructive",
        title: "Erro de autenticação",
        description: error.message || "Verifique seus dados e tente novamente."
      });
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-10 px-4">
      <div className="mb-8 text-center space-y-2">
        <div className="mx-auto bg-primary/10 w-20 h-20 rounded-3xl flex items-center justify-center mb-4 shadow-xl border border-primary/20">
          <ShieldCheck className="h-12 w-12 text-primary" />
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight text-primary">MeuVault</h1>
        <p className="text-muted-foreground max-w-xs mx-auto text-lg">
          Seu cofre pessoal de arquivos 100% privado.
        </p>
      </div>

      <Card className="w-full max-w-md shadow-2xl border-none bg-card/80 backdrop-blur-md overflow-hidden">
        <CardHeader className="space-y-1 text-center pb-8 bg-primary/5">
          <CardTitle className="text-2xl font-bold">{isLogin ? 'Entrar no Cofre' : 'Criar Novo Cofre'}</CardTitle>
          <CardDescription>
            {isLogin ? 'Acesse seus arquivos guardados.' : 'Comece a guardar seus arquivos com segurança.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          {apiError && (
            <Alert variant="destructive" className="bg-destructive/5 text-destructive border-destructive/20 animate-in fade-in zoom-in-95 duration-300">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle className="font-bold">Ação Necessária</AlertTitle>
              <AlertDescription className="space-y-3">
                <p className="text-xs leading-relaxed">{apiError.message}</p>
                <Button 
                  variant="destructive" 
                  size="sm" 
                  className="w-full text-xs font-bold"
                  onClick={() => window.open(apiError.link, '_blank')}
                >
                  <ExternalLink className="mr-2 h-3 w-3" />
                  CORRIGIR NO PAINEL AGORA
                </Button>
                <p className="text-[10px] text-muted-foreground text-center italic">
                  Certifique-se de estar logado na conta correta do Google.
                </p>
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="seu@email.com" 
                  className="pl-10 h-12 text-base border-primary/10 focus:border-primary" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="Sua senha secreta"
                  className="pl-10 h-12 text-base border-primary/10 focus:border-primary" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>
            <Button type="submit" className="w-full h-12 text-lg font-bold shadow-xl shadow-primary/20 transition-all hover:scale-[1.02]" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
              {isLogin ? 'Desbloquear Cofre' : 'Registrar e Abrir'}
            </Button>
          </form>

          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
            <div className="relative flex justify-center text-xs uppercase text-muted-foreground">
              <span className="bg-card px-3 font-semibold">Ou use sua conta</span>
            </div>
          </div>

          <Button 
            variant="outline" 
            className="w-full h-12 font-semibold border-primary/20 hover:bg-primary/5 transition-all group" 
            onClick={handleGoogleSignIn}
            disabled={loading}
          >
            <svg className="mr-3 h-5 w-5 transition-transform group-hover:scale-110" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Entrar com Google
          </Button>
        </CardContent>
        <CardFooter className="flex flex-col pt-2 border-t mt-4 bg-muted/30">
          <Button variant="link" className="text-sm font-medium text-primary hover:underline" onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? 'Ainda não tem um cofre? Crie um agora' : 'Já possui um cofre? Faça login'}
          </Button>
        </CardFooter>
      </Card>
      
      <div className="mt-8 flex items-center gap-3 p-3 bg-green-500/10 rounded-full px-6 border border-green-500/20 shadow-sm">
        <CheckCircle2 className="h-4 w-4 text-green-500" />
        <span className="text-xs text-green-700 uppercase tracking-widest font-bold">Criptografia Ativa</span>
      </div>

      <div className="mt-6 flex items-center gap-2 text-muted-foreground text-xs bg-muted/50 p-2 rounded-lg border">
        <Info className="h-3 w-3" />
        <span>No console do Firebase, ative o "Google" em Authentication.</span>
      </div>
    </div>
  );
}
