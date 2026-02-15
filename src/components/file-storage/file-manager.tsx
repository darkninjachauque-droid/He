'use client';

import { useState } from 'react';
import { useFirestore, useCollection } from '@/firebase';
import { collection, doc, deleteDoc, addDoc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Upload, 
  FileArchive, 
  Trash2, 
  Download, 
  ShieldCheck, 
  Search, 
  Loader2, 
  AlertTriangle,
  MailWarning
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { User } from 'firebase/auth';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export function FileManager({ user }: { user: User }) {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const filesRef = firestore ? collection(firestore, 'users', user.uid, 'files') : null;
  const filesQuery = filesRef ? query(filesRef, orderBy('createdAt', 'desc')) : null;
  const { data: files, loading } = useCollection(filesQuery);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !filesRef) return;

    if (!file.name.toLowerCase().endsWith('.zip') && file.type !== 'application/zip' && file.type !== 'application/x-zip-compressed') {
      toast({
        variant: "destructive",
        title: "Arquivo inválido",
        description: "Apenas arquivos .ZIP são permitidos no seu cofre HelioTech."
      });
      return;
    }

    if (file.size > 20 * 1024 * 1024) { 
      toast({
        variant: "destructive",
        title: "Arquivo muito grande",
        description: "O limite de upload é de 20MB para garantir a velocidade."
      });
      return;
    }

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUri = event.target?.result as string;
      
      try {
        await addDoc(filesRef, {
          name: file.name,
          type: file.type || 'application/zip',
          size: file.size,
          dataUri: dataUri,
          createdAt: serverTimestamp(),
        });
        toast({ title: "Arquivo Salvo!", description: `O arquivo ${file.name} foi guardado permanentemente.` });
      } catch (error) {
        toast({ variant: "destructive", title: "Erro ao guardar", description: "Não foi possível salvar o arquivo." });
      } finally {
        setIsUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDelete = async (fileId: string) => {
    if (!filesRef) return;
    try {
      await deleteDoc(doc(filesRef, fileId));
      toast({ title: "Removido", description: "O arquivo foi excluído com sucesso." });
    } catch (error) {
      toast({ variant: "destructive", title: "Erro ao excluir", description: "Não foi possível remover o arquivo." });
    }
  };

  const filteredFiles = files?.filter(f => f.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Aviso de E-mail não verificado */}
      {!user.emailVerified && !user.providerData.some(p => p.providerId === 'google.com') && (
        <Alert variant="destructive" className="bg-destructive/10 border-destructive/50 text-destructive">
          <MailWarning className="h-4 w-4" />
          <AlertTitle>Verifique seu E-mail</AlertTitle>
          <AlertDescription>
            Sua conta ainda não está verificada. Verifique sua caixa de entrada para garantir acesso total ao cofre.
          </AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3 text-primary">
            <ShieldCheck className="h-8 w-8" />
            Meu Cofre Seguro
          </h1>
          <p className="text-muted-foreground mt-1">Arquivos ZIP protegidos pela criptografia HelioTech.</p>
        </div>
        <div className="flex items-center gap-2">
          <input 
            type="file" 
            id="file-upload" 
            className="hidden" 
            accept=".zip"
            onChange={handleFileUpload} 
            disabled={isUploading}
          />
          <Button asChild disabled={isUploading} size="lg" className="shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90">
            <label htmlFor="file-upload" className="cursor-pointer">
              {isUploading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Upload className="mr-2 h-5 w-5" />}
              {isUploading ? "Guardando..." : "Salvar Novo ZIP"}
            </label>
          </Button>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Pesquisar nos meus arquivos guardados..." 
          className="pl-10 h-12 bg-card border-2 border-white/5 focus-visible:ring-primary" 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="animate-pulse bg-muted h-48 rounded-xl" />
          ))
        ) : filteredFiles && filteredFiles.length > 0 ? (
          filteredFiles.map((file) => (
            <Card key={file.id} className="group hover:shadow-xl transition-all border-2 border-white/5 hover:border-primary/40 overflow-hidden bg-card">
              <CardHeader className="p-4 flex flex-row items-start justify-between space-y-0 bg-primary/5">
                <div className="bg-primary/20 p-2.5 rounded-xl">
                  <FileArchive className="h-7 w-7 text-primary" />
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="icon" className="h-9 w-9 hover:bg-primary/10 text-primary" asChild title="Baixar">
                    <a href={file.dataUri} download={file.name}>
                      <Download className="h-5 w-5" />
                    </a>
                  </Button>
                  
                  {/* Diálogo de confirmação para exclusão */}
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-9 w-9 text-destructive hover:bg-destructive/10" title="Excluir">
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-background border-2 border-destructive/20">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                          <AlertTriangle className="h-5 w-5 text-destructive" />
                          Tem certeza absoluta?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          Esta ação não pode ser desfeita. O arquivo <strong>{file.name}</strong> será removido permanentemente do seu cofre HelioTech.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="border-white/10 hover:bg-white/5">Manter Arquivo</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => handleDelete(file.id)}
                          className="bg-destructive hover:bg-destructive/90"
                        >
                          Excluir Agora
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardHeader>
              <CardContent className="p-5">
                <CardTitle className="text-sm font-bold truncate mb-1" title={file.name}>
                  {file.name}
                </CardTitle>
                <div className="flex items-center justify-between mt-4">
                  <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">
                    {(file.size / 1024).toFixed(1)} KB
                  </span>
                  <div className="flex items-center gap-1 text-[10px] text-primary font-bold">
                    <ShieldCheck className="h-3 w-3" />
                    PROTEGIDO
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full py-24 text-center border-2 border-dashed border-white/10 rounded-2xl bg-muted/20">
            <FileArchive className="h-16 w-16 mx-auto text-muted-foreground opacity-20 mb-4" />
            <h3 className="text-lg font-semibold text-muted-foreground">O cofre está pronto para receber arquivos</h3>
            <p className="text-sm text-muted-foreground/60 mb-6">Guarde seus ZIPs aqui com segurança total.</p>
            <Button variant="outline" onClick={() => document.getElementById('file-upload')?.click()}>
              Guardar Primeiro ZIP
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
