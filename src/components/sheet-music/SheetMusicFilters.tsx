import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SheetMusicFiltersProps {
  filters: {
    category: string;
    partition: string;
    search: string;
  };
  onFiltersChange: (filters: any) => void;
}

export function SheetMusicFilters({ filters, onFiltersChange }: SheetMusicFiltersProps) {
  return (
    <div className="flex flex-col md:flex-row gap-4">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por título ou autor..."
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
          <SelectValue placeholder="Categoria" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">Todas</SelectItem>
          <SelectItem value="alegria">🎉 Alegria</SelectItem>
          <SelectItem value="lamentacao">😢 Lamentação</SelectItem>
          <SelectItem value="morte">⚫ Morte</SelectItem>
          <SelectItem value="perdao">🙏 Perdão</SelectItem>
          <SelectItem value="outros">📄 Outros</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={filters.partition}
        onValueChange={(value) => onFiltersChange({ ...filters, partition: value })}
      >
        <SelectTrigger className="w-full md:w-48">
          <SelectValue placeholder="Partição" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">Todas</SelectItem>
          <SelectItem value="soprano">Soprano</SelectItem>
          <SelectItem value="contralto">Contralto</SelectItem>
          <SelectItem value="tenor">Tenor</SelectItem>
          <SelectItem value="baixo">Baixo</SelectItem>
          <SelectItem value="todos">Todas as Vozes</SelectItem>
          <SelectItem value="instrumental">Instrumental</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
