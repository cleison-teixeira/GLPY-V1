# GLPY — Pós-compra HeroSpark V1
Sprint 17B.41 | 2026-06-02

---

## 1. Fluxo técnico completo pós-compra

```
HeroSpark Checkout
       ↓
Pix confirmado / Cartão aprovado
       ↓
HeroSpark dispara Webhook (POST /api/herospark/webhook?token=glpy_herospark_2026)
       ↓ (delay estimado: 5–15s)
Webhook cria usuário Firebase Auth (senha: GLPY@2026)
       ↓
Webhook escreve users/{uid} com plano.tipo + plano.status=active
       ↓
HeroSpark redireciona para: https://glpy.com.br/acesso?email={buyer_email}&token=GLPY2026
       ↓
AcessoScreen chama /api/acesso/check
       ↓
Se encontrado → tela de acesso → usuária cria senha → app
Se ainda não encontrado → polling automático (3s × 10 = 30s) → suporte WhatsApp
```

---

## 2. Race condition: por que "assinatura não encontrada" acontece

**Problema:** O redirect pós-compra acontece imediatamente após o checkout. O webhook pode levar 5–15s para ser processado e escrever no Firestore. Se a usuária clicar no link antes do webhook terminar, `/api/acesso/check` retorna `found: false`.

**Solução implementada (Sprint 17B.41):**

`AcessoScreen` agora faz polling automático:
- Ao receber `nao_encontrado`, mostra spinner "Verificando seu pagamento..."
- Retenta a cada **3 segundos** por até **30 segundos** (10 tentativas)
- Se encontrar: fluxo normal de acesso
- Se esgotado sem encontrar: exibe tela com botão direto ao WhatsApp de suporte

---

## 3. Problema dos placeholders HeroSpark

**Problema:** HeroSpark às vezes envia `{{buyer_email}}` literal na URL de redirect (variável não substituída).

**Solução implementada (Sprint 17B.11):**
- `isPlaceholderEmail()` detecta `{{` ou `}}` no parâmetro
- Se placeholder → mostra formulário manual para a usuária digitar o e-mail
- Reseta o polling e retenta com o e-mail correto

---

## 4. Modelo de documento Firestore — users/{uid}

Criado pelo webhook em `api/herospark/webhook.ts`:

```json
{
  "uid": "<firebase_auth_uid>",
  "email": "compra@exemplo.com",
  "nome": "Nome da Usuária",
  "plano": {
    "tipo": "fundador",
    "status": "active",
    "origem": "herospark",
    "dataExpiracao": null
  },
  "herospark": {
    "active": true,
    "offerId": "524346",
    "transactionId": "...",
    "activatedAt": "<Timestamp>"
  },
  "primeiroAcesso": true,
  "createdAt": "<Timestamp>",
  "updatedAt": "<Timestamp>"
}
```

**Offer IDs HeroSpark:**

| offer_id | Plano     | Preço       |
|----------|-----------|-------------|
| 524346   | fundador  | R$19,90/mês |
| 524492   | essencial | R$29,90/mês |
| 524494   | pro       | R$59,90/mês |

---

## 5. E-mail pós-compra — copy HeroSpark

Configurar no painel HeroSpark como e-mail de confirmação de compra aprovada.

**Assunto:** Seu acesso ao GLPY está pronto 🎉

---

Olá, {{buyer_name}}!

Sua compra do **GLPY {{plan_name}}** foi confirmada com sucesso.

**Acesse o app agora:**
https://glpy.com.br/acesso?email={{buyer_email}}&token=GLPY2026

---

**Como acessar:**

1. Clique no link acima
2. Toque em **"Criar / redefinir minha senha"**
3. Abra o e-mail que chegará em {{buyer_email}} e crie sua senha
4. Volte ao GLPY e entre com e-mail + senha

> O GLPY é separado da plataforma de pagamento. Use o mesmo e-mail da compra para acessar.

**Instalando no celular (recomendado):**
Após abrir o app, toque em **"Adicionar à tela inicial"** para instalar sem precisar de loja.

---

Qualquer dúvida, fale com a gente no WhatsApp:
https://wa.me/5548988371216

Equipe GLPY

---

**Notas de configuração HeroSpark:**
- Enviar apenas para status: `aprovado`
- Variáveis usadas: `{{buyer_name}}`, `{{buyer_email}}`, `{{plan_name}}`
- Incluir link de acesso com `{{buyer_email}}` — verificar que a variável está sendo substituída corretamente antes de ativar

---

## 6. Automação de escala — path recomendado

### Fase atual (MVP — manual)
- Webhook processa e envia e-mail via EmailJS
- Suporte via WhatsApp: `5548988371216`
- Monitoramento: Vercel Function logs + Firebase Console

### Fase 2 (até 50 vendas/mês — Make.com)

```
HeroSpark Webhook
       ↓
Make.com scenario "GLPY Pós-compra"
  ├── Chamar /api/herospark/webhook (já existente)
  ├── Aguardar 15s
  ├── Enviar WhatsApp via Z-API/Twilio: "Olá {nome}! Seu acesso ao GLPY está pronto..."
  └── Registrar em Google Sheets: nome, e-mail, plano, data, status
```

**Custo estimado Make.com:** ~US$9/mês para até 10.000 operações

### Fase 3 (escala — acima de 50 vendas/mês)

```
HeroSpark Webhook → /api/herospark/webhook (existente)
       ↓
Firebase Cloud Function (trigger: users/{uid} write)
  ├── Enviar WhatsApp via Twilio (A2P, templates aprovados Meta)
  ├── Enviar e-mail onboarding D+1 (boas-vindas + tutorial)
  └── Agendar e-mail D+3 (check-in de primeiros dias)
```

**Benefícios fase 3:**
- Zero latência (trigger nativo Firebase)
- Sem dependência de Make.com
- Histórico completo no Firestore
- A/B test de mensagens nativo

### Automação de suporte — mensagem padrão WhatsApp

Para casos onde o webhook falha ou a usuária não consegue acessar, enviar manualmente:

> Olá {nome}! 🌿
>
> Aqui é da equipe GLPY. Vi que você acabou de adquirir o plano {plano} — seja muito bem-vinda!
>
> Para acessar o app, use o link abaixo com o e-mail {email} que você usou na compra:
> https://glpy.com.br/acesso?email={email}&token=GLPY2026
>
> Qualquer dificuldade, é só responder aqui. Estamos com você! 💙

---

## 7. Checklist de validação — novo cliente

Quando uma nova venda chegar:

- [ ] Verificar Firebase Auth: usuário criado com o e-mail da compra?
- [ ] Verificar Firestore `users/{uid}`: `plano.tipo` e `plano.status = active`?
- [ ] Verificar `herospark.active = true`?
- [ ] Testar `/api/acesso/check?email={email}&token=GLPY2026` → retorna `found: true, active: true`?
- [ ] Acessar `/acesso?email={email}&token=GLPY2026` e confirmar fluxo de acesso

**Senha padrão criada pelo webhook:** `GLPY@2026`
A usuária DEVE criar uma senha própria via link de reset ao entrar pela primeira vez.

---

## 8. Suporte WhatsApp — número oficial

`5548988371216`

Link direto (com contexto de compra):
```
https://api.whatsapp.com/send/?phone=5548988371216&text=Ol%C3%A1%2C+acabei+de+comprar+o+GLPY+e+preciso+de+ajuda+para+liberar+meu+acesso.&type=phone_number&app_absent=0
```

Helper centralizado: `src/utils/supportWhatsapp.ts` → `buildSupportWhatsappUrl({ email, context })`

**Não alterar o número sem instrução explícita.**
