import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Check, ChevronsUpDown, MapPin, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn, normalizeCPF, isValidCPF } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
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
const useSearchPessoas = (rawSearchTerm: string) => {
  const normalizedSearch = normalizeCPF(rawSearchTerm);
  const isCpfSearch = normalizedSearch.length === 11 && isValidCPF(normalizedSearch);
  
  // Usamos o termo normalizado para a chave da query, garantindo que a busca por CPF seja única
  const queryKey = isCpfSearch ? normalizedSearch : rawSearchTerm;

  return useQuery({
    queryKey: ["search-pessoas", queryKey],
    queryFn: async () => {
      // Se for CPF válido, buscamos apenas por CPF.
      if (isCpfSearch) {
        const { data, error } = await supabase
          .from("pessoa")
          .select("cidadao_id, nome, cpf, municipio, uf")
          .eq("cpf", normalizedSearch)
          .limit(1);
        if (error) throw error;
        return data as PessoaResult[];
      } 
      
      // Se for busca por nome (ou CPF incompleto/inválido), buscamos por nome.
      if (rawSearchTerm.length < 3) return [];

      let query = supabase
        .from("pessoa")
        .select("cidadao_id, nome, cpf, municipio, uf")
        .ilike("nome", `%${rawSearchTerm}%`)
        .limit(10);

      const { data, error } = await query;
      if (error) throw error;
      return data as PessoaResult[];
    },
    // Habilita a query se tiver 3+ caracteres ou se for um CPF válido de 11 dígitos
    enabled: rawSearchTerm.length >= 3 || isCpfSearch,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export function CidadaoSearchInput({ value, onChange, disabled }: CidadaoSearchInputProps) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [displayValue, setDisplayValue] = useState("");

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

  const handleClear = () => {
    onChange(null);
    setDisplayValue("");
    setSearchTerm("");
  };

  // Se a busca por CPF retornar exatamente 1 resultado, seleciona automaticamente
  useEffect(() => {
    const normalized = normalizeCPF(searchTerm);
    const isCpfSearch = normalized.length === 11 && isValidCPF(normalized);

    if (isCpfSearch && !isSearching && searchResults && searchResults.length === 1) {
      handleSelect(searchResults[0]);
    }
  }, [searchTerm, isSearching, searchResults]);


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
            {/* CommandInput agora gerencia a busca por nome E CPF */}
            <CommandInput 
                placeholder="Buscar por nome ou CPF (apenas números)..." 
                value={searchTerm}
                onValueChange={setSearchTerm}
                disabled={isSearching}
            />
            
            <CommandList>
              {isSearching ? (
                <CommandEmpty>
                  <div className="flex items-center justify-center py-4 text-muted-foreground">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Buscando...
                  </div>
                </CommandEmpty>
              ) : searchResults?.length === 0 ? (
                <CommandEmpty>Nenhum cidadão encontrado.</CommandEmpty>
              ) : (
                <CommandGroup>
                  {searchResults?.map((pessoa) => (
                    <CommandItem
                      key={pessoa.cidadao_id}
                      // Usamos o nome como valor para que o CommandInput possa filtrar localmente
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
              )}
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