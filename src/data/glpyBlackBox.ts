// GLPY — Black Box Comportamental Local
// Sprint 17A: registra todos os eventos comportamentais relevantes do usuário.
//
// Regras de privacidade:
// - NÃO salvar imagem/base64
// - NÃO salvar conversa completa da IA
// - NÃO salvar texto livre sensível completo
// - Para emoções/sintomas: chaves padronizadas apenas
// - Para IA: somente metadados (uso, limite, sucesso/erro)
// - Para fotos: somente metadados (data, role/angle)
// - Prune automático: mantém últimos MAX_DAYS dias (default 90)
// - SSR safe: verifica typeof window antes de acessar localStorage

import type { GlpyBlackBoxEvent } from './types';

// ── Constantes ───────────────────────────────────────────────────────────────

const STORAGE_KEY = 'glpy_black_box_events';
const MAX_DAYS    = 90;
const MAX_EVENTS  = 2000; // safety cap

// ── Helpers ──────────────────────────────────────────────────────────────────

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
}

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function generateId(): string {
  return `bb_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function readRaw(): GlpyBlackBoxEvent[] {
  if (!isBrowser()) return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeRaw(events: GlpyBlackBoxEvent[]): void {
  if (!isBrowser()) return;
  try {
    // Não emite local-storage-change — Black Box é silenciosa para a UI
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
  } catch {
    // localStorage cheio ou indisponível — descarta silenciosamente
  }
}

function pruneOldEvents(events: GlpyBlackBoxEvent[], days: number): GlpyBlackBoxEvent[] {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  const cutoffISO = cutoff.toISOString().slice(0, 10);
  return events.filter(e => e.date >= cutoffISO);
}

// ── API pública ──────────────────────────────────────────────────────────────

/**
 * Adiciona um evento à Black Box.
 * Prune automático para MAX_DAYS e MAX_EVENTS ao salvar.
 * Campos id, date e timestamp são gerados automaticamente se ausentes.
 */
function addEvent(event: Omit<GlpyBlackBoxEvent, 'id' | 'date' | 'timestamp'> & Partial<Pick<GlpyBlackBoxEvent, 'id' | 'date' | 'timestamp'>>): void {
  if (!isBrowser()) return;
  const now = new Date();
  const fullEvent: GlpyBlackBoxEvent = {
    id:        event.id        ?? generateId(),
    date:      event.date      ?? now.toISOString().slice(0, 10),
    timestamp: event.timestamp ?? now.toISOString(),
    type:      event.type,
    category:  event.category,
    domain:    event.domain,
    signal:    event.signal,
    screen:    event.screen,
    source:    event.source,
    payload:   event.payload,
  };

  let events = readRaw();
  events = pruneOldEvents(events, MAX_DAYS);
  events.push(fullEvent);

  // Safety cap — descarta os mais antigos se passar do limite
  if (events.length > MAX_EVENTS) {
    events = events.slice(events.length - MAX_EVENTS);
  }

  writeRaw(events);
}

function getEvents(): GlpyBlackBoxEvent[] {
  return readRaw();
}

function getTodayEvents(): GlpyBlackBoxEvent[] {
  const today = todayISO();
  return readRaw().filter(e => e.date === today);
}

function getEventsByType(type: string): GlpyBlackBoxEvent[] {
  return readRaw().filter(e => e.type === type);
}

function getEventsByCategory(category: string): GlpyBlackBoxEvent[] {
  return readRaw().filter(e => e.category === category);
}

function getEventsByDomain(domain: string): GlpyBlackBoxEvent[] {
  return readRaw().filter(e => e.domain === domain);
}

function getEventsBySignal(signal: string): GlpyBlackBoxEvent[] {
  return readRaw().filter(e => e.signal === signal);
}

function getRecentEvents(days: number): GlpyBlackBoxEvent[] {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  const cutoffISO = cutoff.toISOString().slice(0, 10);
  return readRaw().filter(e => e.date >= cutoffISO);
}

function clearEvents(): void {
  if (!isBrowser()) return;
  try { localStorage.removeItem(STORAGE_KEY); } catch {}
}

function pruneEvents(days: number = MAX_DAYS): void {
  if (!isBrowser()) return;
  const pruned = pruneOldEvents(readRaw(), days);
  writeRaw(pruned);
}

// ── Export ───────────────────────────────────────────────────────────────────

export const glpyBlackBox = {
  addEvent,
  getEvents,
  getTodayEvents,
  getEventsByType,
  getEventsByCategory,
  getEventsByDomain,
  getEventsBySignal,
  getRecentEvents,
  clearEvents,
  pruneOldEvents: pruneEvents,
};

export type { GlpyBlackBoxEvent };
