'use client';

import { useState } from 'react';
import { useAuth } from '@/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Lock, Mail, Loader2, ShieldCheck, AlertCircle, ExternalLink, ShieldAlert } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export function AuthScreen() {
  const auth = useAuth();
  const { toast } = useToast();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [apiError, setApiError] = useState<{ message: string; link: string; type: 'enable' | 'blocked' } | null>(null);

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
    const errorMsg = error.message || '';
    const errorCode = error.code || '';
    
    if (errorMsg.includes('identity-toolkit-api-has-not-been-used') || errorCode.includes('api-not-enabled')) {
      setApiError({
        type: 'enable',
        message: 'A API de Autenticação ainda não foi ativada. Clique no botão abaixo para ativar agora.',
        link: 'https://console.developers.google.com/apis/api/identitytoolkit.googleapis.com/overview?project=104601029201'
      });
    } else if (errorMsg.includes('blocked') || errorCode.includes('requests-to-this-api-identitytoolkit-are-blocked')) {
      setApiError({
        type: 'blocked',
        message: 'A API foi ativada, mas o acesso está sendo bloqueado por restrições de chave. No console do Google Cloud, vá em "APIs e Serviços > Credenciais", clique na sua chave de API e remova as restrições ou adicione "Identity Toolkit API" à lista de permitidas.',
        link: 'https://console.cloud.google.com/apis/credentials?project=104601029201'
      });
    } else {
      toast({
        variant: "destructive",
        title: "Erro de autenticação",
        description: error.message
      });
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-10 px-4">
      <div className="mb-8 text-center space-y-2">
        <div className="mx-auto bg-primary/10 w-16 h-16 rounded-2xl flex items-center justify-center mb-4 shadow-inner">
          <ShieldCheck className="h-10 w-10 text-primary" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight">MeuVault</h1>
        <p className="text-muted-foreground max-w-xs mx-auto">
          Armazenamento privado e seguro para seus arquivos pessoais.
        </p>
      </div>

      <Card className="w-full max-w-md shadow-2xl border-none bg-card/50 backdrop-blur-sm">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-xl font-bold">{isLogin ? 'Bem-vindo de volta' : 'Criar sua conta'}</CardTitle>
          <CardDescription>
            {isLogin ? 'Identifique-se para acessar seu cofre.' : 'Comece a proteger seus arquivos agora mesmo.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {apiError && (
            <Alert variant="destructive" className="bg-destructive/10 text-destructive border-destructive/20">
              {apiError.type === 'blocked' ? <ShieldAlert className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
              <AlertTitle>{apiError.type === 'blocked' ? 'Acesso Bloqueado' : 'Configuração Necessária'}</AlertTitle>
              <AlertDescription className="space-y-3">
                <p className="text-xs leading-relaxed">{apiError.message}</p>
                <Button variant="default" size="sm" className="w-full bg-destructive text-white hover:bg-destructive/90" asChild>
                  <a href={apiError.link} target="_blank" rel="noopener noreferrer">
                    {apiError.type === 'blocked' ? 'Verificar Chave de API' : 'Ativar no Google Console'} <ExternalLink className="ml-2 h-3 w-3" />
                  </a>
                </Button>
                <p className="text-[10px] text-muted-foreground italic text-center">
                  Após ajustar, aguarde 2 minutos e tente novamente.
                </p>
              </AlertDescription>
            </Alert>
          )}

          <Button 
            variant="outline" 
            className="w-full h-11 font-medium border-muted-foreground/20 hover:bg-secondary/50" 
            onClick={handleGoogleSignIn}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
            )}
            Continuar com Google
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
            <div className="relative flex justify-center text-xs uppercase text-muted-foreground">
              <span className="bg-card px-2">Ou use seu email</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
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
                  className="pl-10 h-11" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>
            <Button type="submit" className="w-full h-11 text-base font-semibold shadow-lg shadow-primary/20" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLogin ? 'Entrar' : 'Criar Conta'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <Button variant="link" className="text-sm text-muted-foreground hover:text-primary transition-colors" onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? 'Não tem uma conta? Cadastre-se' : 'Já tem uma conta? Entre agora'}
          </Button>
        </CardFooter>
      </Card>
      
      <p className="mt-8 text-xs text-muted-foreground text-center">
        Seus arquivos são criptografados e protegidos por autenticação de nível industrial.
      </p>
    </div>
  );
}
