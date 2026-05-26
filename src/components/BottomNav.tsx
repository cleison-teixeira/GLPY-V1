import { useState, useEffect } from "react";
import { Compass, LayoutGrid, Plus, LineChart } from "lucide-react";
import QuickActionModal from "./QuickActionModal";

function readGlpyProfilePhoto(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('glpy_profile_photo');
    if (!raw) return null;
    let base64 = '';
    if (raw.trim().startsWith('{')) {
      const parsed = JSON.parse(raw);
      base64 = parsed?.imageBase64 ?? '';
    } else {
      base64 = raw;
    }
    if (!base64) return null;
    return base64.startsWith('data:') ? base64 : `data:image/jpeg;base64,${base64}`;
  } catch {
    return null;
  }
}

interface BottomNavProps {
  active: string;
  onNavigate: (screen: string) => void;
}

export default function BottomNav({ active, onNavigate }: BottomNavProps) {
  const [showModal, setShowModal] = useState(false);

  const cls = (id: string) =>
    `flex flex-col items-center justify-center w-12 h-12 transition ${
      active === id ? "text-[#00C27A]" : "text-slate-400 hover:text-slate-600"
    }`;

  const handlePerfil = () => {
    sessionStorage.setItem("glpy_restore_tab", "perfil");
    onNavigate("dashboard");
  };

  const [profileImage, setProfileImage] = useState<string | null>(() => readGlpyProfilePhoto());

  useEffect(() => {
    function onUpdate() { setProfileImage(readGlpyProfilePhoto()); }
    window.addEventListener('local-storage-change', onUpdate);
    window.addEventListener('storage', onUpdate);
    return () => {
      window.removeEventListener('local-storage-change', onUpdate);
      window.removeEventListener('storage', onUpdate);
    };
  }, []);

  const sexo = (() => {
    try { return (localStorage.getItem("glpy_sexo") || "").trim(); } catch { return ""; }
  })();

  const ringClass = active === "perfil" ? "ring-2 ring-[#00C27A]" : "opacity-60";

  return (
    <>
      <nav
        className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-[#E2EBE7]"
        style={{
          boxShadow: "0 -4px 12px rgba(0,194,122,0.08)",
          paddingBottom: "env(safe-area-inset-bottom)"
        }}
      >
        <div className="max-w-[430px] mx-auto flex justify-between items-center h-[72px] px-6 py-2">
          <button className={cls("dashboard")} onClick={() => onNavigate("dashboard")}>
            <Compass className="w-5 h-5 stroke-[2.2]" />
            <span className="text-[9px] font-bold mt-1">Início</span>
          </button>

          <button className={cls("hub")} onClick={() => onNavigate("hub")}>
            <LayoutGrid className="w-5 h-5 stroke-[2.2]" />
            <span className="text-[9px] font-bold mt-1">HUB</span>
          </button>

          <button
            onClick={() => setShowModal(true)}
            className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#00C27A] to-[#00A38B] flex items-center justify-center text-white shadow-lg active:scale-95 transition -translate-y-2 cursor-pointer"
          >
            <Plus className="w-6 h-6 stroke-[2.8]" />
          </button>

          <button className={cls("progress")} onClick={() => onNavigate("progress")}>
            <LineChart className="w-5 h-5 stroke-[2.2]" />
            <span className="text-[9px] font-bold mt-1">Progresso</span>
          </button>

          <button className={cls("perfil")} onClick={handlePerfil}>
            {profileImage ? (
              <img
                src={profileImage}
                alt="Perfil"
                className={`w-5 h-5 rounded-full object-cover ${ringClass}`}
              />
            ) : sexo === "Feminino" ? (
              <svg width="20" height="20" viewBox="0 0 32 32" fill="none" className={`rounded-full ${ringClass}`}>
                <circle cx="16" cy="16" r="16" fill="#00C27A"/>
                {/* hair — arched, frames face */}
                <path d="M9.5 13C9.5 8 12.5 6 16 6C19.5 6 22.5 8 22.5 13C22 7.5 19.5 5.5 16 5.5C12.5 5.5 10 7.5 9.5 13Z" fill="white"/>
                {/* head */}
                <circle cx="16" cy="13.5" r="5" fill="white"/>
                {/* shoulders — narrower */}
                <path d="M6 28C6 22 10.5 19 16 19C21.5 19 26 22 26 28" fill="white"/>
              </svg>
            ) : sexo === "Masculino" ? (
              <svg width="20" height="20" viewBox="0 0 32 32" fill="none" className={`rounded-full ${ringClass}`}>
                <circle cx="16" cy="16" r="16" fill="#00C27A"/>
                {/* hair — flat/short top */}
                <path d="M10 12C10 8 12.5 6 16 6C19.5 6 22 8 22 12L22 9.5C22 7 19.5 5.5 16 5.5C12.5 5.5 10 7 10 9.5Z" fill="white" opacity="0.85"/>
                {/* head */}
                <circle cx="16" cy="13.5" r="5.5" fill="white"/>
                {/* shoulders — wider */}
                <path d="M4 28C4 21.5 9.5 18.5 16 18.5C22.5 18.5 28 21.5 28 28" fill="white"/>
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 32 32" fill="none" className={`rounded-full ${ringClass}`}>
                <circle cx="16" cy="16" r="16" fill="#00C27A"/>
                {/* head */}
                <circle cx="16" cy="13" r="5.5" fill="white"/>
                {/* shoulders — neutral width */}
                <path d="M5 28C5 21.5 10 18.5 16 18.5C22 18.5 27 21.5 27 28" fill="white"/>
              </svg>
            )}
            <span className="text-[9px] font-bold mt-1">Perfil</span>
          </button>
        </div>
      </nav>

      <QuickActionModal
        show={showModal}
        onClose={() => setShowModal(false)}
        onNavigate={onNavigate}
      />
    </>
  );
}
