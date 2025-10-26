import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Check, ChevronsUpDown, Search, User, MapPin, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn, normalizeCPF, isValidCPF } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
  const isCpfSearch = normalizedSearch.length === 11 && isValidCPF(normalizedSearch);

  return useQuery({
    queryKey: ["search-pessoas", normalizedSearch],
    queryFn: async () => {
      if (normalizedSearch.length < 3 && !isCpfSearch) return [];

      let query = supabase
        .from("pessoa")
        .select("cidadao_id, nome, cpf, municipio, uf")
        .limit(10);

      if (isCpfSearch) {
        // Busca exata por CPF
        query = query.eq("cpf", normalizedSearch);
      } else {
        // Busca por nome (ilike)
        query = query.ilike("nome", `%${normalizedSearch}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as PessoaResult[];
    },
    // Habilita a query se tiver 3+ caracteres ou se for um CPF válido de 11 dígitos
    enabled: normalizedSearch.length >= 3 || isCpfSearch,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export function CidadaoSearchInput({ value, onChange, disabled }: CidadaoSearchInputProps) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [displayValue, setDisplayValue] = useState("");
  const [cpfSearchTerm, setCpfSearchTerm] = useState("");

  // Usa o termo de busca mais relevante (CPF completo ou Nome/CPF parcial)
  const activeSearchTerm = cpfSearchTerm.length === 11 && isValidCPF(cpfSearchTerm) ? cpfSearchTerm : searchTerm;

  const { data: searchResults, isLoading: isSearching } = useSearchPessoas(activeSearchTerm);

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
    setSearchTerm("");
    setCpfSearchTerm("");
  };

  const handleClear = () => {
    onChange(null);
    setDisplayValue("");
    setSearchTerm("");
    setCpfSearchTerm("");
  };

  // Se a busca por CPF retornar exatamente 1 resultado, seleciona automaticamente
  useEffect(() => {
    if (activeSearchTerm === cpfSearchTerm && cpfSearchTerm.length === 11 && !isSearching && searchResults && searchResults.length === 1) {
      handleSelect(searchResults[0]);
    }
  }, [activeSearchTerm, cpfSearchTerm, isSearching, searchResults]);


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
            {/* Campo de busca por NOME (usa CommandInput para filtrar a lista) */}
            <CommandInput 
                placeholder="Buscar por nome..." 
                value={searchTerm}
                onValueChange={setSearchTerm}
                disabled={isSearching}
            />
            
            {/* Campo de busca por CPF (separado, para busca exata) */}
            <div className="p-2 border-t">
                <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                        placeholder="Buscar por CPF (apenas números)..."
                        value={cpfSearchTerm}
                        onChange={(e) => setCpfSearchTerm(e.target.value.replace(/\D/g, '').slice(0, 11))}
                        className="pl-10"
                        disabled={isSearching}
                        type="tel"
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
                    // O valor do CommandItem deve ser o nome para que o CommandInput possa filtrar
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