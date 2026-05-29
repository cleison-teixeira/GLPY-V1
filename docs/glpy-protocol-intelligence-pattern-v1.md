# GLPY — Padrão de Inteligência dos Protocolos V1

**Versão:** 1.0  
**Data:** 2026-05-29  
**Protocolo piloto:** Anti-Rebote  
**Status:** Validado no Anti-Rebote — pendente replicação para os 9 protocolos via ProtocoloBase

---

## 1. Problema original

Antes das correções das Sprints 17B.25, 17B.25.1 e 17B.25.2, existiam três falhas de contexto na GLPY IA:

**Bug 1 — IA lia o próximo dia bloqueado como dia atual**  
Ao navegar para o Dia 2 (bloqueado) após concluir o Dia 1, o `useEffect` sobrescrevia `glpy_protocol_day_today` com os dados do Dia 2. A IA passava a responder como se o Dia 2 fosse o dia ativo, ignorando que o Dia 1 havia sido concluído.

**Bug 2 — IA não sabia responder sobre missões de amanhã**  
Quando o usuário perguntava "quais missões tenho para amanhã?", a IA não tinha acesso às missões do próximo dia. Repetia as missões do dia concluído ou não respondia com precisão.

**Bug 3 — IA não recuperava o check-in específico do protocolo**  
O check-in do protocolo era salvo apenas em `glpy_protocol_day_today.selectedCheckins`. No dia seguinte, `protoDayIsToday = false` tornava essa informação invisível para a IA. Perguntas como "qual foi meu check-in de ontem no protocolo?" retornavam dados incorretos ou pendente.

**Pendências ainda abertas (não corrigidas nesta série):**  
- Metas de kcal, proteína, gordura e água divergem entre Home, Protocolo e IA — será unificado na Sprint 17B.26.  
- Os outros 9 protocolos ainda não receberam a lógica validada — ficam para sprint futura após validação completa do Anti-Rebote.

---

## 2. Padrão validado no Anti-Rebote

O Anti-Rebote utiliza três chaves de localStorage com papéis distintos e não sobreponíveis:

### `glpy_protocol_day_today`

**Função:** preservar o dia ativo real do usuário.

Mesmo que o próximo dia esteja visível ou bloqueado na barra de progresso, essa chave deve continuar representando o dia que foi concluído hoje (ou que está em andamento hoje). Nunca deve ser sobrescrita com dados do próximo dia bloqueado.

**Escrita:** `persistProtocolDay()` — chamado em `toggleMissao`, `handleSelectCheckin` e `handleConcluir`.  
**Proteção:** o `useEffect([diaAtual])` tem guard `if (jaConcluidoHoje && !concluido) return` que impede sobrescrita ao navegar para dias bloqueados.

---

### `glpy_protocol_next_day`

**Função:** guardar o próximo dia e suas missões reais para a IA responder perguntas sobre amanhã.

Essa chave é a única fonte autorizada de dados do próximo dia. Não interfere com `glpy_protocol_day_today`.

**Escrita:** `handleConcluir()` — escrita única no momento da conclusão, com missões já formatadas (placeholders `{proteina}` e `{agua}` resolvidos com valores reais do usuário).

**Formato:**
```json
{
  "protocolId": "antiRebote",
  "day": 2,
  "missions": [
    "Comer a cada 3–4 horas",
    "Lanche proteico entre almoço e jantar",
    "Beber 2625 ml de água"
  ]
}
```

---

### `glpy_protocol_checkin_last`

**Função:** guardar o último check-in específico do protocolo com protocolo, dia, data e resposta marcada.

Escrita uma única vez em `handleConcluir`. Nunca sobrescrita pelo `useEffect`. Persiste entre sessões e dias, permitindo que a IA responda tanto sobre "hoje" quanto sobre "ontem".

**Formato:**
```json
{
  "protocolId": "antiRebote",
  "protocolName": "Anti-Rebote",
  "day": 1,
  "date": "2026-05-29",
  "checkin": "Senti vontade de doce fora de hora"
}
```

Se o usuário concluiu o dia sem selecionar check-in: `"checkin": null`.

---

## 3. Regras do dia atual

Se o usuário concluiu o Dia 1 hoje:

| Campo | Valor |
|---|---|
| Dia atual real | Dia 1 |
| Status | concluído hoje |
| Missões concluídas | 3/3 (ou N/N) |
| Missões restantes hoje | 0 |
| Próximo dia | Dia 2 |
| Status do próximo dia | bloqueado até amanhã |

**A IA deve responder corretamente:**

| Pergunta | Resposta esperada |
|---|---|
| "O que falta hoje?" | Nada. Você concluiu as 3 missões do Dia 1 hoje. O Dia 2 será liberado amanhã. |
| "Quais missões completei hoje?" | Listar ou confirmar as missões do Dia 1 como concluídas. |
| "Quais missões tenho amanhã?" | Listar as missões reais do Dia 2. |
| "Qual foi meu check-in hoje/ontem?" | Informar a opção selecionada no protocolo, com dia e data. |

---

## 4. Regras do próximo dia

O próximo dia nunca deve sobrescrever o dia atual antes de ser liberado.

**Errado:**
```
Salvar dados do Dia 2 dentro de glpy_protocol_day_today antes da liberação.
```

**Correto:**
```
Salvar dados do Dia 2 dentro de glpy_protocol_next_day.
glpy_protocol_day_today continua representando o Dia 1 concluído.
```

O `useEffect([diaAtual])` que escreve em `glpy_protocol_day_today` possui guard obrigatório:
```typescript
if (jaConcluidoHoje && !concluido) return;
```
Essa guard impede que a navegação para o próximo dia bloqueado cause sobrescrita.

---

## 5. Regras do check-in do protocolo

O check-in do protocolo não é o mesmo que o check-in geral do app (check-in diário de bem-estar da Home).

| Aspecto | Check-in geral | Check-in do protocolo |
|---|---|---|
| Onde aparece | Tela de Check-in da Home | Dentro do protocolo (aba Protocolo, seção do dia) |
| O que registra | Humor, sentimento do dia | Reação específica às missões daquele dia |
| Chave localStorage | `glpy_checkin_*` | `glpy_protocol_checkin_last` |
| Acesso histórico pela IA | Sim (glpyStore.checkin) | Sim (chave dedicada persistente) |

**A IA deve conseguir responder:**
- Qual foi meu check-in hoje dentro do protocolo?
- Qual foi meu check-in de ontem dentro do protocolo?
- O que registrei no Dia 1 do Anti-Rebote?

---

## 6. Arquivos envolvidos no Anti-Rebote

### `src/components/AntiRebote.tsx`

Responsabilidades:
- Salva progresso do protocolo em Firestore e localStorage (`glpy_protocolo_antiRebote_progresso`)
- Mantém `glpy_protocol_day_today` atualizado via `persistProtocolDay()` com guard de proteção
- Ao concluir um dia (`handleConcluir`), escreve:
  - `glpy_protocol_day_today` com `dayStatus: "concluido"`
  - `glpy_protocol_checkin_last` com o check-in selecionado
  - `glpy_protocol_next_day` com missões do próximo dia formatadas
- Controla trava de 1 dia por vez via `jaConcluidoHoje = dataUltimoCheck === hoje`

### `src/data/glpyUserSnapshot.ts`

Responsabilidades:
- Lê todas as chaves de contexto do protocolo
- Monta o snapshot estruturado com `buildTodaySnapshot()`
- Gera o contexto textual para a IA com `buildAIContextFromSnapshot()`
- Diferencia `protocolDayCompleted` (dia concluído hoje) vs dia em andamento
- Lê `glpy_protocol_next_day` para incluir missões de amanhã no contexto
- Lê `glpy_protocol_checkin_last` como fonte primária do check-in do protocolo (válida entre dias)

---

## 7. Replicação futura para os outros 9 protocolos

Os outros 9 protocolos passam todos por `src/components/ProtocoloBase.tsx`. A replicação deve aguardar validação completa do Anti-Rebote.

**Pré-requisitos antes de replicar:**
1. Validar Anti-Rebote 100% (todos os 7 dias, IA estável, check-in correto)
2. Unificar metas (Sprint 17B.26) — Home, Protocolo e IA devem usar a mesma fonte
3. Testar os 7 dias do Anti-Rebote em produção
4. Só então aplicar em ProtocoloBase

**Ao replicar para ProtocoloBase, ele deve suportar:**
- Dia atual real (sem sobrescrita pelo próximo dia bloqueado)
- `glpy_protocol_next_day` com missões do próximo dia
- `glpy_protocol_checkin_last` com check-in por protocolo e dia
- Trava de 1 dia por vez (`jaConcluidoHoje` equivalente)
- Contexto correto para a IA via `glpyUserSnapshot`
- Progressão segura de Dia 1 ao Dia N
- Compatibilidade com todos os 10 protocolos sem colisão de chaves

**Atenção às chaves:** `glpy_protocol_next_day` e `glpy_protocol_checkin_last` devem incluir `protocolId` no payload para que o snapshot valide se os dados pertencem ao protocolo ativo. O snapshot já implementa essa validação:
```typescript
const lastCheckinValid = lastCheckinRaw?.protocolId === snap.protocolId;
```

---

## 8. Checklist de QA por protocolo

Para cada protocolo (Anti-Rebote + 9 via ProtocoloBase), testar:

**Fluxo básico**
- [ ] Iniciar protocolo
- [ ] Abrir Dia 1
- [ ] Marcar missões parcialmente
- [ ] Marcar check-in do dia
- [ ] Concluir Dia 1

**Contexto da IA — mesmo dia**
- [ ] IA reconhece missões concluídas hoje
- [ ] IA reconhece check-in do protocolo (com opção selecionada)
- [ ] IA reconhece o próximo dia e suas missões
- [ ] IA não trata amanhã como pendência de hoje

**Trava e progressão**
- [ ] Dia 2 fica bloqueado até amanhã
- [ ] Navegar para Dia 2 não sobrescreve contexto do Dia 1 concluído
- [ ] No dia seguinte, Dia 2 libera corretamente
- [ ] IA reconhece check-in do dia anterior ao perguntar "ontem"

**Conteúdo do protocolo**
- [ ] Vídeo abre (overlay aparece, play funciona)
- [ ] Receita do dia aparece
- [ ] Metas aparecem (kcal, proteína, gordura, água)

**Não regressão**
- [ ] Home não quebra
- [ ] GLPY IA responde normalmente em outros contextos
- [ ] Outros protocolos não são afetados

---

## 9. Pendências futuras

| Sprint | Objetivo |
|---|---|
| **Sprint 17B.26** | Unificar metas Home + Protocolo + IA via `calculateGLPYDailyTargets()` com fallbacks corretos (age, activityLevel, gender) |
| **Sprint futura** | Aplicar padrão de inteligência no `ProtocoloBase.tsx` (após Anti-Rebote validado) |
| **Sprint futura** | QA completo: 10 protocolos × 7 dias |
| **Sprint futura** | Thumbnail real dos vídeos via Bunny CDN (substituir overlay provisório) |
| **Sprint futura** | Trava global de 1 protocolo ativo por vez (`glpyStore.protocol.getActive()`) |

---

## 10. Regras de segurança para replicação

Não replicar para os 9 protocolos antes de validar todos os itens abaixo:

- [ ] Anti-Rebote completo e estável em produção
- [ ] Metas unificadas (Sprint 17B.26 concluída)
- [ ] IA estável — contexto de dia atual, amanhã e check-in funcionando
- [ ] Comportamento de check-in validado nos 7 dias do Anti-Rebote
- [ ] Progressão diária validada (trava + liberação no dia seguinte)
- [ ] Testes manuais em iPhone antes de cada merge para ProtocoloBase

Aplicar a lógica em ProtocoloBase sem esses pré-requisitos pode introduzir bugs silenciosos em todos os 9 protocolos simultaneamente.
