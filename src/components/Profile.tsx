import { User } from "lucide-react";
import BottomNav from "./BottomNav";

export default function Profile({ onNavigate }: { onNavigate: (screen: string) => void }) {
  return (
    <div id="perfil" className="min-h-screen bg-background text-text-main p-6 pb-24">
      <h1 className="text-3xl font-bold mb-8">Perfil</h1>
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-border">
          <p>Dados do perfil aqui...</p>
      </div>
      <BottomNav active="perfil" onNavigate={onNavigate} />
    </div>
  );
}
