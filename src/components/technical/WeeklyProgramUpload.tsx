import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Upload, X, Image as ImageIcon, Music, Loader2, FileText, Camera, Mic, ChevronDown, ChevronUp, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { usePermissions } from "@/hooks/usePermissions";
import { compressImage } from "@/lib/imageOptimization";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface WeeklyProgramUploadProps {
  groupId: string;
  onUploadComplete: () => void;
}

interface HymnsItem {
  subtitle: string;
  imageFile: File | null;
  audioFile: File | null;
  imagePreview: string | null;
  audioPreview: string | null;
}

interface AccompanimentItem {
  subtitle: string;
  audioFile: File | null;
  audioPreview: string | null;
}

export function WeeklyProgramUpload({ groupId, onUploadComplete }: WeeklyProgramUploadProps) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<"hino" | "acompanhamento">("hino");
  const [hymnsItems, setHymnsItems] = useState<HymnsItem[]>([]);
  const [accompanimentItems, setAccompanimentItems] = useState<AccompanimentItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isRecording, setIsRecording] = useState<number | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  
  const { toast } = useToast();
  const permissions = usePermissions();

  const handleOpenChange = (open: boolean) => {
    if (open && !permissions.canAddWeeklyProgram) {
      toast({
        title: "Acesso restrito",
        description: "Só os Dirigentes podem adicionar programa",
        variant: "destructive",
      });
      return;
    }
    setIsOpen(open);
  };

  const addHymnsItem = () => {
    if (hymnsItems.length >= 5) {
      toast({
        title: "Limite atingido",
        description: "Máximo de 5 imagens por programa de hino",
        variant: "destructive",
      });
      return;
    }
    setHymnsItems([...hymnsItems, { subtitle: "", imageFile: null, audioFile: null, imagePreview: null, audioPreview: null }]);
  };

  const addAccompanimentItem = () => {
    if (accompanimentItems.length >= 4) {
      toast({
        title: "Limite atingido",
        description: "Máximo de 4 áudios por programa de acompanhamento",
        variant: "destructive",
      });
      return;
    }
    setAccompanimentItems([...accompanimentItems, { subtitle: "", audioFile: null, audioPreview: null }]);
  };

  const handleHymnsImageChange = async (index: number, file: File) => {
    const validImageTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    if (!validImageTypes.includes(file.type)) {
      toast({
        title: "Erro",
        description: "Apenas imagens PNG ou JPG são permitidas",
        variant: "destructive",
      });
      return;
    }

    let finalFile = file;
    if (file.size > 1024 * 1024) {
      try {
        finalFile = await compressImage(file, 1920, 0.7);
      } catch (error) {
        console.error('Erro ao comprimir:', error);
      }
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const newItems = [...hymnsItems];
      newItems[index].imageFile = finalFile;
      newItems[index].imagePreview = reader.result as string;
      setHymnsItems(newItems);
    };
    reader.readAsDataURL(finalFile);
  };

  const handleHymnsAudioChange = (index: number, file: File) => {
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

    const audioUrl = URL.createObjectURL(file);
    const newItems = [...hymnsItems];
    newItems[index].audioFile = file;
    newItems[index].audioPreview = audioUrl;
    setHymnsItems(newItems);
  };

  const handleAccompanimentAudioChange = (index: number, file: File) => {
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

    const audioUrl = URL.createObjectURL(file);
    const newItems = [...accompanimentItems];
    newItems[index].audioFile = file;
    newItems[index].audioPreview = audioUrl;
    setAccompanimentItems(newItems);
  };

  const startRecording = async (index: number, isHymns: boolean) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];

      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/mp3' });
        const file = new File([blob], `recording_${Date.now()}.mp3`, { type: 'audio/mp3' });
        const audioUrl = URL.createObjectURL(blob);
        
        if (isHymns) {
          const newItems = [...hymnsItems];
          newItems[index].audioFile = file;
          newItems[index].audioPreview = audioUrl;
          setHymnsItems(newItems);
        } else {
          const newItems = [...accompanimentItems];
          newItems[index].audioFile = file;
          newItems[index].audioPreview = audioUrl;
          setAccompanimentItems(newItems);
        }
        
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(index);
      
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
    if (mediaRecorder && isRecording !== null) {
      mediaRecorder.stop();
      setIsRecording(null);
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

    // Validações específicas por categoria
    if (category === "hino") {
      // Para hinos: pode publicar sem imagens, mas se houver imagem deve ter áudio
      const itemsWithImage = hymnsItems.filter(item => item.imageFile);
      const itemsWithImageButNoAudio = itemsWithImage.filter(item => !item.audioFile);
      
      if (itemsWithImageButNoAudio.length > 0) {
        toast({
          title: "Erro",
          description: "Imagens sem áudio não são permitidas",
          variant: "destructive",
        });
        return;
      }
    } else {
      // Para acompanhamentos: deve ter pelo menos 1 áudio
      if (accompanimentItems.length === 0 || !accompanimentItems.some(item => item.audioFile)) {
        toast({
          title: "Erro",
          description: "Adicione pelo menos um áudio",
          variant: "destructive",
        });
        return;
      }
    }

    setUploading(true);

    try {
      let items: any[] = [];

      if (category === "hino") {
        // Upload de hinos
        for (const item of hymnsItems) {
          if (!item.imageFile && !item.audioFile) continue;

          let imageUrl = null;
          let audioUrl = null;

          if (item.imageFile) {
            const imageExt = item.imageFile.name.split('.').pop();
            const imagePath = `${groupId}/${Date.now()}_${Math.random()}_image.${imageExt}`;
            
            const { error: imageError } = await supabase.storage
              .from('weekly-programs')
              .upload(imagePath, item.imageFile, {
                cacheControl: '3600',
                upsert: false
              });

            if (imageError) throw new Error(`Erro ao enviar imagem: ${imageError.message}`);

            const { data: imageUrlData } = supabase.storage
              .from('weekly-programs')
              .getPublicUrl(imagePath);

            imageUrl = imageUrlData.publicUrl;
          }

          if (item.audioFile) {
            const audioExt = item.audioFile.name.split('.').pop();
            const audioPath = `${groupId}/${Date.now()}_${Math.random()}_audio.${audioExt}`;
            
            const { error: audioError } = await supabase.storage
              .from('weekly-programs')
              .upload(audioPath, item.audioFile);

            if (audioError) throw new Error(`Erro ao enviar áudio: ${audioError.message}`);

            const { data: audioUrlData } = supabase.storage
              .from('weekly-programs')
              .getPublicUrl(audioPath);

            audioUrl = audioUrlData.publicUrl;
          }

          items.push({
            subtitle: item.subtitle.trim(),
            image_url: imageUrl,
            audio_url: audioUrl,
          });
        }
      } else {
        // Upload de acompanhamentos
        for (const item of accompanimentItems) {
          if (!item.audioFile) continue;

          const audioExt = item.audioFile.name.split('.').pop();
          const audioPath = `${groupId}/${Date.now()}_${Math.random()}_audio.${audioExt}`;
          
          const { error: audioError } = await supabase.storage
            .from('weekly-programs')
            .upload(audioPath, item.audioFile);

          if (audioError) throw new Error(`Erro ao enviar áudio: ${audioError.message}`);

          const { data: audioUrlData } = supabase.storage
            .from('weekly-programs')
            .getPublicUrl(audioPath);

          items.push({
            subtitle: item.subtitle.trim(),
            audio_url: audioUrlData.publicUrl,
          });
        }
      }

      // Save to database
      const { error: dbError } = await supabase
        .from('weekly_program_content')
        .insert({
          group_id: groupId,
          title: title.trim(),
          category,
          items,
          image_url: null, // Não mais usado na nova estrutura
        });

      if (dbError) throw dbError;

      toast({
        title: "Sucesso",
        description: "Programa semanal adicionado com sucesso! Será removido automaticamente após 6 dias.",
      });

      // Clean up object URLs to prevent memory leaks
      hymnsItems.forEach(item => {
        if (item.audioPreview && item.audioPreview.startsWith('blob:')) {
          URL.revokeObjectURL(item.audioPreview);
        }
      });
      accompanimentItems.forEach(item => {
        if (item.audioPreview && item.audioPreview.startsWith('blob:')) {
          URL.revokeObjectURL(item.audioPreview);
        }
      });

      // Reset form
      setTitle("");
      setCategory("hino");
      setHymnsItems([]);
      setAccompanimentItems([]);
      setIsOpen(false);

      onUploadComplete();
    } catch (error: any) {
      console.error('Erro ao fazer upload:', error);
      
      // More specific error messages
      let errorMessage = "Falha ao fazer upload. Tente novamente.";
      if (error.message?.includes('storage')) {
        errorMessage = "Erro ao enviar arquivos. Verifique sua conexão.";
      } else if (error.message?.includes('database') || error.message?.includes('insert')) {
        errorMessage = "Erro ao salvar dados. Tente novamente.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Collapsible open={isOpen} onOpenChange={handleOpenChange}>
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
                  Título *
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

            {/* Categoria */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-foreground">Categoria *</Label>
              <Select value={category} onValueChange={(value: "hino" | "acompanhamento") => {
                setCategory(value);
                setHymnsItems([]);
                setAccompanimentItems([]);
              }}>
                <SelectTrigger className="border-primary/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hino">Hinos</SelectItem>
                  <SelectItem value="acompanhamento">Acompanhamentos</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Items - Hinos */}
            {category === "hino" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-semibold text-foreground">Hinos (até 5)</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addHymnsItem}
                    disabled={uploading || hymnsItems.length >= 5}
                    className="border-primary/20"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Adicionar Hino
                  </Button>
                </div>

                {hymnsItems.map((item, index) => (
                  <Card key={index} className="p-4 space-y-3 border-primary/10">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">Hino {index + 1}</Label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setHymnsItems(hymnsItems.filter((_, i) => i !== index))}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>

                    <Input
                      placeholder="Subtítulo (opcional)"
                      value={item.subtitle}
                      onChange={(e) => {
                        const newItems = [...hymnsItems];
                        newItems[index].subtitle = e.target.value;
                        setHymnsItems(newItems);
                      }}
                      disabled={uploading}
                    />

                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const input = document.createElement('input');
                          input.type = 'file';
                          input.accept = 'image/png,image/jpeg,image/jpg';
                          input.onchange = (e: any) => handleHymnsImageChange(index, e.target.files[0]);
                          input.click();
                        }}
                        disabled={uploading}
                      >
                        <ImageIcon className="w-4 h-4 mr-1" />
                        Imagem
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const input = document.createElement('input');
                          input.type = 'file';
                          input.accept = 'audio/mpeg,audio/mp3,audio/wav,audio/x-m4a,audio/m4a';
                          input.onchange = (e: any) => handleHymnsAudioChange(index, e.target.files[0]);
                          input.click();
                        }}
                        disabled={uploading}
                      >
                        <Music className="w-4 h-4 mr-1" />
                        Áudio
                      </Button>
                    </div>

                    <Button
                      type="button"
                      variant={isRecording === index ? "destructive" : "outline"}
                      size="sm"
                      onClick={() => isRecording === index ? stopRecording() : startRecording(index, true)}
                      disabled={uploading}
                      className="w-full"
                    >
                      <Mic className={`w-4 h-4 mr-2 ${isRecording === index ? 'animate-pulse' : ''}`} />
                      {isRecording === index ? "Parar Gravação" : "Gravar Áudio"}
                    </Button>

                    {item.imagePreview && (
                      <img src={item.imagePreview} alt="Preview" className="w-full h-32 object-cover rounded-lg border" />
                    )}

                    {item.audioPreview && (
                      <audio controls className="w-full" src={item.audioPreview} />
                    )}
                  </Card>
                ))}

                {hymnsItems.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Programa sem itens será publicado apenas com o título
                  </p>
                )}
              </div>
            )}

            {/* Items - Acompanhamentos */}
            {category === "acompanhamento" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-semibold text-foreground">Acompanhamentos (até 4)</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addAccompanimentItem}
                    disabled={uploading || accompanimentItems.length >= 4}
                    className="border-primary/20"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Adicionar Áudio
                  </Button>
                </div>

                {accompanimentItems.map((item, index) => (
                  <Card key={index} className="p-4 space-y-3 border-primary/10">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">Áudio {index + 1}</Label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setAccompanimentItems(accompanimentItems.filter((_, i) => i !== index))}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>

                    <Input
                      placeholder="Subtítulo (opcional)"
                      value={item.subtitle}
                      onChange={(e) => {
                        const newItems = [...accompanimentItems];
                        newItems[index].subtitle = e.target.value;
                        setAccompanimentItems(newItems);
                      }}
                      disabled={uploading}
                    />

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const input = document.createElement('input');
                        input.type = 'file';
                        input.accept = 'audio/mpeg,audio/mp3,audio/wav,audio/x-m4a,audio/m4a';
                        input.onchange = (e: any) => handleAccompanimentAudioChange(index, e.target.files[0]);
                        input.click();
                      }}
                      disabled={uploading}
                      className="w-full"
                    >
                      <Music className="w-4 h-4 mr-2" />
                      Selecionar Áudio
                    </Button>

                    <Button
                      type="button"
                      variant={isRecording === index ? "destructive" : "outline"}
                      size="sm"
                      onClick={() => isRecording === index ? stopRecording() : startRecording(index, false)}
                      disabled={uploading}
                      className="w-full"
                    >
                      <Mic className={`w-4 h-4 mr-2 ${isRecording === index ? 'animate-pulse' : ''}`} />
                      {isRecording === index ? "Parar Gravação" : "Gravar Áudio"}
                    </Button>

                    {item.audioPreview && (
                      <audio controls className="w-full" src={item.audioPreview} />
                    )}
                  </Card>
                ))}

                {accompanimentItems.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Adicione pelo menos um áudio
                  </p>
                )}
              </div>
            )}

            {/* Botão de Upload */}
            <Button
              onClick={handleUpload}
              disabled={uploading || !title.trim()}
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
