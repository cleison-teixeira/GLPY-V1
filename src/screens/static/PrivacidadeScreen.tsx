import type { ReactNode } from 'react';

export default function PrivacidadeScreen() {
  return (
    <div className="min-h-screen bg-[#F4F8F6] flex flex-col items-center px-4 py-10">
      <div className="w-full max-w-xl bg-white rounded-3xl shadow-sm border border-[#E2EBE7] p-6 space-y-6">

        <div className="text-center space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#00C27A]">GLPY</span>
          <h1 className="text-2xl font-extrabold text-[#0A1628]">Política de Privacidade</h1>
          <p className="text-xs text-slate-400">Atualizado em maio de 2026</p>
        </div>

        <Section title="1. Dados que podemos coletar">
          Para oferecer a melhor experiência, o GLPY pode coletar:{"\n\n"}
          • Nome e nome de exibição{"\n"}
          • E-mail{"\n"}
          • Telefone/WhatsApp, quando informado{"\n"}
          • Dados do onboarding: peso atual, altura, meta, idade, data de nascimento{"\n"}
          • Medicamento, dose, frequência e tempo de uso informados pelo usuário{"\n"}
          • Registros de rotina: água, refeições, emoções, medidas corporais, aplicações{"\n"}
          • Fotos do prato e fotos de evolução, quando enviadas{"\n"}
          • Preferências de uso e configurações do app
        </Section>

        <Section title="2. Finalidade dos dados">
          Usamos seus dados para:{"\n\n"}
          • Personalizar sua experiência no app{"\n"}
          • Liberar e verificar acesso conforme o plano contratado{"\n"}
          • Acompanhar sua rotina e progresso{"\n"}
          • Melhorar recomendações dentro do app{"\n"}
          • Oferecer suporte ao usuário{"\n"}
          • Garantir segurança e prevenção de fraude
        </Section>

        <Section title="3. Dados de pagamento">
          Os pagamentos são processados pela plataforma HeroSpark. O GLPY pode receber dados necessários para a liberação de acesso, como e-mail, plano contratado, status da assinatura e identificadores da compra.{"\n\n"}
          O GLPY <strong>não armazena</strong> dados completos de cartão de crédito ou informações financeiras sensíveis.
        </Section>

        <Section title="4. Armazenamento e infraestrutura">
          Seus dados podem ser armazenados em serviços seguros como Firebase e Google Cloud, com padrões de segurança compatíveis com boas práticas de mercado. Dados locais também são armazenados no seu dispositivo para funcionamento offline.
        </Section>

        <Section title="5. Fotos">
          Fotos enviadas são usadas exclusivamente para recursos do app, como registro de evolução corporal, análise alimentar quando disponível, e acompanhamento pessoal. Não compartilhamos suas fotos com terceiros sem sua autorização.
        </Section>

        <Section title="6. Compartilhamento de dados">
          O GLPY <strong>não vende</strong> seus dados pessoais. Compartilhamos informações somente com:{"\n\n"}
          • Serviços necessários para o funcionamento do app (ex: Firebase, hospedagem){"\n"}
          • Processadora de pagamento (HeroSpark), exclusivamente para verificação de acesso{"\n"}
          • Suporte ao usuário, quando solicitado{"\n"}
          • Autoridades, quando exigido por obrigação legal
        </Section>

        <Section title="7. Seus direitos">
          Você pode a qualquer momento:{"\n\n"}
          • Solicitar correção dos seus dados{"\n"}
          • Solicitar exclusão da sua conta e dados{"\n"}
          • Entrar em contato pelo nosso suporte via WhatsApp para exercer esses direitos
        </Section>

        <Section title="8. Segurança">
          Aplicamos medidas técnicas razoáveis para proteger seus dados contra acesso não autorizado, perda ou uso indevido. Nenhum sistema é 100% inviolável, mas nos comprometemos a tratar seus dados com responsabilidade.
        </Section>

        <Section title="9. Contato">
          Dúvidas, solicitações ou questões sobre privacidade? Fale com a gente:{"\n\n"}
          <a
            href="https://wa.me/5548988371216?text=Olá%2C%20tenho%20uma%20dúvida%20sobre%20privacidade%20no%20GLPY."
            className="text-[#00C27A] font-semibold underline"
            target="_blank"
            rel="noreferrer"
          >
            WhatsApp: (48) 98837-1216
          </a>
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
