# HeroSpark — Variáveis de Webhook GLPY

**Projeto:** GLPY  
**Produto inicial:** GLPY Fundador  
**Plataforma:** HeroSpark  
**Uso:** referência técnica para configuração de automações, webhook, Firebase e futuras integrações  
**Status:** variáveis capturadas a partir do painel HeroSpark em automação de **Pagamento confirmado**

---

## 1. Contexto

A HeroSpark permite configurar automações com ação **Gerar um Webhook** e inserir variáveis dinâmicas no corpo da requisição.

No GLPY, essas variáveis serão usadas para:

- liberar acesso automaticamente após pagamento confirmado;
- identificar comprador;
- identificar produto/oferta;
- identificar assinatura;
- mapear o plano interno do GLPY;
- salvar dados no Firebase;
- auditar pagamentos, renovações e status da assinatura.

---

## 2. Produto GLPY Fundador criado

### Página de vendas

```txt
https://cleison-teixeira.herospark.co/glpy-fundador
```

### Link direto da oferta / checkout

```txt
https://pay.herospark.com/glpy-fundador-524346
```

### ID visível da oferta

```txt
524346
```

> Observação: confirmar com a HeroSpark se `524346` é `offer_id`, `product_id` ou outro identificador interno.

---

## 3. URL planejada para webhook

```txt
https://glpy.com.br/api/herospark/webhook
```

### Método

```txt
POST
```

### Filtro recomendado no MVP

```txt
Produtos específicos → GLPY Fundador
```

---

## 4. Variáveis do comprador

| Variável HeroSpark | Significado | Uso no GLPY |
|---|---|---|
| `{{buyer_document_id}}` | Número do documento | Auditoria / antifraude |
| `{{buyer_document_type}}` | Tipo do documento | Auditoria |
| `{{buyer_email}}` | E-mail do cliente | Identificar usuário e liberar acesso |
| `{{buyer_name}}` | Nome do cliente | Criar perfil/onboarding |
| `{{buyer_phone}}` | Celular do cliente | Suporte / WhatsApp / CRM |
| `{{buyer_phone_ddi}}` | DDI do celular | Normalização do telefone |
| `{{buyer_phone_raw}}` | Celular sem formatação | Integrações externas |
| `{{buyer_city}}` | Cidade do comprador | Dados de perfil |
| `{{buyer_complement}}` | Complemento do endereço | Geralmente dispensável para GLPY |
| `{{buyer_district}}` | Bairro | Geralmente dispensável para GLPY |
| `{{buyer_address_number}}` | Número do endereço | Geralmente dispensável para GLPY |
| `{{buyer_state}}` | Estado | Segmentação / suporte |
| `{{buyer_address_street}}` | Endereço / rua / CEP conforme painel | Conferir no teste real |
| `{{buyer_zip_code}}` | CEP | Geralmente dispensável para GLPY |

---

## 5. Variáveis financeiras e da oferta

| Variável HeroSpark | Significado | Uso no GLPY |
|---|---|---|
| `{{net_value_cents}}` | Valor líquido em centavos | Auditoria financeira |
| `{{offer_discount}}` | Valor do desconto | Auditoria |
| `{{offer_id}}` | ID da oferta | Mapear plano interno |
| `{{offer_kind}}` | Tipo da oferta | Validar assinatura |
| `{{offer_price}}` | Valor da oferta em centavos | Auditoria |
| `{{offer_price | money}}` | Valor da oferta em reais | Logs/visualização |
| `{{offer_price | divided_by: 100.00}}` | Valor da oferta em reais R$ | Logs/visualização |
| `{{offer_discount_value}}` | Valor do desconto aplicado | Auditoria/cupom |
| `{{offer_with_discount}}` | Valor com desconto aplicado | Auditoria |
| `{{offer_with_discount | divided_by: 100.00}}` | Valor com desconto em reais | Auditoria |
| `{{offer_title}}` | Nome da oferta | Conferência do plano |
| `{{payment_value}}` | Valor pago em centavos | Auditoria |
| `{{payment_value | divided_by: 100.00}}` | Valor pago em reais | Auditoria |
| `{{payment_date}}` | Data do pagamento | Controle de acesso |
| `{{payment_id}}` | ID do pagamento | Evitar duplicidade |
| `{{payment_method}}` | Método de pagamento | Cartão/Pix/Boleto |
| `{{payment_status}}` | Status do pagamento | Liberar ou bloquear acesso |

---

## 6. Variáveis de produto

| Variável HeroSpark | Significado | Uso no GLPY |
|---|---|---|
| `{{product_id}}` | ID do produto | Mapeamento principal de plano |
| `{{product_name}}` | Nome do produto | Conferência humana/log |
| `{{installments}}` | Número de parcelas | Auditoria |
| `{{installments_fee}}` | Taxa de juros do parcelamento | Auditoria |

---

## 7. Variáveis de assinatura

| Variável HeroSpark | Significado | Uso no GLPY |
|---|---|---|
| `{{subscription_id}}` | ID da assinatura | Identificador principal da recorrência |
| `{{subscription_type}}` | Tipo de recorrência | Validar se é mensal |
| `{{subscription_next_invoice_at}}` | Data da próxima fatura | Definir próximo ciclo |
| `{{subscription_expiration_at}}` | Data de encerramento da recorrência | Bloqueio/expiração |
| `{{subscription_canceled_by}}` | Quem cancelou a assinatura | Auditoria/suporte |
| `{{subscription_status}}` | Status da assinatura | active/canceled/expired/etc. |
| `{{subscription_available_until}}` | Data de término do ciclo atual | Controlar acesso até o fim do período |

---

## 8. Variáveis de execução e recorrência

| Variável HeroSpark | Significado | Uso no GLPY |
|---|---|---|
| `{{execution_at}}` | Quando o webhook foi disparado | Auditoria |
| `{{overdue_count}}` | Pagamentos pendentes | Risco de inadimplência |
| `{{id_installments}}` | Contador de pagamentos aprovados/confirmados | Auditoria |

---

## 9. Variáveis de UTM

| Variável HeroSpark | Significado | Uso no GLPY |
|---|---|---|
| `{{utm_id}}` | UTM id | Atribuição |
| `{{utm_source}}` | UTM source | Meta/Google/TikTok/etc. |
| `{{utm_medium}}` | UTM medium | Campanha/meio |
| `{{utm_campaign}}` | UTM campaign | Nome da campanha |
| `{{utm_term}}` | UTM term | Termo/anúncio |
| `{{utm_content}}` | UTM content | Criativo/variação |

---

## 10. Variáveis de Pix e boleto

| Variável HeroSpark | Significado | Uso no GLPY |
|---|---|---|
| `{{pix_expiration_at}}` | Data de expiração do Pix | Não liberar antes da confirmação |
| `{{pix_code}}` | Código Pix Copia e Cola | Não necessário no webhook GLPY |
| `{{pix_qr_code_url}}` | URL da imagem do QR Code | Não necessário no webhook GLPY |
| `{{boleto_expiration_at}}` | Data de vencimento do boleto | Não recomendado no Fundador |
| `{{bank_slip_barcode}}` | Código de barras do boleto | Não necessário no GLPY |
| `{{bank_slip_file_url}}` | URL do boleto | Não necessário no GLPY |
| `{{bank_slip_barcode}}` | Código de barras do boleto | Pode aparecer duplicado no painel |
| `{{bank_slip_file_url}}` | URL do boleto | Pode aparecer duplicado no painel |

> Decisão comercial atual: boleto não é recomendado para o GLPY Fundador por causa do ticket baixo, taxa fixa e fricção na recorrência.

---

## 11. Variáveis adicionais vistas no painel

| Variável HeroSpark | Significado provável | Observação |
|---|---|---|
| `{{upsell}}` | Indica se a venda é upsell (`true/false`) | Útil no futuro |
| `{{cart_src}}` | SRC | Origem/carrinho |
| `{{created_at}}` | Data de criação da transação | Auditoria |

---

## 12. Body recomendado para o webhook GLPY

Usar formato JSON no campo de body, se a HeroSpark aceitar texto livre.

```json
{
  "source": "herospark",
  "event": "payment_confirmed",
  "executionAt": "{{execution_at}}",

  "buyer": {
    "name": "{{buyer_name}}",
    "email": "{{buyer_email}}",
    "phone": "{{buyer_phone}}",
    "phoneRaw": "{{buyer_phone_raw}}",
    "phoneDDI": "{{buyer_phone_ddi}}",
    "documentId": "{{buyer_document_id}}",
    "documentType": "{{buyer_document_type}}",
    "city": "{{buyer_city}}",
    "state": "{{buyer_state}}",
    "zipCode": "{{buyer_zip_code}}"
  },

  "product": {
    "id": "{{product_id}}",
    "name": "{{product_name}}"
  },

  "offer": {
    "id": "{{offer_id}}",
    "title": "{{offer_title}}",
    "kind": "{{offer_kind}}",
    "priceCents": "{{offer_price}}",
    "priceBRL": "{{offer_price | divided_by: 100.00}}",
    "discount": "{{offer_discount}}",
    "discountValue": "{{offer_discount_value}}",
    "withDiscount": "{{offer_with_discount}}"
  },

  "payment": {
    "id": "{{payment_id}}",
    "status": "{{payment_status}}",
    "method": "{{payment_method}}",
    "date": "{{payment_date}}",
    "valueCents": "{{payment_value}}",
    "valueBRL": "{{payment_value | divided_by: 100.00}}",
    "netValueCents": "{{net_value_cents}}"
  },

  "subscription": {
    "id": "{{subscription_id}}",
    "type": "{{subscription_type}}",
    "status": "{{subscription_status}}",
    "nextInvoiceAt": "{{subscription_next_invoice_at}}",
    "expirationAt": "{{subscription_expiration_at}}",
    "availableUntil": "{{subscription_available_until}}",
    "canceledBy": "{{subscription_canceled_by}}",
    "overdueCount": "{{overdue_count}}",
    "approvedInstallmentsCount": "{{id_installments}}"
  },

  "tracking": {
    "utmId": "{{utm_id}}",
    "utmSource": "{{utm_source}}",
    "utmMedium": "{{utm_medium}}",
    "utmCampaign": "{{utm_campaign}}",
    "utmTerm": "{{utm_term}}",
    "utmContent": "{{utm_content}}",
    "cartSrc": "{{cart_src}}"
  },

  "pix": {
    "expirationAt": "{{pix_expiration_at}}",
    "code": "{{pix_code}}",
    "qrCodeUrl": "{{pix_qr_code_url}}"
  },

  "boleto": {
    "expirationAt": "{{boleto_expiration_at}}",
    "barcode": "{{bank_slip_barcode}}",
    "fileUrl": "{{bank_slip_file_url}}"
  },

  "meta": {
    "upsell": "{{upsell}}",
    "createdAt": "{{created_at}}",
    "webhookSecret": "GLPY_HEROSPARK_2026"
  }
}
```

---

## 13. Campos mínimos obrigatórios para liberar acesso

Mesmo que o body completo seja usado, o GLPY só precisa destes campos para liberar acesso no MVP:

```txt
buyer.email
buyer.name
product.id
product.name
offer.id
offer.title
payment.id
payment.status
payment.method
subscription.id
subscription.status
subscription.availableUntil
meta.webhookSecret
```

---

## 14. Mapeamento recomendado GLPY

### Inicialmente

```txt
offer_id 524346 → plano fundador
```

### Futuro

```txt
HEROSPARK_PRODUCT_ID_FUNDADOR  → fundador
HEROSPARK_PRODUCT_ID_ESSENCIAL → essencial
HEROSPARK_PRODUCT_ID_PRO       → pro
```

ou:

```txt
HEROSPARK_OFFER_ID_FUNDADOR  → fundador
HEROSPARK_OFFER_ID_ESSENCIAL → essencial
HEROSPARK_OFFER_ID_PRO       → pro
```

---

## 15. Regras de liberação no GLPY

### Liberar acesso quando

```txt
payment_status indicar pagamento confirmado/aprovado
subscription_status indicar assinatura ativa ou válida
product/offer mapear para um plano conhecido
webhookSecret for válido
```

Resultado esperado:

```json
{
  "source": "herospark",
  "plan": "fundador",
  "active": true,
  "status": "active",
  "updatedAt": "agora"
}
```

---

## 16. Regras de segurança

A URL de redirecionamento `/acesso?email=...&token=GLPY2026` ajuda na experiência, mas não deve ser a única segurança.

Regra oficial:

```txt
Página personalizada = reduzir fricção
Webhook = liberar acesso com segurança
```

---

## 17. Próximos passos técnicos

1. Criar endpoint:

```txt
/api/herospark/webhook
```

2. Validar `webhookSecret`.

3. Salvar payload bruto para auditoria.

4. Normalizar dados do comprador.

5. Mapear produto/oferta para plano interno.

6. Atualizar acesso do usuário no Firebase.

7. Retornar `200 OK`.

8. Atualizar QA Center para validar:

```txt
Webhook Fundador → plano fundador
Webhook Essencial → plano essencial
Webhook Pro → plano pro
ProductId/OfferId desconhecido → fallback seguro
Cancelamento/reembolso/falha → active=false
```

---

## 18. Perguntas ainda pendentes para HeroSpark

```txt
1. {{customer_email}} funciona na página personalizada ou o correto é {{buyer_email}}?
2. O ID 524346 é ID da oferta, do produto ou do checkout?
3. Em eventos de renovação paga, o mesmo body é enviado?
4. Existem automações separadas para cancelamento, reembolso, chargeback e falha de pagamento?
5. O webhook envia assinatura ativa mesmo para pagamento Pix?
6. O campo subscription_available_until vem preenchido em assinatura mensal?
7. O campo subscription_status vem como qual valor quando está ativo?
8. A HeroSpark recomenda webhook único ou um por produto/oferta?
```

---

## 19. Recomendação atual

Para o MVP:

```txt
1. Criar apenas GLPY Fundador.
2. Configurar automação de pagamento confirmado para produto específico.
3. Criar webhook GLPY.
4. Testar compra real/pix/cartão.
5. Confirmar payload.
6. Depois criar GLPY Essencial e GLPY Pro.
```

Não criar os outros dois produtos antes de validar o payload real do Fundador.
