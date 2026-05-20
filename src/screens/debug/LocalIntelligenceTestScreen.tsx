// GLPY — Local Intelligence Test Screen
// System: Debug / Integration Tool — LIGHT PREMIUM
// Authority: docs/glpy-local-intelligence-store-v1.md | docs/glpy-design-system-v1.md

import React, { useState, useEffect } from 'react';
import {
  Scale, Droplets, Utensils, Syringe, AlertTriangle, Activity,
  Smile, User, Copy, RotateCcw, FileText, CheckCircle2, Plus, Sparkles, AlertCircle
} from 'lucide-react';

import { GLPYScreen, GLPYHeader, GLPYCard, GLPYButton } from '../../components/ui';
import { lightColors } from '../../theme/colors';
import { fontFamily, fontSize, fontWeight } from '../../theme/typography';
import { gap, padding } from '../../theme/spacing';
import { radius } from '../../theme/radius';

import {
  getGLPYIntelligenceContext,
  buildGLPYContextForAI,
  saveWeightEntry,
  saveWaterEntry,
  saveFoodEntry,
  saveInjectionEntry,
  saveSymptomsEntry,
  saveEmotionEntry,
  saveActivityEntry,
  saveBodyMeasurementsEntry,
  savePhotoProgressEntry,
  saveCheckInEntry,
  saveProtocolContext,
  saveProtocolDayTracking
} from '../../core/glpyLocalIntelligence';

export default function LocalIntelligenceTestScreen({ onBack }: { onBack?: () => void }) {
  // Local reactive trigger to force re-render on save operations
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [copied, setCopied] = useState(false);

  // Simulation inputs
  const [simWeight, setSimWeight] = useState('78.5');
  const [simWater, setSimWater] = useState('0.5');
  const [simMealName, setSimMealName] = useState('Salmão Grelhado com Legumes');
  const [simMealKcal, setSimMealKcal] = useState('450');
  const [simDose, setSimDose] = useState('0.5mg');
  const [simLocal, setSimLocal] = useState('Braço Esquerdo');
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [selectedEmotion, setSelectedEmotion] = useState('Focado');

  // Load state
  const context = getGLPYIntelligenceContext();
  const compiledPrompt = buildGLPYContextForAI();

  function triggerRefresh() {
    setRefreshTrigger(prev => prev + 1);
  }

  // Pre-fill profile name if not set
  useEffect(() => {
    if (!localStorage.getItem('glpy_nome')) {
      localStorage.setItem('glpy_nome', 'Cleison Teixeira');
    }
    if (!localStorage.getItem('glpy_email')) {
      localStorage.setItem('glpy_email', 'cleison@exemplo.com');
    }
    if (!localStorage.getItem('glpy_streak')) {
      localStorage.setItem('glpy_streak', '5');
    }
    if (!localStorage.getItem('glpy_xp')) {
      localStorage.setItem('glpy_xp', '240');
    }
    triggerRefresh();
  }, []);

  function handleSaveWeight() {
    const w = parseFloat(simWeight);
    if (!isNaN(w)) {
      saveWeightEntry({ weight: w });
      alert(`Peso de ${w}kg salvo com sucesso!`);
      triggerRefresh();
    }
  }

  function handleSaveWater() {
    const amt = parseFloat(simWater);
    if (!isNaN(amt)) {
      saveWaterEntry({ amount: amt });
      alert(`${amt}L de água adicionados!`);
      triggerRefresh();
    }
  }

  function handleSaveFood() {
    const kcal = parseInt(simMealKcal, 10) || 0;
    if (simMealName.trim()) {
      saveFoodEntry({
        prato: simMealName,
        kcal,
        proteina: Math.round(kcal * 0.08), // mock estimation
        carbs: Math.round(kcal * 0.1),
        gordura: Math.round(kcal * 0.04)
      });
      alert(`Refeição "${simMealName}" registrada!`);
      setSimMealName('');
      triggerRefresh();
    }
  }

  function handleSaveInjection() {
    saveInjectionEntry({
      dose: simDose,
      local: simLocal,
      symptomsAfter: []
    });
    alert(`Aplicação de ${simDose} registrada!`);
    triggerRefresh();
  }

  function handleToggleSymptom(symptom: string) {
    let nextList = [...selectedSymptoms];
    if (nextList.includes(symptom)) {
      nextList = nextList.filter(s => s !== symptom);
    } else {
      nextList.push(symptom);
    }
    setSelectedSymptoms(nextList);
    saveSymptomsEntry({ symptoms: nextList });
    triggerRefresh();
  }

  function handleSelectEmotion(emotion: string) {
    setSelectedEmotion(emotion);
    saveEmotionEntry({ emotion });
    triggerRefresh();
  }

  function handleSetProtocol() {
    const missions = [
      'Ingerir 2.5L de água',
      'Evitar doces após às 19h',
      'Jejum metabólico de 12 horas'
    ];
    saveProtocolContext({
      id: 'anti_rebote',
      nome: 'Anti-Rebote Metabo',
      emoji: '⚖️',
      totalDias: 7,
      dia: 3,
      missoesTexto: missions
    });
    saveProtocolDayTracking({
      protocolId: 'anti_rebote',
      protocolName: 'Anti-Rebote Metabo',
      protocolEmoji: '⚖️',
      totalDays: 7,
      day: 3,
      missions: missions.map((texto, index) => ({
        id: `anti_rebote-dia-3-missao-${index + 1}`,
        texto,
        status: index === 0 ? 'concluida' : 'pendente',
      })),
      selectedCheckins: ['Sem compulsão hoje'],
      recipeOfDay: {
        id: 4,
        emoji: '🍗',
        nome: 'Frango com Batata-Doce',
        kcal: 420,
        proteina: 42,
        carbs: 38,
        gordura: 8,
        categoria: 'Almoço · Pós-treino',
      },
      dayStatus: 'em_andamento',
      behavioralSignals: ['Missão concluída: Ingerir 2.5L de água', 'Check-in selecionado: Sem compulsão hoje'],
    });
    alert('Protocolo "Anti-Rebote Metabo" definido no Dia 3!');
    triggerRefresh();
  }

  function handleClearData() {
    if (confirm('Tem certeza que deseja apagar os logs e chaves locais deste teste?')) {
      const keysToClear = [
        'glpy_latest_weight', 'glpy_weight_history', 'glpy_results_summary', 'glpy_peso_atual',
        'glpy_today_water', 'glpy_today_food', 'glpy_fotos_historico',
        'glpy_latest_injection', 'glpy_injection_history',
        'glpy_today_symptoms', 'glpy_symptoms_history',
        'glpy_today_emotion', 'glpy_emotion_history',
        'glpy_today_activity', 'glpy_activity_history',
        'glpy_latest_measurements', 'glpy_measurements_history',
        'glpy_photo_progress', 'glpy_ultimo_checkin', 'glpy_checkin_history',
        'glpy_protocolo_ativo', 'glpy_current_protocol_day', 'glpy_missoes_texto_hoje', 'glpy_protocol_context',
        'glpy_protocol_day_today', 'glpy_protocol_day_history',
        'glpy_daily_tracking'
      ];
      keysToClear.forEach(k => localStorage.removeItem(k));
      setSelectedSymptoms([]);
      alert('LocalStorage limpo para dados de inteligência local!');
      triggerRefresh();
    }
  }

  function handleCopyToClipboard() {
    navigator.clipboard.writeText(compiledPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  // ── Styles ─────────────────────────────────────────────────────────────────

  const mainContainer: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: gap.large,
    paddingBottom: 40,
  };

  const badgeWarning: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    padding: '4px 8px',
    backgroundColor: '#FEF3C7',
    color: '#D97706',
    borderRadius: 6,
    fontSize: 12,
    fontWeight: '600',
  };

  const badgeSuccess: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    padding: '4px 8px',
    backgroundColor: '#D1FAE5',
    color: '#059669',
    borderRadius: 6,
    fontSize: 12,
    fontWeight: '600',
  };

  const rowStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '8px 0',
    borderBottom: `1px solid ${lightColors.border.soft}`,
  };

  const subtitleStyle: React.CSSProperties = {
    fontFamily: fontFamily.primary,
    fontSize: fontSize.bodyDefault,
    fontWeight: fontWeight.h2,
    color: lightColors.text.navy,
    marginBottom: gap.small,
    marginTop: gap.medium,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  };

  const inputStyle: React.CSSProperties = {
    padding: '8px 12px',
    borderRadius: 8,
    border: `1px solid ${lightColors.border.soft}`,
    fontFamily: fontFamily.primary,
    fontSize: fontSize.small,
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
  };

  const flexFormStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    marginTop: 8,
  };

  const buttonGrid: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
    gap: 6,
    marginTop: 8,
  };

  const promptBox: React.CSSProperties = {
    width: '100%',
    height: 300,
    backgroundColor: '#0F172A',
    color: '#38BDF8',
    fontFamily: 'Courier, monospace',
    fontSize: 12,
    padding: 12,
    borderRadius: 8,
    border: 'none',
    resize: 'none',
    boxSizing: 'border-box',
    marginTop: 8,
  };

  return (
    <GLPYScreen variant="light">
      <GLPYHeader
        title="Inteligência Local"
        subtitle="Simulador de Logs Clínicos e Contexto IA"
        onBack={onBack || (() => { window.location.href = '/preview'; })}
      />

      <div style={mainContainer}>

        {/* ── SEÇÃO 1: PERFIL DO USUÁRIO ────────────────────────────────────── */}
        <GLPYCard variant="light">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 99,
              backgroundColor: `${lightColors.brand.green}22`,
              display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center'
            }}>
              <User size={20} color={lightColors.brand.greenDark} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontFamily: fontFamily.primary, fontWeight: '700', color: lightColors.text.navy }}>
                {context.userProfile.nome}
              </h3>
              <p style={{ margin: 0, fontSize: 12, color: lightColors.text.secondary }}>
                {context.userProfile.email} | Plano: {context.userProfile.plano.toUpperCase()}
              </p>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginTop: 12, textAlign: 'center' }}>
            <div style={{ padding: 8, background: '#F8FAFC', borderRadius: 8 }}>
              <span style={{ fontSize: 10, color: lightColors.text.secondary, display: 'block' }}>Streak 🔥</span>
              <strong style={{ fontSize: 16, color: lightColors.text.navy }}>{context.userProfile.streak} dias</strong>
            </div>
            <div style={{ padding: 8, background: '#F8FAFC', borderRadius: 8 }}>
              <span style={{ fontSize: 10, color: lightColors.text.secondary, display: 'block' }}>XP ✨</span>
              <strong style={{ fontSize: 16, color: lightColors.text.navy }}>{context.userProfile.xp}</strong>
            </div>
            <div style={{ padding: 8, background: '#F8FAFC', borderRadius: 8 }}>
              <span style={{ fontSize: 10, color: lightColors.text.secondary, display: 'block' }}>Nível 👑</span>
              <strong style={{ fontSize: 16, color: lightColors.text.navy }}>{context.userProfile.nivel}</strong>
            </div>
          </div>
        </GLPYCard>

        {/* ── SEÇÃO 2: PROTOCOLO ATIVO ──────────────────────────────────────── */}
        <GLPYCard variant="light">
          <h3 style={{ margin: 0, fontSize: 16, fontFamily: fontFamily.primary, fontWeight: '700', color: lightColors.text.navy, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>{context.activeProtocol ? '⚖️ Protocolo Ativo' : '⚪ Sem Protocolo'}</span>
          </h3>
          {context.activeProtocol ? (
            <div style={{ marginTop: 8 }}>
              <div style={rowStyle}>
                <span style={{ fontSize: 14, color: lightColors.text.navy, fontWeight: '600' }}>
                  {context.activeProtocol.nome}
                </span>
                <span style={badgeSuccess}>Dia {context.currentProtocolDay}/{context.activeProtocol.totalDias}</span>
              </div>
              {context.todayMissionsText && context.todayMissionsText.length > 0 && (
                <div style={{ marginTop: 8 }}>
                  <span style={{ fontSize: 12, fontWeight: '600', color: lightColors.text.secondary }}>Missões Vigentes:</span>
                  <ul style={{ margin: '4px 0 0 0', paddingLeft: 16, fontSize: 12, color: lightColors.text.navy }}>
                    {context.todayMissionsText.map((m, i) => <li key={i} style={{ padding: '2px 0' }}>{m}</li>)}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div style={{ marginTop: 8 }}>
              <p style={{ margin: 0, fontSize: 12, color: lightColors.text.secondary, marginBottom: 8 }}>
                Nenhum protocolo ativo detectado no localStorage.
              </p>
              <GLPYButton variant="secondary" size="sm" onClick={handleSetProtocol}>
                Ativar Protocolo Anti-Rebote (Simulado)
              </GLPYButton>
            </div>
          )}
        </GLPYCard>

        {/* ── SEÇÃO 2.1: EXECUÇÃO DO PROTOCOLO HOJE ────────────────────────── */}
        <GLPYCard variant="light">
          <h3 style={{ margin: 0, fontSize: 16, fontFamily: fontFamily.primary, fontWeight: '700', color: lightColors.text.navy, display: 'flex', alignItems: 'center', gap: 8 }}>
            <CheckCircle2 size={18} color={lightColors.brand.greenDark} />
            Execução do Protocolo Hoje
          </h3>
          {context.protocolDayToday ? (
            <div style={{ marginTop: 10 }}>
              <div style={rowStyle}>
                <span style={{ fontSize: 13, color: lightColors.text.navy, fontWeight: '700' }}>
                  {context.protocolDayToday.protocolEmoji} {context.protocolDayToday.protocolName}
                </span>
                <span style={context.protocolDayToday.dayStatus === 'concluido' ? badgeSuccess : badgeWarning}>
                  {context.protocolDayToday.dayStatus}
                </span>
              </div>
              <div style={rowStyle}>
                <span style={{ fontSize: 12, color: lightColors.text.secondary }}>Dia</span>
                <strong style={{ fontSize: 12, color: lightColors.text.navy }}>{context.protocolDayToday.day}/{context.protocolDayToday.totalDays}</strong>
              </div>
              {context.protocolDayToday.recipeOfDay?.nome && (
                <div style={rowStyle}>
                  <span style={{ fontSize: 12, color: lightColors.text.secondary }}>Receita do dia</span>
                  <strong style={{ fontSize: 12, color: lightColors.text.navy }}>{context.protocolDayToday.recipeOfDay.nome}</strong>
                </div>
              )}
              {context.protocolDayToday.selectedCheckins?.length > 0 && (
                <div style={{ marginTop: 8, fontSize: 12, color: lightColors.text.navy }}>
                  <strong>Check-in:</strong> {context.protocolDayToday.selectedCheckins.join(', ')}
                </div>
              )}
              {context.protocolDayToday.missions?.length > 0 && (
                <ul style={{ margin: '8px 0 0 0', paddingLeft: 16, fontSize: 12, color: lightColors.text.navy }}>
                  {context.protocolDayToday.missions.map((m, i) => (
                    <li key={m.id || i} style={{ padding: '2px 0' }}>
                      {m.status === 'concluida' ? '✓' : '○'} {m.texto}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ) : (
            <div style={{ marginTop: 10 }}>
              <p style={{ margin: '0 0 8px 0', fontSize: 12, color: lightColors.text.secondary }}>
                Nenhuma execução diária do protocolo registrada hoje.
              </p>
              <GLPYButton variant="secondary" size="sm" onClick={handleSetProtocol}>
                Simular Execução do Protocolo
              </GLPYButton>
            </div>
          )}
        </GLPYCard>

        {/* ── SEÇÃO 3: AUDITORIA DE ALERTAS (WARNINGS) ───────────────────────── */}
        <GLPYCard variant="light" style={{ borderColor: context.warnings.length > 0 ? '#F59E0B' : lightColors.brand.green }}>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: '700', color: lightColors.text.navy, display: 'flex', alignItems: 'center', gap: 6 }}>
            <AlertTriangle size={18} color={context.warnings.length > 0 ? '#D97706' : lightColors.brand.greenDark} />
            Checagem Clínica da IA ({context.warnings.length === 0 ? 'Impecável' : `${context.warnings.length} alertas`})
          </h3>
          {context.warnings.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 10 }}>
              {context.warnings.map((w, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', background: '#FFFBEB', borderRadius: 6, borderLeft: '3px solid #F59E0B' }}>
                  <AlertCircle size={14} color="#D97706" />
                  <span style={{ fontSize: 12, color: '#92400E', fontWeight: '500' }}>{w}</span>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px', background: '#ECFDF5', borderRadius: 6, marginTop: 10, borderLeft: '3px solid #10B981' }}>
              <CheckCircle2 size={16} color="#059669" />
              <span style={{ fontSize: 12, color: '#047857', fontWeight: '500' }}>
                Todos os logs de hoje estão preenchidos! Inteligência local com 100% de contexto.
              </span>
            </div>
          )}
        </GLPYCard>

        {/* ── SEÇÃO 4: SIMULADOR DE DADOS ────────────────────────────────────── */}
        <GLPYCard variant="light">
          <h3 style={{ margin: '0 0 10px 0', fontSize: 16, fontWeight: '700', color: lightColors.text.navy, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Sparkles size={18} color={lightColors.brand.greenDark} />
            Simular Inputs do Usuário
          </h3>

          {/* SIMULAR PESO */}
          <div style={{ borderBottom: '1px solid #F1F5F9', paddingBottom: 12, marginBottom: 12 }}>
            <span style={subtitleStyle}><Scale size={16} /> Registrar Peso Corporal</span>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                type="number"
                step="0.1"
                style={inputStyle}
                value={simWeight}
                onChange={e => setSimWeight(e.target.value)}
                placeholder="Ex: 78.5"
              />
              <GLPYButton variant="primary" size="sm" onClick={handleSaveWeight}>Gravar</GLPYButton>
            </div>
          </div>

          {/* SIMULAR ÁGUA */}
          <div style={{ borderBottom: '1px solid #F1F5F9', paddingBottom: 12, marginBottom: 12 }}>
            <span style={subtitleStyle}><Droplets size={16} /> Adicionar Água (Litros)</span>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                type="number"
                step="0.1"
                style={inputStyle}
                value={simWater}
                onChange={e => setSimWater(e.target.value)}
                placeholder="Ex: 0.5"
              />
              <GLPYButton variant="primary" size="sm" onClick={handleSaveWater}>Adicionar</GLPYButton>
            </div>
          </div>

          {/* SIMULAR REFEIÇÃO */}
          <div style={{ borderBottom: '1px solid #F1F5F9', paddingBottom: 12, marginBottom: 12 }}>
            <span style={subtitleStyle}><Utensils size={16} /> Registrar Refeição</span>
            <div style={flexFormStyle}>
              <input
                type="text"
                style={inputStyle}
                value={simMealName}
                onChange={e => setSimMealName(e.target.value)}
                placeholder="Nome do Prato / Alimento"
              />
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  type="number"
                  style={inputStyle}
                  value={simMealKcal}
                  onChange={e => setSimMealKcal(e.target.value)}
                  placeholder="Kcal"
                />
                <GLPYButton variant="primary" size="sm" onClick={handleSaveFood}>Salvar Refeição</GLPYButton>
              </div>
            </div>
          </div>

          {/* SIMULAR INJEÇÃO */}
          <div style={{ borderBottom: '1px solid #F1F5F9', paddingBottom: 12, marginBottom: 12 }}>
            <span style={subtitleStyle}><Syringe size={16} /> Registro de Injeção GLP-1</span>
            <div style={flexFormStyle}>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  type="text"
                  style={inputStyle}
                  value={simDose}
                  onChange={e => setSimDose(e.target.value)}
                  placeholder="Dose (ex: 0.25mg)"
                />
                <input
                  type="text"
                  style={inputStyle}
                  value={simLocal}
                  onChange={e => setSimLocal(e.target.value)}
                  placeholder="Local de aplicação"
                />
              </div>
              <GLPYButton variant="primary" size="sm" onClick={handleSaveInjection}>Registrar Injeção</GLPYButton>
            </div>
          </div>

          {/* SIMULAR SINTOMAS */}
          <div style={{ borderBottom: '1px solid #F1F5F9', paddingBottom: 12, marginBottom: 12 }}>
            <span style={subtitleStyle}><Activity size={16} /> Sintomas Reportados</span>
            <p style={{ margin: '0 0 6px 0', fontSize: 11, color: lightColors.text.secondary }}>Selecione para ligar/desligar sintomas:</p>
            <div style={buttonGrid}>
              {['Enjôo', 'Cansaço', 'Fraqueza', 'Constipação', 'Náusea', 'Dor de Cabeça'].map(s => {
                const active = selectedSymptoms.includes(s);
                return (
                  <button
                    key={s}
                    onClick={() => handleToggleSymptom(s)}
                    style={{
                      padding: '6px 8px',
                      borderRadius: 6,
                      border: '1px solid',
                      borderColor: active ? lightColors.brand.green : lightColors.border.soft,
                      backgroundColor: active ? `${lightColors.brand.green}18` : '#FFFFFF',
                      color: active ? lightColors.brand.greenDark : lightColors.text.navy,
                      fontSize: 11,
                      fontWeight: active ? '700' : '400',
                      cursor: 'pointer'
                    }}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
          </div>

          {/* SIMULAR HUMOR */}
          <div>
            <span style={subtitleStyle}><Smile size={16} /> Humor e Emoções</span>
            <div style={buttonGrid}>
              {['Animado', 'Focado', 'Cansado', 'Ansioso', 'Irritado'].map(e => {
                const active = selectedEmotion === e;
                return (
                  <button
                    key={e}
                    onClick={() => handleSelectEmotion(e)}
                    style={{
                      padding: '6px 8px',
                      borderRadius: 6,
                      border: '1px solid',
                      borderColor: active ? lightColors.brand.green : lightColors.border.soft,
                      backgroundColor: active ? `${lightColors.brand.green}18` : '#FFFFFF',
                      color: active ? lightColors.brand.greenDark : lightColors.text.navy,
                      fontSize: 11,
                      fontWeight: active ? '700' : '400',
                      cursor: 'pointer'
                    }}
                  >
                    {e}
                  </button>
                );
              })}
            </div>
          </div>

        </GLPYCard>

        {/* ── SEÇÃO 5: CONTEXTO DO PROMPT DO DEEPSEEK IA ────────────────────── */}
        <GLPYCard variant="light" style={{ backgroundColor: '#0F172A', border: 'none' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: '700', color: '#38BDF8', display: 'flex', alignItems: 'center', gap: 8 }}>
              <FileText size={18} color="#38BDF8" />
              Payload de Contexto Clínico para o Chat IA
            </h3>
            <GLPYButton
              variant="secondary"
              size="sm"
              onClick={handleCopyToClipboard}
              style={{
                backgroundColor: 'rgba(56, 189, 248, 0.1)',
                borderColor: 'rgba(56, 189, 248, 0.3)',
                color: '#38BDF8',
                padding: '4px 10px',
                fontSize: 12
              }}
            >
              <Copy size={12} style={{ marginRight: 4 }} />
              {copied ? 'Copiado!' : 'Copiar'}
            </GLPYButton>
          </div>
          <p style={{ margin: '4px 0 0 0', fontSize: 11, color: '#94A3B8' }}>
            Esta string abaixo representa exatamente o que a engine local monta e injeta como "System Prompt" ou instruções contextuais no ChatIA quando o usuário abre uma nova conversa.
          </p>
          <textarea
            readOnly
            style={promptBox}
            value={compiledPrompt}
          />
        </GLPYCard>

        {/* ── BOTÕES DE RESET/LIMPEZA ────────────────────────────────────────── */}
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: gap.medium }}>
          <button
            onClick={handleClearData}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 16px',
              backgroundColor: '#FEE2E2',
              color: '#EF4444',
              border: '1px solid #FCA5A5',
              borderRadius: radius.secondary,
              fontFamily: fontFamily.primary,
              fontSize: fontSize.small,
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#FCA5A5'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#FEE2E2'}
          >
            <RotateCcw size={15} />
            Limpar Logs e Testar Empty State
          </button>
        </div>

      </div>
    </GLPYScreen>
  );
}
