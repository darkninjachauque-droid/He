'use client';

import { useState } from 'react';
import { useFirestore, useCollection } from '@/firebase';
import { collection, doc, deleteDoc, addDoc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload, File, Trash2, Download, HardDrive, Search } from 'lucide-react';
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

    if (file.size > 10 * 1024 * 1024) { // 10MB limit for demo
      toast({
        variant: "destructive",
        title: "Arquivo muito grande",
        description: "O limite para este protótipo é de 10MB."
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
          type: file.type,
          size: file.size,
          dataUri: dataUri,
          createdAt: serverTimestamp(),
        });
        toast({ title: "Upload concluído", description: `O arquivo ${file.name} foi salvo.` });
      } catch (error) {
        toast({ variant: "destructive", title: "Erro no upload", description: "Não foi possível salvar o arquivo." });
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
      toast({ title: "Arquivo removido", description: "O arquivo foi excluído permanentemente." });
    } catch (error) {
      toast({ variant: "destructive", title: "Erro ao excluir", description: "Não foi possível remover o arquivo." });
    }
  };

  const filteredFiles = files?.filter(f => f.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Meus Arquivos</h1>
          <p className="text-muted-foreground">Gerencie seus documentos e mídias pessoais com segurança.</p>
        </div>
        <div className="flex items-center gap-2">
          <input 
            type="file" 
            id="file-upload" 
            className="hidden" 
            onChange={handleFileUpload} 
            disabled={isUploading}
          />
          <Button asChild disabled={isUploading}>
            <label htmlFor="file-upload" className="cursor-pointer">
              {isUploading ? <Upload className="mr-2 h-4 w-4 animate-bounce" /> : <Upload className="mr-2 h-4 w-4" />}
              {isUploading ? "Enviando..." : "Fazer Upload"}
            </label>
          </Button>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Buscar arquivos..." 
          className="pl-10" 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="animate-pulse bg-muted h-48" />
          ))
        ) : filteredFiles && filteredFiles.length > 0 ? (
          filteredFiles.map((file) => (
            <Card key={file.id} className="group hover:shadow-md transition-all border-2 hover:border-primary/20">
              <CardHeader className="p-4 flex flex-row items-start justify-between space-y-0">
                <div className="bg-primary/10 p-2 rounded-lg">
                  <File className="h-6 w-6 text-primary" />
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                    <a href={file.dataUri} download={file.name}>
                      <Download className="h-4 w-4" />
                    </a>
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(file.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <CardTitle className="text-sm font-semibold truncate" title={file.name}>
                  {file.name}
                </CardTitle>
                <CardDescription className="text-xs mt-1">
                  {(file.size / 1024).toFixed(1)} KB • {file.type.split('/')[1]?.toUpperCase() || 'FILE'}
                </CardDescription>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full py-20 text-center border-2 border-dashed rounded-xl">
            <HardDrive className="h-12 w-12 mx-auto text-muted-foreground opacity-20 mb-4" />
            <p className="text-muted-foreground">Nenhum arquivo encontrado.</p>
            <Button variant="link" onClick={() => document.getElementById('file-upload')?.click()}>
              Comece fazendo um upload agora.
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
