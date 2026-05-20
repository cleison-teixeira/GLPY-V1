# GLPY Daily Targets Engine (v1) — Documento Clínico e de Auditoria

A **GLPY Daily Targets Engine** é a unidade de processamento responsável por estimar de forma segura as cotas calóricas diárias, a necessidade hídrica e a distribuição de macronutrientes para pacientes em acompanhamento de perda de peso, com atenção especial ao contexto de terapias hormonais coadjuvantes (ex: análogos de GLP-1).

Este documento serve como manual técnico-médico e guia de auditoria para profissionais de saúde parceiros (endocrinologistas, nutrólogos e nutricionistas) revisarem os critérios científicos aplicados pela engine.

---

## 1. Diretriz e Objetivo Clínico da Engine

Durante a terapia com análogos de GLP-1 (Ozempic, Rybelsus, Saxenda, Mounjaro, etc.), ocorre um atraso acentuado no esvaziamento gástrico e uma forte supressão do apetite e do centro da sede no hipotálamo. Isso expõe o paciente a dois riscos críticos:
1. **Desidratação Severa:** O paciente esquece de beber água, gerando riscos de constipação crônica, cefaleias e estresse renal.
2. **Perda de Massa Magra (Sarcopenia):** A ingestão calórica cai drasticamente, induzindo o corpo a catabolizar tecido muscular em vez de puramente gordura.

O objetivo da engine é calcular metas de hidratação quantitativa aumentadas e incentivar uma alta cota de proteína diária (preservação muscular), impondo um **piso protetivo calórico rígido de 1200 kcal** para mitigar esses danos.

---

## 2. Equações e Fórmulas Científicas Utilizadas

### A. Taxa Metabólica Basal (BMR) — Equação de Mifflin-St Jeor
A engine adota a fórmula de Mifflin-St Jeor devido à sua maior acurácia estatística comprovada na literatura médica para populações modernas com sobrepeso e obesidade, superando a antiga equação de Harris-Benedict.

- **Fórmula para Homens:**
  $$BMR = (10 \times \text{Peso}_{\text{kg}}) + (6.25 \times \text{Altura}_{\text{cm}}) - (5 \times \text{Idade}_{\text{anos}}) + 5$$

- **Fórmula para Mulheres:**
  $$BMR = (10 \times \text{Peso}_{\text{kg}}) + (6.25 \times \text{Altura}_{\text{cm}}) - (5 \times \text{Idade}_{\text{anos}}) - 161$$

### B. Gasto Energético Diário Total (TDEE)
O TDEE é obtido multiplicando o BMR pelo fator de atividade física correspondente aos hábitos do paciente:

| Nível de Atividade Física | Multiplicador | Descrição |
| :--- | :--- | :--- |
| **Sedentário** (`sedentary`) | `1.2` | Trabalho de escritório, pouco ou nenhum exercício. |
| **Levemente Ativo** (`lightly_active`) | `1.375` | Exercício leve/atividades diárias 1 a 3 dias/semana. |
| **Moderadamente Ativo** (`moderately_active`) | `1.55` | Exercício moderado/esportes 3 a 5 dias/semana. |
| **Muito Ativo** (`very_active`) | `1.725` | Exercício intenso/esportes 6 a 7 dias/semana. |
| **Extra Ativo** (`extra_active`) | `1.9` | Atividade física extrema diária ou trabalho físico pesado. |

$$\text{TDEE} = \text{BMR} \times \text{Multiplicador}$$

### C. Restrição Calórica (Déficit por Ritmo)
Subtrai-se o déficit calórico selecionado pelo usuário no onboarding (`weightLossPace`) para induzir a lipólise:
- **Ritmo Leve:** $-250$ kcal/dia.
- **Ritmo Equilibrado (Padrão):** $-500$ kcal/dia.
- **Ritmo Intenso:** $-750$ kcal/dia.

$$\text{Meta Calórica Bruta} = \text{TDEE} - \text{Déficit}$$

> [!CAUTION]
> **Piso Protetivo Calórico Rígido (1200 kcal):**
> Se a Meta Calórica Bruta cair abaixo de **1200 kcal**, a engine reescreve a meta reativamente para exatamente **1200 kcal** e anexa um alerta de segurança clínica (`caloriesMinWarningApplied = true`). Dietas de baixíssimo valor energético (< 1200 kcal) exigem controle médico restrito e suplementação de micronutrientes específicos.

---

### D. Distribuição de Macronutrientes (Compensação Remainder)
A engine adota um algoritmo linear de prioridade biológica:
1. **Proteínas:** Calculadas com base no peso de referência ($Peso$) multiplicado pelo fator configurado (padrão de $1.5$g por kg):
   $$\text{Proteína}_{\text{g}} = \text{Peso} \times 1.5$$
   $$\text{Calorias da Proteína} = \text{Proteína}_{\text{g}} \times 4 \text{ kcal/g}$$
2. **Gorduras:** Alocação de exatamente $25\%$ da cota calórica diária final para gorduras saudáveis (ácidos graxos essenciais):
   $$\text{Calorias da Gordura} = \text{Meta Calórica Final} \times 0.25$$
   $$\text{Gordura}_{\text{g}} = \frac{\text{Calorias da Gordura}}{9 \text{ kcal/g}}$$
3. **Carboidratos (Remainder):** Preenche toda a sobra calórica restante para suprir as necessidades de glicogênio e energia celular:
   $$\text{Calorias do Carboidrato} = \text{Meta Calórica Final} - \text{Calorias da Proteína} - \text{Calorias da Gordura}$$
   $$\text{Carboidrato}_{\text{g}} = \frac{\text{Calorias do Carboidrato}}{4 \text{ kcal/g}}$$

> [!WARNING]
> Se o carboidrato final calculado cair abaixo de **50g/dia**, a engine emite um alerta instruindo o usuário a selecionar um ritmo calórico mais leve para rebalancear a ingestão de fibras e carboidratos complexos vitais.

---

### E. Meta de Hidratação
A cota de hidratação é estimada em $35$ ml de água por kg de peso corporal, clampada estritamente entre os limites clínicos padrão:
$$\text{Meta Hídrica} = \frac{\text{Peso}_{\text{kg}} \times 35}{1000}$$
$$\text{Meta Final (L)} = \min(\max(\text{Meta Hídrica}, 2.0\text{L}), 5.0\text{L})$$

---

## 3. Disclaimers e Limitações Clínicas Importantes

> [!IMPORTANT]
> **Aviso de Isenção de Responsabilidade Médica:**
> - As metas diárias calculadas são **estimativas estatísticas** baseadas em dados médios e não configuram prescrição médica individualizada ou terapia dietoterápica substitutiva.
> - O GLPY **não substitui** a consulta ou as orientações de médicos endocrinologistas, nutrólogos ou nutricionistas parceiros.
> - **Independência de Medicação:** A engine **NÃO** calcula cotas calóricas a partir da dosagem das canetas de GLP-1 (ex: Ozempic, Saxenda). A dosagem inserida atua puramente como metadado clínico contextual para orientação comportamental e apoio da IA no chat, sem impacto matemático direto no prato de macros.

---

## 4. Como Profissionais de Saúde Podem Revisar/Editar a Engine

Todas as variáveis clínicas estão isoladas e comentadas no arquivo de configuração do projeto:
👉 [src/config/glpyTargetsConfig.ts](file:///Users/cleissonteixeira/Desktop/GLPY-V1/src/config/glpyTargetsConfig.ts)

Para alterar a conduta nutricional do aplicativo, basta que o profissional técnico edite as seguintes chaves do JSON:

```typescript
export const GLPY_TARGETS_CONFIG = {
  // Ajustar cota de proteínas por kg
  protein: {
    defaultGPerKg: 1.5, // Alterar de 1.5 para 1.8 se desejar cota proteica mais alta
    minGPerKg: 1.2,
    maxGPerKg: 2.2,
    referenceWeightMode: 'current' // 'target' se desejar calcular com base no peso alvo
  },
  // Ajustar cálculo e limites hídricos
  water: {
    mlPerKg: 35, // ml/kg de água recomendados
    minLiters: 2.0,
    maxLiters: 5.0
  },
  // Alterar piso calórico e déficits
  calories: {
    deficitByPace: {
      leve: 250,
      equilibrado: 500,
      intenso: 750
    },
    minCaloriesWarning: 1200 // Mudar o piso calórico mínimo protetivo
  }
};
```

---

## 5. Status de Revisão Profissional

> [!WARNING]
> **Esta versão (MVP 1.1.0) ainda NÃO foi revisada formalmente por profissional de saúde parceiro.**
> Os parâmetros nutricionais contidos neste documento e no arquivo de configuração (`glpyTargetsConfig.ts`) são estimativas operacionais baseadas em literatura científica publicada, adotadas para fins de desenvolvimento do MVP do GLPY.

### Regras de Compliance — Identificação de Revisores

- **Proibido** incluir nomes de profissionais, números de CRM, CRN ou qualquer identificação clínica sem autorização expressa e documentada do profissional.
- O campo `reviewedBy` no arquivo de configuração deve conter `"PENDENTE_DE_REVISAO_PROFISSIONAL"` até que uma revisão formal seja concluída.
- O campo `reviewStatus` deve refletir o estado real: `"MVP_NOT_CLINICALLY_REVIEWED"` até revisão formal.
- Após revisão, os campos só podem ser preenchidos mediante autorização escrita do profissional, confirmando que revisou os parâmetros e autoriza o uso de seu nome e registro.

### Preparação para Revisão Futura

Quando um profissional parceiro realizar a revisão formal, os campos a atualizar são:

```typescript
// Em src/config/glpyTargetsConfig.ts
reviewedBy: [
  "Nome Completo (Especialidade — CRM ou CRN/UF número)"
],
reviewStatus: "CLINICALLY_REVIEWED_V1",
complianceNote: "Revisão formal concluída em [data]. Autorização expressa obtida."
```

Os campos estão preparados na interface `GLPYTargetsConfig` para receber essa atualização sem refatoração da engine ou da UI.

---

## 6. Histórico de Versões

- **Versão 1.0.0 (2026-05-20):**
  - Implementação inicial da engine baseada em Mifflin-St Jeor.
  - Fixação do piso protetivo calórico em 1200 kcal.
  - Alocação linear de proteínas em 1.5g/kg e cap de 25% em gorduras.
  - Isolamento de parâmetros em `glpyTargetsConfig.ts` para auditoria externa.
  - Revisão clínica formal: **PENDENTE** (nenhum profissional identificado havia autorizado uso de nome/registro nesta versão).

- **Versão 1.1.0 (2026-05-20) — Fase 1C.1:**
  - Adicionada função `calculateDailyRemaining(targets, consumed)` para calcular saldo restante macro a macro.
  - Adicionada função `buildDailyTargetsForAI(targets, consumed, remaining)` para formatar payload de contexto para o Chat IA.
  - Novos tipos exportados: `GLPYDailyConsumed`, `MacroBalance`, `GLPYDailyRemaining`.
  - Lógica de excedente (`overage`) para macros consumidos acima da meta.
  - Cálculo automático de `overallCompletionPercent` como média ponderada entre os 5 eixos.
  - Geração automática de `aiOrientationNote` para injeção no prompt da IA.
  - Integração da tela de debug com `saveWaterEntry()` e `saveFoodEntry()` do Local Intelligence Store.

- **Versão 1.1.1 (2026-05-20) — Compliance MVP:**
  - Removidos nomes fictícios de profissionais do campo `reviewedBy`.
  - Adicionados campos `reviewStatus` e `complianceNote` na interface e no objeto de configuração.
  - `reviewStatus` definido como `"MVP_NOT_CLINICALLY_REVIEWED"` até revisão formal autorizada.
  - Adicionada seção "Status de Revisão Profissional" neste documento com regras de compliance.

- **Versão 1.2.0 (2026-05-20) — Fase 1D Protocol Day Tracking:**
  - A tela `/preview/daily-targets-test` passa a exibir "Execução do Protocolo Hoje" a partir da Local Intelligence Store.
  - `glpy_daily_tracking[YYYY-MM-DD].protocolDay` consolida missões concluídas/pendentes, check-in selecionado, receita do dia e status do dia.
  - Reforçada a separação entre sinal comportamental de missão e consumo nutricional real.

---

## 6. Consumo Diário e Saldo Restante (Fase 1C.1)

### Como o Consumo Diário é Calculado

O consumo diário é acumulado na tela operacional (ou via `glpyLocalIntelligence.ts`) através do objeto tipado `GLPYDailyConsumed`:

```typescript
interface GLPYDailyConsumed {
  calories: number;      // Total de kcal consumidas no dia
  proteinGrams: number;  // Total de proteína consumida (g)
  carbsGrams: number;    // Total de carboidratos consumidos (g)
  fatGrams: number;      // Total de gorduras consumidas (g)
  waterLiters: number;   // Total de água ingerida (L)
  mealCount: number;     // Número de refeições registradas
}
```

Cada refeição adicionada é somada ao acumulado. A função `saveFoodEntry()` do Local Intelligence Store persiste cada refeição em `glpy_today_food` e `glpy_daily_tracking` no `localStorage`, preservando o histórico.

---

### Como o Saldo Restante é Calculado

A função `calculateDailyRemaining(targets, consumed)` compara o consumo acumulado contra as metas calculadas e retorna um `MacroBalance` por eixo:

```typescript
interface MacroBalance {
  remaining: number;   // Quanto ainda falta para atingir a meta (0 se já atingiu)
  overage: number;     // Quanto excedeu a meta (>0 quando passou da meta)
  completed: boolean;  // true quando a meta foi atingida ou ultrapassada
}
```

**Exemplo prático:**
- Meta de proteína: `120g` | Consumido: `128g`
  - `remaining = 0`, `overage = 8`, `completed = true` → exibe: *Meta concluída (+8g acima)*
- Meta de água: `2.6L` | Consumido: `1.2L`
  - `remaining = 1.4`, `overage = 0`, `completed = false` → exibe: *faltam 1.4L*

---

### Como a Home Usará Esses Dados (Futuro)

Na **Fase 2 do MVP**, a Home Screen lirá as metas calculadas da engine e os dados acumulados do `glpy_daily_tracking` para exibir:
- Barras de progresso de macros e água em tempo real.
- Alertas inteligentes de "Hora de beber água!" ou "Você ainda não atingiu sua meta de proteína hoje."
- Score diário de completude (%) como elemento de gamificação no dashboard.
- Resumo da `protocolDay` quando houver protocolo ativo, exibindo missões concluídas/pendentes, receita do dia, check-in selecionado e status do dia.

A integração será feita sem modificar a engine — apenas lendo `calculateDailyRemaining()` com os dados do Local Intelligence Store.

> [!IMPORTANT]
> A conclusão de missões de protocolo não entra no cálculo de `GLPYDailyConsumed`. Ela é tratada como sinal comportamental pela Local Intelligence Store. Consumo real de macros e água continua sendo calculado apenas a partir de refeições, água registrada e futuros fluxos de foto do prato.

---

### Como a IA Usará Esses Dados

A função `buildDailyTargetsForAI()` formata um bloco de texto estruturado que é injetado no system prompt do Chat IA (DeepSeek) a cada nova conversa. Exemplo do payload gerado:

```text
=== GLPY DAILY TARGETS ENGINE ===

Metas do Dia:
- Calorias: 1884 kcal
- Proteína: 126g
- Carboidratos: 227g
- Gorduras: 52g
- Água: 2.94L

Consumido Hoje (2 refeições):
- Calorias: 450 kcal
- Proteína: 36g
- Carboidratos: 45g
- Gorduras: 18g
- Água: 1.2L

Saldo Restante:
- Calorias: 1434 kcal restantes
- Proteína: 90g restantes
- Carboidratos: 182g restantes
- Gorduras: 34g restantes
- Água: 1.74L restantes

Conclusão Geral do Dia: 28%

Orientação para IA:
Usuário ainda está pendente em: proteína (faltam 90g), hidratação (faltam 1.74L),
calorias (faltam 1434 kcal). Priorize refeições pequenas e proteicas, hidratação
fracionada e escolhas de baixo impacto glicêmico.
```

Com esse contexto, a IA personaliza suas respostas com base em dados de jornada real do dia, em vez de gerar orientações genéricas.

---

## 7. Referências Científicas e Bibliográficas

1. **Mifflin MD, St Jeor ST, et al.** *A new predictive equation for resting energy expenditure in healthy individuals.* Am J Clin Nutr. 1990;51(2):241-247.
2. **Institute of Medicine (IOM).** *Dietary Reference Intakes for Energy, Carbohydrate, Fiber, Fat, Fatty Acids, Cholesterol, Protein, and Amino Acids.* Washington, DC: The National Academies Press; 2005.
3. **Phillips SM, Chevalier S, Leidy HJ.** *Protein "requirements" beyond the RDA: implications for optimizing health.* Appl Physiol Nutr Metab. 2016;41(5):565-572.
4. **Wharton S, et al.** *Canadian Adult Obesity Clinical Practice Guidelines: Pharmacotherapy for Obesity.* Can Assoc Radiol J. 2020.
