# GLPY — Weight Settings Screen V1

Status: APPROVED — READY FOR MVP
Version: V1
Date: 2026-05-19

---

# Nome da Tela

Weight Settings Screen

---

# Objetivo

Servir como hub operacional para edição dos dados metabólicos principais do usuário dentro do app.

Centraliza o acesso às telas de setup em mode="edit":

- Peso Atual → CurrentWeightScreen
- Altura → HeightScreen
- Peso Alvo → TargetWeightScreen
- Velocidade de Perda → WeightPaceScreen
- Unidades → UnitsScreen

---

# Tema Oficial

LIGHT PREMIUM

Sistema: Operational
Categoria: Configurações / Perfil

---

# Componentes Usados

- GLPYScreen (variant: light)
- GLPYHeader (com botão voltar + título)
- GLPYCard (variant: light, onClick) × 5 — cards editáveis
- SettingCard (componente local) — wrapper com hover e layout de linha

Todos os componentes base são de src/components/ui/.
Todos os tokens são de src/theme/.

---

# Estrutura da Tela

## Header

- botão voltar
- título: Configurações de Peso

## Lista de SettingCards (5 itens)

Cada card contém:
- ícone (36×36, fundo degradê verde claro)
- coluna de texto: label (small secondary) + valor (bodyDefault bold navy)
- chevron direito (ChevronRight) indicando editável

### Itens

| ID             | Label               | Valor                    | Ícone    | Tela destino          |
|----------------|---------------------|--------------------------|----------|-----------------------|
| current-weight | Peso Atual          | 80,0 kg                  | Scale    | CurrentWeightScreen   |
| height         | Altura              | 164 cm                   | Ruler    | HeightScreen          |
| target-weight  | Peso Alvo           | 58,0 kg                  | Target   | TargetWeightScreen    |
| weight-pace    | Velocidade de Perda | Equilibrada · 0,5 kg/sem | Activity | WeightPaceScreen      |
| units          | Unidades            | cm / kg                  | Globe    | UnitsScreen           |

---

# Comportamento

- Cada card ao ser clicado: console.log com o nome da tela destino e mode="edit"
- Hover: background muda para `#F7F8FA` (background.secondary) e chevron fica verde
- Hover gerenciado via div wrapper (GLPYCard não foi modificado)
- Sem navegação real ainda — conexão com telas reutilizáveis será implementada no fluxo de Perfil/Configurações

---

# Valores — Aviso Oficial MVP

Os valores exibidos (80,0 kg, 164 cm, 58,0 kg, etc.) são PLACEHOLDERS do MVP.
No futuro virão do perfil real do usuário (Firebase/estado global).
O comentário `// MVP PLACEHOLDER` está presente no array `SETTINGS_ITEMS` do arquivo implementado.

---

# Arquivo Implementado

src/screens/operational/WeightSettingsScreen.tsx

---

# Rota Preview

http://localhost:3000/preview/weight-settings

Rota isolada — App.tsx não é montado nessa rota.
Implementada via dynamic import em src/main.tsx.

---

# Observação Oficial

Esta tela é o hub operacional Light Premium para edição dos dados metabólicos principais.

Ela conecta conceitualmente as 5 telas reutilizáveis de setup metabólico do onboarding:
CurrentWeightScreen, HeightScreen, TargetWeightScreen, WeightPaceScreen e UnitsScreen.

O padrão SettingCard (ícone + label/valor + chevron) é a referência para listas de configurações editáveis no sistema LIGHT PREMIUM.

Não modificar esta tela sem nova solicitação explícita.

---

# Status Final

APPROVED — READY FOR MVP
