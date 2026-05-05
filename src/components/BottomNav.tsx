import { House, BookOpen, ChefHat, Users, UserCircle } from "lucide-react";

interface BottomNavProps {
  active: string;
  onNavigate: (screen: string) => void;
}

export default function BottomNav({ active, onNavigate }: BottomNavProps) {
  const items = [
    { id: "dashboard",   name: "Home",       icon: House },
    { id: "protocolHub", name: "Protocolos", icon: BookOpen },
    { id: "receitas",    name: "Receitas",   icon: ChefHat },
    { id: "comunidade",  name: "Comunidade", icon: Users },
    { id: "perfil",      name: "Perfil",     icon: UserCircle },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 flex justify-around z-50"
      style={{
        background: "#F0FAF5",
        borderTop: "2px solid #C8F0E0",
        padding: "10px 0 16px",
        boxShadow: "0 -4px 12px rgba(0,194,122,0.08)",
      }}
    >
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = active === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className="flex flex-col items-center flex-1"
            style={{ gap: 2 }}
          >
            <Icon style={{ width: 22, height: 22, color: isActive ? "#00C27A" : "#A0B8AF" }} />
            <div style={{ width: 4, height: 4, borderRadius: "50%", background: isActive ? "#00C27A" : "transparent" }} />
            <span
              style={{
                fontSize: 10,
                color: isActive ? "#00C27A" : "#A0B8AF",
                fontWeight: isActive ? 700 : 500,
                lineHeight: 1,
              }}
            >
              {item.name}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
