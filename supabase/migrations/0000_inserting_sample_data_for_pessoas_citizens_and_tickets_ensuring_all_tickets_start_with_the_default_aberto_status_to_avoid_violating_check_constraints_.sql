-- 1. Inserir Pessoas de Exemplo (Cidadãos)
-- Usando IDs fixos para referências
WITH user_id AS (SELECT usuario_id FROM public.usuario LIMIT 1)
INSERT INTO public.pessoa (cidadao_id, nome, cpf, dt_nasc, sexo, tel1, email, logradouro, numero, bairro, municipio, uf, cep, consentimento_bool, data_consentimento, origem, criado_por)
VALUES
('00000000-0000-0000-0000-000000000001', 'Maria da Silva Teste', '11111111111', '1985-05-15', 'Feminino', '81999991111', 'maria.teste@exemplo.com', 'Rua das Flores', '100', 'Centro', 'Recife', 'PE', '50000000', TRUE, CURRENT_DATE, 'gabinete', (SELECT usuario_id FROM user_id)),
('00000000-0000-0000-0000-000000000002', 'João Pereira Teste', '22222222222', '1990-10-20', 'Masculino', '81988882222', 'joao.teste@exemplo.com', 'Avenida Principal', '50', 'Boa Viagem', 'Recife', 'PE', '51000000', TRUE, CURRENT_DATE, 'gabinete', (SELECT usuario_id FROM user_id)),
('00000000-0000-0000-0000-000000000003', 'Ana Souza Teste', '33333333333', '2000-01-01', 'Feminino', '81977773333', 'ana.teste@exemplo.com', 'Travessa Secundária', '20', 'Madalena', 'Recife', 'PE', '50700000', TRUE, CURRENT_DATE, 'gabinete', (SELECT usuario_id FROM user_id));

-- 2. Inserir Tickets de Exemplo
-- Usando status 'Aberto' para evitar a violação do CHECK constraint
INSERT INTO public.ticket (ticket_id, cidadao_id, cadastrado_por, motivo_atendimento, categoria, prioridade, descricao_curta, status, created_at)
VALUES
(gen_random_uuid(), '00000000-0000-0000-0000-000000000001', (SELECT usuario_id FROM public.usuario LIMIT 1), 'Solicitação de Moradia Popular', 'Habitação', 'Alta', 'Pedido urgente de inclusão em programa habitacional.', 'Aberto', NOW() - INTERVAL '5 days'),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000002', (SELECT usuario_id FROM public.usuario LIMIT 1), 'Reclamação de Iluminação Pública', 'Infraestrutura', 'Media', 'Lâmpada queimada na rua principal.', 'Aberto', NOW() - INTERVAL '2 days'),
(gen_random_uuid(), '00000000-0000-0000-0000-000000000003', (SELECT usuario_id FROM public.usuario LIMIT 1), 'Agendamento de Visita ao Gabinete', 'Agenda', 'Baixa', 'Solicitação de reunião para discutir projeto.', 'Aberto', NOW() - INTERVAL '1 day');