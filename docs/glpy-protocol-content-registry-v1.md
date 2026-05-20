# GLPY Protocol Content Registry — v1

**Arquivo:** `src/data/glpyProtocolsCatalog.ts`  
**Autoridade:** Este documento descreve o contrato de dados do registry. O arquivo TypeScript é a fonte de verdade.

---

## Propósito

Centralizar toda a metadata dos 10 protocolos GLPY em um único lugar imutável. Qualquer componente que precise de cor, ID, rota de preview, storageKey ou firestoreId de um protocolo deve ler daqui — não hardcodar.

---

## IDs Imutáveis (legacyId)

Os `legacyId` abaixo jamais podem ser renomeados após o deploy. Eles são a chave primária usada em localStorage (`glpy_protocolo_ativo`), Firestore, e toda a lógica de navegação.

| # | legacyId                  | slug                       |
|---|---------------------------|----------------------------|
| 1 | sobrevivendoCanetas       | sobrevivendo-canetas       |
| 2 | efeitosColaterais         | efeitos-colaterais         |
| 3 | antiQuedaCabelo           | anti-queda-cabelo          |
| 4 | antiRebote                | anti-rebote                |
| 5 | psicologiaEmagrecimento   | psicologia-emagrecimento   |
| 6 | alimentacaoBaixoApetite   | alimentacao-baixo-apetite  |
| 7 | naoPerdaMusculos          | nao-perca-musculo          |
| 8 | energiaBaixa              | energia-baixa              |
| 9 | ajusteMetabolico          | ajuste-metabolico          |
|10 | transicaoParar            | transicao-parar-caneta     |

---

## Metadata Completa por Protocolo

### 1 · Sobrevivendo às Canetas
- **legacyId:** `sobrevivendoCanetas`
- **storagePrefix:** `glpy_sobrevivendo`
- **firestoreId:** `protocolo-1`
- **previewRoute:** `/preview/protocolo1`
- **renderer:** `ProtocoloBase` → `Protocolo1.tsx`
- **color:** `#7660FF` / `#F0EEFF`
- **minimumPlan:** `starter`

### 2 · Controle de Efeitos Colaterais
- **legacyId:** `efeitosColaterais`
- **storagePrefix:** `glpy_efeitos`
- **firestoreId:** `protocolo-2`
- **previewRoute:** `/preview/protocolo2`
- **renderer:** `ProtocoloBase` → `Protocolo2.tsx`
- **color:** `#3B82F6` / `#EFF6FF`
- **minimumPlan:** `starter`

### 3 · Anti-Queda de Cabelo
- **legacyId:** `antiQuedaCabelo`
- **storagePrefix:** `glpy_cabelo`
- **firestoreId:** `protocolo-3`
- **previewRoute:** `/preview/protocolo3`
- **renderer:** `ProtocoloBase` → `Protocolo3.tsx`
- **color:** `#EC4899` / `#FDF2F8`
- **minimumPlan:** `plus`

### 4 · Anti-Rebote ⚠️ Custom Renderer
- **legacyId:** `antiRebote`
- **storagePrefix:** `glpy_antirebote`
- **firestoreId:** `protocolo-anti-rebote`
- **Firestore path:** `users/{uid}/protocolos/anti-rebote`
- **previewRoute:** `/preview/protocolo4`
- **renderer:** `AntiRebote.tsx` (779 linhas, totalmente customizado — **não usa ProtocoloBase**)
- **color:** `#00C27A` / `#E6FBF3`
- **minimumPlan:** `starter`
- **usesCustomRenderer:** `true`

### 5 · Psicologia do Emagrecimento
- **legacyId:** `psicologiaEmagrecimento`
- **storagePrefix:** `glpy_psicologia`
- **firestoreId:** `protocolo-5`
- **previewRoute:** `/preview/protocolo5`
- **renderer:** `ProtocoloBase` → `Protocolo5.tsx`
- **color:** `#8B5CF6` / `#F5F3FF`
- **minimumPlan:** `plus`

### 6 · Alimentação para Baixo Apetite
- **legacyId:** `alimentacaoBaixoApetite`
- **storagePrefix:** `glpy_baixoapetite`
- **firestoreId:** `protocolo-6`
- **previewRoute:** `/preview/protocolo6`
- **renderer:** `ProtocoloBase` → `Protocolo6.tsx`
- **color:** `#10B981` / `#ECFDF5`
- **minimumPlan:** `plus`

### 7 · Não Perca Músculo
- **legacyId:** `naoPerdaMusculos`
- **storagePrefix:** `glpy_musculos`
- **firestoreId:** `protocolo-7`
- **previewRoute:** `/preview/protocolo7`
- **renderer:** `ProtocoloBase` → `Protocolo7.tsx`
- **color:** `#F5A623` / `#FFF8ED`
- **minimumPlan:** `pro`

### 8 · Energia Baixa
- **legacyId:** `energiaBaixa`
- **storagePrefix:** `glpy_energia`
- **firestoreId:** `protocolo-8`
- **previewRoute:** `/preview/protocolo8`
- **renderer:** `ProtocoloBase` → `Protocolo8.tsx`
- **color:** `#EF4444` / `#FEF2F2`
- **minimumPlan:** `pro`

### 9 · Ajuste Metabólico
- **legacyId:** `ajusteMetabolico`
- **storagePrefix:** `glpy_metabolico`
- **firestoreId:** `protocolo-9`
- **previewRoute:** `/preview/protocolo9`
- **renderer:** `ProtocoloBase` → `Protocolo9.tsx`
- **color:** `#F59E0B` / `#FFFBEB`
- **minimumPlan:** `top`

### 10 · Transição — Parar a Caneta
- **legacyId:** `transicaoParar`
- **storagePrefix:** `glpy_transicao`
- **firestoreId:** `protocolo-10`
- **previewRoute:** `/preview/protocolo10`
- **renderer:** `ProtocoloBase` → `Protocolo10.tsx`
- **color:** `#06B6D4` / `#ECFEFF`
- **minimumPlan:** `top`

---

## Tipos TypeScript

```typescript
GLPYProtocolMeta         // metadata de um protocolo (imutável)
GLPYProtocolDayContent   // conteúdo de um dia específico
GLPYProtocolMission      // missão diária
GLPYProtocolCheckin      // pergunta de check-in diário
GLPYProtocolRecipeOfDay  // receita do dia
GLPYProtocolRegistryItem // meta + days[] (item completo do registry)
```

---

## Funções de Acesso

```typescript
getProtocolByLegacyId(legacyId)       → GLPYProtocolMeta | undefined
getProtocolByNumber(n)                 → GLPYProtocolMeta | undefined
getProtocolBySlug(slug)                → GLPYProtocolMeta | undefined
getAllProtocolsForMVP()                → GLPYProtocolMeta[]
getProtocolStoragePrefix(legacyId)     → string | undefined
getProtocolPreviewRoute(legacyId)      → string | undefined
isCustomRendererProtocol(legacyId)     → boolean
getProtocolRegistryItem(legacyId)      → GLPYProtocolRegistryItem | undefined
getLegacyPlanInfo(legacyId)            → { minimumPlan, isUnlocked } | undefined
getProtocolDayContent(legacyId, day)   → GLPYProtocolDayContent | undefined  // stub v1
```

---

## Regras de Evolução

1. **`legacyId`, `storagePrefix` e `firestoreId` são imutáveis** — qualquer renomeação quebra dados em produção.
2. Para adicionar um protocolo: append apenas ao final do array `GLPY_PROTOCOLS_CATALOG`; nunca reordenar.
3. `getProtocolDayContent()` é um stub em v1. O conteúdo por dia deve ser populado por módulos separados em futuras versões (ex: `src/data/protocols/sobrevivendoCanetas.ts`).
4. `usesCustomRenderer: true` indica que o protocolo tem sua própria tela (`AntiRebote.tsx`) — não tente renderizá-lo via `ProtocoloBase`.
5. MVP: `estaDesbloqueado()` retorna `true` sempre. `getLegacyPlanInfo()` reflete `isUnlocked: true` consistentemente.

---

## Relação com Outros Sistemas

| Sistema | Integração |
|---|---|
| `ProtocolHub.tsx` | Hardcoda `PROTOCOLOS[]` — pode migrar para `getAllProtocolsForMVP()` futuramente |
| `ProtocoloBase.tsx` | Usa `STORAGE_KEY_TO_ID` interno — pode migrar para `getProtocolStoragePrefix()` |
| `main.tsx` | `PREVIEW_ROTA_MAP` — pode migrar para `getProtocolPreviewRoute()` |
| `glpyLocalIntelligence.ts` | Independente — não consome o registry diretamente |
| Firestore | `firestoreId` mapeia para `users/{uid}/protocolos/{firestoreId}` |
