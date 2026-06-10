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
Nome na HeroSpark:    GLPY Semestral
Tipo recomendado MVP: pagamento único
Preço:                R$249,90
Plano interno GLPY:   semestral
Duração de acesso:    6 meses / 180 dias a partir da data da compra
Label comercial:      "Mais recomendado"
Slug/checkout:        glpy-semestral-526680
Checkout direto:      https://pay.herospark.com/glpy-semestral-526680
Página de vendas:     https://cleison-teixeira.herospark.co/glpy-semestral
Status:               CRIADO — pendente: configurar link pós-compra e validar /acesso com plan=semestral
```

### Produto 3 — GLPY Anual

```txt
Nome na HeroSpark:    GLPY Anual
Tipo recomendado MVP: pagamento único
Preço:                R$447,00
Plano interno GLPY:   anual
Duração de acesso:    12 meses / 365 dias a partir da data da compra
Label comercial:      "Melhor economia"
Slug/checkout:        glpy-anual-526681
Checkout direto:      https://pay.herospark.com/glpy-anual-526681
Página de vendas:     https://cleison-teixeira.herospark.co/glpy-anual
Status:               CRIADO — pendente: configurar link pós-compra e validar /acesso com plan=anual
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

## 10. Produtos criados na HeroSpark — links reais

> Atualizado em 2026-06-10 com dados reais após criação manual na HeroSpark.

### Tabela completa de produtos e links

| Produto | Valor | Tipo | Acesso | Página de vendas | Checkout direto | Link pós-compra | Status |
|---|---:|---|---|---|---|---|---|
| GLPY Essencial | R$49,90/mês | assinatura mensal | recorrente | (confirmar) | (confirmar) | `https://glpy.com.br/acesso?email={{buyer_email}}&token=GLPY2026` | ativo |
| GLPY Semestral | R$249,90 | pagamento único | 180 dias | [abrir](https://cleison-teixeira.herospark.co/glpy-semestral) | [checkout](https://pay.herospark.com/glpy-semestral-526680) | `https://glpy.com.br/acesso?email={{buyer_email}}&token=GLPY2026&plan=semestral` | criado — pós-compra pendente |
| GLPY Anual | R$447,00 | pagamento único | 365 dias | [abrir](https://cleison-teixeira.herospark.co/glpy-anual) | [checkout](https://pay.herospark.com/glpy-anual-526681) | `https://glpy.com.br/acesso?email={{buyer_email}}&token=GLPY2026&plan=anual` | criado — pós-compra pendente |

---

### Links de ativação pós-compra por plano

```txt
GLPY Essencial (mensal):
https://glpy.com.br/acesso?email={{buyer_email}}&token=GLPY2026

GLPY Semestral:
https://glpy.com.br/acesso?email={{buyer_email}}&token=GLPY2026&plan=semestral

GLPY Anual:
https://glpy.com.br/acesso?email={{buyer_email}}&token=GLPY2026&plan=anual
```

> Esses links devem ser configurados no campo "URL de redirecionamento pós-compra" de cada produto/oferta na HeroSpark.

---

### Observação técnica — parâmetro plan= na rota /acesso

```txt
SITUAÇÃO ATUAL:
A rota /acesso existe e funciona para o plano mensal (Essencial).
O parâmetro plan= (ex: plan=semestral, plan=anual) ainda NÃO está implementado na rota /acesso.

O QUE FALTA:
A rota /acesso precisa ser atualizada para:
1. Ler o parâmetro plan= da URL.
2. Registrar o plano correto (semestral/anual) ao liberar acesso.
3. Calcular expiresAt conforme accessDays do plano (180 ou 365 dias).

QUANDO FAZER:
Essa implementação deve ser feita em tarefa técnica separada, antes de ativar os
links de pós-compra do Semestral e Anual na HeroSpark.

NÃO ATIVAR os links pós-compra do Semestral e Anual antes de validar /acesso com plan=.
```

---

## 11. Checklist manual para criação na HeroSpark

### Criar os produtos

- [x] GLPY Semestral — R$249,90 (pagamento único, acesso por 180 dias) ✓ criado
- [x] GLPY Anual — R$447,00 (pagamento único, acesso por 365 dias) ✓ criado

### Salvar links e IDs após criação

- [ ] Link de checkout GLPY Essencial (confirmar)
- [x] Link de checkout GLPY Semestral → https://pay.herospark.com/glpy-semestral-526680
- [x] Link de checkout GLPY Anual → https://pay.herospark.com/glpy-anual-526681
- [ ] ID do produto Essencial (`product_id`) — a confirmar via webhook ou painel
- [ ] ID do produto Semestral (`product_id`) — a confirmar via webhook ou painel
- [ ] ID do produto Anual (`product_id`) — a confirmar via webhook ou painel
- [ ] ID da oferta Essencial (`offer_id`) — 524346 é fundador; confirmar Essencial
- [ ] ID da oferta Semestral (`offer_id`) — slug visível: 526680 (confirmar se é offer_id)
- [ ] ID da oferta Anual (`offer_id`) — slug visível: 526681 (confirmar se é offer_id)

### Configurar link pós-compra na HeroSpark

- [ ] Configurar URL pós-compra do Semestral (aguardando validação de /acesso com plan=semestral)
- [ ] Configurar URL pós-compra do Anual (aguardando validação de /acesso com plan=anual)

### Configurar automações na HeroSpark

- [ ] Automação de **pagamento confirmado** → webhook GLPY (Essencial)
- [ ] Automação de **pagamento confirmado** → webhook GLPY (Semestral)
- [ ] Automação de **pagamento confirmado** → webhook GLPY (Anual)
- [ ] Automação de **cancelamento** → webhook GLPY (Essencial mensal)
- [ ] Automação de **reembolso** → webhook GLPY (todos os produtos)

### Validações técnicas pendentes

- [ ] Implementar leitura do parâmetro plan= na rota /acesso
- [ ] Validar /acesso com plan=semestral (compra de teste)
- [ ] Validar /acesso com plan=anual (compra de teste)
- [ ] Confirmar que Firebase registra plano semestral com expiresAt = hoje + 180 dias
- [ ] Confirmar que Firebase registra plano anual com expiresAt = hoje + 365 dias

---

## 12. Links e IDs — registro oficial

> Atualizado em 2026-06-10 com dados reais dos produtos criados.

```txt
GLPY Essencial (mensal):
  Página de vendas: (confirmar — produto ativo)
  Link de checkout: (confirmar)
  Slug visível:     (confirmar)
  product_id:       (a confirmar via payload do webhook)
  offer_id:         524346 (era fundador — confirmar se Essencial usa ID diferente)
  Link pós-compra:  https://glpy.com.br/acesso?email={{buyer_email}}&token=GLPY2026

GLPY Semestral:
  Página de vendas: https://cleison-teixeira.herospark.co/glpy-semestral
  Link de checkout: https://pay.herospark.com/glpy-semestral-526680
  Slug visível:     glpy-semestral-526680
  product_id:       (a confirmar via payload do webhook após compra de teste)
  offer_id:         526680 (slug visível — confirmar se é o offer_id real)
  Link pós-compra:  https://glpy.com.br/acesso?email={{buyer_email}}&token=GLPY2026&plan=semestral
  Status:           CRIADO — link pós-compra pendente de validação técnica

GLPY Anual:
  Página de vendas: https://cleison-teixeira.herospark.co/glpy-anual
  Link de checkout: https://pay.herospark.com/glpy-anual-526681
  Slug visível:     glpy-anual-526681
  product_id:       (a confirmar via payload do webhook após compra de teste)
  offer_id:         526681 (slug visível — confirmar se é o offer_id real)
  Link pós-compra:  https://glpy.com.br/acesso?email={{buyer_email}}&token=GLPY2026&plan=anual
  Status:           CRIADO — link pós-compra pendente de validação técnica
```

---

## 13. Próxima etapa técnica futura

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

## 14. Observações finais

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
*Atualizado em 2026-06-10 — links reais de Semestral e Anual registrados após criação na HeroSpark*
