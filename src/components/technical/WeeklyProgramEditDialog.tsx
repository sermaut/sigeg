import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Upload, X, Image as ImageIcon, Music, Loader2, FileText, Camera, Mic } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface WeeklyProgram {
  id: string;
  title: string;
  image_url: string;
  audio_url: string | null;
  created_at: string;
  expires_at: string;
}

interface WeeklyProgramEditDialogProps {
  program: WeeklyProgram;
  onClose: () => void;
  onUpdate: () => void;
}

export function WeeklyProgramEditDialog({ program, onClose, onUpdate }: WeeklyProgramEditDialogProps) {
  const [title, setTitle] = useState(program.title);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>(program.image_url);
  const [audioPreview, setAudioPreview] = useState<string | null>(program.audio_url);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  
  const imageInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  
  const { toast } = useToast();

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];

      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/mp3' });
        const file = new File([blob], `recording_${Date.now()}.mp3`, { type: 'audio/mp3' });
        setAudioFile(file);
        
        const audioUrl = URL.createObjectURL(blob);
        setAudioPreview(audioUrl);
        
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
      
      toast({
        title: "Gravação iniciada",
        description: "Clique novamente para parar",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível acessar o microfone",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
      setMediaRecorder(null);
      toast({
        title: "Gravação finalizada",
        description: "Áudio salvo com sucesso",
      });
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validImageTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    if (!validImageTypes.includes(file.type)) {
      toast({
        title: "Erro",
        description: "Apenas imagens PNG ou JPG são permitidas",
        variant: "destructive",
      });
      return;
    }

    setImageFile(file);
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleAudioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validAudioTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/x-m4a', 'audio/m4a'];
    if (!validAudioTypes.includes(file.type)) {
      toast({
        title: "Erro",
        description: "Apenas áudios MP3, WAV ou M4A são permitidos",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 12 * 1024 * 1024) {
      toast({
        title: "Erro",
        description: "O áudio deve ter no máximo 12MB",
        variant: "destructive",
      });
      return;
    }

    setAudioFile(file);
    const audioUrl = URL.createObjectURL(file);
    setAudioPreview(audioUrl);
  };

  const handleCameraCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validImageTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    if (!validImageTypes.includes(file.type)) {
      toast({
        title: "Erro",
        description: "Apenas imagens PNG ou JPG são permitidas",
        variant: "destructive",
      });
      return;
    }

    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUpdate = async () => {
    if (!title.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, insira um título",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    try {
      const updates: any = { title: title.trim() };

      // Upload new image if provided
      if (imageFile) {
        const imageExt = imageFile.name.split('.').pop();
        const imagePath = `${program.id}_image_${Date.now()}.${imageExt}`;
        
        const { error: imageError } = await supabase.storage
          .from('weekly-programs')
          .upload(imagePath, imageFile);

        if (imageError) {
          throw new Error(`Erro ao enviar imagem: ${imageError.message}`);
        }

        const { data: imageUrlData } = supabase.storage
          .from('weekly-programs')
          .getPublicUrl(imagePath);

        updates.image_url = imageUrlData.publicUrl;
      }

      // Upload new audio if provided
      if (audioFile) {
        const audioExt = audioFile.name.split('.').pop();
        const audioPath = `${program.id}_audio_${Date.now()}.${audioExt}`;
        
        const { error: audioError } = await supabase.storage
          .from('weekly-programs')
          .upload(audioPath, audioFile);

        if (audioError) {
          throw new Error(`Erro ao enviar áudio: ${audioError.message}`);
        }

        const { data: audioUrlData } = supabase.storage
          .from('weekly-programs')
          .getPublicUrl(audioPath);

        updates.audio_url = audioUrlData.publicUrl;
      }

      // Update database
      const { error: dbError } = await supabase
        .from('weekly_program_content')
        .update(updates)
        .eq('id', program.id);

      if (dbError) throw dbError;

      toast({
        title: "Sucesso",
        description: "Programa atualizado com sucesso!",
      });

      onUpdate();
      onClose();
    } catch (error: any) {
      console.error('Erro ao atualizar programa:', error);
      toast({
        title: "Erro",
        description: error.message || "Falha ao atualizar programa. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Editar Programa Semanal
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Título */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">
              Título
            </label>
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
              Imagem
            </label>
            </div>
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => imageInputRef.current?.click()}
                  disabled={uploading}
                  className="border-primary/20 hover:border-primary hover:bg-primary/5"
                >
                  <ImageIcon className="w-4 h-4 mr-2" />
                  Galeria
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => cameraInputRef.current?.click()}
                  disabled={uploading}
                  className="border-primary/20 hover:border-primary hover:bg-primary/5"
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Câmera
                </Button>
              </div>
              <input
                ref={imageInputRef}
                type="file"
                accept="image/png,image/jpeg,image/jpg"
                onChange={handleImageChange}
                className="hidden"
              />
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/png,image/jpeg,image/jpg"
                capture="environment"
                onChange={handleCameraCapture}
                className="hidden"
              />
              {imagePreview && (
                <div className="relative group">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-48 object-cover rounded-lg border-2 border-primary/20 shadow-md"
                  />
                  {imageFile && (
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => {
                        setImageFile(null);
                        setImagePreview(program.image_url);
                        if (imageInputRef.current) imageInputRef.current.value = "";
                      }}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
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
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => audioInputRef.current?.click()}
                  disabled={uploading}
                  className="border-primary/20 hover:border-primary hover:bg-primary/5"
                >
                  <Music className="w-4 h-4 mr-2" />
                  Arquivo
                </Button>
                <Button
                  type="button"
                  variant={isRecording ? "destructive" : "outline"}
                  onClick={isRecording ? stopRecording : startRecording}
                  disabled={uploading}
                  className={!isRecording ? "border-primary/20 hover:border-primary hover:bg-primary/5" : ""}
                >
                  <Mic className={`w-4 h-4 mr-2 ${isRecording ? 'animate-pulse' : ''}`} />
                  {isRecording ? "Parar" : "Gravar"}
                </Button>
              </div>
              <input
                ref={audioInputRef}
                type="file"
                accept="audio/mpeg,audio/mp3,audio/wav,audio/x-m4a,audio/m4a"
                onChange={handleAudioChange}
                className="hidden"
              />
              {audioPreview && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 bg-gradient-to-r from-primary/5 to-accent/5 rounded-lg border border-primary/10">
                    <span className="text-sm font-medium truncate">
                      {audioFile ? audioFile.name : "Áudio atual"}
                    </span>
                    {audioFile && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="hover:bg-destructive/10 flex-shrink-0"
                        onClick={() => {
                          setAudioFile(null);
                          setAudioPreview(program.audio_url);
                          if (audioInputRef.current) audioInputRef.current.value = "";
                        }}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  <audio controls className="w-full" src={audioPreview}>
                    Seu navegador não suporta o elemento de áudio.
                  </audio>
                </div>
              )}
            </div>
          </div>

          {/* Botões de ação */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={uploading}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleUpdate}
              disabled={uploading || !title.trim()}
              className="flex-1 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Atualizando...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Atualizar Programa
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
