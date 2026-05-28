import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Share, Plus, Home, Smartphone, CheckCircle2, Monitor } from "lucide-react";
import glpyLogoSymbol from '@/assets/logos/logo-symbol-light.png';
import glpyLogoLight from '@/assets/logos/logo-light.png';

// ─── Types ───────────────────────────────────────────────────────────────────

type Platform = 'ios' | 'android' | 'desktop' | 'standalone';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export interface InstallAppPromptProps {
  isOpen: boolean;
  onClose: () => void;
  source?: string;
  ignoreSuppression?: boolean;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function detectPlatform(): Platform {
  if (
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  ) {
    return 'standalone';
  }
  const ua = navigator.userAgent;
  if (/iphone|ipad|ipod/i.test(ua)) return 'ios';
  if (/macintosh/i.test(ua) && navigator.maxTouchPoints > 1) return 'ios';
  if (/android/i.test(ua)) return 'android';
  return 'desktop';
}

export function shouldSuppressInstallPrompt(): boolean {
  const status = localStorage.getItem('glpy_install_prompt_status');
  if (status === 'installed') return true;
  const dismissedAt = localStorage.getItem('glpy_install_prompt_dismissed_at');
  if (!dismissedAt) return false;
  const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
  return Date.now() - parseInt(dismissedAt, 10) < sevenDaysMs;
}

function saveStatus(status: string) {
  localStorage.setItem('glpy_install_prompt_status', status);
}

// ─── Sub-components ───────────────────────────────────────────────────────────

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
  highlighted = false,
}: {
  title: string;
  icon: React.ReactNode;
  steps: { icon: React.ReactNode; text: string }[];
  highlighted?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl p-4 space-y-3 transition-all duration-300 ${
        highlighted
          ? 'bg-[#00C27A]/8 border border-[#00C27A]/30 ring-1 ring-[#00C27A]/20'
          : 'bg-[#F4F8F6]'
      }`}
    >
      <div className="flex items-center gap-2 mb-1">
        <span className="text-[#00C27A]">{icon}</span>
        <span className="text-xs font-bold text-[#0A1628] tracking-wide uppercase">{title}</span>
        {highlighted && (
          <span className="ml-auto text-[10px] font-bold text-[#00C27A] bg-[#00C27A]/10 px-2 py-0.5 rounded-full">
            Seu dispositivo
          </span>
        )}
      </div>
      {steps.map((s, i) => (
        <StepRow key={i} icon={s.icon} text={s.text} />
      ))}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

type GlpyWindow = Window & { __glpyInstallPrompt?: Event };

export default function InstallAppPrompt({ isOpen, onClose }: InstallAppPromptProps) {
  const [platform] = useState<Platform>(() => detectPlatform());
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [highlightedBlock, setHighlightedBlock] = useState<Platform | null>(null);
  const capturedRef = useRef<BeforeInstallPromptEvent | null>(null);
  const iphoneRef  = useRef<HTMLDivElement>(null);
  const androidRef = useRef<HTMLDivElement>(null);
  const desktopRef = useRef<HTMLDivElement>(null);

  // Lê o prompt capturado globalmente (caso beforeinstallprompt tenha disparado antes do mount)
  // e também ouve novos disparos
  useEffect(() => {
    const globalPrompt = (window as GlpyWindow).__glpyInstallPrompt;
    if (globalPrompt) {
      capturedRef.current = globalPrompt as BeforeInstallPromptEvent;
      setDeferredPrompt(globalPrompt as BeforeInstallPromptEvent);
      console.log('[GLPY PWA] deferredPrompt recuperado do window');
    }

    function handleBeforeInstall(e: Event) {
      e.preventDefault();
      capturedRef.current = e as BeforeInstallPromptEvent;
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      (window as GlpyWindow).__glpyInstallPrompt = e;
      console.log('[GLPY PWA] beforeinstallprompt capturado pelo componente');
    }
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  // Track successful install
  useEffect(() => {
    function handleAppInstalled() {
      saveStatus('installed');
      localStorage.setItem('glpy_install_installed_at', String(Date.now()));
    }
    window.addEventListener('appinstalled', handleAppInstalled);
    return () => window.removeEventListener('appinstalled', handleAppInstalled);
  }, []);

  // ── Handlers ──────────────────────────────────────────────────────────────

  async function handleNativeInstall() {
    if (!deferredPrompt) return;
    console.log('[GLPY PWA] prompt() chamado');
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log('[GLPY PWA] userChoice:', outcome);
    if (outcome === 'accepted') {
      saveStatus('installed');
      localStorage.setItem('glpy_install_installed_at', String(Date.now()));
    } else {
      saveStatus('dismissed');
      localStorage.setItem('glpy_install_prompt_dismissed_at', String(Date.now()));
    }
    setDeferredPrompt(null);
    capturedRef.current = null;
    delete (window as GlpyWindow).__glpyInstallPrompt;
    onClose();
  }

  async function handlePrimaryAction() {
    if (platform === 'android') {
      await handleNativeInstall();
      return;
    }
    if (platform === 'ios') {
      handleShowSteps();
      saveStatus('instructed');
    }
  }

  function handleShowSteps() {
    const target = platform === 'ios' ? iphoneRef : platform === 'android' ? androidRef : desktopRef;
    setHighlightedBlock(platform);
    target.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    // Remove highlight after 2.5s
    setTimeout(() => setHighlightedBlock(null), 2500);
  }

  function handleDismiss() {
    saveStatus('dismissed');
    localStorage.setItem('glpy_install_prompt_dismissed_at', String(Date.now()));
    onClose();
  }

  // ── Standalone state ───────────────────────────────────────────────────────

  if (platform === 'standalone') {
    return (
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 bg-[#0A1628]/60 backdrop-blur-sm flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full text-center space-y-4"
            >
              <div className="w-16 h-16 rounded-[22px] bg-[#F0FBF6] border border-[#00C27A]/20 flex items-center justify-center mx-auto">
                <img src={glpyLogoSymbol} alt="GLPY" className="w-10 h-10 object-contain" />
              </div>
              <div>
                <h2 className="text-lg font-extrabold text-[#0A1628]">GLPY já está instalado</h2>
                <p className="text-sm text-[#6B7A8D] mt-1.5">
                  Você já adicionou o GLPY à tela inicial deste dispositivo.
                </p>
              </div>
              <button
                onClick={onClose}
                className="w-full bg-[#00C27A] text-white font-bold py-3.5 rounded-2xl shadow-lg shadow-[#00C27A]/25 hover:bg-[#00C27A]/90 transition-all"
              >
                Fechar
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    );
  }

  // ── Main modal ─────────────────────────────────────────────────────────────

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-[#0A1628]/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-6"
          onClick={(e) => { if (e.target === e.currentTarget) handleDismiss(); }}
        >
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 60 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-md bg-white rounded-t-[2rem] sm:rounded-3xl shadow-2xl overflow-hidden"
          >
            {/* Handle bar */}
            <div className="flex justify-center pt-3 pb-1 sm:hidden">
              <div className="w-10 h-1 rounded-full bg-[#D1D9E0]" />
            </div>

            <div className="px-6 pt-5 pb-8 space-y-5 overflow-y-auto max-h-[90dvh]">

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

              {/* Benefit badge — hidden on desktop */}
              {platform !== 'desktop' && (
                <div className="flex items-center gap-2.5 bg-[#00C27A]/8 border border-[#00C27A]/20 rounded-xl px-4 py-3">
                  <CheckCircle2 className="w-4 h-4 text-[#00C27A] shrink-0" />
                  <p className="text-xs font-medium text-[#0A1628] leading-snug">
                    O GLPY ficará como um app na tela inicial do seu celular.
                  </p>
                </div>
              )}

              {/* Desktop info block — replaces primary button */}
              {platform === 'desktop' && (
                <div className="bg-[#F4F8F6] border border-[#D1D9E0] rounded-2xl px-4 py-4 flex items-start gap-3">
                  <Monitor className="w-5 h-5 text-[#6B7A8D] shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-[#0A1628] mb-1">Abra o GLPY no celular</p>
                    <p className="text-xs text-[#6B7A8D] leading-relaxed">
                      Para adicionar o GLPY à tela inicial, acesse{' '}
                      <span className="font-semibold text-[#0A1628]">glpy.com.br</span>{' '}
                      pelo navegador do seu iPhone ou Android.
                    </p>
                  </div>
                </div>
              )}

              {/* iOS: só bloco iPhone */}
              {platform === 'ios' && (
                <div ref={iphoneRef}>
                  <PlatformBlock
                    title="NO IPHONE"
                    icon={<Smartphone className="w-4 h-4" />}
                    highlighted={highlightedBlock === 'ios'}
                    steps={[
                      { icon: <Share className="w-3.5 h-3.5" />, text: 'Toque no ícone de compartilhar no Safari' },
                      { icon: <Plus className="w-3.5 h-3.5" />,  text: 'Selecione "Adicionar à Tela de Início"' },
                      { icon: <CheckCircle2 className="w-3.5 h-3.5" />, text: 'Confirme tocando em "Adicionar"' },
                    ]}
                  />
                </div>
              )}

              {/* Android: bloco Android primeiro, sem bloco iPhone */}
              {platform === 'android' && (
                <div ref={androidRef}>
                  <PlatformBlock
                    title="NO ANDROID"
                    icon={<Home className="w-4 h-4" />}
                    highlighted={highlightedBlock === 'android'}
                    steps={[
                      { icon: <Plus className="w-3.5 h-3.5" />, text: 'Toque em "Instalar app" quando aparecer a opção no navegador' },
                      { icon: <Home className="w-3.5 h-3.5" />, text: 'Ou escolha "Adicionar à tela inicial"' },
                      { icon: <CheckCircle2 className="w-3.5 h-3.5" />, text: 'Confirme a instalação' },
                    ]}
                  />
                </div>
              )}

              {/* Desktop: ambos os blocos + bloco desktop */}
              {platform === 'desktop' && (
                <>
                  <div ref={iphoneRef}>
                    <PlatformBlock
                      title="NO IPHONE"
                      icon={<Smartphone className="w-4 h-4" />}
                      highlighted={highlightedBlock === 'ios'}
                      steps={[
                        { icon: <Share className="w-3.5 h-3.5" />, text: 'Toque no ícone de compartilhar no Safari' },
                        { icon: <Plus className="w-3.5 h-3.5" />,  text: 'Selecione "Adicionar à Tela de Início"' },
                        { icon: <CheckCircle2 className="w-3.5 h-3.5" />, text: 'Confirme tocando em "Adicionar"' },
                      ]}
                    />
                  </div>
                  <div ref={androidRef}>
                    <PlatformBlock
                      title="NO ANDROID"
                      icon={<Home className="w-4 h-4" />}
                      highlighted={highlightedBlock === 'android'}
                      steps={[
                        { icon: <Plus className="w-3.5 h-3.5" />, text: 'Toque em "Instalar app" quando aparecer a opção no navegador' },
                        { icon: <Home className="w-3.5 h-3.5" />, text: 'Ou escolha "Adicionar à tela inicial"' },
                        { icon: <CheckCircle2 className="w-3.5 h-3.5" />, text: 'Confirme a instalação' },
                      ]}
                    />
                  </div>
                  <div ref={desktopRef}>
                    <PlatformBlock
                      title="NO DESKTOP"
                      icon={<Monitor className="w-4 h-4" />}
                      highlighted={highlightedBlock === 'desktop'}
                      steps={[
                        { icon: <Smartphone className="w-3.5 h-3.5" />, text: 'Abra o GLPY no navegador do seu celular' },
                        { icon: <Plus className="w-3.5 h-3.5" />,        text: 'Siga as instruções do bloco iPhone ou Android acima' },
                        { icon: <CheckCircle2 className="w-3.5 h-3.5" />, text: 'O GLPY aparecerá na tela inicial do celular' },
                      ]}
                    />
                  </div>
                </>
              )}

              {/* Logo wordmark subtle */}
              <div className="flex justify-center pt-1">
                <img src={glpyLogoLight} alt="GLPY" className="h-5 object-contain opacity-40" />
              </div>

              {/* Buttons */}
              <div className="space-y-3 pt-1">

                {/* Android: botão nativo quando disponível */}
                {platform === 'android' && deferredPrompt && (
                  <button
                    onClick={handleNativeInstall}
                    className="w-full bg-[#00C27A] text-white font-bold py-4 rounded-2xl text-base shadow-lg shadow-[#00C27A]/25 hover:bg-[#00C27A]/90 active:scale-[0.98] transition-all"
                  >
                    Instalar GLPY
                  </button>
                )}

                {/* Android: alternativa manual — sempre visível */}
                {platform === 'android' && (
                  <div className="bg-[#F4F8F6] border border-[#D1D9E0] rounded-2xl px-4 py-4 flex items-start gap-3">
                    <Plus className="w-5 h-5 text-[#00C27A] shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-bold text-[#0A1628] mb-1">
                        {deferredPrompt ? 'Ou instale manualmente' : 'Como instalar manualmente'}
                      </p>
                      <p className="text-xs text-[#6B7A8D] leading-relaxed">
                        Toque nos <span className="font-semibold text-[#0A1628]">⋮ três pontos</span> do Chrome →{' '}
                        <span className="font-semibold text-[#0A1628]">Adicionar à tela inicial</span>
                      </p>
                    </div>
                  </div>
                )}

                {/* iOS: botão de instrução */}
                {platform === 'ios' && (
                  <button
                    onClick={handlePrimaryAction}
                    className="w-full bg-[#00C27A] text-white font-bold py-4 rounded-2xl text-base shadow-lg shadow-[#00C27A]/25 hover:bg-[#00C27A]/90 active:scale-[0.98] transition-all"
                  >
                    Ver como adicionar no iPhone
                  </button>
                )}

                {/* Secondary — iOS e Android */}
                {platform !== 'desktop' && (
                  <button
                    onClick={handleShowSteps}
                    className="w-full bg-[#F4F6F8] text-[#0A1628] font-semibold py-3.5 rounded-2xl text-sm hover:bg-[#E8EDF2] active:scale-[0.98] transition-all"
                  >
                    Ver passo a passo
                  </button>
                )}

                {/* Tertiary — always shown */}
                <button
                  onClick={handleDismiss}
                  className="w-full text-[#9AABB8] text-sm font-medium py-2 hover:text-[#6B7A8D] transition-colors"
                >
                  Agora não
                </button>
              </div>

            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
