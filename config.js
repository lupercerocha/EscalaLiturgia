/* =====================================================================
   config.js — Escala da Liturgia
   Credenciais públicas do Supabase + criação do cliente.
   ---------------------------------------------------------------------
   Este arquivo é compartilhado pelas DUAS páginas (pública e coordenador).
   A publishable key é PÚBLICA por natureza — pode ficar no repositório.
   Quem protege o banco é o RLS, não o segredo desta chave.
   NUNCA coloque aqui a chave secreta (sb_secret_...).
   ===================================================================== */

const SUPABASE_URL = "https://zzfnotiphrdlgtlwqjdi.supabase.co";
const SUPABASE_KEY = "sb_publishable_XIwOWoaKC3ECih7RyTJjvg_fzgmMLVA";

/* O objeto global `supabase` vem do <script> da CDN carregado no HTML.
   Aqui criamos o cliente e expomos como window.sb para as páginas usarem. */
const sb = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
window.sb = sb;
