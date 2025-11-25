import { Music, Download, Eye, Trash2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const categoryEmojis: Record<string, string> = {
  alegria: "🎉",
  lamentacao: "😢",
  morte: "⚫",
  perdao: "🙏",
  outros: "📄"
};

interface SheetMusicCardProps {
  sheetMusic: any;
  onUpdate: () => void;
}

export function SheetMusicCard({ sheetMusic, onUpdate }: SheetMusicCardProps) {
  const handleDownload = async () => {
    try {
      const { data } = await supabase.storage
        .from('sheet-music-pdfs')
        .download(sheetMusic.file_url);

      if (data) {
        const url = URL.createObjectURL(data);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${sheetMusic.title}.pdf`;
        a.click();

        await supabase
          .from('sheet_music')
          .update({ download_count: (sheetMusic.download_count || 0) + 1 })
          .eq('id', sheetMusic.id);

        toast.success('Download iniciado');
      }
    } catch (error) {
      console.error('Erro no download:', error);
      toast.error('Erro ao fazer download');
    }
  };

  const handleDelete = async () => {
    if (!confirm('Deseja realmente excluir esta partitura?')) return;

    try {
      await supabase
        .from('sheet_music')
        .update({ is_active: false })
        .eq('id', sheetMusic.id);

      toast.success('Partitura excluída');
      onUpdate();
    } catch (error) {
      console.error('Erro ao excluir:', error);
      toast.error('Erro ao excluir partitura');
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <CardTitle className="text-lg flex items-center gap-2">
              <Music className="h-5 w-5" />
              {sheetMusic.title}
            </CardTitle>
            {sheetMusic.author && (
              <CardDescription className="mt-1">
                {sheetMusic.author}
              </CardDescription>
            )}
          </div>
          <span className="text-2xl">{categoryEmojis[sheetMusic.category]}</span>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">{sheetMusic.partition || 'Todas'}</Badge>
          <Badge variant="outline">
            {sheetMusic.download_count || 0} downloads
          </Badge>
        </div>

        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="flex-1" onClick={handleDownload}>
            <Download className="h-4 w-4 mr-1" />
            Download
          </Button>
          <Button size="sm" variant="ghost" onClick={handleDelete}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        <div className="text-xs text-muted-foreground">
          Enviado por {(sheetMusic.members as any)?.name || 'Desconhecido'}
        </div>
      </CardContent>
    </Card>
  );
}
