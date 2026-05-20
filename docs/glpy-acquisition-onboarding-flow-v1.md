# GLPY — ACQUISITION + ONBOARDING FLOW V1

Status: OFFICIAL ACQUISITION + ONBOARDING FLOW — READY FOR MVP
Version: V1
Date: 2026-05-19

---

# Objetivo do Documento

Definir o fluxo oficial de aquisição, venda, indicação, webhook, onboarding e edição do GLPY-V1.

---

# Decisão Estratégica Principal

No MVP, o quiz de venda ficará **fora do app**, usando a plataforma **EnLead**.

O GLPY receberá o usuário **após a compra**, via integração Kiwify/Webhook.

## Motivos

- Acelerar o lançamento sem depender do desenvolvimento do quiz nativo
- Usar EnLead como ferramenta flexível e otimizável de venda
- Evitar pedir e-mail cedo demais no funil
- Separar claramente aquisição de configuração da jornada
- Manter o app focado em entrega, retenção e acompanhamento

---

# Fluxo Principal — Tráfego Pago

```
Tráfego pago
  → Quiz EnLead
    → Resultado / Diagnóstico
      → VSL (5–7 minutos)
        → Checkout Kiwify
          → Webhook
            → GLPY Onboarding
              → Home
```

---

# Função de Cada Etapa

## Quiz externo (EnLead)

O quiz externo é **ferramenta de venda**.

Objetivos do quiz:
- Gerar consciência da dor (efeito rebote, falta de acompanhamento, medo de perder resultado)
- Criar desejo pela solução (protocolo + app)
- Preparar o lead para a VSL e o checkout

O quiz **não é** parte do app. Não implementar quiz nativo no MVP.

## Onboarding interno (GLPY)

O onboarding interno é **ferramenta de configuração da jornada**.

Objetivos do onboarding:
- Coletar e/ou confirmar dados necessários para personalização do app
- Configurar unidade, peso atual, altura, peso desejado, ritmo, tratamento
- Criar o perfil operacional do usuário dentro do GLPY

O onboarding **não é** uma tela de vendas.

## Edição posterior

As telas operacionais permitem que o usuário atualize seus dados a qualquer momento dentro do app.

---

# Fluxo por Indicação / Células

```
Anfitriã compartilha link personalizado
  → Amiga acessa página ou quiz
    → Checkout
      → Webhook
        → GLPY Onboarding
          → Home (entrada vinculada à célula da anfitriã)
```

A entrada via célula registra `source = "referral_cell"` e vincula o perfil da nova usuária à anfitriã correspondente via `referralCode` e `cellId`.

---

# Fontes Oficiais de Entrada

| source | Descrição |
|---|---|
| `paid_quiz` | Usuária veio por tráfego pago via quiz EnLead |
| `referral_cell` | Usuária veio por indicação / link de anfitriã / célula |
| `organic_app` | Usuária entrou diretamente no app, sem quiz externo |

---

# Parâmetros Futuros de Entrada

Parâmetros que poderão ser enviados pelo webhook Kiwify/EnLead e usados para pré-preencher o onboarding:

| Parâmetro | Descrição |
|---|---|
| `name` | Nome da usuária |
| `email` | E-mail (coletado no checkout Kiwify) |
| `phone` | Telefone |
| `mainPain` | Principal dor identificada no quiz |
| `currentWeight` | Peso atual |
| `targetWeight` | Peso desejado |
| `height` | Altura |
| `medication` | Medicamento informado no quiz |
| `frequency` | Frequência de aplicação |
| `dose` | Dose atual |
| `source` | Origem da usuária |
| `referralCode` | Código da anfitriã que indicou |
| `cellId` | ID da célula vinculada |

No MVP, o onboarding é preenchido manualmente pela usuária. Os dados do webhook serão integrados futuramente.

---

# Prop mode — Telas Operacionais Reutilizáveis

As telas operacionais que suportam duplo contexto devem aceitar a prop:

```tsx
mode?: 'onboarding' | 'edit'
```

| mode | Contexto | Comportamento |
|---|---|---|
| `'onboarding'` | Primeiro acesso pós-compra | CTA "Continuar", avança no fluxo |
| `'edit'` | Edição posterior no app | CTA "Salvar [dado]", retorna à tela anterior |

Telas que já implementam `mode`:
- `TreatmentSettingsScreen` — "Continuar" / "Salvar tratamento"

## Modo futuro (não implementar no MVP)

```
mode = "quiz_preview"
```

Permite que a anfitriã ou o time de venda demonstre o onboarding sem criar um perfil real. Útil para apresentações e treinamentos de células.

---

# Regras Comerciais — MVP

- Não oferecer trial no MVP
- Não pedir e-mail no início do quiz externo
- O checkout Kiwify coleta os dados principais (nome, e-mail, telefone)
- O app deve ser entregue como parte da oferta / protocolo
- A venda principal será baseada na dor do **efeito rebote**
- O protocolo é o produto central da oferta
- O app é bônus / continuidade / experiência premium da oferta

---

# Regras de Segurança — Obrigatórias

- O app **não recomenda** tratamento, medicação, dosagem ou frequência
- O app **apenas registra** informações informadas pela própria usuária
- A comunicação deve falar em: acompanhamento, organização da jornada, redução de risco percebido e continuidade
- Evitar promessa médica
- Evitar diagnóstico
- Evitar linguagem de prescrição

---

# Arquitetura Futura

O GLPY poderá ter futuramente:

- Quiz nativo dentro do app
- Quiz para creators / parceiros
- Quiz por célula (entrada personalizada por anfitriã)
- Quiz de reativação (usuária inativa)
- Quiz interno para recomendação de protocolos personalizados
- Integração mais profunda com EnLead / Kiwify / Webhook
- Pré-preenchimento automático do onboarding com dados do funil

---

# Regra Final

> **Quiz vende.**
> **Onboarding configura.**
> **Edição mantém atualizado.**

---

# Status Final

OFFICIAL ACQUISITION + ONBOARDING FLOW — READY FOR MVP
