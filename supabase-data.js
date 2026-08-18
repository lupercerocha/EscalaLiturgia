/* =====================================================================
   supabase-data.js — camada de dados da Escala da Liturgia
   Faz a ponte entre o objeto `db` do app e as tabelas do Supabase.
   O MOTOR DE ALOCAÇÃO NÃO USA ESTE ARQUIVO — ele continua operando sobre
   o mesmo `db` de sempre. Aqui só carregamos e salvamos esse `db`.
   Requer: config.js já carregado (expõe window.sb).
   ===================================================================== */

/* Estado de segurança contra perda de dados:
   sbSalvar só grava DEPOIS de um carregamento bem-sucedido. Isso evita
   que uma falha de leitura vire um "salvar por cima com dados vazios". */
let _dadosCarregados = false;

/* -------- utilidades de mapeamento -------- */
const _hhmm = t => (t ? String(t).slice(0, 5) : null);   // '19:30:00' -> '19:30'

/* ===================== AUTENTICAÇÃO (coordenador) ===================== */
const sbAuth = {
  async sessao() {
    const { data } = await sb.auth.getSession();
    return data ? data.session : null;
  },
  async entrar(email) {
    return sb.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.href.split('#')[0] }
    });
  },
  async sair() { return sb.auth.signOut(); },
  aoMudar(cb) { sb.auth.onAuthStateChange((_evt, session) => cb(session)); }
};
window.sbAuth = sbAuth;

/* ===================== CARREGAR (Supabase -> db) ===================== */
async function sbCarregar() {
  const q = [
    sb.from('membros').select('*'),
    sb.from('fases').select('*'),
    sb.from('fase_datas').select('*'),
    sb.from('locais').select('*'),
    sb.from('tipos').select('*'),
    sb.from('eventos').select('*'),
    sb.from('restricoes').select('*'),
    sb.from('escalas_salvas').select('*'),
    sb.from('excecoes').select('*')
  ];
  const [membros, fases, faseDatas, locais, tipos, eventos, restricoes, escalas, excecoes] =
    await Promise.all(q);

  // Se qualquer leitura falhar, aborta sem marcar como carregado.
  for (const r of [membros, fases, faseDatas, locais, tipos, eventos, restricoes, escalas, excecoes]) {
    if (r.error) throw r.error;
  }

  const db = {
    membros: (membros.data || []).map(m => ({
      id: m.id, nome: m.nome, ativo: m.ativo, faseId: m.fase_id || null
    })),
    locais: (locais.data || []).map(l => ({ id: l.id, nome: l.nome })),
    tipos: (tipos.data || []).map(t => t.nome),
    eventos: (eventos.data || []).map(e => ({
      id: e.id, tipo: e.tipo, localId: e.local_id,
      dataInicio: e.data_inicio, horario: _hhmm(e.horario), horarioChegada: _hhmm(e.horario_chegada),
      duracao: e.duracao, vagas: e.vagas, obs: e.obs,
      freq: e.freq, intervalo: e.intervalo, diasSemana: e.dias_semana || [],
      modoMensal: e.modo_mensal, fim: e.fim || { tipo: 'nunca' }, elegiveis: e.elegiveis || []
    })),
    restricoes: (restricoes.data || []).map(r => ({
      id: r.id, membroId: r.membro_id, data: r.data
    })),
    fases: (fases.data || []).map(f => ({
      id: f.id, nome: f.nome,
      datas: (faseDatas.data || []).filter(d => d.fase_id === f.id).map(d => d.data)
    })),
    excecoes: (excecoes.data || []).map(x => ({
      id: x.id, eventoId: x.evento_id, data: x.data, acao: x.acao
    })),
    ajustes: Object.fromEntries((membros.data || []).map(m => [m.id, m.servicos_anteriores || 0])),
    escalasSalvas: Object.fromEntries((escalas.data || []).map(e => [e.chave, { atribuicoes: e.atribuicoes || {} }])),
    tema: localStorage.getItem('liturgia_tema') || null
  };

  _dadosCarregados = true;
  return db;
}
window.sbCarregar = sbCarregar;

/* ===================== SALVAR (db -> Supabase) =====================
   Estratégia: UPSERT de tudo + remoção de "órfãos" (linhas que existem no
   banco mas não existem mais em memória). A remoção só roda quando a lista
   em memória NÃO está vazia — trava de segurança contra apagar tudo por
   engano se algo vier errado. */
async function sbSalvar(db) {
  if (!_dadosCarregados) return;   // nunca grava antes de um carregamento bom

  // tema é preferência do aparelho — fica no navegador, não no banco.
  if (db.tema) localStorage.setItem('liturgia_tema', db.tema);

  const erros = [];
  const _push = r => { if (r && r.error) erros.push(r.error.message || r.error); };

  // apaga do banco as linhas cujo id não está mais em `ids` (com trava).
  async function podarOrfaos(tabela, ids, coluna = 'id') {
    if (!ids.length) return;                 // trava: não apaga tudo
    const lista = '(' + ids.map(x => `"${x}"`).join(',') + ')';
    _push(await sb.from(tabela).delete().not(coluna, 'in', lista));
  }

  // ---- MEMBROS (inclui servicos_anteriores vindo de db.ajustes) ----
  const membros = db.membros.map(m => ({
    id: m.id, nome: m.nome, ativo: m.ativo,
    fase_id: m.faseId || null, servicos_anteriores: (db.ajustes && db.ajustes[m.id]) || 0
  }));
  if (membros.length) _push(await sb.from('membros').upsert(membros));
  await podarOrfaos('membros', db.membros.map(m => m.id));

  // ---- FASES + datas de formação ----
  const fases = db.fases.map(f => ({ id: f.id, nome: f.nome }));
  if (fases.length) _push(await sb.from('fases').upsert(fases));
  await podarOrfaos('fases', db.fases.map(f => f.id));
  // fase_datas: substitui as datas de cada fase (apaga as da fase e reinsere)
  for (const f of db.fases) {
    _push(await sb.from('fase_datas').delete().eq('fase_id', f.id));
    const linhas = (f.datas || []).map(d => ({ fase_id: f.id, data: d }));
    if (linhas.length) _push(await sb.from('fase_datas').insert(linhas));
  }

  // ---- LOCAIS ----
  const locais = db.locais.map(l => ({ id: l.id, nome: l.nome }));
  if (locais.length) _push(await sb.from('locais').upsert(locais));
  await podarOrfaos('locais', db.locais.map(l => l.id));

  // ---- TIPOS (db.tipos é lista de nomes) ----
  const tipos = db.tipos.map(nome => ({ nome }));
  if (tipos.length) _push(await sb.from('tipos').upsert(tipos, { onConflict: 'nome' }));
  if (db.tipos.length) {
    const lista = '(' + db.tipos.map(n => `"${n}"`).join(',') + ')';
    _push(await sb.from('tipos').delete().not('nome', 'in', lista));
  }

  // ---- EVENTOS ----
  const eventos = db.eventos.map(e => ({
    id: e.id, tipo: e.tipo, local_id: e.localId || null,
    data_inicio: e.dataInicio, horario: e.horario || null, horario_chegada: e.horarioChegada || null,
    duracao: e.duracao || 60, vagas: e.vagas, obs: e.obs || null,
    freq: e.freq, intervalo: e.intervalo || 1, dias_semana: e.diasSemana || [],
    modo_mensal: e.modoMensal || 'dia', fim: e.fim || { tipo: 'nunca' }, elegiveis: e.elegiveis || []
  }));
  if (eventos.length) _push(await sb.from('eventos').upsert(eventos));
  await podarOrfaos('eventos', db.eventos.map(e => e.id));

  // ---- RESTRIÇÕES ----
  const restricoes = db.restricoes.map(r => ({
    id: r.id, membro_id: r.membroId, data: r.data, origem: r.origem || 'manual'
  }));
  if (restricoes.length) _push(await sb.from('restricoes').upsert(restricoes));
  await podarOrfaos('restricoes', db.restricoes.map(r => r.id));

  // ---- EXCEÇÕES (ocorrências canceladas) ----
  const excecoes = (db.excecoes || []).map(x => ({
    id: x.id, evento_id: x.eventoId, data: x.data, acao: x.acao || 'cancelar'
  }));
  if (excecoes.length) _push(await sb.from('excecoes').upsert(excecoes));
  await podarOrfaos('excecoes', (db.excecoes || []).map(x => x.id));

  // ---- ESCALAS SALVAS (mapa chave -> {atribuicoes}) ----
  const chaves = Object.keys(db.escalasSalvas || {});
  const escalas = chaves.map(chave => ({ chave, atribuicoes: db.escalasSalvas[chave].atribuicoes || {} }));
  if (escalas.length) _push(await sb.from('escalas_salvas').upsert(escalas, { onConflict: 'chave' }));
  if (chaves.length) {
    const lista = '(' + chaves.map(c => `"${c}"`).join(',') + ')';
    _push(await sb.from('escalas_salvas').delete().not('chave', 'in', lista));
  }

  if (erros.length) throw new Error(erros.join(' | '));
}
window.sbSalvar = sbSalvar;
