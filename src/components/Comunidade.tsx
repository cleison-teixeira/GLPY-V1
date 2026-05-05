import { ChevronLeft, Users } from "lucide-react";
import BottomNav from "./BottomNav";

export default function Comunidade({ onNavigate }: { onNavigate: (screen: string) => void }) {
  return (
    <div className="min-h-screen bg-[#F4F6F8] text-text-main pb-24 flex flex-col">

      {/* Header */}
      <div className="bg-white px-5 pt-12 pb-5 border-b border-border flex items-center gap-3">
        <button
          onClick={() => onNavigate('dashboard')}
          className="w-9 h-9 bg-[#F4F6F8] border border-border rounded-full flex items-center justify-center flex-shrink-0"
        >
          <ChevronLeft className="w-4 h-4 text-text-muted" />
        </button>
        <div>
          <h1 className="font-black text-xl text-[#0A1628]">Comunidade GLPY</h1>
          <p className="text-xs text-text-muted">Conecte-se com quem vive o mesmo tratamento</p>
        </div>
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
