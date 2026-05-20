# GLPY — Body Measurements Screen V1

Status: APPROVED — READY FOR MVP
Version: V1
Date: 2026-05-19

---

# Nome da Tela

Body Measurements Screen

---

# Objetivo

Criar a tela de registro de medidas corporais do GLPY-V1, permitindo que o usuário acompanhe sua evolução física além do peso.

O dado é utilizado para:

- acompanhar mudanças corporais que a balança nem sempre mostra
- complementar o acompanhamento físico junto com peso, resultados e fotos corporais
- alimentar futuramente gráficos de evolução corporal e relatórios de progresso

A BodyMeasurementsScreen complementa:
- CurrentWeightScreen
- TargetWeightScreen
- ResultsScreen
- PhotoTimelineScreen
- Check-in Screen

---

# Observação de Registro

Esta tela apenas registra medidas informadas pelo próprio usuário.
O GLPY não avalia composição corporal nem substitui orientação profissional.

---

# Tema Oficial

LIGHT PREMIUM

Sistema: Operational
Categoria: Tracking Diário

---

# Componentes Usados

- GLPYScreen (variant: light)
- GLPYHeader (com botão voltar + título)
- GLPYCard (variant: light) × 2 — cards de conteúdo
- GLPYCard (variant: light, tinted) — dica GLPY
- GLPYInput (centerWithUnit, unit: "cm") × 6 — campos de medida
- GLPYButton (variant: primary, size: lg, fullWidth) — CTA principal

Todos os componentes base são de src/components/ui/.
Todos os tokens são de src/theme/.

---

# Estrutura da Tela

## Header

- botão voltar
- título: Medidas

## Card 1 — Evolução corporal

- icon wrap 32×32: TrendingUp (greenDark)
- título: "Evolução corporal" — fontSize bodyDefault, fontWeight h3, navy
- subtexto: "Registre suas medidas para acompanhar mudanças que a balança nem sempre mostra." — fontSize small, secondary, lineHeight 1.5
- bloco summary (background.secondary, borderRadius secondary, padding 12px 16px):

| Label | Valor MVP |
|---|---|
| Último registro | 12/05/2026 |
| Cintura | 84 cm |
| Quadril | 104 cm |

Cada linha do bloco: label small secondary à esquerda + valor small fontWeight h3 navy à direita.

## Card 2 — Medidas principais

- icon wrap 32×32: Ruler (greenDark)
- título: "Medidas principais" — fontSize bodyDefault, fontWeight h3, navy
- grid 2 colunas (`grid-template-columns: 1fr 1fr`, gap: medium) com 6 GLPYInput:

| Posição no grid | Campo | Valor inicial |
|---|---|---|
| linha 1, col 1 | Cintura | 84 |
| linha 1, col 2 | Quadril | 104 |
| linha 2, col 1 | Abdômen | 92 |
| linha 2, col 2 | Peito | 96 |
| linha 3, col 1 | Braço | 32 |
| linha 3, col 2 | Coxa | 58 |

Todos os campos:
- GLPYInput com `centerWithUnit` e `unit="cm"`
- label em caps acima do input (padrão GLPYInput)
- aceita vírgula e ponto
- altura 60px, radius.input (20px)

## Card 3 — Dica GLPY

- ícone: Lightbulb (greenDark)
- título: Dica GLPY
- texto: "Acompanhar medidas ajuda a perceber evolução corporal mesmo quando o peso muda pouco. Pequenas mudanças também contam."
- fundo tintado: brand.green a 8% + borda brand.green 20%

## Botão

- texto: "Salvar medidas"
- variante: primary
- tamanho: lg
- fullWidth: true
- desabilitado se qualquer campo estiver vazio ou com valor zero ou inválido

---

# Comportamento

## Estado local

- `waist` inicializado em `'84'`
- `hip` inicializado em `'104'`
- `abdomen` inicializado em `'92'`
- `chest` inicializado em `'96'`
- `arm` inicializado em `'32'`
- `thigh` inicializado em `'58'`

## Validação

Função `isValidMeasurement(value: string)`:

```ts
const n = parseFloat(value.replace(',', '.'));
return !isNaN(n) && n > 0;
```

CTA desabilitado se qualquer um dos 6 campos não passar na validação.

## Ao salvar

```
console.log('[GLPY] Body measurements saved:', { waist, hip, abdomen, chest, arm, thigh })
```

- prop `onSave` disponível para integração futura
- prop `onBack` disponível para navegação
- sem Firebase ainda
- sem avaliação de composição corporal
- sem APIs

---

# MVP Placeholder

Os seguintes dados são fixos no Card 1 e futuramente virão do histórico real do usuário:

- Último registro: 12/05/2026
- Cintura: 84 cm
- Quadril: 104 cm

---

# Observação de Segurança

O GLPY não avalia composição corporal, IMC, percentual de gordura ou qualquer indicador clínico.
Todos os dados exibidos e registrados são informados pelo próprio usuário.
Esta tela não substitui orientação de profissional de saúde, nutricionista ou educador físico.

---

# Observação Futura

Futuramente esta tela poderá:

- alimentar gráficos de evolução corporal com histórico de medidas
- compor resultados visuais na Results Screen
- gerar relatórios de progresso para acompanhamento
- correlacionar medidas com peso, foto e fase do tratamento GLP-1

No MVP, os dados são registrados apenas via console.log.

---

# Arquivo Implementado

src/screens/operational/BodyMeasurementsScreen.tsx

---

# Rota Preview

http://localhost:3000/preview/body-measurements

Rota isolada — App.tsx não é montado nessa rota.
Implementada via dynamic import em src/main.tsx.

---

# Observação Oficial

Esta tela é o hub operacional Light Premium para registro de medidas corporais do GLPY-V1.

O grid 2 colunas de GLPYInput `centerWithUnit` é a referência para formulários compactos de múltiplos campos numéricos com unidade em telas operacionais.

O bloco summary (background.secondary, borderRadius secondary) é a referência para exibição de dados históricos placeholder dentro de cards operacionais.

Não modificar esta tela sem nova solicitação explícita.

---

# Status Final

APPROVED — READY FOR MVP
