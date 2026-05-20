# GLPY — Treatment Settings Screen V1

Status: APPROVED — READY FOR MVP
Version: V1
Date: 2026-05-19

---

# Nome da Tela

Treatment Settings Screen

---

# Objetivo

Criar a tela de configuração do tratamento GLP-1 do GLPY-V1, permitindo que o usuário registre medicamento, frequência e dose atual conforme orientação do seu profissional de saúde.

O dado é utilizado para:

- organizar a jornada de acompanhamento da caneta GLP-1
- alimentar a GLPY IA com contexto de tratamento para padrões e lembretes
- compor o histórico de tratamento na Results Screen
- correlacionar dose, frequência, sintomas e evolução no TreatmentTrackingEngine (futuro)

---

# Tema Oficial

LIGHT PREMIUM

Sistema: Operational
Categoria: Configuração de Tratamento

---

# Componentes Usados

- GLPYScreen (variant: light)
- GLPYHeader (com botão voltar + título)
- GLPYCard (variant: light) — card medicamento
- GLPYCard (variant: light) — card frequência
- GLPYCard (variant: light) — card dose atual
- GLPYCard (variant: light, tinted) — card dica GLPY
- GLPYInput (centerWithUnit, unit: "mg") — campo de dose
- GLPYInput (centerWithUnit, unit: "dias") — campo de frequência personalizada (dentro da bottom sheet)
- GLPYButton (variant: primary, size: lg, fullWidth) — CTA
- GLPYButton (variant: primary, size: md, fullWidth) — "Confirmar frequência" (dentro da bottom sheet)
- SheetRow (componente local) — linha reutilizável nas duas bottom sheets
- Bottom sheet Medicamento — modal fixo no rodapé
- Bottom sheet Frequência — modal fixo no rodapé

Todos os componentes base são de src/components/ui/.
Todos os tokens são de src/theme/.

---

# Estrutura da Tela

## Header

- botão voltar
- título: Configurações do Tratamento

## Card Medicamento

- ícone: Pill
- título: Medicamento
- texto de apoio: "Escolha a caneta que você usa ou pretende usar."
- selector row (56px, radius 20, sombra soft):
  - valor atual à esquerda (ex: Mounjaro®)
  - ChevronRight à direita
- ao tocar: abre bottom sheet Medicamento

## Card Frequência

- ícone: CalendarDays
- título: Frequência
- texto de apoio: "Registre o intervalo entre suas aplicações."
- selector row (56px, radius 20, sombra soft):
  - valor atual à esquerda (ex: Semanal / Personalizada · 7 dias)
  - ChevronRight à direita
- ao tocar: abre bottom sheet Frequência

## Card Dose atual

- ícone: Droplets
- título: Dose atual
- texto de apoio: "Informe a dose que você já utiliza."
- GLPYInput com centerWithUnit, unit="mg", valor inicial "2,5"
- aceita vírgula e ponto

## Card Dica GLPY

- ícone: Lightbulb
- título: Dica GLPY
- texto: "Registre apenas informações já orientadas pelo seu profissional de saúde. O GLPY usa esses dados para organizar sua jornada, lembretes e padrões de sintomas."
- fundo tintado: brand.green a 8% + borda brand.green 20%

## Botão

- mode="onboarding": "Continuar"
- mode="edit": "Salvar tratamento" (default)
- variante: primary
- tamanho: lg
- fullWidth: true
- desabilitado se dose estiver vazia ou ≤ 0

---

# Bottom Sheet — Medicamento

Título: Selecionar medicamento

Lista vertical de SheetRow com 16 opções:

| Opção |
|---|
| Zepbound® |
| Mounjaro® |
| Ozempic® |
| Retatrutida® |
| Wegovy® |
| Trulicity® |
| Saxenda® |
| Victoza® |
| Olire® |
| Rybelsus® |
| TG (Tirzepatida Genérica) |
| LipoLass® |
| Semaglutida Composta |
| Tirzepatida Composta |
| Outro |
| Ainda não decidi |

Seleção padrão: Mounjaro®

- item selecionado: label verde (brand.greenDark), fontWeight h3, ícone Check verde à direita
- ao selecionar: atualiza selectedMedication e fecha a sheet
- footer com safety block: "Registre apenas o medicamento informado pelo seu profissional de saúde."

---

# Bottom Sheet — Frequência

Título: Selecionar frequência

Lista vertical de SheetRow com 7 opções:

| Opção |
|---|
| Diária |
| Semanal |
| A cada 10 dias |
| A cada 14 dias |
| Mensal |
| Personalizada |
| Ainda não defini |

Seleção padrão: Semanal

- item selecionado: label verde, fontWeight h3, ícone Check verde à direita
- ao selecionar opção fixa: atualiza selectedFrequency e fecha a sheet
- ao selecionar "Personalizada": mantém a sheet aberta e exibe no footer:
  - label: "Intervalo entre aplicações"
  - GLPYInput (centerWithUnit, unit="dias", placeholder="7")
  - GLPYButton primary md fullWidth: "Confirmar frequência" (desabilitado se valor ≤ 0)
- ao confirmar Personalizada: atualiza selectedFrequency e customFrequencyDays, fecha a sheet
- display na tela principal quando Personalizada: "Personalizada · X dias"
- footer sempre visível com safety block: "Use apenas o intervalo orientado pelo seu profissional de saúde."

---

# Comportamento

- estado local selectedMedication inicializado em 'Mounjaro®'
- estado local selectedFrequency inicializado em 'Semanal'
- estado local customFrequencyDays inicializado em '7'
- estado local dose inicializado em '2,5'
- estado local medModalOpen inicializado em false
- estado local freqModalOpen inicializado em false
- botão CTA desabilitado se dose vazia ou parseFloat(dose) ≤ 0
- ao salvar: console.log com contexto do mode + { medication, frequency, customFrequencyDays, dose }
- prop onSave disponível para integração futura
- prop onBack disponível para navegação
- prop mode: 'onboarding' | 'edit' (default: 'edit')
- sem Firebase ainda
- sem recomendação médica
- sem APIs

---

# SheetRow — Padrão Visual

Componente local reutilizado por ambas as bottom sheets.

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

# Bottom Sheet — Estrutura Compartilhada

- backdrop: position fixed, rgba(22,33,62,0.35), zIndex 100
- panel: position fixed, bottom 0, left 50%, transform translateX(-50%), width 100%, maxWidth 430, maxHeight 80vh, borderRadius 24px 24px 0 0, zIndex 200
- handle bar: 40×4px, borderRadius 99, background border.soft, margin 14px auto 0
- título: fontSize bodyLarge, fontWeight h2, navy
- lista: overflowY auto, flex 1
- footer: paddingTop medium, paddingBottom 32, flexShrink 0
- safety block: background secondary (#F7F8FA), border soft, borderRadius 14, padding 10px 14px, fontSize small, textAlign center

---

# Prop mode

Permite reutilizar a tela em dois contextos:

| mode | Label do CTA | Console |
|---|---|---|
| 'onboarding' | "Continuar" | [GLPY] Treatment saved (onboarding): ... |
| 'edit' (default) | "Salvar tratamento" | [GLPY] Treatment saved (edit): ... |

---

# Integração Futura — TreatmentTrackingEngine

No MVP, esta tela registra apenas dados locais/mockados.

Futuramente será integrada com:

- **TreatmentTrackingEngine** — histórico de tratamento, lembretes de aplicação e correlação com sintomas
- **InjectionScreen** — referência cruzada com local de aplicação e data
- **GLPY IA** — uso do perfil de tratamento para personalização de recomendações de hidratação, alimentação e progresso

O GLPY não recomenda, prescreve ou valida tratamentos médicos.

---

# Comentários obrigatórios no código

- Esta tela apenas registra informações informadas pelo usuário.
- O GLPY não recomenda frequência, dosagem, medicamento ou tratamento.
- Frequência personalizada existe apenas para registrar o intervalo informado pelo usuário, sem substituir orientação de profissional de saúde.
- Futuramente o TreatmentTrackingEngine poderá usar esses dados para lembretes e histórico, sem substituir orientação médica.

---

# Arquivo Implementado

src/screens/operational/TreatmentSettingsScreen.tsx

---

# Rota Preview

http://localhost:3000/preview/treatment-settings

Rota isolada — App.tsx não é montado nessa rota.
Implementada via dynamic import em src/main.tsx.

---

# Observação Oficial

Esta tela é o hub operacional Light Premium para configuração do tratamento GLP-1 do GLPY-V1.

Ela unifica Medicamento + Frequência + Dose em uma única tela compacta, usando bottom sheets para manter a tela principal limpa.

O padrão SheetRow (linha de lista com check no selecionado) é a referência para listas de seleção dentro de bottom sheets operacionais.

O padrão de selector row compacto (56px + ChevronRight → bottom sheet) é a referência para campos de seleção com muitas opções em cards operacionais.

Não modificar esta tela sem nova solicitação explícita.

---

# Status Final

APPROVED — READY FOR MVP
