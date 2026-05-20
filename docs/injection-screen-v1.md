# GLPY — Injection Screen V1

Status: APPROVED — READY FOR MVP
Version: V1
Date: 2026-05-19

---

# Nome da Tela

Injection Screen

---

# Objetivo

Criar a tela de registro de aplicação GLP-1 do GLPY-V1, consolidando próxima aplicação, última aplicação, configurações do tratamento, local da aplicação e efeitos em uma única experiência operacional.

O dado é utilizado para:

- acompanhar a rotina de aplicação da caneta GLP-1
- correlacionar dose, sintomas, hidratação, alimentação e evolução
- alimentar a GLPY IA com padrões de tratamento
- compor o histórico de aplicações na Results Screen
- compor dados do TreatmentTrackingEngine (futuro)

---

# Observação de Segurança

Esta tela não substitui orientação médica e apenas registra dados informados pelo usuário.
O GLPY não recomenda dose, medicamento, frequência ou tratamento.
Todos os dados exibidos são informados pelo próprio usuário ou configurados por ele na TreatmentSettingsScreen.

---

# Tema Oficial

LIGHT PREMIUM

Sistema: Operational
Categoria: Tracking Diário

---

# Componentes Usados

- GLPYScreen (variant: light)
- GLPYHeader (com botão voltar + título)
- GLPYCard (variant: light) × 5 — cards de conteúdo
- GLPYCard (variant: light, tinted) — dica GLPY
- GLPYButton (variant: secondary, size: sm) — "Registrar sintomas"
- GLPYButton (variant: primary, size: lg, fullWidth) — CTA
- SiteChip (componente local) × 3 — seletor de local de aplicação

Todos os componentes base são de src/components/ui/.
Todos os tokens são de src/theme/.

---

# Estrutura da Tela

## Header

- botão voltar
- título: Aplicação

## Grid 2 Colunas — Cards 1 e 2

Layout: `grid-template-columns: 1fr 1fr`, gap: gap.small

### Card 1 — Próxima aplicação

- icon wrap 26×26: CalendarDays (greenDark)
- título: "Próxima aplicação" — 11px, secondary, flex: 1
- badge pill: "Semanal" — 10px, brand.green tint, greenDark text
- valor principal: "Qui, 21 mai" — fontSize h3 (22px), fontWeight h1 (700), navy
- subvalor: "em 3 dias" — fontSize small (14px), secondary

### Card 2 — Última aplicação

- icon wrap 26×26: Clock (greenDark)
- título: "Última aplicação" — 11px, secondary, flex: 1
- espaçador invisível (alinha verticalmente com badge do Card 1)
- valor principal: dose MVP ("2,5 mg") — fontSize h3, fontWeight h1, navy
- subvalor: "há 4 dias · Mounjaro" — fontSize small, secondary

## Microtexto Disclaimer

Texto entre o grid e os cards inferiores:
"Registre apenas informações já orientadas pelo seu profissional de saúde."

- fontSize: 12px
- color: text.secondary
- textAlign: center
- opacity: 0.75

## Card 3 — Configurações do tratamento

- icon wrap 32×32: Settings2 (greenDark)
- título: "Configurações do tratamento" — fontSize bodyDefault, navy

3 config rows tappáveis (label + value + ChevronRight):

| Label | Valor MVP |
|---|---|
| Medicação | Mounjaro |
| Frequência | Semanal |
| Dose atual | 2,5 mg |

- cada row: paddingTop/Bottom 11px, borderBottom soft (exceto último)
- label: fontSize small, secondary
- valor: fontSize small, fontWeight h3, navy
- ChevronRight: 14px, border.soft color
- ao tocar: console.log → TreatmentSettingsScreen (futuro)
- footer: "Toque para ajustar seus dados" — 12px, greenDark, textAlign right

## Card 4 — Local da aplicação

- icon wrap 32×32: MapPin (greenDark)
- título: "Local da aplicação" — fontSize bodyDefault, navy
- SiteChip × 3 em flex row:

| ID | Label |
|---|---|
| abdomen | Abdômen |
| thigh | Coxa |
| arm | Braço |

Seleção padrão: abdomen

## Card 5 — Efeitos após aplicação

- icon wrap 32×32: Activity (greenDark)
- título: "Efeitos após aplicação" — fontSize bodyDefault, navy
- texto: "Acompanhe sintomas ou desconfortos depois da dose." — fontSize small, secondary
- GLPYButton secondary sm: "Registrar sintomas" → console.log → SideEffectsScreen (futuro)

## Dica GLPY

- ícone: Lightbulb (greenDark)
- título: Dica GLPY
- texto: "Registrar sua rotina de aplicação ajuda a GLPY IA a entender padrões entre dose, sintomas, hidratação, alimentação e evolução."
- fundo tintado: brand.green a 8% + borda brand.green 20%

## Botão

- texto: "Registrar aplicação"
- variante: primary
- tamanho: lg
- fullWidth: true
- sempre habilitado (selectedSite sempre tem valor)

---

# Comportamento

- estado local selectedSite inicializado em 'abdomen'
- medication, dose, frequency são fixos (MVP PLACEHOLDER):
  - medication = 'Mounjaro'
  - dose = '2,5 mg'
  - frequency = 'Semanal'
- ao tocar config row: console.log → TreatmentSettingsScreen (futuro)
- ao tocar "Registrar sintomas": console.log → SideEffectsScreen (futuro)
- ao salvar: console.log com { medication, dose, frequency, site: selectedSite }
- prop onSave disponível para integração futura
- prop onBack disponível para navegação
- sem Firebase ainda
- sem recomendação médica
- sem APIs

---

# SiteChip — Padrão Visual

Componente local, equivalente a PaceCard, UnitCard e MealChip.

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
- padding: 10px 8px
- borderRadius: radius.secondary (18px)
- textAlign: center
- text-only (sem ícone)
- role="button", aria-pressed

---

# MVP PLACEHOLDER

Os seguintes dados são fixos no MVP e futuramente virão do perfil de tratamento do usuário:

- medication = 'Mounjaro'
- dose = '2,5 mg'
- frequency = 'Semanal'
- "Qui, 21 mai" e "em 3 dias" (próxima aplicação) — placeholder de data
- "há 4 dias" (última aplicação) — placeholder de intervalo

---

# Conexões Futuras

- **TreatmentSettingsScreen** — ao tocar qualquer config row (Medicação, Frequência, Dose atual)
- **SideEffectsScreen** — ao tocar "Registrar sintomas" no Card 5
- **TreatmentTrackingEngine** — histórico de aplicações, lembretes, correlação com sintomas e padrões

---

# Arquivo Implementado

src/screens/operational/InjectionScreen.tsx

---

# Rota Preview

http://localhost:3000/preview/injection

Rota isolada — App.tsx não é montado nessa rota.
Implementada via dynamic import em src/main.tsx.

---

# Observação Oficial

Esta tela é o hub operacional Light Premium para registro de aplicação GLP-1 do GLPY-V1.

Ela consolida 5 seções em uma única experiência: próxima aplicação, última aplicação, configurações, local e efeitos.

O grid 2 colunas dos Cards 1 e 2 é a referência para exibição de métricas pareadas em cards compactos do sistema operacional.

O Card 3 (config rows) é a referência para listas de configuração tappáveis dentro de cards, com footer de instrução em greenDark.

Não modificar esta tela sem nova solicitação explícita.

---

# Status Final

APPROVED — READY FOR MVP
