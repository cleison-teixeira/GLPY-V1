# GLPY — Caixa Preta / Black Box de Inteligência

## 1. Decisão estratégica

O GLPY precisa ter uma **Caixa Preta**, uma camada interna de registro e leitura de eventos que funcione como a **coluna vertebral comportamental do app**.

A ideia é simples:

> Tudo que o usuário faz, registra, sente, consome, pergunta ou abandona precisa deixar um rastro organizado.

Esse rastro será usado para:

- entender o comportamento real dos usuários;
- alimentar a GLPY IA com contexto mais profundo;
- melhorar retenção;
- facilitar suporte;
- preparar relatórios;
- ajudar na futura migração para Firebase;
- criar inteligência de produto e crescimento.

Neste momento, a Caixa Preta deve nascer como uma **estrutura interna/debug**, sem aparecer para o usuário final.

---

## 2. Nome do recurso

### Nome técnico

```txt
GLPY Black Box
```

### Nome visual interno

```txt
Caixa Preta GLPY
```

### Rota interna sugerida

```txt
/preview/black-box
```

ou:

```txt
/preview/intelligence-log
```

---

## 3. O problema que a Caixa Preta resolve

Hoje o GLPY possui várias telas salvando informações separadas:

- água;
- refeições;
- macros;
- peso;
- meta;
- altura;
- medidas corporais;
- atividade física;
- aplicação/medicação;
- sintomas;
- emoção;
- check-in;
- protocolos;
- uso da IA;
- plano/assinatura;
- fotos;
- navegação.

O risco é o app virar um conjunto de registros soltos.

A Caixa Preta organiza tudo em uma linha do tempo única, permitindo responder perguntas como:

```txt
O usuário registrou água hoje?
Comeu proteína suficiente?
Está ansioso?
Teve náusea?
Fez atividade física?
Aplicou a medicação?
Concluiu o check-in?
Iniciou protocolo?
Parou em qual dia?
Usou a IA?
Bateu limite de mensagens?
Clicou em planos?
Instalou o app no celular?
Abandonou alguma tela importante?
```

---

## 4. Visão de produto

O GLPY não deve ser apenas um app de registro.

Ele deve evoluir para um sistema capaz de:

```txt
entender comportamento
identificar padrões
cruzar dados
orientar melhor
reter mais usuários
criar plano personalizado
sugerir protocolos, receitas e suplementação
```

A Caixa Preta é o começo dessa inteligência.

---

## 5. Benefícios principais

## 5.1 Inteligência da IA

A GLPY IA deixa de responder de forma genérica e passa a interpretar o histórico real do usuário.

Exemplo:

```txt
Nos últimos 3 dias você registrou pouca água, náusea leve e ansiedade alta. Isso pode estar relacionado à sua baixa energia hoje.
```

## 5.2 Retenção

Permite identificar pontos de abandono:

```txt
Fez onboarding, mas não registrou água.
Registrou refeição uma vez, mas não voltou.
Usou 10 mensagens da IA e não assinou plano maior.
Começou protocolo, mas parou no Dia 2.
```

## 5.3 Suporte

Facilita entender o que aconteceu com cada usuário:

```txt
Cadastrou peso errado.
Não iniciou protocolo.
Tentou acessar IA com limite esgotado.
Registrou aplicação, mas não fez check-in.
```

## 5.4 Produto

Mostra o que as pessoas realmente usam:

```txt
Água
IA
Refeição
Emoção
Protocolo
Peso
Medidas
```

Também mostra o que ninguém usa.

## 5.5 Firebase e Analytics

A Caixa Preta prepara a futura migração para Firebase, Firestore, relatórios e analytics.

---

## 6. Estrutura técnica inicial no MVP

No MVP atual, usando `localStorage`, criar uma chave única:

```txt
glpy_event_log
```

Formato do evento:

```json
{
  "id": "evt_001",
  "type": "emotion_saved",
  "date": "2026-05-21",
  "timestamp": "2026-05-21T21:30:00.000Z",
  "source": "EmotionScreen",
  "payload": {
    "mood": "Ansiosa",
    "energy": "Alta",
    "note": "Hoje acordei ansiosa"
  }
}
```

Exemplo com água:

```json
{
  "id": "evt_002",
  "type": "water_added",
  "date": "2026-05-21",
  "timestamp": "2026-05-21T21:35:00.000Z",
  "source": "WaterScreen",
  "payload": {
    "amountLiters": 0.25,
    "totalToday": 1.5
  }
}
```

---

## 7. Estrutura futura no Firebase

Quando o GLPY migrar para Firebase, a estrutura pode ser:

```txt
users/{userId}/events/{eventId}
```

Exemplo:

```txt
users/{userId}
  events/{eventId}
    type
    date
    timestamp
    source
    payload
```

Essa estrutura permite consultar a linha do tempo por usuário, data, evento, protocolo ou comportamento.

---

## 8. Eventos que a Caixa Preta deve registrar

### Eventos de onboarding e perfil

```txt
onboarding_started
onboarding_completed
profile_updated
weight_saved
weight_goal_updated
height_updated
body_profile_updated
```

### Eventos de saúde e jornada diária

```txt
water_added
meal_saved
meal_photo_added
macros_saved
emotion_saved
activity_saved
body_measurements_saved
symptom_saved
application_saved
treatment_saved
checkin_completed
checkin_updated
```

### Eventos de protocolo

```txt
protocol_started
protocol_day_opened
protocol_day_completed
protocol_paused
protocol_completed
```

### Eventos de IA

```txt
ai_message_sent
ai_response_received
ai_limit_reached
ai_upgrade_clicked
ai_context_built
```

### Eventos de assinatura e monetização

```txt
plan_viewed
plan_selected
checkout_started
checkout_completed
checkout_abandoned
subscription_active
subscription_blocked
```

### Eventos de navegação e engajamento

```txt
screen_viewed
quick_action_clicked
hub_opened
recipe_opened
supplement_opened
store_opened
community_opened
pwa_install_modal_viewed
pwa_install_dismissed
pwa_install_completed
```

---

## 9. Painel interno da Caixa Preta

Criar uma tela interna/debug:

```txt
/preview/black-box
```

Essa tela deve mostrar:

## 9.1 Resumo do usuário

```txt
Nome
Plano
Peso atual
Meta
Altura
IMC
Protocolo ativo
Mensagens IA usadas
Check-ins feitos
Último acesso
```

## 9.2 Estado atual do dia

```txt
Água: 1,50 L / 3,15 L
Proteínas: 50 g / 135 g
Carboidratos: 20 g / 290 g
Gordura: 10 g / 63 g
Refeições: 2
Atividade: 60 min
Emoção: Ansiosa
Energia emocional: Alta
Sintomas: Náusea leve
Aplicação: registrada ou pendente
Check-in: pendente/concluído
```

## 9.3 Linha do tempo do dia

Exemplo:

```txt
08:10 — Água registrada: 250 ml
09:20 — Emoção: Ansiosa / Alta
12:30 — Refeição: almoço com 500 kcal
15:00 — Atividade: musculação 60 min
20:30 — Perguntou para IA: Como estão minhas emoções hoje?
```

## 9.4 Alertas inteligentes

```txt
Baixa água + náusea
Ansiedade alta + pouca proteína
IA usada no limite
Protocolo não iniciado
Check-in abandonado
Aplicação registrada sem check-in
Usuário sem medidas corporais
Usuário sem refeição no dia
```

## 9.5 Payload da IA

Mostrar exatamente o contexto enviado para a IA.

Exemplo:

```txt
=== GLPY USER CONTEXT ===
Peso: 80,74 kg
Meta: 70,00 kg
Altura: 1,65 m
Água hoje: 1,50 L
Emoção: Ansiosa
Energia emocional: Alta
Atividade: Musculação 60 min
Refeição: Preto de pirão com linguiça
Protocolo: Anti-Rebote Dia 1/7
Mensagens IA usadas: 4/10
```

Esse bloco é essencial para debug e melhoria da IA.

---

## 10. Arquivos sugeridos

Criar:

```txt
src/core/glpyEventLog.ts
src/screens/debug/BlackBoxScreen.tsx
```

Opcionalmente:

```txt
src/core/glpyTimeline.ts
src/core/glpyBehaviorInsights.ts
```

---

## 11. Funções sugeridas

No arquivo:

```txt
src/core/glpyEventLog.ts
```

Criar funções:

```ts
addGlpyEvent(type, source, payload)
readGlpyEvents()
readTodayGlpyEvents()
clearGlpyEvents()
buildTodayTimeline()
```

Funções futuras:

```ts
readEventsByDate(date)
readEventsByType(type)
readEventsBySource(source)
buildUserBehaviorSummary()
buildAIContextFromEvents()
exportEventsAsJSON()
```

---

## 12. Regras importantes

### Não quebrar o MVP

A primeira versão da Caixa Preta não deve alterar o funcionamento atual das telas.

Ela deve apenas registrar eventos.

### Não migrar para Firebase agora

A Caixa Preta nasce em `localStorage`.

Firebase fica para uma fase posterior, usando a camada intermediária já documentada na estratégia de migração.

### Não expor para o usuário final

A rota deve ser interna/debug.

Não colocar no menu principal agora.

### Não registrar dados sensíveis desnecessários

Guardar apenas o necessário para entender comportamento e alimentar a inteligência do produto.

### Manter reatividade

Sempre que registrar um evento, disparar:

```ts
window.dispatchEvent(new Event('local-storage-change'))
```

---

## 13. Primeira fase recomendada

Criar infraestrutura e plugar poucos eventos seguros primeiro.

Eventos iniciais recomendados:

```txt
water_added
meal_saved
emotion_saved
activity_saved
ai_message_sent
ai_limit_reached
checkin_completed
```

Depois expandir para:

```txt
weight_saved
body_measurements_saved
treatment_saved
application_saved
protocol_started
protocol_day_completed
plan_selected
checkout_started
checkout_completed
```

---

## 14. Prompt para Claude / Antigravity

```txt
Criar especificação e primeiro MVP da "Caixa Preta GLPY" como painel interno de inteligência.

Não mexer nas telas atuais.
Não quebrar Home.
Não mexer em Auth Guard.
Não alterar fluxos existentes.
Não migrar para Firebase agora.
Não mudar o formato atual das chaves existentes.
Rodar build no final.

Objetivo:
Criar uma camada de registro de eventos do GLPY para entender o comportamento do usuário e servir como coluna vertebral da inteligência do app.

Nome técnico:
GLPY Black Box

Nome visual:
Caixa Preta GLPY

Criar:
1. src/core/glpyEventLog.ts
2. rota interna /preview/black-box
3. tela src/screens/debug/BlackBoxScreen.tsx

A camada deve registrar eventos em localStorage usando chave:
glpy_event_log

Formato do evento:
{
  id: string,
  type: string,
  date: "YYYY-MM-DD",
  timestamp: ISOString,
  source: string,
  payload: object
}

Criar funções:
- addGlpyEvent(type, source, payload)
- readGlpyEvents()
- readTodayGlpyEvents()
- clearGlpyEvents()
- buildTodayTimeline()

Importante:
Nesta primeira etapa, não precisa conectar todos os eventos ainda.
Mas deve criar a infraestrutura e registrar pelo menos estes eventos se forem fáceis de plugar:
- water_added
- meal_saved
- emotion_saved
- activity_saved
- weight_saved
- body_measurements_saved
- treatment_saved
- checkin_completed
- ai_message_sent
- ai_limit_reached
- protocol_started

Se for arriscado plugar tudo agora, criar só a infraestrutura e plugar 2 ou 3 eventos seguros.

Tela /preview/black-box deve mostrar:

1. Resumo do dia:
- total de eventos hoje
- água registrada
- refeições registradas
- emoção registrada
- atividade registrada
- check-in status
- mensagens IA usadas

2. Linha do tempo:
Lista cronológica dos eventos do dia:
Hora · Tipo · Fonte · Resumo

3. Estado atual:
Ler das chaves atuais:
- glpy_agua_hoje
- glpy_refeicoes_hoje
- glpy_emocao_hoje
- glpy_atividade_hoje
- glpy_ai_usage
- glpy_medidas_corporais
- glpy_onboarding
- glpy_active_protocol se existir

4. Payload da IA:
Mostrar um bloco escuro com o contexto que seria enviado para a IA, se já existir função build context.
Se não existir, mostrar "Payload da IA ainda não conectado".

5. Botões:
- Atualizar
- Limpar eventos
- Exportar JSON, se simples

Regras:
- Tela interna/debug, não expor na navegação principal.
- Visual Light Premium compatível com GLPY.
- Mobile-first.
- Não registrar dados sensíveis desnecessários.
- Não enviar nada para servidor.
- Tudo localStorage por enquanto.

Ao final responder:
1. quais arquivos criou
2. qual chave localStorage usa
3. quais funções criou
4. quais eventos já estão sendo registrados
5. quais eventos ficaram preparados mas ainda não plugados
6. qual rota criada
7. se o painel lê o estado atual do usuário
8. se o painel mostra linha do tempo
9. se build passou
```

---

## 15. Frase guia

```txt
A Caixa Preta GLPY é a memória comportamental do usuário.

Ela registra a jornada, alimenta a IA, orienta o produto, ajuda no suporte e prepara o app para escalar com inteligência real.
```

---

## 16. Status

```txt
Documento criado.
Implementação futura recomendada.
Prioridade: alta após estabilizar bugs críticos do MVP.
```
