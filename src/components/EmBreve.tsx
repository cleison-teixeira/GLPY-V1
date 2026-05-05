import { ChevronLeft } from "lucide-react";

export default function EmBreve({ onNavigate }: { onNavigate: (screen: string) => void }) {
  return (
    <div className="min-h-screen bg-[#F4F6F8] text-text-main flex flex-col">

      {/* Header */}
      <div className="bg-white px-5 pt-12 pb-5 border-b border-border flex items-center gap-3">
        <button
          onClick={() => onNavigate('dashboard')}
          className="w-9 h-9 bg-[#F4F6F8] border border-border rounded-full flex items-center justify-center flex-shrink-0"
        >
          <ChevronLeft className="w-4 h-4 text-text-muted" />
        </button>
        <h1 className="font-black text-xl text-[#0A1628]">Em breve</h1>
      </div>

      {/* Conteúdo */}
      <div className="flex-grow flex items-center justify-center px-8">
        <div className="text-center max-w-sm">
          <div className="text-7xl mb-6">🚀</div>
          <h2 className="font-black text-2xl text-[#0A1628] mb-3">Funcionalidade em construção</h2>
          <p className="text-text-muted text-sm leading-relaxed mb-6">
            Estamos trabalhando para trazer essa funcionalidade para você em breve. Ela chegará como parte de uma atualização do GLPY.
          </p>
          <div className="bg-white border border-border rounded-2xl p-4 shadow-sm">
            <p className="text-xs font-bold text-primary mb-1">Em desenvolvimento</p>
            <p className="text-xs text-text-muted">Nossa equipe está construindo essa funcionalidade com cuidado para garantir a melhor experiência.</p>
          </div>
          <button
            onClick={() => onNavigate('dashboard')}
            className="mt-6 w-full bg-primary text-white font-bold py-3.5 rounded-2xl shadow-md"
          >
            Voltar para o início
          </button>
        </div>
      </div>
    </div>
  );
}
