-- =====================================================================
--  AJUSTE — tabela `disponibilidades` (modelo POR OCORRÊNCIA)
--  Substitui a versão antiga (datas soltas) pela nova: cada envio guarda
--  quais OCORRÊNCIAS a pessoa NÃO pode e quais PREFERE.
--  Como ainda não há dados reais, apagamos e recriamos. Rode no SQL Editor.
--
--  occKey = 'eventoId|AAAA-MM-DD'  (identifica a ocorrência exata)
--    indisponiveis[] -> a pessoa NÃO pode nessas ocorrências (regra dura)
--    preferidos[]    -> a pessoa PREFERE essas (fator a favor, não obriga)
-- =====================================================================

drop table if exists disponibilidades cascade;

create table disponibilidades (
  id             uuid primary key default gen_random_uuid(),
  membro_id      uuid not null references membros(id) on delete cascade,
  referencia     text not null,                 -- 'AAAA-MM' (mês da escala)
  indisponiveis  text[] not null default '{}',  -- occKeys que NÃO pode
  preferidos     text[] not null default '{}',  -- occKeys que PREFERE
  observacoes    text,
  created_at     timestamptz not null default now()
);
-- índice para pegar rápido a resposta MAIS RECENTE de cada pessoa no mês
create index on disponibilidades (membro_id, referencia, created_at desc);

-- ---------- Segurança (RLS) ----------
alter table disponibilidades enable row level security;

-- O link público (anon) só pode INSERIR a própria disponibilidade — nada mais.
-- Sem policy de SELECT/UPDATE/DELETE = não lê a dos outros, não altera, não apaga.
revoke all on disponibilidades from anon;
grant  insert on disponibilidades to anon;   -- privilégio de tabela p/ o INSERT funcionar
create policy anon_insere_disp on disponibilidades
  for insert to anon
  with check ( membro_id is not null and length(coalesce(referencia,'')) > 0 );

-- O coordenador logado enxerga e gerencia tudo.
grant all on disponibilidades to authenticated;
create policy coord_disp on disponibilidades
  for all to authenticated using (true) with check (true);
