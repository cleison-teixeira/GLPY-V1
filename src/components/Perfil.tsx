import { useState, ChangeEvent } from "react";
import { motion } from "motion/react";
import { User, CreditCard, FileText, Settings, LogOut, ChevronRight, Camera, Upload } from "lucide-react";
import BottomNav from "./BottomNav";

export default function Perfil({ onNavigate }: { onNavigate: (screen: string) => void }) {
  const [profileImage, setProfileImage] = useState<string | null>(null);

  const handleImageUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const menuItems = [
    { icon: CreditCard, label: "Meu Plano (Plus)", action: () => {} },
    { icon: FileText, label: "PDF Médico", action: () => alert("Baixando PDF...") },
    { icon: Settings, label: "Configurações", action: () => {} },
  ];

  const defaultAvatar = "https://ui-avatars.com/api/?name=Cleison+I+Marketing&background=00C27A&color=fff&size=128";

  return (
    <div className="min-h-screen bg-background text-text-main p-6 pb-24">
      <h1 className="text-3xl font-bold mb-8">Perfil</h1>

      <div className="bg-white p-6 rounded-3xl shadow-sm border border-border mb-6 flex items-center gap-4">
        <div className="relative">
          <img 
            src={profileImage || defaultAvatar} 
            alt="Foto de perfil" 
            className="w-16 h-16 rounded-full object-cover border-4 border-primary/20"
          />
          <label htmlFor="upload-avatar" className="absolute -bottom-1 -right-1 bg-primary text-white p-1 rounded-full cursor-pointer hover:bg-primary/90">
            <Camera className="w-4 h-4" />
          </label>
          <input id="upload-avatar" type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
        </div>
        <div>
          <h2 className="font-bold text-lg">Cleison I Marketing</h2>
          <p className="text-text-muted text-sm">cleisonimarketing@gmail.com</p>
          <div className="flex gap-2 mt-1">
            <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-bold">Nível Avançado</span>
            <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded-full font-bold">Streak 🔥 12d</span>
          </div>
        </div>
      </div>

      <div className="grid gap-4">
        {menuItems.map((item, i) => (
          <button key={i} onClick={item.action} className="bg-white p-4 rounded-2xl shadow-sm border border-border flex items-center justify-between hover:bg-gray-50 transition">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-primary/10 rounded-xl text-primary">
                <item.icon className="w-6 h-6" />
              </div>
              <span className="font-medium">{item.label}</span>
            </div>
            <ChevronRight className="text-text-muted" />
          </button>
        ))}
      </div>

      <button className="w-full mt-8 p-4 text-red-500 font-bold flex items-center justify-center gap-2">
        <LogOut className="w-5 h-5" /> Sair da conta
      </button>

      <BottomNav active="dashboard" onNavigate={onNavigate} />
    </div>
  );
}
