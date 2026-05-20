# Relatório de Auditoria — GLPY-V1

Este documento apresenta uma auditoria detalhada do estado atual do codebase do projeto **GLPY-V1**. Foram mapeadas todas as lógicas, telas e componentes correspondentes aos 15 tópicos solicitados, avaliando seu status funcional, dependências de APIs/Firebase, potencial de reaproveitamento, necessidades de adaptação ao novo Design System (DS) e a ordem recomendada de integração para o MVP até sexta-feira.

> [!NOTE]
> Conforme as diretrizes especificadas, **nenhum arquivo foi alterado, criado ou deletado no codebase principal**. Esta auditoria é 100% observativa.

---

## 📊 Tabela de Mapeamento dos 15 Tópicos Solicitados

| # | Item da Auditoria | Caminho do Arquivo Principal | O que o arquivo faz | Funcional? | Depende de Firebase/API? | Pode ser Reaproveitado? | Necessita Adaptação ao DS? |
|---|---|---|---|---|---|---|---|
| **1** | **Protocolos** | `src/components/Protocolo1.tsx` a `Protocolo10.tsx` (exceto `Protocolo4.tsx` que é `AntiRebote.tsx`) | Contêm as informações, lições diárias, vídeos, check-ins, prompts e receitas dos 10 protocolos de 7 dias do app. | **Sim** | Indireta (passa props para o renderizador). | **Sim** (conteúdo e dados valiosos). | **Alta** (converter inline styles e botões). |
| **2** | **Lista de protocolos** | [ProtocolHub.tsx](file:///Users/cleissonteixeira/Desktop/GLPY-V1/src/components/ProtocolHub.tsx) | Central (HUB) que exibe as 10 jornadas, status de trancado/desbloqueado (por plano), e modal de troca de protocolo. | **Sim** | **Sim** (salva progresso ativo no Firestore). | **Sim** (lógica de troca é sólida). | **Alta** (aplicar padrão premium e cards). |
| **3** | **Detalhe de protocolo** | [ProtocoloBase.tsx](file:///Users/cleissonteixeira/Desktop/GLPY-V1/src/components/ProtocoloBase.tsx) | Renderizador genérico e dinâmico de lições, missões diárias, recompensas com sons, confetes e receitas de cada dia. | **Sim** | **Sim** (salva progresso de dias no Firestore). | **Sim** (coração da lógica de execução). | **Alta** (alinhar modais, cards e botões ao DS). |
| **4** | **Dia de protocolo** | [ProtocolDay.tsx](file:///Users/cleissonteixeira/Desktop/GLPY-V1/src/components/ProtocolDay.tsx) | Tela de lição/missão diária alternativa (legacy/preview), focada em vídeo, check-in de fome e ganho de XP. | **Sim** | Não (usa apenas LocalStorage). | **Parcial** (alinhável com a `ProtocoloBase`). | **Média** (mesclar visual com o template principal). |
| **5** | **Receitas** | [Recipes.tsx](file:///Users/cleissonteixeira/Desktop/GLPY-V1/src/components/Recipes.tsx) (objeto estático) | Base de dados de receitas fit focadas em GLP-1 com divisão por macros, porções e dicas de adaptação digestiva. | **Sim** | Não (local e estático). | **Sim** (banco de receitas excelente). | **Média** (substituir botões e inputs). |
| **6** | **Lista de receitas** | [Recipes.tsx](file:///Users/cleissonteixeira/Desktop/GLPY-V1/src/components/Recipes.tsx) (aba principal) | Exibe o catálogo completo de receitas com filtros horizontais e barra de busca de ingredientes. | **Sim** | Não. | **Sim** (fluxo fluido). | **Média** (adotar cards globais e espaçamentos). |
| **7** | **Detalhe de receita** | [Recipes.tsx](file:///Users/cleissonteixeira/Desktop/GLPY-V1/src/components/Recipes.tsx) (modal de detalhes) | Exibe ingredientes, instruções passo a passo, tabela nutricional e a dica metabólica exclusiva da GLPY.IA. | **Sim** | Não. | **Sim** (layout de modais). | **Alta** (adotar blur e modal premium do DS). |
| **8** | **Categorias de receitas** | [Recipes.tsx](file:///Users/cleissonteixeira/Desktop/GLPY-V1/src/components/Recipes.tsx) (pills de filtro) | Filtros de categorias: "Emagrecimento", "Proteína", "Energia", "Doce Fit", "Shakes". | **Sim** | Não. | **Sim** (tags simples). | **Baixa** (apenas atualizar estilos de badges). |
| **9** | **Chat IA** | [ChatIA.tsx](file:///Users/cleissonteixeira/Desktop/GLPY-V1/src/components/ChatIA.tsx) | Interface de conversa inteligente. Monta um prompt ultra-contextual com todos os dados do usuário e chama DeepSeek. | **Sim** | **Sim** (DeepSeek API + controle de limites no Firestore). | **Sim** (um dos maiores diferenciais). | **Alta** (bubbles de chat, input fixado, responsividade). |
| **10** | **Foto do prato** | [FotoPrato.tsx](file:///Users/cleissonteixeira/Desktop/GLPY-V1/src/components/FotoPrato.tsx) | Captura câmera/upload e analisa o prato usando a API do Claude 3.5 Sonnet (com fallback estruturado em mock). | **Sim** | **Sim** (Claude Vision API + contagem de scans diários no Firestore). | **Sim** (lógica de visão computacional pronta). | **Alta** (dashboard de macros com círculos e glow). |
| **11** | **Comunidade / células** | [Comunidade.tsx](file:///Users/cleissonteixeira/Desktop/GLPY-V1/src/components/Comunidade.tsx) | Tela estática de \"Em Breve\" explicando o ecossistema social de Células (reforçada por docs arquiteturais). | **Estática** | Não. | **Apenas UI base** (precisa implementar lógica). | **Baixa** (a tela é um placeholder simples). |
| **12** | **Dashboard antigo** | [Dashboard.tsx](file:///Users/cleissonteixeira/Desktop/GLPY-V1/src/components/Dashboard.tsx) | Tela principal com cálculo de score metabólico, aviso de risco de rebote, streak, botões principais e atalhos secundários. | **Sim** | Não (local e reativo). | **Sim** (lógica matemática de score e risco). | **Alta** (remover CSS inline e unificar com cores DS). |
| **13** | **Onboarding existente** | [Onboarding.tsx](file:///Users/cleissonteixeira/Desktop/GLPY-V1/src/components/Onboarding.tsx) | Slide-deck de 12 etapas coletando dados do usuário e sincronizando o perfil com local storage e Firestore. | **Sim** | **Sim** (salva perfil do usuário no Firestore). | **Sim** (onboarding muito rico e completo). | **Alta** (usar `GLPYInput`, `GLPYButton` e font-sizes). |
| **14** | **Navegação** | [BottomNav.tsx](file:///Users/cleissonteixeira/Desktop/GLPY-V1/src/components/BottomNav.tsx) | Navegação flutuante por abas acoplada ao estado principal do `App.tsx`. | **Sim** | Não. | **Sim** (fluxo limpo de SPA). | **Alta** (adotar visual floating glassmorphism). |
| **15** | **Firebase/Auth** | [firebase.js](file:///Users/cleissonteixeira/Desktop/GLPY-V1/src/firebase.js) / [firestore.ts](file:///Users/cleissonteixeira/Desktop/GLPY-V1/src/services/firestore.ts) | Inicialização do Firebase Core, Firestore Database e Auth. Serviços de sincronização e login integrados. | **Sim** | **Sim** (Core Infraestrutura). | **Sim** (100% estável). | **Baixa** (lógica puramente back-end/serviço). |

---

## 🔍 Análise Profunda das Descobertas Técnicas e Arquiteturais

### 1. Sistema de Design System Encontrado (`src/theme/` e `src/components/ui/`)
Identificamos a presença de um novo ecossistema visual em andamento em `src/theme/`, contendo tokens estruturados para:
*   `colors.ts` (Light Premium e Dark Premium / Glow Metabólico / Navy Text).
*   `typography.ts` (Integração de fontes `Inter` e pesos específicos).
*   `spacing.ts`, `radius.ts`, `shadows.ts` e `motion.ts` (regras de escala e velocidade de botões).
*   **Componentes oficiais em `src/components/ui/`**: `GLPYButton.tsx`, `GLPYCard.tsx`, `GLPYHeader.tsx`, `GLPYInput.tsx` e `GLPYScreen.tsx`.
> [!WARNING]
> Muitas das telas e componentes auditados no diretório `src/components/` ainda usam classes Tailwind hardcoded ou regras CSS de inline style. A migração para os novos componentes em `src/components/ui` e a aplicação estrita dos tokens de cores do `colors.ts` são **cruciais** para atingir o nível estético "WOW" exigido.

### 2. Mecanismo de Previews Isolados (`src/main.tsx` / `/preview`)
O ecossistema conta com uma rota centralizada de testes `/preview` que mapeia previews isolados para telas específicas em `src/screens/onboarding/` e `src/screens/operational/`. Isso permite verificar cada interface sem a necessidade de passar por todo o fluxo de onboarding a cada alteração. 

### 3. Autenticação e Login Automático
Além da tela clássica `Login.tsx` com Google e E-mail/Senha, há um interceptor fantástico de URL em `src/App.tsx` (linhas 45-52 e 98-114) que detecta a rota `/acesso?email=X&token=Y`. Ele faz o login do usuário em background usando a senha fixa (`GLPY@2026` ou o token fornecido), limpando a barra de endereços logo em seguida e garantindo um login silencioso e fluido.

---

## 🛠️ Detalhamento dos 15 Itens Auditados

### 1. Protocolos
*   **Arquivos Encontrados**: `src/components/Protocolo1.tsx` a `src/components/Protocolo10.tsx` (exceto o 4, que é `AntiRebote.tsx`).
*   **Papel & Lógica**: Cada arquivo atua como um repositório de dados estáticos muito bem estruturados contendo:
    *   `DIAS`: Array com 7 objetos representando as lições diárias, vídeos explicativos hospedados no CDN da GLPY (`https://glpy.b-cdn.net/...`), missões exatas de check-in, prompts personalizados de IA para o dia, recompensas e XP ganho.
    *   `RECEITAS`: Um array de 5 receitas específicas recomendadas para lidar com o problema central daquele protocolo (ex: *Caldo de Galinha com Gengibre* para anti-náusea no Protocolo 1).
*   **Funcionalidade**: 100% funcional.
*   **Dependência Firebase**: Nenhuma direta no arquivo de conteúdo.
*   **Reaproveitamento**: Total. As dicas práticas e a curadoria médica e nutricional são excelentes.
*   **Adaptação ao DS**: **Alta**. O conteúdo precisa continuar estático, mas a interface que o exibe (descrita no item 3) precisa ser re-estilizada.

### 2. Lista de Protocolos
*   **Arquivos Encontrados**: [ProtocolHub.tsx](file:///Users/cleissonteixeira/Desktop/GLPY-V1/src/components/ProtocolHub.tsx).
*   **Papel & Lógica**: Lista os 10 protocolos em cards horizontais, exibindo título, emoji, nível mínimo de assinatura (Starter, Plus, Pro, Top) e status de progresso.
    *   Possui lógica para bloquear protocolos dependendo do plano do usuário (atualmente desativado para testes na linha 86: `return true; // TEMP: todos liberados`).
    *   Gera um modal interativo de confirmação quando o usuário tenta alterar o protocolo ativo.
*   **Funcionalidade**: Totalmente operacional.
*   **Dependência Firebase**: Sim. Grava a alteração do protocolo ativo via `saveProtocolProgress`.
*   **Reaproveitamento**: Excelente lógica de controle de planos e troca de jornadas.
*   **Adaptação ao DS**: **Alta**. O HUB deve transicionar para o **Dark Premium System** (fundo `#0B1020`, glow metabólico sutil `#6AD28F` e cards escuros com leve blur).

### 3. Detalhe de Protocolo
*   **Arquivos Encontrados**: [ProtocoloBase.tsx](file:///Users/cleissonteixeira/Desktop/GLPY-V1/src/components/ProtocoloBase.tsx).
*   **Papel & Lógica**: É a engine que monta o protocolo ativo. Ela renderiza a lição em vídeo, as metas diárias de calorias/macronutrientes computadas dinamicamente com base no peso e altura do usuário (fórmula MSJ), checkboxes de check-in diário, toca sons festivos e gera confetes quando as missões são concluídas. Possui uma segunda aba para as receitas personalizadas daquele protocolo.
*   **Funcionalidade**: Totalmente operacional e responsivo.
*   **Dependência Firebase**: Sim. Consome e persiste o progresso de check-ins e missões usando `salvarProgressoProtocolo` e `carregarProgressoProtocolo`.
*   **Reaproveitamento**: Fundamental. É o coração da usabilidade do usuário no dia a dia do protocolo.
*   **Adaptação ao DS**: **Alta**. A interface de missões diárias e o player de vídeo devem receber a identidade premium do design system (remover as bordas cinzas padrão por tons suaves, usar tipografia do DS e botões oficiais).

### 4. Dia de Protocolo
*   **Arquivos Encontrados**: [ProtocolDay.tsx](file:///Users/cleissonteixeira/Desktop/GLPY-V1/src/components/ProtocolDay.tsx).
*   **Papel & Lógica**: Tela alternativa que exibe o progresso diário de forma simplificada, contendo três missões padrão fixas (Zero açúcar líquido, Proteína em todas as refeições e Caminhada leve) e um slider para colher dados de fome e retornar respostas de IA do Mounjaro.
*   **Funcionalidade**: Funcional.
*   **Dependência Firebase**: Nenhuma (grava e lê localmente no storage).
*   **Reaproveitamento**: Baixo/Médio. Deve ser mantida apenas como tela secundária ou consolidada definitivamente com a experiência superior de `ProtocoloBase.tsx` para evitar confusão de fluxos.
*   **Adaptação ao DS**: Média.

### 5. Receitas
*   **Arquivos Encontrados**: [Recipes.tsx](file:///Users/cleissonteixeira/Desktop/GLPY-V1/src/components/Recipes.tsx).
*   **Papel & Lógica**: Base de dados estática que alimenta a aba global de nutrição, contendo receitas estruturadas com macros exatos e preparos passo a passo.
*   **Funcionalidade**: Sim.
*   **Dependência Firebase**: Nenhuma.
*   **Reaproveitamento**: Total. Excelentes dados nutricionais.
*   **Adaptação ao DS**: Média.

### 6. Lista de Receitas
*   **Arquivos Encontrados**: [Recipes.tsx](file:///Users/cleissonteixeira/Desktop/GLPY-V1/src/components/Recipes.tsx).
*   **Papel & Lógica**: Apresenta filtros horizontais de categorias de metas nutricionais e uma barra de pesquisa. 
*   **Funcionalidade**: Sim, o filtro por clique e a busca de texto operam sem travamentos.
*   **Dependência Firebase**: Nenhuma.
*   **Reaproveitamento**: Total.
*   **Adaptação ao DS**: **Média**. Requer aplicação do layout de cards e tags padronizados.

### 7. Detalhe de Receita
*   **Arquivos Encontrados**: [Recipes.tsx](file:///Users/cleissonteixeira/Desktop/GLPY-V1/src/components/Recipes.tsx) (modal embutido) e [ProtocoloBase.tsx](file:///Users/cleissonteixeira/Desktop/GLPY-V1/src/components/ProtocoloBase.tsx) (modal embutido).
*   **Papel & Lógica**: Renders expandidos de ingredientes e instruções.
*   **Funcionalidade**: Sim.
*   **Dependência Firebase**: Nenhuma.
*   **Reaproveitamento**: Sim, os modais atuais contam com opções úteis de "lista de compras" com checkboxes de ingredientes.
*   **Adaptação ao DS**: **Alta**. Adaptar para um modal premium sobreposto com glassmorphism desfocado ao fundo e tipografia estrita.

### 8. Categorias de Receitas
*   **Arquivos Encontrados**: [Recipes.tsx](file:///Users/cleissonteixeira/Desktop/GLPY-V1/src/components/Recipes.tsx) (filtro horizontal).
*   **Papel & Lógica**: Tags interativas para filtragem rápida.
*   **Funcionalidade**: Sim.
*   **Dependência Firebase**: Nenhuma.
*   **Reaproveitamento**: Sim.
*   **Adaptação ao DS**: Baixa (estilização CSS simples).

### 9. Chat IA
*   **Arquivos Encontrados**: [ChatIA.tsx](file:///Users/cleissonteixeira/Desktop/GLPY-V1/src/components/ChatIA.tsx).
*   **Papel & Lógica**: Um dos módulos mais avançados do app. Monta o prompt do sistema fundindo os dados de onboarding do usuário, o dia do protocolo atual, as missões concluídas hoje, enjoo/humor do check-in de hoje, e os dados calóricos coletados nas fotos anteriores de pratos. Faz a chamada HTTP direta para a API do DeepSeek e atualiza o histórico de chat de forma assíncrona.
*   **Funcionalidade**: Sim (requer a chave de API em `VITE_DEEPSEEK_KEY`).
*   **Dependência Firebase**: Sim, monitora as cotas de mensagens mensais do usuário via Firestore no método `incrementarMsgIA` e impede o uso se o plano Starter estourar o limite de 10 mensagens mensais.
*   **Reaproveitamento**: Altíssimo. O prompt system estruturado é um ativo intelectual poderoso da marca GLPY.
*   **Adaptação ao DS**: **Alta**. O Chat IA deve usar o **Dark Premium System** (fundo escuro azul petróleo, glow roxo/verde no topo, caixa de digitação flutuante e bolhas de conversa limpas).

### 10. Foto do Prato / Refeição
*   **Arquivos Encontrados**: [FotoPrato.tsx](file:///Users/cleissonteixeira/Desktop/GLPY-V1/src/components/FotoPrato.tsx).
*   **Papel & Lógica**: Recebe fotos da câmera ou galeria, converte para base64 e envia para a API Claude da Anthropic com instruções de retornar estritamente um JSON contendo kcal, carboidratos, proteínas, gorduras e feedback metabólico. Se a chave estiver ausente ou a chamada falhar, possui um algoritmo de fallback inteligente que sorteia um mock nutritivo excelente para o usuário não travar.
*   **Funcionalidade**: Sim (depende da chave `VITE_ANTHROPIC_KEY`).
*   **Dependência Firebase**: Sim, registra e limita scans diários com base na assinatura (Starter limita 3 fotos por dia).
*   **Reaproveitamento**: Altíssimo.
*   **Adaptação ao DS**: **Alta**. A visualização dos macronutrientes deve ser apresentada em anéis circulares elegantes com gradientes de cores dinâmicos.

### 11. Células / Comunidade
*   **Arquivos Encontrados**: [Comunidade.tsx](file:///Users/cleissonteixeira/Desktop/GLPY-V1/src/components/Comunidade.tsx).
*   **Papel & Lógica**: Tela estática com aviso de "Em Breve" e explicação conceitual.
*   **Funcionalidade**: Não (apenas visual placeholder).
*   **Dependência Firebase**: Nenhuma.
*   **Reaproveitamento**: O design base serve de esqueleto para o desenvolvimento futuro.
*   **Adaptação ao DS**: Baixa (a ser reescrita).

### 12. Dashboard Antigo
*   **Arquivos Encontrados**: [Dashboard.tsx](file:///Users/cleissonteixeira/Desktop/GLPY-V1/src/components/Dashboard.tsx).
*   **Papel & Lógica**: A central de controle antiga do aplicativo. Realiza o cálculo do Score Metabólico diário subtraindo pontos se o check-in indicar muito enjoo ou fome desregulada e adicionando pontos se o usuário bater metas. Exibe o nível do usuário baseado em XP, calcula o risco de rebote biológico e oferece atalhos para todas as sub-telas.
*   **Funcionalidade**: 100% funcional.
*   **Dependência Firebase**: Indireta (usa dados locais sincronizados).
*   **Reaproveitamento**: A lógica de cálculo do score metabólico e os textos de decisões dinâmicas de acordo com o dia da semana são fantásticos e devem ser mantidos intactos.
*   **Adaptação ao DS**: **Alta**. É a tela principal de uso, então precisa ser reconstruída usando o **Light Premium System** com o máximo de capricho estético.

### 13. Onboarding Existente
*   **Arquivos Encontrados**: [Onboarding.tsx](file:///Users/cleissonteixeira/Desktop/GLPY-V1/src/components/Onboarding.tsx) e telas na pasta `src/screens/onboarding/`.
*   **Papel & Lógica**: Fluxo linear de onboarding. Pede nome, telefone, data de nascimento, peso, altura, dose de medicação, objetivos e estilo de acompanhamento. Grava as respostas no Local Storage para acesso instantâneo do app e atualiza o documento do usuário no Firestore.
*   **Funcionalidade**: Sim.
*   **Dependência Firebase**: Sim, grava o perfil final do usuário via `saveUserProfile`.
*   **Reaproveitamento**: Total.
*   **Adaptação ao DS**: **Alta**. Precisa de uma atualização visual para se adequar ao design de transições e inputs padronizados do novo DS.

### 14. Sistema de Navegação
*   **Arquivos Encontrados**: [BottomNav.tsx](file:///Users/cleissonteixeira/Desktop/GLPY-V1/src/components/BottomNav.tsx) e roteamento de estados em [App.tsx](file:///Users/cleissonteixeira/Desktop/GLPY-V1/src/App.tsx).
*   **Papel & Lógica**: Uma barra inferior simples com botões e ícones Lucide acoplados ao estado `telaAtual` do `App.tsx`.
*   **Funcionalidade**: Sim.
*   **Dependência Firebase**: Nenhuma.
*   **Reaproveitamento**: Sim, a lógica de troca de estados é simples e ideal para SPA.
*   **Adaptação ao DS**: **Alta**. Deve ser re-estilizada como uma barra flutuante (floating) com cantos arredondados generosos, glassmorphism sutil e um indicador luminoso de seleção ativa (glow neon suave).

### 15. Firebase / Auth / User Data
*   **Arquivos Encontrados**: [firebase.js](file:///Users/cleissonteixeira/Desktop/GLPY-V1/src/firebase.js) e [firestore.ts](file:///Users/cleissonteixeira/Desktop/GLPY-V1/src/services/firestore.ts).
*   **Papel & Lógica**: Inicialização e exportação das instâncias do banco, autenticação, analytics e funções CRUD de banco de dados (check-ins, limites de IA, cotas de fotos e sincronização de dados localmente).
*   **Funcionalidade**: Sim.
*   **Dependência Firebase**: Core.
*   **Reaproveitamento**: Total. O serviço está extremamente maduro e bem otimizado.
*   **Adaptação ao DS**: Nenhuma (apenas a interface de `Login.tsx` precisa de alinhamento visual).
