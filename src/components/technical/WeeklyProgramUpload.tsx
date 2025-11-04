import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Upload, X, Image as ImageIcon, Music, Loader2, FileText, Camera, Mic, ChevronDown, ChevronUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

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
  const [isOpen, setIsOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioPreview, setAudioPreview] = useState<string | null>(null);
  
  const imageInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  
  const { toast } = useToast();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de arquivo
    const validImageTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    if (!validImageTypes.includes(file.type)) {
      toast({
        title: "Erro",
        description: "Apenas imagens PNG ou JPG são permitidas",
        variant: "destructive",
      });
      return;
    }

    // Check file size (max 4MB)
    if (file.size > 4 * 1024 * 1024) {
      toast({
        title: "Erro",
        description: "A imagem deve ter no máximo 4MB",
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

    // Validar tipo de arquivo
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
    
    // Create audio preview URL
    const audioUrl = URL.createObjectURL(file);
    setAudioPreview(audioUrl);
  };

  const handleCameraCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de arquivo
    const validImageTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    if (!validImageTypes.includes(file.type)) {
      toast({
        title: "Erro",
        description: "Apenas imagens PNG ou JPG são permitidas",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 4 * 1024 * 1024) {
      toast({
        title: "Erro",
        description: "A imagem deve ter no máximo 4MB",
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
        
        // Create audio preview URL
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
      
      console.log('Iniciando upload de imagem:', imagePath);
      
      const { error: imageError } = await supabase.storage
        .from('weekly-programs')
        .upload(imagePath, imageFile);

      if (imageError) {
        console.error('Erro detalhado no upload de imagem:', imageError);
        throw new Error(`Erro ao enviar imagem: ${imageError.message}`);
      }

      const { data: imageUrlData } = supabase.storage
        .from('weekly-programs')
        .getPublicUrl(imagePath);

      let audioUrl = null;

      // Upload audio if provided
      if (audioFile) {
        const audioExt = audioFile.name.split('.').pop();
        const audioPath = `${groupId}/${Date.now()}_audio.${audioExt}`;
        
        console.log('Iniciando upload de áudio:', audioPath);
        
        const { error: audioError } = await supabase.storage
          .from('weekly-programs')
          .upload(audioPath, audioFile);

        if (audioError) {
          console.error('Erro detalhado no upload de áudio:', audioError);
          throw new Error(`Erro ao enviar áudio: ${audioError.message}`);
        }

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

      setTitle("");
      setImageFile(null);
      setAudioFile(null);
      setImagePreview(null);
      setAudioPreview(null);
      if (imageInputRef.current) imageInputRef.current.value = "";
      if (audioInputRef.current) audioInputRef.current.value = "";
      if (cameraInputRef.current) cameraInputRef.current.value = "";
      setIsOpen(false);

      onUploadComplete();
    } catch (error: any) {
      console.error('Erro ao fazer upload:', error);
      toast({
        title: "Erro",
        description: error.message || "Falha ao fazer upload. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="border-2 border-primary/10 shadow-lg overflow-hidden">
        <CollapsibleTrigger asChild>
          <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-primary/5 transition-colors bg-gradient-to-r from-primary/5 to-accent/5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Upload className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Adicionar Programa Semanal</h3>
                <p className="text-xs text-muted-foreground">Clique para expandir</p>
              </div>
            </div>
            {isOpen ? <ChevronUp className="w-5 h-5 text-primary" /> : <ChevronDown className="w-5 h-5 text-primary" />}
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="p-6 space-y-4 bg-gradient-to-br from-background via-primary/3 to-accent/3">

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
            Imagem (máx. 4MB)
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
              {isRecording ? (
                <>
                  <span className="flex items-center gap-1">
                    <span className="w-1 h-3 bg-white animate-wave-1 rounded-full"></span>
                    <span className="w-1 h-4 bg-white animate-wave-2 rounded-full"></span>
                    <span className="w-1 h-3 bg-white animate-wave-3 rounded-full"></span>
                    <span className="w-1 h-4 bg-white animate-wave-1 rounded-full"></span>
                    <span className="w-1 h-3 bg-white animate-wave-2 rounded-full"></span>
                  </span>
                  Parar
                </>
              ) : "Gravar"}
            </Button>
          </div>
          <input
            ref={audioInputRef}
            type="file"
            accept="audio/mpeg,audio/mp3,audio/wav,audio/x-m4a,audio/m4a"
            onChange={handleAudioChange}
            className="hidden"
          />
          {audioFile && (
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 bg-gradient-to-r from-primary/5 to-accent/5 rounded-lg border border-primary/10">
                <span className="text-sm truncate font-medium">{audioFile.name}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="hover:bg-destructive/10"
                  onClick={() => {
                    setAudioFile(null);
                    setAudioPreview(null);
                    if (audioInputRef.current) audioInputRef.current.value = "";
                  }}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              {audioPreview && (
                <audio controls className="w-full" src={audioPreview}>
                  Seu navegador não suporta o elemento de áudio.
                </audio>
              )}
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
          </div>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
