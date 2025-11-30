import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SheetMusicUpload } from "@/components/sheet-music/SheetMusicUpload";
import { SheetMusicList } from "@/components/sheet-music/SheetMusicList";
import { SheetMusicFilters } from "@/components/sheet-music/SheetMusicFilters";
import { useTranslation } from "react-i18next";

export default function SheetMusic() {
  const [showUpload, setShowUpload] = useState(false);
  const [filters, setFilters] = useState({
    category: '',
    partition: '',
    search: ''
  });
  const { t } = useTranslation();

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t('navigation.sheetMusic', 'Biblioteca de Partituras')}</h1>
          <p className="text-muted-foreground mt-1">
            {t('sheetMusic.description', 'Organize e acesse partituras musicais digitalmente')}
          </p>
        </div>
        <Button onClick={() => setShowUpload(true)}>
          <Plus className="h-4 w-4 mr-2" />
          {t('sheetMusic.newScore', 'Nova Partitura')}
        </Button>
      </div>

      <SheetMusicFilters filters={filters} onFiltersChange={setFilters} />

      <SheetMusicList filters={filters} onRefresh={() => {}} />

      <SheetMusicUpload 
        open={showUpload} 
        onOpenChange={setShowUpload}
        onSuccess={() => setShowUpload(false)}
      />
    </div>
  );
}
