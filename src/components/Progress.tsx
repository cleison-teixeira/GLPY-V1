import { motion } from "motion/react";
import { TrendingDown, Flame, Award } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import BottomNav from "./BottomNav";

const data = [
  { name: 'Abr 01', peso: 85 },
  { name: 'Abr 08', peso: 84.5 },
  { name: 'Abr 15', peso: 83.2 },
  { name: 'Abr 22', peso: 82.5 },
  { name: 'Abr 29', peso: 81.8 },
];

export default function Progress({ onNavigate }: { onNavigate: (screen: string) => void }) {
  return (
    <div className="min-h-screen bg-background text-text-main p-6 pb-24">
      <h1 className="text-3xl font-bold mb-6">Progresso</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-white p-4 rounded-3xl shadow-sm border border-border">
          <p className="text-sm text-text-muted">Total Perdido</p>
          <div className="flex items-center gap-2 text-primary">
            <TrendingDown className="w-6 h-6" />
            <span className="text-2xl font-bold">3.2 kg</span>
          </div>
        </div>
        <div className="bg-white p-4 rounded-3xl shadow-sm border border-border">
          <p className="text-sm text-text-muted">Streak Atual</p>
          <div className="flex items-center gap-2 text-amber-500">
            <Flame className="w-6 h-6" />
            <span className="text-2xl font-bold">12 dias</span>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-border mb-8">
        <h2 className="font-bold mb-4">Evolução do Peso</h2>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <XAxis dataKey="name" fontSize={12} />
              <YAxis domain={['auto', 'auto']} fontSize={12} />
              <Tooltip />
              <Line type="monotone" dataKey="peso" stroke="#00C27A" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Achievements CTA */}
      <div className="bg-primary/10 p-6 rounded-3xl border border-primary/20 flex items-center justify-between">
         <div>
            <h3 className="font-bold">Badges Conquistados</h3>
            <p className="text-sm text-text-muted">Você está indo muito bem!</p>
         </div>
         <Award className="w-10 h-10 text-primary" />
      </div>

      <BottomNav active="dashboard" onNavigate={onNavigate} />
    </div>
  );
}
