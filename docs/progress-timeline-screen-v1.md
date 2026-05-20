# GLPY — Progress Timeline Screen V1

Status: APPROVED — READY FOR MVP
Version: V1
Date: 2026-05-20

---

# Nome da Tela

ProgressTimelineScreen

---

# Objetivo

Criar a tela de linha do tempo de progresso do GLPY-V1, mostrando marcos importantes da jornada do usuário de forma emocional, simples e motivadora. 

A tela ajuda o usuário a celebrar pequenas conquistas e enxergar a consistência construída no dia a dia, reforçando progresso, continuidade e identidade, sem gerar ansiedade ou culpa.

---

# Aviso de Segurança e Escopo

- **Aviso Oficial:** O GLPY não interpreta dados como diagnóstico nem substitui orientação profissional.
- **Escopo MVP:** Os dados exibidos na tela são mockados/localizados para visualização e experiência do usuário no MVP.

---

# Tema Oficial

LIGHT PREMIUM

Sistema: Operational
Categoria: Progress / Timeline

---

# Componentes Usados

- `GLPYScreen` (variant: light) — Componente base de tela no padrão Light Premium.
- `GLPYHeader` (com botão voltar + título "Linha do tempo").
- `GLPYCard` (variant: light) × 4 — Cards de agrupamento visual com design minimalista:
  - Card 1: Sua jornada (Resumo compacto de início da jornada, dias de sequência e total de marcos concluídos)
  - Card 2: Marcos da evolução (Linha do tempo vertical suave com nós indicadores de progresso)
  - Card 3: Próximo marco (Incentivo leve para metas futuras com tag pontilhada destacada)
  - Card 4: Dica GLPY (Tinted green card de apoio cognitivo contra a cobrança excessiva)
- `GLPYButton` (variant: primary, size: lg, fullWidth) — CTA principal para visualizar resultados.
- Ícones de `lucide-react`: `Compass`, `Milestone`, `Sparkles`, `Lightbulb`, `Award`.

---

# Estrutura da Tela

## Header
- Botão de voltar (`onBack` prop).
- Título centralizado: "Linha do tempo".

## Card 1 — Sua jornada
- Breve texto motivador: "Cada registro conta uma parte da sua evolução. Veja os marcos que você já construiu."
- Bloco horizontal compacto com 3 métricas de apoio:
  - **Início:** 07/05/2026
  - **Sequência:** 12 dias (destacado na cor `greenDark` `#3FAE68` para celebrar consistência)
  - **Marcos:** 6

## Card 2 — Marcos da evolução
- Timeline vertical pura, limpa e espaçada a `28px` para perfeita legibilidade:
  1. **Jornada iniciada** (07/05/2026) — *Você deu o primeiro passo no GLPY.* (Concluído)
  2. **Primeiro peso registrado** (07/05/2026) — *Peso inicial registrado: 84,8 kg.* (Concluído)
  3. **Primeira aplicação registrada** (08/05/2026) — *Sua jornada da caneta começou a ser acompanhada.* (Concluído)
  4. **Primeiro check-in concluído** (09/05/2026) — *Você concluiu seu primeiro check-in diário.* (Concluído)
  5. **Primeiro marco de peso** (13/05/2026) — *Você já eliminou 4,8 kg desde o início.* (Concluído)
  6. **Foto de evolução adicionada** (13/05/2026) — *Sua transformação visual começou a ser registrada.* (Concluído)
  7. **Próximo marco** (Em breve) — *Completar 14 dias de sequência.* (Próximo / Em progresso)
- Os pontos concluídos têm cor verde e halo suave de destaque. O próximo ponto é neutro/cinza, mantendo um design limpo e livre de cobrança excessiva.
- Linha-guia vertical fina conectando todos os itens dinamicamente.

## Card 3 — Próximo marco
- Texto explicativo: "Faltam apenas 2 dias para completar 14 dias de sequência."
- Mini container tintado e pontilhado verde exibindo o emblema: `14 dias de consistência`.

## Card 4 — Dica GLPY
- Texto de suporte emocional: "A evolução não acontece em um único dia. Ela aparece nos pequenos registros que você mantém ao longo da jornada."
- Card em tom verde tintado com ícone de lâmpada (`Lightbulb`).

---

# Comportamento

- **Ação do CTA "Ver resultados"**:
  - Imprime no console a intenção de navegação para a tela de resultados consolidados:
    ```javascript
    console.log("open_results_screen");
    ```

---

# Conexões Futuras (Pós-MVP)

- **DailyTrackingEngine / WeightTrackingEngine**: Para monitorar dados de ingestão de água, alimentação e registros de peso em tempo real.
- **ProtocolEngine**: Conexão com regras médicas, alterações de dosagens e marcos clínicos.
- **XP/Streak Engine**: Para persistir o cálculo dinâmico da sequência de dias (streak) e gamificação de conquistas.
- **GLPY IA**: Para sugerir dicas personalizadas e prever o ritmo saudável de progresso com base na linha do tempo.

---

# Arquivo Implementado

src/screens/operational/ProgressTimelineScreen.tsx

---

# Rota Preview

http://localhost:3000/preview/progress-timeline

*Nota: Rota isolada implementada via dynamic import em src/main.tsx e adicionada à Central de Previews.*

---

# Observação Oficial

Esta tela é o padrão operacional Light Premium para a linha do tempo de progresso do ecossistema GLPY.
Ela é desenhada especificamente para gerar orgulho e sensação de progresso a longo prazo, mantendo a tranquilidade cognitiva e reduzindo a ansiedade associada à balança.

Não alterar essa tela sem nova solicitação explícita.

---

# Status Final

APPROVED — READY FOR MVP
