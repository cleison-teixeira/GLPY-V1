# Política de Planos GLPY — HeroSpark

**Projeto:** GLPY  
**Versão:** V1 — MVP Brasil  
**Plataforma comercial:** HeroSpark  
**Modelo:** assinatura recorrente mensal  
**Status:** estratégia oficial para lançamento fundador e evolução de planos

---

## 1. Decisão comercial principal

O GLPY será vendido pela **HeroSpark** usando **produtos separados por plano/oferta**, e não alteração de preço no mesmo produto.

Essa decisão existe para proteger os usuários fundadores e evitar risco de reajuste acidental em assinaturas antigas.

### Regra oficial

```txt
Não alterar o preço do produto fundador depois do lançamento.
Quando a fase fundador encerrar, o produto fundador sai da venda.
Novos clientes entram por outro produto/plano.
```

---

## 2. Estrutura oficial de produtos

### Produto 1 — GLPY Fundador

```txt
Nome comercial: GLPY Fundador
Preço inicial: R$19,90/mês
Uso: oferta de lançamento / sócio fundador
Status: produto principal do lançamento
```

#### Entregas do GLPY Fundador

- 30 mensagens de IA por dia.
- 5 fotos do prato por dia.
- 10 protocolos liberados.
- Checklist diário.
- Registro de água, refeição, aplicação, sintomas, emoção e atividade.
- Progresso corporal.
- HUB de conteúdos.
- 10 receitas novas todos os meses.
- Valor fundador mantido enquanto a assinatura estiver ativa.

#### Regra comercial

```txt
O GLPY Fundador é a oferta inicial.
O valor de R$19,90/mês deve ser preservado para quem entrar nessa fase e mantiver a assinatura ativa.
Quando a fase fundador encerrar, esse produto não deve receber novos compradores.
```

---

### Produto 2 — GLPY Essencial

```txt
Nome comercial: GLPY Essencial
Preço previsto: R$29,90/mês ou R$39,90/mês
Uso: plano padrão após encerramento da fase fundador
Status: produto preparado para pós-lançamento
```

#### Entregas do GLPY Essencial

- 30 mensagens de IA por dia.
- 5 fotos do prato por dia.
- 10 protocolos liberados.
- Checklist diário.
- Registro de água, refeição, aplicação, sintomas, emoção e atividade.
- Progresso corporal.
- HUB de conteúdos.
- 10 receitas novas todos os meses.

#### Regra comercial

```txt
O GLPY Essencial será o plano padrão depois do encerramento da fase fundador.
Pode começar em R$29,90/mês e, se a demanda validar, uma nova oferta/produto pode ser criada em R$39,90/mês.
Não alterar o produto fundador para virar essencial.
Criar produto separado.
```

---

### Produto 3 — GLPY Pro

```txt
Nome comercial: GLPY Pro
Preço previsto: R$59,90/mês ou R$99,90/mês
Uso: plano premium / VIP / uso ampliado
Status: produto preparado para expansão
```

#### Entregas do GLPY Pro

- 99 mensagens de IA por dia.
- 19 fotos do prato por dia.
- 10 protocolos liberados.
- Checklist diário.
- Registro de água, refeição, aplicação, sintomas, emoção e atividade.
- Progresso corporal.
- HUB de conteúdos.
- 10 receitas novas todos os meses.
- Recursos premium futuros.
- Prioridade em novos conteúdos e protocolos.
- Acompanhamento mais intenso da jornada.

#### Regra comercial

```txt
Não usar promessa de “ilimitado real”.
O plano deve ser posicionado como Pro, Premium ou IA ampliada.
Limites máximos iniciais:
- 99 mensagens IA/dia
- 19 fotos do prato/dia
```

---

## 3. Limites oficiais por plano

| Plano | IA por dia | Fotos do prato por dia | Protocolos | Receitas mensais | Observação |
|---|---:|---:|---|---|---|
| Fundador | 30 | 5 | 10 liberados | 10 novas/mês | oferta de lançamento |
| Essencial | 30 | 5 | 10 liberados | 10 novas/mês | plano padrão pós-fundador |
| Pro | 99 | 19 | 10 liberados | 10 novas/mês | plano premium com uso ampliado |
| Top/Admin/Dev | 999 ou configuração interna | 999 ou configuração interna | liberado | interno | não vender como plano público no MVP |

---

## 4. Regras de nomenclatura dentro do sistema

O app deve trabalhar com planos canônicos, não com o preço diretamente.

### Planos internos

```txt
starter/free
fundador
essencial
pro
top/admin/dev
cancelado
expirado
```

### Regra de acesso

```txt
active = true  → liberar acesso conforme plano
active = false → bloquear ou limitar acesso conforme status
```

---

## 5. Mapeamento HeroSpark → GLPY

O webhook deve mapear o produto da HeroSpark para o plano interno do GLPY usando o **ID do produto**, não o preço.

### Mapeamento esperado

```txt
HEROSPARK_PRODUCT_ID_FUNDADOR  → plano: fundador
HEROSPARK_PRODUCT_ID_ESSENCIAL → plano: essencial
HEROSPARK_PRODUCT_ID_PRO       → plano: pro
```

### Variáveis/config sugeridas

```txt
VITE_HEROSPARK_PRODUCT_FUNDADOR
VITE_HEROSPARK_PRODUCT_ESSENCIAL
VITE_HEROSPARK_PRODUCT_PRO
```

ou, no backend/webhook:

```txt
HEROSPARK_PRODUCT_FUNDADOR
HEROSPARK_PRODUCT_ESSENCIAL
HEROSPARK_PRODUCT_PRO
```

---

## 6. Dados mínimos que o webhook deve salvar

Quando a HeroSpark enviar um evento, o backend/Firebase deve salvar uma estrutura semelhante a:

```json
{
  "source": "herospark",
  "productId": "id_do_produto",
  "plan": "fundador",
  "status": "active",
  "active": true,
  "customerEmail": "cliente@email.com",
  "customerName": "Nome do Cliente",
  "transactionId": "id_transacao",
  "subscriptionId": "id_assinatura",
  "currentPeriodStart": "2026-05-27T00:00:00.000Z",
  "currentPeriodEnd": "2026-06-27T00:00:00.000Z",
  "updatedAt": "2026-05-27T00:00:00.000Z"
}
```

---

## 7. Eventos que precisam ser tratados

### Eventos que liberam acesso

```txt
venda aprovada
pagamento aprovado
assinatura criada
assinatura ativa
renovação paga
```

Resultado esperado:

```txt
active = true
status = active/paid/approved
plan = conforme productId
```

### Eventos que bloqueiam ou limitam acesso

```txt
assinatura cancelada
assinatura expirada
pagamento recusado
falha de renovação
reembolso
chargeback
```

Resultado esperado:

```txt
active = false
status = canceled/expired/payment_failed/refunded/chargeback
```

---

## 8. Política de fundadores

### Regra oficial

```txt
Usuários do GLPY Fundador mantêm R$19,90/mês enquanto a assinatura estiver ativa.
Se cancelar e voltar depois, entra no preço vigente do momento.
```

### Como garantir isso

Não alterar o preço do produto fundador.

Quando encerrar a fase fundador:

```txt
1. tirar o link/produto fundador da venda
2. manter assinantes ativos no produto antigo
3. criar ou divulgar o produto Essencial para novos usuários
```

---

## 9. Política de expansão de preço

### Fase 1 — Lançamento fundador

```txt
Produto: GLPY Fundador
Preço: R$19,90/mês
Objetivo: validar MVP, criar base, coletar feedback, gerar recorrência inicial
```

### Fase 2 — Pós-fundador

```txt
Produto: GLPY Essencial
Preço: R$29,90/mês ou R$39,90/mês
Objetivo: aumentar margem sem afetar fundadores
```

### Fase 3 — Premium

```txt
Produto: GLPY Pro
Preço: R$59,90/mês ou R$99,90/mês
Objetivo: monetizar usuários com maior necessidade de IA/foto/acompanhamento
```

---

## 10. HeroSpark — condições comerciais recebidas

### Plano gratuito informado pela HeroSpark

```txt
Taxa cartão: 3,9% + R$1
Taxa Pix: 3,9% + R$1
Taxa boleto: 3,9% + R$3
Taxa de parcelamento: 3,49% a.m. para o aluno
Recebimento: D+30 no cartão
Recebimento: D+2 no boleto e Pix
Saque: R$4,73
```

### Condição HeroSpark Parceiros recebida por WhatsApp

```txt
Taxa: 4,6%
Recebimento: D+15
Hospedagem de vídeos sem custo
Área de membros integrada sem custo
Migração feita pela HeroSpark
```

### Observação estratégica

Se a taxa de 4,6% for sem taxa fixa adicional, ela pode ser mais vantajosa para low ticket do que 3,9% + R$1.

No ticket de R$19,90:

```txt
4,6% de R$19,90 = R$0,92
Líquido aproximado = R$18,98
```

No plano gratuito:

```txt
3,9% + R$1 sobre R$19,90 = R$1,78
Líquido aproximado = R$18,12
```

---

## 11. Comparativo rápido HeroSpark x Kiwify

> Este documento substitui a lógica anterior focada na Kiwify como referência principal.

### Kiwify — referência anterior

```txt
Taxa aproximada: 8,99% + R$2,49
Saque aproximado: R$3,67
Recebimento cartão: D+15 padrão informado em central
Pix/boleto: D+2 após aprovação
```

### Por que HeroSpark é mais interessante para o GLPY agora

```txt
1. Melhor margem para low ticket.
2. Suporte direto com gerente/parceiros.
3. Área de membros integrada.
4. Hospedagem de vídeos e materiais.
5. Melhor encaixe para infoproduto + app + protocolos.
6. Possibilidade de D+15 em condição parceira.
```

---

## 12. Perguntas obrigatórias para HeroSpark antes da integração final

Antes de criar/webhookar tudo em produção, confirmar:

```txt
1. A taxa de 4,6% é sem taxa fixa por venda?
2. Essa condição vale para assinatura mensal recorrente?
3. Consigo criar produtos separados?
   - GLPY Fundador R$19,90/mês
   - GLPY Essencial R$29,90 ou R$39,90/mês
   - GLPY Pro R$59,90 ou R$99,90/mês
4. Cada produto terá um ID diferente para identificar no webhook?
5. O webhook está incluso nessa condição?
6. O webhook envia evento de venda aprovada?
7. O webhook envia renovação paga?
8. O webhook envia cancelamento?
9. O webhook envia reembolso?
10. O webhook envia chargeback?
11. O webhook envia falha de pagamento/renovação?
12. Se eu tirar o produto fundador da venda, os assinantes antigos continuam ativos nele?
```

---

## 13. Descrição comercial dos planos

### GLPY Fundador — R$19,90/mês

```txt
Entre como fundador do GLPY e acompanhe sua jornada com protocolos, IA, checklist diário, registro de rotina e progresso corporal.

Inclui:
- 30 mensagens de IA por dia
- 5 fotos do prato por dia
- 10 protocolos liberados
- 10 receitas novas todos os meses
- checklist diário
- progresso corporal
- HUB de conteúdos

Valor fundador mantido enquanto sua assinatura estiver ativa.
```

### GLPY Essencial — R$29,90 ou R$39,90/mês

```txt
O plano essencial para acompanhar sua jornada com GLP-1 com mais clareza, rotina e proteção contra o efeito rebote.

Inclui:
- 30 mensagens de IA por dia
- 5 fotos do prato por dia
- 10 protocolos liberados
- 10 receitas novas todos os meses
- checklist diário
- progresso corporal
- HUB de conteúdos
```

### GLPY Pro — R$59,90 ou R$99,90/mês

```txt
Para quem quer acompanhamento mais intenso, com IA ampliada e mais análises de refeições ao longo do dia.

Inclui:
- 99 mensagens de IA por dia
- 19 fotos do prato por dia
- 10 protocolos liberados
- 10 receitas novas todos os meses
- checklist diário
- progresso corporal
- HUB de conteúdos
- acesso prioritário a novos conteúdos e recursos premium futuros
```

---

## 14. Regra técnica para limites

O limite deve ser resolvido pelo plano ativo do usuário.

### Exemplo de configuração

```ts
type GlpyPlan = 'starter' | 'fundador' | 'essencial' | 'pro' | 'top' | 'admin';

const GLPY_PLAN_LIMITS = {
  starter: {
    aiMessagesPerDay: 30,
    foodPhotosPerDay: 5,
  },
  fundador: {
    aiMessagesPerDay: 30,
    foodPhotosPerDay: 5,
  },
  essencial: {
    aiMessagesPerDay: 30,
    foodPhotosPerDay: 5,
  },
  pro: {
    aiMessagesPerDay: 99,
    foodPhotosPerDay: 19,
  },
  top: {
    aiMessagesPerDay: 999,
    foodPhotosPerDay: 999,
  },
  admin: {
    aiMessagesPerDay: 999,
    foodPhotosPerDay: 999,
  },
};
```

---

## 15. QA Center precisa validar os planos

O GLPY QA Center deve validar:

```txt
starter/free
fundador
essencial
pro
top/admin
cancelado
expirado
productId desconhecido
```

### Resultados esperados

```txt
Fundador → IA 30/dia, foto 5/dia
Essencial → IA 30/dia, foto 5/dia
Pro → IA 99/dia, foto 19/dia
Cancelado → acesso bloqueado/limitado
Expirado → acesso bloqueado/limitado
ProductId desconhecido → fallback seguro
```

---

## 16. Sprint técnica recomendada

### Sprint 17B — HeroSpark Checkout + Webhook + Planos

Objetivos:

```txt
1. Criar config de planos GLPY.
2. Criar mapeamento productId HeroSpark → plano GLPY.
3. Preparar webhook para venda aprovada, renovação, cancelamento, reembolso e falha.
4. Salvar plano/status no Firebase.
5. Aplicar limites por plano.
6. Atualizar QA Center para validar Fundador, Essencial e Pro.
7. Garantir fallback seguro para productId desconhecido.
```

---

## 17. Decisão final aprovada

```txt
Lançamento:
GLPY Fundador — R$19,90/mês

Pós-fundador:
GLPY Essencial — R$29,90/mês ou R$39,90/mês

Premium:
GLPY Pro — R$59,90/mês ou R$99,90/mês

Não vender “ilimitado real” no MVP.
Pro = uso ampliado com 99 IA/dia e 19 fotos/dia.
```

---

## 18. Frase oficial de posicionamento

```txt
O GLPY não é apenas um app. Ele é um ecossistema de protocolos, IA, checklist diário, conteúdos e acompanhamento para pessoas em jornada com GLP-1.
```

---

## 19. Observações finais

- O produto inicial deve ser simples: GLPY Fundador.
- A lógica do sistema já deve estar preparada para Essencial e Pro.
- Não criar dependência de alteração de preço no produto fundador.
- Não usar o termo “ilimitado” no MVP.
- Usar IDs de produto da HeroSpark como fonte principal para liberar plano.
- Validar webhook antes de tráfego pago.
- Confirmar regras de recorrência e eventos com a HeroSpark antes do lançamento oficial.
