import { motion } from "motion/react";
import { Zap, History, Calendar } from "lucide-react";
import BottomNav from "./BottomNav";

export default function Injecao({ onNavigate }: { onNavigate: (screen: string) => void }) {
  const historico = [
    { data: "28 Abr", local: "Abdomen" },
    { data: "21 Abr", local: "Coxa Esq" },
  ];
  
  const lastLocal = historico[0].local;

  return (
    <div className="min-h-screen bg-background text-text-main p-6 pb-24">
      <h1 className="text-3xl font-bold mb-6">Controle de Injeção</h1>

      {/* Próxima Dose */}
      <div className="bg-primary/10 p-6 rounded-3xl mb-6 border border-primary/20">
        <div className="flex items-center gap-3 mb-2">
          <Calendar className="text-primary" />
          <h2 className="font-bold text-lg">Próxima Dose</h2>
        </div>
        <p className="text-2xl font-bold text-primary">05 de Maio • 08:00</p>
      </div>

      {/* Mapa Corporal (Estilizado) */}
      <h2 className="font-bold mb-4">Locais de Aplicação</h2>
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-border mb-6 flex flex-col items-center gap-2">
        {/* Head */}
        <div className="w-12 h-12 rounded-full bg-border/30 mb-2"></div>
        {/* Torso/Abdomen */}
        <div className="flex gap-2">
           <div className="w-8 h-20 rounded-lg bg-border/30"></div>
           <button 
             onClick={() => alert("Abdomen selecionado")} 
             className={`w-20 h-20 rounded-2xl border-2 flex items-center justify-center transition ${lastLocal === 'Abdomen' ? 'bg-primary/50 border-primary' : 'bg-border/30 border-transparent'}`}
           />
           <div className="w-8 h-20 rounded-lg bg-border/30"></div>
        </div>
        {/* Legs */}
        <div className="flex gap-4 mt-2">
           <button 
             onClick={() => alert("Coxa Esq selecionada")} 
             className={`w-20 h-20 rounded-2xl border-2 flex items-center justify-center transition ${lastLocal === 'Coxa Esq' ? 'bg-primary/50 border-primary' : 'bg-border/30 border-transparent'}`}
           />
           <button 
             onClick={() => alert("Coxa Dir selecionada")} 
             className={`w-20 h-20 rounded-2xl border-2 flex items-center justify-center transition ${lastLocal === 'Coxa Dir' ? 'bg-primary/50 border-primary' : 'bg-border/30 border-transparent'}`}
           />
        </div>
      </div>

      {/* Histórico */}
      <h2 className="font-bold mb-4">Histórico</h2>
      <div className="grid gap-4">
        {[
          { data: "28 Abr", local: "Abdomen" },
          { data: "21 Abr", local: "Coxa Esq" },
        ].map((item, index) => (
          <div key={index} className="bg-white p-4 rounded-2xl shadow-sm border border-border flex justify-between">
            <span className="font-medium">{item.data}</span>
            <span className="text-text-muted">{item.local}</span>
          </div>
        ))}
      </div>

      <BottomNav active="dashboard" onNavigate={onNavigate} />
    </div>
  );
}
