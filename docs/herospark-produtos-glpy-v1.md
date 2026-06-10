# HeroSpark — Produtos GLPY V1

**Projeto:** GLPY  
**Versão:** V1 — Mapeamento de Produtos Comerciais  
**Data:** 2026-06-10  
**Status:** documento oficial de mapeamento — nenhum código alterado  
**Escopo:** referência técnica e comercial para criação e integração dos produtos na HeroSpark

---

## 1. Produtos oficiais GLPY na HeroSpark

### Produto 1 — GLPY Essencial (mensal)

```txt
Nome na HeroSpark:   GLPY Essencial
Tipo:                assinatura mensal recorrente
Preço:               R$49,90/mês
Plano interno GLPY:  essencial
Duração de acesso:   mensal — ativo enquanto assinatura estiver paga
Label comercial:     "Entrada simples"
Status:              produto ativo (já criado)
```

### Produto 2 — GLPY Semestral

```txt
Nome na HeroSpark:   GLPY Semestral
Tipo recomendado MVP: pagamento único
Preço:               R$249,90
Plano interno GLPY:  semestral
Duração de acesso:   6 meses / 180 dias a partir da data da compra
Label comercial:     "Mais recomendado"
Status:              a criar na HeroSpark
```

### Produto 3 — GLPY Anual

```txt
Nome na HeroSpark:   GLPY Anual
Tipo recomendado MVP: pagamento único
Preço:               R$447,00
Plano interno GLPY:  anual
Duração de acesso:   12 meses / 365 dias a partir da data da compra
Label comercial:     "Melhor economia"
Status:              a criar na HeroSpark
```

---

## 2. Tabela resumida dos 3 produtos

| Produto | Tipo | Preço | Plano interno | Acesso | Label |
|---|---|---:|---|---|---|
| GLPY Essencial | assinatura mensal | R$49,90/mês | essencial | mensal recorrente | Entrada simples |
| GLPY Semestral | pagamento único | R$249,90 | semestral | 180 dias | Mais recomendado |
| GLPY Anual | pagamento único | R$447,00 | anual | 365 dias | Melhor economia |

---

## 3. Comissões de parceiro fundador (50%)

| Produto | Valor cliente | Parceiro recebe |
|---|---:|---:|
| GLPY Essencial (mensal) | R$49,90/mês | R$24,95/mês |
| GLPY Semestral | R$249,90 | R$124,95 |
| GLPY Anual | R$447,00 | R$223,50 |

---

## 4. Mapeamento futuro para webhook

Quando os produtos forem criados na HeroSpark, o webhook deve mapear o `product_id` (ou `offer_id`) recebido para o plano interno do GLPY.

### Estrutura esperada de mapeamento

```txt
HEROSPARK_PRODUCT_ID_ESSENCIAL → plano: essencial
HEROSPARK_PRODUCT_ID_SEMESTRAL → plano: semestral
HEROSPARK_PRODUCT_ID_ANUAL     → plano: anual
```

### Campos de identificação a observar no payload HeroSpark

```txt
product_id  — ID único do produto (mais estável, preferível)
offer_id    — ID da oferta (pode mudar se a oferta for recriada)
offer_title — nome da oferta (não usar como chave primária, apenas para log)
```

> Usar sempre `product_id` como chave de mapeamento quando disponível.
> `offer_id` como fallback secundário se `product_id` vier vazio.

---

## 5. Variáveis de ambiente futuras sugeridas

### Backend / webhook (servidor)

```txt
HEROSPARK_PRODUCT_ESSENCIAL=<id_do_produto_essencial>
HEROSPARK_PRODUCT_SEMESTRAL=<id_do_produto_semestral>
HEROSPARK_PRODUCT_ANUAL=<id_do_produto_anual>
```

> Não usar prefixo `VITE_` para esses IDs — eles pertencem ao backend/webhook, não devem ser expostos no bundle do app.

### Forma de uso esperada no webhook (referência futura)

```ts
const PLAN_MAP: Record<string, string> = {
  [process.env.HEROSPARK_PRODUCT_ESSENCIAL!]: 'essencial',
  [process.env.HEROSPARK_PRODUCT_SEMESTRAL!]: 'semestral',
  [process.env.HEROSPARK_PRODUCT_ANUAL!]:     'anual',
};
```

---

## 6. Regra de liberação de acesso por plano

### Essencial (mensal)

```txt
active:     true
plan:       essencial
accessDays: renovável mensalmente
expiresAt:  subscription_available_until (campo do webhook HeroSpark)
```

Acesso ativo enquanto a assinatura estiver paga. Bloqueio na falha de renovação ou cancelamento.

### Semestral (pagamento único)

```txt
active:     true
plan:       semestral
accessDays: 180
expiresAt:  data da compra + 180 dias
```

Acesso liberado uma única vez por 180 dias. Sem recorrência automática no MVP.

### Anual (pagamento único)

```txt
active:     true
plan:       anual
accessDays: 365
expiresAt:  data da compra + 365 dias
```

Acesso liberado uma única vez por 365 dias. Sem recorrência automática no MVP.

### Estrutura esperada no Firebase após liberação

```json
{
  "source": "herospark",
  "plan": "semestral",
  "active": true,
  "status": "active",
  "accessDays": 180,
  "purchasedAt": "2026-06-10T00:00:00.000Z",
  "expiresAt": "2026-12-07T00:00:00.000Z",
  "productId": "<id_herospark>",
  "offerId": "<offer_id_herospark>",
  "customerEmail": "cliente@email.com",
  "customerName": "Nome do Cliente",
  "paymentId": "<id_pagamento>",
  "updatedAt": "2026-06-10T00:00:00.000Z"
}
```

---

## 7. Eventos HeroSpark que devem liberar acesso (futuro)

```txt
venda aprovada
pagamento aprovado
assinatura ativa
renovação paga            ← apenas para o plano mensal (Essencial)
```

Resultado esperado em todos os casos:

```txt
active = true
plan   = conforme product_id mapeado
status = active
```

---

## 8. Eventos HeroSpark que devem bloquear acesso (futuro)

```txt
reembolso
chargeback
cancelamento
expiração
falha de pagamento        ← mensal: bloquear após período de carência
```

Resultado esperado:

```txt
active = false
status = canceled / refunded / chargeback / expired / payment_failed
```

---

## 9. Observação importante — MVP vs. recorrência futura

```txt
No MVP:
- Semestral e Anual são tratados como pagamento único com acesso por período.
- Não há recorrência automática semestral ou anual.
- O cliente paga uma vez e acessa por 180 ou 365 dias.
- Ao expirar, o acesso é bloqueado e o cliente precisa renovar manualmente.

Fase posterior:
- Recorrência semestral e anual pode ser configurada na HeroSpark em produto específico.
- O webhook precisará tratar eventos de renovação e expiração para esses planos.
- Essa fase não é prioridade do MVP.
```

---

## 10. Checklist manual para criação na HeroSpark

### Criar os produtos

- [ ] GLPY Semestral — R$249,90 (pagamento único, acesso por 180 dias)
- [ ] GLPY Anual — R$447,00 (pagamento único, acesso por 365 dias)

### Salvar após criação

- [ ] Link de checkout GLPY Essencial
- [ ] Link de checkout GLPY Semestral
- [ ] Link de checkout GLPY Anual
- [ ] ID do produto Essencial (`product_id`)
- [ ] ID do produto Semestral (`product_id`)
- [ ] ID do produto Anual (`product_id`)
- [ ] ID da oferta Essencial (`offer_id`) — conferir se difere do `product_id`
- [ ] ID da oferta Semestral (`offer_id`)
- [ ] ID da oferta Anual (`offer_id`)

### Configurar automações na HeroSpark

- [ ] Automação de **pagamento confirmado** → webhook GLPY (Essencial)
- [ ] Automação de **pagamento confirmado** → webhook GLPY (Semestral)
- [ ] Automação de **pagamento confirmado** → webhook GLPY (Anual)
- [ ] Automação de **cancelamento** → webhook GLPY (Essencial mensal)
- [ ] Automação de **reembolso** → webhook GLPY (todos os produtos)

---

## 11. Links e IDs — a preencher após criação

> Preencher manualmente após criar os produtos na HeroSpark.

```txt
GLPY Essencial:
  Página de vendas: (preencher)
  Link de checkout: (preencher)
  product_id:       (preencher)
  offer_id:         524346 (fundador — confirmar se Essencial terá ID diferente)

GLPY Semestral:
  Página de vendas: (a criar)
  Link de checkout: (a criar)
  product_id:       (a preencher após criação)
  offer_id:         (a preencher após criação)

GLPY Anual:
  Página de vendas: (a criar)
  Link de checkout: (a criar)
  product_id:       (a preencher após criação)
  offer_id:         (a preencher após criação)
```

---

## 12. Próxima etapa técnica futura

Depois que os produtos forem criados na HeroSpark e os IDs coletados:

```txt
1. Atualizar variáveis de ambiente no backend/Vercel com os product_ids reais.
2. Atualizar mapeamento no webhook: product_id → plano interno.
3. Atualizar paywall no app com os 3 planos e links de checkout.
4. Aplicar labels comerciais no paywall: "Entrada simples", "Mais recomendado", "Melhor economia".
5. Testar compra real (Pix ou cartão) de cada produto.
6. Confirmar payload do webhook para cada produto.
7. Confirmar que Firebase recebe plano correto (essencial / semestral / anual).
8. Testar expiração e bloqueio de acesso para semestral e anual.
9. Atualizar QA Center para cobrir os 3 planos.
```

---

## 13. Observações finais

```txt
- Este documento é de mapeamento técnico-comercial.
- Nenhum código foi alterado.
- Nenhuma configuração de Firebase, webhook, app, paywall ou Vercel foi modificada.
- Os IDs reais dos produtos serão preenchidos após criação manual na HeroSpark.
- Manter alinhamento com docs/herospark-variaveis-webhook-glpy.md para detalhes de payload.
- Manter alinhamento com docs/politica-planos-glpy-v2.md para a estratégia comercial.
```

---

*Documento criado em 2026-06-10 — GLPY HeroSpark Produtos V1*
