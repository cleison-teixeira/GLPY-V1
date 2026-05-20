# GLPY — Target Weight Screen V1 Refined

Status: APPROVED — READY FOR MVP
Version: V1 Refined
Date: 2026-05-19

---

# Nome da Tela

Target Weight Screen

---

# Objetivo

Permitir que o usuário defina seu peso alvo de forma simples, rápida e sem fricção.

O peso alvo é utilizado para:

- calcular quanto falta para atingir a meta
- personalizar projeções de evolução
- alimentar o progresso na Results Screen
- ajustar recomendações da GLPY IA

---

# Tema Oficial

LIGHT PREMIUM

Sistema: Onboarding
Categoria: Operacional

---

# Componentes Usados

- GLPYScreen (variant: light)
- GLPYHeader (com botão voltar + título)
- GLPYCard (variant: light) — card principal
- GLPYInput (type: number, unit: kg, centerWithUnit: true)
- GLPYCard (variant: light) — card de contexto
- GLPYCard (variant: light, tinted) — card dica GLPY
- GLPYButton (variant: primary, size: lg, fullWidth)

Todos os componentes são de src/components/ui/.
Todos os tokens são de src/theme/.

---

# Estrutura da Tela

## Header

- botão voltar
- título: Peso Alvo

## Card Principal

- ícone: Target (lucide-react), inline com headline (flex row)
- headline: Qual é o seu peso alvo?
- subtexto: Defina uma meta realista para acompanhar sua evolução com clareza.
- GLPYInput com label "Seu peso alvo", unidade kg, valor inicial 58,0, centerWithUnit

## Card de Contexto

- título: Resumo da meta
- ícone: TrendingDown (lucide-react)
- linhas:
  - Peso atual
  - Meta
  - Falta eliminar

## Card Dica GLPY

- ícone: Lightbulb (lucide-react)
- título: Dica GLPY
- texto: Metas realistas ajudam a manter consistência e reduzem o risco de efeito rebote.

## Botão

- texto: Salvar meta
- variante: primary
- tamanho: lg
- fullWidth: true
- desabilitado se o valor for inválido

---

# Comportamento

- estado local para o valor do input
- valor inicial: 58,0
- aceita vírgula e ponto como separador decimal
- converte vírgula para ponto internamente
- validação: peso alvo deve ser maior que zero e menor que o peso atual
- hint de erro exibido inline de forma suave, sem pressão
- botão desabilitado enquanto o valor for inválido
- ao salvar: console.log do valor — sem Firebase ainda
- prop onSave disponível para integração futura
- prop onBack disponível para navegação
- prop currentWeight disponível (padrão: 80,0 kg)

---

# Input — Padrão Visual Oficial

O GLPYInput nesta tela usa a prop `centerWithUnit`.

Comportamento:
- borda, fundo e sombra ficam no wrapper externo
- valor e unidade aparecem como bloco único centralizado: `58,0 kg`
- input sem borda interna, alinhado à direita, largura dinâmica via `ch`
- unidade imediatamente à direita do valor, sem separação visual excessiva

Este é o padrão para todos os campos numéricos com unidade em telas LIGHT PREMIUM operacionais.

---

# Arquivo Implementado

src/screens/onboarding/TargetWeightScreen.tsx

---

# Rota Preview

http://localhost:3000/preview/target-weight

Rota isolada — App.tsx não é montado nessa rota.
Implementada via dynamic import em src/main.tsx.

---

# Observação Oficial

Esta tela é a referência visual oficial para todas as telas operacionais LIGHT PREMIUM com input digitável do GLPY-V1.

Novas telas operacionais com input numérico devem seguir sua estrutura:

GLPYScreen → GLPYHeader → GLPYCard (hero + input centerWithUnit) → GLPYCard (contexto) → GLPYCard (dica) → GLPYButton

Não modificar esta tela sem nova solicitação explícita.

---

# Status Final

APPROVED — READY FOR MVP
