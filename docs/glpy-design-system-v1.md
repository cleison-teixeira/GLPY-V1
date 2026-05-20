GLPY — DESIGN SYSTEM OPERACIONAL V1

Status: OFFICIAL DESIGN SYSTEM
Version: V1
Date: 2026-05-18

Objetivo do Documento

Este documento define:

sistema visual oficial
tokens visuais
componentes globais
regras de UI
padrões reutilizáveis
consistência operacional
comportamento visual universal

Toda interface do GLPY deve seguir este documento.

Filosofia Visual do GLPY

O GLPY deve parecer:

premium
humano
wellness
moderno
emocional
inteligente
cinematográfico
mobile-first

Nunca:

hospitalar
corporativo
frio
técnico demais
poluído
Estrutura Oficial do Design System

O sistema visual do GLPY é dividido em:

1. Light Premium System
2. Dark Premium System
3. Shared Components
4. Motion System
5. Typography System
6. Spacing System
1. LIGHT PREMIUM SYSTEM

Usado em:

onboarding
dashboards
tracking
inputs
progresso
resultados
operações diárias
Sensação Oficial

O usuário deve sentir:

leveza
clareza
segurança
wellness premium
simplicidade elegante
Backgrounds Oficiais
Primary Background
#FFFFFF
Secondary Background
#F7F8FA
Card Background
#FFFFFF
Cores Oficiais
GLPY Green
#6AD28F
GLPY Green Dark
#3FAE68
Navy Text
#16213E
Secondary Text
#6B7280
Border Soft
#E5E7EB
Sombras Oficiais
Card Shadow
0 8px 24px rgba(0,0,0,0.06)
Soft Shadow
0 4px 12px rgba(0,0,0,0.04)
Radius Oficial
Main Radius
24px
Secondary Radius
18px
2. DARK PREMIUM SYSTEM

Usado em:

protocolos
IA
HUB
comunidade
social
gamificação
experiências emocionais
Sensação Oficial

O usuário deve sentir:

cinematic wellness
imersão
profundidade
transformação
tecnologia emocional
Backgrounds Oficiais
Primary Dark
#0B1020
Secondary Dark
#121A2E
Card Dark
#161F36
Glow Colors
Metabolic Glow
#6AD28F
Purple Glow
#8B5CF6
Blue Glow
#3B82F6
Dark Shadows
Glow Shadow
0 0 32px rgba(106,210,143,0.25)
Deep Shadow
0 12px 40px rgba(0,0,0,0.45)
3. TYPOGRAPHY SYSTEM
Font Oficial
Primary Font
Inter

Fallback:

SF Pro Display
Headline Sizes
H1
32px
font-weight: 700
H2
28px
font-weight: 700
H3
22px
font-weight: 600
Body Sizes
Body Large
18px
Body Default
16px
Small Text
14px
4. SPACING SYSTEM
Padding Oficial
Screen Padding
24px
Card Padding
20px
Small Padding
12px
Gaps Oficiais
Large Gap
24px
Medium Gap
16px
Small Gap
8px
5. COMPONENT SYSTEM
Botões Oficiais
Primary Button

Características:

gradiente metabólico
radius 24px
altura 56px
glow leve
texto bold
Secondary Button

Características:

fundo branco/transparente
borda suave
sem glow forte
Cards Oficiais
Light Card

Características:

branco
radius 24px
sombra suave
muito respiro
Dark Card

Características:

glow leve
blur leve
transparência sutil
neon discreto
Inputs Oficiais
Regras

Sempre:

digitáveis
familiares
rápidos
clean

Nunca:

sliders exagerados
wheel pickers complexos
UX experimental
Input Oficial

Características:

fundo branco
radius 20px
altura 60px
texto grande
centralizado
Bottom Navigation Oficial

Características:

floating
radius grande
glassmorphism leve
glow ativo no item selecionado
6. MOTION SYSTEM
Regras Oficiais

Animações devem ser:

suaves
elegantes
rápidas
discretas
premium

Nunca:

exageradas
lentas
chamativas demais
Motion Oficial
Card Hover
scale(1.02)
Button Press
scale(0.98)
Screen Transition
fade + slide subtle
7. ÍCONES OFICIAIS

Estilo:

rounded
minimalista
Apple-like
clean
leve

Biblioteca sugerida:

lucide-react
8. REGRAS DE CONSISTÊNCIA

Toda nova tela deve:

seguir spacing oficial
seguir typography oficial
seguir radius oficial
seguir component system
respeitar light/dark system
parecer parte do mesmo ecossistema

Adicionalmente, toda nova tela criada no GLPY-V1 deve ser integrada na Central de Previews (src/screens/PreviewIndexScreen.tsx):
1. Criar rota preview isolada em src/main.tsx
2. Adicionar link correspondente na Central de Previews
3. Manter organização por categoria
4. Rodar npm run build
5. Confirmar que a tela aparece em /preview
Nunca Fazer

❌ cards diferentes em cada tela
❌ múltiplos estilos de botão
❌ tipografia inconsistente
❌ grids diferentes
❌ sombras diferentes
❌ glow exagerado

Estrutura Oficial de Pastas
src/
├── theme/
│   ├── colors.ts
│   ├── spacing.ts
│   ├── typography.ts
│   ├── shadows.ts
│   ├── radius.ts
│   └── motion.ts
│
├── components/
│   ├── buttons/
│   ├── cards/
│   ├── inputs/
│   ├── navigation/
│   └── layout/
Objetivo Estratégico Final

Criar um ecossistema visual:

consistente
reconhecível
premium
escalável
impossível de confundir com apps genéricos
Arquivo Oficial

Salvar em:

docs/glpy-design-system-v1.md
Status Final

OFFICIAL DESIGN SYSTEM — READY FOR IMPLEMENTATION
