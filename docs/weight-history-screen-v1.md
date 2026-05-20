# GLPY — Weight History Screen V1

Status: APPROVED — READY FOR MVP
Version: V1
Date: 2026-05-20

---

# Nome da Tela

WeightHistoryScreen

---

# Objetivo

Criar a tela de histórico de peso do GLPY-V1, permitindo que o usuário visualize sua evolução de peso ao longo do tempo de forma simples, premium e motivadora. 

A tela exibe métricas principais de evolução, gráfico visual simples de tendência e registros recentes. O objetivo central da tela é mostrar progresso sem gerar ansiedade ou culpa.

---

# Aviso de Segurança e Escopo

- **Aviso Oficial:** O GLPY não interpreta peso como diagnóstico nem substitui orientação profissional.
- **Escopo MVP:** Os dados exibidos na tela são mockados/localizados para visualização e experiência do usuário no MVP.

---

# Tema Oficial

LIGHT PREMIUM

Sistema: Operational
Categoria: Progress / Histórico operacional

---

# Componentes Usados

- `GLPYScreen` (variant: light) — Componente base de tela no padrão Light Premium.
- `GLPYHeader` (com botão voltar + título "Histórico de peso").
- `GLPYCard` (variant: light) × 4 — Cards de agrupamento visual com design minimalista:
  - Card 1: Evolução do peso (Métricas principais, contendo Peso Inicial, Peso Atual, Meta e Eliminado em destaque verde)
  - Card 2: Últimos registros (Gráfico visual simples de tendência SVG sem bibliotecas de terceiros)
  - Card 3: Registros recentes (Lista de registros anteriores com a variação em destaque verde)
  - Card 4: Dica GLPY (Tinted green card de auxílio contextual e incentivo a oscilações normais)
- `GLPYButton` (variant: primary, size: lg, fullWidth) — CTA principal para adicionar novo peso.
- Ícones de `lucide-react`: `TrendingDown`, `Scale`, `Calendar`, `Lightbulb`.

---

# Estrutura da Tela

## Header
- Botão de voltar (`onBack` prop).
- Título centralizado: "Histórico de peso".

## Card 1 — Evolução do peso
- Subtexto incentivador: "Acompanhe sua jornada com leveza. O importante é a direção, não a perfeição diária."
- Grid 2x2 contendo 4 métricas principais:
  - **Peso inicial:** 84,8 kg
  - **Peso atual:** 80,0 kg
  - **Meta:** 58,0 kg
  - **Eliminado:** 4,8 kg (destacado em verde dark `#3FAE68` para celebrar pequenas conquistas)

## Card 2 — Últimos registros (Gráfico de evolução)
- Gráfico responsivo puro SVG:
  - Traçado suave e descendente mostrando 7 pontos de peso.
  - Preenchimento gradiente sutil verde (`brand.green` a 25% de opacidade degradando até zero).
  - Ponto final ressaltado com glow pulse e tag de leitura rápida: `80,0 kg`.
  - Grid de auxílio horizontal discreto e eixo de datas limpo (`07/05`, `10/05`, `13/05`).

## Card 3 — Registros recentes
- Lista de entradas passadas com dados mockados:
  - **Hoje** — 80,0 kg — -0,8 kg
  - **12/05/2026** — 80,8 kg — -0,8 kg
  - **11/05/2026** — 81,6 kg — -0,9 kg
  - **10/05/2026** — 82,5 kg — -0,7 kg
- Mudanças negativas (eliminação de peso) são exibidas de forma clara em verde para ressaltar a progressão positiva.

## Card 4 — Dica GLPY
- Texto focado na saúde emocional e no alívio de culpa: "O peso pode oscilar de um dia para o outro. Observe a tendência da sua jornada e comemore pequenas evoluções."
- Fundo verde tintado (`brand.green` com 8% de opacidade e borda a 20%) com o ícone `Lightbulb`.

---

# Comportamento

- **Ação do CTA "Adicionar novo peso"**:
  - Imprime no console a ação correspondente para futura abertura de modal/tela de edição de peso:
    ```javascript
    console.log("open_current_weight_edit");
    ```

---

# Conexões Futuras (Pós-MVP)

- **WeightTrackingEngine**: Para calcular e plotar dinamicamente os registros reais do usuário.
- **Gráficos Reais e Tendências**: Exibição de tendências a longo prazo (semanal, mensal, semestral) e filtros de data.
- **Relatórios & GLPY IA**: Geração de relatórios metabólicos inteligentes cruzando o peso com sintomas de check-in e dosagem.

---

# Arquivo Implementado

src/screens/operational/WeightHistoryScreen.tsx

---

# Rota Preview

http://localhost:3000/preview/weight-history

*Nota: Rota isolada implementada via dynamic import em src/main.tsx.*

---

# Observação Oficial

Esta tela é o padrão operacional Light Premium para histórico de peso do ecossistema GLPY.
A experiência deve reforçar o progresso sem gerar ansiedade ou culpa, focando na tendência de longo prazo de forma simplificada e positiva.

Não alterar essa tela sem nova solicitação explícita.

---

# Status Final

APPROVED — READY FOR MVP
