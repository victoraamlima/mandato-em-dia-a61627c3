-- Usuários
insert into public.usuario (nome, email, perfil, ativo) values
  ('Administrador', 'admin@demo.local', 'Admin', true),
  ('Gestor', 'gestor@demo.local', 'Gestor', true),
  ('Atendente', 'atendente@demo.local', 'Atendente', true),
  ('Campo', 'campo@demo.local', 'Campo', true),
  ('Analista', 'analista@demo.local', 'Analista', true);

-- Colaboradores
insert into public.colaborador (nome, telefone, email, observacoes, ativo) values
  ('Colaborador 1', '(11) 99999-0001', 'colab1@demo.local', 'Observação 1', true),
  ('Colaborador 2', '(11) 99999-0002', 'colab2@demo.local', 'Observação 2', true),
  ('Colaborador 3', '(11) 99999-0003', 'colab3@demo.local', 'Observação 3', true);

-- Pessoas (CPFs fictícios válidos para teste)
insert into public.pessoa (cpf, nome, dt_nasc, sexo, tel1, tel2, email, logradouro, numero, complemento, bairro, municipio, uf, cep, consentimento_bool, finalidade, origem)
values
  ('12345678909', 'Maria Silva', '1980-01-01', 'Feminino', '(11) 99999-1111', null, 'maria@email.com', 'Rua A', '100', null, 'Centro', 'São Paulo', 'SP', '01001000', true, 'Atendimento social', 'gabinete'),
  ('98765432100', 'José Lima', '1975-05-10', 'Masculino', '(11) 99999-2222', null, 'jose@email.com', 'Rua B', '200', null, 'Bairro B', 'Guarulhos', 'SP', '07020000', true, 'Orientação jurídica', 'gabinete'),
  ('45678912301', 'Ana Costa', '1990-03-15', 'Feminino', '(11) 99999-3333', null, 'ana@email.com', 'Rua C', '300', null, 'Bairro C', 'Osasco', 'SP', '06010000', true, 'Solicitação de documento', 'gabinete'),
  ('32165498702', 'Pedro Santos', '1985-07-20', 'Masculino', '(11) 99999-4444', null, 'pedro@email.com', 'Rua D', '400', null, 'Bairro D', 'Barueri', 'SP', '06400000', true, 'Atendimento saúde', 'gabinete'),
  ('65432198703', 'Fernanda Souza', '1992-11-30', 'Feminino', '(11) 99999-5555', null, 'fernanda@email.com', 'Rua E', '500', null, 'Bairro E', 'Carapicuíba', 'SP', '06320000', true, 'Informação sobre benefício', 'gabinete'),
  ('78912345604', 'Carlos Pereira', '1978-09-25', 'Masculino', '(11) 99999-6666', null, 'carlos@email.com', 'Rua F', '600', null, 'Bairro F', 'Santo André', 'SP', '09010000', true, 'Denúncia', 'gabinete'),
  ('15975348605', 'Juliana Alves', '1988-12-12', 'Feminino', '(11) 99999-7777', null, 'juliana@email.com', 'Rua G', '700', null, 'Bairro G', 'São Bernardo', 'SP', '09710000', true, 'Solicitação de serviço', 'gabinete'),
  ('35715948606', 'Rafael Dias', '1983-04-18', 'Masculino', '(11) 99999-8888', null, 'rafael@email.com', 'Rua H', '800', null, 'Bairro H', 'Mauá', 'SP', '09310000', true, 'Atendimento campo', 'campo'),
  ('95135748607', 'Patrícia Gomes', '1995-06-22', 'Feminino', '(11) 99999-9999', null, 'patricia@email.com', 'Rua I', '900', null, 'Bairro I', 'Diadema', 'SP', '09910000', true, 'Cadastro importado', 'importacao'),
  ('75395148608', 'Lucas Martins', '1982-02-28', 'Masculino', '(11) 99999-0000', null, 'lucas@email.com', 'Rua J', '1000', null, 'Bairro J', 'Taboão', 'SP', '06710000', true, 'Atendimento social', 'gabinete');

-- Tickets (exemplo, associando aos usuários e pessoas acima)
insert into public.ticket (cidadao_id, cadastrado_por, motivo_atendimento, categoria, prioridade, descricao_curta, status, origem)
select p.cidadao_id, u.usuario_id, 'Solicitação de documento', 'Documentação', 'Media', 'Solicitação de RG', 'Aberto', 'gabinete'
from public.pessoa p, public.usuario u
where p.cpf = '12345678909' and u.email = 'atendente@demo.local'
union all
select p.cidadao_id, u.usuario_id, 'Denúncia', 'Denúncia', 'Alta', 'Denúncia de irregularidade', 'Em_andamento', 'gabinete'
from public.pessoa p, public.usuario u
where p.cpf = '98765432100' and u.email = 'gestor@demo.local'
union all
select p.cidadao_id, u.usuario_id, 'Informação', 'Informação', 'Baixa', 'Informação sobre benefício', 'Concluido', 'gabinete'
from public.pessoa p, public.usuario u
where p.cpf = '45678912301' and u.email = 'analista@demo.local';
-- (adicione mais conforme necessário para testes)