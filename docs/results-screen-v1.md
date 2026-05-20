# GLPY — Results Screen V1

Status: APPROVED — READY FOR MVP
Version: V1
Date: 2026-05-20

---

# Nome da Tela

ResultsScreen

---

# Objetivo

Criar a tela de resultados do GLPY-V1, consolidando peso, meta, progresso, sequência, evolução visual e próximos passos em uma visão clara, premium e motivadora.

A tela serve como o espelho emocional da transformação do usuário, celebrando conquistas e incentivando a consistência a longo prazo, reduzindo o efeito rebote metabólico e psicológico.

---

# Aviso de Segurança e Escopo

- **Aviso Oficial:** O GLPY não interpreta dados como diagnóstico nem promete resultado médico.
- **Escopo MVP:** No MVP, os dados exibidos na tela são mockados/localizados para visualização e experiência imediata.

---

# Tema Oficial

LIGHT PREMIUM

Sistema: Operational
Categoria: Progress / Results Dashboard

---

# Componentes Usados

- `GLPYScreen` (variant: light) — Componente base de tela no padrão Light Premium.
- `GLPYHeader` — Título centralizado "Resultados" + botão de voltar (`onBack`).
- `GLPYCard` (variant: light) × 6 — Cards de agrupamento visual com design minimalista:
  - Card 1: Conquista principal (Hero da evolução com destaque de peso eliminado)
  - Card 2: Progresso da meta (Métricas iniciais/atuais e barra de progresso horizontal)
  - Card 3: Evolução resumida (Grid estatístico 2x2 com ícones)
  - Card 4: Transformação visual (Mini-preview de antes/depois com câmera e tag de peso)
  - Card 5: Sua sequência (Indicação de consistência com 7 dias e checkmarks)
  - Card 6: Próximo passo (Target milestone com dias faltantes)
- `GLPYButton` (variant: primary, size: lg, fullWidth) — CTA principal para ver linha do tempo.
- Ícones de `lucide-react`: `TrendingDown`, `Scale`, `Ruler`, `CheckSquare`, `Flame`, `Image`, `Camera`, `Sparkles`, `Check`.

---

# Estrutura da Tela

## Card 1 — Conquista principal
- Título: "Você já eliminou"
- Destaque grande: `4,8 kg` em tom verde metabólico (`greenDark` `#3FAE68`)
- Texto secundário: "desde o início da sua jornada."
- Badge destacada: `32% da sua meta concluída`

## Card 2 — Progresso da meta
- Grid de métricas de peso:
  - **Peso inicial:** 84,8 kg
  - **Peso atual:** 80,0 kg
  - **Meta:** 58,0 kg
  - **Falta eliminar:** 22,0 kg (destacado em verde)
- Barra de progresso horizontal linear preenchida em 32% (`brand.green`) com labels auxiliares `0%`, `32%`, e `META`.

## Card 3 — Evolução resumida
- Grid 2x2 contendo métricas metabólicas e funcionais:
  - **Peso eliminado:** 4,8 kg
  - **Cintura:** -16 cm (ícone `Ruler`)
  - **Check-ins:** 12 dias (ícone `CheckSquare`)
  - **Atividade:** 30 min hoje (ícone `Flame`)

## Card 4 — Transformação visual
- Layout lado a lado com placeholders minimalistas:
  - **Antes:** ícone de câmera cinza centralizado + tag de peso secundária de `84,8 kg`
  - **Depois:** ícone de câmera verde centralizado + tag de peso secundária de `80,0 kg` (em container com borda verde pontilhada e sombra suave)
- Ação secundária no rodapé: `"Ver evolução visual >"`

## Card 5 — Sua sequência
- Destaque: `12 dias`
- Texto de apoio: "Continue assim. Pequenos registros constroem grandes mudanças."
- Fileira horizontal de 7 bolinhas de dias (`S T Q Q S S D`), com 6 checkmarks brancos em círculos verdes de sucesso e 1 círculo pendente vazio.

## Card 6 — Próximo passo
- Texto explicativo: "Completar 14 dias de consistência."
- Mini container de status pontilhado verde: `Faltam 2 dias`

---

# Comportamento

- **Link "Ver evolução visual >"**:
  - Imprime no console a intenção de navegação para a tela de visualização de progresso:
    ```javascript
    console.log("open_visual_progress_share");
    ```
- **CTA principal "Ver linha do tempo"**:
  - Imprime no console a intenção de navegação para a linha do tempo operacional:
    ```javascript
    console.log("open_progress_timeline");
    ```

---

# Conexões Futuras (Pós-MVP)

- **WeightTrackingEngine / DailyTrackingEngine**: Para obter pesos em tempo real, refeições e dados de hidratação.
- **ProgressEngine / PhotoEngine**: Para renderizar fotos reais no antes/depois e calcular o ritmo metabólico.
- **XP/Streak Engine**: Para sincronizar e acumular recompensas por consistência e dias de sequência ativa.
- **GLPY IA**: Para sugerir novos marcos realistas baseados na evolução.

---

# Arquivo Implementado

src/screens/operational/ResultsScreen.tsx

---

# Rota Preview

http://localhost:3000/preview/results

*Nota: Rota isolada implementada via dynamic import em src/main.tsx e adicionada à Central de Previews.*

---

# Observação Oficial

Esta tela é o padrão de consolidação de progresso Light Premium para o ecossistema GLPY.
A experiência foi desenhada para celebrar a transformação além da balança, estimulando o orgulho metabólico saudável e a autoestima sustentada.

Não alterar essa tela sem nova solicitação explícita.

---

# Status Final

APPROVED — READY FOR MVP
