import { useState } from "react";
import InstallAppPrompt from "../../components/InstallAppPrompt";
import glpyLogoLight from '@/assets/logos/logo-light.png';

export default function InstallAppFunctionalScreen() {
  const [isOpen, setIsOpen] = useState(false);

  const status = localStorage.getItem('glpy_install_prompt_status') ?? 'none';
  const dismissedAt = localStorage.getItem('glpy_install_prompt_dismissed_at');
  const installedAt = localStorage.getItem('glpy_install_installed_at');

  return (
    <div className="min-h-screen bg-[#F4F6F8] flex flex-col items-center justify-center p-6 gap-6">

      <img src={glpyLogoLight} alt="GLPY" className="h-8 object-contain opacity-70" />

      <div className="bg-white rounded-3xl shadow-sm border border-border p-6 w-full max-w-sm space-y-4 text-center">
        <h1 className="text-lg font-extrabold text-[#0A1628]">Teste — Instalação PWA</h1>
        <p className="text-sm text-[#6B7A8D]">
          Clique no botão abaixo para abrir o modal funcional de instalação do GLPY.
        </p>

        <button
          onClick={() => setIsOpen(true)}
          className="w-full bg-[#00C27A] text-white font-bold py-4 rounded-2xl shadow-lg shadow-[#00C27A]/20 hover:bg-[#00C27A]/90 active:scale-[0.98] transition-all"
        >
          Abrir modal de instalação
        </button>
      </div>

      {/* Estado do localStorage */}
      <div className="bg-white rounded-2xl border border-border p-4 w-full max-w-sm space-y-2 text-xs font-mono text-[#3D4A5C]">
        <p className="text-[10px] font-bold uppercase text-[#9AABB8] tracking-wider mb-3">Estado localStorage</p>
        <div className="flex justify-between gap-2">
          <span className="text-[#9AABB8]">status</span>
          <span className="font-semibold text-[#0A1628] truncate">{status}</span>
        </div>
        {dismissedAt && (
          <div className="flex justify-between gap-2">
            <span className="text-[#9AABB8]">dismissed_at</span>
            <span className="font-semibold text-[#0A1628] truncate">
              {new Date(parseInt(dismissedAt)).toLocaleString('pt-BR')}
            </span>
          </div>
        )}
        {installedAt && (
          <div className="flex justify-between gap-2">
            <span className="text-[#9AABB8]">installed_at</span>
            <span className="font-semibold text-[#0A1628] truncate">
              {new Date(parseInt(installedAt)).toLocaleString('pt-BR')}
            </span>
          </div>
        )}
      </div>

      <button
        onClick={() => { window.location.href = '/preview/home-premium-v2'; }}
        className="text-sm text-[#9AABB8] hover:text-[#6B7A8D] transition-colors"
      >
        ← Voltar para Home
      </button>

      <InstallAppPrompt
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        source="preview-functional"
        ignoreSuppression={true}
      />
    </div>
  );
}
