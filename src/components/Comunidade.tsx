import { Users } from "lucide-react";
import BottomNav from "./BottomNav";
import { GLPYHeader } from "./ui";

export default function Comunidade({ onNavigate }: { onNavigate: (screen: string) => void }) {
  return (
    <div className="min-h-screen bg-[#F4F6F8] text-text-main pb-24 flex flex-col max-w-[430px] mx-auto md:rounded-[40px] md:ring-1 md:ring-black/10 md:shadow-[0_24px_64px_rgba(0,0,0,0.14)] md:overflow-hidden">

      {/* Header Global */}
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

      {/* Conteúdo central */}
      <div className="flex-grow flex items-center justify-center px-8">
        <div className="bg-white border border-border rounded-3xl p-8 shadow-sm text-center w-full max-w-sm">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-5">
            <Users className="w-10 h-10 text-primary" />
          </div>
          <h2 className="font-black text-xl text-[#0A1628] mb-2">
            Em construção — chegando em breve 🚀
          </h2>
          <p className="text-sm text-text-muted leading-relaxed">
            Conecte-se com outras pessoas no mesmo tratamento. Troque experiências, conquistas e dicas reais.
          </p>
          <div className="mt-6 bg-primary/5 border border-primary/15 rounded-2xl p-4">
            <p className="text-xs text-primary font-bold">Seja o primeiro a saber</p>
            <p className="text-xs text-text-muted mt-1">A Comunidade GLPY está sendo construída. Você será notificado quando abrir.</p>
          </div>
        </div>
      </div>

      <BottomNav active="comunidade" onNavigate={onNavigate} />
    </div>
  );
}
