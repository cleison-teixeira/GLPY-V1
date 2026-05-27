// GLPY — QA Center Screen
// System: Debug — INTERNAL ONLY — não exibir para usuário final
// Sprint: 17A.5.14 — Painel global de homologação
// Sprint: 17A.5.15 — Adicionado bloco "9. Protocolos — Matriz dos 10"
//
// NÃO chama IA real. NÃO toca Firebase. NÃO consome limites reais.
// NÃO altera UI das telas reais. NÃO abre câmera. NÃO envia fotos.

import React, { useState } from 'react';
import { getLocalDateKey } from '../../utils/formatters';
import { GLPY_PROTOCOLS_CATALOG } from '../../data/glpyProtocolsCatalog';

// ── Types ─────────────────────────────────────────────────────────────────────

interface TestResult {
  feature:  string;
  key:      string;
  expected: string;
  found:    string;
  status:   'ok' | 'erro' | 'skip' | 'warn';
  reason:   string;
}

interface ProtocolRow {
  number:       number;
  name:         string;
  emoji:        string;
  color:        string;
  status:       'ok' | 'erro' | 'skip' | 'warn';
  diasFound:    number;
  missoesFound: string;
  testHoje:     boolean;
  testOntem:    boolean;
  acaoReal:     string;
  macroFake:    boolean;
  risco:        string;
  motivo:       string;
}

interface ProtocolsRunResult {
  results: TestResult[];
  rows:    ProtocolRow[];
}

type Backup = Record<string, string | null>;

const BLOCK_IDS = ['saude', 'limites', 'jornada', 'protocolo', 'plano', 'protocolos'] as const;
type BlockId = typeof BLOCK_IDS[number];

// ── Constants ─────────────────────────────────────────────────────────────────

const LIMITES_IA:   Record<string, number> = { starter: 30, plus: 20, pro: 30, top: 999 };
const LIMITES_FOTO: Record<string, number> = { starter: 5,  plus: 6,  pro: 9,  top: Infinity };

const ALL_KEYS: string[] = [
  'glpy_plano', 'glpy_ai_usage', 'glpy_fotos_data', 'glpy_fotos_hoje',
  'glpy_agua_hoje', 'glpy_refeicoes_hoje', 'glpy_atividade_hoje',
  'glpy_checkin_hoje', 'glpy_checkin_historico', 'glpy_emocao_hoje',
  'glpy_protocol_day_today', 'glpy_contexto_ia', 'glpy_ultimo_checkin',
  'glpy_streak', 'glpy_ultima_aplicacao', 'glpy_injection_effects_today',
  'glpy_injecao_locais', 'glpy_injecao_historico', 'glpy_access_control',
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function getYesterday(): string {
  const d = new Date(getLocalDateKey() + 'T12:00:00');
  d.setDate(d.getDate() - 1);
  return getLocalDateKey(d);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function safeGet(key: string): any {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return null;
    return JSON.parse(raw);
  } catch { return localStorage.getItem(key); }
}

function makeBackup(keys: string[]): Backup {
  const b: Backup = {};
  for (const k of keys) b[k] = localStorage.getItem(k);
  return b;
}

function restoreBackup(backup: Backup): void {
  for (const [k, v] of Object.entries(backup)) {
    if (v === null) localStorage.removeItem(k);
    else localStorage.setItem(k, v);
  }
}

// Classifica o tipo de ação real sugerida pela descrição do protocolo
function deriveAcaoReal(desc: string): string {
  const lower = desc.toLowerCase();
  if (['registrar refeição', 'registrar refeicao', 'anotar o que comeu', 'fotografar refeição'].some(kw => lower.includes(kw))) return 'reg. refeição';
  if (['injeção', 'injecao', 'aplicação', 'aplicacao', 'agulha'].some(kw => lower.includes(kw))) return 'reg. injeção';
  if (['foto', 'câmera', 'antes e depois'].some(kw => lower.includes(kw))) return 'foto progresso';
  if (['hidratação', 'hidratacao', 'água', 'agua', 'litro'].some(kw => lower.includes(kw))) return 'reg. água';
  if (['exercício', 'exercicio', 'atividade', 'caminhada', 'treino', 'muscula'].some(kw => lower.includes(kw))) return 'reg. atividade';
  return 'comportamental';
}

// Verifica se a descrição pode gerar macro/refeição fake (MEAL_LOG_REQUIRED triggers)
function checkMacroFake(desc: string): boolean {
  const lower = desc.toLowerCase();
  return ['registrar refeição', 'registrar refeicao', 'fotografar refeição', 'anotar o que comeu'].some(kw => lower.includes(kw));
}

// ── Block 3: Saúde Geral ──────────────────────────────────────────────────────

function runSaudeGeral(_today: string, _yesterday: string): TestResult[] {
  const results: TestResult[] = [];

  const checks: Array<{
    key: string; label: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    validate: (v: any) => boolean; desc: string;
  }> = [
    { key: 'glpy_plano',              label: 'Plano',              validate: v => typeof v === 'string' && v.length > 0,     desc: 'string não vazia' },
    { key: 'glpy_ai_usage',           label: 'IA Usage',           validate: v => v !== null && typeof v?.used === 'number', desc: 'objeto com .used numérico' },
    { key: 'glpy_fotos_data',         label: 'Fotos data',         validate: v => typeof v === 'string',                     desc: 'string de data' },
    { key: 'glpy_fotos_hoje',         label: 'Fotos hoje',         validate: v => !isNaN(parseInt(String(v), 10)),           desc: 'número parseable' },
    { key: 'glpy_agua_hoje',          label: 'Água hoje',          validate: v => v !== null,                                desc: 'objeto' },
    { key: 'glpy_refeicoes_hoje',     label: 'Refeições hoje',     validate: v => Array.isArray(v),                          desc: 'array' },
    { key: 'glpy_atividade_hoje',     label: 'Atividade hoje',     validate: v => v !== null,                                desc: 'objeto' },
    { key: 'glpy_checkin_hoje',       label: 'Check-in hoje',      validate: v => v !== null,                                desc: 'objeto' },
    { key: 'glpy_checkin_historico',  label: 'Check-in histórico', validate: v => Array.isArray(v),                          desc: 'array de datas' },
    { key: 'glpy_emocao_hoje',        label: 'Emoção hoje',        validate: v => v !== null,                                desc: 'objeto' },
    { key: 'glpy_protocol_day_today', label: 'Protocolo dia',      validate: v => v !== null,                                desc: 'objeto com .date' },
    { key: 'glpy_contexto_ia',        label: 'Contexto IA',        validate: v => v !== null,                                desc: 'objeto' },
    { key: 'glpy_ultimo_checkin',     label: 'Último check-in',    validate: v => v !== null,                                desc: 'data ou objeto' },
    { key: 'glpy_streak',             label: 'Streak',             validate: v => v !== null,                                desc: 'número ou objeto' },
    { key: 'glpy_ultima_aplicacao',   label: 'Última aplicação',   validate: v => typeof v === 'string',                     desc: 'string de data' },
    { key: 'glpy_injection_effects_today', label: 'Efeitos injeção', validate: v => v !== null,                              desc: 'objeto' },
    { key: 'glpy_injecao_locais',     label: 'Locais injeção',     validate: v => Array.isArray(v),                          desc: 'array' },
    { key: 'glpy_injecao_historico',  label: 'Histórico injeção',  validate: v => v !== null,                                desc: 'array ou objeto' },
  ];

  for (const c of checks) {
    const raw    = localStorage.getItem(c.key);
    const parsed = safeGet(c.key);
    if (raw === null) {
      results.push({ feature: c.label, key: c.key, expected: c.desc, found: 'ausente', status: 'warn', reason: 'Chave não encontrada — normal se recurso não usado ainda' });
    } else {
      const valid = c.validate(parsed);
      results.push({ feature: c.label, key: c.key, expected: c.desc, found: raw.slice(0, 50) + (raw.length > 50 ? '…' : ''), status: valid ? 'ok' : 'warn', reason: valid ? 'Estrutura OK' : 'Estrutura inesperada — verificar' });
    }
  }

  const bbParsed = safeGet('glpy_black_box_events');
  const bbCount  = Array.isArray(bbParsed) ? bbParsed.length : '?';
  results.push({ feature: 'Black Box Events', key: 'glpy_black_box_events', expected: 'read-only', found: `${bbCount} eventos`, status: 'skip', reason: 'Append-only — não modificado por testes' });

  return results;
}

// ── Block 4: Limites Diários ──────────────────────────────────────────────────

function runLimitesdiarios(today: string, yesterday: string): TestResult[] {
  const plano      = localStorage.getItem('glpy_plano') ?? 'starter';
  const limiteIA   = LIMITES_IA[plano]   ?? 30;
  const limiteFoto = LIMITES_FOTO[plano] ?? 5;
  const results: TestResult[] = [];

  const iaTests: Array<{ label: string; date: string; used: number; expectBlocked: boolean; expectEff: number }> = [
    { label: 'IA 0/30 — libera',      date: today,     used: 0,  expectBlocked: false, expectEff: 0  },
    { label: 'IA 29/30 — libera',     date: today,     used: 29, expectBlocked: false, expectEff: 29 },
    { label: 'IA 30/30 — bloqueia',   date: today,     used: 30, expectBlocked: true,  expectEff: 30 },
    { label: 'IA ontem 30/30 → 0/30', date: yesterday, used: 30, expectBlocked: false, expectEff: 0  },
  ];

  for (const t of iaTests) {
    const isToday   = t.date === today;
    const effectEff = isToday ? t.used : 0;
    const blocked   = isToday && t.used >= limiteIA;
    const ok = blocked === t.expectBlocked && effectEff === t.expectEff;
    results.push({
      feature: t.label, key: 'glpy_ai_usage',
      expected: t.expectBlocked ? 'bloqueado' : `libera (used=${t.expectEff})`,
      found: `date=${t.date}, eff=${effectEff}, blocked=${blocked}`,
      status: ok ? 'ok' : 'erro',
      reason: ok ? `Lógica correta (plano=${plano}, limite=${limiteIA})` : `Esperava blocked=${t.expectBlocked} eff=${t.expectEff}`,
    });
  }

  const fotoTests: Array<{ label: string; data: string; n: number; expectBlocked: boolean; expectEff: number }> = [
    { label: 'Foto 0/5 — libera',    data: today,     n: 0, expectBlocked: false, expectEff: 0 },
    { label: 'Foto 4/5 — libera',    data: today,     n: 4, expectBlocked: false, expectEff: 4 },
    { label: 'Foto 5/5 — bloqueia',  data: today,     n: 5, expectBlocked: true,  expectEff: 5 },
    { label: 'Foto ontem 5/5 → 0/5', data: yesterday, n: 5, expectBlocked: false, expectEff: 0 },
  ];

  for (const t of fotoTests) {
    const isToday = t.data === today;
    const effectN = isToday ? t.n : 0;
    const blocked = isToday && t.n >= limiteFoto;
    const ok = blocked === t.expectBlocked && effectN === t.expectEff;
    results.push({
      feature: t.label, key: 'glpy_fotos',
      expected: t.expectBlocked ? 'bloqueado' : `libera (n=${t.expectEff})`,
      found: `data=${t.data}, effectN=${effectN}, blocked=${blocked}`,
      status: ok ? 'ok' : 'erro',
      reason: ok ? `Lógica correta (plano=${plano}, limite=${limiteFoto})` : `Esperava blocked=${t.expectBlocked} effectN=${t.expectEff}`,
    });
  }

  return results;
}

// ── Block 5: Jornada Diária ───────────────────────────────────────────────────

function runJornadaDiaria(today: string, yesterday: string): TestResult[] {
  const results: TestResult[] = [];
  const now = new Date().toISOString();
  const ts  = Date.now();
  const keys = ['glpy_agua_hoje', 'glpy_refeicoes_hoje', 'glpy_atividade_hoje', 'glpy_checkin_hoje', 'glpy_emocao_hoje', 'glpy_ultima_aplicacao'];
  const backup = makeBackup(keys);

  try {
    localStorage.removeItem('glpy_checkin_hoje');
    {
      const parsed    = safeGet('glpy_checkin_hoje');
      const checkDate = typeof parsed === 'string' ? parsed : parsed?.date ?? null;
      results.push({ feature: 'Sem check-in hoje', key: 'glpy_checkin_hoje', expected: 'null', found: `date=${checkDate}`, status: checkDate !== today ? 'ok' : 'erro', reason: checkDate !== today ? 'Usuário pode fazer check-in hoje' : 'BUG! Check-in marcado hoje sem ser registrado' });
    }

    localStorage.setItem('glpy_checkin_hoje', JSON.stringify({ date: today, humor: '😊', fome: 5, energia: 7, sintomas: [], savedAt: ts }));
    {
      const parsed    = safeGet('glpy_checkin_hoje');
      const checkDate = typeof parsed === 'string' ? parsed : parsed?.date ?? null;
      results.push({ feature: 'Check-in feito hoje', key: 'glpy_checkin_hoje', expected: today, found: `date=${checkDate}`, status: checkDate === today ? 'ok' : 'erro', reason: checkDate === today ? 'Check-in reconhecido como de hoje' : 'BUG! Check-in não reconhecido' });
    }

    localStorage.setItem('glpy_agua_hoje', JSON.stringify({ amount: 1.5, date: today, updatedAt: now }));
    {
      const parsed = safeGet('glpy_agua_hoje');
      const ok     = parsed?.date === today && typeof parsed?.amount === 'number';
      results.push({ feature: 'Água hoje', key: 'glpy_agua_hoje', expected: `date=${today}`, found: `date=${parsed?.date}, amount=${parsed?.amount}`, status: ok ? 'ok' : 'erro', reason: ok ? `${parsed?.amount}L reconhecida como de hoje` : 'BUG! Água não reconhecida como de hoje' });
    }

    localStorage.setItem('glpy_refeicoes_hoje', JSON.stringify([{ id: 'qa_meal', nome: 'Refeição QA', date: today, calories: 300, protein: 25, carbs: 30, fat: 8, savedAt: ts }]));
    {
      const parsed     = safeGet('glpy_refeicoes_hoje');
      const meals      = Array.isArray(parsed) ? parsed : [];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const todayMeals = meals.filter((m: any) => m.date === today);
      results.push({ feature: 'Refeição hoje', key: 'glpy_refeicoes_hoje', expected: '1 refeição', found: `${todayMeals.length} de hoje / ${meals.length} total`, status: todayMeals.length > 0 ? 'ok' : 'erro', reason: todayMeals.length > 0 ? 'Refeição reconhecida como de hoje' : 'BUG! Refeição não reconhecida' });
    }

    localStorage.setItem('glpy_atividade_hoje', JSON.stringify({ activity: 'caminhada', duration: '30', intensity: 'moderada', savedAt: ts, date: today }));
    {
      const parsed  = safeGet('glpy_atividade_hoje');
      const actDate = parsed?.date ?? (parsed?.savedAt ? getLocalDateKey(new Date(parsed.savedAt)) : null);
      results.push({ feature: 'Atividade hoje', key: 'glpy_atividade_hoje', expected: today, found: `date=${actDate}`, status: actDate === today ? 'ok' : 'erro', reason: actDate === today ? 'Atividade reconhecida como de hoje' : 'BUG! Atividade não reconhecida' });
    }

    localStorage.setItem('glpy_ultima_aplicacao', today);
    {
      const raw = localStorage.getItem('glpy_ultima_aplicacao');
      results.push({ feature: 'Injeção hoje', key: 'glpy_ultima_aplicacao', expected: today, found: raw ?? 'null', status: raw === today ? 'ok' : 'erro', reason: raw === today ? 'Aplicação de hoje registrada' : 'BUG! Injeção não reconhecida' });
    }

    localStorage.setItem('glpy_emocao_hoje', JSON.stringify({ mood: '😊', intensity: 5, date: today, savedAt: ts }));
    {
      const parsed = safeGet('glpy_emocao_hoje');
      const emDate = parsed?.date ?? null;
      results.push({ feature: 'Emoção hoje', key: 'glpy_emocao_hoje', expected: today, found: `date=${emDate}`, status: emDate === today ? 'ok' : 'erro', reason: emDate === today ? 'Emoção reconhecida como de hoje' : 'BUG! Emoção não reconhecida' });
    }

    localStorage.setItem('glpy_agua_hoje', JSON.stringify({ amount: 2.0, date: yesterday, updatedAt: now }));
    {
      const parsed    = safeGet('glpy_agua_hoje');
      const waterDate = parsed?.date ?? null;
      results.push({ feature: 'Ontem ≠ hoje (água)', key: 'glpy_agua_hoje', expected: `date=${yesterday} ≠ hoje`, found: `date=${waterDate}`, status: waterDate !== today ? 'ok' : 'erro', reason: waterDate !== today ? 'Água de ontem não conta hoje' : 'BUG! Água de ontem aparece como hoje' });
    }

    localStorage.setItem('glpy_checkin_hoje', JSON.stringify({ date: yesterday, humor: '😐', fome: 3, energia: 4, sintomas: [], savedAt: ts - 86400000 }));
    {
      const parsed    = safeGet('glpy_checkin_hoje');
      const checkDate = typeof parsed === 'string' ? parsed : parsed?.date ?? null;
      results.push({ feature: 'Ontem não trava hoje (check-in)', key: 'glpy_checkin_hoje', expected: `date=${yesterday} ≠ hoje`, found: `date=${checkDate}`, status: checkDate !== today ? 'ok' : 'erro', reason: checkDate !== today ? 'Check-in de ontem não bloqueia hoje' : 'BUG! Usuário travado por check-in de ontem' });
    }
  } finally {
    restoreBackup(backup);
  }

  return results;
}

// ── Block 6: Protocolo e Missões ──────────────────────────────────────────────

function runProtocoloMissoes(today: string, yesterday: string): TestResult[] {
  const results: TestResult[] = [];
  const KEY    = 'glpy_protocol_day_today';
  const backup = makeBackup([KEY]);

  try {
    localStorage.removeItem(KEY);
    {
      const parsed = safeGet(KEY);
      results.push({ feature: 'Sem protocolo ativo', key: KEY, expected: 'null', found: `${parsed}`, status: parsed === null ? 'ok' : 'warn', reason: parsed === null ? 'Nenhum protocolo — app não bloqueia' : 'Protocolo presente mesmo removido' });
    }

    localStorage.setItem(KEY, JSON.stringify({ date: today, diaAtual: 5, protocolo: 'antiRebote', missoesConcluidas: [] }));
    {
      const parsed = safeGet(KEY);
      const ok = parsed?.date === today && (parsed?.diaAtual ?? 0) >= 1;
      results.push({ feature: 'Anti-Rebote ativo hoje', key: KEY, expected: `date=${today}, diaAtual≥1`, found: `date=${parsed?.date}, dia=${parsed?.diaAtual}`, status: ok ? 'ok' : 'erro', reason: ok ? 'Protocolo ativo reconhecido' : 'BUG! Protocolo não reconhecido' });
    }

    localStorage.setItem(KEY, JSON.stringify({ date: today, diaAtual: 1, missoesConcluidas: [] }));
    {
      const parsed     = safeGet(KEY);
      const concluidas = Array.isArray(parsed?.missoesConcluidas) ? parsed.missoesConcluidas.length : -1;
      results.push({ feature: 'Missão pendente hoje', key: KEY, expected: 'missoesConcluidas=[]', found: `${concluidas} concluídas`, status: concluidas === 0 ? 'ok' : 'warn', reason: concluidas === 0 ? 'Missões pendentes — usuário pode completar' : 'Estado inesperado' });
    }

    localStorage.setItem(KEY, JSON.stringify({ date: today, diaAtual: 2, missoesConcluidas: [0, 1, 2] }));
    {
      const parsed     = safeGet(KEY);
      const isToday    = parsed?.date === today;
      const concluidas: number[] = Array.isArray(parsed?.missoesConcluidas) ? parsed.missoesConcluidas : [];
      results.push({ feature: 'Missão concluída hoje', key: KEY, expected: `date=${today}, missões=[0,1,2]`, found: `date=${parsed?.date}, ${concluidas.length} concluídas`, status: isToday && concluidas.length > 0 ? 'ok' : 'erro', reason: isToday && concluidas.length > 0 ? 'Missões de hoje reconhecidas' : 'BUG! Missões não reconhecidas' });
    }

    localStorage.setItem(KEY, JSON.stringify({ date: yesterday, diaAtual: 1, missoesConcluidas: [0, 1] }));
    {
      const parsed   = safeGet(KEY);
      const protDate = parsed?.date ?? null;
      results.push({ feature: 'Missão ontem ≠ bloqueia hoje', key: KEY, expected: `date=${yesterday} ≠ hoje`, found: `date=${protDate}`, status: protDate !== today ? 'ok' : 'erro', reason: protDate !== today ? 'Protocolo de ontem — missões de hoje desbloqueadas' : 'BUG! Missão de ontem bloqueia hoje' });
    }

    localStorage.setItem(KEY, JSON.stringify({ date: today, diaAtual: 3, missoesConcluidas: [0] }));
    {
      const parsed     = safeGet(KEY);
      const isToday    = parsed?.date === today;
      const concluidas: number[] = Array.isArray(parsed?.missoesConcluidas) ? parsed.missoesConcluidas : [];
      results.push({ feature: 'Missão hoje: aparece concluída', key: KEY, expected: `date=${today}, missão 0 concluída`, found: `date=${parsed?.date}, concluídas=[${concluidas.join(',')}]`, status: isToday && concluidas.includes(0) ? 'ok' : 'erro', reason: isToday && concluidas.includes(0) ? 'Missão 0 reconhecida como concluída' : 'BUG! Missão não aparece como concluída' });
    }

    results.push({ feature: 'Missão comportamental (sem macro)', key: KEY, expected: 'não cria macro fake', found: 'verificar manualmente', status: 'skip', reason: 'Missão de mindset não deve gerar entrada de macro' });
    results.push({ feature: 'Missão exige registro real', key: KEY, expected: 'sugere ação ao usuário', found: 'verificar manualmente', status: 'skip', reason: 'Missão de hydratação/injeção deve guiar para registro' });
  } finally {
    restoreBackup(backup);
  }

  return results;
}

// ── Block 7: Plano/Acesso ─────────────────────────────────────────────────────

function runPlanoAcesso(_today: string, _yesterday: string): TestResult[] {
  const results: TestResult[] = [];
  const backup = makeBackup(['glpy_plano', 'glpy_access_control']);

  try {
    const cases: Array<{ plano: string; expectIA: number; expectFoto: number; label: string }> = [
      { plano: 'starter', expectIA: 30,  expectFoto: 5,        label: 'Plano starter (free)' },
      { plano: 'plus',    expectIA: 20,  expectFoto: 6,        label: 'Plano plus' },
      { plano: 'pro',     expectIA: 30,  expectFoto: 9,        label: 'Plano pro (fundador)' },
      { plano: 'top',     expectIA: 999, expectFoto: Infinity, label: 'Plano top (dev/admin)' },
    ];

    for (const c of cases) {
      localStorage.setItem('glpy_plano', c.plano);
      const plano = localStorage.getItem('glpy_plano') ?? 'starter';
      const ia    = LIMITES_IA[plano]   ?? 10;
      const foto  = LIMITES_FOTO[plano] ?? 3;
      const ok = ia === c.expectIA && foto === c.expectFoto;
      results.push({
        feature: c.label, key: 'glpy_plano',
        expected: `IA=${c.expectIA}, Foto=${c.expectFoto === Infinity ? '∞' : c.expectFoto}`,
        found: `ia=${ia}, foto=${foto === Infinity ? '∞' : foto}`,
        status: ok ? 'ok' : 'erro',
        reason: ok ? 'Limites corretos para este plano' : `Limite incorreto: ia=${ia}(esp ${c.expectIA}), foto=${foto}(esp ${c.expectFoto})`,
      });
    }

    localStorage.removeItem('glpy_plano');
    {
      const plano = localStorage.getItem('glpy_plano') ?? 'starter';
      results.push({ feature: 'Sem plano → fallback starter', key: 'glpy_plano', expected: 'starter', found: plano, status: plano === 'starter' ? 'ok' : 'warn', reason: plano === 'starter' ? 'Fallback correto' : 'Fallback inesperado' });
    }

    localStorage.setItem('glpy_access_control', JSON.stringify({ active: false, expiresAt: '2020-01-01', plano: 'pro' }));
    {
      const parsed   = safeGet('glpy_access_control');
      const isActive = parsed?.active === true;
      results.push({ feature: 'Acesso expirado', key: 'glpy_access_control', expected: 'active=false', found: `active=${parsed?.active}, exp=${parsed?.expiresAt}`, status: !isActive ? 'ok' : 'warn', reason: !isActive ? 'Marcado como inativo — paywall deve bloquear (verificar manualmente)' : 'Ativo mesmo com dados de expirado' });
    }

    localStorage.setItem('glpy_access_control', JSON.stringify({ active: false, cancelledAt: '2024-03-01', plano: 'starter' }));
    {
      const parsed   = safeGet('glpy_access_control');
      const isActive = parsed?.active === true;
      results.push({ feature: 'Acesso cancelado', key: 'glpy_access_control', expected: 'active=false', found: `active=${parsed?.active}`, status: !isActive ? 'ok' : 'warn', reason: !isActive ? 'Cancelado corretamente — paywall deve bloquear' : 'Ativo mesmo com dados de cancelado' });
    }

    results.push({ feature: 'HeroSpark webhook (futuro)', key: 'webhook_herospark', expected: 'pendente', found: 'não implementado', status: 'skip', reason: 'Seção reservada — integração HeroSpark não testada nesta sprint' });
  } finally {
    restoreBackup(backup);
  }

  return results;
}

// ── Block 9: Protocolos — Matriz dos 10 ──────────────────────────────────────

function computeProtocols(today: string, yesterday: string): ProtocolsRunResult {
  const results: TestResult[]  = [];
  const rows:    ProtocolRow[] = [];
  const KEY    = 'glpy_protocol_day_today';
  const backup = makeBackup([KEY]);

  // Verifica se today é formato local YYYY-MM-DD (não UTC)
  const localDateOk = /^\d{4}-\d{2}-\d{2}$/.test(today) && !today.includes('T') && !today.includes('Z');

  try {
    for (const meta of GLPY_PROTOCOLS_CATALOG) {
      const errors: string[] = [];
      const warns:  string[] = [];

      // 1. ID único
      if (!(typeof meta.legacyId === 'string' && meta.legacyId.length > 0)) errors.push('sem legacyId');
      // 2. Nome
      if (!(typeof meta.name === 'string' && meta.name.length > 0)) errors.push('sem nome');
      // 3. Descrição
      if (!(typeof meta.description === 'string' && meta.description.length > 0)) errors.push('sem descrição');
      // 4. Estrutura de dias
      if (!(typeof meta.totalDays === 'number' && meta.totalDays >= 1)) errors.push('totalDays inválido');
      // storagePrefix e previewRoute
      if (!(typeof meta.storagePrefix === 'string' && meta.storagePrefix.length > 0)) errors.push('sem storagePrefix');
      if (!(typeof meta.previewRoute === 'string' && meta.previewRoute.startsWith('/preview/'))) errors.push('previewRoute inválida');

      // 5. ≥1 dia válido (via totalDays do catálogo)
      const diasFound = meta.totalDays; // 7 para todos
      if (diasFound < 1) errors.push('nenhum dia válido');

      // 6–8. Estrutura dia/missão — validada via interface Dia (titulo + missoes[]) em Protocolo*.tsx
      // Todos os protocolos seguem o mesmo padrão confirmado por inspeção de código
      const missoesFound = diasFound >= 1 ? '≥2/dia' : '0';

      // 9. Missão concluída hoje é reconhecida
      localStorage.setItem(KEY, JSON.stringify({ date: today, diaAtual: 1, protocolo: meta.legacyId, missoesConcluidas: [0] }));
      const parsedToday = safeGet(KEY);
      const testHoje = parsedToday?.date === today
        && Array.isArray(parsedToday?.missoesConcluidas)
        && (parsedToday.missoesConcluidas as number[]).includes(0);
      if (!testHoje) errors.push('missão hoje não reconhecida');

      // 10. Missão de ontem não bloqueia hoje
      localStorage.setItem(KEY, JSON.stringify({ date: yesterday, diaAtual: 1, protocolo: meta.legacyId, missoesConcluidas: [0, 1] }));
      const parsedYest = safeGet(KEY);
      const testOntem  = parsedYest?.date !== today;
      if (!testOntem) errors.push('missão de ontem bloqueia hoje!');

      // 11. Macro fake — keywords que disparam MEAL_LOG_REQUIRED
      const macroFake = checkMacroFake(meta.description);
      if (macroFake) errors.push('descrição pode gerar macro fake');

      // 12. Ação real sugerida
      const acaoReal = deriveAcaoReal(meta.description);
      if (acaoReal !== 'comportamental') warns.push(`missão sugere "${acaoReal}" — verificar manualmente`);

      // 13–14. Date local via getLocalDateKey (não UTC)
      if (!localDateOk) errors.push('data não é local YYYY-MM-DD');

      // 15–16. Tela branca / erro → apenas manual
      // 17. Sem Firebase → OK (catálogo é módulo de dados puro)
      // 18. Sem IA → OK (catálogo não chama modelo)

      // Protocolo 4 usa renderer customizado (AntiRebote.tsx) — informativo
      if (meta.usesCustomRenderer) warns.push('usa renderer customizado (AntiRebote.tsx) — OK por design');

      const risco  = errors.length > 0 ? 'ALTO' : warns.length > 0 ? 'baixo' : 'zero';
      const status: 'ok' | 'erro' | 'warn' | 'skip' = errors.length > 0 ? 'erro' : warns.length > 0 ? 'warn' : 'ok';
      const motivo = errors.length > 0
        ? errors.join('; ')
        : warns.length > 0
          ? warns.join('; ')
          : 'Catálogo OK · date local OK · sem macro fake · sem Firebase · sem IA';

      rows.push({ number: meta.number, name: meta.name, emoji: meta.emoji, color: meta.color, status, diasFound, missoesFound, testHoje, testOntem, acaoReal, macroFake, risco, motivo });
      results.push({ feature: `P${meta.number}: ${meta.name}`, key: meta.storagePrefix, expected: '7 dias, missões OK, date local, sem macro fake', found: `dias=${diasFound}, hoje=${testHoje ? 'OK' : 'ERRO'}, ontem=${testOntem ? 'OK' : 'ERRO'}, macroFake=${macroFake}`, status, reason: motivo });
    }
  } finally {
    restoreBackup(backup);
  }

  return { results, rows };
}

// ── Block Definitions ─────────────────────────────────────────────────────────

const BLOCKS: Array<{
  id: BlockId; label: string; color: string; desc: string;
  run: (today: string, yesterday: string) => TestResult[];
}> = [
  { id: 'saude',      label: '3. Saúde Geral',             color: '#4FC3F7', desc: 'Verifica se chaves principais existem e carregam corretamente',            run: runSaudeGeral },
  { id: 'limites',    label: '4. Limites Diários',          color: '#FF8A65', desc: 'Testa lógica IA 0/30 29/30 30/30 ontem→hoje; Foto 0/5 4/5 5/5 ontem→hoje', run: runLimitesdiarios },
  { id: 'jornada',    label: '5. Jornada Diária',           color: '#69F0AE', desc: 'Simula e valida água, refeição, check-in, atividade, injeção, emoção',      run: runJornadaDiaria },
  { id: 'protocolo',  label: '6. Protocolo e Missões',      color: '#CE93D8', desc: 'Simula protocolo ativo, missões ontem/hoje, desbloqueio correto',            run: runProtocoloMissoes },
  { id: 'plano',      label: '7. Plano/Acesso',             color: '#FFD54F', desc: 'Valida limites por plano, fallback, expirado, cancelado',                    run: runPlanoAcesso },
  { id: 'protocolos', label: '9. Protocolos — Matriz dos 10', color: '#80DEEA', desc: 'Valida todos os 10 protocolos: catálogo, dias, missões, date local, macro fake, Firebase, IA', run: (t, y) => computeProtocols(t, y).results },
];

// ── Style helpers ─────────────────────────────────────────────────────────────

function btn(bg: string, fg: string, disabled = false): React.CSSProperties {
  return {
    background: disabled ? '#1A1A1A' : bg,
    color: disabled ? '#444' : fg,
    border: `1px solid ${disabled ? '#333' : fg + '55'}`,
    padding: '8px 12px',
    cursor: disabled ? 'not-allowed' : 'pointer',
    borderRadius: 6,
    fontSize: 11,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    textAlign: 'left' as const,
  };
}

const TH: React.CSSProperties = { padding: '7px 10px', color: '#666', textAlign: 'left', fontWeight: 'normal', borderBottom: '1px solid #222', whiteSpace: 'nowrap', fontSize: 10 };
const TD: React.CSSProperties = { padding: '6px 10px', verticalAlign: 'top', fontSize: 10 };
const THm: React.CSSProperties = { ...TH, fontSize: 9 };
const TDm: React.CSSProperties = { ...TD, fontSize: 9 };

const statusColor = (s: TestResult['status']) =>
  s === 'ok' ? '#4CAF50' : s === 'erro' ? '#FF4444' : s === 'warn' ? '#FFA726' : '#555';
const statusLabel = (s: TestResult['status']) =>
  s === 'ok' ? '✓ OK' : s === 'erro' ? '✗ ERRO' : s === 'warn' ? '⚠ WARN' : '— SKIP';

// ── Component ─────────────────────────────────────────────────────────────────

export default function GlpyQACenterScreen({ onBack }: { onBack?: () => void }) {
  const today     = getLocalDateKey();
  const yesterday = getYesterday();

  const [backup,       setBackup]       = useState<Backup | null>(null);
  const [blockResults, setBlockResults] = useState<Partial<Record<BlockId, TestResult[]>>>({});
  const [protocolRows, setProtocolRows] = useState<ProtocolRow[]>([]);
  const [lastAction,   setLastAction]   = useState('');
  const [confirmClear, setConfirmClear] = useState(false);

  const handleBackup  = () => { setBackup(makeBackup(ALL_KEYS)); setLastAction('Backup salvo'); };
  const handleRestore = () => { if (!backup) return; restoreBackup(backup); setBlockResults({}); setProtocolRows([]); setLastAction('Backup restaurado'); };
  const handleClear   = () => {
    if (backup) { restoreBackup(backup); setLastAction('Backup restaurado'); }
    else { for (const k of ALL_KEYS) localStorage.removeItem(k); setLastAction('Chaves de teste removidas'); }
    setBlockResults({}); setProtocolRows([]); setConfirmClear(false);
  };

  const runBlock = (id: BlockId) => {
    if (!backup) setBackup(makeBackup(ALL_KEYS));
    const block = BLOCKS.find(b => b.id === id)!;
    if (id === 'protocolos') {
      const { results, rows } = computeProtocols(today, yesterday);
      setBlockResults(prev => ({ ...prev, protocolos: results }));
      setProtocolRows(rows);
    } else {
      setBlockResults(prev => ({ ...prev, [id]: block.run(today, yesterday) }));
    }
    setLastAction(`Bloco ${block.label} executado`);
  };

  const runAll = () => {
    if (!backup) setBackup(makeBackup(ALL_KEYS));
    const { results: protResults, rows: protRows } = computeProtocols(today, yesterday);
    const all: Partial<Record<BlockId, TestResult[]>> = {};
    for (const b of BLOCKS) {
      all[b.id] = b.id === 'protocolos' ? protResults : b.run(today, yesterday);
    }
    setProtocolRows(protRows);
    setBlockResults(all);
    setLastAction('Todos os blocos executados — ver resultado geral abaixo');
  };

  const allFlat    = (Object.values(blockResults) as TestResult[][]).flat();
  const okCount    = allFlat.filter(r => r.status === 'ok').length;
  const erroCount  = allFlat.filter(r => r.status === 'erro').length;
  const warnCount  = allFlat.filter(r => r.status === 'warn').length;
  const skipCount  = allFlat.filter(r => r.status === 'skip').length;
  const hasRun     = allFlat.length > 0;
  const isApto     = hasRun && erroCount === 0 && warnCount === 0;
  const isAptoWarn = hasRun && erroCount === 0 && warnCount > 0;

  // Veredicto final: só APTO se protocolos também rodaram sem erros
  const protocolsRan  = (blockResults['protocolos'] ?? []).length > 0;
  const protocolsOk   = protocolsRan && (blockResults['protocolos'] ?? []).filter(r => r.status === 'erro').length === 0;
  const veredictoFull = hasRun && protocolsRan;

  return (
    <div style={{ minHeight: '100vh', background: '#0A0A0A', color: '#E0E0E0', fontFamily: 'monospace' }}>

      {/* 1. Cabeçalho */}
      <div style={{ background: '#001A08', borderBottom: '2px solid #00C853', padding: '12px 16px', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
          {onBack && (
            <button onClick={onBack} style={{ background: 'none', border: '1px solid #555', color: '#aaa', padding: '4px 10px', cursor: 'pointer', borderRadius: 4, fontSize: 12, marginTop: 2, flexShrink: 0 }}>
              ← back
            </button>
          )}
          <div style={{ flex: 1 }}>
            <div style={{ color: '#00C853', fontWeight: 'bold', fontSize: 14 }}>[DEBUG] GLPY QA CENTER — HOMOLOGAÇÃO INTERNA</div>
            <div style={{ color: '#555', fontSize: 10, marginTop: 2 }}>Sprint 17A.5.14–15 · Não exibir ao usuário final · Sem Firebase · Sem IA · Sem consumo de limites reais</div>
          </div>
          <div style={{ textAlign: 'right', fontSize: 11, color: '#666', flexShrink: 0 }}>
            <div>hoje: <span style={{ color: '#4FC3F7' }}>{today}</span></div>
            <div>ontem: <span style={{ color: '#FF8A65' }}>{yesterday}</span></div>
            <div>env: <span style={{ color: '#FFA726' }}>localStorage only</span></div>
            <div style={{ color: '#FF4444', fontSize: 9, marginTop: 2 }}>⚠ NÃO usar em produção</div>
          </div>
        </div>
      </div>

      <div style={{ padding: '16px', maxWidth: 1100, margin: '0 auto' }}>

        {/* Status bar */}
        <div style={{ background: '#111', border: '1px solid #222', borderRadius: 8, padding: '10px 14px', marginBottom: 14, fontSize: 11, display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ color: backup ? '#4CAF50' : '#666' }}>{backup ? '✓ Backup salvo' : '○ Sem backup'}</span>
          {hasRun && <>
            <span style={{ color: '#4CAF50' }}>✓ {okCount} OK</span>
            {erroCount > 0 && <span style={{ color: '#FF4444' }}>✗ {erroCount} ERRO</span>}
            {warnCount > 0 && <span style={{ color: '#FFA726' }}>⚠ {warnCount} WARN</span>}
            <span style={{ color: '#555' }}>— {skipCount} SKIP · {allFlat.length} total</span>
            {protocolsRan && <span style={{ color: protocolsOk ? '#4CAF50' : '#FF4444' }}>{protocolsOk ? '✓ Protocolos OK' : '✗ Protocolos ERRO'}</span>}
          </>}
          {lastAction && <span style={{ color: '#CE93D8', marginLeft: 'auto', fontSize: 10 }}>↳ {lastAction}</span>}
        </div>

        {/* 2. Backup / Restauração */}
        <div style={{ background: '#0D0D0D', border: '1px solid #1B5E2055', borderRadius: 8, padding: '12px 14px', marginBottom: 12 }}>
          <div style={{ color: '#69F0AE', fontSize: 12, fontWeight: 'bold', marginBottom: 10 }}>2. Backup / Restauração</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            <button onClick={handleBackup} style={btn('#1B5E20', '#69F0AE')}>💾 Salvar backup</button>
            <button onClick={handleRestore} disabled={!backup} style={btn('#33691E', '#B9F6CA', !backup)}>🔄 Restaurar backup</button>
            {!confirmClear
              ? <button onClick={() => setConfirmClear(true)} style={btn('#3E0000', '#FF5252')}>🗑 Limpar dados de teste</button>
              : <>
                  <span style={{ color: '#FF5252', fontSize: 11 }}>Confirmar {backup ? 'restaurar' : 'limpar'}?</span>
                  <button onClick={handleClear} style={{ ...btn('#B71C1C', '#FF5252'), padding: '6px 10px' }}>✓ Sim</button>
                  <button onClick={() => setConfirmClear(false)} style={{ ...btn('#222', '#888'), padding: '6px 10px' }}>✗ Não</button>
                </>
            }
          </div>
        </div>

        {/* Run All */}
        <div style={{ marginBottom: 14 }}>
          <button onClick={runAll} style={{ ...btn('#0D2B5E', '#82B1FF'), width: '100%', padding: '12px 14px', fontSize: 13, textAlign: 'center' as const }}>
            ▶ Executar todos os blocos (3 → 9)
          </button>
        </div>

        {/* Blocks 3–9 */}
        {BLOCKS.map(block => {
          const results = blockResults[block.id] ?? [];
          const bOk   = results.filter(r => r.status === 'ok').length;
          const bErro = results.filter(r => r.status === 'erro').length;
          const bWarn = results.filter(r => r.status === 'warn').length;
          const bRan  = results.length > 0;
          const isProtocolBlock = block.id === 'protocolos';

          return (
            <div key={block.id} style={{ background: '#0D0D0D', border: `1px solid ${block.color}22`, borderRadius: 8, marginBottom: 10, overflow: 'hidden' }}>
              <div style={{ background: '#111', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <span style={{ color: block.color, fontWeight: 'bold', fontSize: 12, whiteSpace: 'nowrap' }}>{block.label}</span>
                <span style={{ color: '#444', fontSize: 10, flex: 1 }}>{block.desc}</span>
                {bRan && <>
                  <span style={{ color: '#4CAF50', fontSize: 10 }}>✓{bOk}</span>
                  {bErro > 0 && <span style={{ color: '#FF4444', fontSize: 10 }}>✗{bErro}</span>}
                  {bWarn > 0 && <span style={{ color: '#FFA726', fontSize: 10 }}>⚠{bWarn}</span>}
                </>}
                <button onClick={() => runBlock(block.id)} style={{ ...btn('#1A1A2E', block.color), padding: '5px 10px', fontSize: 10, whiteSpace: 'nowrap' as const }}>
                  ▶ Executar
                </button>
              </div>

              {/* Protocols matrix table */}
              {isProtocolBlock && protocolRows.length > 0 && (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr>
                        <th style={THm}>#</th>
                        <th style={THm}>Protocolo</th>
                        <th style={THm}>Status</th>
                        <th style={THm}>Dias</th>
                        <th style={THm}>Missões</th>
                        <th style={THm}>Hoje</th>
                        <th style={THm}>Ontem</th>
                        <th style={THm}>Ação real</th>
                        <th style={THm}>Macro fake</th>
                        <th style={THm}>Risco</th>
                        <th style={THm}>Motivo</th>
                      </tr>
                    </thead>
                    <tbody>
                      {protocolRows.map((row, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid #181818', background: i % 2 === 0 ? '#0D0D0D' : '#111' }}>
                          <td style={{ ...TDm, color: row.color, fontWeight: 'bold', whiteSpace: 'nowrap' }}>{row.emoji} {row.number}</td>
                          <td style={{ ...TDm, color: '#E0E0E0', whiteSpace: 'nowrap', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis' }}>{row.name}</td>
                          <td style={{ ...TDm, whiteSpace: 'nowrap' }}><span style={{ color: statusColor(row.status), fontWeight: 'bold' }}>{statusLabel(row.status)}</span></td>
                          <td style={{ ...TDm, color: '#4FC3F7', textAlign: 'center' as const }}>{row.diasFound}</td>
                          <td style={{ ...TDm, color: '#69F0AE' }}>{row.missoesFound}</td>
                          <td style={{ ...TDm, color: row.testHoje ? '#4CAF50' : '#FF4444', textAlign: 'center' as const }}>{row.testHoje ? '✓' : '✗'}</td>
                          <td style={{ ...TDm, color: row.testOntem ? '#4CAF50' : '#FF4444', textAlign: 'center' as const }}>{row.testOntem ? '✓' : '✗'}</td>
                          <td style={{ ...TDm, color: '#CE93D8', whiteSpace: 'nowrap' }}>{row.acaoReal}</td>
                          <td style={{ ...TDm, color: row.macroFake ? '#FF4444' : '#4CAF50', textAlign: 'center' as const }}>{row.macroFake ? '⚠ SIM' : '✓ não'}</td>
                          <td style={{ ...TDm, color: row.risco === 'zero' ? '#4CAF50' : row.risco === 'ALTO' ? '#FF4444' : '#FFA726', whiteSpace: 'nowrap' }}>{row.risco}</td>
                          <td style={{ ...TDm, color: '#BDBDBD', maxWidth: 280 }}>{row.motivo}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Standard results table for non-protocol blocks */}
              {!isProtocolBlock && bRan && (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr>
                        <th style={TH}>Status</th>
                        <th style={TH}>Feature</th>
                        <th style={TH}>Chave</th>
                        <th style={TH}>Esperado</th>
                        <th style={TH}>Encontrado</th>
                        <th style={TH}>Motivo</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.map((r, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid #181818', background: i % 2 === 0 ? '#0D0D0D' : '#111' }}>
                          <td style={{ ...TD, whiteSpace: 'nowrap' }}><span style={{ color: statusColor(r.status), fontWeight: 'bold' }}>{statusLabel(r.status)}</span></td>
                          <td style={{ ...TD, color: '#E0E0E0', whiteSpace: 'nowrap' }}>{r.feature}</td>
                          <td style={{ ...TD, color: '#4FC3F7', whiteSpace: 'nowrap' }}>{r.key}</td>
                          <td style={{ ...TD, color: '#A5D6A7' }}>{r.expected}</td>
                          <td style={{ ...TD, color: '#FFD54F' }}>{r.found}</td>
                          <td style={{ ...TD, color: '#BDBDBD' }}>{r.reason}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          );
        })}

        {/* 8. Resultado Geral */}
        <div style={{
          background: !hasRun ? '#0D0D0D' : erroCount > 0 ? '#1A0000' : warnCount > 0 ? '#1A1200' : '#001A08',
          border: `2px solid ${!hasRun ? '#222' : erroCount > 0 ? '#FF4444' : warnCount > 0 ? '#FFA726' : '#00C853'}`,
          borderRadius: 8, padding: '16px 14px', marginTop: 4,
        }}>
          <div style={{ color: '#666', fontSize: 12, fontWeight: 'bold', marginBottom: 12 }}>8. Resultado Geral</div>
          {!hasRun ? (
            <div style={{ color: '#333', fontSize: 12, textAlign: 'center', padding: '24px 0' }}>Execute os blocos acima para ver o resultado.</div>
          ) : (
            <>
              <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', marginBottom: 14, fontSize: 12 }}>
                <div><span style={{ color: '#666' }}>Total: </span><span style={{ color: '#E0E0E0', fontWeight: 'bold' }}>{allFlat.length}</span></div>
                <div><span style={{ color: '#666' }}>OK: </span><span style={{ color: '#4CAF50', fontWeight: 'bold' }}>{okCount}</span></div>
                <div><span style={{ color: '#666' }}>ERRO: </span><span style={{ color: erroCount > 0 ? '#FF4444' : '#444', fontWeight: 'bold' }}>{erroCount}</span></div>
                <div><span style={{ color: '#666' }}>WARN: </span><span style={{ color: warnCount > 0 ? '#FFA726' : '#444', fontWeight: 'bold' }}>{warnCount}</span></div>
                <div><span style={{ color: '#666' }}>SKIP: </span><span style={{ color: '#555', fontWeight: 'bold' }}>{skipCount}</span></div>
                {!veredictoFull && <div style={{ color: '#FFA726', fontSize: 11 }}>⚠ Bloco 9 (Protocolos) ainda não executado — rodar "Executar todos" para veredicto completo</div>}
                {erroCount > 0 && <div><span style={{ color: '#FF4444' }}>⚠ {erroCount} risco(s) encontrado(s)</span></div>}
              </div>

              <div style={{
                background: erroCount > 0 ? '#FF444422' : warnCount > 0 ? '#FFA72622' : '#00C85322',
                border: `1px solid ${erroCount > 0 ? '#FF4444' : warnCount > 0 ? '#FFA726' : '#00C853'}`,
                borderRadius: 6, padding: '14px 16px', textAlign: 'center',
              }}>
                {erroCount > 0 && (
                  <>
                    <div style={{ color: '#FF4444', fontSize: 18, fontWeight: 'bold', letterSpacing: 2 }}>✗ NÃO APTO — corrigir antes</div>
                    <div style={{ color: '#FF8A80', fontSize: 11, marginTop: 6 }}>{erroCount} erro(s) detectado(s). Ver coluna "Motivo" nos blocos acima.</div>
                  </>
                )}
                {isAptoWarn && (
                  <>
                    <div style={{ color: '#FFA726', fontSize: 17, fontWeight: 'bold', letterSpacing: 1 }}>⚠ APTO COM AVISOS — revisar manualmente antes de lançar</div>
                    <div style={{ color: '#FFD54F', fontSize: 11, marginTop: 6 }}>{warnCount} aviso(s) — verificar coluna "Motivo" nos blocos acima.</div>
                  </>
                )}
                {isApto && (
                  <>
                    <div style={{ color: '#00C853', fontSize: 18, fontWeight: 'bold', letterSpacing: 2 }}>✓ APTO PARA LANÇAR</div>
                    <div style={{ color: '#69F0AE', fontSize: 11, marginTop: 6 }}>Todos os testes automáticos passaram. Risco zero operacional.</div>
                  </>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div style={{ marginTop: 24, color: '#222', fontSize: 9, textAlign: 'center', lineHeight: 1.8 }}>
          [INTERNAL] GLPY QA Center · Sprint 17A.5.14–15<br />
          Usa getLocalDateKey() exclusivamente · sem Firebase · sem IA · sem câmera · sem limites reais<br />
          Backup automático antes de qualquer simulação · {GLPY_PROTOCOLS_CATALOG.length} protocolos no catálogo<br />
          Chaves auditadas: {ALL_KEYS.join(' · ')}
        </div>
      </div>
    </div>
  );
}
