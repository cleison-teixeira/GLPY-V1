# Plano de Integração do MVP — GLPY-V1

Este documento estabelece o plano oficial de integração e evolução visual para o lançamento do **MVP do GLPY-V1** até **sexta-feira**. O plano foi elaborado a partir da auditoria técnica minuciosa realizada no codebase, garantindo segurança na evolução estática e preservação das inteligências de código já funcionais.

---

## 🎯 1. Objetivo do MVP

O objetivo principal deste MVP é **unificar e elevar o visual do GLPY-V1 para um patamar estético premium e cinematográfico ("WOW")**, mantendo 100% operacionais as lógicas críticas de negócio (sincronização Firebase, login automático, motores de IA DeepSeek/Claude e cálculos de metas nutricionais). 

Adicionalmente, o MVP adota uma **estratégia unificada de monetização simplificada**:
*   **Oferta Principal:** Protocolo Anti-Rebote + Aplicativo GLPY incluso.
*   **Preço de Tabela Recorrente:** R$ 29,90/mês.
*   **Adesão de Membro Fundador:** Primeiro mês promocional por **R$ 17,94** (utilizando o cupom fundador de 40% de desconto).
*   **Preço Recorrente (Após o 1º mês):** R$ 29,90/mês.
*   **Congelamento Comercial:** Os 4 planos legados (Starter, Plus, Pro, Top) ficam congelados por trás das cortinas no banco, ocultando tabelas complexas na interface do checkout do MVP para maximizar a conversão.

> [!IMPORTANT]
> **📋 Regras Estritas de Comunicação Comercial:**
> 1. **Proibições:** *NÃO* comunicar desconto vitalício e *NÃO* comunicar 50% de desconto para sempre.
> 2. **Transparência:** Comunicar com absoluta clareza que o desconto de 40% (cupom fundador) é aplicado exclusivamente no primeiro mês.
> 3. **Renovação:** Deixar nítido que a partir do segundo mês a assinatura continua por R$ 29,90/mês.
> 4. **Incentivo Emocional:** A condição fundador deve ser apresentada como um incentivo de entrada e um convite exclusivo para participar da construção do GLPY.
>
> **✍️ Copy Oficial Homologada:**
> *"Como membro fundador, você entra no GLPY por apenas R$ 17,94 no primeiro mês. Depois, sua assinatura continua por R$ 29,90/mês."*

O MVP deve parecer um ecossistema nativo mobile-first, consistente e impossível de ser confundido com apps genéricos de wellness.

---

## 📦 2. O que será Reaproveitado da V1 (Não Recriar)

Para maximizar a velocidade e mitigar riscos até sexta-feira, os seguintes ativos intelectuais e de código **serão integralmente preservados**:
*   **Dados dos Protocolos (`Protocolo1.tsx` a `Protocolo10.tsx`):** A base de lições diárias, missões, URLs de vídeo CDN e dados nutricionais.
*   **Lógica de Sincronização e Coleções do Firestore (`firestore.ts`):** Métodos de leitura/escrita de check-ins, perfis de usuários, XP e cotas de uso.
*   **Auto-Login via Link URL (`App.tsx`):** O interceptor de rota `/acesso?email=X&token=Y` que permite acesso silencioso de clientes em background.
*   **Conexão Claude & DeepSeek (`FotoPrato.tsx` / `ChatIA.tsx`):** Prompts sistêmicos estruturados de IA, parsing de JSON de visão computacional e algoritmos de fallback locais.
*   **Cálculos Matemáticos de Dashboard e Metas (`Dashboard.tsx` / `ProtocoloBase.tsx`):** Algoritmos de cálculo de score diário baseado em sintomas, cálculo de TMB/TDEE e fórmula de risco de rebote.

---

## 🚫 3. O que NÃO será Recriado ou Alterado

*   **Infraestrutura Firebase:** Nenhuma alteração nas configurações de ambiente ou tabelas do Firestore.
*   **Back-end ou APIs Externas:** As chaves de API (`VITE_DEEPSEEK_KEY`, `VITE_ANTHROPIC_KEY`) continuarão sendo consumidas de forma transparente.
*   **Regras de Negócio e Gamificação:** O fluxo de contagem de XP, streaks e regras de perda/ganho não será alterado.

---

## 🚦 4. Ordem Segura de Integração (Fases do MVP)

Seguindo a estrutura recomendada para blindar o codebase de falhas, a integração ocorrerá nas seguintes etapas ordenadas:

### 🔹 Fase 0 — Congelar telas aprovadas
*   **Ação:** Mapear e "congelar" o estado original de todas as lógicas de backend (`firebase.js`, `firestore.ts`, `sounds.ts`, `confetti.ts`). 
*   **Meta:** Criar uma barreira de segurança nas regras do Git/Workspace de modo que nenhuma alteração de interface altere as funções de retorno de dados.

### 🔹 Fase 1 — Reaproveitar Protocolos e Receitas
*   **Ação:** Portar o renderizador dinâmico de lições e missões (`ProtocoloBase.tsx`) e a catalogação global de receitas (`Recipes.tsx`) para o novo padrão de cores e tipografias oficiais do Design System.
*   **Meta:** Garantir que o consumo diário do protocolo atômico e as receitas de suporte estejam 100% funcionais, consistentes e com visual polido.

### 🔹 Fase 2 — Reaproveitar Chat IA e Foto do Prato
*   **Ação:** Adequar a estética do `ChatIA.tsx` e do visualizador de macros do `FotoPrato.tsx` para o **Dark Premium System** (fundo escuro `#0B1020` e glow metabólico `#6AD28F`).
*   **Meta:** Preservar a chamada de API e os prompts dinâmicos contextuais, atualizando as caixas de conversa e grids de macros com transições elegantes de scale.

### 🔹 Fase 3 — Fechar Onboarding Funcional
*   **Ação:** Atualizar o slide-deck linear de `Onboarding.tsx` e suas sub-telas em `src/screens/onboarding/` utilizando os componentes de UI unificados (`GLPYInput`, `GLPYButton`, `GLPYScreen`).
*   **Meta:** Entregar um fluxo de aquisição esteticamente irretocável que salva o usuário de primeira viagem no Firestore sem fricção.

### 🔹 Fase 4 — Criar Home MVP conectando o que já existe
*   **Ação:** Reconstruir o painel principal (`Dashboard.tsx`) sob o **Light Premium System** (fundo `#FFFFFF` com cards brancos, respiros generosos e sombra suave `rgba(0,0,0,0.06)`).
*   **Meta:** Conectar os atalhos de score metabólico, streaks de consistência e os botões de ação rápida ao roteamento existente sem quebrar os caminhos.

### 🔹 Fase 5 — App Shell / BottomNav global
*   **Ação:** Substituir o `BottomNav.tsx` original por uma barra de navegação flutuante (floating) estilizada com glassmorphism translúcido, cantos arredondados amplos (`24px`) e um indicador luminoso neon sob o item ativo.
*   **Meta:** Prover uma navegação fluida e nativa entre as abas principais (Home, Protocolos, Receitas, Comunidade, Perfil).

### 🔹 Fase 6 — Células / Comunidade MVP
*   **Ação:** Manter o esqueleto visual elegante do placeholder da `Comunidade.tsx` e disponibilizar a documentação arquitetural de engajamento social (`docs/glpy-celulas.md`) para o usuário.
*   **Meta:** Manter a expectativa alta e sinalizar ao usuário a chegada futura do ecossistema social de Células.

---

## ⚡ 5. Premium Pass Futuro (Escopo Pós-MVP)

Os seguintes recursos visuais e operacionais avançados serão movidos do MVP até sexta-feira para o roadmap do **Premium Pass** pós-lançamento:
1.  **Dark Mode Universal Automático:** Transição dinâmica de telas do Light System (Dashboard) para o Dark System por chave no perfil.
2.  **Sistema Real-Time de Chat e Células:** Integração ativa de feed social, ranking de evolução ao vivo e chat em grupo com Firebase Realtime Database.
3.  **Tabela de Planos e Loja de Suplementação:** Retorno da visualização de planos segregados (Starter/Plus/Pro/Top) e e-commerce metabólico contextual.
4.  **IA Preditiva Avançada:** Notificações push baseadas na antecipação de crises de náusea e tontura recolhidas pelo histórico.

---

## ⚠️ 6. Riscos Técnicos e Regras de Mitigação

Para garantir que o aplicativo continue funcionando perfeitamente a cada alteração visual, aplicaremos as seguintes **regras fundamentais de desenvolvimento**:

> [!IMPORTANT]
> **Regra #1: O isolamento absoluto das APIs**
> Modificações visuais nos campos de texto ou botões do `ChatIA.tsx` e `FotoPrato.tsx` nunca devem alterar o formato de envio de dados e o parsing de JSON retornado.

> [!WARNING]
> **Regra #2: Preservação do LocalStorage**
> A troca de design das chaves de Onboarding e Check-in não deve renomear as strings chaves gravadas localmente (ex: `glpy_user`, `glpy_onboarding`, `glpy_streak`). Mudar os nomes quebraria o cálculo de histórico e score de usuários recorrentes.

> [!CAUTION]
> **Regra #3: Zero Alterações Simultâneas em Dependências Externas**
> Não alterar versões de bibliotecas estruturais no `package.json` (como `react`, `motion` ou `firebase`) para evitar problemas de compatibilidade no build do Vite.

> [!IMPORTANT]
> **Regra #4: Preservação de Checkout e Estratégia Kiwify**
> * **Zero Alteração de Código Financeiro:** Não efetuar modificações na engenharia do gateway de faturamento interno ou de sincronização do banco de dados.
> * **Reaproveitamento Operacional (Kiwify):** Utilizar o produto/plano legadamente ativo e homologado na Kiwify que já possua o webhook configurado e 100% funcional. Isso evita riscos de quebra na entrega do acesso de novos clientes e anula o atrito de reconfiguração de infraestrutura até sexta-feira.
> * **Modelo da Oferta:** Produto *"GLPY Anti-Rebote — Acesso Fundador"*, aplicando um cupom de 40% OFF no primeiro mês (fechando em R$ 17,94) e com renovação automática no valor cheio de R$ 29,90/mês subsequentes.
> * **Protocolo de Validação Compulsória:** Antes de iniciar a abertura do carrinho, é mandatório realizar uma compra de teste de ponta a ponta para homologar e auditar 5 pilares estruturais:
>   1. *Abertura segura do link de Checkout.*
>   2. *Aplicação correta do cupom de 40% OFF na Kiwify (R$ 17,94 no 1º mês, R$ 29,90/mês depois).*
>   3. *Disparo imediato e perfeito do Webhook de confirmação.*
>   4. *Criação e liberação instantânea de credenciais no banco.*
>   5. *Entrada sem atritos do usuário teste no fluxo de Onboarding.*
> * **Contingência de Produto:** A criação de um novo produto/plano do zero na Kiwify só ocorrerá se a plataforma legada inviabilizar a mecânica de cupom Founder de primeiro mês ou se o webhook existente estiver irreparavelmente danificado.

---

## 🗓️ 7. Prioridade Máxima até Sexta-Feira

1.  **Consistência dos Componentes Globais:** Consolidar e usar os componentes de `src/components/ui/` em todas as telas portadas.
2.  **Transições Fluidas (Fator "WOW"):** Utilizar a biblioteca `motion` (`motion/react` já instalada) para suavizar aberturas de modais, check-ins e trocas de abas.
3.  **Build Limpo:** Garantir que o comando `npm run build` seja executado e testado localmente após cada modificação de tela, mitigando bugs de TypeScript na entrega.
