# GLPY — Activity Screen V1

Status: APPROVED — READY FOR MVP
Version: V1
Date: 2026-05-19

---

# Nome da Tela

Activity Screen

---

# Objetivo

Criar a tela de registro de atividade física do GLPY-V1, permitindo que o usuário registre tipo de atividade, duração, intensidade e observação opcional.

A tela complementa o tracking operacional diário junto com:
- WaterScreen
- FoodLogScreen
- InjectionScreen
- EmotionScreen
- SideEffectsScreen
- BodyMeasurementsScreen
- PhotoTimelineScreen

O GLPY não substitui orientação profissional de atividade física.
Apenas registra informações informadas pelo próprio usuário.

---

# Tema Oficial

LIGHT PREMIUM

Sistema: Operational
Categoria: Tracking Diário

---

# Componentes Usados

- GLPYScreen (variant: light)
- GLPYHeader (com botão voltar + título "Atividade")
- GLPYCard (variant: light) × 6 — cards de conteúdo
- GLPYInput (centerWithUnit, unit: "min") — apenas dentro da bottom sheet de duração personalizada
- GLPYButton (variant: primary, size: lg, fullWidth) — CTA principal
- GLPYButton (variant: primary, size: md, fullWidth) — "Confirmar duração" dentro da sheet

Todos os componentes base são de src/components/ui/.
Todos os tokens são de src/theme/.

---

# Estrutura da Tela

## Header

- botão voltar
- título: Atividade

## Card 1 — Movimento de hoje

- icon wrap 32×32: Flame (greenDark)
- summary block dinâmico (background.secondary, borderRadius secondary, padding 12px 16px):

| Label | Valor (dinâmico) |
|---|---|
| Hoje | selectedDuration min |
| Intensidade | selectedIntensity |
| Estimativa | calculatedCalories kcal |

Os valores refletem os estados selecionados em tempo real.

## Card 2 — Tipo de atividade

- icon wrap 32×32: Activity (greenDark)
- título: "Tipo de atividade"
- subtexto: "Escolha o movimento que você realizou hoje."
- seletor compacto (56px, radius 20, borda soft, sombra):
  `[ Caminhada  > ]`
- ao clicar: abre ActivityModal

## Card 3 — Duração

- icon wrap 32×32: Zap (greenDark)
- título: "Duração"
- subtexto: "Informe quanto tempo você se movimentou."
- seletor compacto:
  `[ 30 min  > ]`
- ao clicar: abre DurationModal

## Card 4 — Intensidade

- icon wrap 32×32: Flame (greenDark)
- título: "Intensidade"
- subtexto: "Como foi o esforço dessa atividade?"
- seletor compacto:
  `[ Moderada  > ]`
- ao clicar: abre IntensityModal

## Card 5 — Registro adicional

- icon wrap 32×32: PenLine (greenDark)
- título: "Registro adicional"
- bloco summary (background.secondary): Calorias estimadas | X kcal
- label "OBSERVAÇÃO" uppercase + textarea opcional

## Card 6 — Dica GLPY

- ícone: Lightbulb (greenDark)
- título: Dica GLPY
- texto: "Registrar movimento ajuda a GLPY IA a entender como sua energia, fome, sintomas e evolução respondem à sua rotina."
- fundo tintado: brand.green 14% + borda brand.green 20%

## Botão Principal

- texto: "Registrar atividade"
- variante: primary
- tamanho: lg
- fullWidth: true
- desabilitado se selectedActivity vazio, selectedDuration ≤ 0 ou selectedIntensity vazio

---

# Bottom Sheets

## ActivityModal — Tipo de atividade

Título: "Selecionar atividade"
Lista de 12 opções com ícone + label + check no selecionado:

| ID | Label | Ícone |
|---|---|---|
| caminhada | Caminhada | Footprints |
| corrida | Corrida | Wind |
| musculacao | Musculação | Dumbbell |
| ciclismo | Ciclismo | Bike |
| natacao | Natação | Waves |
| yoga | Yoga | Leaf |
| alongamento | Alongamento | MoveVertical |
| pilates | Pilates | Layers |
| danca | Dança | Music |
| trilha | Trilha | Mountain |
| eliptico | Elíptico | RotateCw |
| outro | Outro | Activity |

Ao selecionar: atualiza `selectedActivity` e fecha o modal.

## DurationModal — Duração

Título: "Selecionar duração"
Presets: 10 / 20 / 30 / 45 / 60 min → seleção fecha o modal imediatamente
Opção "Personalizada" → exibe GLPYInput `unit="min"` + botão "Confirmar duração"

Regras:
- check aparece no preset que corresponde ao selectedDuration
- se selectedDuration não é preset, check aparece em "Personalizada"
- "Confirmar duração" desabilitado se customDuration ≤ 0

## IntensityModal — Intensidade

Título: "Selecionar intensidade"
Opções: Leve / Moderada / Intensa
Ao selecionar: atualiza `selectedIntensity` e fecha o modal.

Padrão de todas as sheets:
- `position: fixed, bottom: 0, left: 50%, transform: translateX(-50%)`
- `width: 100%, maxWidth: 430, maxHeight: 78vh`
- `borderRadius: 24px 24px 0 0`
- `boxShadow: '0 -8px 32px rgba(0,0,0,0.12)'`
- handle bar: 36×4px, borderRadius 2, background.secondary, margin 14px auto 0
- backdrop: `rgba(0,0,0,0.30)`, zIndex 99; sheet zIndex 100
- fechar por backdrop ou ao selecionar item

---

# Comportamento

## Estado inicial

- `selectedActivity = 'caminhada'`
- `activityModalOpen = false`
- `selectedDuration = '30'`
- `durationModalOpen = false`
- `showCustomInput = false`
- `customDuration = '30'`
- `selectedIntensity = 'Moderada'`
- `intensityModalOpen = false`
- `note = ''`

## calculateCalories

```ts
// cálculo mockado para MVP, será refinado futuramente
const INTENSITY_MULTIPLIER = { 'Leve': 3, 'Moderada': 4, 'Intensa': 6 };
function calculateCalories(duration: string, intensity: string): number {
  const d = parseFloat(duration) || 0;
  return Math.round(d * (INTENSITY_MULTIPLIER[intensity] ?? 4));
}
```

Resultado exibido em Card 1 (summary) e Card 5 (calorias estimadas).
Atualiza em tempo real conforme o usuário altera duração e intensidade.

## Ao salvar

```
console.log('[GLPY] Activity saved:', {
  selectedActivity,
  selectedDuration,
  selectedIntensity,
  calculatedCalories,
  note,
})
```

- sem Firebase
- sem API
- sem cálculo real de calorias
- sem integração externa

---

# MVP Placeholder

Os dados do summary em Card 1 são dinâmicos e refletem os seletores em tempo real.
A estimativa de calorias é calculada localmente com multiplicadores fixos mockados.
As calorias não são clinicamente exatas — apenas uma referência motivacional.

---

# Observação de Segurança

O GLPY não substitui orientação profissional de atividade física.
Todos os dados registrados são informados pelo próprio usuário.
A estimativa de calorias é meramente indicativa e não constitui prescrição de exercício.

---

# Observação Futura

Futuramente esta tela poderá:

- conectar ao ActivityTrackingEngine para cálculo mais preciso de calorias
- exibir histórico de atividades com gráficos de frequência e evolução
- correlacionar atividade com peso, fome, energia e sintomas
- definir metas de movimento semanal
- integrar com GLPY IA para padrões e sugestões personalizadas

No MVP, todos os dados são registrados apenas via console.log.

---

# Arquivo Implementado

src/screens/operational/ActivityScreen.tsx

---

# Rota Preview

http://localhost:3000/preview/activity

Rota isolada — App.tsx não é montado nessa rota.
Implementada via dynamic import em src/main.tsx.

---

# Observação Oficial

Esta tela é o padrão operacional Light Premium para registro de atividade física do GLPY-V1.

O padrão de 3 seletores compactos + bottom sheets (atividade / duração / intensidade) é a referência para telas operacionais com múltiplas escolhas discretas que precisam manter a tela principal curta e sem dobra excessiva.

O padrão "Personalizada" no DurationModal (preset + input + confirmar) segue o mesmo padrão do TreatmentSettingsScreen (frequência personalizada).

Não modificar esta tela sem nova solicitação explícita.

---

# Status Final

APPROVED — READY FOR MVP
