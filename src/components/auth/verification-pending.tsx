'use client';

import { useState } from 'react';
import { User, sendEmailVerification, signOut } from 'firebase/auth';
import { useAuth } from '@/firebase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mail, Loader2, ShieldAlert, RefreshCw, LogOut } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface VerificationPendingProps {
  user: User;
}

export function VerificationPending({ user }: VerificationPendingProps) {
  const auth = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const handleRefresh = async () => {
    setLoading(true);
    try {
      // Força a atualização do estado do usuário para checar o emailVerified
      await user.reload();
      if (user.emailVerified) {
        toast({
          title: "E-mail Verificado!",
          description: "Bem-vindo ao seu cofre seguro HelioTech.",
        });
        window.location.reload(); // Recarrega a página para atualizar o estado global
      } else {
        toast({
          variant: "destructive",
          title: "Ainda não verificado",
          description: "Por favor, clique no link enviado para " + user.email,
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao atualizar",
        description: "Não foi possível verificar o status agora.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await sendEmailVerification(user);
      toast({
        title: "Link Enviado",
        description: "Um novo link de verificação foi enviado para " + user.email,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao enviar",
        description: "Aguarde um momento antes de tentar enviar novamente.",
      });
    } finally {
      setResending(false);
    }
  };

  const handleSignOut = () => {
    if (auth) signOut(auth);
  };

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 max-w-md mx-auto text-center space-y-8">
      <div className="relative">
        <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
        <div className="relative bg-secondary/40 w-24 h-24 rounded-3xl flex items-center justify-center border border-white/10 shadow-2xl">
          <Mail className="h-12 w-12 text-primary animate-pulse" />
          <ShieldAlert className="absolute -top-2 -right-2 h-8 w-8 text-destructive fill-background" />
        </div>
      </div>

      <div className="space-y-2">
        <h2 className="text-3xl font-bold text-white tracking-tight">Acesso Bloqueado</h2>
        <p className="text-muted-foreground leading-relaxed">
          Para sua segurança, o cofre da <strong>{user.email}</strong> só será aberto após a confirmação do e-mail.
        </p>
      </div>

      <Card className="w-full bg-secondary/20 border-white/5 backdrop-blur-md">
        <CardContent className="pt-6 space-y-4">
          <Button 
            className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-lg shadow-lg shadow-primary/20"
            onClick={handleRefresh}
            disabled={loading}
          >
            {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <RefreshCw className="mr-2 h-5 w-5" />}
            Já verifiquei meu e-mail
          </Button>

          <Button 
            variant="outline" 
            className="w-full border-white/10 hover:bg-white/5"
            onClick={handleResend}
            disabled={resending}
          >
            {resending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Reenviar link de confirmação
          </Button>
        </CardContent>
        <CardFooter className="flex justify-center border-t border-white/5 bg-black/20 py-4">
          <Button variant="ghost" className="text-muted-foreground hover:text-white" onClick={handleSignOut}>
            <LogOut className="mr-2 h-4 w-4" />
            Sair e usar outra conta
          </Button>
        </CardFooter>
      </Card>

      <div className="text-[10px] uppercase tracking-[0.2em] font-bold text-primary/60 flex items-center gap-2">
        <span className="w-8 h-px bg-primary/20" />
        Proteção HelioTech Ativa
        <span className="w-8 h-px bg-primary/20" />
      </div>
    </div>
  );
}
