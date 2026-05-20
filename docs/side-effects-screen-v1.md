# GLPY — Side Effects Screen V1

Status: APPROVED — READY FOR MVP
Version: V1
Date: 2026-05-19

---

# Nome da Tela

Side Effects Screen

---

# Objetivo

Criar a tela de registro de efeitos após aplicação GLP-1 do GLPY-V1, permitindo que o usuário registre sintomas, intensidade geral e observações livres.

O dado é utilizado para:

- acompanhar padrões de sintomas após cada aplicação
- correlacionar dose, sintomas, hidratação, alimentação e evolução
- alimentar a GLPY IA com contexto de tratamento para identificação de padrões
- compor o histórico de efeitos na Results Screen (futuro)
- compor dados do TreatmentTrackingEngine (futuro)

---

# Observação de Segurança

Esta tela não diagnostica, trata ou substitui orientação médica.
O GLPY apenas registra dados informados pelo usuário.
Todos os dados exibidos são informados pelo próprio usuário.

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
- GLPYButton (variant: primary, size: md, fullWidth) — "Confirmar sintomas" (dentro da bottom sheet)
- IntensityChip (componente local) × 3 — seleção de intensidade
- SymptomModal (componente local) — bottom sheet multi-select
- SymptomModalRow (componente local) — linha reutilizável na bottom sheet

Todos os componentes base são de src/components/ui/.
Todos os tokens são de src/theme/.

---

# Estrutura da Tela

## Header

- botão voltar
- título: Efeitos após aplicação

## Card 1 — Como você se sentiu?

- headline: "Como você se sentiu depois da aplicação?" — fontSize h3 (22px), fontWeight h1 (700), navy, lineHeight 1.3
- subtexto: "Registre sintomas ou desconfortos para acompanhar seus padrões ao longo da jornada." — fontSize small, secondary, lineHeight 1.5

## Card 2 — Sintomas

- icon wrap 32×32: HeartPulse (greenDark)
- título: "Sintomas" — fontSize bodyDefault, fontWeight h3, navy
- selector row compacto (56px, radius.input 20px, border.soft, sombra soft):
  - valor à esquerda (placeholder ou seleção atual)
  - ChevronRight à direita
  - ao tocar: abre SymptomModal (bottom sheet)
- display do valor:
  - 0 selecionados: "Selecionar sintomas" — cor secondary
  - 1 selecionado: nome do sintoma — cor navy
  - 2 selecionados: "Sintoma A · Sintoma B" — cor navy
  - 3 ou mais: "N sintomas selecionados" — cor navy

## Card 3 — Intensidade geral

- icon wrap 32×32: Gauge (greenDark)
- título: "Intensidade geral" — fontSize bodyDefault, fontWeight h3, navy
- IntensityChip × 3 em flex row: Leve / Moderada / Forte
- seleção padrão: Leve

## Card 4 — Observação

- icon wrap 32×32: PenLine (greenDark)
- título: "Observação" — fontSize bodyDefault, fontWeight h3, navy
- textarea nativa estilizada:
  - minHeight: 80px
  - placeholder: "Ex: senti náusea leve pela manhã, melhorou após me hidratar."
  - focus: border brand.green 2px + glow 3px brand.green18
  - blur: border border.soft 1.5px
  - sem resize

## Card 5 — Dica GLPY

- ícone: Lightbulb (greenDark)
- título: Dica GLPY
- texto: "Registrar sintomas ajuda a GLPY IA a identificar padrões entre aplicação, alimentação, hidratação e evolução. Isso não substitui orientação de um profissional de saúde."
- fundo tintado: brand.green a 8% + borda brand.green 20%

## Botão

- texto: "Salvar registro"
- variante: primary
- tamanho: lg
- fullWidth: true
- sempre habilitado (selectedIntensity sempre tem valor inicial)

---

# SymptomModal — Bottom Sheet Multi-Select

## Estrutura

- backdrop: position fixed, rgba(22,33,62,0.35), zIndex 100
- panel: position fixed, bottom 0, left 50%, transform translateX(-50%), width 100%, maxWidth 430, maxHeight 78vh, borderRadius 24px 24px 0 0, zIndex 200
- display flex column, overflow hidden
- handle bar: 40×4px, borderRadius 99, background border.soft, margin 14px auto 0, flexShrink 0
- header: padding 16px screen 12px, flexShrink 0
- título: "Selecionar sintomas" — fontSize bodyLarge, fontWeight h2, navy
- lista: overflowY auto, flex 1, paddingLeft/Right screen, paddingBottom 24px
- footer: paddingLeft/Right screen, paddingTop medium, paddingBottom 32, flexShrink 0, borderTop border.soft

## Sintomas disponíveis (14 opções)

| Sintoma |
|---|
| Náusea |
| Constipação |
| Refluxo |
| Fadiga |
| Dor no local |
| Dor de cabeça |
| Boca seca |
| Tontura |
| Diarreia |
| Baixo apetite |
| Compulsão |
| Ansiedade |
| Queda de cabelo |
| Nenhum sintoma |

## Comportamento

- multi-select: múltiplos Check icons visíveis simultaneamente
- "Nenhum sintoma" é exclusivo:
  - selecionar: limpa todos os demais e mantém apenas "Nenhum sintoma"
  - selecionar qualquer outro: remove "Nenhum sintoma" automaticamente
- ao clicar no backdrop: fecha sem confirmar (estado descartado)
- botão "Confirmar sintomas": sempre habilitado, confirma o estado pendente e fecha a sheet

## Estado pendente

- SymptomModal inicializa `pending` a partir de `selected` (prop)
- mudanças ficam em `pending` até confirmação explícita
- fechar sem confirmar descarta mudanças

---

# SymptomModalRow — Padrão Visual

Componente local da bottom sheet. Multi-select (diferente de SheetRow que é single-select).

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

# IntensityChip — Padrão Visual

Componente local, equivalente a PaceCard, UnitCard e MealChip. Single-select.

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

- estado local selectedSymptoms inicializado em []
- estado local selectedIntensity inicializado em 'Leve'
- estado local note inicializado em ''
- estado local modalOpen inicializado em false
- CTA "Salvar registro" sempre habilitado (selectedIntensity sempre tem valor)
- ao salvar: console.log com { symptoms, intensity, note }
- prop onSave disponível para integração futura
- prop onBack disponível para navegação
- sem Firebase ainda
- sem diagnóstico médico
- sem APIs

---

# Conexões Futuras

- **TreatmentTrackingEngine** — histórico de efeitos, correlação com dose, frequência e evolução
- **GLPY IA** — identificação de padrões entre aplicação, sintomas, hidratação e alimentação
- **InjectionScreen** — referência cruzada com local e data de aplicação

---

# Arquivo Implementado

src/screens/operational/SideEffectsScreen.tsx

---

# Rota Preview

http://localhost:3000/preview/side-effects

Rota isolada — App.tsx não é montado nessa rota.
Implementada via dynamic import em src/main.tsx.

---

# Observação Oficial

Esta tela é o hub operacional Light Premium para registro de efeitos após aplicação GLP-1 do GLPY-V1.

Ela consolida 3 seções em uma única experiência: seleção de sintomas (multi-select via bottom sheet), intensidade geral (3-way chip) e observação livre (textarea).

O padrão SymptomModal (bottom sheet multi-select com estado pendente + confirmação explícita) é a referência para seleção múltipla em bottom sheets operacionais.

A regra de exclusividade do "Nenhum sintoma" é obrigatória: selecionar limpa os demais; selecionar qualquer outro remove "Nenhum sintoma".

Não modificar esta tela sem nova solicitação explícita.

---

# Status Final

APPROVED — READY FOR MVP
