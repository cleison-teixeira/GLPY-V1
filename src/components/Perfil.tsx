import { useState, useEffect, ChangeEvent } from "react";
import { signOut } from "firebase/auth";
import { auth } from "../firebase.js";
import { jsPDF } from "jspdf";
import {
  CreditCard, FileText, Settings, LogOut, ChevronLeft, ChevronRight,
  Camera, Flame, Zap, Award, Shield, Syringe, TrendingDown,
  RotateCcw, Calendar, Moon, Sun, Globe, ChevronDown
} from "lucide-react";
import BottomNav from "./BottomNav";
import glpyLogoLight from '@/assets/logos/logo-light.png';
import { glpyStore } from "../data/glpyStore";

export default function Perfil({ onNavigate }: { onNavigate: (screen: string) => void }) {
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [showConfig, setShowConfig] = useState(false);

  const [tema, setTema] = useState<'light' | 'dark'>(() =>
    (localStorage.getItem("glpy_tema") as 'light' | 'dark') || 'light'
  );
  const [idioma, setIdioma] = useState(() =>
    localStorage.getItem("glpy_idioma") || 'PT'
  );

  useEffect(() => {
    if (tema === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [tema]);

  const toggleTema = () => {
    const novo = tema === 'light' ? 'dark' : 'light';
    setTema(novo);
    localStorage.setItem("glpy_tema", novo);
  };

  const selecionarIdioma = (lang: string) => {
    setIdioma(lang);
    localStorage.setItem("glpy_idioma", lang);
  };

  const handleImageUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setProfileImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const generatePDF = () => {
    const onboarding = JSON.parse(localStorage.getItem("glpy_onboarding") || "{}");
    const streak = localStorage.getItem("glpy_streak") || "0";
    const checkinHoje = JSON.parse(localStorage.getItem("glpy_checkin_hoje") || "{}");
    const historico: Array<Record<string, unknown>> = JSON.parse(
      localStorage.getItem("glpy_checkin_historico") || "[]"
    );
    const protocolo = glpyStore.protocol.getActive() ?? { nome: "Anti-Rebote", emoji: "⚖️" };

    const today = new Date().toLocaleDateString('pt-BR');
    const glpyU = JSON.parse(localStorage.getItem("glpy_user") || "{}");
    const nome = (glpyU.displayName as string) || (onboarding.nome as string) || "Usuário GLPY";
    const medicamento = (onboarding.medicamento as string) || "GLP-1";
    const dose = (onboarding.dose as string) || "";
    const tempo = (onboarding.tempo as string) || "N/A";
    const peso = (onboarding.peso_atual as string) || "N/A";
    const protocloNome = (protocolo.nome as string) || "Anti-Rebote";

    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    const W = doc.internal.pageSize.width;

    // ── Cabeçalho ──
    doc.setFillColor(0, 194, 122);
    doc.rect(0, 0, W, 30, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("GLPY", 14, 19);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text("Relatório Médico — Acompanhamento GLP-1", 40, 14);
    doc.text(`Gerado em ${today}`, 40, 22);

    // ── Dados do paciente ──
    doc.setTextColor(10, 22, 40);
    let y = 42;
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.text("Dados do Paciente", 14, y); y += 7;

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setFillColor(248, 250, 249);
    doc.rect(14, y, W - 28, 30, 'F');
    doc.setDrawColor(226, 235, 231);
    doc.rect(14, y, W - 28, 30, 'S');
    y += 6;
    doc.text(`Nome:`, 18, y); doc.setFont("helvetica", "bold"); doc.text(nome, 40, y); doc.setFont("helvetica", "normal");
    y += 6;
    doc.text(`Medicamento:`, 18, y); doc.setFont("helvetica", "bold"); doc.text(`${medicamento} ${dose}`.trim(), 50, y); doc.setFont("helvetica", "normal");
    y += 6;
    doc.text(`Período de uso:`, 18, y); doc.setFont("helvetica", "bold"); doc.text(tempo, 55, y); doc.setFont("helvetica", "normal");
    y += 6;
    doc.text(`Peso atual:`, 18, y); doc.setFont("helvetica", "bold"); doc.text(`${peso} kg`, 45, y); doc.setFont("helvetica", "normal");
    y += 10;

    // ── Desempenho ──
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.text("Desempenho no App", 14, y); y += 7;

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    const xpPDF = parseInt(localStorage.getItem("glpy_xp") || "0", 10);
    const nivelPDF = xpPDF < 100 ? 1 : xpPDF < 300 ? 2 : xpPDF < 600 ? 3 : xpPDF < 1000 ? 4 : 5;
    const nivelNomesPDF = ["", "Iniciante", "Explorando", "Adaptado", "Avançado", "Mestre"];
    const stats = [
      { label: "Streak atual", value: `${streak} dias consecutivos` },
      { label: "XP Total", value: `${xpPDF} XP — Nível ${nivelPDF} (${nivelNomesPDF[nivelPDF]})` },
      { label: "Protocolo ativo", value: protocloNome },
      { label: "Badges desbloqueados", value: "3 de 6" },
    ];
    stats.forEach(s => {
      doc.text(`• ${s.label}:`, 18, y);
      doc.setFont("helvetica", "bold");
      doc.text(s.value, 60, y);
      doc.setFont("helvetica", "normal");
      y += 6;
    });
    y += 4;

    // ── Tabela check-ins ──
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.text("Histórico de Check-ins (últimos 7 dias)", 14, y); y += 7;

    // Header da tabela
    doc.setFillColor(10, 22, 40);
    doc.rect(14, y, W - 28, 8, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    const cols = [14, 52, 82, 112, 150];
    ["Data", "Fome", "Energia", "Peso", "Sintomas"].forEach((h, i) => {
      doc.text(h, cols[i] + 2, y + 5.5);
    });
    y += 10;
    doc.setTextColor(10, 22, 40);
    doc.setFont("helvetica", "normal");

    const rows: Array<{ data: string; fome: string; energia: string; peso: string; sintomas: string }> = [];

    if (historico.length > 0) {
      historico.slice(0, 7).forEach((h) => {
        rows.push({
          data: (h.data as string) || today,
          fome: h.fome !== undefined ? `${h.fome}/10` : "—",
          energia: h.energia !== undefined ? `${h.energia}/10` : "—",
          peso: (h.peso as string) || "—",
          sintomas: Array.isArray(h.sintomas) ? (h.sintomas as string[]).join(", ") || "Nenhum" : "—",
        });
      });
    } else if (checkinHoje.fome !== undefined) {
      rows.push({
        data: today,
        fome: `${checkinHoje.fome}/10`,
        energia: `${checkinHoje.energia}/10`,
        peso: `${peso} kg`,
        sintomas: Array.isArray(checkinHoje.sintomas) ? (checkinHoje.sintomas as string[]).join(", ") || "Nenhum" : "Nenhum",
      });
    }

    if (rows.length === 0) {
      doc.setTextColor(120, 120, 120);
      doc.text("Nenhum check-in registrado ainda. Use o app diariamente para preencher este relatório.", 18, y);
      doc.setTextColor(10, 22, 40);
      y += 8;
    } else {
      rows.forEach((r, i) => {
        if (i % 2 === 0) {
          doc.setFillColor(248, 250, 249);
          doc.rect(14, y - 4, W - 28, 7, 'F');
        }
        doc.setFontSize(8);
        doc.text(r.data.slice(0, 12), cols[0] + 2, y);
        doc.text(r.fome, cols[1] + 2, y);
        doc.text(r.energia, cols[2] + 2, y);
        doc.text(r.peso.toString().slice(0, 8), cols[3] + 2, y);
        doc.text(r.sintomas.slice(0, 28), cols[4] + 2, y);
        y += 7;
      });
    }
    y += 6;

    // ── Gráfico ASCII progresso ──
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(10, 22, 40);
    doc.text("Progresso de Adesão", 14, y); y += 7;

    doc.setFontSize(8);
    doc.setFont("courier", "normal");
    const streakN = Math.min(parseInt(streak), 30);
    const streakBar = "#".repeat(streakN) + "-".repeat(30 - streakN);
    const xpN = Math.min(Math.floor(xpPDF / 17), 30);
    const xpBar = "#".repeat(xpN) + "-".repeat(30 - xpN);
    doc.text(`Streak  [${streakBar}] ${streak} dias`, 14, y); y += 6;
    doc.text(`XP      [${xpBar}] ${xpPDF} XP (Nivel ${nivelPDF})`, 14, y); y += 10;

    // ── Observações médicas ──
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("Observações para o médico:", 14, y); y += 6;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(60, 90, 112);
    const obs = [
      `• Paciente em uso de ${medicamento} ${dose} há ${tempo}.`,
      `• Streak de adesão ao protocolo: ${streak} dias consecutivos.`,
      "• Acompanhamento realizado via app GLPY com check-ins diários.",
      "• Protocolo nutricional e comportamental integrado ao tratamento.",
    ];
    obs.forEach(o => { doc.text(o, 14, y); y += 5; });

    // ── Rodapé ──
    const pH = doc.internal.pageSize.height;
    doc.setDrawColor(0, 194, 122);
    doc.line(14, pH - 18, W - 14, pH - 18);
    doc.setFontSize(7);
    doc.setTextColor(100, 100, 100);
    doc.setFont("helvetica", "italic");
    doc.text(`Gerado pelo GLPY em ${today} · Este relatório é apenas informativo. Consulte seu médico para avaliação clínica.`, 14, pH - 11);
    doc.text("GLPY — Acompanhamento Inteligente de GLP-1", 14, pH - 6);

    const nomeClean = nome.replace(/\s+/g, '-').toLowerCase().slice(0, 20);
    const dateClean = today.replace(/\//g, '-');
    doc.save(`GLPY-Relatorio-${nomeClean}-${dateClean}.pdf`);
  };

  const glpyUser = JSON.parse(localStorage.getItem("glpy_user") || "{}");
  const nomeCompleto = (glpyUser.displayName as string) || "Usuário GLPY";
  const emailUsuario = (glpyUser.email as string) || "";
  const primeiroNome = nomeCompleto.split(" ")[0];

  const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(primeiroNome)}&background=00C27A&color=fff&size=128`;

  const streakAtual = localStorage.getItem("glpy_streak") || "0";
  const xpTotalN = parseInt(localStorage.getItem("glpy_xp") || "0", 10);
  const nivel = xpTotalN < 100 ? 1 : xpTotalN < 300 ? 2 : xpTotalN < 600 ? 3 : xpTotalN < 1000 ? 4 : 5;
  const nivelNomes = ["", "Iniciante", "Explorando", "Adaptado", "Avançado", "Mestre"];
  const xpProxNivel = [100, 300, 600, 1000, Infinity];
  const xpAtualNivel = [0, 100, 300, 600, 1000][nivel - 1];
  const xpFaltam = nivel < 5 ? xpProxNivel[nivel - 1] - xpTotalN : 0;
  const xpPct = nivel < 5
    ? Math.round(((xpTotalN - xpAtualNivel) / (xpProxNivel[nivel - 1] - xpAtualNivel)) * 100)
    : 100;

  const onboardingData = JSON.parse(localStorage.getItem("glpy_onboarding") || "{}");
  const pesoAtual = parseFloat((onboardingData.peso_atual as string) || "0");
  const pesoInicial = parseFloat((onboardingData.peso_inicial as string) || "0");
  const kgPerdidos = pesoInicial > pesoAtual && pesoInicial > 0
    ? (pesoInicial - pesoAtual).toFixed(1)
    : "0";

  const stats = [
    { label: "Streak", value: streakAtual, unit: "dias", icon: Flame, color: "text-orange-500", bg: "bg-orange-50" },
    { label: "Perdidos", value: kgPerdidos, unit: "kg", icon: TrendingDown, color: "text-primary", bg: "bg-primary/8" },
    { label: "XP Total", value: String(xpTotalN), unit: "xp", icon: Zap, color: "text-amber-500", bg: "bg-amber-50" },
    { label: "Badges", value: "3", unit: "itens", icon: Award, color: "text-violet-500", bg: "bg-violet-50" },
  ];

  const badges = [
    { emoji: "🔥", name: "Primeira Semana", unlocked: true },
    { emoji: "💪", name: "Proteína em Dia", unlocked: true },
    { emoji: "📸", name: "Fotógrafo Fit", unlocked: true },
    { emoji: "⚖️", name: "Anti-Rebote", unlocked: false },
    { emoji: "💇", name: "Cabelo Salvo", unlocked: false },
    { emoji: "🏆", name: "Mestre GLP-1", unlocked: false },
  ];

  const menuItems = [
    {
      icon: CreditCard,
      label: "Meu Plano",
      desc: "Plus · R$59,90/mês",
      color: "bg-violet-50 text-violet-600",
      action: () => onNavigate('planos')
    },
    {
      icon: Syringe,
      label: "Meu Tratamento",
      desc: "Mounjaro 5mg · Semana 6",
      color: "bg-sky-50 text-sky-600",
      action: () => onNavigate('injecao')
    },
    {
      icon: Calendar,
      label: "Receita ANVISA",
      desc: "52 dias restantes",
      color: "bg-amber-50 text-amber-600",
      action: () => onNavigate('contadorReceita')
    },
    {
      icon: RotateCcw,
      label: "Protocolo Anti-Rebote",
      desc: "Bloqueado · Plano Pro",
      color: "bg-emerald-50 text-emerald-600",
      action: () => onNavigate('antiRebote')
    },
    {
      icon: FileText,
      label: "Relatório PDF para Médico",
      desc: "Baixar histórico completo",
      color: "bg-rose-50 text-rose-600",
      action: generatePDF
    },
    {
      icon: Settings,
      label: "Configurações",
      desc: showConfig ? "Fechar configurações" : "Tema, idioma, notificações",
      color: "bg-slate-50 text-slate-600",
      action: () => setShowConfig(v => !v)
    },
  ];

  const idiomas = [
    { code: 'PT', flag: '🇧🇷', nome: 'Português' },
    { code: 'ES', flag: '🇪🇸', nome: 'Español' },
    { code: 'EN', flag: '🇺🇸', nome: 'English' },
  ];

  return (
    <div className="min-h-screen max-w-[430px] mx-auto bg-[#F4F6F8] text-text-main pb-24 relative shadow-sm">

      {/* Header com avatar */}
      <div className="bg-white px-5 pt-6 pb-6 border-b border-border">
        <div className="mb-6">
          <img src={glpyLogoLight} alt="GLPY" className="w-[84px] h-auto object-contain" />
        </div>
        <div className="flex items-center gap-4">
          <div className="relative flex-shrink-0">
            <img
              src={profileImage || defaultAvatar}
              alt="Avatar"
              className="w-16 h-16 rounded-full object-cover border-2 border-primary/20"
            />
            <label
              htmlFor="upload-avatar"
              className="absolute -bottom-1 -right-1 bg-primary text-white p-1.5 rounded-full cursor-pointer hover:bg-primary/90 transition"
            >
              <Camera className="w-3 h-3" />
            </label>
            <input id="upload-avatar" type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
          </div>
          <div className="flex-grow min-w-0">
            <h1 className="font-bold text-lg leading-tight truncate">{nomeCompleto}</h1>
            <p className="text-text-muted text-xs truncate">{emailUsuario}</p>
            <div className="flex gap-1.5 mt-2 flex-wrap">
              <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold">Nível {nivel} · {nivelNomes[nivel]}</span>
              <span className="text-xs bg-orange-50 text-orange-600 px-2 py-0.5 rounded-full font-bold border border-orange-100">🔥 {streakAtual} dias</span>
            </div>
          </div>
        </div>

        {/* Barra XP */}
        <div className="mt-4">
          <div className="flex justify-between text-xs text-text-muted mb-1.5">
            <span>{xpTotalN} XP · Nível {nivel}</span>
            <span>{nivel < 5 ? `${xpFaltam} XP para Nível ${nivel + 1}` : "Nível máximo!"}</span>
          </div>
          <div className="w-full bg-[#F4F6F8] h-2 rounded-full overflow-hidden">
            <div className="bg-amber-400 h-full rounded-full" style={{ width: `${xpPct}%` }} />
          </div>
        </div>
      </div>

      <div className="px-5 pt-5 space-y-5">

        {/* Stats 4 cards */}
        <div className="grid grid-cols-4 gap-2">
          {stats.map(s => (
            <div key={s.label} className="bg-white border border-border rounded-2xl p-3 flex flex-col items-center shadow-sm">
              <div className={`w-8 h-8 ${s.bg} rounded-xl flex items-center justify-center mb-1.5`}>
                <s.icon className={`w-4 h-4 ${s.color}`} fill={s.label === 'Streak' ? 'currentColor' : 'none'} />
              </div>
              <span className="font-black text-base text-text-main leading-none">{s.value}</span>
              <span className="text-xs text-text-muted mt-0.5">{s.unit}</span>
            </div>
          ))}
        </div>

        {/* Badges */}
        <div className="bg-white border border-border rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-bold text-text-muted uppercase tracking-wide">Conquistas</p>
            <span className="text-xs text-primary font-semibold">3/6 desbloqueados</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {badges.map(b => (
              <div
                key={b.name}
                className={`flex flex-col items-center p-3 rounded-xl border text-center transition-all ${
                  b.unlocked ? 'bg-white border-border' : 'bg-[#F4F6F8] border-transparent opacity-40'
                }`}
              >
                <span className="text-2xl mb-1">{b.emoji}</span>
                <span className="text-xs font-medium text-text-muted leading-tight">{b.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Menu */}
        <div className="space-y-2">
          <p className="text-xs font-bold text-text-muted uppercase tracking-wide mb-3">Minha conta</p>
          {menuItems.map((item, i) => (
            <button
              key={i}
              onClick={item.action}
              className="w-full bg-white border border-border rounded-2xl p-4 flex items-center gap-3 shadow-sm hover:border-primary/20 transition text-left"
            >
              <div className={`w-10 h-10 ${item.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                <item.icon className="w-5 h-5" />
              </div>
              <div className="flex-grow min-w-0">
                <p className="font-semibold text-sm text-text-main">{item.label}</p>
                <p className="text-xs text-text-muted truncate">{item.desc}</p>
              </div>
              {item.label === "Configurações"
                ? <ChevronDown className={`w-4 h-4 text-text-muted flex-shrink-0 transition-transform ${showConfig ? 'rotate-180' : ''}`} />
                : <ChevronRight className="w-4 h-4 text-text-muted flex-shrink-0" />
              }
            </button>
          ))}
        </div>

        {/* Painel de Configurações — expande ao clicar */}
        {showConfig && (
          <div className="bg-white border border-border rounded-2xl p-5 shadow-sm space-y-5">
            <p className="text-xs font-bold text-text-muted uppercase tracking-wide">Configurações</p>

            {/* Dark / Light mode */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-slate-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  {tema === 'dark'
                    ? <Moon className="w-4 h-4 text-slate-600" />
                    : <Sun className="w-4 h-4 text-amber-500" />
                  }
                </div>
                <div>
                  <p className="text-sm font-semibold text-text-main">
                    {tema === 'dark' ? 'Modo escuro ativo' : 'Modo claro ativo'}
                  </p>
                  <p className="text-xs text-text-muted">
                    {tema === 'dark' ? 'Toque para modo claro' : 'Toque para modo escuro'}
                  </p>
                </div>
              </div>
              {/* Toggle switch */}
              <button
                onClick={toggleTema}
                className={`w-12 h-6 rounded-full transition-colors relative flex-shrink-0 ${
                  tema === 'dark' ? 'bg-primary' : 'bg-border'
                }`}
              >
                <span
                  className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                    tema === 'dark' ? 'translate-x-6' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>

            {/* Idioma */}
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 bg-slate-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Globe className="w-4 h-4 text-slate-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-text-main">Idioma</p>
                  <p className="text-xs text-text-muted">Selecione o idioma do app</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {idiomas.map(lang => (
                  <button
                    key={lang.code}
                    onClick={() => selecionarIdioma(lang.code)}
                    className={`p-3 rounded-xl border-2 text-center transition-all ${
                      idioma === lang.code
                        ? 'border-primary bg-primary/5'
                        : 'border-border bg-[#F4F6F8]'
                    }`}
                  >
                    <div className="text-xl mb-1">{lang.flag}</div>
                    <p className={`text-xs font-bold ${idioma === lang.code ? 'text-primary' : 'text-text-muted'}`}>
                      {lang.code}
                    </p>
                    <p className="text-xs text-text-muted leading-tight">{lang.nome}</p>
                  </button>
                ))}
              </div>
              {idioma !== 'PT' && (
                <p className="text-xs text-amber-600 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2 mt-3">
                  ⚠️ Tradução completa em breve. O idioma está salvo e será aplicado na próxima versão.
                </p>
              )}
            </div>
          </div>
        )}

        {/* Plano atual */}
        <div className="bg-primary/5 border border-primary/15 rounded-2xl p-4">
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-primary flex-shrink-0" />
            <div className="flex-grow">
              <p className="font-bold text-sm text-primary">Plano Plus ativo</p>
              <p className="text-xs text-text-muted">Próxima cobrança: 15/Mai/2026 · R$59,90</p>
            </div>
            <button
              onClick={() => onNavigate('planos')}
              className="text-xs font-bold text-primary border border-primary/30 px-3 py-1.5 rounded-full hover:bg-primary hover:text-white transition"
            >
              Upgrade
            </button>
          </div>
        </div>

        {/* Sair */}
        <button
          onClick={async () => {
            await signOut(auth);
            localStorage.removeItem("glpy_user");
          }}
          className="w-full p-4 text-red-500 font-semibold text-sm flex items-center justify-center gap-2 hover:bg-red-50 rounded-2xl transition"
        >
          <LogOut className="w-4 h-4" />
          Sair da conta
        </button>

      </div>

      <BottomNav active="perfil" onNavigate={onNavigate} />
    </div>
  );
}
