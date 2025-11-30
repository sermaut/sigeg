import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SheetMusicCard } from "./SheetMusicCard";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "react-i18next";

interface SheetMusicListProps {
  filters: {
    category: string;
    partition: string;
    search: string;
  };
  onRefresh: () => void;
}

export function SheetMusicList({ filters }: SheetMusicListProps) {
  const [sheetMusic, setSheetMusic] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();

  useEffect(() => {
    loadSheetMusic();
  }, [filters]);

  const loadSheetMusic = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('sheet_music')
        .select('*, members(name), groups(name)')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (filters.category) {
        query = query.eq('category', filters.category);
      }
      if (filters.partition) {
        query = query.eq('partition', filters.partition);
      }
      if (filters.search) {
        query = query.or(`title.ilike.%${filters.search}%,author.ilike.%${filters.search}%`);
      }

      const { data } = await query;
      setSheetMusic(data || []);
    } catch (error) {
      console.error('Erro ao carregar partituras:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <Skeleton key={i} className="h-64" />
        ))}
      </div>
    );
  }

  if (sheetMusic.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">{t('sheetMusic.noSheetMusicFound')}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {sheetMusic.map((sheet) => (
        <SheetMusicCard key={sheet.id} sheetMusic={sheet} onUpdate={loadSheetMusic} />
      ))}
    </div>
  );
}