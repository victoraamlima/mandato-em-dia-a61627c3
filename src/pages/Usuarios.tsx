import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  Plus,
  MoreHorizontal,
  Edit,
  UserPlus,
  Link2,
  List,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { Link } from "react-router-dom";
import { ResponsiveTable, type Column } from "@/components/ui/responsive-table";

type Usuario = Tables<"usuario">;

const fetchUsuarios = async (searchTerm: string) => {
  let query = supabase.from("usuario").select("*").order("nome", { ascending: true });

  if (searchTerm) {
    query = query.or(`nome.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
};

export default function Usuarios() {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: usuarios, isLoading, isError } = useQuery({
    queryKey: ["usuarios", searchTerm],
    queryFn: () => fetchUsuarios(searchTerm),
  });

  const ActionsDropdown = ({ item }: { item: Usuario }) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm">
          <MoreHorizontal className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <Link to={`/usuarios/${item.usuario_id}/editar`}>
            <Edit className="w-4 h-4 mr-2" />
            Editar
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  const columns: Column<Usuario>[] = [
    { header: "Nome", accessor: "nome", className: "font-medium" },
    { header: "E-mail", accessor: "email" },
    { header: "Perfil", accessor: (item) => <Badge variant="secondary">{item.perfil}</Badge> },
    { header: "Status", accessor: (item) => <Badge variant={item.ativo ? "default" : "destructive"}>{item.ativo ? "Ativo" : "Inativo"}</Badge> },
    { header: "", className: "w-[50px]", accessor: (item) => <ActionsDropdown item={item} /> },
  ];

  const renderMobileCard = (usuario: Usuario) => (
    <div className="space-y-2">
      <div className="flex justify-between items-start">
        <p className="font-bold">{usuario.nome}</p>
        <ActionsDropdown item={usuario} />
      </div>
      <div className="text-sm text-muted-foreground space-y-1">
        <p>{usuario.email}</p>
        <div className="flex gap-2">
            <Badge variant="secondary">{usuario.perfil}</Badge>
            <Badge variant={usuario.ativo ? "default" : "destructive"}>
                {usuario.ativo ? "Ativo" : "Inativo"}
            </Badge>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Usuários</h1>
          <p className="text-muted-foreground">Gerencie os usuários do sistema</p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="bg-primary hover:bg-primary-hover text-primary-foreground">
              <Plus className="w-4 h-4 mr-2" />
              Novo Usuário
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem asChild>
              <Link to="/usuarios/novo" className="flex items-center gap-2">
                <UserPlus className="w-4 h-4" />
                Cadastro manual
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/usuarios/convites/novo" className="flex items-center gap-2">
                <Link2 className="w-4 h-4" />
                Gerar link de convite
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/usuarios/convites" className="flex items-center gap-2">
                <List className="w-4 h-4" />
                Gerenciar Convites
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Card className="card-institutional">
        <CardHeader>
          <CardTitle>Buscar Usuários</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Buscar por nome ou e-mail..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      <ResponsiveTable
        columns={columns}
        data={usuarios ?? []}
        rowKey="usuario_id"
        isLoading={isLoading}
        isError={isError}
        renderMobileCard={renderMobileCard}
        noResultsMessage="Nenhum usuário encontrado."
      />
    </div>
  );
}