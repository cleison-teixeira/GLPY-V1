
import { Home, List, Utensils, User, Users } from "lucide-react";

interface BottomNavProps {
  active: string;
  onNavigate: (screen: string) => void;
}

export default function BottomNav({ active, onNavigate }: BottomNavProps) {
  const items = [
    { id: 'dashboard',   name: 'Home',       icon: Home },
    { id: 'protocolHub', name: 'Protocolos', icon: List },
    { id: 'recipes',     name: 'Receitas',   icon: Utensils },
    { id: 'comunidade',  name: 'Comunidade', icon: Users },
    { id: 'perfil',      name: 'Perfil',     icon: User },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 flex justify-around z-50"
      style={{
        background: "#F8FAF9",
        borderTop: "1px solid #C8F0E0",
        padding: "10px 0 14px",
      }}
    >
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = active === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className="flex flex-col items-center gap-1 flex-1 transition-all"
            style={{ color: isActive ? "#00C27A" : "#A0B8B0" }}
          >
            <Icon className="w-5 h-5" />
            <span className={`text-[10px] font-${isActive ? "bold" : "medium"}`}>{item.name}</span>
          </button>
        );
      })}
    </nav>
  );
}
