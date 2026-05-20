# GLPY — Food Log Screen V1

Status: APPROVED — READY FOR MVP
Version: V1
Date: 2026-05-19

---

# Nome da Tela

Food Log Screen

---

# Objetivo

Criar a tela de registro de refeição do GLPY-V1, unificando foto do prato e registro alimentar em uma única experiência operacional.

O dado é utilizado para:

- acompanhar padrões alimentares ao longo da jornada
- alimentar a GLPY IA com dados de fome, proteína e energia
- compor o histórico de refeições na Results Screen
- calibrar recomendações metabólicas por fase GLP-1

---

# Tema Oficial

LIGHT PREMIUM

Sistema: Operational
Categoria: Tracking Diário

---

# Componentes Usados

- GLPYScreen (variant: light)
- GLPYHeader (com botão voltar + título)
- GLPYCard (variant: light) — card foto do prato
- GLPYCard (variant: light) — card tipo de refeição
- GLPYCard (variant: light) — card descrição
- MealChip (componente local) × 4 — seletor de tipo em grid 2×2
- GLPYCard (variant: light, tinted) — card dica GLPY
- GLPYButton (variant: secondary, size: sm) — botão "Adicionar foto"
- GLPYButton (variant: primary, size: lg, fullWidth) — CTA

Todos os componentes base são de src/components/ui/.
Todos os tokens são de src/theme/.

---

# Estrutura da Tela

## Header

- botão voltar
- título: Refeição

## Card Foto do Prato

- título: Foto do prato (ícone Camera)
- área central: ícone grande (56×56)
  - sem foto: Camera cinza + "Adicione uma foto para acompanhar sua alimentação."
  - com foto: Check verde + "Foto adicionada com sucesso."
- botão secundário: "Adicionar foto" / "Alterar foto"

## Card Tipo de Refeição

- título: Tipo de refeição (ícone Utensils)
- grid 2×2 de MealChips:

| ID        | Label         | Ícone    |
|-----------|---------------|----------|
| breakfast | Café da manhã | Coffee   |
| lunch     | Almoço        | Utensils |
| dinner    | Jantar        | Moon     |
| snack     | Lanche        | Apple    |

Seleção padrão: lunch (Almoço)

## Card Descrição da Refeição

- título: Descrição da refeição (ícone Utensils)
- textarea nativa estilizada:
  - mesmo visual de GLPYInput (border, radius, font, focus ring verde)
  - minHeight: 80px, resize: none
  - placeholder: "Ex: frango, arroz, salada e feijão"

## Card Dica GLPY

- ícone: Lightbulb (lucide-react)
- título: Dica GLPY
- texto: Registrar suas refeições ajuda a GLPY IA a entender seus padrões de fome, proteína e energia ao longo da jornada.

## Botão

- texto: Salvar refeição
- variante: primary
- tamanho: lg
- fullWidth: true
- sempre habilitado (mealType tem valor padrão)

---

# Comportamento

- estado local `mealType` inicializado em 'lunch'
- estado local `description` inicializado em ''
- estado local `photoAdded` inicializado em false
- ao clicar "Adicionar foto": console.log + photoAdded = true
- botão "Salvar refeição" sempre habilitado enquanto mealType estiver definido
- ao salvar: console.log com { mealType, description, photoAdded } — sem Firebase ainda
- prop onSave disponível para integração futura
- prop onBack disponível para navegação

---

# MealChip — Padrão Visual

Componente local, equivalente ao PaceCard e UnitCard.

Estado selecionado:
- fundo: `brand.green` a 8% de opacidade
- borda: `2px solid brand.green`
- glow: `0 0 0 3px brand.green18`
- ícone e label: `text.navy` / `brand.greenDark`

Estado não selecionado:
- fundo: `background.card`
- borda: `1.5px solid border.soft`
- ícone e label: `text.secondary`

---

# Integração Futura — MealInsightEngine

No MVP, esta tela registra apenas dados locais/mockados.

Futuramente será integrada com:

- **FatSecret API** — base de dados de alimentos e macros
- **AI Image Recognition** — análise automática de foto do prato
- **NLP** — interpretação de descrição em linguagem natural

Toda essa integração será feita por um **MealInsightEngine** centralizado.

O comentário de integração futura está presente no topo do arquivo implementado.

---

# Arquivo Implementado

src/screens/operational/FoodLogScreen.tsx

---

# Rota Preview

http://localhost:3000/preview/food-log

Rota isolada — App.tsx não é montado nessa rota.
Implementada via dynamic import em src/main.tsx.

---

# Observação Oficial

Esta tela é o padrão operacional Light Premium para registro de refeição do GLPY-V1.

Ela unifica Foto do Prato + Registro Alimentar em uma única experiência.

O componente MealChip (grid 2×2) é a referência para seletores de categoria compacta dentro de cards operacionais.

Não modificar esta tela sem nova solicitação explícita.

---

# Status Final

APPROVED — READY FOR MVP
