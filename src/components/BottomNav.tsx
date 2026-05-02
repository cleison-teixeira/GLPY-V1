
import { Home, List, Utensils, User } from "lucide-react";

interface BottomNavProps {
  active: string;
  onNavigate: (screen: string) => void;
}

export default function BottomNav({ active, onNavigate }: BottomNavProps) {
  const items = [
    { id: 'dashboard', name: 'Home', icon: Home },
    { id: 'protocolHub', name: 'Protocolos', icon: List },
    { id: 'recipes', name: 'Receitas', icon: Utensils },
    { id: 'perfil', name: 'Perfil', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-border p-4 flex justify-around z-50">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = active === item.id;
        return (
          <div
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`${isActive ? "text-primary font-bold" : "text-text-muted"} text-xs flex flex-col items-center gap-1 cursor-pointer`}
          >
            <Icon className="w-6 h-6" /> {item.name}
          </div>
        );
      })}
    </nav>
  );
}
