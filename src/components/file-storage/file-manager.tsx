
'use client';

import { useState } from 'react';
import { useFirestore, useCollection } from '@/firebase';
import { collection, doc, deleteDoc, addDoc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload, FileArchive, Trash2, Download, ShieldCheck, Search, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { User } from 'firebase/auth';

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

    // Verificar se é um arquivo ZIP
    if (!file.name.toLowerCase().endsWith('.zip') && file.type !== 'application/zip' && file.type !== 'application/x-zip-compressed') {
      toast({
        variant: "destructive",
        title: "Arquivo inválido",
        description: "Apenas arquivos .ZIP são permitidos no seu cofre."
      });
      return;
    }

    if (file.size > 20 * 1024 * 1024) { // Limite de 20MB
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
        toast({ title: "Protegido!", description: `O arquivo ${file.name} foi guardado no seu cofre.` });
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
      toast({ title: "Removido", description: "O arquivo foi excluído do seu cofre." });
    } catch (error) {
      toast({ variant: "destructive", title: "Erro ao excluir", description: "Não foi possível remover o arquivo." });
    }
  };

  const filteredFiles = files?.filter(f => f.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <ShieldCheck className="h-8 w-8 text-primary" />
            Meu Cofre de ZIPs
          </h1>
          <p className="text-muted-foreground mt-1">Armazene seus arquivos ZIP com segurança total.</p>
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
          <Button asChild disabled={isUploading} size="lg" className="shadow-lg shadow-primary/20">
            <label htmlFor="file-upload" className="cursor-pointer">
              {isUploading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Upload className="mr-2 h-5 w-5" />}
              {isUploading ? "Criptografando..." : "Novo Arquivo ZIP"}
            </label>
          </Button>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Pesquisar no cofre..." 
          className="pl-10 h-12 bg-card border-2 focus-visible:ring-primary" 
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
            <Card key={file.id} className="group hover:shadow-xl transition-all border-2 hover:border-primary/40 overflow-hidden bg-card">
              <CardHeader className="p-4 flex flex-row items-start justify-between space-y-0 bg-primary/5">
                <div className="bg-primary/20 p-2.5 rounded-xl">
                  <FileArchive className="h-7 w-7 text-primary" />
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="icon" className="h-9 w-9 hover:bg-primary/10" asChild title="Baixar">
                    <a href={file.dataUri} download={file.name}>
                      <Download className="h-5 w-5" />
                    </a>
                  </Button>
                  <Button variant="ghost" size="icon" className="h-9 w-9 text-destructive hover:bg-destructive/10" onClick={() => handleDelete(file.id)} title="Excluir">
                    <Trash2 className="h-5 w-5" />
                  </Button>
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
          <div className="col-span-full py-24 text-center border-2 border-dashed rounded-2xl bg-muted/20">
            <FileArchive className="h-16 w-16 mx-auto text-muted-foreground opacity-20 mb-4" />
            <h3 className="text-lg font-semibold text-muted-foreground">O seu cofre está vazio</h3>
            <p className="text-sm text-muted-foreground/60 mb-6">Comece a proteger seus arquivos ZIP clicando no botão acima.</p>
            <Button variant="outline" onClick={() => document.getElementById('file-upload')?.click()}>
              Subir primeiro ZIP
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
