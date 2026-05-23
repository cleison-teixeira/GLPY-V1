# GLPY — Estratégia Segura de Migração para Firebase

## Decisão principal

O GLPY **não deve migrar tudo para Firebase antes do MVP estar validado e vendendo**.

A prioridade atual é:

```txt
1. Estabilizar o MVP com localStorage
2. Corrigir bugs funcionais críticos
3. Colocar a Home oficial no ar com segurança
4. Validar venda, checkout, paywall e uso real
5. Depois preparar a migração para Firebase com camada intermediária
```

A migração para Firebase **não deve ser feita tela por tela de forma direta**, porque isso pode quebrar o MVP que já estará sendo vendido.

---

## Risco de migrar direto agora

Hoje várias partes do GLPY dependem diretamente do `localStorage`, por exemplo:

```txt
glpy_onboarding
glpy_emocao_hoje
glpy_today_emotion
glpy_agua_hoje
glpy_refeicoes_hoje
glpy_atividade_hoje
glpy_today_activity
glpy_checkin_hoje
glpy_checkin_historico
glpy_ai_usage
glpy_medidas_corporais
glpy_current_weight
glpy_peso_sonho
```

Se migrar direto para Firebase sem camada intermediária, pode quebrar:

```txt
Home
Check-in
IA
Metas diárias
Progresso
Protocolos
Água
Refeição
Medidas
Tratamento
Streak
Paywall
Contador de IA
```

---

## Estratégia correta

A arquitetura segura é:

```txt
Telas do app
   ↓
GLPY Data Store
   ↓
LocalStorage Adapter agora
Firebase Adapter depois
```

Ou seja: as telas não devem ficar presas ao `localStorage`.

Hoje uma tela pode estar fazendo:

```ts
localStorage.getItem('glpy_emocao_hoje')
```

No futuro, ela deve chamar:

```ts
glpyStore.emotion.getToday()
```

Na V1, essa função lê do `localStorage`.

Na V2, a mesma função passa a ler do Firebase.

---

# Fase 1 — MVP vendável com localStorage

## Objetivo

```txt
Vender sem quebrar.
```

## Manter agora

Continuar usando `localStorage` para:

```txt
Onboarding
Perfil corporal
Água
Refeições
Emoção
Atividade
Medidas
Tratamento
Check-in
IA usage
Protocolos
Home
Progresso
```

## O que finalizar antes da migração

```txt
1. Contador e trava da IA
2. Paywall sem bypass
3. Protocolos funcionando
4. Check-in sincronizado
5. Home limpa e estável
6. Fluxo de checkout
7. Modal de instalação PWA
8. Teste completo em iPhone e Android
```

---

# Fase 2 — Criar camada canônica de dados

## Objetivo

```txt
Parar de espalhar localStorage pelo app.
```

Criar arquivos como:

```txt
src/data/glpyStore.ts
src/data/localStorageAdapter.ts
src/data/types.ts
```

Criar funções canônicas:

```txt
readOnboarding()
saveOnboarding()

readTodayEmotion()
saveTodayEmotion()

readTodayWater()
saveTodayWater()

readTodayMeals()
saveTodayMeal()

readTodayActivity()
saveTodayActivity()

readTodayCheckIn()
saveTodayCheckIn()

readAIUsage()
incrementAIUsage()

readBodyMeasurements()
saveBodyMeasurements()

readTreatment()
saveTreatment()

readActiveProtocol()
saveActiveProtocol()
```

As telas passam a usar essas funções, e não mais `localStorage` direto.

---

# Fase 3 — Firebase por trás da mesma camada

## Objetivo

```txt
Trocar a fonte dos dados sem quebrar as telas.
```

Criar:

```txt
src/data/firebaseAdapter.ts
```

A interface continua igual:

```ts
glpyStore.emotion.getToday()
glpyStore.water.saveToday()
glpyStore.aiUsage.increment()
```

Mas por baixo, em vez de `localStorage`, passa a usar Firestore.

---

# Estrutura sugerida no Firebase

```txt
users/{userId}
  profile
    name
    email
    height
    startWeight
    currentWeight
    goalWeight
    medication
    dose
    frequency
    createdAt
    updatedAt

  daily/{YYYY-MM-DD}
    water
    meals
    emotion
    activity
    checkin
    symptoms
    application
    bodyPhoto
    createdAt
    updatedAt

  protocols/{protocolId}
    status
    currentDay
    totalDays
    startedAt
    progress
    completedDays

  aiUsage/{YYYY-MM}
    used
    limit
    plan
    updatedAt

  subscription
    plan
    status
    kiwifyCustomerId
    startedAt
    expiresAt
```

---

# Regra de migração segura

Quando o usuário logar, o app pode fazer:

```txt
1. Verificar se existe dado local no localStorage
2. Verificar se já existe dado no Firebase
3. Se Firebase estiver vazio, migrar dados locais para Firebase
4. Marcar migração como concluída
5. Continuar lendo do Firebase
```

Chave sugerida:

```txt
glpy_migration_v1_done = true
```

---

# Frase guia do projeto

```txt
Não trocar o motor com o carro andando.

Primeiro estabiliza o MVP com localStorage.
Depois cria a camada glpyStore.
Depois conecta Firebase por trás.
Depois migra os dados locais silenciosamente.
```

---

# Prompt futuro para Claude/Antigravity

```txt
Criar camada canônica de dados do GLPY sem migrar ainda para Firebase.

Não alterar visual.
Não alterar comportamento das telas.
Não quebrar o MVP atual.

Objetivo:
Parar de espalhar localStorage diretamente nas telas e hooks.

Criar:
- src/data/types.ts
- src/data/localStorageAdapter.ts
- src/data/glpyStore.ts

A camada deve manter as mesmas chaves atuais do localStorage, mas expor funções canônicas:
- readOnboarding / saveOnboarding
- readTodayEmotion / saveTodayEmotion
- readTodayWater / saveTodayWater
- readTodayMeals / saveTodayMeal
- readTodayActivity / saveTodayActivity
- readTodayCheckIn / saveTodayCheckIn
- readAIUsage / incrementAIUsage
- readBodyMeasurements / saveBodyMeasurements
- readTreatment / saveTreatment
- readActiveProtocol / saveActiveProtocol

Regras:
- Não mudar storage ainda.
- Não implementar Firebase ainda.
- Apenas criar uma camada intermediária.
- As telas devem continuar funcionando igual.
- Manter local-storage-change para reatividade.
- Rodar build no final.

Objetivo futuro:
Permitir trocar localStorageAdapter por FirebaseAdapter sem reescrever Home, Check-in, IA, Progresso e telas operacionais.
```

---

# Checklist para usar antes de iniciar Firebase

```txt
[ ] MVP vendável funcionando com localStorage
[ ] Home oficial estável
[ ] Onboarding validado
[ ] Paywall sem bypass
[ ] Checkout funcionando
[ ] IA com contador e trava funcionando
[ ] Check-in sincronizado
[ ] Água, refeição, emoção, atividade, peso, medidas e tratamento sincronizados
[ ] Protocolos iniciando corretamente
[ ] PWA testado em iPhone e Android
[ ] Camada glpyStore criada
[ ] Telas pararam de acessar localStorage direto
[ ] FirebaseAdapter pronto para ser plugado
[ ] Migração silenciosa localStorage → Firestore testada
```
