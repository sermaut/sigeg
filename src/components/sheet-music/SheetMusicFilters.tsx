import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTranslation } from "react-i18next";

interface SheetMusicFiltersProps {
  filters: {
    category: string;
    partition: string;
    search: string;
  };
  onFiltersChange: (filters: any) => void;
}

export function SheetMusicFilters({ filters, onFiltersChange }: SheetMusicFiltersProps) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col md:flex-row gap-4">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={t('sheetMusic.searchPlaceholder')}
          value={filters.search}
          onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
          className="pl-9"
        />
      </div>

      <Select
        value={filters.category}
        onValueChange={(value) => onFiltersChange({ ...filters, category: value })}
      >
        <SelectTrigger className="w-full md:w-48">
          <SelectValue placeholder={t('sheetMusic.category')} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">{t('sheetMusic.allCategories')}</SelectItem>
          <SelectItem value="alegria">🎉 {t('sheetMusic.joy')}</SelectItem>
          <SelectItem value="lamentacao">😢 {t('sheetMusic.lamentation')}</SelectItem>
          <SelectItem value="morte">⚫ {t('sheetMusic.death')}</SelectItem>
          <SelectItem value="perdao">🙏 {t('sheetMusic.forgiveness')}</SelectItem>
          <SelectItem value="outros">📄 {t('sheetMusic.others')}</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={filters.partition}
        onValueChange={(value) => onFiltersChange({ ...filters, partition: value })}
      >
        <SelectTrigger className="w-full md:w-48">
          <SelectValue placeholder={t('sheetMusic.partition')} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">{t('sheetMusic.allPartitions')}</SelectItem>
          <SelectItem value="soprano">{t('sheetMusic.soprano')}</SelectItem>
          <SelectItem value="contralto">{t('sheetMusic.contralto')}</SelectItem>
          <SelectItem value="tenor">{t('sheetMusic.tenor')}</SelectItem>
          <SelectItem value="baixo">{t('sheetMusic.bass')}</SelectItem>
          <SelectItem value="todos">{t('sheetMusic.allVoices')}</SelectItem>
          <SelectItem value="instrumental">{t('sheetMusic.instrumental')}</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}