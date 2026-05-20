# GLPY — Weight Pace Screen V1

Status: APPROVED — READY FOR MVP
Version: V1
Date: 2026-05-19

---

# Nome da Tela

Weight Pace Screen

---

# Objetivo

Permitir que o usuário escolha o ritmo de perda de peso desejado de forma rápida e sem fricção.

O ritmo selecionado é utilizado para:

- personalizar projeções de evolução semanal
- ajustar recomendações de hábitos e adesão
- alimentar o progresso na Results Screen
- calibrar alertas e feedback da GLPY IA

---

# Tema Oficial

LIGHT PREMIUM

Sistema: Onboarding
Categoria: Operacional

---

# Componentes Usados

- GLPYScreen (variant: light)
- GLPYHeader (com botão voltar + título)
- GLPYCard (variant: light) — card principal / hero
- PaceCard (componente local) × 3 — seletor de ritmo
- GLPYCard (variant: light, tinted) — card dica GLPY
- GLPYButton (variant: primary, size: md, fullWidth)

Todos os componentes base são de src/components/ui/.
Todos os tokens são de src/theme/.

---

# Estrutura da Tela

## Header

- botão voltar
- título: Velocidade de Perda

## Card Principal (hero)

- ícone: Activity (lucide-react), inline com headline (flex row)
- headline: Qual ritmo combina com você?
- subtexto: Escolha um ritmo sustentável para sua evolução.

## Seletor de Ritmo (3 PaceCards)

Cada card contém:
- ícone da opção
- label + badge "Recomendado" (apenas Equilibrada)
- taxa de perda semanal
- descrição curta
- check visual (círculo preenchido quando selecionado)

### Opções

| ID           | Label       | Taxa           | Ícone    |
|--------------|-------------|----------------|----------|
| light        | Leve        | 0,3 kg/semana  | Leaf     |
| balanced     | Equilibrada | 0,5 kg/semana  | Activity |
| accelerated  | Acelerada   | 0,8 kg/semana  | Zap      |

Seleção padrão: balanced

## Card Dica GLPY

- ícone: Lightbulb (lucide-react)
- título: Dica GLPY
- texto: Ritmos sustentáveis ajudam seu corpo a se adaptar melhor e favorecem a manutenção dos resultados.

## Botão

- texto: Salvar ritmo
- variante: primary
- tamanho: md
- fullWidth: true
- sempre habilitado (sempre há uma opção selecionada)

---

# Comportamento

- estado local `selectedPace` com valor padrão: 'balanced'
- seleção exclusiva — apenas um PaceCard ativo por vez
- ao salvar: console.log do valor — sem Firebase ainda
- prop onSave disponível para integração futura
- prop onBack disponível para navegação

---

# Valores de Taxa — Aviso Oficial MVP

Os valores 0,3 / 0,5 / 0,8 kg/semana são PLACEHOLDERS do MVP.

No futuro devem ser calculados dinamicamente com base em:
- peso atual e peso alvo do usuário
- IMC e composição corporal
- fase da jornada GLP-1 (início, manutenção, transição)
- histórico de adesão e variação de peso
- segurança metabólica (limite saudável por fase)

O comentário `// MVP PLACEHOLDER` está presente no array `PACE_OPTIONS` do arquivo implementado.

---

# Arquivo Implementado

src/screens/onboarding/WeightPaceScreen.tsx

---

# Rota Preview

http://localhost:3000/preview/weight-pace

Rota isolada — App.tsx não é montado nessa rota.
Implementada via dynamic import em src/main.tsx.

---

# Observação Oficial

Esta tela é a referência visual oficial para telas operacionais LIGHT PREMIUM de decisão rápida (seleção de opção sem input digitável) do GLPY-V1.

Padrão do card principal: ícone inline com headline (flex row, alignItems: flex-start).
Padrão dos cards de opção: PaceCard local com estado selected, check visual, badge opcional.

Não modificar esta tela sem nova solicitação explícita.

---

# Status Final

APPROVED — READY FOR MVP
