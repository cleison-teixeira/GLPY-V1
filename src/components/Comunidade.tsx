import { Users, MessageCircle, ExternalLink } from "lucide-react";
import BottomNav from "./BottomNav";
import { GLPYHeader } from "./ui";

const COMMUNITY_URL = (import.meta.env.VITE_GLPY_COMMUNITY_WHATSAPP_URL as string | undefined) || '#';

export default function Comunidade({ onNavigate }: { onNavigate: (screen: string) => void }) {
  function handleJoin() {
    if (COMMUNITY_URL && COMMUNITY_URL !== '#') {
      window.open(COMMUNITY_URL, '_blank', 'noopener,noreferrer');
    }
  }

  return (
    <div className="min-h-screen bg-[#F4F6F8] text-text-main pb-24 flex flex-col max-w-[430px] mx-auto md:rounded-[40px] md:ring-1 md:ring-black/10 md:shadow-[0_24px_64px_rgba(0,0,0,0.14)] md:overflow-hidden">

      {/* Header */}
      <div className="bg-white px-5 pt-6 border-b border-border">
        <GLPYHeader
          title="Comunidade"
          subtitle="Conecte-se com quem vive o mesmo tratamento"
          showBranding={true}
          onBack={() => {
            const returnTo = sessionStorage.getItem('glpy_return_to');
            sessionStorage.removeItem('glpy_return_to');
            onNavigate(returnTo === 'hub' ? 'hub' : 'dashboard');
          }}
        />
      </div>

      {/* Conteúdo */}
      <div className="flex-grow flex flex-col items-center justify-center px-5 gap-4 py-8">

        {/* Card principal — WhatsApp */}
        <div className="bg-white border border-[#E2EBE7] rounded-3xl p-6 shadow-sm w-full max-w-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center justify-center shrink-0">
              <MessageCircle className="w-6 h-6 text-[#00C27A]" />
            </div>
            <div>
              <h2 className="font-black text-[15px] text-[#0A1628] leading-tight">Comunidade GLPY Fundadores</h2>
              <p className="text-[11px] text-[#3D5A70] font-medium mt-0.5">WhatsApp · Acesso exclusivo</p>
            </div>
          </div>

          <p className="text-sm text-[#3D5A70] leading-relaxed mb-5">
            Entre na Comunidade GLPY Fundadores para receber avisos, novidades, desafios e acompanhar a evolução do app junto com os primeiros usuários.
          </p>

          <button
            onClick={handleJoin}
            disabled={!COMMUNITY_URL || COMMUNITY_URL === '#'}
            className="w-full flex items-center justify-center gap-2 bg-[#00C27A] text-white font-extrabold text-sm py-3.5 rounded-2xl active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
          >
            <ExternalLink className="w-4 h-4" strokeWidth={2.5} />
            Entrar na comunidade
          </button>
        </div>

        {/* Card Células — em breve */}
        <div className="bg-white border border-[#E2EBE7] rounded-3xl p-5 shadow-sm w-full max-w-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-blue-50 border border-blue-100/80 rounded-xl flex items-center justify-center shrink-0">
              <Users className="w-5 h-5 text-blue-500" />
            </div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-[13px] text-[#0A1628]">Células GLPY</h3>
              <span className="text-[9px] font-bold text-[#00C27A] bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded-full uppercase tracking-wide">Em breve</span>
            </div>
          </div>
          <p className="text-[12px] text-[#3D5A70] leading-relaxed">
            As Células GLPY estão chegando. Enquanto isso, participe da Comunidade GLPY Fundadores no WhatsApp.
          </p>
        </div>

      </div>

      <BottomNav active="comunidade" onNavigate={onNavigate} />
    </div>
  );
}
