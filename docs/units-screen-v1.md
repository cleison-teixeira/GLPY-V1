# GLPY — Units Screen V1

Status: APPROVED — READY FOR MVP
Version: V1
Date: 2026-05-19

---

# Nome da Tela

Units Screen

---

# Objetivo

Permitir que o usuário escolha seu sistema de medidas de forma rápida e sem fricção.

O sistema selecionado é utilizado para:

- exibir altura e peso nas unidades corretas ao longo do app
- adaptar inputs de tracking (kg vs lbs, cm vs ft)
- personalizar exibição de metas e progresso

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
- UnitCard (componente local) × 2 — seletor de sistema de medidas
- GLPYCard (variant: light, tinted) — card dica GLPY
- GLPYButton (variant: primary, size: lg, fullWidth)

Todos os componentes base são de src/components/ui/.
Todos os tokens são de src/theme/.

---

# Estrutura da Tela

## Header

- botão voltar
- título: Unidades

## Card Principal (hero)

- ícone: Ruler (lucide-react), inline com headline (flex row)
- headline: Como você prefere medir sua evolução?
- subtexto: Escolha o sistema de medidas que faz mais sentido para você.

## Seletor de Unidades (2 UnitCards)

Cada card contém:
- ícone da opção
- label
- medidas (cm / kg ou ft / lbs)
- descrição curta
- check visual (círculo preenchido quando selecionado)

### Opções

| ID       | Label    | Medidas  | Ícone | Descrição                                    |
|----------|----------|----------|-------|----------------------------------------------|
| metric   | Métrico  | cm / kg  | Globe | Usado no Brasil e na maior parte do mundo.   |
| imperial | Imperial | ft / lbs | Flag  | Usado principalmente nos Estados Unidos.     |

Seleção padrão: metric

## Card Dica GLPY

- ícone: Lightbulb (lucide-react)
- título: Dica GLPY
- texto: Você poderá alterar suas unidades depois nas configurações.

## Botão

- texto: Salvar unidades
- variante: primary
- tamanho: lg
- fullWidth: true
- sempre habilitado (sempre há uma opção selecionada)

---

# Comportamento

- estado local `selectedUnit` com valor padrão: 'metric'
- seleção exclusiva — apenas um UnitCard ativo por vez
- card selecionado: fundo verde leve, borda verde, glow sutil
- ao salvar: console.log do valor — sem Firebase ainda
- prop onSave disponível para integração futura
- prop onBack disponível para navegação

---

# Arquivo Implementado

src/screens/onboarding/UnitsScreen.tsx

---

# Rota Preview

http://localhost:3000/preview/units

Rota isolada — App.tsx não é montado nessa rota.
Implementada via dynamic import em src/main.tsx.

---

# Observação Oficial

Esta tela é a referência visual oficial para telas de seleção simples de preferências no padrão operacional Light Premium do GLPY-V1.

Usar este padrão para escolhas binárias ou de baixa complexidade dentro do onboarding.

O componente UnitCard é estruturalmente equivalente ao PaceCard da WeightPaceScreen. Novas telas de seleção exclusiva devem seguir o mesmo padrão local de card selecionável.

Não modificar esta tela sem nova solicitação explícita.

---

# Status Final

APPROVED — READY FOR MVP
