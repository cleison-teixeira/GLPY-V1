# GLPY — Padrão de Inteligência dos Protocolos V2

**Versão:** 2.0  
**Data:** 2026-05-29  
**Sprint de origem:** 17B.28  
**Status:** Validado no Anti-Rebote (piloto) e replicado para os 9 protocolos via ProtocoloBase  
**Substitui:** `docs/glpy-protocol-intelligence-pattern-v1.md`

---

## 1. Escopo desta versão

A V1 documentou o padrão validado no Anti-Rebote (piloto).  
A V2 registra a replicação desse padrão para os outros 9 protocolos, todos servidos por `ProtocoloBase.tsx`.

**Protocolos cobertos por ProtocoloBase (9):**
| Componente | storageKey | protocoloId |
|---|---|---|
| Protocolo1.tsx | glpy_sobrevivendo | sobrevivendoCanetas |
| Protocolo2.tsx | glpy_efeitos | efeitosColaterais |
| Protocolo3.tsx | glpy_cabelo | antiQuedaCabelo |
| Protocolo5.tsx | glpy_psicologia | psicologiaEmagrecimento |
| Protocolo6.tsx | glpy_baixoapetite | alimentacaoBaixoApetite |
| Protocolo7.tsx | glpy_musculos | naoPerdaMusculos |
| Protocolo8.tsx | glpy_energia | energiaBaixa |
| Protocolo9.tsx | glpy_metabolico | ajusteMetabolico |
| Protocolo10.tsx | glpy_transicao | transicaoParar |

**Protocolo piloto (AntiRebote.tsx):** mantém sua própria implementação independente. Não foi alterado na Sprint 17B.28.

---

## 2. Arquitetura de chaves — sistema oficial

O sistema usa quatro chaves de localStorage com papéis distintos e não sobreponíveis:

### `glpy_protocol_context_v1`

**Função:** pacote estruturado com janela de 3 dias (anterior/atual/próximo) para contexto completo da IA.

**Escrita:** `useEffect` reativo em `ProtocoloBase` e `AntiRebote`, disparado sempre que missões, check-in, dia atual ou `dataUltimoCheck` mudam.

**Validação no snapshot:** `ctxV1.protocolId === snap.protocolId` — a IA só lê o contexto do protocolo ativo.

**Formato oficial:**
```json
{
  "protocolId": "efeitosColaterais",
  "protocolName": "Controle de Efeitos Colaterais",
  "previousDay": {
    "protocolId": "efeitosColaterais",
    "protocolName": "Controle de Efeitos Colaterais",
    "day": 1,
    "totalDays": 7,
    "title": "Efeitos colaterais são temporários. O resultado é permanente.",
    "status": "concluido",
    "missions": [
      { "title": "Mapear seus sintomas de hoje (náusea, constipação, fadiga)", "description": "Conhecimento do padrão permite intervenção precoce", "completed": true },
      { "title": "Ter gengibre fresco em casa", "description": "O antiemético natural mais eficaz disponível", "completed": true },
      { "title": "Hidratação mínima: 2100ml hoje", "description": "Vômitos causam desidratação que piora TODOS os sintomas", "completed": true }
    ],
    "checkinsAvailable": ["Só náusea leve", "Constipação incomodando", "Fadiga intensa hoje", "Múltiplos sintomas juntos"],
    "selectedCheckin": "Só náusea leve",
    "recipe": { "title": "Limonada com Gengibre e Hortelã", "kcal": 95, "protein": 3, "carbs": 18, "fat": 2 }
  },
  "currentDay": { "...mesmo formato..." },
  "nextDay": { "...mesmo formato..." },
  "updatedAt": "2026-05-29T14:30:00.000Z"
}
```

**Valores possíveis para `status`:**
- `"concluido"` — dia já foi concluído (0-indexed idx está em `diasConcluidos`)
- `"em_andamento"` — dia atual ainda não concluído hoje
- `"bloqueado"` — dia posterior ao atual, aguarda liberação
- `"pendente"` — dia anterior ao atual, nunca concluído

---

### `glpy_protocol_day_today`

**Função:** preservar o dia ativo real para o sistema legado de tracking. Nunca sobrescrito com dados do próximo dia bloqueado.

**Escrita:** `persistProtocolDay()` → `saveProtocolDayTracking()`, chamado em `toggleMissao`, `handleSelectCheckin` e `handleConcluir`.

**Proteção:** `useEffect([diaAtual, receita?.id])` tem guard obrigatório `if (jaConcluidoHoje && !concluido) return` que impede sobrescrita ao navegar para dias bloqueados.

---

### `glpy_protocol_next_day`

**Função:** guardar o próximo dia e suas missões reais para a IA responder "quais missões tenho amanhã?".

**Escrita:** `handleConcluir()` — escrita única no momento da conclusão, com missões já formatadas (placeholders `{proteina}` e `{agua}` resolvidos com valores reais do usuário).

**Validação no snapshot:** `nextDayInfo?.protocolId === snap.protocolId` — não mistura dados entre protocolos.

**Formato:**
```json
{
  "protocolId": "efeitosColaterais",
  "day": 2,
  "missions": [
    "Refeições frias ou temperatura ambiente — sem exceção",
    "Comer em ambiente sem cheiros fortes",
    "30 min de repouso sentado após cada refeição"
  ]
}
```

---

### `glpy_protocol_checkin_last`

**Função:** guardar o último check-in específico do protocolo com protocolo, dia, data e opção marcada. Persiste entre sessões e dias, permitindo responder tanto "hoje" quanto "ontem".

**Escrita:** `handleConcluir()` — escrita única. Nunca sobrescrita pelo `useEffect`.

**Validação no snapshot:** `lastCheckinRaw?.protocolId === snap.protocolId`.

**Formato:**
```json
{
  "protocolId": "efeitosColaterais",
  "protocolName": "Controle de Efeitos Colaterais",
  "day": 1,
  "date": "2026-05-29",
  "checkin": "Só náusea leve"
}
```

Se o usuário concluiu sem selecionar check-in: `"checkin": null`.

---

## 3. Indexação 0-based em ProtocoloBase

**Diferença crítica entre AntiRebote e ProtocoloBase:**

| Aspecto | AntiRebote | ProtocoloBase |
|---|---|---|
| `diasConcluidos` armazena | `dia.n` (1–7) | `diaAtual` (0–6) |
| Check em `buildProtocolDayPackage` | `diasConcluidos.includes(d.n)` | `diasConcluidos.includes(dayIdx)` |

`buildProtocolDayPackage(dayIdx)` em ProtocoloBase usa `diasConcluidos.includes(dayIdx)` (0-indexed).

---

## 4. Trava diária (`jaConcluidoHoje`)

A trava impede que o usuário conclua o mesmo dia mais de uma vez no mesmo dia calendário.

```typescript
const jaConcluidoHoje = dataUltimoCheck === getLocalDateKey();
const diaJaFeito = diasConcluidos.includes(diaAtual);
```

**Guard em `handleConcluir`:**
```typescript
if (jaConcluidoHoje || diaJaFeito) return;
```

**Guard no `useEffect` de `persistProtocolDay`:**
```typescript
if (jaConcluidoHoje && !concluido) return;
```
Este guard impede que navegar para o próximo dia bloqueado sobrescreva `glpy_protocol_day_today` com dados do dia seguinte.

**`dataUltimoCheck` é inicializado do localStorage:**
```typescript
const [dataUltimoCheck, setDataUltimoCheck] = useState<string | null>(() => {
  try {
    const raw = localStorage.getItem(progressoKey);
    return raw ? (JSON.parse(raw).dataUltimoCheck || null) : null;
  } catch { return null; }
});
```
E persiste em `progressoKey` no `localStorage` via `handleConcluir`.

---

## 5. Regras da IA para não inventar dados

O `buildAIContextFromSnapshot()` em `glpyUserSnapshot.ts` injeta no contexto da IA:

```
=== CONTEXTO ESTRUTURADO DO PROTOCOLO ===
Protocolo: Controle de Efeitos Colaterais (efeitosColaterais) — 7 dias total
Atualizado em: 2026-05-29T...

[DIA ANTERIOR — Dia 1: "Efeitos colaterais são temporários. O resultado é permanente."]
Status: concluído
Missões:
  [x] Mapear seus sintomas de hoje (náusea, constipação, fadiga) — Conhecimento...
  [x] Ter gengibre fresco em casa — O antiemético natural...
  [x] Hidratação mínima: 2100ml hoje — Vômitos causam desidratação...
Check-ins disponíveis: "Só náusea leve", "Constipação incomodando", ...
Check-in selecionado: "Só náusea leve"
Receita do dia: Limonada com Gengibre e Hortelã (95 kcal, 3g prot, 18g carbs, 2g gord)

[DIA ATUAL — Dia 2: "Dominando a náusea — o protocolo de 24 horas"]
...

[PRÓXIMO DIA — Dia 3: "Constipação: o efeito colateral que ninguém comenta"]
...

INSTRUÇÃO: Use este contexto estruturado para responder qualquer pergunta sobre os dias do protocolo.
Os títulos, missões, check-ins e receitas são os dados REAIS do protocolo. Não invente alternativas.
```

**Garantias do sistema:**
- `ctxV1.protocolId === snap.protocolId` → IA só lê contexto do protocolo ativo
- Títulos dos dias vêm de `d.titulo` (dado real do arquivo de protocolo)
- Receitas vêm de `receitas.find(rec => rec.id === d.receita_id)` (dado real)
- Check-ins disponíveis vêm de `d.checkin` (dado real)
- Missões têm `{proteina}` e `{agua}` resolvidos com valores reais do usuário

---

## 6. Check-in do protocolo vs. check-in geral da Home

| Aspecto | Check-in geral | Check-in do protocolo |
|---|---|---|
| Onde aparece | Tela CheckIn da Home | Dentro do protocolo (seção do dia) |
| O que registra | Humor, sentimento do dia | Reação específica às missões daquele dia |
| Chave localStorage | `glpy_checkin_*` | `glpy_protocol_checkin_last` |
| Acesso pela IA | `glpyStore.checkin` | Chave dedicada persistente |
| Fonte no snapshot | `snap.checkin` | `lastCheckinRaw` com validação de `protocolId` |

---

## 7. Arquivos envolvidos

### `src/components/AntiRebote.tsx`
- Protocolo piloto — implementação independente validada nas Sprints 17B.24–17B.27
- **Não alterado na Sprint 17B.28**

### `src/components/ProtocoloBase.tsx`
- Sprint 17B.28: replicação completa do padrão de inteligência do Anti-Rebote
- Adicionados: `dataUltimoCheck` state, `formatMissao` (movido para antes do early return), `buildProtocolDayPackage`, context save `useEffect` para `glpy_protocol_context_v1`, `jaConcluidoHoje`/`diaJaFeito`, guard em `persistProtocolDay` useEffect, escritas de `glpy_protocol_checkin_last` e `glpy_protocol_next_day` em `handleConcluir`

### `src/data/glpyUserSnapshot.ts`
- **Não alterado na Sprint 17B.28**
- Lê todas as 4 chaves genericamente com validação de `protocolId`
- `glpy_protocol_context_v1` → seção `=== CONTEXTO ESTRUTURADO DO PROTOCOLO ===`
- `glpy_protocol_next_day` → seção de missões de amanhã
- `glpy_protocol_checkin_last` → seção de check-in histórico do protocolo

---

## 8. Posters dos protocolos

Cada protocolo tem uma imagem de capa real usada como poster do vídeo:

| protocoloId | Arquivo |
|---|---|
| sobrevivendoCanetas | `/protocol-posters/sobrevivendo-canetas.png` |
| efeitosColaterais | `/protocol-posters/controle-efeitos-colaterais.png` |
| antiQuedaCabelo | `/protocol-posters/anti-queda-cabelo.png` |
| psicologiaEmagrecimento | `/protocol-posters/psicologia-emagrecimento.png` |
| alimentacaoBaixoApetite | `/protocol-posters/alimentacao-baixo-apetite.png` |
| naoPerdaMusculos | `/protocol-posters/nao-perca-musculo.png` |
| energiaBaixa | `/protocol-posters/energia-baixa.png` |
| ajusteMetabolico | `/protocol-posters/ajuste-metabolico.png` |
| transicaoParar | `/protocol-posters/transicao-caneta.png` |
| antiRebote (fallback) | `/protocol-posters/anti-rebote.png` |

Overlay do vídeo (ProtocoloBase):
```javascript
background: `linear-gradient(rgba(10,22,40,0.60) 0%, rgba(10,22,40,0.72) 100%), url('${posterUrl}')`,
backgroundSize: 'cover',
backgroundPosition: 'center',
```

---

## 9. Checklist de QA por protocolo

Para cada protocolo (Anti-Rebote + 9 via ProtocoloBase):

**Fluxo básico**
- [ ] Abrir Dia 1 do protocolo
- [ ] Marcar missões parcialmente
- [ ] Marcar check-in do dia
- [ ] Concluir Dia 1

**Contexto da IA — mesmo dia**
- [ ] IA reconhece o título real do dia (não inventa)
- [ ] IA reconhece missões concluídas e pendentes
- [ ] IA reconhece check-in selecionado (com opção real do protocolo)
- [ ] IA reconhece receita real do dia (título + macros)
- [ ] IA reconhece o próximo dia e suas missões reais
- [ ] IA não trata amanhã como pendência de hoje
- [ ] IA não puxa dados de outro protocolo

**Trava e progressão**
- [ ] Dia 2 fica bloqueado até amanhã após conclusão do Dia 1
- [ ] Navegar para Dia 2 não sobrescreve contexto do Dia 1 concluído
- [ ] No dia seguinte, Dia 2 libera corretamente
- [ ] IA reconhece check-in do dia anterior ao perguntar "ontem"
- [ ] Tentar concluir Dia 1 novamente no mesmo dia não funciona

**Conteúdo do protocolo**
- [ ] Poster aparece no overlay do vídeo
- [ ] Vídeo abre (overlay aparece, play funciona)
- [ ] Receita do dia aparece corretamente
- [ ] Metas aparecem (kcal, proteína, gordura, água)

**Não regressão**
- [ ] Home não quebra
- [ ] GLPY IA responde normalmente em outros contextos
- [ ] Outros protocolos não são afetados

---

## 10. Pendências futuras

| Sprint | Objetivo |
|---|---|
| **Sprint futura** | QA completo: 10 protocolos × 7 dias (350 fluxos) |
| **Sprint futura** | Trava global de 1 protocolo ativo por vez (`glpyStore.protocol.getActive()` como fonte única) |
| **Sprint 17B.28-B** | Unificar `calcMetas()` em ProtocoloBase com `useNutritionTargets()` — mesmos fallbacks canônicos que AntiRebote após Sprint 17B.26-B |
| **Sprint futura** | Migração de `glpy_protocol_*` para `glpyStore` com persistência Firebase — eliminar localStorage como fonte primária |
| **Sprint futura** | Integração com Black Box / event log — cada conclusão de dia emite evento estruturado para analytics |
| **Sprint futura** | Thumbnail real dos vídeos via Bunny CDN (substituir overlay provisório) |

---

## 11. Regras de segurança para modificações futuras

**Nunca fazer:**
- Sobrescrever `glpy_protocol_day_today` com dados do próximo dia bloqueado
- Remover a guard `if (jaConcluidoHoje && !concluido) return` do `useEffect` de `persistProtocolDay`
- Remover a guard `if (jaConcluidoHoje || diaJaFeito) return` do `handleConcluir`
- Omitir `protocolId` nos payloads de `glpy_protocol_checkin_last` e `glpy_protocol_next_day`
- Usar `diasConcluidos.includes(d.n)` em ProtocoloBase (indexação errada — deve ser `diasConcluidos.includes(dayIdx)`)

**Sempre fazer ao adicionar novo protocolo:**
- Adicionar entrada em `STORAGE_KEY_TO_ID` com `storageKey → protocoloId`
- Adicionar entrada em `PROTOCOL_POSTERS` com `protocoloId → caminho do poster`
- Verificar que `Dia.titulo`, `Dia.missoes`, `Dia.checkin`, `Dia.receita_id` estão preenchidos
- Testar QA checklist acima antes de merge

---

*Documento gerado pela Sprint 17B.28 — GLPY-V1*
