# GLPY — Check-in Screen V1

Status: APPROVED — READY FOR MVP
Version: V1
Date: 2026-05-20

---

# Nome da Tela

CheckInScreen

---

# Objetivo

Consolidar registros diários e gerar sensação de progresso, continuidade e micro recompensa emocional ao final do dia.

A tela reúne em um resumo interativo os principais inputs do dia:
- Consumo de água
- Registro de refeições
- Registro de aplicação
- Registro emocional
- Atividade física realizada
- Sintomas reportados
- Foto corporal

No MVP, os dados são mockados/localizados para simular o comportamento da aplicação consolidada.

---

# Aviso de Segurança e Escopo

- **Aviso Oficial:** O GLPY não diagnostica, prescreve ou substitui orientação profissional.
- **Escopo MVP:** Os dados exibidos na tela são mockados/localizados para visualização e experiência do usuário no MVP.

---

# Tema Oficial

LIGHT PREMIUM

Sistema: Operational
Categoria: Tracking Diário / Check-in

---

# Componentes Usados

- `GLPYScreen` (variant: light) — Componente base de tela no padrão Light Premium.
- `GLPYHeader` (com botão voltar + título "Check-in").
- `GLPYCard` (variant: light) × 5 — Cards de agrupamento visual com design minimalista:
  - Card 1: Check-in de hoje (Sequência, Progresso, XP do dia)
  - Card 2: Resumo diário (Lista de ações)
  - Card 3: Como foi seu dia? (Seletor de sentimento)
  - Card 4: Próximo passo (Reforço positivo para continuidade)
  - Card 5: Dica GLPY (Tinted green card de auxílio contextual)
  - Card de Feedback: Mostrado após a conclusão, com animação e XP conquistado (+80 XP).
- `GLPYButton` (variant: primary, size: lg, fullWidth) — CTA principal para conclusão do check-in.
- Ícones de `lucide-react`: `Star`, `ListChecks`, `Smile`, `TrendingUp`, `Lightbulb`, `Check`, `CheckCircle2`, `Droplets`, `Utensils`, `Syringe`, `AlertCircle`, `Flame`, `Camera`.

---

# Estrutura da Tela

## Header
- Botão de voltar (`onBack` prop).
- Título centralizado: "Check-in".

## Card 1 — Check-in de hoje
- Exibe o status consolidado de progresso:
  - **Sequência:** "12 dias" (estímulo de continuidade).
  - **Progresso de hoje:** "6 de 7 ações" (avaliação quantitativa).
  - **XP do dia:** "+80 XP" (destacado na cor `greenDark`, oferecendo feedback de dopamina e gamificação).

## Card 2 — Resumo diário
- Lista interativa contendo 7 itens e seus respectivos status de completitude do dia:
  1. **Água:** "1,2 L de 2,6 L" (Pendente / ícone `Droplets`)
  2. **Refeições:** "2 de 3" (Pendente / ícone `Utensils`)
  3. **Aplicação:** "Registrada" (Concluído / ícone `Syringe`)
  4. **Emoção:** "Bem" (Concluído / ícone `Smile`)
  5. **Atividade:** "30 min" (Concluído / ícone `Flame`)
  6. **Sintomas:** "Náusea leve" (Concluído / ícone `AlertCircle`)
  7. **Foto corporal:** "Pendente" (Pendente / ícone `Camera`)
- Cada linha exibe o valor do registro e um indicador visual (check verde para concluído ou círculo tracejado para pendente).

## Card 3 — Como foi seu dia?
- Seletor horizontal com 3 chips interativos para registrar a percepção geral do dia:
  - **Leve**
  - **Normal** (selecionado por padrão)
  - **Difícil**
- O chip ativo exibe borda verde, fundo levemente tintado (`green` com opacidade) e texto com peso forte.

## Card 4 — Próximo passo
- Card focado em continuidade da jornada diária:
  - Texto de apoio: "Amanhã você continua de onde parou."
  - Elemento em destaque com ícone `TrendingUp` e texto: "Manter sua sequência ativa".

## Card 5 — Dica GLPY
- Fundo levemente verde tintado (`brand.green` com 8% de opacidade e borda a 20%).
- Texto contextual de encorajamento: "Completar seu check-in ajuda a GLPY IA a entender padrões entre rotina, sintomas, energia e evolução."

## Feedback de Conclusão (Condicional)
- Exibido após o clique no CTA "Concluir check-in":
  - Ícone `CheckCircle2` em tamanho grande.
  - Destaque numérico: "+80 XP" (feedback positivo imediato).
  - Mensagem de sucesso: "Check-in concluído. Mais um passo na sua evolução."

---

# Comportamento

- **Estado local `selectedDayFeeling`:** Inicializado com a opção `'Normal'`. Permite alternar entre as 3 opções de sentimento do dia.
- **Estado local `checkInCompleted`:** Controla se o check-in foi concluído (padrão `false`).
- **Ação `handleCheckIn`:**
  - Acionada ao clicar em "Concluir check-in".
  - Define `checkInCompleted` como `true`, desabilitando o botão e exibindo o card de feedback de sucesso.
  - Imprime no console os dados enviados ao motor para integração futura:
    ```javascript
    console.log('[GLPY] check_in_completed:', {
      selectedDayFeeling,
      resumo: RESUMO_ITEMS.map(i => ({ id: i.id, done: i.done })),
      xp: 80,
      streak: 12,
    });
    ```

---

# Conexões Futuras (Pós-MVP)

- **DailyTrackingEngine:** Para consolidar dinamicamente os registros reais ao invés de dados estáticos do MVP.
- **XP/Streak Engine:** Para persistir e computar a pontuação de experiência real e dias de streak do usuário.
- **GLPY IA:** Para correlacionar dados de hidratação, alimentação, sintomas, humor e atividade com recomendações metabólicas inteligentes.

---

# Arquivo Implementado

src/screens/operational/CheckInScreen.tsx

---

# Rota Preview

http://localhost:3001/preview/check-in

*Nota: Rota isolada implementada via dynamic import em src/main.tsx.*

---

# Observação Oficial

Esta tela é o padrão operacional Light Premium para check-in diário do ecossistema GLPY.
Ela é projetada especificamente para consolidar a rotina em uma experiência estimulante, gerando sentimento de progresso e micro recompensa visual ao usuário.

Não alterar essa tela sem nova solicitação explícita.

---

# Status Final

APPROVED — READY FOR MVP
