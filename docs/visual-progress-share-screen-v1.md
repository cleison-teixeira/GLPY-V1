# GLPY — Visual Progress Share Screen V1

Status: APPROVED — READY FOR MVP
Version: V1
Date: 2026-05-19

---

# Nome da Tela

Visual Progress Share Screen

---

# Objetivo

Criar uma experiência visual premium para que o usuário visualize e compartilhe sua evolução antes/depois com impacto emocional.

A tela funciona como um mockup compartilhável de progresso, combinando:

- card interno Dark Premium com logo oficial, fotos comparativas, stats de evolução e frase motivacional
- card de resumo com dados consolidados da evolução
- opções de compartilhamento (Célula GLPY, WhatsApp, Instagram, TikTok)
- botão de salvar imagem (futuramente via html2canvas)

No MVP, fotos, dados, salvamento e compartilhamento são todos mockados via console.log.

O GLPY deve incentivar progresso sem pressionar exposição pública. Compartilhar deve ser sempre opcional e emocionalmente seguro.

---

# Tema Oficial

LIGHT PREMIUM (tela base) + DARK PREMIUM (story card interno)

Sistema: Operational
Categoria: Progresso Visual

---

# Componentes Usados

- GLPYScreen (variant: light)
- GLPYHeader (com botão voltar + título "Minha evolução")
- GLPYCard (variant: light, noPadding) — story card dark premium
- GLPYCard (variant: light) — resumo da evolução
- GLPYCard (variant: light) — compartilhar
- GLPYButton (variant: primary, size: lg, fullWidth) — "Salvar imagem"

Todos os componentes base são de src/components/ui/.
Todos os tokens são de src/theme/.

---

# Asset Oficial

Logo usada no topo do story card:

- Arquivo: `assets/logos/logo-dark.png`
- Importação: `import logoGlpyDark from '@/assets/logos/logo-dark.png'`
- Variante: horizontal (símbolo + texto "GLPY"), fundo transparente, elementos brancos — projetada para fundos escuros
- Renderização: `<img height: 26, objectFit: 'contain'>`

Não substituir por SVG inline ou logo improvisada sem aprovação.

---

# Dark Tokens do Story Card

```ts
const S_BG         = '#0A1628';   // fundo do card
const S_PHOTO_A    = '#1a2e44';   // placeholder foto Antes
const S_PHOTO_B    = '#0d2030';   // placeholder foto Depois
const S_STRIP_BG   = '#1a2e44';   // gap color (separador stats)
const S_STRIP_CELL = '#0d1f35';   // célula de stat
const S_GREEN      = '#00C27A';
const S_WHITE      = '#FFFFFF';
const S_MUTED      = 'rgba(255,255,255,0.45)';
const S_MUTED_LO   = 'rgba(255,255,255,0.20)';
```

---

# Estrutura da Tela

## Header

- botão voltar
- título: Minha evolução

## Story Card (Dark Premium — GLPYCard noPadding)

### Topo

- esquerda: `<img>` logo oficial `logo-dark.png`, height 26, objectFit contain
- direita: "Meu protocolo" (muted) + "Anti-Rebote" (verde, bold)

### Headline

- "Meu Antes & Depois" — fontSize 22, fontWeight 900, letterSpacing -0.8px, branco
- tagline: "Mais saúde. Mais controle. Mais eu." — fontSize 11, muted

### Fotos (grid 1fr 16px 1fr, alignItems: end)

| Coluna | Conteúdo | Altura | Borda |
|---|---|---|---|
| Antes | Placeholder + ícone SVG usuário | 180px | sem borda |
| Centro | Seta arrow circle verde, 34×34, ring 5px | — | — |
| Depois | Placeholder + ícone SVG usuário verde | 218px | 2px solid #00C27A |

- `alignItems: end` faz Depois crescer para cima
- Arrow circle: `width: 34, height: 34, background: S_GREEN, boxShadow: '0 0 0 5px #0A1628'`, `paddingBottom: 76`
- Placeholder Antes: `paddingBottom: 32` para posicionar ícone levemente acima do centro
- Placeholders: apenas ícone SVG inline de usuário, sem texto

Labels das fotos:
- "ANTES" — uppercase, fontSize 10, fontWeight 800, muted 50%
- "DEPOIS" — uppercase, fontSize 10, fontWeight 800, S_GREEN
- Datas: "Mar 2025" / "Mai 2025" — fontSize 9, muted 30%

### Stats Strip (grid 1fr 1fr 1fr, gap 1px — separador via background)

| Posição | Valor | Cor | Label |
|---|---|---|---|
| 1 | −15,8 kg | S_GREEN | Evolução |
| 2 | 87 → 71 | S_WHITE | Peso (kg) |
| 3 | 94 → 78 | S_WHITE | Cintura (cm) |

- `gap: 1, background: S_STRIP_BG` — o gap colorido age como linha separadora
- Cada célula: `background: S_STRIP_CELL, padding: 12px 8px, textAlign: center`
- Setas inline: `<ArrowRight size={10} color={S_GREEN}>`

### Footer do Story Card

- frase: "Disciplina hoje. Liberdade amanhã." — italic, muted 45%
- brand row: dot · glpy.com.br · dot — muted 20%
- borderTop: `1px solid rgba(255,255,255,0.05)`

## Card Resumo da Evolução

Título uppercase small secondary + 4 linhas com dividers 0.5px:

| Ícone | Label | Valor |
|---|---|---|
| TrendingUp | Peso eliminado | −15,8 kg (verde) |
| Ruler | Cintura | −16 cm (verde) |
| CalendarDays | Tempo | 63 dias |
| Check | Protocolo | Anti-Rebote · Sem. 3 |

## Card Compartilhar

Grid 2×2 com 4 botões:

| ID | Label | Ícone |
|---|---|---|
| cell | Célula GLPY | Users |
| whatsapp | WhatsApp | Share2 |
| instagram | Instagram | Share2 |
| tiktok | TikTok | Share2 |

Cada botão: `background: background.secondary, border: 0.5px solid border.soft, borderRadius: 14, padding: 10px 12px`

Ao clicar: `console.log('[GLPY] share_{platform}')`

## Botão Principal

- texto: "Salvar imagem"
- variante: primary
- tamanho: lg
- fullWidth: true
- Ao clicar: `console.log('[GLPY] save_visual_progress_mockup')`

---

# Comportamento

## Estado local

Nenhum estado local neste MVP (tela estática de visualização).

## Ao compartilhar

```
console.log('[GLPY] share_cell')
console.log('[GLPY] share_whatsapp')
console.log('[GLPY] share_instagram')
console.log('[GLPY] share_tiktok')
```

## Ao salvar imagem

```
console.log('[GLPY] save_visual_progress_mockup')
```

- sem html2canvas ainda
- sem Firestore
- sem Storage
- sem compartilhamento real

---

# MVP Placeholder

Todos os dados exibidos são fixos no MVP e futuramente virão do perfil real do usuário:

- Protocolo: Anti-Rebote · Sem. 3
- Datas: Mar 2025 / Mai 2025
- Stats: −15,8 kg / 87→71 / 94→78
- Resumo: −15,8 kg eliminados / −16 cm cintura / 63 dias / Anti-Rebote Sem. 3

---

# Observação de Segurança

O compartilhamento é sempre opcional e emocionalmente seguro.
O GLPY não pressiona o usuário a expor seu progresso publicamente.
Dados exibidos são informados pelo próprio usuário — não avaliados ou certificados pelo GLPY.

---

# Observação Futura

Futuramente esta tela poderá:

- gerar imagem real para story/status/feed usando html2canvas
- usar fotos reais do usuário (PhotoTimelineScreen → Storage)
- usar dados reais do perfil: peso, cintura, protocolo, semana atual
- exportar story cards em diferentes formatos (quadrado, vertical 9:16)
- ter variantes de layout: minimal, full stats, só foto
- integrar com PhotoTimelineScreen para o fluxo completo de progresso visual

No MVP, todos os dados e ações são mockados.

---

# Arquivo Implementado

src/screens/operational/VisualProgressShareScreen.tsx

---

# Rota Preview

http://localhost:3000/preview/visual-progress-share

Rota isolada — App.tsx não é montado nessa rota.
Implementada via dynamic import em src/main.tsx.

---

# Observação Oficial

Esta tela é a referência visual premium para compartilhamento de progresso do GLPY-V1.

O padrão LIGHT PREMIUM (tela base) + DARK PREMIUM (card interno) é a referência para futuras telas híbridas que combinam contexto operacional com impacto emocional.

O pattern de story card (background #0A1628, stats strip via gap 1px, fotos com alignItems: end, arrow ring via boxShadow) é a referência oficial para cards de conquista e compartilhamento.

A logo oficial `assets/logos/logo-dark.png` deve ser sempre usada em contextos escuros dentro do app. Nunca substituir por SVG inline.

Não modificar esta tela sem nova solicitação explícita.

---

# Status Final

APPROVED — READY FOR MVP
