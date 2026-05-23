# GLPY — Estratégia Segura de Internacionalização / i18n

## 1. Decisão principal

O GLPY poderá ter versões em **Português**, **Espanhol** e **Inglês**, mas a internacionalização **não deve ser feita traduzindo textos diretamente dentro das telas**.

A forma correta é criar uma camada de **i18n** — internacionalização — para separar os textos visíveis da interface da lógica do aplicativo.

A regra principal é:

```txt
Não traduzir o código.
Traduzir somente os textos visíveis para o usuário.
```

---

## 2. Por que não traduzir direto no código

Hoje muitas telas podem ter textos fixos como:

```tsx
<h1>GLPY HUB</h1>
<p>Seu centro de protocolos, conteúdo, comunidade e evolução.</p>
```

Se o app for traduzido manualmente tela por tela, existe risco de quebrar:

```txt
Home
HUB
Protocolos
IA
Paywall
Onboarding
Check-in
Rotas
localStorage
Navegação
Estados internos
```

O risco aumenta se alguém traduzir por engano:

```txt
nomes de variáveis
nomes de funções
rotas internas
chaves de localStorage
nomes de componentes
nomes de estados do App.tsx
```

---

## 3. Forma correta

A interface deve chamar uma função de tradução, por exemplo:

```tsx
<h1>{t('hub.title')}</h1>
<p>{t('hub.subtitle')}</p>
```

E os textos devem ficar em arquivos separados:

```txt
src/locales/pt-BR.json
src/locales/es.json
src/locales/en.json
```

Exemplo em português:

```json
{
  "hub": {
    "title": "GLPY HUB",
    "subtitle": "Seu centro de protocolos, conteúdo, comunidade e evolução."
  }
}
```

Exemplo em espanhol:

```json
{
  "hub": {
    "title": "GLPY HUB",
    "subtitle": "Tu centro de protocolos, contenido, comunidad y evolución."
  }
}
```

Exemplo em inglês:

```json
{
  "hub": {
    "title": "GLPY HUB",
    "subtitle": "Your center for protocols, content, community, and progress."
  }
}
```

---

## 4. O que pode ser traduzido

Traduzir somente textos visíveis para o usuário:

```txt
Títulos
Subtítulos
Botões
Labels
Descrições
Mensagens de erro
Toasts
Cards
Textos de onboarding
Textos de paywall
Textos da IA exibidos na interface
Textos de protocolos exibidos para o usuário
```

---

## 5. O que NÃO pode ser traduzido

Não traduzir estruturas técnicas:

```txt
glpy_onboarding
glpy_agua_hoje
glpy_refeicoes_hoje
glpy_ai_usage
glpy_xp
glpy_current_weight
glpy_medidas_corporais
glpy_active_protocol
```

Não traduzir nomes internos:

```txt
HomePremiumV2
HubScreen
ProtocolHub
ChatIA
CheckInScreen
onNavigate('dashboard')
onNavigate('chatIA')
onNavigate('protocolHub')
onNavigate('hub')
```

Não traduzir rotas internas:

```txt
/preview/hub
/preview/protocols
/preview/chat-ia
/preview/recipes
/preview/water
/preview/food-log
```

Não traduzir nomes de campos salvos:

```txt
weight
height
goalWeight
used
limit
month
date
savedAt
payload
```

---

## 6. Estratégia recomendada para o GLPY

## Fase 1 — MVP Brasil

Antes de internacionalizar, finalizar o MVP em português.

Prioridades:

```txt
Home oficial estável
Onboarding validado
HUB funcionando
Protocolos funcionando
GLPY IA funcionando
Paywall sem bypass
Checkout funcionando
PWA testado em iPhone e Android
localStorage estável
Bugs críticos corrigidos
```

Não iniciar i18n antes do MVP estar vendável.

---

## Fase 2 — Criar estrutura i18n sem traduzir tudo

Criar a estrutura base:

```txt
src/i18n/index.ts
src/locales/pt-BR.json
src/locales/es.json
src/locales/en.json
```

Instalar biblioteca, se necessário:

```txt
i18next
react-i18next
```

Ou criar uma solução simples própria, se o projeto preferir evitar dependências.

Objetivo desta fase:

```txt
Criar a camada de tradução sem alterar toda a interface de uma vez.
```

---

## Fase 3 — Migrar textos por tela, uma tela por vez

Não migrar o app inteiro de uma vez.

Ordem sugerida:

```txt
1. Login / Autenticação
2. Onboarding
3. Home
4. HUB
5. Paywall
6. GLPY IA
7. Protocolos
8. Check-in
9. Perfil
10. Progresso
```

Cada tela deve ser migrada, testada e aprovada antes de seguir para a próxima.

---

## Fase 4 — Tradução comercial/localizada

As traduções não devem ser literais.

Devem ser adaptadas para venda e entendimento local:

```txt
Português do Brasil
Espanhol neutro ou espanhol por país
Inglês internacional
```

Exemplo:

Português:

```txt
Sua jornada metabólica começa agora.
```

Espanhol:

```txt
Tu transformación metabólica empieza ahora.
```

Inglês:

```txt
Your metabolic transformation starts now.
```

---

## 7. Estrutura sugerida dos arquivos de idioma

```txt
src/locales/
  pt-BR.json
  es.json
  en.json
```

Estrutura interna sugerida:

```json
{
  "common": {
    "continue": "Continuar",
    "back": "Voltar",
    "cancel": "Cancelar",
    "save": "Salvar",
    "loading": "Carregando..."
  },
  "auth": {
    "loginTitle": "Entrar no GLPY",
    "email": "E-mail",
    "password": "Senha"
  },
  "home": {
    "title": "Sua transformação está acontecendo",
    "nutritionTargets": "Metas diárias de nutrição"
  },
  "hub": {
    "title": "GLPY HUB",
    "subtitle": "Seu centro de protocolos, conteúdo, comunidade e evolução.",
    "cards": {
      "protocols": "Protocolos",
      "recipes": "Receitas",
      "cells": "Células",
      "ai": "GLPY IA",
      "science": "Ciência GLP-1",
      "store": "Loja GLPY"
    }
  }
}
```

---

## 8. Regras técnicas de segurança

### Regra 1 — Não alterar lógica junto com tradução

Em tarefas de i18n, não mexer em:

```txt
localStorage
Firebase
Auth Guard
Paywall
Regras de protocolo
Contador de IA
XP
Check-in
```

### Regra 2 — Não traduzir chaves técnicas

Chaves técnicas devem permanecer iguais em todos os idiomas.

### Regra 3 — Não alterar rotas

A rota pode continuar igual mesmo em outro idioma.

Exemplo:

```txt
/hub
/protocols
/chat-ia
```

Não criar:

```txt
/es/protocolos
/en/protocols
```

Isso pode ficar para fase futura.

### Regra 4 — Testar tela por tela

Depois de migrar uma tela para i18n:

```txt
1. Testar português
2. Testar espanhol
3. Testar inglês
4. Rodar build
5. Validar visual mobile
6. Aprovar antes de seguir
```

### Regra 5 — Fallback obrigatório

Se uma tradução estiver faltando, o app deve cair para português ou mostrar a chave de forma segura.

---

## 9. Prompt inicial para Claude / Antigravity

```txt
Tarefa i18n 1.1 — Criar estrutura base de internacionalização do GLPY.

Objetivo:
Criar a estrutura base de i18n sem traduzir o app inteiro ainda.

Não mexer na Home.
Não mexer no HUB.
Não mexer em Protocolos.
Não mexer em IA.
Não mexer em localStorage.
Não mexer em Auth Guard.
Não mexer em paywall.
Não alterar rotas.
Não alterar regras de negócio.
Rodar build no final.

Criar:
- src/i18n/index.ts
- src/locales/pt-BR.json
- src/locales/es.json
- src/locales/en.json

Usar biblioteca existente se já houver i18n no projeto.
Se não houver, pode instalar i18next/react-i18next ou criar helper simples, escolhendo a opção mais segura para o projeto.

Criar função/hook:
- t(key)
- useTranslation(), se usar biblioteca

Configurar idioma padrão:
pt-BR

Criar idiomas disponíveis:
- pt-BR
- es
- en

Criar fallback:
pt-BR

Incluir apenas textos básicos de teste nos arquivos:
common.continue
common.back
common.cancel
common.save
common.loading
hub.title
hub.subtitle

Não migrar telas ainda.
Apenas criar estrutura e validar que build passa.

Ao final responder:
1. quais arquivos criou
2. qual biblioteca/helper usou
3. qual idioma padrão ficou definido
4. qual fallback ficou definido
5. se alterou alguma tela existente
6. se build passou
```

---

## 10. Prompt para migrar uma tela específica

Exemplo para HUB:

```txt
Tarefa i18n 1.2 — Migrar SOMENTE os textos visíveis da HubScreen para i18n.

Não mexer no visual.
Não mexer na navegação.
Não mexer nos cards.
Não mexer em Protocolos.
Não mexer em IA.
Não mexer em localStorage.
Não alterar lógica.
Rodar build no final.

Objetivo:
Substituir textos fixos visíveis da HubScreen por chaves i18n.

Exemplo:
"GLPY HUB" → t('hub.title')
"Seu centro de protocolos..." → t('hub.subtitle')

Adicionar as chaves correspondentes em:
- pt-BR.json
- es.json
- en.json

Não traduzir:
- nomes de componentes
- rotas
- onNavigate
- chaves técnicas
- localStorage

Ao final responder:
1. quais textos foram migrados
2. quais chaves foram criadas
3. se pt-BR/es/en foram preenchidos
4. se visual ficou igual
5. se build passou
```

---

## 11. Checklist antes de começar internacionalização

```txt
[ ] MVP Brasil funcionando
[ ] Home estável
[ ] HUB aprovado
[ ] Protocolos estáveis
[ ] IA estável
[ ] Paywall sem bypass
[ ] Checkout funcionando
[ ] PWA testado
[ ] Bugs críticos corrigidos
[ ] Decisão de idioma padrão definida
[ ] Decisão de espanhol neutro ou por país definida
[ ] Glossário GLPY criado
```

---

## 12. Glossário inicial GLPY

Termos que devem ser traduzidos com cuidado:

```txt
Jornada metabólica
Transformação metabólica
Protocolo
Células
Check-in
Rebote
Caneta
GLP-1
Cocriação
Fórmulas clínicas
Progresso
Metas diárias
```

Sugestão:

```txt
Células
ES: Células
EN: Cells

Protocolo
ES: Protocolo
EN: Protocol

Check-in
ES: Check-in
EN: Check-in

Rebote
ES: Rebote
EN: Weight regain / rebound

Caneta
ES: Pluma / Inyección GLP-1
EN: GLP-1 pen / injection
```

---

## 13. Status

```txt
Documento criado.
Implementação recomendada após estabilização do MVP Brasil.
Prioridade: futura, antes de expansão internacional.
```
