import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Check, ChevronsUpDown, Search, User, MapPin, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn, normalizeCPF, isValidCPF } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label"; // Adicionado Label

type PessoaResult = {
  cidadao_id: string;
  nome: string;
  cpf: string;
  municipio: string;
  uf: string;
};

interface CidadaoSearchInputProps {
  value: string | null | undefined;
  onChange: (id: string | null) => void;
  disabled?: boolean;
}

// Hook para buscar cidadãos
const useSearchPessoas = (searchTerm: string) => {
  const normalizedSearch = normalizeCPF(searchTerm);
  const isCpfSearch = normalizedSearch.length === 11;

  return useQuery({
    queryKey: ["search-pessoas", normalizedSearch],
    queryFn: async () => {
      if (normalizedSearch.length < 3 && !isCpfSearch) return [];

      let query = supabase
        .from("pessoa")
        .select("cidadao_id, nome, cpf, municipio, uf")
        .limit(10);

      if (isCpfSearch) {
        query = query.eq("cpf", normalizedSearch);
      } else {
        query = query.ilike("nome", `%${normalizedSearch}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as PessoaResult[];
    },
    enabled: normalizedSearch.length >= 3 || isCpfSearch,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export function CidadaoSearchInput({ value, onChange, disabled }: CidadaoSearchInputProps) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [displayValue, setDisplayValue] = useState("");
  const [isCpfMode, setIsCpfMode] = useState(false);

  const { data: searchResults, isLoading: isSearching } = useSearchPessoas(searchTerm);

  // Encontra o objeto da pessoa selecionada para exibir o nome
  const selectedPessoa = useMemo(() => {
    if (!value || !searchResults) return null;
    return searchResults.find(p => p.cidadao_id === value);
  }, [value, searchResults]);

  // Atualiza o valor de exibição quando o ID muda (ex: ao carregar um ticket existente)
  useEffect(() => {
    if (value && selectedPessoa) {
      setDisplayValue(selectedPessoa.nome);
    } else if (!value) {
      setDisplayValue("");
    }
  }, [value, selectedPessoa]);

  const handleSelect = (pessoa: PessoaResult) => {
    onChange(pessoa.cidadao_id);
    setDisplayValue(pessoa.nome);
    setOpen(false);
    setSearchTerm(""); // Limpa o termo de busca após a seleção
  };

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    // Permite apenas dígitos
    const digitsOnly = rawValue.replace(/\D/g, '');
    setSearchTerm(digitsOnly);
    
    if (digitsOnly.length === 11 && isValidCPF(digitsOnly)) {
      setIsCpfMode(true);
    } else {
      setIsCpfMode(false);
    }
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setIsCpfMode(false);
  };

  const handleClear = () => {
    onChange(null);
    setDisplayValue("");
    setSearchTerm("");
    setIsCpfMode(false);
  };

  // Se um CPF válido foi digitado e a busca retornou exatamente 1 resultado, seleciona automaticamente
  useEffect(() => {
    if (isCpfMode && !isSearching && searchResults && searchResults.length === 1) {
      handleSelect(searchResults[0]);
    }
  }, [isCpfMode, isSearching, searchResults]);


  return (
    <div className="space-y-2">
      <Label htmlFor="cidadao_search">Cidadão Atendido</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between h-10"
            disabled={disabled}
          >
            {value && displayValue
              ? displayValue
              : "Buscar por nome ou CPF..."}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[400px] p-0">
          <Command>
            <div className="p-2 border-b">
              <div className="relative mb-2">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Buscar por nome..."
                  value={searchTerm}
                  onChange={handleNameChange}
                  className="pl-10"
                  disabled={isSearching}
                />
              </div>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Buscar por CPF (apenas números)..."
                  value={searchTerm}
                  onChange={handleCpfChange}
                  className="pl-10"
                  disabled={isSearching}
                  type="tel" // Usa type tel para teclado numérico em mobile
                  maxLength={11}
                />
              </div>
            </div>
            
            <CommandList>
              {isSearching && (
                <CommandEmpty>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Buscando...
                </CommandEmpty>
              )}
              {!isSearching && searchResults?.length === 0 && (
                <CommandEmpty>Nenhum cidadão encontrado.</CommandEmpty>
              )}
              
              <CommandGroup>
                {searchResults?.map((pessoa) => (
                  <CommandItem
                    key={pessoa.cidadao_id}
                    value={pessoa.nome}
                    onSelect={() => handleSelect(pessoa)}
                    className="flex items-center justify-between"
                  >
                    <div className="flex flex-col">
                        <span className="font-medium">{pessoa.nome}</span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <MapPin className="w-3 h-3" /> {pessoa.municipio}/{pessoa.uf}
                        </span>
                    </div>
                    <Check
                      className={cn(
                        "ml-auto h-4 w-4",
                        value === pessoa.cidadao_id ? "opacity-100" : "opacity-0"
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
            
            {value && (
                <div className="p-2 border-t">
                    <Button variant="destructive" size="sm" onClick={handleClear} className="w-full">
                        Limpar Seleção
                    </Button>
                </div>
            )}
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}