'use client';

import { useState } from 'react';
import { useAuth } from '@/firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider,
  sendEmailVerification
} from 'firebase/auth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, Loader2, Key, Shield, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function AuthScreen() {
  const auth = useAuth();
  const { toast } = useToast();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [verificationSent, setVerificationSent] = useState(false);

  const handleGoogleSignIn = async () => {
    if (!auth) return;
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      if (error.code === 'auth/popup-closed-by-user') {
        setLoading(false);
        return;
      }
      toast({
        variant: "destructive",
        title: "Erro de Autenticação",
        description: "Verifique as configurações do Google ou tente novamente."
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) return;

    if (!isLogin && password !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Senhas diferentes",
        description: "As senhas digitadas não coincidem. Verifique a confirmação."
      });
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        if (userCredential.user) {
          await sendEmailVerification(userCredential.user);
          setVerificationSent(true);
          toast({
            title: "Verificação Enviada!",
            description: "Enviamos um link de confirmação para o seu e-mail."
          });
        }
      }
    } catch (error: any) {
      let message = "E-mail ou senha incorretos.";
      
      if (error.code === 'auth/email-already-in-use') {
        message = "Este e-mail já está cadastrado. Tente fazer login ou use outro e-mail.";
      } else if (error.code === 'auth/weak-password') {
        message = "A senha deve ter pelo menos 6 caracteres.";
      } else if (error.code === 'auth/invalid-email') {
        message = "O formato do e-mail é inválido.";
      } else if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        message = "E-mail ou senha não conferem.";
      }
      
      toast({
        variant: "destructive",
        title: "Atenção",
        description: message
      });
    } finally {
      setLoading(false);
    }
  };

  if (verificationSent) {
    return (
      <div className="flex flex-col items-center justify-center py-10 px-4 max-w-md mx-auto text-center space-y-6">
        <div className="bg-primary/20 w-20 h-20 rounded-full flex items-center justify-center border border-primary/30 shadow-2xl">
          <Mail className="h-10 w-10 text-primary animate-bounce" />
        </div>
        <h2 className="text-2xl font-bold text-foreground">Verifique seu E-mail</h2>
        <p className="text-muted-foreground">
          Enviamos um código de segurança para <strong>{email}</strong>. 
          Acesse seu e-mail e clique no link para ativar seu cofre.
        </p>
        <Button variant="outline" onClick={() => setVerificationSent(false)} className="w-full">
          Voltar para o Login
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-10 px-4 max-w-md mx-auto">
      <div className="mb-8 text-center space-y-2">
        <div className="mx-auto bg-primary/20 w-16 h-16 rounded-2xl flex items-center justify-center mb-4 border border-primary/30 shadow-2xl shadow-primary/20">
          <Shield className="h-10 w-10 text-primary" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">HelioTech</h1>
        <p className="text-primary text-[10px] uppercase tracking-widest font-bold">Cofre de Arquivos Seguro</p>
      </div>

      <Card className="w-full shadow-2xl border-border bg-card">
        <CardHeader className="text-center">
          <CardTitle className="text-xl text-foreground">{isLogin ? 'Acessar Cofre' : 'Criar Nova Conta'}</CardTitle>
          <CardDescription className="text-muted-foreground">
            {isLogin ? 'Identifique-se para entrar no seu cofre.' : 'Preencha os dados para criar seu cofre seguro.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            variant="outline" 
            className="w-full h-12 gap-3 border-input bg-background hover:bg-accent text-foreground shadow-sm" 
            onClick={handleGoogleSignIn}
            disabled={loading}
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : (
              <>
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Entrar com Google
              </>
            )}
          </Button>

          <div className="relative flex items-center justify-center text-[10px] uppercase font-bold text-muted-foreground py-2">
            <span className="bg-card px-2 z-10">Ou use e-mail</span>
            <div className="absolute w-full border-t border-border" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-foreground">Seu Melhor E-mail</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input 
                  className="pl-10 bg-background border-input text-foreground focus:border-primary" 
                  type="email" 
                  placeholder="exemplo@email.com"
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  required 
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-foreground">Senha Segura</Label>
              <div className="relative">
                <Key className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input 
                  className="pl-10 bg-background border-input text-foreground focus:border-primary" 
                  type="password" 
                  placeholder="Mínimo 6 caracteres"
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  required 
                />
              </div>
            </div>

            {!isLogin && (
              <div className="space-y-2 animate-in slide-in-from-top-2">
                <Label className="text-foreground">Confirme sua Senha</Label>
                <div className="relative">
                  <CheckCircle2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input 
                    className="pl-10 bg-background border-input text-foreground focus:border-primary" 
                    type="password" 
                    placeholder="Repita a senha"
                    value={confirmPassword} 
                    onChange={(e) => setConfirmPassword(e.target.value)} 
                    required 
                  />
                </div>
              </div>
            )}

            <Button type="submit" className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-bold" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : isLogin ? 'Entrar no Cofre' : 'Criar Conta e Enviar Código'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="bg-muted/30 flex justify-center py-4 rounded-b-lg border-t border-border">
          <Button variant="link" size="sm" className="text-primary font-semibold" onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? 'Não tem conta? Crie aqui' : 'Já tem conta? Faça login'}
          </Button>
        </CardFooter>
      </Card>

      <div className="mt-6 flex items-center gap-2 text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
        <Shield className="h-3 w-3" />
        Proteção de Dados HelioTech
      </div>
    </div>
  );
}
