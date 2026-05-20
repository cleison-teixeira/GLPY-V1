# GLPY — Ações Rápidas / QuickActionsScreen V1

Status: APPROVED — READY FOR MVP
Version: V1
Date: 2026-05-20

---

# Nome da Tela

Ações rápidas / QuickActionsScreen

---

# Objetivo

Criar a tela de Ações Rápidas do GLPY-V1, funcionando como hub operacional premium aberto pelo botão central “+” da navegação inferior, permitindo acesso imediato aos registros principais da jornada do usuário. 

A tela foi simplificada para seguir o princípio “menos é mais”, garantindo uma interface clara, limpa, mobile-first e focada em respostas imediatas e sem fricção.

---

# Aviso de Segurança e Escopo

- **Aviso Oficial:** Ações inteligentes, progresso consolidado do dia e conteúdo mais emocional serão tratados futuramente na HomeScreen/TodayScreen. A tela de Ações Rápidas serve unicamente como direcionador imediato de inputs operacionais.
- **Escopo MVP:** No MVP, os cliques em ações e a navegação pelo rodapé são mockados localmente via instruções `console.log`.

---

# Tema Oficial

LIGHT PREMIUM

Sistema: Operational  
Categoria: Operacional Diário

---

# Componentes Usados

- `GLPYScreen` (variant: light) — Componente base de tela no padrão Light Premium.
- `GLPYHeader` — Título centralizado "Ações rápidas" + botão de voltar (`onBack`).
- `GLPYCard` (variant: light) × 3 — Containers minimalistas para os blocos de recomendação e dica:
  - Card 1: Recomendado agora (Check-in diário destacado com borda verde metabólica e Sparkles)
  - Card 2: Dica GLPY (Apoio textual com ícone de lâmpada e fundo verde sutil)
- Grid de registros compactos (`GridItem`) × 10 — Elementos fluidos de 2 colunas com bordas suaves, radius premium e ícones verdes discretos:
  1. **Peso** (subtext: "Registrar peso") $\rightarrow$ `open_current_weight`
  2. **Água** (subtext: "Hidratação") $\rightarrow$ `open_water`
  3. **Refeição** (subtext: "Registrar refeição") $\rightarrow$ `open_food_log`
  4. **Aplicação** (subtext: "Registrar dose") $\rightarrow$ `open_injection`
  5. **Sintomas** (subtext: "Sintomas") $\rightarrow$ `open_side_effects`
  6. **Emoção** (subtext: "Como você está?") $\rightarrow$ `open_emotion`
  7. **Atividade** (subtext: "Registrar treino") $\rightarrow$ `open_activity`
  8. **Medidas** (subtext: "Registrar medidas") $\rightarrow$ `open_body_measurements`
  9. **Foto corporal** (subtext: "Evolução") $\rightarrow$ `open_photo_timeline`
  10. **Check-in** (subtext: "Resumo do dia") $\rightarrow$ `open_check_in`
- Mocked Bottom Navigation — Rodapé flutuante simulado.

---

# Estrutura da Tela

## Topo e Subtítulo
- Título principal no `GLPYHeader`: "Ações rápidas"
- Subtítulo curto abaixo do header: "Registre sua jornada em poucos segundos."

## Card Recomendado
- Borda lateral esquerda verde (`brand.green` `#6AD28F`).
- Destaque: `"RECOMENDADO AGORA"` em caixa alta secundária.
- Ação: `"Concluir check-in diário"`
- Texto auxiliar: `"Feche sua rotina e mantenha sua sequência ativa."`
- Ícone à direita: `Sparkles` verde.

## Grid de Ações Rápidas
- Exibição de 10 cards em 2 colunas responsivas, ocupando 100% da largura, com `min-width: 0` e `box-sizing: border-box` para eliminar qualquer possibilidade de overflow horizontal em aparelhos celulares de 390px a 430px.
- Cada card inclui ícone discreto à esquerda, título do registro, subtexto compacto otimizado e chevron à direita.

## Dica GLPY
- Texto de incentivo: `"Pequenos registros ajudam a GLPY IA a entender melhor sua jornada e encontrar padrões ao longo do tempo."`
- Ícone: `Lightbulb` verde.

---

# Comportamento e Navegação

- **Cliques no Grid de Ações**:
  - Disparam comandos de console mapeados de forma clara para depuração e expansão futura.
- **Observação Importante sobre o Rodapé (Bottom Navigation)**:
  - O Bottom Navigation atual da `QuickActionsScreen` é apenas mockado para preview e não deve ser considerado como o rodapé final.
  - O rodapé final será implementado de forma global no App Shell sob o arquivo:  
    `src/components/navigation/GLPYBottomNav.tsx`
  - Este componente global padronizará e unificará os acessos a: Home, Protocolos, Ações, Progresso e Perfil com foto/avatar.

---

# Conexões Futuras (Pós-MVP)

- **WeightTrackingEngine / DailyTrackingEngine**: Para obter pesos em tempo real, refeições e dados de hidratação.
- **ProgressEngine / PhotoEngine**: Para renderizar fotos reais no antes/depois e calcular o ritmo metabólico.
- **XP/Streak Engine**: Para sincronizar e acumular recompensas por consistência e dias de sequência ativa.
- **GLPY IA**: Para sugerir novos marcos realistas baseados na evolução.
- **App Shell Navigation**: Para abrir modais nativos ou páginas operacionais ao clicar nas ações rápidas.

---

# Arquivo Implementado

src/screens/premium/QuickActionsScreen.tsx

---

# Rota Preview

http://localhost:3000/preview/quick-actions

---

# Observação Oficial

Esta tela é o padrão oficial de Hub de Registro Light Premium para o ecossistema GLPY.
Telas adicionais abertas a partir deste hub continuam o padrão Light Premium estabelecido para ações cotidianas.

Não alterar essa tela sem nova solicitação explícita.

---

# Status Final

APPROVED — READY FOR MVP
