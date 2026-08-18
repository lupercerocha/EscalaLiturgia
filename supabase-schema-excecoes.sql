-- =====================================================================
--  COMPLEMENTO DO SCHEMA — tabela `excecoes`
--  Ocorrências canceladas pelo coordenador (ex.: "não tem missa neste sábado").
--  Rode uma vez no SQL Editor. É coordenador-only (anon não acessa).
-- =====================================================================

create table if not exists excecoes (
  id          uuid primary key default gen_random_uuid(),
  evento_id   uuid not null references eventos(id) on delete cascade,
  data        date not null,
  acao        text not null default 'cancelar',
  created_at  timestamptz not null default now(),
  unique (evento_id, data, acao)
);

alter table excecoes enable row level security;

-- anon: sem nenhuma policy = acesso negado (o link público não vê nada disto).
revoke all on excecoes from anon;

-- coordenador logado: acesso total.
create policy coord_all on excecoes
  for all to authenticated using (true) with check (true);
