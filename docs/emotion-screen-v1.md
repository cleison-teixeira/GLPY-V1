# GLPY — Emotion Screen V1

Status: APPROVED — READY FOR MVP
Version: V1
Date: 2026-05-19

---

# Nome da Tela

Emotion Screen

---

# Objetivo

Criar a tela de registro emocional diário do GLPY-V1, permitindo que o usuário registre como está se sentindo durante a jornada metabólica.

O dado é utilizado para:

- acompanhar padrões emocionais ao longo da jornada
- correlacionar humor, energia, alimentação, aplicação, sintomas, sono e evolução
- alimentar a GLPY IA com contexto emocional para identificação de padrões
- compor o histórico emocional na Results Screen (futuro)

A EmotionScreen completa o tracking humano diário junto com:
- WaterScreen
- FoodLogScreen
- InjectionScreen
- SideEffectsScreen

---

# Observação de Segurança

Esta tela não diagnostica, trata ou substitui acompanhamento psicológico, psiquiátrico ou médico.
O GLPY apenas registra emoções informadas pelo próprio usuário.

---

# Tema Oficial

LIGHT PREMIUM

Sistema: Operational
Categoria: Tracking Diário

---

# Componentes Usados

- GLPYScreen (variant: light)
- GLPYHeader (com botão voltar + título)
- GLPYCard (variant: light) × 4 — cards de conteúdo
- GLPYCard (variant: light, tinted) — dica GLPY
- GLPYButton (variant: primary, size: lg, fullWidth) — CTA principal
- EnergyChip (componente local) × 3 — seleção de energia emocional
- MoodModal (componente local) — bottom sheet single-select
- MoodRow (componente local) — linha reutilizável na bottom sheet

Todos os componentes base são de src/components/ui/.
Todos os tokens são de src/theme/.

---

# Estrutura da Tela

## Header

- botão voltar
- título: Emoção

## Card 1 — Como você está se sentindo?

- headline: "Como você está se sentindo hoje?" — fontSize h3 (22px), fontWeight h1 (700), navy, lineHeight 1.3
- subtexto: "Registre sua emoção para acompanhar padrões entre alimentação, aplicação, sono e evolução." — fontSize small, secondary, lineHeight 1.5

## Card 2 — Humor principal

- icon wrap 32×32: Smile (greenDark)
- título: "Humor principal" — fontSize bodyDefault, fontWeight h3, navy
- selector row compacto (56px, radius.input 20px, border.soft, sombra soft):
  - valor à esquerda: humor selecionado (sempre exibe valor pois selectedMood inicia em "Bem")
  - ChevronRight à direita
  - ao tocar: abre MoodModal (bottom sheet)

### Observação de UX

O humor principal usa bottom sheet/modal compacto para manter a tela principal limpa.
A lista de 8 opções de humor não é exibida diretamente na tela — apenas o valor selecionado aparece no selector row.

## Card 3 — Energia emocional

- icon wrap 32×32: Zap (greenDark)
- título: "Energia emocional" — fontSize bodyDefault, fontWeight h3, navy
- EnergyChip × 3 em flex row: Baixa / Média / Alta
- seleção padrão: Média

## Card 4 — Observação

- icon wrap 32×32: PenLine (greenDark)
- título: "Observação" — fontSize bodyDefault, fontWeight h3, navy
- textarea nativa estilizada:
  - minHeight: 80px
  - placeholder: "Ex: hoje acordei mais sensível, mas consegui manter minha rotina."
  - focus: border brand.green 2px + glow 3px brand.green18
  - blur: border border.soft 1.5px
  - sem resize
  - campo opcional

## Card 5 — Dica GLPY

- ícone: Lightbulb (greenDark)
- título: Dica GLPY
- texto: "Registrar suas emoções ajuda a GLPY IA a entender como sua jornada metabólica se conecta com energia, fome, sintomas e consistência."
- fundo tintado: brand.green a 8% + borda brand.green 20%

## Botão

- texto: "Salvar emoção"
- variante: primary
- tamanho: lg
- fullWidth: true
- sempre habilitado (selectedMood e selectedEnergy sempre têm valor inicial)

---

# MoodModal — Bottom Sheet Single-Select

## Estrutura

- backdrop: position fixed, rgba(22,33,62,0.35), zIndex 100
- panel: position fixed, bottom 0, left 50%, transform translateX(-50%), width 100%, maxWidth 430, maxHeight 78vh, borderRadius 24px 24px 0 0, zIndex 200
- display flex column, overflow hidden
- handle bar: 40×4px, borderRadius 99, background border.soft, margin 14px auto 0, flexShrink 0
- header: padding 16px screen 12px, flexShrink 0
- título: "Selecionar humor" — fontSize bodyLarge, fontWeight h2, navy
- lista: overflowY auto, flex 1, paddingLeft/Right screen, paddingBottom 24px
- footer: paddingLeft/Right screen, paddingTop small, paddingBottom 28, flexShrink 0, borderTop border.soft
- footer contém safety block: background secondary, border soft, borderRadius 14, padding 10px 14px, fontSize 12px, textAlign center

## Humores disponíveis (8 opções)

| Humor |
|---|
| Bem |
| Calma |
| Ansiosa |
| Cansada |
| Irritada |
| Triste |
| Confiante |
| Desmotivada |

## Comportamento

- single-select: apenas um humor selecionado por vez
- ao tocar em qualquer opção: atualiza selectedMood e fecha o modal imediatamente
- ao clicar no backdrop: fecha sem alterar (mantém seleção atual)
- sem botão "Confirmar" — fechamento automático ao selecionar

---

# MoodRow — Padrão Visual

Componente local da bottom sheet. Single-select (mesmo padrão de SheetRow do TreatmentSettingsScreen).

Estado selecionado:
- label: `brand.greenDark`, fontWeight h3
- ícone Check verde à direita
- transição: all 0.18s ease

Estado não selecionado:
- label: `text.navy`, fontWeight 400
- sem ícone

Estrutura:
- padding: 15px 0
- borderBottom: 1px solid border.soft (exceto último item)
- cursor: pointer
- role="option", aria-selected

---

# EnergyChip — Padrão Visual

Componente local, mesmo padrão de IntensityChip (SideEffectsScreen). Single-select.

Estado selecionado:
- fundo: brand.green a 8% de opacidade
- borda: 2px solid brand.green
- glow: 0 0 0 3px brand.green18
- label: text.navy, fontWeight h3

Estado não selecionado:
- fundo: background.card
- borda: 1.5px solid border.soft
- sombra: lightShadows.soft
- label: text.secondary, fontWeight h3

Estrutura:
- flex: 1 (ocupam largura igual no row)
- padding: 12px 8px
- borderRadius: radius.secondary (18px)
- textAlign: center
- text-only (sem ícone)
- role="button", aria-pressed

---

# Comportamento

- estado local selectedMood inicializado em 'Bem'
- estado local selectedEnergy inicializado em 'Média'
- estado local note inicializado em ''
- estado local moodModalOpen inicializado em false
- CTA "Salvar emoção" sempre habilitado (selectedMood e selectedEnergy sempre têm valor)
- ao salvar: console.log com { mood, energy, note }
- prop onSave disponível para integração futura
- prop onBack disponível para navegação
- sem Firebase ainda
- sem diagnóstico emocional
- sem APIs

---

# Observação Futura — GLPY IA

Futuramente esta tela poderá ser conectada à GLPY IA para identificar padrões entre emoção, alimentação, aplicação, sintomas, sono e evolução.

No MVP, os dados são registrados apenas via console.log.

---

# Conexões Futuras

- **GLPY IA** — identificação de padrões entre emoção, alimentação, aplicação, sintomas, sono e evolução
- **TreatmentTrackingEngine** — correlação entre humor, energia e rotina de aplicação
- **Results Screen** — histórico emocional e evolução ao longo da jornada

---

# Arquivo Implementado

src/screens/operational/EmotionScreen.tsx

---

# Rota Preview

http://localhost:3000/preview/emotion

Rota isolada — App.tsx não é montado nessa rota.
Implementada via dynamic import em src/main.tsx.

---

# Observação Oficial

Esta tela é o hub operacional Light Premium para registro emocional diário do GLPY-V1.

Ela consolida 3 seções em uma única experiência: humor principal (single-select via bottom sheet compacto), energia emocional (3-way chip) e observação livre (textarea).

O padrão MoodModal (bottom sheet single-select com fechamento automático ao selecionar) segue o mesmo padrão do seletor de medicamento do TreatmentSettingsScreen.

O padrão EnergyChip é equivalente ao IntensityChip do SideEffectsScreen.

Não modificar esta tela sem nova solicitação explícita.

---

# Status Final

APPROVED — READY FOR MVP
