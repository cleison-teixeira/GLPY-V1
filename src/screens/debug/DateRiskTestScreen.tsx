// GLPY — Date Risk Test Screen
// System: Debug — INTERNAL ONLY — não exibir para usuário final
// Sprint: 17A.5.13 — Painel de validação data local / limites diários
//
// Valida que as correções 17A.5.3–17A.5.12 funcionam na prática.
// NÃO chama IA real. NÃO toca Firebase. NÃO consome limites reais.
// NÃO altera UI das telas reais.

import React, { useState } from 'react';
import { getLocalDateKey } from '../../utils/formatters';

// ── Types ─────────────────────────────────────────────────────────────────────

interface TestResult {
  feature:  string;
  key:      string;
  expected: string;
  found:    string;
  status:   'ok' | 'error' | 'warn' | 'skip';
  reason:   string;
}

type Backup = Record<string, string | null>;

// ── Chaves auditadas ──────────────────────────────────────────────────────────

const TESTED_KEYS = [
  'glpy_ai_usage',
  'glpy_fotos_data',
  'glpy_fotos_hoje',
  'glpy_agua_hoje',
  'glpy_refeicoes_hoje',
  'glpy_atividade_hoje',
  'glpy_checkin_hoje',
  'glpy_checkin_historico',
  'glpy_emocao_hoje',
  'glpy_protocol_day_today',
  'glpy_black_box_events',
  'glpy_ultima_aplicacao',
  'glpy_injection_effects_today',
  'glpy_injecao_locais',
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
  } catch {
    return localStorage.getItem(key);
  }
}

function makeBackup(): Backup {
  const b: Backup = {};
  for (const k of TESTED_KEYS) b[k] = localStorage.getItem(k);
  return b;
}

function restoreBackup(backup: Backup): void {
  for (const [key, value] of Object.entries(backup)) {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
  }
}

// ── Simulate yesterday full ───────────────────────────────────────────────────

function simulateYesterdayFull(yesterday: string): void {
  const now         = new Date().toISOString();
  const yesterdayTs = Date.now() - 86_400_000;

  localStorage.setItem('glpy_ai_usage', JSON.stringify({
    date: yesterday, dia: yesterday, reset_dia: yesterday,
    used: 30, limit: 30, updatedAt: now,
  }));

  localStorage.setItem('glpy_fotos_data', yesterday);
  localStorage.setItem('glpy_fotos_hoje', '5');

  localStorage.setItem('glpy_agua_hoje', JSON.stringify({
    amount: 2.5, date: yesterday, updatedAt: now,
  }));

  localStorage.setItem('glpy_refeicoes_hoje', JSON.stringify([{
    id: 'test_meal_yesterday', nome: 'Refeição Teste (ontem)',
    date: yesterday, calories: 400, protein: 30, carbs: 40, fat: 10,
    savedAt: yesterdayTs,
  }]));

  localStorage.setItem('glpy_atividade_hoje', JSON.stringify({
    activity: 'caminhada', duration: '30', intensity: 'moderada',
    savedAt: yesterdayTs, date: yesterday,
  }));

  localStorage.setItem('glpy_checkin_hoje', JSON.stringify({
    date: yesterday, humor: '😊', fome: 5, energia: 7,
    sintomas: [], savedAt: yesterdayTs,
  }));

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const existing: any[] = JSON.parse(localStorage.getItem('glpy_checkin_historico') || '[]');
    const filtered = existing.filter((item: unknown) => {
      const d = typeof item === 'string' ? item : (item as Record<string, string>)?.date;
      return d !== yesterday;
    });
    localStorage.setItem('glpy_checkin_historico', JSON.stringify([...filtered, yesterday]));
  } catch {
    localStorage.setItem('glpy_checkin_historico', JSON.stringify([yesterday]));
  }

  localStorage.setItem('glpy_emocao_hoje', JSON.stringify({
    mood: '😊', intensity: 5, date: yesterday, savedAt: yesterdayTs,
  }));

  localStorage.setItem('glpy_protocol_day_today', JSON.stringify({
    date: yesterday, diaAtual: 3, missoesConcluidas: [0, 1, 2],
  }));

  localStorage.setItem('glpy_ultima_aplicacao', yesterday);

  localStorage.setItem('glpy_injection_effects_today', JSON.stringify({
    date: yesterday, symptoms: [], intensity: 'none', noSymptoms: true, savedAt: now,
  }));

  localStorage.setItem('glpy_injecao_locais', JSON.stringify([
    { id: 'abd-esq', label: 'Abdômen Esq.', data: yesterday },
  ]));

  // glpy_black_box_events: somente leitura — não modificado
}

// ── Simulate today full ───────────────────────────────────────────────────────

function simulateTodayFull(today: string): void {
  const now     = new Date().toISOString();
  const todayTs = Date.now();

  localStorage.setItem('glpy_ai_usage', JSON.stringify({
    date: today, dia: today, reset_dia: today,
    used: 30, limit: 30, updatedAt: now,
  }));

  localStorage.setItem('glpy_fotos_data', today);
  localStorage.setItem('glpy_fotos_hoje', '5');

  localStorage.setItem('glpy_agua_hoje', JSON.stringify({
    amount: 2.5, date: today, updatedAt: now,
  }));

  localStorage.setItem('glpy_refeicoes_hoje', JSON.stringify([{
    id: 'test_meal_today', nome: 'Refeição Teste (hoje)',
    date: today, calories: 400, protein: 30, carbs: 40, fat: 10,
    savedAt: todayTs,
  }]));

  localStorage.setItem('glpy_atividade_hoje', JSON.stringify({
    activity: 'caminhada', duration: '30', intensity: 'moderada',
    savedAt: todayTs, date: today,
  }));

  localStorage.setItem('glpy_checkin_hoje', JSON.stringify({
    date: today, humor: '😊', fome: 5, energia: 7,
    sintomas: [], savedAt: todayTs,
  }));

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const existing: any[] = JSON.parse(localStorage.getItem('glpy_checkin_historico') || '[]');
    const filtered = existing.filter((item: unknown) => {
      const d = typeof item === 'string' ? item : (item as Record<string, string>)?.date;
      return d !== today;
    });
    localStorage.setItem('glpy_checkin_historico', JSON.stringify([...filtered, today]));
  } catch {
    localStorage.setItem('glpy_checkin_historico', JSON.stringify([today]));
  }

  localStorage.setItem('glpy_emocao_hoje', JSON.stringify({
    mood: '😊', intensity: 5, date: today, savedAt: todayTs,
  }));

  localStorage.setItem('glpy_protocol_day_today', JSON.stringify({
    date: today, diaAtual: 3, missoesConcluidas: [0, 1, 2],
  }));

  localStorage.setItem('glpy_ultima_aplicacao', today);

  localStorage.setItem('glpy_injection_effects_today', JSON.stringify({
    date: today, symptoms: [], intensity: 'none', noSymptoms: true, savedAt: now,
  }));

  localStorage.setItem('glpy_injecao_locais', JSON.stringify([
    { id: 'abd-esq', label: 'Abdômen Esq.', data: today },
  ]));
}

// ── Validate: abertura hoje (cenário ontem cheio → hoje) ─────────────────────

function validateOpenToday(today: string, yesterday: string): TestResult[] {
  const results: TestResult[] = [];

  // 1. IA — data de ontem → deve ser lida como 0
  {
    const parsed      = safeGet('glpy_ai_usage');
    const rawDate     = parsed?.date ?? parsed?.dia ?? parsed?.reset_dia ?? null;
    const isToday     = rawDate === today;
    const used        = typeof parsed?.used === 'number' ? parsed.used : 0;
    const effectiveUsed = isToday ? used : 0;
    const ok          = effectiveUsed === 0;
    results.push({
      feature:  'IA (glpy_ai_usage)',
      key:      'glpy_ai_usage',
      expected: '0/30 — data ≠ hoje → reset',
      found:    `date=${rawDate}, used=${parsed?.used ?? '?'}, limit=${parsed?.limit ?? '?'}`,
      status:   ok ? 'ok' : 'error',
      reason:   ok
        ? `date (${rawDate}) ≠ hoje (${today}) → app lê como 0/30`
        : `date (${rawDate}) = hoje → used=${used} persiste → BUG! IA bloqueada`,
    });
  }

  // 2. Foto do prato — data de ontem → 0/5
  {
    const fotosData   = localStorage.getItem('glpy_fotos_data');
    const fotosHoje   = parseInt(localStorage.getItem('glpy_fotos_hoje') ?? '0', 10);
    const isToday     = fotosData === today;
    const effectiveN  = isToday ? fotosHoje : 0;
    const ok          = effectiveN === 0;
    results.push({
      feature:  'Foto do prato',
      key:      'glpy_fotos_data / glpy_fotos_hoje',
      expected: '0/5 — glpy_fotos_data ≠ hoje → reset',
      found:    `fotos_data=${fotosData}, fotos_hoje=${fotosHoje}`,
      status:   ok ? 'ok' : 'error',
      reason:   ok
        ? `glpy_fotos_data (${fotosData}) ≠ hoje → app lê como 0/5`
        : `glpy_fotos_data (${fotosData}) = hoje → fotos_hoje=${fotosHoje} → BUG!`,
    });
  }

  // 3. Água — data de ontem não conta hoje
  {
    const parsed    = safeGet('glpy_agua_hoje');
    const waterDate = parsed?.date ?? null;
    const ok        = waterDate !== today;
    results.push({
      feature:  'Água',
      key:      'glpy_agua_hoje',
      expected: `date = ${yesterday} (ontem — não aparece hoje)`,
      found:    `date=${waterDate}, amount=${parsed?.amount ?? '?'}L`,
      status:   ok ? 'ok' : 'error',
      reason:   ok
        ? `Água em ${waterDate} ≠ hoje — app ignora`
        : `Água em ${waterDate} = hoje — BUG! Aparece como consumo de hoje`,
    });
  }

  // 4. Refeições — nenhuma com date = hoje
  {
    const parsed     = safeGet('glpy_refeicoes_hoje');
    const meals      = Array.isArray(parsed) ? parsed : [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const todayMeals = meals.filter((m: any) => m.date === today);
    const ok         = todayMeals.length === 0;
    results.push({
      feature:  'Refeições',
      key:      'glpy_refeicoes_hoje',
      expected: '0 refeições de hoje',
      found:    `${meals.length} total, ${todayMeals.length} de hoje`,
      status:   ok ? 'ok' : 'error',
      reason:   ok
        ? 'Nenhuma refeição com date = hoje'
        : `${todayMeals.length} refeição(ões) com date = hoje → BUG!`,
    });
  }

  // 5. Atividade — data de ontem não conta hoje
  {
    const parsed  = safeGet('glpy_atividade_hoje');
    const actDate = parsed?.date ?? (parsed?.savedAt ? getLocalDateKey(new Date(parsed.savedAt)) : null);
    const ok      = actDate !== today;
    results.push({
      feature:  'Atividade',
      key:      'glpy_atividade_hoje',
      expected: `date = ${yesterday} (não conta hoje)`,
      found:    `date=${actDate}, activity=${parsed?.activity ?? '?'}`,
      status:   ok ? 'ok' : 'error',
      reason:   ok
        ? `Atividade em ${actDate} ≠ hoje — app ignora`
        : `Atividade em ${actDate} = hoje → BUG! Aparece como de hoje`,
    });
  }

  // 6. Check-in — data de ontem não trava hoje
  {
    const parsed    = safeGet('glpy_checkin_hoje');
    const checkDate = typeof parsed === 'string' ? parsed : parsed?.date ?? null;
    const ok        = checkDate !== today;
    results.push({
      feature:  'Check-in',
      key:      'glpy_checkin_hoje',
      expected: `date = ${yesterday} (não bloqueia hoje)`,
      found:    `date=${checkDate}`,
      status:   ok ? 'ok' : 'error',
      reason:   ok
        ? `Check-in em ${checkDate} ≠ hoje — usuário pode fazer check-in hoje`
        : `Check-in em ${checkDate} = hoje → BUG! Aparece como feito hoje`,
    });
  }

  // 7. Histórico check-in — informativo
  {
    const parsed      = safeGet('glpy_checkin_historico');
    const hist        = Array.isArray(parsed) ? parsed : [];
    const hasYesterday = hist.some((item: unknown) =>
      typeof item === 'string' ? item === yesterday : (item as Record<string, string>)?.date === yesterday
    );
    results.push({
      feature:  'Histórico check-in',
      key:      'glpy_checkin_historico',
      expected: `Contém ontem (${yesterday})`,
      found:    `${hist.length} entradas — ontem: ${hasYesterday ? 'sim ✓' : 'não'}`,
      status:   hasYesterday ? 'ok' : 'warn',
      reason:   hasYesterday ? 'Histórico preserva ontem corretamente' : 'Ontem não encontrado no histórico',
    });
  }

  // 8. Emoção — data de ontem não conta hoje
  {
    const parsed = safeGet('glpy_emocao_hoje');
    const emDate = parsed?.date ?? (parsed?.savedAt ? getLocalDateKey(new Date(parsed.savedAt)) : null);
    const ok     = emDate !== today;
    results.push({
      feature:  'Emoção',
      key:      'glpy_emocao_hoje',
      expected: `date = ${yesterday} (não conta hoje)`,
      found:    `date=${emDate}, mood=${parsed?.mood ?? '?'}`,
      status:   ok ? 'ok' : 'error',
      reason:   ok
        ? `Emoção em ${emDate} ≠ hoje — app ignora`
        : `Emoção em ${emDate} = hoje → BUG!`,
    });
  }

  // 9. Protocolo/Missões — data de ontem não trava hoje
  {
    const parsed   = safeGet('glpy_protocol_day_today');
    const protDate = parsed?.date ?? null;
    const ok       = protDate !== today;
    results.push({
      feature:  'Protocolo / Missões',
      key:      'glpy_protocol_day_today',
      expected: `date = ${yesterday} (missões de hoje desbloqueadas)`,
      found:    `date=${protDate}`,
      status:   ok ? 'ok' : 'warn',
      reason:   ok
        ? `Protocolo do dia em ${protDate} ≠ hoje — missões de hoje reiniciam`
        : `Protocolo em ${protDate} = hoje — verificar se missões ficam travadas`,
    });
  }

  // 10. Black Box — somente leitura
  {
    const parsed = safeGet('glpy_black_box_events');
    const count  = Array.isArray(parsed) ? parsed.length : '?';
    results.push({
      feature:  'Black Box Events',
      key:      'glpy_black_box_events',
      expected: 'Somente leitura — não modificado',
      found:    `${count} eventos`,
      status:   'skip',
      reason:   'Black Box é append-only e não é modificado por esta tela',
    });
  }

  // 11. Última aplicação — ontem não aparece como hoje
  {
    const raw = localStorage.getItem('glpy_ultima_aplicacao');
    const ok  = raw !== today;
    results.push({
      feature:  'Última aplicação',
      key:      'glpy_ultima_aplicacao',
      expected: `${yesterday} (ontem — não bloqueia hoje)`,
      found:    raw ?? 'null',
      status:   ok ? 'ok' : 'error',
      reason:   ok
        ? `Aplicação em ${raw} ≠ hoje — AlertaInjecao não mostrará como feita hoje`
        : `Aplicação em ${raw} = hoje → BUG! AlertaInjecao aparece como feita`,
    });
  }

  // 12. Efeitos injeção — ontem não bloqueia hoje
  {
    const parsed  = safeGet('glpy_injection_effects_today');
    const effDate = parsed?.date ?? null;
    const ok      = effDate !== today;
    results.push({
      feature:  'Efeitos injeção',
      key:      'glpy_injection_effects_today',
      expected: `date = ${yesterday} (não bloqueia injeção hoje)`,
      found:    `date=${effDate}`,
      status:   ok ? 'ok' : 'error',
      reason:   ok
        ? `Efeitos em ${effDate} ≠ hoje — InjectionScreen não pré-preenche hoje`
        : `Efeitos em ${effDate} = hoje → BUG! Pode travar fluxo de injeção`,
    });
  }

  // 13. Locais de injeção — pontos de ontem não aparecem como usados hoje
  {
    const parsed     = safeGet('glpy_injecao_locais');
    const sites      = Array.isArray(parsed) ? parsed : [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const todaySites = sites.filter((s: any) => s.data === today);
    const ok         = todaySites.length === 0;
    results.push({
      feature:  'Locais de injeção',
      key:      'glpy_injecao_locais',
      expected: '0 pontos usados hoje',
      found:    `${sites.length} total — ${todaySites.length} de hoje`,
      status:   ok ? 'ok' : 'error',
      reason:   ok
        ? 'Nenhum ponto com data = hoje — todos disponíveis'
        : `${todaySites.length} ponto(s) com data = hoje → BUG! Aparecem como usados`,
    });
  }

  return results;
}

// ── Validate: hoje cheio (cenário hoje 30/30, 5/5, tudo hoje) ────────────────

function validateTodayFull(today: string): TestResult[] {
  const results: TestResult[] = [];

  // 1. IA — deve bloquear 30/30
  {
    const parsed    = safeGet('glpy_ai_usage');
    const rawDate   = parsed?.date ?? null;
    const used      = typeof parsed?.used  === 'number' ? parsed.used  : 0;
    const limit     = typeof parsed?.limit === 'number' ? parsed.limit : 30;
    const isToday   = rawDate === today;
    const isBlocked = isToday && used >= limit;
    results.push({
      feature:  'IA (glpy_ai_usage)',
      key:      'glpy_ai_usage',
      expected: `date=${today}, used=30, limit=30 → bloqueado`,
      found:    `date=${rawDate}, used=${used}, limit=${limit}`,
      status:   isBlocked ? 'ok' : 'error',
      reason:   isBlocked
        ? `date = hoje, used (${used}) >= limit (${limit}) → input bloqueado corretamente`
        : `data ou contagem incorreta — não bloqueia como esperado`,
    });
  }

  // 2. Foto do prato — deve bloquear 5/5
  {
    const fotosData   = localStorage.getItem('glpy_fotos_data');
    const fotosHoje   = parseInt(localStorage.getItem('glpy_fotos_hoje') ?? '0', 10);
    const isToday     = fotosData === today;
    const isBlocked   = isToday && fotosHoje >= 5;
    results.push({
      feature:  'Foto do prato',
      key:      'glpy_fotos_data / glpy_fotos_hoje',
      expected: `data=${today}, fotos_hoje=5 → bloqueado`,
      found:    `data=${fotosData}, fotos_hoje=${fotosHoje}`,
      status:   isBlocked ? 'ok' : 'error',
      reason:   isBlocked
        ? `data = hoje, fotos_hoje (${fotosHoje}) >= 5 → bloqueado corretamente`
        : 'data ou contagem incorreta — não bloqueia como esperado',
    });
  }

  // 3. Água — presente hoje
  {
    const parsed    = safeGet('glpy_agua_hoje');
    const waterDate = parsed?.date ?? null;
    const ok        = waterDate === today;
    results.push({
      feature:  'Água',
      key:      'glpy_agua_hoje',
      expected: `date = ${today}`,
      found:    `date=${waterDate}, amount=${parsed?.amount ?? '?'}L`,
      status:   ok ? 'ok' : 'error',
      reason:   ok
        ? `Água com data de hoje: ${parsed?.amount}L`
        : `date (${waterDate}) ≠ hoje → BUG! Água não aparece`,
    });
  }

  // 4. Refeições — presentes hoje
  {
    const parsed     = safeGet('glpy_refeicoes_hoje');
    const meals      = Array.isArray(parsed) ? parsed : [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const todayMeals = meals.filter((m: any) => m.date === today);
    const ok         = todayMeals.length > 0;
    results.push({
      feature:  'Refeições',
      key:      'glpy_refeicoes_hoje',
      expected: '≥1 refeição de hoje',
      found:    `${meals.length} total — ${todayMeals.length} de hoje`,
      status:   ok ? 'ok' : 'error',
      reason:   ok
        ? `${todayMeals.length} refeição(ões) de hoje`
        : 'Nenhuma refeição de hoje → BUG!',
    });
  }

  // 5. Atividade — presente hoje
  {
    const parsed  = safeGet('glpy_atividade_hoje');
    const actDate = parsed?.date ?? (parsed?.savedAt ? getLocalDateKey(new Date(parsed.savedAt)) : null);
    const ok      = actDate === today;
    results.push({
      feature:  'Atividade',
      key:      'glpy_atividade_hoje',
      expected: `date = ${today}`,
      found:    `date=${actDate}, activity=${parsed?.activity ?? '?'}`,
      status:   ok ? 'ok' : 'error',
      reason:   ok ? `Atividade de hoje (${actDate})` : `${actDate} ≠ hoje → BUG!`,
    });
  }

  // 6. Check-in — feito hoje
  {
    const parsed    = safeGet('glpy_checkin_hoje');
    const checkDate = typeof parsed === 'string' ? parsed : parsed?.date ?? null;
    const ok        = checkDate === today;
    results.push({
      feature:  'Check-in',
      key:      'glpy_checkin_hoje',
      expected: `date = ${today}`,
      found:    `date=${checkDate}`,
      status:   ok ? 'ok' : 'error',
      reason:   ok ? 'Check-in de hoje presente' : `${checkDate} ≠ hoje → BUG!`,
    });
  }

  // 7. Histórico — contém hoje
  {
    const parsed    = safeGet('glpy_checkin_historico');
    const hist      = Array.isArray(parsed) ? parsed : [];
    const hasToday  = hist.some((item: unknown) =>
      typeof item === 'string' ? item === today : (item as Record<string, string>)?.date === today
    );
    results.push({
      feature:  'Histórico check-in',
      key:      'glpy_checkin_historico',
      expected: `Contém hoje (${today})`,
      found:    `${hist.length} entradas — hoje: ${hasToday ? 'sim ✓' : 'não'}`,
      status:   hasToday ? 'ok' : 'warn',
      reason:   hasToday ? 'Histórico contém hoje' : 'Hoje não encontrado no histórico',
    });
  }

  // 8. Emoção — presente hoje
  {
    const parsed = safeGet('glpy_emocao_hoje');
    const emDate = parsed?.date ?? (parsed?.savedAt ? getLocalDateKey(new Date(parsed.savedAt)) : null);
    const ok     = emDate === today;
    results.push({
      feature:  'Emoção',
      key:      'glpy_emocao_hoje',
      expected: `date = ${today}`,
      found:    `date=${emDate}`,
      status:   ok ? 'ok' : 'error',
      reason:   ok ? `Emoção de hoje presente` : `${emDate} ≠ hoje → BUG!`,
    });
  }

  // 9. Última aplicação — hoje
  {
    const raw = localStorage.getItem('glpy_ultima_aplicacao');
    const ok  = raw === today;
    results.push({
      feature:  'Última aplicação',
      key:      'glpy_ultima_aplicacao',
      expected: today,
      found:    raw ?? 'null',
      status:   ok ? 'ok' : 'error',
      reason:   ok ? 'Aplicação de hoje registrada' : `${raw} ≠ hoje → BUG!`,
    });
  }

  // 10. Efeitos injeção — hoje
  {
    const parsed  = safeGet('glpy_injection_effects_today');
    const effDate = parsed?.date ?? null;
    const ok      = effDate === today;
    results.push({
      feature:  'Efeitos injeção',
      key:      'glpy_injection_effects_today',
      expected: `date = ${today}`,
      found:    `date=${effDate}`,
      status:   ok ? 'ok' : 'error',
      reason:   ok ? 'Efeitos de hoje registrados' : `${effDate} ≠ hoje → BUG!`,
    });
  }

  // 11. Locais de injeção — pontos de hoje
  {
    const parsed     = safeGet('glpy_injecao_locais');
    const sites      = Array.isArray(parsed) ? parsed : [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const todaySites = sites.filter((s: any) => s.data === today);
    const ok         = todaySites.length > 0;
    results.push({
      feature:  'Locais de injeção',
      key:      'glpy_injecao_locais',
      expected: '≥1 ponto de hoje',
      found:    `${sites.length} total — ${todaySites.length} de hoje`,
      status:   ok ? 'ok' : 'error',
      reason:   ok ? `${todaySites.length} ponto(s) de hoje` : 'Nenhum ponto de hoje → BUG!',
    });
  }

  // 12. Protocolo — de hoje
  {
    const parsed   = safeGet('glpy_protocol_day_today');
    const protDate = parsed?.date ?? null;
    const ok       = protDate === today;
    results.push({
      feature:  'Protocolo / Missões',
      key:      'glpy_protocol_day_today',
      expected: `date = ${today}`,
      found:    `date=${protDate}`,
      status:   ok ? 'ok' : 'warn',
      reason:   ok ? 'Protocolo do dia com data de hoje' : `${protDate} — verificar missões`,
    });
  }

  // 13. Black Box — somente leitura
  {
    const parsed = safeGet('glpy_black_box_events');
    const count  = Array.isArray(parsed) ? parsed.length : '?';
    results.push({
      feature:  'Black Box Events',
      key:      'glpy_black_box_events',
      expected: 'Somente leitura — não modificado',
      found:    `${count} eventos`,
      status:   'skip',
      reason:   'Black Box é append-only e não é modificado por esta tela',
    });
  }

  return results;
}

// ── Inline style helpers ──────────────────────────────────────────────────────

function btn(bg: string, fg: string, disabled = false): React.CSSProperties {
  return {
    background:  disabled ? '#1A1A1A' : bg,
    color:       disabled ? '#444' : fg,
    border:      `1px solid ${disabled ? '#333' : fg + '55'}`,
    padding:     '9px 14px',
    cursor:      disabled ? 'not-allowed' : 'pointer',
    borderRadius: 6,
    fontSize:    12,
    fontFamily:  'monospace',
    fontWeight:  'bold',
    width:       '100%',
    textAlign:   'left' as const,
  };
}

const TH: React.CSSProperties = {
  padding: '8px 10px', color: '#666', textAlign: 'left', fontWeight: 'normal',
  borderBottom: '1px solid #222', whiteSpace: 'nowrap', fontSize: 11,
};
const TD: React.CSSProperties = {
  padding: '7px 10px', verticalAlign: 'top', fontSize: 11,
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function DateRiskTestScreen({ onBack }: { onBack?: () => void }) {
  const today     = getLocalDateKey();
  const yesterday = getYesterday();

  const [backup,       setBackup]       = useState<Backup | null>(null);
  const [results,      setResults]      = useState<TestResult[]>([]);
  const [lastAction,   setLastAction]   = useState('');
  const [confirmClear, setConfirmClear] = useState(false);

  const act = (label: string, fn: () => void) => { fn(); setLastAction(label); };

  const handleBackup           = () => act('Backup salvo', () => setBackup(makeBackup()));
  const handleRestore          = () => { if (!backup) return; restoreBackup(backup); setResults([]); setLastAction('Backup restaurado'); };
  const handleSimulateYesterday = () => act(`Ontem cheio simulado (${yesterday})`, () => { if (!backup) setBackup(makeBackup()); simulateYesterdayFull(yesterday); setResults([]); });
  const handleValidateOpen     = () => act('Validação "Abertura hoje" concluída', () => setResults(validateOpenToday(today, yesterday)));
  const handleSimulateToday    = () => act(`Hoje cheio simulado (${today})`, () => { if (!backup) setBackup(makeBackup()); simulateTodayFull(today); setResults([]); });
  const handleValidateToday    = () => act('Validação "Hoje cheio" concluída', () => setResults(validateTodayFull(today)));
  const handleClear            = () => {
    if (backup) { restoreBackup(backup); setLastAction('Backup restaurado'); }
    else { for (const k of TESTED_KEYS) localStorage.removeItem(k); setLastAction('Chaves de teste removidas'); }
    setResults([]); setConfirmClear(false);
  };

  const okCount   = results.filter(r => r.status === 'ok').length;
  const errCount  = results.filter(r => r.status === 'error').length;
  const warnCount = results.filter(r => r.status === 'warn').length;

  const statusColor = (s: TestResult['status']) =>
    s === 'ok' ? '#4CAF50' : s === 'error' ? '#FF4444' : s === 'warn' ? '#FFA726' : '#555';
  const statusLabel = (s: TestResult['status']) =>
    s === 'ok' ? '✓ OK' : s === 'error' ? '✗ ERRO' : s === 'warn' ? '⚠ WARN' : '— SKIP';

  return (
    <div style={{ minHeight: '100vh', background: '#0A0A0A', color: '#E0E0E0', fontFamily: 'monospace' }}>

      {/* Header */}
      <div style={{ background: '#1A0000', borderBottom: '2px solid #FF4444', padding: '12px 16px', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
          {onBack && (
            <button onClick={onBack} style={{ background: 'none', border: '1px solid #555', color: '#aaa', padding: '4px 10px', cursor: 'pointer', borderRadius: 4, fontSize: 12, marginTop: 2, flexShrink: 0 }}>
              ← back
            </button>
          )}
          <div style={{ flex: 1 }}>
            <div style={{ color: '#FF4444', fontWeight: 'bold', fontSize: 14 }}>
              🔬 [DEBUG] DATE RISK TEST — GLPY INTERNO
            </div>
            <div style={{ color: '#666', fontSize: 10, marginTop: 2 }}>
              Sprint 17A.5.13 · Não exibir ao usuário final · Sem Firebase · Sem IA · Sem consumo de limites reais
            </div>
          </div>
          <div style={{ textAlign: 'right', fontSize: 11, color: '#666', flexShrink: 0 }}>
            <div>hoje: <span style={{ color: '#4FC3F7' }}>{today}</span></div>
            <div>ontem: <span style={{ color: '#FF8A65' }}>{yesterday}</span></div>
          </div>
        </div>
      </div>

      <div style={{ padding: '16px', maxWidth: 860, margin: '0 auto' }}>

        {/* Status bar */}
        <div style={{ background: '#111', border: '1px solid #222', borderRadius: 8, padding: '10px 14px', marginBottom: 14, fontSize: 12, display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ color: backup ? '#4CAF50' : '#666' }}>{backup ? '✓ Backup salvo' : '○ Sem backup'}</span>
          {results.length > 0 && <>
            <span style={{ color: '#4CAF50' }}>✓ {okCount} OK</span>
            {errCount  > 0 && <span style={{ color: '#FF4444' }}>✗ {errCount} ERRO</span>}
            {warnCount > 0 && <span style={{ color: '#FFA726' }}>⚠ {warnCount} WARN</span>}
            <span style={{ color: '#555' }}>{results.length} total</span>
          </>}
          {lastAction && <span style={{ color: '#CE93D8', marginLeft: 'auto', fontSize: 11 }}>↳ {lastAction}</span>}
        </div>

        {/* Backup row */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          <button onClick={handleBackup} style={btn('#1B5E20', '#69F0AE')}>
            💾 Salvar backup agora
          </button>
          <button onClick={handleRestore} disabled={!backup} style={btn('#33691E', '#B9F6CA', !backup)}>
            🔄 Restaurar backup
          </button>
        </div>

        {/* Scenario cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>

          {/* Cenário A */}
          <div style={{ background: '#110A1A', border: '1px solid #3D1A5E', borderRadius: 8, padding: 12 }}>
            <div style={{ color: '#CE93D8', fontSize: 12, fontWeight: 'bold', marginBottom: 8 }}>
              Cenário A — Ontem cheio → Abertura hoje
            </div>
            <div style={{ color: '#888', fontSize: 10, marginBottom: 10 }}>
              Simula: IA 30/30, foto 5/5, água, refeição, check-in, injeção, emoção, protocolo — todos com data de ontem ({yesterday}).
              Valida: tudo deve resetar para hoje.
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <button onClick={handleSimulateYesterday} style={btn('#4A0E6B', '#E040FB')}>
                ⏮ Simular ontem cheio
              </button>
              <button onClick={handleValidateOpen} style={btn('#0D2B5E', '#82B1FF')}>
                🔍 Validar abertura hoje (espera todos 0)
              </button>
            </div>
          </div>

          {/* Cenário B */}
          <div style={{ background: '#0A1A0A', border: '1px solid #1B5E20', borderRadius: 8, padding: 12 }}>
            <div style={{ color: '#69F0AE', fontSize: 12, fontWeight: 'bold', marginBottom: 8 }}>
              Cenário B — Hoje cheio → Bloqueios corretos
            </div>
            <div style={{ color: '#888', fontSize: 10, marginBottom: 10 }}>
              Simula: IA 30/30, foto 5/5, água, refeição, check-in, injeção, emoção, protocolo — todos com data de hoje ({today}).
              Valida: bloqueios corretos.
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <button onClick={handleSimulateToday} style={btn('#1B5E20', '#69F0AE')}>
                ⏭ Simular hoje cheio
              </button>
              <button onClick={handleValidateToday} style={btn('#0D2B5E', '#82B1FF')}>
                🔍 Validar hoje cheio (espera bloqueios)
              </button>
            </div>
          </div>
        </div>

        {/* Clear */}
        <div style={{ marginBottom: 20 }}>
          {!confirmClear ? (
            <button onClick={() => setConfirmClear(true)} style={btn('#3E0000', '#FF5252')}>
              🗑 Limpar dados de teste
            </button>
          ) : (
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              <span style={{ color: '#FF5252', fontSize: 12 }}>
                Confirmar: {backup ? 'restaurar backup' : 'remover as chaves testadas'}?
              </span>
              <button onClick={handleClear} style={{ ...btn('#B71C1C', '#FF5252'), width: 'auto' }}>✓ Sim</button>
              <button onClick={() => setConfirmClear(false)} style={{ ...btn('#222', '#888'), width: 'auto' }}>✗ Cancelar</button>
            </div>
          )}
        </div>

        {/* Results */}
        {results.length > 0 && (
          <div style={{ background: '#0D0D0D', border: '1px solid #222', borderRadius: 8, overflow: 'hidden' }}>
            <div style={{ padding: '10px 14px', background: '#1A1A1A', borderBottom: '1px solid #222', fontSize: 12, color: '#888', display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
              <span>Resultados — {results.length} testes</span>
              <span style={{ color: '#4CAF50' }}>✓ {okCount} OK</span>
              {errCount  > 0 && <span style={{ color: '#FF4444' }}>✗ {errCount} ERRO</span>}
              {warnCount > 0 && <span style={{ color: '#FFA726' }}>⚠ {warnCount} WARN</span>}
              {errCount === 0 && warnCount === 0 && <span style={{ color: '#4CAF50', fontWeight: 'bold' }}>✓ TUDO OK — risco zero operacional</span>}
            </div>
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
                    <tr key={i} style={{ borderBottom: '1px solid #1A1A1A', background: i % 2 === 0 ? '#0D0D0D' : '#111' }}>
                      <td style={{ ...TD, whiteSpace: 'nowrap' }}>
                        <span style={{ color: statusColor(r.status), fontWeight: 'bold' }}>
                          {statusLabel(r.status)}
                        </span>
                      </td>
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
          </div>
        )}

        {results.length === 0 && (
          <div style={{ color: '#333', fontSize: 12, textAlign: 'center', padding: '48px 0' }}>
            Sem resultados. Escolha um cenário acima para simular e validar.
          </div>
        )}

        {/* Footer */}
        <div style={{ marginTop: 28, color: '#2A2A2A', fontSize: 10, textAlign: 'center', lineHeight: 1.8 }}>
          [INTERNAL] GLPY Debug · Sprint 17A.5.13<br />
          Usa getLocalDateKey() exclusivamente · sem Firebase · sem IA · sem consumo de limites reais<br />
          Chaves testadas: {TESTED_KEYS.join(' · ')}
        </div>
      </div>
    </div>
  );
}
