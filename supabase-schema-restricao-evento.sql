-- =====================================================================
--  AJUSTE — restrição por EVENTO, não só por dia
--  Adiciona coluna opcional evento_id em `restricoes`.
--  NULL = restrição de dia inteiro (comportamento antigo, ex.: "estou viajando").
--  Preenchido = restrição só daquele evento específico naquela data
--  (ex.: "não posso na Missa de sábado 17h, mas posso no Grupo das Famílias").
--  Rode no SQL Editor. Seguro rodar de novo (idempotente).
-- =====================================================================

alter table restricoes
  add column if not exists evento_id uuid references eventos(id) on delete cascade;

-- índice para o filtro por evento ficar rápido
create index if not exists idx_restricoes_evento on restricoes(evento_id);
