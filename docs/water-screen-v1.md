# GLPY — Water Screen V1

Status: APPROVED — READY FOR MVP
Version: V1
Date: 2026-05-19

---

# Nome da Tela

Water Screen

---

# Objetivo

Permitir que o usuário registre o consumo diário de água de forma rápida, simples e motivadora.

O dado é utilizado para:

- acompanhar a hidratação diária em tempo real
- alimentar progresso na Results Screen
- calibrar alertas e recomendações da GLPY IA
- adaptar sugestões metabólicas por fase GLP-1

---

# Tema Oficial

LIGHT PREMIUM

Sistema: Operational
Categoria: Tracking Diário

---

# Componentes Usados

- GLPYScreen (variant: light)
- GLPYHeader (com botão voltar + título)
- GLPYCard (variant: light) — card de progresso principal
- GLPYButton (variant: secondary, size: sm) × 3 — botões de adição rápida
- GLPYCard (variant: light, tinted) — card dica GLPY
- GLPYButton (variant: primary, size: lg, fullWidth) — CTA

Todos os componentes base são de src/components/ui/.
Todos os tokens são de src/theme/.

---

# Estrutura da Tela

## Header

- botão voltar
- título: Água

## Card de Progresso Principal

- ícone: Droplets (lucide-react), inline com headline (flex row)
- headline: Sua hidratação hoje
- display grande: valor atual em L (40px, bold, fica verde ao atingir meta)
- barra de progresso:
  - track: `brand.green` a 13% de opacidade, 8px, rounded
  - fill: gradiente `brand.green → brand.greenDark`, transição 0.3s
  - labels: "0 L" esquerda · percentual central · "X,X L (meta)" direita
- linhas de dados:
  - Consumido: X,X L
  - Meta: 2,6 L
  - Falta: X,X L (ou "Meta atingida 🎉" quando completo)

## Botões de Adição Rápida

3 botões em flex row, cada um com `flex: 1`:

| Label    | Incremento |
|----------|-----------|
| +250 ml  | 0,25 L    |
| +500 ml  | 0,50 L    |
| +750 ml  | 0,75 L    |

## Aviso Suave (acima de 5 L)

Texto secundário, sem pressão:
"Você já ultrapassou 5 L — continue hidratado com moderação."

Exibido apenas quando `waterAmount > 5.0`.

## Card Dica GLPY

- ícone: Lightbulb (lucide-react)
- título: Dica GLPY
- texto: Manter a hidratação ajuda seu corpo a lidar melhor com a jornada metabólica e pode reduzir desconfortos comuns.

## Botão

- texto: Salvar água
- variante: primary
- tamanho: lg
- fullWidth: true
- sempre habilitado

---

# Comportamento

- estado local `waterAmount` inicializado em 1.2 L
- meta diária fixa no MVP: 2.6 L (constante `DAILY_GOAL`)
- botões rápidos somam ao total sem bloquear (cap em 99 L para evitar overflow)
- aviso suave exibido acima de 5 L (constante `MAX_SAFE`)
- ao salvar: console.log do valor — sem Firebase ainda
- prop onSave disponível para integração futura
- prop onBack disponível para navegação

---

# Meta Diária — Aviso Oficial MVP

O valor `DAILY_GOAL = 2.6 L` é um PLACEHOLDER do MVP.

No futuro deverá ser calculado dinamicamente por um **HydrationGoalEngine** com base em:
- peso atual do usuário
- nível de atividade física
- sintomas reportados
- fase da jornada GLP-1 (início, manutenção, transição)
- segurança metabólica

O comentário `// MVP PLACEHOLDER` está presente na constante `DAILY_GOAL` do arquivo implementado.

---

# Arquivo Implementado

src/screens/operational/WaterScreen.tsx

---

# Rota Preview

http://localhost:3000/preview/water

Rota isolada — App.tsx não é montado nessa rota.
Implementada via dynamic import em src/main.tsx.

---

# Observação Oficial

Esta tela é o padrão operacional Light Premium para registro diário de hidratação do GLPY-V1.

O padrão de card com barra de progresso animada + display grande do valor + botões rápidos é a referência para telas de tracking com meta diária quantitativa.

Não modificar esta tela sem nova solicitação explícita.

---

# Status Final

APPROVED — READY FOR MVP
