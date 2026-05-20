GLPY — SCREEN MAP V1

Status: OFFICIAL SCREEN ARCHITECTURE
Version: V1
Date: 2026-05-18

Objetivo do Documento

Este documento define:

arquitetura oficial das telas
organização estrutural do app
hierarquia oficial
separação LIGHT vs DARK
papel emocional de cada tela
tipo funcional de cada fluxo
relacionamento entre módulos
organização do MVP GLPY-V1

Este documento é a referência oficial de navegação e arquitetura visual.

Estrutura Oficial do GLPY-V1

O GLPY-V1 é dividido em:

1. Onboarding System
2. Operational System
3. Emotional System
4. Social System
5. Monetization System
1. ONBOARDING SYSTEM

Objetivo:

entrada no ecossistema
personalização inicial
redução de ansiedade
criação de compromisso emocional
Tema Oficial
LIGHT PREMIUM
Sensação
acolhimento
leveza
wellness premium
simplicidade
clareza
Telas Oficiais
Tela    Tema    Tipo
Welcome Screen    Light    Onboarding
Current Weight Screen    Light    Onboarding
Height Screen    Light    Onboarding
Target Weight Screen    Light    Onboarding
Weight Pace Screen    Light    Onboarding
Units Screen    Light    Onboarding
Goal Selection Screen    Light    Onboarding
Quiz Screen    Light    Onboarding
Quiz Result Screen    Light    Onboarding
Paywall Screen    Light    Monetization
2. OPERATIONAL SYSTEM

Objetivo:

tracking diário
inputs rápidos
acompanhamento
progresso
construção de hábito
Tema Oficial
LIGHT PREMIUM
Sensação
rapidez
simplicidade
controle
progresso
acompanhamento inteligente
Telas Oficiais
Tela    Tema    Tipo
Home Screen    Light    Dashboard
Results Screen    Light    Progress
Quick Actions Screen    Light    Operational
Water Screen    Light    Operational
Food Log Screen    Light    Operational
Injection Screen    Light    Operational
Emotion Screen    Light    Operational
Activity Screen    Light    Operational
Body Measurements Screen    Light    Operational
Photo Timeline Screen    Light    Operational
Check-in Screen    Light    Operational
Weight History Screen    Light    Progress
Progress Timeline Screen    Light    Progress
Profile Screen    Light    Profile
Settings Screen    Light    Settings
3. EMOTIONAL SYSTEM

Objetivo:

retenção emocional
continuidade
transformação
dopamina visual
jornada guiada
Tema Oficial
DARK PREMIUM
Sensação
cinematic wellness
transformação
imersão
profundidade emocional
experiência premium
Telas Oficiais
Tela    Tema    Tipo
Protocol Screen    Dark    Emotional
Internal Protocol Screen    Dark    Emotional
GLPY IA Screen    Dark    Emotional
GLPY HUB    Dark    Emotional
Challenges Screen    Dark    Gamification
Ranking Screen    Dark    Gamification
Achievements Screen    Dark    Gamification
4. SOCIAL SYSTEM

Objetivo:

pertencimento
suporte emocional
retenção social
comunidade viva
Tema Oficial
DARK PREMIUM
Sensação
comunidade premium
proximidade
acolhimento
tribo
ecossistema vivo
Telas Oficiais
Tela    Tema    Tipo
GLPY Células    Dark    Social
Group Chat Screen    Dark    Social
Community Feed Screen    Dark    Social
Ambassador Screen    Dark    Social
Creator Hub Screen    Dark    Social
5. MONETIZATION SYSTEM

Objetivo:

monetização contextual
aumento de LTV
expansão do ecossistema
experiência premium
Tema Oficial
DARK PREMIUM
Sensação
recomendação inteligente
wellness premium
lifestyle
personalização
Telas Oficiais
Tela    Tema    Tipo
GLPY Store    Dark    Monetization
Premium Upgrade Screen    Dark    Monetization
Subscription Screen    Light    Monetization
Referral Screen    Dark    Monetization
Estrutura Oficial de Navegação
Bottom Navigation Oficial
Ícone    Tela
🏠    Home
🛡    Protocolos
➕    Quick Actions
📈    Progresso
👤    Perfil
Fluxo Oficial do Usuário
Entrada

Welcome
↓
Peso Atual
↓
Altura
↓
Peso Alvo
↓
Velocidade
↓
Quiz
↓
Resultado
↓
Paywall
↓
Home

Fluxo Operacional Diário

Home
↓
Quick Actions
↓
Tracking
↓
Resultados
↓
Check-in
↓
IA

Fluxo Emocional

Home
↓
Protocolos
↓
Jornada Interna
↓
Comunidade
↓
Retenção

Fluxo Social

HUB
↓
Células
↓
Chat
↓
Desafios
↓
Ranking

Regras Oficiais
LIGHT PREMIUM

Usado quando:

o usuário precisa pensar rápido
o usuário está registrando dados
o usuário precisa clareza
o usuário está em fluxo operacional
DARK PREMIUM

Usado quando:

o usuário precisa sentir emoção
o usuário está consumindo conteúdo
o usuário está em retenção
o usuário está em experiência imersiva
Regras de Consistência

Toda nova tela deve respeitar:

Core System
UX Rules
Screen Map
Tema oficial da categoria
Psicologia oficial do GLPY

Adicionalmente, toda nova tela criada no GLPY-V1 deve ser integrada na Central de Previews (src/screens/PreviewIndexScreen.tsx):
1. Criar rota preview isolada em src/main.tsx
2. Adicionar link correspondente na Central de Previews
3. Manter organização por categoria
4. Rodar npm run build
5. Confirmar que a tela aparece em /preview
Estrutura Oficial de Pastas
assets/
└── screens/
    ├── onboarding/
    ├── operational/
    ├── emotional/
    ├── social/
    └── monetization/
Objetivo Estratégico Final

Transformar o GLPY em:

"o principal ecossistema de transformação metabólica e acompanhamento GLP-1 do mercado."

Arquivo Oficial

Salvar em:

docs/glpy-screen-map-v1.md
Status Final

OFFICIAL SCREEN ARCHITECTURE — READY FOR IMPLEMENTATION
