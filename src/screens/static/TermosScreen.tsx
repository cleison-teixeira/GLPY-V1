import type { ReactNode } from 'react';

export default function TermosScreen() {
  return (
    <div className="min-h-screen bg-[#F4F8F6] flex flex-col items-center px-4 py-10">
      <div className="w-full max-w-xl bg-white rounded-3xl shadow-sm border border-[#E2EBE7] p-6 space-y-6">

        <div className="text-center space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#00C27A]">GLPY</span>
          <h1 className="text-2xl font-extrabold text-[#0A1628]">Termos de Uso</h1>
          <p className="text-xs text-slate-400">Atualizado em maio de 2026</p>
        </div>

        <Section title="1. O que é o GLPY">
          O GLPY é uma plataforma de apoio, educação, organização e acompanhamento de rotina para pessoas em jornada de emagrecimento e/ou uso de medicamentos GLP-1. Nosso objetivo é ajudar você a manter consistência, organizar informações e navegar pela sua jornada com mais clareza e segurança.
        </Section>

        <Section title="2. Não substituição profissional">
          O GLPY <strong>não substitui</strong> consulta médica, nutricional, psicológica ou qualquer acompanhamento profissional de saúde. Todas as informações, protocolos, sugestões e conteúdos do app têm caráter educativo e de apoio comportamental.{"\n\n"}
          Siga sempre as orientações do seu médico ou profissional de saúde responsável. Nunca inicie, suspenda, ajuste ou troque medicação, dose ou tratamento com base apenas no GLPY.
        </Section>

        <Section title="3. Uso educativo e comportamental">
          Protocolos, lembretes, checklists, IA, sugestões alimentares e de rotina são recursos educativos e de apoio comportamental. Não representam prescrição médica, nutricional ou terapêutica.
        </Section>

        <Section title="4. Responsabilidade do usuário">
          Você é responsável pelas suas decisões de saúde. O GLPY fornece suporte informativo e organizacional. Em caso de dúvidas sobre seu tratamento, sintomas ou saúde, consulte seu profissional de saúde.
        </Section>

        <Section title="5. Emergências">
          Em situações de sintomas graves, reações adversas importantes, piora clínica ou qualquer urgência de saúde, procure atendimento médico imediatamente. Não use o GLPY como substituto de serviço de emergência.
        </Section>

        <Section title="6. Planos e acesso">
          O acesso ao GLPY varia conforme o plano contratado. Pagamentos e assinaturas são processados pela plataforma HeroSpark. Dúvidas sobre sua assinatura ou cobrança devem ser direcionadas ao suporte via WhatsApp disponível no app.
        </Section>

        <Section title="7. Dados e privacidade">
          O uso dos seus dados pessoais é regido pela nossa{" "}
          <a href="/privacidade" className="text-[#00C27A] font-semibold underline">Política de Privacidade</a>.
          Recomendamos a leitura para entender como coletamos, usamos e protegemos suas informações.
        </Section>

        <Section title="8. Alterações dos termos">
          Estes termos podem ser atualizados periodicamente. Alterações significativas serão comunicadas pelo app. O uso continuado após a atualização implica aceitação dos novos termos.
        </Section>

        <div className="pt-2">
          <button
            onClick={() => { window.history.length > 1 ? window.history.back() : window.location.href = '/'; }}
            className="w-full py-3 rounded-2xl bg-[#00C27A] text-white font-bold text-sm hover:bg-[#00a868] transition"
          >
            Voltar para o GLPY
          </button>
        </div>

      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="space-y-2">
      <h2 className="text-sm font-extrabold text-[#0A1628]">{title}</h2>
      <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">{children}</p>
    </div>
  );
}
