import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from "@/components/ui/sheet";
import { Search, Plus, Bell, User, LogOut, Settings, Users as UsersIcon, Ticket as TicketIcon, CalendarDays, Menu } from "lucide-react";
import { useUser } from "@/hooks/useUser";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { SidebarNavigation } from "./SidebarNavigation";

export function AppHeader() {
  const { user, isLoading } = useUser();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  const getInitials = (name: string = "") => {
    return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  };

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-surface h-16 flex items-center justify-between px-4 sm:px-6">
      <div className="flex items-center gap-4">
        {/* Gatilho da Sidebar para Desktop */}
        <SidebarTrigger className="hidden md:flex p-2 hover:bg-surface-hover rounded-md" />
        
        {/* Gatilho do Menu Gaveta para Mobile */}
        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="w-5 h-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64">
            <SheetHeader className="sr-only">
              <SheetTitle>Menu Principal</SheetTitle>
              <SheetDescription>Navegue pelas seções do sistema.</SheetDescription>
            </SheetHeader>
            <SidebarNavigation onLinkClick={() => setIsMobileMenuOpen(false)} />
          </SheetContent>
        </Sheet>
        
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Buscar pessoas, CPF, tickets..."
            className="pl-10 w-80 bg-background border-border focus:border-input-focus"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" className="bg-primary hover:bg-primary-hover text-primary-foreground">
              <Plus className="w-4 h-4 md:mr-2" />
              <span className="hidden md:inline">Adicionar</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>Novo registro</DropdownMenuLabel>
            <DropdownMenuItem asChild>
              <a href="/pessoas/nova" className="flex items-center gap-2">
                <UsersIcon className="w-4 h-4" />
                Nova Pessoa
              </a>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <a href="/tickets/novo" className="flex items-center gap-2">
                <TicketIcon className="w-4 h-4" />
                Novo Atendimento
              </a>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <a href="/atendimentos-deputado/novo" className="flex items-center gap-2">
                <CalendarDays className="w-4 h-4" />
                Novo Atendimento Dep.
              </a>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button variant="ghost" size="icon" className="relative h-9 w-9">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full"></span>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                {isLoading ? (
                  <Skeleton className="h-8 w-8 rounded-full" />
                ) : (
                  <>
                    <AvatarImage src={""} alt={user?.nome} />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {user ? getInitials(user.nome) : <User className="w-4 h-4" />}
                    </AvatarFallback>
                  </>
                )}
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            {isLoading ? (
              <div className="p-2">
                <Skeleton className="h-4 w-32 mb-2" />
                <Skeleton className="h-3 w-40" />
              </div>
            ) : user ? (
              <>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.nome}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground font-medium">
                      {user.perfil}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Configurações</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="text-destructive cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sair</span>
                </DropdownMenuItem>
              </>
            ) : (
              <DropdownMenuLabel>Erro ao carregar usuário</DropdownMenuLabel>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}