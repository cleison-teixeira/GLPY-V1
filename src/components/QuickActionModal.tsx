import { Shield, Sparkles, Users, ChefHat, Camera, ChevronRight } from "lucide-react";
import { useActiveProtocol } from "../hooks/useActiveProtocol";

const PROTOCOL_SCREEN_MAP: Record<string, string> = {
  'Sobrevivendo às Canetas': 'sobrevivendoCanetas',
  sobrevivendoCanetas:       'sobrevivendoCanetas',
  'Efeitos Colaterais':      'efeitosColaterais',
  efeitosColaterais:         'efeitosColaterais',
  'Anti-Queda Capilar':      'antiQuedaCabelo',
  antiQuedaCabelo:           'antiQuedaCabelo',
  'Anti-Rebote':             'antiRebote',
  antiRebote:                'antiRebote',
  'anti-rebote':             'antiRebote',
  'Psicologia Emagrecimento':'psicologiaEmagrecimento',
  psicologiaEmagrecimento:   'psicologiaEmagrecimento',
  'Alimentação Baixo Apetite':'alimentacaoBaixoApetite',
  alimentacaoBaixoApetite:   'alimentacaoBaixoApetite',
  'Não Perca Músculos':      'naoPerdaMusculos',
  naoPerdaMusculos:          'naoPerdaMusculos',
  'Energia Baixa':           'energiaBaixa',
  energiaBaixa:              'energiaBaixa',
  'Ajuste Metabólico':       'ajusteMetabolico',
  ajusteMetabolico:          'ajusteMetabolico',
  'Transição Parar':         'transicaoParar',
  transicaoParar:            'transicaoParar',
};

const PROTOCOL_ROUTE_MAP: Record<string, string> = {
  'Sobrevivendo às Canetas': '/preview/protocolo1',
  sobrevivendoCanetas:       '/preview/protocolo1',
  'Efeitos Colaterais':      '/preview/protocolo2',
  efeitosColaterais:         '/preview/protocolo2',
  'Anti-Queda Capilar':      '/preview/protocolo3',
  antiQuedaCabelo:           '/preview/protocolo3',
  'Anti-Rebote':             '/preview/protocolo4',
  antiRebote:                '/preview/protocolo4',
  'anti-rebote':             '/preview/protocolo4',
  'Psicologia Emagrecimento':'/preview/protocolo5',
  psicologiaEmagrecimento:   '/preview/protocolo5',
  'Alimentação Baixo Apetite':'/preview/protocolo6',
  alimentacaoBaixoApetite:   '/preview/protocolo6',
  'Não Perca Músculos':      '/preview/protocolo7',
  naoPerdaMusculos:          '/preview/protocolo7',
  'Energia Baixa':           '/preview/protocolo8',
  energiaBaixa:              '/preview/protocolo8',
  'Ajuste Metabólico':       '/preview/protocolo9',
  ajusteMetabolico:          '/preview/protocolo9',
  'Transição Parar':         '/preview/protocolo10',
  transicaoParar:            '/preview/protocolo10',
};

function hasActiveProtocol(): boolean {
  try {
    return (
      !!localStorage.getItem('glpy_protocol_day_today') ||
      !!localStorage.getItem('glpy_protocol_context') ||
      !!localStorage.getItem('glpy_protocolo_ativo')
    );
  } catch { return false; }
}

interface QuickActionModalProps {
  show: boolean;
  onClose: () => void;
  onNavigate?: (screen: string) => void;
  onToast?: (msg: string) => void;
}

export default function QuickActionModal({ show, onClose, onNavigate, onToast }: QuickActionModalProps) {
  const activeProtocol = useActiveProtocol();

  if (!show) return null;

  const nav = (screen: string, previewPath: string) => {
    onClose();
    if (onNavigate) { onNavigate(screen); }
    else { window.location.href = previewPath; }
  };

  const handleProtocol = () => {
    onClose();
    if (hasActiveProtocol()) {
      if (onNavigate) {
        onNavigate(PROTOCOL_SCREEN_MAP[activeProtocol.name] ?? 'antiRebote');
      } else {
        window.location.href = PROTOCOL_ROUTE_MAP[activeProtocol.name] ?? '/preview/protocolo4';
      }
    } else {
      onToast?.('Você ainda não iniciou um protocolo. Acesse o GLPY HUB para escolher.');
    }
  };

  return (
    <div
      className="fixed inset-0 bg-[#0A1628]/50 z-[200] flex flex-col justify-end"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-t-[28px] w-full max-w-[430px] mx-auto animate-slide-up-sheet"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-slate-200 rounded-full" />
        </div>
        <div className="px-6 pt-3 pb-4">
          <h2 className="text-base font-black text-[#0A1628]">O que você quer fazer agora?</h2>
          <p className="text-[11px] text-[#3D5A70] mt-0.5 leading-snug">Acesse rapidamente o que mais importa na sua jornada.</p>
        </div>
        <div className="px-4 pb-8 space-y-2">

          <button
            onClick={handleProtocol}
            className="w-full flex items-center gap-3.5 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-100/60 active:opacity-80 transition text-left"
          >
            <div className="w-11 h-11 rounded-xl bg-white border border-emerald-100/80 flex items-center justify-center shrink-0 shadow-sm">
              <Shield className="w-5 h-5 text-emerald-600 stroke-[2.2]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-extrabold text-[#0A1628] leading-tight">Protocolo em andamento</p>
              <p className="text-[11px] text-[#3D5A70] mt-0.5 leading-snug">Continue sua missão do dia</p>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300 shrink-0" />
          </button>

          <button
            onClick={() => nav('chatIA', '/preview/chat-ia')}
            className="w-full flex items-center gap-3.5 p-3.5 rounded-2xl bg-violet-50 border border-violet-100/60 active:opacity-80 transition text-left"
          >
            <div className="w-11 h-11 rounded-xl bg-white border border-violet-100/80 flex items-center justify-center shrink-0 shadow-sm">
              <Sparkles className="w-5 h-5 text-violet-600 stroke-[2.2]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-extrabold text-[#0A1628] leading-tight">GLPY IA</p>
              <p className="text-[11px] text-[#3D5A70] mt-0.5 leading-snug">Tire dúvidas com base na sua jornada</p>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300 shrink-0" />
          </button>

          <button
            onClick={() => nav('comunidade', '/preview/comunidade')}
            className="w-full flex items-center gap-3.5 p-3.5 rounded-2xl bg-blue-50 border border-blue-100/60 active:opacity-80 transition text-left"
          >
            <div className="w-11 h-11 rounded-xl bg-white border border-blue-100/80 flex items-center justify-center shrink-0 shadow-sm">
              <Users className="w-5 h-5 text-blue-500 stroke-[2.2]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-extrabold text-[#0A1628] leading-tight">Comunidade</p>
              <p className="text-[11px] text-[#3D5A70] mt-0.5 leading-snug">Acesse sua célula</p>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300 shrink-0" />
          </button>

          <button
            onClick={() => nav('recipes', '/preview/recipes')}
            className="w-full flex items-center gap-3.5 p-3.5 rounded-2xl bg-amber-50 border border-amber-100/60 active:opacity-80 transition text-left"
          >
            <div className="w-11 h-11 rounded-xl bg-white border border-amber-100/80 flex items-center justify-center shrink-0 shadow-sm">
              <ChefHat className="w-5 h-5 text-amber-600 stroke-[2.2]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-extrabold text-[#0A1628] leading-tight">Receitas</p>
              <p className="text-[11px] text-[#3D5A70] mt-0.5 leading-snug">Ideias alinhadas ao seu momento</p>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300 shrink-0" />
          </button>

          <button
            onClick={() => nav('fotoAnalise', '/preview/food-photo-analysis')}
            className="w-full flex items-center gap-3.5 p-3.5 rounded-2xl bg-pink-50 border border-pink-100/60 active:opacity-80 transition text-left"
          >
            <div className="w-11 h-11 rounded-xl bg-white border border-pink-100/80 flex items-center justify-center shrink-0 shadow-sm">
              <Camera className="w-5 h-5 text-pink-500 stroke-[2.2]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-extrabold text-[#0A1628] leading-tight">Foto do prato</p>
              <p className="text-[11px] text-[#3D5A70] mt-0.5 leading-snug">Analise sua refeição</p>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300 shrink-0" />
          </button>

        </div>
      </div>
    </div>
  );
}
