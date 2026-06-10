# GLPY — Checkpoint de Lançamento: HeroSpark / Domínio / Acesso V1

**Projeto:** GLPY  
**Versão:** V1  
**Data:** 2026-06-10  
**Status:** documento oficial de auditoria — nenhum código alterado  
**Escopo:** estado real do lançamento, lacunas técnicas, riscos e próximos passos em ordem

---

## 1. Estado atual do app em produção

```txt
App em produção:             SIM
Domínio principal:           https://glpy.com.br
Domínio www (fallback):      https://www.glpy.com.br
Vercel fallback/produção:    https://glpy-v1.vercel.app
Rota crítica de ativação:    /acesso

Rota atual usada pela HeroSpark:
  https://glpy.com.br/acesso?email={{buyer_email}}&token=GLPY2026

Fallback manual de e-mail:
  SIM — implementado e validado em produção (Sprint 17B.11)
  Se {{buyer_email}} não for substituído, a tela pede o e-mail manualmente.

Regra obrigatória:
  Não alterar /acesso sem tarefa específica e testes.
  Qualquer alteração na rota de ativação deve ser testada antes de ir ao ar.
```

---

## 2. UptimeRobot — Monitoramento ativo

### Monitores já configurados

```txt
✓ glpy-v1.vercel.app
✓ glpy.com.br
✓ www.glpy.com.br
✓ www.glpy.com.br/acesso?email=teste@gmail.com&token=GLPY2026
```

### Pendência identificada

```txt
[ ] Adicionar monitor para:
    https://glpy.com.br/acesso?email=teste@gmail.com&token=GLPY2026
    (atualmente monitorado via www — adicionar também sem www para cobrir ambos)
```

### Regra oficial de domínio

```txt
- glpy.com.br é o domínio principal e canônico
- www.glpy.com.br é o fallback operacional e alternativa segura
- www.glpy.com.br NÃO deve ser removido, quebrado ou tratado como descartável
- Os dois devem funcionar e ser monitorados
- Antes de tráfego pago: testar domínio, www e /acesso com e sem www
```

---

## 3. Produtos HeroSpark — estado atual

### GLPY Essencial (mensal)

```txt
Status:              produto existente na HeroSpark
Valor oficial:       R$49,90/mês
Tipo:                assinatura mensal recorrente
Plano interno:       essencial
Link pós-compra:     https://glpy.com.br/acesso?email={{buyer_email}}&token=GLPY2026&plan=essencial

ATENÇÃO:
Existe histórico de e-mail da HeroSpark mostrando "GLPY Essencial — R$29,90/mês".
Isso diverge da política comercial atual (R$49,90/mês).
Corrigir ou desativar o produto antigo antes de escalar tráfego pago.
```

### GLPY Semestral

```txt
Status:              CRIADO
Valor:               R$249,90
Tipo:                pagamento único
Acesso previsto:     180 dias
Plano interno:       semestral
Página de vendas:    https://cleison-teixeira.herospark.co/glpy-semestral
Checkout direto:     https://pay.herospark.com/glpy-semestral-526680
Slug visível:        glpy-semestral-526680
Link pós-compra:     https://glpy.com.br/acesso?email={{buyer_email}}&token=GLPY2026&plan=semestral

STATUS:  Produto criado.
         Link pós-compra NÃO configurado ainda na HeroSpark.
         Rota /acesso NÃO lê plan=semestral ainda.
         NÃO ativar link pós-compra antes de validar /acesso com plan=.
```

### GLPY Anual

```txt
Status:              CRIADO
Valor:               R$447,00
Tipo:                pagamento único
Acesso previsto:     365 dias
Plano interno:       anual
Página de vendas:    https://cleison-teixeira.herospark.co/glpy-anual
Checkout direto:     https://pay.herospark.com/glpy-anual-526681
Slug visível:        glpy-anual-526681
Link pós-compra:     https://glpy.com.br/acesso?email={{buyer_email}}&token=GLPY2026&plan=anual

STATUS:  Produto criado.
         Link pós-compra NÃO configurado ainda na HeroSpark.
         Rota /acesso NÃO lê plan=anual ainda.
         NÃO ativar link pós-compra antes de validar /acesso com plan=.
```

---

## 4. Links de ativação oficiais HeroSpark

### Links principais (glpy.com.br)

```txt
GLPY Essencial:
https://glpy.com.br/acesso?email={{buyer_email}}&token=GLPY2026&plan=essencial

GLPY Semestral:
https://glpy.com.br/acesso?email={{buyer_email}}&token=GLPY2026&plan=semestral

GLPY Anual:
https://glpy.com.br/acesso?email={{buyer_email}}&token=GLPY2026&plan=anual
```

### Links de contingência (www.glpy.com.br)

```txt
GLPY Essencial:
https://www.glpy.com.br/acesso?email={{buyer_email}}&token=GLPY2026&plan=essencial

GLPY Semestral:
https://www.glpy.com.br/acesso?email={{buyer_email}}&token=GLPY2026&plan=semestral

GLPY Anual:
https://www.glpy.com.br/acesso?email={{buyer_email}}&token=GLPY2026&plan=anual
```

```txt
REGRA:
Links com www são contingência — não substituem os oficiais sem decisão específica.
Nunca trocar links de produção na HeroSpark sem testar o destino antes.
```

---

## 5. Auditoria técnica da rota /acesso — SEM EDITAR

**Arquivo:** `src/screens/auth/AcessoScreen.tsx`

### O que a rota faz hoje

```txt
✓ Lê parâmetro email da URL
✓ Lê parâmetro token da URL
✓ Valida token (aceita apenas GLPY2026)
✓ Detecta {{buyer_email}} literal não substituído (isPlaceholderEmail)
✓ Exibe formulário manual de e-mail quando buyer_email não foi substituído
✓ Chama /api/acesso/check?email=...&token=... (server-side) para confirmar plano
✓ Faz polling automático por até 30s (10 tentativas × 3s) se plano não encontrado
✓ Login com e-mail travado (e-mail da compra fixo, não editável)
✓ Criação de senha via Firebase sendPasswordResetEmail
✓ Suporte via WhatsApp com número 5548988371216
✓ Disparo de evento Meta Pixel Purchase (apenas fundador/essencial/pro)
✓ Sincroniza perfil do Firebase após login (syncFromFirestore)
```

### O que a rota NÃO faz hoje (lacunas)

```txt
✗ NÃO lê o parâmetro plan= da URL
✗ NÃO passa plan= para o endpoint /api/acesso/check
✗ NÃO salva plan no localStorage diretamente a partir da URL
✗ NÃO calcula accessDays (180 ou 365 dias)
✗ NÃO calcula expiresAt para planos de período fixo
✗ NÃO tem label para semestral e anual (PLANO_LABEL não contém esses valores)
✗ NÃO dispara Meta Pixel Purchase para semestral e anual (PURCHASE_PLANS não os inclui)
✗ NÃO tem PLANO_OFFER_IDS para semestral e anual
```

### Como o plano é determinado hoje

```txt
O plano NÃO vem da URL.
O plano vem do servidor via /api/acesso/check (resposta: json.plano).
O servidor lê o plano do Firebase (salvo pelo webhook ou manualmente).
Ou seja: plan=semestral na URL é completamente ignorado pelo frontend.
```

### O que é salvo no localStorage hoje

```txt
glpy_purchase_sent_<offerId>_<email_normalizado>  → chave anti-duplicidade do Meta Pixel
  (ex: glpy_purchase_sent_524492_cleisonimarketing_gmail_com)

O plano em si é carregado via syncFromFirestore e salvo pelo App.tsx
através de onAuthStateChanged — não diretamente pelo AcessoScreen.
```

### Comportamento esperado vs. real para Semestral/Anual

```txt
ESPERADO pelo produto:
  Cliente compra Semestral → link pós-compra com plan=semestral → /acesso libera 180 dias

REAL hoje:
  Cliente chega com plan=semestral na URL → parâmetro ignorado pelo frontend
  Frontend chama /api/acesso/check → servidor retorna json.plano conforme Firebase
  Se webhook não tiver rodado ainda → plano não encontrado → polling → suporte
  Se plano vier como "semestral" do servidor → tela mostra "semestral" (raw, sem label amigável)
  Não há cálculo de expiresAt → 180 dias não é registrado em lugar nenhum no frontend
  Meta Pixel não dispara para semestral (não está em PURCHASE_PLANS)
```

### Riscos identificados

```txt
RISCO 1 — CRÍTICO:
plan= é ignorado. Se o webhook ainda não processou a compra, o cliente recebe
"assinatura não encontrada" independentemente do plan= na URL.
O acesso do semestral/anual depende 100% do webhook ter rodado antes.
No MVP sem webhook ativo, clientes semestral/anual não serão ativados automaticamente.

RISCO 2 — MÉDIO:
PLANO_LABEL não tem semestral/anual. A tela mostraria "semestral" raw como nome do plano
no lugar de "GLPY Semestral", causando confusão visual para o cliente.

RISCO 3 — MÉDIO:
PURCHASE_PLANS não inclui semestral/anual. Conversões desses planos não serão rastreadas
no Meta Pixel. Impacto na atribuição de campanhas.

RISCO 4 — BAIXO (MVP):
expiresAt não é calculado. Para semestral/anual, o sistema de expiração terá que
ser implementado antes de os planos escalarem. Sem expiresAt, o acesso não expira automaticamente.
```

### Recomendação para próxima tarefa técnica

```txt
Tarefa específica necessária:
1. Adicionar plan= a parseParams()
2. Adicionar semestral e anual ao PLANO_LABEL
3. Adicionar semestral e anual ao PURCHASE_PLANS
4. Adicionar PLANO_OFFER_IDS para semestral (526680) e anual (526681)
5. Calcular e salvar expiresAt no localStorage ao ativar semestral/anual
   semestral: Date.now() + 180 * 24 * 60 * 60 * 1000
   anual:     Date.now() + 365 * 24 * 60 * 60 * 1000
6. No MVP sem webhook: avaliar se /acesso deve aceitar plan= da URL diretamente
   como fallback de ativação manual (liberar sem /api/acesso/check quando webhook não está ativo)
```

---

## 6. E-mails HeroSpark — problemas identificados

```txt
PROBLEMA 1 — Remetente:
E-mail automático aparece como "CLEISON CARDOSO TEIXEIRA" (nome pessoal do produtor).
Deve ser corrigido para nome da marca: "GLPY" ou "Equipe GLPY".

PROBLEMA 2 — Produto antigo com preço divergente:
Produto "GLPY Essencial" aparece com R$29,90/mês no e-mail automático da HeroSpark.
Política comercial atual: R$49,90/mês.
Isso pode gerar questionamentos, pedidos de reembolso ou disputas.
Corrigir antes de escalar tráfego pago.

AÇÃO NECESSÁRIA:
- Revisar nome público do produtor/plataforma no painel HeroSpark
- Corrigir ou desativar produto antigo com preço R$29,90
- Revisar todos os templates de e-mail
- Revisar botão "Acessar meu produto" nos e-mails (garantir que abre o link de ativação correto)
```

### Regras de automação de e-mail por produto

```txt
GLPY Essencial (mensal): gatilho "Assinatura criada"
GLPY Semestral:          gatilho "Pagamento confirmado"
GLPY Anual:              gatilho "Pagamento confirmado"

Regras:
- Sempre filtrar por produto específico (não usar automação global)
- Cada e-mail deve ter o link correto com plan= do produto
- Verificar se {{buyer_email}} é substituído corretamente no link
```

### Estrutura de e-mail por produto

```txt
GLPY Essencial:
  Assunto:   Seu acesso ao GLPY Essencial está pronto
  Link:      https://glpy.com.br/acesso?email={{buyer_email}}&token=GLPY2026&plan=essencial

GLPY Semestral:
  Assunto:   Seu acesso ao GLPY Semestral está pronto
  Link:      https://glpy.com.br/acesso?email={{buyer_email}}&token=GLPY2026&plan=semestral
  Mencionar: seu acesso é válido por 180 dias a partir da compra

GLPY Anual:
  Assunto:   Seu acesso ao GLPY Anual está pronto
  Link:      https://glpy.com.br/acesso?email={{buyer_email}}&token=GLPY2026&plan=anual
  Mencionar: seu acesso é válido por 365 dias a partir da compra
```

---

## 7. Arquitetura de domínio e subdomínios

### MVP atual (agir agora)

```txt
✓ glpy.com.br           → home/LP oficial e vendedora
✓ www.glpy.com.br       → fallback operacional — redirecionar para glpy.com.br
✓ glpy.com.br/acesso    → ativação pós-compra — rota crítica
✓ www.glpy.com.br/acesso → alternativa de contingência (já monitorado)
```

### Futuro próximo (após MVP validado)

```txt
○ lp.glpy.com.br        → landing pages de campanha e avatar
○ quiz.glpy.com.br      → quiz diagnóstico / funil de venda
○ app.glpy.com.br       → app logado / área do usuário
○ login.glpy.com.br     → login e ativação (avaliação futura de mover /acesso)
```

### Futuro (backend/admin)

```txt
○ api.glpy.com.br       → backend, webhooks, API
○ admin.glpy.com.br     → painel interno protegido
```

### Descartado agora

```txt
✗ api.app.glpy.com.br   → aumenta complexidade sem necessidade; não priorizar
```

---

## 8. Decisões que NÃO devem ser quebradas

```txt
✗ Não migrar Firebase agora
✗ Não implementar webhook completo agora (sem tarefa específica aprovada)
✗ Não alterar DNS agora
✗ Não trocar links HeroSpark para login.glpy.com.br (ainda não existe)
✗ Não quebrar /acesso — rota crítica de produção
✗ Não trocar glpy.com.br por www como principal sem planejamento
✗ Não alterar produtos antigos na HeroSpark sem confirmar impacto em compradores ativos
✗ Não colocar tráfego pago forte antes de testar compra real e ativação ponta a ponta
✗ Não ativar links pós-compra do Semestral/Anual antes de /acesso ler plan= e salvar expiresAt
```

---

## 9. Próximas tarefas em ordem recomendada

```txt
1. [ ] Commitar documentos aprovados desta sessão (sem código)

2. [ ] Tarefa técnica: atualizar /acesso para ler plan=essencial/semestral/anual
       - Adicionar plan= a parseParams()
       - Adicionar semestral/anual ao PLANO_LABEL, PURCHASE_PLANS e PLANO_OFFER_IDS
       - Calcular e salvar expiresAt para semestral (180d) e anual (365d)

3. [ ] Testar links de ativação manualmente (cada plan=)

4. [ ] Configurar link pós-compra na HeroSpark por produto (após validar /acesso)

5. [ ] Corrigir e-mails HeroSpark:
       - Remetente (de nome pessoal para "GLPY")
       - Produto antigo R$29,90
       - Templates por produto com link correto

6. [ ] Atualizar paywall com 3 planos, labels e links de checkout reais

7. [ ] Criar Home/LP pública em glpy.com.br

8. [ ] Validar www.glpy.com.br e monitoramento

9. [ ] Adicionar monitor UptimeRobot para glpy.com.br/acesso (sem www)

10. [ ] Rodar compra real de teste via Pix em cada plano (Essencial, Semestral, Anual)

11. [ ] Confirmar payload recebido na ativação e plano salvo corretamente

12. [ ] Após tudo validado: escalar tráfego pago
```

---

## 10. Checklist HeroSpark — revisar antes de escalar

```txt
[ ] Confirmar nome público do produtor/plataforma (corrigir para "GLPY")
[ ] Corrigir ou desativar produto antigo R$29,90
[ ] Configurar pós-compra com "Página personalizada" em cada produto
[ ] Colar link de ativação correto (Pix e cartão) — por produto
[ ] Verificar se {{buyer_email}} é substituído corretamente
[ ] Criar automação de e-mail por produto (Essencial / Semestral / Anual)
[ ] Corrigir remetente e template dos e-mails
[ ] Testar compra real Pix nos 3 planos
[ ] Verificar se /acesso recebe o email e plan= corretos
[ ] Verificar se Firebase registra o plano correto após ativação
```

---

## 11. Checklist DNS — documentar sem implementar

```txt
[ ] Revisar configuração atual de DNS do glpy.com.br
[ ] Confirmar www.glpy.com.br redireciona para glpy.com.br (301)
[ ] Planejar lp.glpy.com.br (futuro)
[ ] Planejar quiz.glpy.com.br (futuro)
[ ] Planejar app.glpy.com.br (futuro)
[ ] Planejar login.glpy.com.br (futuro)
[ ] Planejar api.glpy.com.br (futuro)
[ ] Planejar admin.glpy.com.br protegido (futuro)
[ ] Garantir HTTPS em todos os subdomínios futuros
[ ] Nunca trocar links de produção antes de testar o destino
```

---

## 12. Observações finais

```txt
- Este documento é de auditoria e checkpoint — nenhum código foi alterado.
- A rota /acesso foi auditada apenas por leitura, sem nenhuma modificação.
- O maior risco atual é o parâmetro plan= sendo ignorado pelo /acesso.
- Semestral e Anual NÃO devem ter seus links pós-compra ativados na HeroSpark
  antes de /acesso ser atualizado para ler e processar plan=.
- O produto antigo com R$29,90 deve ser corrigido antes de qualquer tráfego pago.
- Manter alinhamento com:
    docs/herospark-produtos-glpy-v1.md
    docs/politica-planos-glpy-v2.md
    docs/glpy-arquitetura-dominio-subdominios-acesso-emails-v1.md
    docs/herospark-variaveis-webhook-glpy.md
```

---

*Documento criado em 2026-06-10 — GLPY Checkpoint de Lançamento V1*
