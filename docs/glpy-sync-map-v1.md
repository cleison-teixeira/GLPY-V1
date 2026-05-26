# GLPY — Mapa de Sincronização V1
**BUG 16A.1 — Referência obrigatória antes de iniciar BUG 16B**
Data: 2026-05-26

---

## 1. Objetivo

Este documento protege a sincronização do GLPY durante a migração tela por tela para `glpyStore` e, futuramente, para Firebase.

**Premissa:** qualquer migração que quebre um dado sincronizado pode corromper a experiência do usuário de forma silenciosa — macros erradas na Home, IA sem contexto, streak perdida, protocolo desincronizado. Este mapa existe para evitar isso.

**Regra de ouro:** migrar um namespace por vez, validar no iPhone antes de avançar, nunca renomear chaves do localStorage sem adapter de compatibilidade.

---

## 2. Dados Canônicos Atuais

| Chave localStorage | Tipo | Descrição |
|---|---|---|
| `glpy_onboarding` | JSON | Dados completos do onboarding: peso, altura, meta, medicamento, etc. |
| `glpy_user` | JSON | Dados do usuário Firebase (uid, email, nome) |
| `glpy_nome` | string | Nome do usuário |
| `glpy_email` | string | E-mail do usuário |
| `glpy_altura` | string/number | Altura em metros |
| `glpy_peso_atual` | string/number | Peso atual em kg |
| `glpy_peso_sonho` | string/number | Peso meta em kg |
| `glpy_medicamento` | string/JSON | Medicamento ativo (ex: Ozempic 0.5mg) |
| `glpy_profile_photo` | JSON `{imageBase64, updatedAt}` | Foto de perfil comprimida (512×512 JPEG) |
| `glpy_refeicoes_hoje` | JSON array | Todas as refeições já registradas (manual + foto IA) |
| `glpy_agua_hoje` | JSON `{amount, date, updatedAt}` | Consumo de água do dia |
| `glpy_emocao_hoje` | JSON | Registro de emoção/humor do dia |
| `glpy_today_emotion` | JSON | Espelho de `glpy_emocao_hoje` usado por alguns componentes |
| `glpy_atividade_hoje` | JSON | Registro de atividade física do dia |
| `glpy_today_activity` | JSON | Espelho de `glpy_atividade_hoje` |
| `glpy_checkin_hoje` | JSON | Check-in do dia atual |
| `glpy_checkin_historico` | JSON array | Histórico completo de check-ins (fonte de verdade para streak) |
| `glpy_medidas_corporais` | JSON | Última medição corporal salva |
| `glpy_protocolo_ativo` | JSON | Protocolo ativo atual (espelho) |
| `glpy_active_protocol` | JSON | Protocolo ativo atual (canônico) |
| `glpy_ai_usage` | JSON `{used, limit, month}` | Contador de uso da GLPY IA |

---

## 3. Mapa Dado → Telas Dependentes

| Dado / Chave | Telas que **leem** | Telas que **escrevem** | Impacto se quebrar | Namespace glpyStore |
|---|---|---|---|---|
| `glpy_refeicoes_hoje` | HomePremiumV2 (macros), ChatIA (contexto), CheckIn, useNutritionConsumed | FoodLogScreen, FoodPhotoAnalysisScreen | Macros erradas na Home; IA sem contexto alimentar | `glpyStore.meals` |
| `glpy_onboarding` + peso/altura/meta | HomePremiumV2, useNutritionTargets, useCurrentWeight, useUserOnboarding, ChatIA | Onboarding, WeightSettings, HeightScreen | Metas inválidas, IA sem perfil, cálculo de IMC errado | `glpyStore.profile` |
| `glpy_profile_photo` | HomePremiumV2, BottomNav, HubScreen | HomePremiumV2 (aba Perfil) | Avatar genérico em todas as telas | `glpyStore.profile.getProfilePhoto` |
| `glpy_agua_hoje` | HomePremiumV2 (meta de água) | WaterScreen | Progresso de água incorreto na Home | `glpyStore.water` |
| `glpy_checkin_historico` | HomePremiumV2 (streak), CheckInScreen | CheckInScreen | Streak zerada ou incorreta | `glpyStore.checkin` |
| `glpy_protocolo_ativo` / `glpy_active_protocol` | HomePremiumV2, ChatIA, useActiveProtocol, ProtocoloBase | TreatmentSettings, Onboarding | IA sem protocolo, Home sem % progresso | `glpyStore.protocol` |
| `glpy_ai_usage` | ChatIA (limite de uso), Paywall | ChatIA (ao usar), Paywall | Usuário bloqueado indevidamente ou IA sem limite | `glpyStore.aiUsage` |
| `glpy_emocao_hoje` + `glpy_today_emotion` | HomePremiumV2 (performance center) | EmotionScreen | Humor não refletido na Home | `glpyStore.emotion` |
| `glpy_atividade_hoje` + `glpy_today_activity` | HomePremiumV2 (performance center) | ActivityScreen | Atividade não refletida na Home | `glpyStore.activity` |
| `glpy_medidas_corporais` | HomePremiumV2 (evolução corporal), BodyProfileScreen | BodyMeasurementsScreen | Medidas não exibidas na Home | `glpyStore.bodyMeasurements` |
| `glpy_checkin_hoje` | CheckInScreen | CheckInScreen | Check-in duplicado ou perdido | `glpyStore.checkin` |

---

## 4. Sincronizações Críticas

### 4.1 Home ↔ Refeições / Macros
`HomePremiumV2` lê `glpy_refeicoes_hoje` via `useNutritionConsumed`.
Qualquer escrita em `glpy_refeicoes_hoje` **deve** disparar `local-storage-change`.
O hook filtra por `date` → `createdAt` → `savedAt` → fallback hoje.

### 4.2 Home ↔ Água
`HomePremiumV2` lê `glpy_agua_hoje` e recalcula ao receber `local-storage-change`.
`WaterScreen` escreve e dispara o evento.

### 4.3 Home ↔ Peso / Meta / IMC
`useCurrentWeight` e `useNutritionTargets` leem `glpy_onboarding`, `glpy_peso_atual` e derivados.
A Home recalcula metas a cada `renderTick` (evento `local-storage-change`).

### 4.4 Home ↔ Protocolo Ativo
`useActiveProtocol` lê `glpy_active_protocol` (fallback `glpy_protocolo_ativo`).
Alteração no protocolo deve ser refletida imediatamente na Home.

### 4.5 Protocolo Ativo ↔ GLPY IA
`ChatIA` constrói o contexto lendo `glpy_protocolo_ativo` + onboarding + registros do dia.
**Não alterar a leitura do protocolo no ChatIA** sem garantir compatibilidade total.

### 4.6 ChatIA ↔ Perfil + Jornada + Registros do Dia
A IA lê: onboarding, peso atual, protocolo, refeições, água, emoção, atividade, check-in.
Qualquer dado que falte aparece como contexto vazio na IA — degrada a resposta sem erro aparente.

### 4.7 Perfil ↔ BottomNav / HubScreen
`BottomNav` e `HubScreen` leem `glpy_profile_photo` via `readGlpyProfilePhoto`.
Após upload, `local-storage-change` atualiza todos via estado reativo.

### 4.8 Paywall ↔ AI Usage
`ChatIA` verifica `glpy_ai_usage.used >= glpy_ai_usage.limit` antes de permitir uso.
`Paywall` pode alterar `limit`. Nunca zerar `used` sem log.

### 4.9 Loja / Células Futuras ↔ Plano / Assinatura / Perfil
Ainda não implementadas no MVP. Dependerão de `glpy_user` (plano Kiwify) + `glpy_ai_usage`.
Não implementar junto com migrações de dados.

---

## 5. Regra Para Migração Tela por Tela

Cada BUG de migração (16B, 16C…) deve obrigatoriamente:

1. **Manter a mesma chave** localStorage — nunca renomear sem adapter.
2. **Manter o mesmo formato ou compatibilidade total** com dados já salvos.
3. **Manter `local-storage-change`** disparando após toda escrita.
4. **Não alterar visual** — zero mudança de layout, cores ou componentes.
5. **Não alterar comportamento** — mesma UX de antes da migração.
6. **Testar reload** — dados devem persistir após F5 / hard reload.
7. **Testar troca de tela** — dados devem sobreviver à navegação entre telas.
8. **Testar no iPhone** — via `vercel dev` ou deploy Vercel.
9. **Testar dados antigos** — simular localStorage com formato legado e confirmar compatibilidade.
10. **Build deve passar** sem erros TypeScript.

---

## 6. Ordem Segura de Migração

| BUG | Escopo | Risco | Dependências |
|---|---|---|---|
| **16B** | Perfil + Foto + BottomNav | Baixo | Nenhuma tela crítica |
| **16C** | Home — somente leitura via glpyStore | Médio | glpyStore.profile, .meals, .water, .protocol |
| **16D** | Refeições — leitura/escrita via glpyStore | Médio | glpyStore.meals, useNutritionConsumed |
| **16E** | Água, Emoção, Atividade, Check-in | Baixo | glpyStore.water, .emotion, .activity, .checkin |
| **16F** | Protocolo ativo | Alto | useActiveProtocol, ChatIA — validar com cuidado |
| **16G** | ChatIA contexto (sem alterar prompt/IA) | Alto | Todos os namespaces — migrar só leitura de contexto |
| **16H** | Paywall / AI usage | Alto | glpyStore.aiUsage, Kiwify webhook |
| **16I** | Feature flags: Loja / Células / Comunidade | Baixo | Novas features, não afeta existentes |

**Regra:** não avançar para o próximo BUG sem aprovar o anterior no iPhone.

---

## 7. Áreas Protegidas

As seguintes áreas estão funcionando corretamente e **não devem ser refatoradas** durante as migrações de dados:

| Área | Motivo | Instrução |
|---|---|---|
| **GLPY IA + Protocolos** | Fluxo validado; prompt e contexto funcionando | Não alterar ChatIA, nem `glpy_ai_usage`, nem prompt até BUG 16G, e mesmo assim apenas leitura |
| **Foto do Prato (Gemini + FatSecret + DeepSeek)** | Motor de análise validado no iPhone | Não tocar em `geminiFoodVision`, `fatsecretClient`, `deepseekFoodAnalysis` |
| **Home macros** | `useNutritionConsumed` + filtro de data funcionando | Migrar apenas leitura; nunca alterar cálculo ou filtro de data |
| **Paywall e Checkout** | Integração Kiwify ativa | Não alterar `kiwify-webhook`, nem fluxo de aquisição, nem `glpy_ai_usage.limit` |
| **Auth Firebase** | Necessária para acesso premium | Não alterar `firestore.ts`, nem fluxo de login/logout |
| **Streak (check-in)** | `glpy_checkin_historico` é fonte de verdade | Nunca sobrescrever o array; apenas append |

---

## 8. Checklist Obrigatório — Antes de Aprovar Qualquer BUG de Migração

```
[ ] build passou (npm run build sem erros TypeScript)
[ ] tela abre corretamente
[ ] reload mantém dados (localStorage persistido)
[ ] troca de tela mantém dados (não perde estado)
[ ] local-storage-change continua sendo disparado após escrita
[ ] dados antigos continuam compatíveis (testar com formato legado)
[ ] iPhone validado (vercel dev ou deploy)
[ ] nenhuma tela crítica quebrou (Home, ChatIA, Protocolo)
[ ] macros da Home continuam corretos
[ ] streak continua correta
[ ] foto de perfil continua aparecendo
[ ] IA responde com contexto correto
```

---

## 9. Referências

| Documento | Conteúdo |
|---|---|
| `docs/glpy-core-system-v1.md` | Autoridade máxima do projeto: regras de UX, arquitetura |
| `docs/glpy-screen-map-v1.md` | Arquitetura de telas e fluxos de navegação |
| `docs/glpy-design-system-v1.md` | Tokens visuais, design system |
| `docs/glpy-estrategia-migracao-firebase.md` | Estratégia futura de migração para Firebase |
| `src/data/types.ts` | Tipos canônicos do domínio (BUG 16A) |
| `src/data/localStorageAdapter.ts` | Adaptador seguro de localStorage (BUG 16A) |
| `src/data/glpyStore.ts` | Store canônico (BUG 16A) |
| `src/hooks/useNutritionConsumed.ts` | Leitura reativa de refeições do dia |
