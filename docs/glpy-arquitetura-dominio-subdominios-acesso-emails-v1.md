# GLPY — Arquitetura de Domínio, Subdomínios, Acesso e E-mails HeroSpark V1

**Projeto:** GLPY  
**Versão:** V1  
**Data:** 2026-06-10  
**Status:** documento oficial de arquitetura — nenhum código alterado  
**Escopo:** domínio, subdomínios, links de ativação, e-mails HeroSpark e próximas etapas

---

## 1. Estrutura oficial do domínio principal

### glpy.com.br

```txt
Função:    Home/LP oficial do GLPY — presença pública, institucional e vendedora
Prioridade: ATUAL
Status:    domínio principal ativo

Deve conter:
- Headline da marca
- Benefícios e entregas
- Planos e preços
- CTA principal:    "Começar agora"
- CTA secundário:   "Já comprei / Acessar minha conta"
- Link CTA secundário → glpy.com.br/acesso
```

### www.glpy.com.br

```txt
Função:    Fallback operacional e alternativa segura — não é descartável
Prioridade: ATUAL
Status:    deve funcionar, ser testado e monitorado

Regra oficial:
- glpy.com.br é o domínio principal/canônico
- www.glpy.com.br é o fallback operacional — deve continuar funcional
- www.glpy.com.br NÃO deve ser removido, quebrado ou tratado como descartável
- Os dois devem abrir corretamente no MVP
- A rota /acesso deve funcionar com e sem www
- Antes de tráfego pago: testar glpy.com.br e www.glpy.com.br e /acesso nos dois
```

### www.glpy.com.br/acesso

```txt
Função:    Alternativa de contingência para ativação pós-compra
Prioridade: ATUAL — rota de fallback operacional
Status:    deve funcionar como alternativa ao link principal

Regra:
- Deve aceitar os mesmos parâmetros de /acesso (email, token, plan)
- Monitorado pelo UptimeRobot como alternativa segura
- Não substituir o link principal da HeroSpark por www sem decisão específica
```

### glpy.com.br/acesso

```txt
Função:    Ativação de acesso pós-compra — leitura de email, token e plan via querystring
Prioridade: ATUAL — rota crítica de produção
Status:    funcionando no MVP

Regras obrigatórias:
- Não deve ser a home pública do app
- Deve continuar funcionando no MVP sem alterações enquanto não há tarefa específica
- Deve receber: email, token, plan via querystring
- Deve ter fallback manual de e-mail se {{buyer_email}} não for substituído pelo HeroSpark
- Deve ativar o plano correto conforme o parâmetro plan=

REGRA DE PROTEÇÃO:
Nunca quebrar a rota glpy.com.br/acesso durante nenhuma tarefa.
Ela é usada nos links pós-compra da HeroSpark e qualquer interrupção bloqueia ativações reais.
```

---

## 2. Subdomínios estratégicos recomendados

### Tabela de subdomínios por fase

| Subdomínio | Função | Fase | Status |
|---|---|---|---|
| glpy.com.br | Home oficial, institucional e vendedora | MVP atual | prioridade atual |
| www.glpy.com.br | Fallback operacional — deve funcionar e ser monitorado | MVP atual | prioridade atual — não remover |
| glpy.com.br/acesso | Ativação pós-compra — rota crítica | MVP atual | ativo — não alterar |
| lp.glpy.com.br | Landing pages de campanhas e avatares | Comercial | futuro próximo |
| quiz.glpy.com.br | Quiz diagnóstico / pré-venda / funil | Comercial | futuro próximo |
| app.glpy.com.br | App logado / área do usuário | App estruturado | futuro próximo |
| login.glpy.com.br | Login, ativação e recuperação de conta | App estruturado | futuro próximo |
| api.glpy.com.br | API, backend, webhooks | Backend | futuro |
| admin.glpy.com.br | Painel interno, suporte e auditoria | Interno | futuro — protegido |

---

### Detalhamento por subdomínio

#### glpy.com.br

```txt
Função:    Home oficial — presença pública, institucional e vendedora da marca GLPY
Fase:      MVP atual
Status:    prioridade imediata
```

#### www.glpy.com.br

```txt
Função:    Fallback operacional e alternativa segura de acesso
Fase:      MVP atual
Status:    deve funcionar, ser testado e monitorado — não é descartável

Regra oficial:
- glpy.com.br é o principal/canônico
- www.glpy.com.br é o fallback — deve continuar funcional no MVP e além
- /acesso deve funcionar com e sem www
- UptimeRobot já monitora www.glpy.com.br e www.glpy.com.br/acesso
- Não remover, quebrar ou ignorar www sem decisão específica e planejada
```

#### lp.glpy.com.br

```txt
Função:    Landing pages de campanhas de tráfego pago e orgânico
Fase:      comercial — futuro próximo
Exemplos futuros:
  lp.glpy.com.br/anti-rebote
  lp.glpy.com.br/canetas
  lp.glpy.com.br/fundadores
  lp.glpy.com.br/semestral
  lp.glpy.com.br/anual
```

#### quiz.glpy.com.br

```txt
Função:    Quiz diagnóstico de pré-venda e funil por avatar
Fase:      comercial — futuro próximo
Observação: pode hospedar o quiz de 23 perguntas e funis por avatar (ex: EnLead ou solução própria)
```

#### app.glpy.com.br

```txt
Função:    App logado / área autenticada do usuário
Fase:      app estruturado — futuro próximo
Observação: pode substituir ou complementar a rota atual do app quando a arquitetura estiver mais madura
```

#### login.glpy.com.br

```txt
Função:    Login, ativação de acesso, recuperação de conta e fluxo de entrada
Fase:      app estruturado — futuro próximo
Observação:
  No MVP: manter glpy.com.br/acesso
  Futuro: avaliar mover ativação para login.glpy.com.br/acesso após validação completa
  Nunca migrar sem testar e sem atualizar todos os links da HeroSpark simultaneamente
```

#### api.glpy.com.br

```txt
Função:    API, backend, webhooks HeroSpark, Pix API, Firebase functions ou backend próprio
Fase:      backend — futuro
Observação: usar quando houver necessidade real de backend próprio fora do Vercel atual
```

#### admin.glpy.com.br

```txt
Função:    Painel interno de suporte, debug, auditoria e caixa preta
Fase:      interno — futuro
Observação: deve ser protegido por autenticação forte e nunca indexado publicamente
```

---

## 3. Subdomínios que NÃO devem ser priorizados

### api.app.glpy.com.br — NÃO recomendado

```txt
Motivo:
- Aumenta complexidade desnecessária no MVP
- api.glpy.com.br é mais limpo e correto para backend/webhooks
- app.glpy.com.br deve ficar reservado para o app do usuário
- Subdomínio composto api.app é confuso e difícil de gerenciar
```

---

## 4. Mapa de subdomínios por fase

### Fase MVP atual

```txt
✓ glpy.com.br                → home/LP oficial — domínio principal/canônico
✓ www.glpy.com.br            → fallback operacional — deve funcionar e ser monitorado
✓ glpy.com.br/acesso         → ativação pós-compra (rota crítica — não alterar)
✓ www.glpy.com.br/acesso     → fallback de ativação — deve funcionar como alternativa
```

### Fase comercial (próximo)

```txt
○ lp.glpy.com.br        → landing pages de campanha
○ quiz.glpy.com.br      → quiz de diagnóstico / funil de venda
```

### Fase app estruturado

```txt
○ app.glpy.com.br       → app logado / área do usuário
○ login.glpy.com.br     → login e ativação (substitui /acesso no futuro)
```

### Fase backend/webhook

```txt
○ api.glpy.com.br       → backend, webhooks, API
```

### Fase interna/admin

```txt
○ admin.glpy.com.br     → painel interno protegido
```

---

## 5. Regra oficial de domínio principal e fallback www

### Regra

```txt
glpy.com.br        → domínio principal/canônico — toda comunicação oficial usa este
www.glpy.com.br    → fallback operacional — deve estar funcional, testado e monitorado

Ambos devem:
- Abrir corretamente no browser
- Servir o app/LP sem erro
- Aceitar /acesso com os parâmetros corretos (email, token, plan)
- Ser monitorados pelo UptimeRobot

www.glpy.com.br NÃO deve ser:
- Removido do DNS
- Tratado como descartável
- Quebrado por qualquer deploy ou mudança de rota
- Substituído pelo principal sem planejamento
```

### URLs monitoradas (UptimeRobot)

```txt
✓ https://glpy-v1.vercel.app
✓ https://glpy.com.br
✓ https://www.glpy.com.br
✓ https://www.glpy.com.br/acesso?email=teste@gmail.com&token=GLPY2026

PENDENTE — adicionar monitor para:
[ ] https://glpy.com.br/acesso?email=teste@gmail.com&token=GLPY2026
    (atualmente monitorado via www — adicionar também sem www para cobrir ambos)
```

### Regra de teste antes de tráfego pago

```txt
Antes de qualquer campanha paga, testar manualmente:
1. https://glpy.com.br                           → abre home?
2. https://www.glpy.com.br                       → abre home?
3. https://glpy.com.br/acesso?email=teste@gmail.com&token=GLPY2026     → tela de acesso?
4. https://www.glpy.com.br/acesso?email=teste@gmail.com&token=GLPY2026 → tela de acesso?

Se qualquer um falhar, investigar antes de iniciar tráfego.
```

---

## 6. Links de ativação oficiais HeroSpark

```txt
GLPY Essencial (mensal):
https://glpy.com.br/acesso?email={{buyer_email}}&token=GLPY2026&plan=essencial

GLPY Semestral:
https://glpy.com.br/acesso?email={{buyer_email}}&token=GLPY2026&plan=semestral

GLPY Anual:
https://glpy.com.br/acesso?email={{buyer_email}}&token=GLPY2026&plan=anual
```

> Mesmo que `login.glpy.com.br` seja previsto no futuro, os links da HeroSpark devem continuar usando `glpy.com.br/acesso` até que a migração seja planejada, testada e todos os links atualizados simultaneamente.

---

## 7. Planos e liberação de acesso

| Plano | Tipo | Parâmetro | Duração | Expiração |
|---|---|---|---|---|
| Essencial | mensal recorrente | plan=essencial | enquanto assinatura ativa | subscription_available_until |
| Semestral | pagamento único | plan=semestral | 180 dias | data da compra + 180 dias |
| Anual | pagamento único | plan=anual | 365 dias | data da compra + 365 dias |

---

## 8. Home/LP oficial do GLPY — estrutura sugerida

### Headline principal

```txt
"GLPY — o app da jornada GLP-1"
```

### Subheadline

```txt
"Protocolos, IA, registros e progresso para quem usa canetas emagrecedoras
e quer proteger sua evolução."
```

### Blocos de conteúdo recomendados

```txt
1. Como funciona
2. Para quem é
3. O que está incluso:
   - 10 protocolos de acompanhamento
   - GLPY IA — respostas para a sua jornada
   - Análise do prato por foto
   - Registro de água, refeição, peso, aplicação, sintomas, emoção e atividade
   - Progresso visual e timeline
   - Checklist diário
4. Planos e preços (Mensal / Semestral / Anual)
5. Aviso educativo (não substitui médico/nutricionista)
```

### CTAs

```txt
Principal:   "Começar agora"           → checkout HeroSpark
Secundário:  "Já comprei / Acessar minha conta"  → glpy.com.br/acesso
```

### Referências visuais (apenas como inspiração estrutural)

```txt
- inject-app.com
- ozempro.com/pt

IMPORTANTE:
Não copiar conteúdo, marca, layout ou elementos proprietários.
Usar apenas como referência de clareza comercial, estrutura de seções e posicionamento de app médico/saúde.
```

---

## 9. E-mails HeroSpark — regras oficiais

### Regra geral

```txt
Não depender apenas do e-mail automático genérico da HeroSpark.
Criar automações próprias por produto, com link de ativação correto em cada um.
```

### Gatilhos por tipo de produto

```txt
GLPY Essencial (mensal):   gatilho "Assinatura criada"
GLPY Semestral:            gatilho "Pagamento confirmado"
GLPY Anual:                gatilho "Pagamento confirmado"
```

### Regras obrigatórias para cada automação

```txt
1. Filtrar por produto específico (não usar automação global para todos os produtos)
2. Incluir o link de ativação correto com plan= do produto
3. Garantir que {{buyer_email}} é substituído antes de enviar
4. Verificar remetente — não deve aparecer como nome pessoal do produtor
```

---

## 10. Problemas identificados no e-mail atual da HeroSpark

```txt
PROBLEMA 1:
Remetente aparece como nome pessoal "CLEISON CARDOSO TEIXEIRA" — deve ser corrigido
para nome da marca/plataforma (ex: "GLPY" ou "Equipe GLPY").

PROBLEMA 2:
Produto antigo aparece como "GLPY Essencial" com valor R$29,90/mês — diverge da nova
política comercial (R$49,90/mês). Precisa ser corrigido ou o produto antigo desativado.

IMPACTO:
Clientes que recebem e-mail com preço diferente do que pagaram podem questionar,
pedir reembolso ou abrir disputa. Corrigir antes de escalar tráfego pago.
```

---

## 11. Estrutura de e-mails recomendados por produto

### GLPY Essencial

```txt
Assunto:   Seu acesso ao GLPY Essencial está pronto
Remetente: GLPY (ou Equipe GLPY)
Corpo:     Boas-vindas + link de ativação + instrução simples
Link:      https://glpy.com.br/acesso?email={{buyer_email}}&token=GLPY2026&plan=essencial
```

### GLPY Semestral

```txt
Assunto:   Seu acesso ao GLPY Semestral está pronto
Remetente: GLPY (ou Equipe GLPY)
Corpo:     Boas-vindas + prazo de acesso (180 dias) + link de ativação
Link:      https://glpy.com.br/acesso?email={{buyer_email}}&token=GLPY2026&plan=semestral
```

### GLPY Anual

```txt
Assunto:   Seu acesso ao GLPY Anual está pronto
Remetente: GLPY (ou Equipe GLPY)
Corpo:     Boas-vindas + prazo de acesso (365 dias) + link de ativação
Link:      https://glpy.com.br/acesso?email={{buyer_email}}&token=GLPY2026&plan=anual
```

---

## 12. Checklist HeroSpark — revisar antes de escalar tráfego

```txt
[ ] Conferir nome público da plataforma/produtor (corrigir "CLEISON CARDOSO TEIXEIRA")
[ ] Conferir nome e preço dos produtos no painel (produto antigo R$29,90 → corrigir ou desativar)
[ ] Desativar ou corrigir ofertas antigas com preço divergente da política atual
[ ] Configurar pós-compra com "Página personalizada" em cada produto
[ ] Colar link de ativação correto para cada método de pagamento (Pix, cartão)
[ ] Garantir que {{buyer_email}} é substituído corretamente pelo link do HeroSpark
[ ] Criar automação de e-mail por produto (Essencial / Semestral / Anual)
[ ] Corrigir remetente nos templates de e-mail
[ ] Testar compra real via Pix em cada plano
[ ] Verificar se /acesso ativa o plano correto após cada compra de teste
```

---

## 13. Checklist DNS futuro — documentar sem implementar

```txt
[ ] Revisar configuração atual de DNS do glpy.com.br
[ ] Confirmar que www.glpy.com.br está funcional como fallback operacional
[ ] Garantir que /acesso funciona com e sem www
[ ] Planejar lp.glpy.com.br
[ ] Planejar quiz.glpy.com.br
[ ] Planejar app.glpy.com.br
[ ] Planejar login.glpy.com.br
[ ] Planejar api.glpy.com.br
[ ] Planejar admin.glpy.com.br com acesso restrito
[ ] Garantir HTTPS em todos os subdomínios
[ ] Confirmar comportamento correto do www (fallback, não remoção)
[ ] Testar todos os links de produção antes de trocar qualquer rota pós-compra
[ ] Nunca trocar links da HeroSpark sem testar a rota destino antes
```

---

## 14. Próximas tarefas técnicas — listar sem implementar agora

```txt
PRIORIDADE IMEDIATA:
[ ] Atualizar /acesso para ler parâmetro plan=essencial/semestral/anual
[ ] Salvar plan correto ao ativar acesso
[ ] Salvar expiresAt para semestral (hoje + 180 dias) e anual (hoje + 365 dias)

PRIORIDADE COMERCIAL:
[ ] Atualizar paywall com 3 planos, labels e links de checkout reais
[ ] Criar Home/LP pública em glpy.com.br com CTAs corretos
[ ] Validar www.glpy.com.br

PRIORIDADE FUTURA:
[ ] Separar app.glpy.com.br para área logada
[ ] Separar login.glpy.com.br para fluxo de entrada
[ ] Criar api.glpy.com.br para webhook e backend próprio
```

---

## 15. Observações finais

```txt
- Este documento é de arquitetura e planejamento — nenhum código foi alterado.
- Nenhuma configuração de DNS, Firebase, Vercel, webhook ou app foi modificada.
- A rota glpy.com.br/acesso está protegida e não deve ser alterada sem tarefa específica.
- Os links de ativação com plan= só devem ser ativados na HeroSpark após validação técnica de /acesso.
- O problema do remetente e do preço divergente deve ser corrigido antes de escalar tráfego.
- Manter alinhamento com:
    docs/herospark-produtos-glpy-v1.md
    docs/politica-planos-glpy-v2.md
    docs/herospark-variaveis-webhook-glpy.md
```

---

*Documento criado em 2026-06-10 — GLPY Arquitetura de Domínio, Subdomínios, Acesso e E-mails V1*  
*Atualizado em 2026-06-10 — www tratado como fallback operacional; seção oficial adicionada*
