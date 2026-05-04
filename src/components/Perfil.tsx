import { useState, ChangeEvent } from "react";
import {
  CreditCard, FileText, Settings, LogOut, ChevronRight,
  Camera, Flame, Zap, Award, Shield, Syringe, TrendingDown,
  RotateCcw, Calendar
} from "lucide-react";
import BottomNav from "./BottomNav";

export default function Perfil({ onNavigate }: { onNavigate: (screen: string) => void }) {
  const [profileImage, setProfileImage] = useState<string | null>(null);

  const handleImageUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setProfileImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const defaultAvatar = "https://ui-avatars.com/api/?name=Cleison&background=00C27A&color=fff&size=128";

  const stats = [
    { label: "Streak", value: "34", unit: "dias", icon: Flame, color: "text-orange-500", bg: "bg-orange-50" },
    { label: "Perdidos", value: "8.4", unit: "kg", icon: TrendingDown, color: "text-primary", bg: "bg-primary/8" },
    { label: "XP Total", value: "340", unit: "xp", icon: Zap, color: "text-amber-500", bg: "bg-amber-50" },
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
    action: () => onNavigate('planos'),
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
      action: () => alert("Gerando PDF...")
    },
    {
      icon: Settings,
      label: "Configurações",
      desc: "Notificações, privacidade",
      color: "bg-slate-50 text-slate-600",
      action: () => {}
    },
  ];

  return (
    <div className="min-h-screen bg-[#F4F6F8] text-text-main pb-24">

      {/* Header com avatar */}
      <div className="bg-white px-5 pt-12 pb-6 border-b border-border">
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
            <h1 className="font-bold text-lg leading-tight truncate">Cleison I Marketing</h1>
            <p className="text-text-muted text-xs truncate">cleisonimarketing@gmail.com</p>
            <div className="flex gap-1.5 mt-2 flex-wrap">
              <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold">Nível 3 · Adaptado</span>
              <span className="text-xs bg-orange-50 text-orange-600 px-2 py-0.5 rounded-full font-bold border border-orange-100">🔥 34 dias</span>
            </div>
          </div>
        </div>

        {/* Barra XP */}
        <div className="mt-4">
          <div className="flex justify-between text-xs text-text-muted mb-1.5">
            <span>340 XP · Nível 3</span>
            <span>160 XP para Nível 4</span>
          </div>
          <div className="w-full bg-[#F4F6F8] h-2 rounded-full overflow-hidden">
            <div className="bg-amber-400 h-full rounded-full" style={{ width: '68%' }} />
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
                  b.unlocked
                    ? 'bg-white border-border'
                    : 'bg-[#F4F6F8] border-transparent opacity-40'
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
              <ChevronRight className="w-4 h-4 text-text-muted flex-shrink-0" />
            </button>
          ))}
        </div>

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
        <button className="w-full p-4 text-red-500 font-semibold text-sm flex items-center justify-center gap-2 hover:bg-red-50 rounded-2xl transition">
          <LogOut className="w-4 h-4" />
          Sair da conta
        </button>

      </div>

      <BottomNav active="perfil" onNavigate={onNavigate} />
    </div>
  );
}
