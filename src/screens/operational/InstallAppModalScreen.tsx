import { motion } from "motion/react";
import { Share, Plus, Home, Smartphone, CheckCircle2 } from "lucide-react";
import glpyLogoSymbol from '@/assets/logos/logo-symbol-light.png';
import glpyLogoLight from '@/assets/logos/logo-light.png';

interface Props {
  onInstall?: () => void;
  onGuide?: () => void;
  onDismiss?: () => void;
}

function StepRow({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-7 h-7 rounded-full bg-[#00C27A]/10 flex items-center justify-center shrink-0 mt-0.5">
        <span className="text-[#00C27A]">{icon}</span>
      </div>
      <p className="text-sm text-[#3D4A5C] leading-snug pt-0.5">{text}</p>
    </div>
  );
}

function PlatformBlock({
  title,
  icon,
  steps,
}: {
  title: string;
  icon: React.ReactNode;
  steps: { icon: React.ReactNode; text: string }[];
}) {
  return (
    <div className="bg-[#F4F8F6] rounded-2xl p-4 space-y-3">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-[#00C27A]">{icon}</span>
        <span className="text-xs font-bold text-[#0A1628] tracking-wide uppercase">{title}</span>
      </div>
      {steps.map((s, i) => (
        <StepRow key={i} icon={s.icon} text={s.text} />
      ))}
    </div>
  );
}

export default function InstallAppModalScreen({ onInstall, onGuide, onDismiss }: Props) {
  return (
    <div className="min-h-screen bg-[#0A1628]/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-6">
      <motion.div
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md bg-white rounded-t-[2rem] sm:rounded-3xl shadow-2xl overflow-hidden"
      >
        {/* Handle bar (mobile sheet feel) */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-[#D1D9E0]" />
        </div>

        <div className="px-6 pt-5 pb-8 space-y-5">

          {/* Header */}
          <div className="flex flex-col items-center text-center gap-3">
            <div className="w-16 h-16 rounded-[22px] bg-[#F0FBF6] border border-[#00C27A]/20 flex items-center justify-center shadow-sm">
              <img src={glpyLogoSymbol} alt="GLPY" className="w-10 h-10 object-contain" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-[#0A1628] leading-tight">
                Instale o GLPY no seu celular
              </h1>
              <p className="text-sm text-[#6B7A8D] mt-1.5 max-w-xs mx-auto leading-relaxed">
                Acesse sua jornada metabólica como um aplicativo, sem precisar procurar o link no navegador.
              </p>
            </div>
          </div>

          {/* Benefit badge */}
          <div className="flex items-center gap-2.5 bg-[#00C27A]/8 border border-[#00C27A]/20 rounded-xl px-4 py-3">
            <CheckCircle2 className="w-4 h-4 text-[#00C27A] shrink-0" />
            <p className="text-xs font-medium text-[#0A1628] leading-snug">
              O GLPY ficará como um app na tela inicial do seu celular.
            </p>
          </div>

          {/* iPhone block */}
          <PlatformBlock
            title="No iPhone"
            icon={<Smartphone className="w-4 h-4" />}
            steps={[
              { icon: <Share className="w-3.5 h-3.5" />, text: 'Toque no botão compartilhar (ícone de seta para cima)' },
              { icon: <Plus className="w-3.5 h-3.5" />,  text: 'Selecione "Adicionar à Tela de Início"' },
              { icon: <CheckCircle2 className="w-3.5 h-3.5" />, text: 'Confirme tocando em "Adicionar"' },
            ]}
          />

          {/* Android block */}
          <PlatformBlock
            title="No Android"
            icon={<Home className="w-4 h-4" />}
            steps={[
              { icon: <Plus className="w-3.5 h-3.5" />, text: 'Toque em "Instalar aplicativo" no menu do Chrome' },
              { icon: <Home className="w-3.5 h-3.5" />, text: 'Ou escolha "Adicionar à tela inicial"' },
              { icon: <CheckCircle2 className="w-3.5 h-3.5" />, text: 'Confirme a instalação' },
            ]}
          />

          {/* Logo wordmark subtle */}
          <div className="flex justify-center pt-1">
            <img src={glpyLogoLight} alt="GLPY" className="h-5 object-contain opacity-40" />
          </div>

          {/* Buttons */}
          <div className="space-y-3 pt-1">
            <button
              onClick={onInstall}
              className="w-full bg-[#00C27A] text-white font-bold py-4 rounded-2xl text-base shadow-lg shadow-[#00C27A]/25 hover:bg-[#00C27A]/90 active:scale-[0.98] transition-all"
            >
              Instalar GLPY
            </button>
            <button
              onClick={onGuide}
              className="w-full bg-[#F4F6F8] text-[#0A1628] font-semibold py-3.5 rounded-2xl text-sm hover:bg-[#E8EDF2] active:scale-[0.98] transition-all"
            >
              Ver passo a passo
            </button>
            <button
              onClick={onDismiss}
              className="w-full text-[#9AABB8] text-sm font-medium py-2 hover:text-[#6B7A8D] transition-colors"
            >
              Agora não
            </button>
          </div>

        </div>
      </motion.div>
    </div>
  );
}
