# GLPY Smart Protocol App — Master Pattern V1

> Documento estratégico, técnico e de produto.
> Serve para entender o GLPY, replicar o modelo em outros nichos e orientar futuras IAs de desenvolvimento.

---

## 1. Visão do modelo

O GLPY não é um app de tracking. É um **Smart Protocol App** — um sistema inteligente que conduz o usuário por uma jornada transformacional guiada por protocolos, IA contextual e registro de progresso.

O modelo é composto por:

| Camada | Função |
|---|---|
| Onboarding | Captura perfil, dor, objetivo e diagnóstico inicial |
| Quiz / Cocriação | Aprofunda contexto, personaliza jornada |
| Home operacional | Central de registro diário e ações rápidas |
| Protocolos guiados | Unidade principal de transformação — missões, vídeo, receita, check-in |
| IA contextual | Orientação inteligente baseada no comportamento real do usuário |
| Check-ins | Registro emocional e comportamental por protocolo |
| Tracking diário | Água, refeições, emoção, atividade, peso, aplicação |
| Evolução visual | Antes/depois, gráficos, compartilhamento |
| Comunidade / Células | Pertencimento, grupos por protocolo ou perfil |
| Loja | Produtos contextuais — suplementos, protocolos premium, mentorias |
| Desafios | Streak, XP, badges, conquistas, gamificação saudável |
| Black Box comportamental | Registro silencioso de eventos para melhorar IA e retenção |
| Paywall / Assinatura | Monetização integrada à jornada |

---

## 2. Conceito central

> "Um usuário entra com uma dor, responde um diagnóstico, recebe uma jornada guiada, registra sua evolução, conversa com uma IA contextual e é conduzido por protocolos até um resultado percebido."

O diferencial do modelo não é a tecnologia. É a **arquitetura da jornada** — cada interação reforça o próximo passo, e o app aprende o comportamento do usuário ao longo do tempo.

---

## 3. Arquitetura universal do modelo

### 3.1 Onboarding System
Responsável por capturar o perfil completo do usuário antes de qualquer função.

- Nome, e-mail, idade, sexo
- Peso atual, peso objetivo, altura
- Medicamento em uso (se nicho GLP-1)
- Objetivo principal
- Frequência de uso esperada
- Aceitação de termos e política

Saída: `glpy_onboarding` preenchido, usuário apto a usar o app.

### 3.2 Diagnostic / Quiz System
Quiz de diagnóstico que aprofunda o contexto e personaliza a jornada.

- Perguntas sobre comportamento, hábitos, dores secundárias
- Respostas usadas pela IA para personalização
- XP de gamificação ao completar
- Pode ser reutilizado ao longo do tempo (quiz de evolução)

### 3.3 Operational Tracking System
Registro diário de todas as ações do usuário.

- Água consumida
- Refeições registradas
- Emoção do dia
- Atividade física
- Peso atual
- Aplicação do medicamento (nicho GLP-1)
- Efeitos colaterais

Todos os dados ficam em `localStorage` com chaves diárias (`glpy_*_hoje`).

### 3.4 Protocol System
Unidade central de transformação. Ver Seção 4.

### 3.5 AI Context System
IA que lê o contexto completo do usuário e orienta com linguagem humana e premium. Ver Seção 7.

### 3.6 Progress / Evolution System
Registro de evolução ao longo do tempo.

- Histórico de peso (`glpy_checkin_historico`)
- Fotos de progresso — antes/depois
- Linha do tempo visual
- Compartilhamento de resultados (VisualProgressShareScreen)
- Check-ins históricos por protocolo

### 3.7 Community / Social System
Pertencimento e suporte entre usuários. Ver Seção 9.

### 3.8 Monetization / Store System
Monetização integrada à jornada. Ver Seção 10.

### 3.9 Black Box / Intelligence Layer
Camada silenciosa de registro comportamental. Ver Seção 8.

### 3.10 Admin / Debug Layer
Ferramentas internas para suporte e debug.

- CaixaPretaScreen — leitura de todo localStorage em tempo real
- Telas de preview de protocolo (sem alterar localStorage de produção)
- QA Center — testes de IA e lógica
- Date risk test — validação de comportamentos por data

---

## 4. Protocol System — regra base

O protocolo é a **unidade central de transformação** do modelo. Cada protocolo representa uma jornada com começo, meio e fim.

### Anatomia de um protocolo

| Elemento | Descrição |
|---|---|
| ID único | Identificador em camelCase (ex: `antiRebote`, `sobrevivendo`) |
| Nome | Título humano do protocolo |
| Emoji | Identidade visual rápida |
| Total de dias | 7, 14, 21 ou 28 dias |
| Vídeo por dia | URL de vídeo do dia |
| Missões por dia | 3–5 missões com texto e subtexto |
| Receita do dia | Receita vinculada ao dia (opcional) |
| Check-in | Opções de check-in emocional/comportamental |
| XP por dia | Pontos de gamificação ao concluir |

### Trava diária — regra GLPY

**1 usuário · 1 protocolo · 1 dia.**

Ao concluir qualquer protocolo, a chave `glpy_protocol_global_daily_lock` é escrita:

```json
{
  "date": "2026-05-30",
  "protocolId": "antiRebote",
  "protocolName": "Anti-Rebote",
  "day": 3,
  "completedAt": "2026-05-30"
}
```

Qualquer outro protocolo aberto no mesmo dia lê essa chave e bloqueia:
- marcar missão
- selecionar check-in
- concluir dia

Isso garante a integridade da jornada e evita gamificação indevida.

### Ciclo de vida do protocolo

```
Inativo → Ativo → Dia 1 concluído → Dia 2 bloqueado até amanhã
→ Dia 2 concluído → ... → Último dia concluído → Protocolo finalizado
→ Próximo protocolo disponível
```

### Progresso por protocolo

Cada protocolo salva seu progresso de forma isolada:

- `glpy_protocolo_${protocoloId}_progresso` → `{ diaAtual, diasConcluidos, dataUltimoCheck }`
- `glpy_protocol_global_daily_lock` → trava cross-protocolo

---

## 5. Modelo flexível de protocolos de 28 dias

O modelo GLPY suporta protocolos de qualquer duração. Para produtos premium, o formato de 28 dias em 4 módulos é o mais completo:

### Estrutura recomendada — 28 dias

| Módulo | Dias | Tema |
|---|---|---|
| Módulo 1 | 1–7 | Consciência / Preparação |
| Módulo 2 | 8–14 | Execução / Proteção |
| Módulo 3 | 15–21 | Consolidação / Ajuste |
| Módulo 4 | 22–28 | Autonomia / Manutenção |

### Anatomia de cada dia (em qualquer módulo)

1. **Tema do dia** — foco central
2. **Ação principal** — o que fazer hoje
3. **Micro vitória** — resultado esperado ao final
4. **Check-in** — como o usuário está se sentindo
5. **Recomendação contextual** — da IA, baseada nos registros

### Flexibilidade do modelo

| Formato | Uso recomendado |
|---|---|
| 7 dias | MVP, protocolos de impacto rápido, desafios |
| 14 dias | Protocolos de transição ou reforço |
| 21 dias | Protocolos de formação de hábito |
| 28 dias | Produto premium, transformação completa |
| Módulos bônus | Conteúdo extra após conclusão |
| Desafios extras | Missões opcionais de alta recompensa |
| Células/comunidade | Engajamento paralelo ao protocolo |

---

## 6. Tipos de protocolos replicáveis

### Protocolos GLPY (nicho GLP-1 / emagrecimento)

- Anti-Rebote
- Sobrevivendo às Canetas
- Não Perca Músculo
- Controle de Efeitos Colaterais
- Alimentação para Baixo Apetite
- Psicologia do Emagrecimento
- Energia Baixa
- Ajuste Metabólico
- Transição — Parar Caneta
- Anti-Queda de Cabelo

### Protocolos para outros nichos

| Nicho | Exemplo de protocolo |
|---|---|
| Ansiedade | 7 dias para acalmar o sistema nervoso |
| Produtividade | 21 dias de foco profundo |
| Finanças pessoais | Protocolo de desendividamento |
| Relacionamento | 14 dias de reconexão |
| Sono | 7 dias para regularizar o sono |
| Menopausa | Protocolo de adaptação hormonal |
| Fertilidade | Preparação em 28 dias |
| Academia | Protocolo de hipertrofia iniciante |
| Diabetes | Protocolo de controle glicêmico |
| Dor crônica | 21 dias de manejo funcional |
| Concurso | Protocolo de estudo intensivo |
| Empreendedorismo | Protocolo de lançamento em 14 dias |
| Idiomas | 21 dias de imersão diária |

---

## 7. IA contextual

A IA do modelo GLPY **não é um chatbot genérico**. Ela age como orientadora pessoal porque lê o contexto real do usuário antes de responder.

### Contexto que a IA deve ler

| Dado | Chave |
|---|---|
| Perfil | `glpy_onboarding` |
| Protocolo ativo | `glpy_active_protocol`, `glpy_protocol_context_v1` |
| Dia do protocolo | `glpy_protocol_day_today` |
| Refeições de hoje | `glpy_refeicoes_hoje` |
| Água de hoje | `glpy_agua_hoje` |
| Emoção de hoje | `glpy_emocao_hoje` |
| Atividade de hoje | `glpy_atividade_hoje` |
| Aplicação | `glpy_injecao_ultima`, `glpy_dose` |
| Efeitos colaterais | `glpy_injection_effects_today` |
| Progresso | `glpy_checkin_historico`, `glpy_latest_weight` |
| Histórico da IA | `glpy_ai_usage` |
| Relatos de erro | `glpy_issue_reports` |

### Regras de comportamento da IA

- **Acolhe** antes de orientar
- **Não finge** que alterou dados — nunca diz "já atualizei seu peso" sem integração real
- **Encaminha para ação** dentro do app quando necessário
- **Usa linguagem humana e premium** — sem tom clínico ou genérico
- **Registra relatos** em `glpy_issue_reports` quando o usuário reporta problema
- **Não extrapola** o que não sabe — usa os dados disponíveis, não inventa

### Prompt base

Todo prompt da IA deve começar com o contexto montado dinamicamente:
perfil + protocolo ativo + registros do dia + histórico recente + pergunta do usuário.

---

## 8. Black Box / Intelligence Layer

A Caixa Preta é a **memória comportamental silenciosa** do app. Registra eventos sem que o usuário perceba, permitindo suporte, análise de retenção e melhoria da IA.

### Papel da Caixa Preta

- Registrar eventos de comportamento (missão concluída, craving, check-in, erro)
- Entender padrões de abandono e engajamento
- Alimentar futuras camadas de IA preditiva
- Suporte ao usuário com contexto real
- Base para analytics e Firebase no futuro

### Chaves atuais do modelo GLPY

| Chave | Conteúdo |
|---|---|
| `glpy_black_box_events` | Array de eventos comportamentais com type, category, domain, signal, payload |
| `glpy_issue_reports` | Relatos de erro registrados via IA |
| `glpy_protocol_global_daily_lock` | Trava diária de protocolo concluído |
| `glpy_protocol_context_v1` | Contexto atual do protocolo ativo |
| `glpy_protocol_day_today` | Tracking do dia do protocolo para Home e IA |
| `glpy_ai_usage` | Histórico de uso da IA (contagem, datas) |
| `glpy_onboarding` | Perfil completo do usuário |
| `glpy_refeicoes_hoje` | Refeições registradas hoje |
| `glpy_agua_hoje` | Água consumida hoje |
| `glpy_emocao_hoje` | Emoção registrada hoje |
| `glpy_atividade_hoje` | Atividade física de hoje |

### Evolução técnica da camada

```
MVP       → localStorage (simples, sem backend)
Fase 2    → localStorage + espelho Firestore para dados críticos
Fase 3    → Firebase completo com regras de segurança
Fase 4    → Analytics preditivo com modelos de retenção
```

A migração não deve acontecer antes do produto estar validado e com receita.

---

## 9. Community / Células System

A comunidade aumenta retenção porque transforma o app em **pertencimento**, não apenas em ferramenta.

### Evolução recomendada

| Fase | Formato |
|---|---|
| MVP | WhatsApp — grupo provisório, link fixo |
| Fase 2 | Células internas no app — por protocolo ou perfil |
| Fase 3 | Feed social leve — conquistas e check-ins compartilhados |
| Fase 4 | Comunidade premium — mentorias, desafios em grupo |

### Modelo de células

| Célula | Público |
|---|---|
| Comunidade geral | Todos os usuários |
| Célula por protocolo | Quem está no mesmo protocolo |
| Célula por perfil | Por objetivo (ex: perdeu mais de 10kg) |
| Célula por fase da jornada | Iniciantes, intermediários, avançados |
| Célula de suporte | Dúvidas e dificuldades |
| Grupo de avisos | Apenas leitura — novidades e atualizações |

---

## 10. Store / Monetização

A loja deve surgir **do comportamento do usuário**, não como marketplace genérico.

### Princípio de contextualidade

Se o usuário está no protocolo "Anti-Queda de Cabelo" → oferecer suplemento de biotina.
Se o usuário completou 7 dias → oferecer próximo protocolo.
Se o usuário reportou baixa energia → oferecer protocolo de energia.

### Tipos de produtos

| Tipo | Exemplos |
|---|---|
| Suplementos | Produtos físicos integrados ao protocolo |
| Protocolos premium | Conteúdo avançado com mais dias ou temas |
| Receitas exclusivas | Pacotes de receitas por objetivo |
| Mentorias | Acesso a especialista pelo app |
| Comunidade premium | Células com acompanhamento profissional |
| Afiliados | Produtos terceiros com rastreamento |
| Assinatura | Acesso a todos os protocolos + IA ilimitada |

---

## 11. Gamificação e desafios

A gamificação do modelo é **saudável e orientada por progresso real**, nunca manipulativa.

### Elementos atuais do GLPY

| Elemento | Descrição |
|---|---|
| XP | Pontos ganhos ao concluir dias de protocolo, check-ins, registros |
| Streak | Sequência de dias ativos (fonte: `glpy_checkin_historico`) |
| Nível | Calculado a partir do XP total |
| Confetti | Feedback visual de celebração ao concluir dia |
| XP float | Animação de +XP ao concluir |
| Conquistas | Marcos específicos — primeiro check-in, 7 dias seguidos, etc. |

### Regras de gamificação saudável

- Nunca punir ausência — apenas celebrar presença
- Nunca criar ansiedade por perda de streak
- Recompensas devem refletir progresso real
- Gamificação apoia a jornada, não a substitui

---

## 12. Regras de UX do modelo

Toda tela deve respeitar:

| Regra | Descrição |
|---|---|
| 1 objetivo | Cada tela tem uma única função clara |
| 1 ação principal | Um CTA dominante — não dois botões de mesmo peso |
| 1 emoção dominante | A tela gera confiança, celebração, clareza ou pertencimento |
| Linguagem humana | Nenhum jargão médico ou técnico desnecessário |
| Feedback positivo | Toda ação concluída tem resposta visual imediata |
| Pouco atrito | O usuário não precisa pensar — o caminho é óbvio |

### O app nunca deve parecer

- App médico frio
- Dashboard corporativo
- Contador de calorias punitivo
- App genérico de bem-estar sem identidade

---

## 13. Camada comercial

O modelo é um funil de transformação que começa antes do app.

### Jornada comercial completa

```
Anúncio / orgânico
    ↓
Quiz de diagnóstico (web ou app)
    ↓
VSL — vídeo de promessa
    ↓
Oferta / paywall — plano fundador ou assinatura
    ↓
Onboarding interno
    ↓
Protocolo inicial
    ↓
Resultado percebido nos primeiros 7 dias
    ↓
Retenção — check-in, streak, IA, comunidade
    ↓
Upsell — próximo protocolo, produto, mentoria
    ↓
Referência / indicação
```

### Métricas críticas

| Métrica | Significado |
|---|---|
| Conclusão do onboarding | Usuário pronto para usar |
| Protocolo D1 concluído | Primeiro engajamento real |
| Streak ≥ 3 | Hábito em formação |
| Protocolo completado | Resultado percebido |
| Upsell aceito | LTV expandido |

---

## 14. Replicação para outros nichos

Para replicar o modelo GLPY em qualquer nicho, responder:

| Decisão | Pergunta |
|---|---|
| 1. Dor principal | Qual é a dor que o usuário não consegue resolver sozinho? |
| 2. Avatar | Quem é esse usuário? Idade, contexto, nível de consciência? |
| 3. Diagnóstico inicial | Quais perguntas revelam o grau da dor e personalizam a jornada? |
| 4. Protocolo principal | Qual transformação em 7–28 dias resolve a dor percebida? |
| 5. Metas diárias | O que o usuário deve fazer todo dia para sentir progresso? |
| 6. Registros essenciais | Quais dados diários alimentam a IA e o histórico? |
| 7. IA contextual | O que a IA precisa saber para orientar com credibilidade? |
| 8. Comunidade | Como criar pertencimento — WhatsApp, células ou social interno? |
| 9. Produto / loja | O que vender contextualmente ao longo da jornada? |
| 10. Métrica de evolução | Como o usuário sabe que está evoluindo? |
| 11. Gatilho de retenção | O que faz o usuário voltar amanhã? |
| 12. Oferta inicial | Qual é o primeiro produto que prova a promessa? |

---

## 15. Template de novo app

Usar este template ao iniciar qualquer novo Smart Protocol App:

```
Nome do app:
Nicho:
Dor principal:
Promessa central:
Protocolo inicial:
Duração do protocolo:
Módulos (se 28 dias):
Registros diários:
IA precisa saber:
Comunidade (MVP):
Loja (fase 1):
Plano gratuito / pago:
Evento principal de retenção:
Métrica de sucesso do usuário em 7 dias:
```

### Exemplo preenchido — nicho ansiedade

```
Nome do app: CALMO
Nicho: Ansiedade e regulação emocional
Dor principal: Ataques de ansiedade recorrentes sem saber o que fazer
Promessa central: 7 dias para aprender a regular sua ansiedade antes que ela te controle
Protocolo inicial: Protocolo do Sistema Nervoso — 7 dias
Duração do protocolo: 7 dias
Módulos: único (7 dias são o MVP)
Registros diários: nível de ansiedade, respiração feita, sono, check-in emocional
IA precisa saber: histórico de crises, gatilhos, nível de ansiedade de hoje
Comunidade (MVP): WhatsApp group provisório
Loja (fase 1): protocolo premium de 21 dias, mentoria individual
Plano gratuito / pago: freemium — protocolo 1 gratuito, demais pagos
Evento principal de retenção: check-in diário de nível de ansiedade (streak)
Métrica de sucesso em 7 dias: usuário completa os 7 dias e relata redução percebida
```

---

## 16. Regras técnicas

### Princípio de progressão gradual

| Fase | Decisão técnica |
|---|---|
| MVP | `localStorage` direto — simples, rápido, sem backend |
| Validação | `glpyStore` — abstração tipada sobre localStorage |
| Escala | `FirebaseAdapter` — espelho progressivo para dados críticos |
| Produto estabelecido | Firebase completo + regras de segurança + analytics |

### Regras de desenvolvimento do modelo

- **Uma sprint pequena por vez** — nunca refatorar e adicionar feature no mesmo commit
- **Não migrar para Firebase antes de ter receita recorrente** — localStorage aguenta o MVP
- **Não quebrar MVP vendável** — qualquer mudança deve passar por build limpo antes do push
- **Não alterar IA, paywall, HeroSpark ou Firebase Rules** sem sprint dedicada
- **Nomenclatura de chaves** — sempre prefixo `glpy_` para localStorage
- **Isolamento de progresso** — cada protocolo usa chave própria; trava global é separada
- **Nenhuma tela sem onboarding completo** — verificar `glpy_onboarding` antes de renderizar fluxos operacionais

---

## 17. Frase guia

> "O produto não é o app. O produto é a jornada inteligente que transforma comportamento em progresso percebido."

O app é o veículo. A transformação é o produto. O que retém o usuário não é a feature — é o **resultado que ele sente** após 7 dias de protocolo concluído.

---

## 18. Status

```
MASTER PATTERN V1 — READY FOR FUTURE IMPLEMENTATION

Data: 2026-05-30
Versão: 1.0
Projeto base: GLPY-V1
Nicho base: GLP-1 / emagrecimento assistido

Regras:
- Este documento não altera código funcional
- É leitura de referência para desenvolvedores, IAs e parceiros
- Deve ser atualizado a cada versão maior do produto
- Não substituir por versões parciais — manter versionamento (V1, V2...)
```
