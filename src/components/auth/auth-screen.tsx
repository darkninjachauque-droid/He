
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
import { Lock, Mail, Loader2, ShieldCheck, AlertCircle, ExternalLink, Settings } from 'lucide-react';
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

    // Erro específico de configuração não encontrada (Provedor Google ou E-mail não ativos no projeto correto)
    if (error.code === 'auth/configuration-not-found') {
      errorInfo.message = `Atenção: O login não está ativo para o projeto "${firebaseConfig.projectId}". Você deve ativar os provedores (Google e E-mail) EXATAMENTE para este ID de projeto no console do Firebase.`;
      errorInfo.link = `https://console.firebase.google.com/project/${firebaseConfig.projectId}/authentication/providers`;
      errorInfo.debug = `O código do seu site está tentando usar o Projeto ID: ${firebaseConfig.projectId}. Verifique se você não ativou o Google em um projeto diferente por engano.`;
    } else if (error.code === 'auth/operation-not-allowed') {
      errorInfo.message = "Este método de login (E-mail ou Google) está desativado no painel do Firebase para este projeto.";
      errorInfo.link = `https://console.firebase.google.com/project/${firebaseConfig.projectId}/authentication/providers`;
    } else if (error.code === 'auth/unauthorized-domain') {
      errorInfo.message = "Este domínio não está autorizado. Adicione o link atual em 'Domínios Autorizados' no painel do Firebase.";
      errorInfo.link = `https://console.firebase.google.com/project/${firebaseConfig.projectId}/authentication/settings`;
    } else if (error.code === 'auth/popup-blocked') {
      errorInfo.message = "O navegador bloqueou a janela de login. Por favor, libere os pop-ups.";
    } else {
      errorInfo.message = error.message || "Erro desconhecido ao tentar entrar.";
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
      toast({ title: "Bem-vindo!", description: "Seu cofre foi aberto com Google." });
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
      toast({ title: "Sucesso!", description: "Seu cofre foi desbloqueado." });
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
        <p className="text-muted-foreground text-lg italic">Armazenamento Privado Seguro</p>
      </div>

      {detailedError && (
        <Alert variant="destructive" className="mb-6 animate-in slide-in-from-top-2 border-2 shadow-lg">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle className="font-bold">Ação Necessária no Projeto</AlertTitle>
          <AlertDescription className="space-y-4">
            <p className="text-sm leading-relaxed">{detailedError.message}</p>
            
            {detailedError.debug && (
              <div className="bg-destructive/10 p-3 rounded text-[11px] font-mono border border-destructive/20 text-destructive-foreground">
                <strong>DEBUG:</strong> {detailedError.debug}
              </div>
            )}

            {detailedError.link && (
              <Button variant="default" size="sm" className="w-full bg-destructive text-white hover:bg-destructive/90 font-bold" asChild>
                <a href={detailedError.link} target="_blank" rel="noopener noreferrer">
                  CONFIGURAR PROJETO AGORA <ExternalLink className="ml-2 h-3 w-3" />
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
            Acesse seus arquivos pessoais com total privacidade.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-8">
          <Button 
            variant="outline" 
            className="w-full h-14 font-semibold border-primary/20 hover:bg-primary/5 transition-all group relative overflow-hidden" 
            onClick={handleGoogleSignIn}
            disabled={loading}
          >
            <div className="flex items-center justify-center gap-3">
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              <span>{loading ? 'Acessando...' : 'Entrar com Google'}</span>
            </div>
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
            <div className="relative flex justify-center text-xs uppercase text-muted-foreground">
              <span className="bg-card px-3 font-semibold tracking-widest">Ou use e-mail e senha</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="seu@email.com" 
                  className="pl-10 h-11" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="Sua senha secreta"
                  className="pl-10 h-11" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>
            <Button type="submit" className="w-full h-11 font-bold shadow-lg shadow-primary/20" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLogin ? 'Abrir Cofre' : 'Registrar e Abrir'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col pt-4 border-t bg-muted/20">
          <Button variant="link" className="text-sm text-primary font-medium" onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? 'Não tem conta? Crie um cofre aqui' : 'Já tem um cofre? Faça o login'}
          </Button>
        </CardFooter>
      </Card>

      <div className="mt-8 p-4 bg-muted/30 rounded-lg border border-dashed flex flex-col items-center gap-2">
        <div className="flex items-center gap-2">
          <Settings className="h-4 w-4 text-muted-foreground" />
          <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight">
            ID do Projeto no Código:
          </p>
        </div>
        <p className="font-mono font-bold text-primary text-sm bg-white px-3 py-1 rounded-md border">
          {firebaseConfig.projectId}
        </p>
        <p className="text-[9px] text-muted-foreground text-center">
          Certifique-se de que este é o mesmo ID que aparece no topo do seu Console do Firebase.
        </p>
      </div>
    </div>
  );
}
