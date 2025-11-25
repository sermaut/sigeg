import { useState } from "react";
import { Upload, FileText } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

interface SheetMusicUploadProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function SheetMusicUpload({ open, onOpenChange, onSuccess }: SheetMusicUploadProps) {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    category: 'outros',
    partition: 'todos',
    event_type: ''
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (selectedFile.type !== 'application/pdf') {
      toast.error('Apenas arquivos PDF são permitidos');
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      toast.error('Arquivo muito grande (máx 10MB)');
      return;
    }

    setFile(selectedFile);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !user) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('sheet-music-pdfs')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const memberId = user.type === 'member' ? (user.data as any).id : null;
      const groupId = user.type === 'member' ? (user.data as any).group_id : 
                      user.type === 'group' ? (user.data as any).id : null;

      const { error: dbError } = await supabase
        .from('sheet_music')
        .insert({
          ...formData,
          file_url: fileName,
          file_size: file.size,
          uploaded_by: memberId,
          group_id: groupId
        });

      if (dbError) throw dbError;

      toast.success('Partitura enviada com sucesso');
      onSuccess();
      setFormData({ title: '', author: '', category: 'outros', partition: 'todos', event_type: '' });
      setFile(null);
    } catch (error) {
      console.error('Erro no upload:', error);
      toast.error('Erro ao enviar partitura');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Nova Partitura</DialogTitle>
          <DialogDescription>
            Envie uma partitura em formato PDF
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="file">Arquivo PDF *</Label>
            <div className="mt-2">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                {file ? (
                  <div className="flex items-center gap-2">
                    <FileText className="h-8 w-8 text-primary" />
                    <span className="text-sm">{file.name}</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <Upload className="h-8 w-8 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Clique ou arraste um PDF (máx 10MB)
                    </span>
                  </div>
                )}
                <input
                  id="file"
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="hidden"
                  required
                />
              </label>
            </div>
          </div>

          <div>
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="author">Autor</Label>
            <Input
              id="author"
              value={formData.author}
              onChange={(e) => setFormData({ ...formData, author: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category">Categoria *</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="alegria">🎉 Alegria</SelectItem>
                  <SelectItem value="lamentacao">😢 Lamentação</SelectItem>
                  <SelectItem value="morte">⚫ Morte</SelectItem>
                  <SelectItem value="perdao">🙏 Perdão</SelectItem>
                  <SelectItem value="outros">📄 Outros</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="partition">Partição</Label>
              <Select value={formData.partition} onValueChange={(value) => setFormData({ ...formData, partition: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="soprano">Soprano</SelectItem>
                  <SelectItem value="contralto">Contralto</SelectItem>
                  <SelectItem value="tenor">Tenor</SelectItem>
                  <SelectItem value="baixo">Baixo</SelectItem>
                  <SelectItem value="todos">Todas</SelectItem>
                  <SelectItem value="instrumental">Instrumental</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={uploading || !file}>
              {uploading ? 'Enviando...' : 'Enviar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
