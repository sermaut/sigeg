import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Upload, X, Image as ImageIcon, Music, Loader2, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface WeeklyProgramUploadProps {
  groupId: string;
  onUploadComplete: () => void;
}

export function WeeklyProgramUpload({ groupId, onUploadComplete }: WeeklyProgramUploadProps) {
  const [title, setTitle] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  const imageInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  
  const { toast } = useToast();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "Erro",
        description: "A imagem deve ter no máximo 2MB",
        variant: "destructive",
      });
      return;
    }

    setImageFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleAudioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (max 12MB)
    if (file.size > 12 * 1024 * 1024) {
      toast({
        title: "Erro",
        description: "O áudio deve ter no máximo 12MB",
        variant: "destructive",
      });
      return;
    }

    setAudioFile(file);
  };

  const handleUpload = async () => {
    if (!title.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, insira um título",
        variant: "destructive",
      });
      return;
    }

    if (!imageFile) {
      toast({
        title: "Erro",
        description: "Por favor, selecione uma imagem",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    try {
      // Upload image
      const imageExt = imageFile.name.split('.').pop();
      const imagePath = `${groupId}/${Date.now()}_image.${imageExt}`;
      
      const { error: imageError } = await supabase.storage
        .from('weekly-programs')
        .upload(imagePath, imageFile);

      if (imageError) throw imageError;

      const { data: imageUrlData } = supabase.storage
        .from('weekly-programs')
        .getPublicUrl(imagePath);

      let audioUrl = null;

      // Upload audio if provided
      if (audioFile) {
        const audioExt = audioFile.name.split('.').pop();
        const audioPath = `${groupId}/${Date.now()}_audio.${audioExt}`;
        
        const { error: audioError } = await supabase.storage
          .from('weekly-programs')
          .upload(audioPath, audioFile);

        if (audioError) throw audioError;

        const { data: audioUrlData } = supabase.storage
          .from('weekly-programs')
          .getPublicUrl(audioPath);

        audioUrl = audioUrlData.publicUrl;
      }

      // Save to database
      const { error: dbError } = await supabase
        .from('weekly_program_content')
        .insert({
          group_id: groupId,
          title: title.trim(),
          image_url: imageUrlData.publicUrl,
          audio_url: audioUrl,
        });

      if (dbError) throw dbError;

      toast({
        title: "Sucesso",
        description: "Programa semanal adicionado com sucesso! Será removido automaticamente após 6 dias.",
      });

      // Reset form
      setTitle("");
      setImageFile(null);
      setAudioFile(null);
      setImagePreview(null);
      if (imageInputRef.current) imageInputRef.current.value = "";
      if (audioInputRef.current) audioInputRef.current.value = "";

      onUploadComplete();
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      toast({
        title: "Erro",
        description: "Falha ao fazer upload. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card className="p-6 space-y-4 bg-gradient-to-br from-primary/5 via-background to-accent/5 border-2 border-primary/10 shadow-lg">
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-primary/20">
        <div className="p-3 bg-primary/10 rounded-lg">
          <Upload className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground">Adicionar Programa Semanal</h3>
          <p className="text-sm text-muted-foreground">Faça upload de imagem e áudio</p>
        </div>
      </div>

      {/* Título */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-primary" />
          <label className="text-sm font-semibold text-foreground">
            Título
          </label>
        </div>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Digite o título do programa"
          disabled={uploading}
          className="border-primary/20 focus:border-primary"
        />
      </div>

      {/* Imagem */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <ImageIcon className="w-4 h-4 text-primary" />
          <label className="text-sm font-semibold text-foreground">
            Imagem (máx. 2MB)
          </label>
        </div>
        <div className="space-y-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => imageInputRef.current?.click()}
            disabled={uploading}
            className="w-full border-primary/20 hover:border-primary hover:bg-primary/5"
          >
            <ImageIcon className="w-4 h-4 mr-2" />
            {imageFile ? imageFile.name : "Selecionar Imagem"}
          </Button>
          <input
            ref={imageInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleImageChange}
            className="hidden"
          />
          {imagePreview && (
            <div className="relative group">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full h-48 object-cover rounded-lg border-2 border-primary/20 shadow-md transition-transform duration-300 group-hover:scale-[1.02]"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors rounded-lg" />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                onClick={() => {
                  setImageFile(null);
                  setImagePreview(null);
                  if (imageInputRef.current) imageInputRef.current.value = "";
                }}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Áudio */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Music className="w-4 h-4 text-primary" />
          <label className="text-sm font-semibold text-foreground">
            Áudio (opcional, máx. 12MB)
          </label>
        </div>
        <div className="space-y-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => audioInputRef.current?.click()}
            disabled={uploading}
            className="w-full border-primary/20 hover:border-primary hover:bg-primary/5"
          >
            <Music className="w-4 h-4 mr-2" />
            {audioFile ? audioFile.name : "Selecionar Áudio"}
          </Button>
          <input
            ref={audioInputRef}
            type="file"
            accept="audio/mpeg,audio/wav,audio/mp3"
            onChange={handleAudioChange}
            className="hidden"
          />
          {audioFile && (
            <div className="flex items-center justify-between p-3 bg-gradient-to-r from-primary/5 to-accent/5 rounded-lg border border-primary/10">
              <span className="text-sm truncate font-medium">{audioFile.name}</span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="hover:bg-destructive/10"
                onClick={() => {
                  setAudioFile(null);
                  if (audioInputRef.current) audioInputRef.current.value = "";
                }}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Botão de Upload */}
      <Button
        onClick={handleUpload}
        disabled={uploading || !title.trim() || !imageFile}
        className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-md transition-all duration-300"
      >
        {uploading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Enviando...
          </>
        ) : (
          <>
            <Upload className="w-4 h-4 mr-2" />
            Adicionar Programa
          </>
        )}
      </Button>

      <p className="text-xs text-muted-foreground text-center pt-2 border-t border-primary/10">
        O conteúdo será automaticamente removido após 6 dias
      </p>
    </Card>
  );
}
