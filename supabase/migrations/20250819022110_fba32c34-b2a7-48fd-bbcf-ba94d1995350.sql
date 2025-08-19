-- Criar tabelas principais do sistema de atendimento

-- Tabela de usuários do sistema
create table if not exists public.usuario (
  usuario_id uuid primary key default gen_random_uuid(),
  nome text not null,
  email text unique not null,
  perfil text check (perfil in ('Admin','Gestor','Atendente','Campo','Analista')) not null,
  ativo boolean not null default true,
  ultimo_login timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Tabela de colaboradores (vereadores, deputados, etc)
create table if not exists public.colaborador (
  colaborador_id uuid primary key default gen_random_uuid(),
  nome text not null,
  telefone text,
  email text,
  observacoes text,
  ativo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Tabela de pessoas (cidadãos atendidos)
create table if not exists public.pessoa (
  cidadao_id uuid primary key default gen_random_uuid(),
  cpf text unique not null,
  nome text not null,
  dt_nasc date not null,
  sexo text check (sexo in ('Masculino','Feminino','Outro','Prefiro_nao_informar')) not null,
  tel1 text not null,
  tel2 text,
  email text,
  logradouro text not null,
  numero text not null,
  complemento text,
  bairro text not null,
  municipio text not null,
  uf text not null,
  cep text not null,
  ibge text,
  titulo_eleitor text,
  zona text,
  secao text,
  municipio_titulo text,
  uf_titulo text,
  observacoes text,
  consentimento_bool boolean not null,
  data_consentimento date not null default current_date,
  finalidade text,
  origem text check (origem in ('gabinete','campo','importacao')) not null default 'gabinete',
  criado_por uuid references public.usuario(usuario_id),
  atualizado_por uuid references public.usuario(usuario_id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Tabela de tickets/atendimentos
create table if not exists public.ticket (
  ticket_id uuid primary key default gen_random_uuid(),
  cidadao_id uuid not null references public.pessoa(cidadao_id) on delete cascade,
  cadastrado_por uuid not null references public.usuario(usuario_id),
  atendente_id uuid references public.usuario(usuario_id),
  motivo_atendimento text not null,
  categoria text not null,
  subcategoria text,
  prioridade text check (prioridade in ('Baixa','Media','Alta','Urgente')) not null default 'Media',
  descricao_curta text not null,
  descricao text,
  status text check (status in ('Aberto','Em_analise','Em_andamento','Concluido','Arquivado')) not null default 'Aberto',
  prazo_sla timestamptz,
  data_fechamento timestamptz,
  origem text check (origem in ('gabinete','campo','importacao')) not null default 'gabinete',
  colaborador_id uuid references public.colaborador(colaborador_id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Tabela de comentários dos tickets
create table if not exists public.ticket_comentario (
  comentario_id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null references public.ticket(ticket_id) on delete cascade,
  usuario_id uuid not null references public.usuario(usuario_id),
  texto text not null,
  created_at timestamptz not null default now()
);

-- Tabela de eventos/agenda
create table if not exists public.evento (
  evento_id uuid primary key default gen_random_uuid(),
  titulo text not null,
  descricao text,
  inicio timestamptz not null,
  fim timestamptz not null,
  local text not null,
  lat numeric,
  lng numeric,
  tipo text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Tabela de participantes dos eventos
create table if not exists public.evento_participante (
  evento_id uuid references public.evento(evento_id) on delete cascade,
  cidadao_id uuid references public.pessoa(cidadao_id),
  externo_nome text,
  externo_contato text,
  primary key (evento_id, cidadao_id)
);

-- Índices essenciais para performance
create index if not exists idx_pessoa_cpf on public.pessoa(cpf);
create index if not exists idx_pessoa_nome_municipio on public.pessoa(municipio, nome);
create index if not exists idx_ticket_status_prioridade on public.ticket(status, prioridade, created_at desc);
create index if not exists idx_ticket_atendente on public.ticket(atendente_id, status);
create index if not exists idx_ticket_motivo on public.ticket(motivo_atendimento);
create index if not exists idx_ticket_colaborador on public.ticket(colaborador_id);
create index if not exists idx_ticket_cidadao on public.ticket(cidadao_id);

-- Habilitar RLS em todas as tabelas
alter table public.usuario enable row level security;
alter table public.colaborador enable row level security;
alter table public.pessoa enable row level security;
alter table public.ticket enable row level security;
alter table public.ticket_comentario enable row level security;
alter table public.evento enable row level security;
alter table public.evento_participante enable row level security;

-- Políticas básicas de RLS (temporárias para desenvolvimento)
create policy "Allow all operations for development" on public.usuario for all using (true);
create policy "Allow all operations for development" on public.colaborador for all using (true);
create policy "Allow all operations for development" on public.pessoa for all using (true);
create policy "Allow all operations for development" on public.ticket for all using (true);
create policy "Allow all operations for development" on public.ticket_comentario for all using (true);
create policy "Allow all operations for development" on public.evento for all using (true);
create policy "Allow all operations for development" on public.evento_participante for all using (true);

-- Trigger para atualizar updated_at automaticamente
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_usuario_updated_at before update on public.usuario
  for each row execute function public.update_updated_at_column();

create trigger update_colaborador_updated_at before update on public.colaborador
  for each row execute function public.update_updated_at_column();

create trigger update_pessoa_updated_at before update on public.pessoa
  for each row execute function public.update_updated_at_column();

create trigger update_ticket_updated_at before update on public.ticket
  for each row execute function public.update_updated_at_column();

create trigger update_evento_updated_at before update on public.evento
  for each row execute function public.update_updated_at_column();