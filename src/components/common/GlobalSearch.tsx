import { useState, useEffect, useCallback } from "react";
import { Search, Users, Building2, DollarSign, Music, X } from "lucide-react";
import { useDebounce } from "use-debounce";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNavigate } from "react-router-dom";
import { Separator } from "@/components/ui/separator";

interface SearchResults {
  members: any[];
  groups: any[];
  transactions: any[];
}

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [debouncedQuery] = useDebounce(query, 300);
  const [results, setResults] = useState<SearchResults>({ members: [], groups: [], transactions: [] });
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(prev => !prev);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  useEffect(() => {
    if (debouncedQuery.length >= 2) {
      performSearch(debouncedQuery);
    } else {
      setResults({ members: [], groups: [], transactions: [] });
    }
  }, [debouncedQuery]);

  const performSearch = async (searchQuery: string) => {
    setLoading(true);
    try {
      const [membersData, groupsData, transactionsData] = await Promise.all([
        supabase
          .from('members')
          .select('id, name, member_code, role, groups(name)')
          .ilike('name', `%${searchQuery}%`)
          .eq('is_active', true)
          .limit(5),
        
        supabase
          .from('groups')
          .select('id, name, province, municipality')
          .ilike('name', `%${searchQuery}%`)
          .eq('is_active', true)
          .limit(5),
        
        supabase
          .from('financial_transactions')
          .select('id, description, amount, type, financial_categories(name, group_id)')
          .ilike('description', `%${searchQuery}%`)
          .limit(5)
      ]);

      setResults({
        members: membersData.data || [],
        groups: groupsData.data || [],
        transactions: transactionsData.data || []
      });
    } catch (error) {
      console.error('Erro na busca:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (type: string, id: string) => {
    setOpen(false);
    setQuery("");
    
    switch (type) {
      case 'member':
        navigate(`/members/${id}`);
        break;
      case 'group':
        navigate(`/groups/${id}`);
        break;
      case 'transaction':
        navigate(`/groups`);
        break;
    }
  };

  const totalResults = results.members.length + results.groups.length + results.transactions.length;

  return (
    <>
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar (Ctrl+K)"
          className="pl-9 pr-4"
          onClick={() => setOpen(true)}
          readOnly
        />
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl p-0 gap-0">
          <div className="flex items-center border-b px-4 py-3">
            <Search className="h-5 w-5 text-muted-foreground mr-3" />
            <Input
              placeholder="Buscar membros, grupos, transações..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
              autoFocus
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="ml-2 p-1 hover:bg-muted rounded-sm"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <ScrollArea className="max-h-[400px]">
            {loading ? (
              <div className="p-8 text-center text-sm text-muted-foreground">
                Buscando...
              </div>
            ) : totalResults === 0 && debouncedQuery.length >= 2 ? (
              <div className="p-8 text-center">
                <Search className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                <p className="text-sm text-muted-foreground">
                  Nenhum resultado encontrado para "{debouncedQuery}"
                </p>
              </div>
            ) : (
              <div className="p-2">
                {results.members.length > 0 && (
                  <div className="mb-4">
                    <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      MEMBROS ({results.members.length})
                    </div>
                    {results.members.map((member) => (
                      <button
                        key={member.id}
                        onClick={() => handleSelect('member', member.id)}
                        className="w-full text-left px-3 py-2 rounded-lg hover:bg-muted transition-colors"
                      >
                        <p className="font-medium">{member.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {member.member_code} • {(member.groups as any)?.name}
                        </p>
                      </button>
                    ))}
                  </div>
                )}

                {results.groups.length > 0 && (
                  <div className="mb-4">
                    <Separator className="mb-2" />
                    <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      GRUPOS ({results.groups.length})
                    </div>
                    {results.groups.map((group) => (
                      <button
                        key={group.id}
                        onClick={() => handleSelect('group', group.id)}
                        className="w-full text-left px-3 py-2 rounded-lg hover:bg-muted transition-colors"
                      >
                        <p className="font-medium">{group.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {group.municipality}, {group.province}
                        </p>
                      </button>
                    ))}
                  </div>
                )}

                {results.transactions.length > 0 && (
                  <div>
                    <Separator className="mb-2" />
                    <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      TRANSAÇÕES ({results.transactions.length})
                    </div>
                    {results.transactions.map((transaction) => (
                      <button
                        key={transaction.id}
                        onClick={() => handleSelect('transaction', transaction.id)}
                        className="w-full text-left px-3 py-2 rounded-lg hover:bg-muted transition-colors"
                      >
                        <p className="font-medium">{transaction.description}</p>
                        <p className="text-sm text-muted-foreground">
                          {Number(transaction.amount).toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' })} • 
                          {(transaction.financial_categories as any)?.name}
                        </p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </ScrollArea>

          <div className="border-t px-4 py-2 text-xs text-muted-foreground flex items-center justify-between">
            <span>↑↓ para navegar • Enter para selecionar • Esc para fechar</span>
            <kbd className="px-2 py-1 text-xs bg-muted rounded">Ctrl+K</kbd>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
