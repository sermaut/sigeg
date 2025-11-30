import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SheetMusicUpload } from "@/components/sheet-music/SheetMusicUpload";
import { SheetMusicList } from "@/components/sheet-music/SheetMusicList";
import { SheetMusicFilters } from "@/components/sheet-music/SheetMusicFilters";

export default function SheetMusic() {
  const [showUpload, setShowUpload] = useState(false);
  const [filters, setFilters] = useState({
    category: '',
    partition: '',
    search: ''
  });

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Biblioteca de Partituras</h1>
          <p className="text-muted-foreground mt-1">
            Organize e acesse partituras musicais digitalmente
          </p>
        </div>
        <Button onClick={() => setShowUpload(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Partitura
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
