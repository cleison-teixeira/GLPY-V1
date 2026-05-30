// GLPY — Caixa Preta Screen
// System: Debug — INTERNAL ONLY — não exibir para usuário final
// Leitura somente. Não edita, não apaga, não envia dados.

import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Database, RefreshCw } from 'lucide-react';

interface CaixaPretaScreenProps {
  onBack?: () => void;
}

const BLOCKS: { label: string; keys: string[] }[] = [
  {
    label: '1. Onboarding / Perfil',
    keys: ['glpy_onboarding', 'glpy_nome', 'glpy_email', 'glpy_altura', 'glpy_peso_atual', 'glpy_peso_sonho', 'glpy_medicamento', 'glpy_sexo'],
  },
  {
    label: '2. Refeições de hoje',
    keys: ['glpy_refeicoes_hoje'],
  },
  {
    label: '3. Água de hoje',
    keys: ['glpy_agua_hoje'],
  },
  {
    label: '4. Emoção de hoje',
    keys: ['glpy_emocao_hoje', 'glpy_today_emotion'],
  },
  {
    label: '5. Atividade de hoje',
    keys: ['glpy_atividade_hoje', 'glpy_today_activity'],
  },
  {
    label: '6. Protocolo ativo',
    keys: ['glpy_protocolo_ativo', 'glpy_active_protocol', 'glpy_protocol_day_today', 'glpy_protocol_context_v1', 'glpy_protocol_global_daily_lock'],
  },
  {
    label: '7. Uso da IA',
    keys: ['glpy_ai_usage'],
  },
  {
    label: '8. Relatos de erro',
    keys: ['glpy_issue_reports'],
  },
  {
    label: '9. Quiz / Cocriação',
    keys: ['glpy_quiz_cocriacao_xp_claimed'],
  },
  {
    label: '10. Progresso / Peso',
    keys: ['glpy_latest_weight', 'glpy_results_summary', 'glpy_checkin_historico', 'glpy_checkin_hoje', 'glpy_xp', 'glpy_streak', 'glpy_nivel'],
  },
  {
    label: '11. Aplicação / Tratamento',
    keys: ['glpy_frequencia', 'glpy_dose', 'glpy_injecao_ultima', 'glpy_injecao_locais', 'glpy_injection_effects_today', 'glpy_injection_effects_history'],
  },
  {
    label: '12. Black Box — Eventos',
    keys: ['glpy_black_box_events'],
  },
];

function readKey(key: string): string {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return '— (não encontrado)';
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return `Array(${parsed.length})\n${JSON.stringify(parsed, null, 2)}`;
      if (typeof parsed === 'object') return JSON.stringify(parsed, null, 2);
      return String(parsed);
    } catch {
      return raw;
    }
  } catch {
    return '— (erro ao ler)';
  }
}

function Block({ label, keys }: { label: string; keys: string[] }) {
  const [open, setOpen] = useState(false);

  const hasData = keys.some(k => localStorage.getItem(k) !== null);

  return (
    <div style={{ marginBottom: 8, borderRadius: 14, border: '1px solid #E2EBE7', background: '#fff', overflow: 'hidden' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '12px 16px', background: 'none', border: 'none', cursor: 'pointer',
          textAlign: 'left',
        }}
      >
        <span style={{ fontSize: 13, fontWeight: 700, color: '#0A1628' }}>
          {label}
          {hasData && <span style={{ marginLeft: 6, fontSize: 9, fontWeight: 800, color: '#00C27A', background: '#f0faf5', border: '1px solid #b2ecd4', borderRadius: 8, padding: '2px 6px', textTransform: 'uppercase', letterSpacing: 1 }}>dados</span>}
        </span>
        {open ? <ChevronDown size={16} color="#3D5A70" /> : <ChevronRight size={16} color="#3D5A70" />}
      </button>

      {open && (
        <div style={{ borderTop: '1px solid #E2EBE7', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {keys.map(key => {
            const value = readKey(key);
            const missing = value === '— (não encontrado)';
            return (
              <div key={key}>
                <p style={{ fontSize: 10, fontWeight: 800, color: '#3D5A70', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 4 }}>{key}</p>
                <pre style={{
                  fontSize: 11, color: missing ? '#aab4bc' : '#0A1628',
                  background: missing ? '#f8f9fb' : '#f3f7f5',
                  border: `1px solid ${missing ? '#eef0f2' : '#d4eade'}`,
                  borderRadius: 10, padding: '8px 10px',
                  whiteSpace: 'pre-wrap', wordBreak: 'break-all', margin: 0,
                  maxHeight: 200, overflowY: 'auto',
                  fontFamily: 'ui-monospace, monospace',
                }}>
                  {value}
                </pre>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function CaixaPretaScreen({ onBack }: CaixaPretaScreenProps) {
  const [, forceRender] = useState(0);
  const totalKeys = BLOCKS.flatMap(b => b.keys);
  const foundCount = totalKeys.filter(k => localStorage.getItem(k) !== null).length;

  return (
    <div style={{ minHeight: '100vh', background: '#F4F6F8', maxWidth: 430, margin: '0 auto', display: 'flex', flexDirection: 'column' }}>

      {/* Header */}
      <div style={{ background: '#0A1628', padding: '20px 16px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
        {onBack && (
          <button onClick={onBack} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 10, width: 36, height: 36, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <ChevronRight size={18} color="#fff" style={{ transform: 'rotate(180deg)' }} />
          </button>
        )}
        <Database size={18} color="#00C27A" strokeWidth={2.5} />
        <div style={{ flex: 1 }}>
          <p style={{ margin: 0, fontSize: 15, fontWeight: 800, color: '#fff', lineHeight: 1.2 }}>Caixa Preta GLPY</p>
          <p style={{ margin: 0, fontSize: 10, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>Leitura somente · {foundCount}/{totalKeys.length} chaves com dados</p>
        </div>
        <button
          onClick={() => forceRender(n => n + 1)}
          style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 10, width: 36, height: 36, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          title="Atualizar"
        >
          <RefreshCw size={15} color="rgba(255,255,255,0.7)" />
        </button>
      </div>

      {/* Aviso */}
      <div style={{ background: '#fff7e6', borderBottom: '1px solid #ffe5b0', padding: '8px 16px' }}>
        <p style={{ margin: 0, fontSize: 10, color: '#b45309', fontWeight: 600 }}>
          ⚠️ Tela interna de debug. Apenas leitura. Não visível para usuários finais.
        </p>
      </div>

      {/* Blocos */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 12px 40px' }}>
        {BLOCKS.map(b => (
          <Block key={b.label} label={b.label} keys={b.keys} />
        ))}
      </div>

    </div>
  );
}
