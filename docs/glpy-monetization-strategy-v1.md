# Estratégia de Monetização e Planos — GLPY

Status: **OFFICIAL DOCUMENT**  
Versão: **V1**  
Data: **2026-05-20**  

---

## 💎 1. Estrutura de Assinatura do MVP

Para o lançamento do MVP, a GLPY simplificou radicalmente sua grade de planos comerciais. A complexidade de tabelas com múltiplos planos (Starter, Plus, Pro, Top) foi ocultada para reduzir a fadiga de decisão no momento do checkout e aumentar a taxa de conversão direta.

### 💰 Modelo de Entrada Único e Canal de Vendas (Kiwify)
*   **Produto/Oferta:** GLPY Anti-Rebote — Acesso Fundador (Protocolo Anti-Rebote + Aplicativo GLPY incluso).
*   **Preço Cheio:** R$ 29,90/mês.
*   **Mecânica de Incentivo:** Cupom fundador ativo na Kiwify aplicando **40% de desconto** na primeira mensalidade.
*   **Valor do Primeiro Mês (Promocional com Cupom):** R$ 17,94.
*   **Recorrência Subsequente (Após o 1º mês):** R$ 29,90/mês (renovação automática automática).

### ⚙️ Decisão Operacional de Checkout (Kiwify)
Com foco em velocidade e segurança absoluta no lançamento até sexta-feira, a operação de faturamento adotará as seguintes regras de integração:

1.  **Reaproveitamento do Produto Existente:** Em vez de registrar um novo produto, a operação utilizará o produto/plano Kiwify ativo e funcional.
2.  **Mitigação de Quebra de Webhook:** Essa decisão impede a necessidade de criar e reconfigurar novos endpoints de Webhook com o Firebase, preservando 100% o fluxo já testado de liberação de credenciais de acesso automático.
3.  **Gatilho de Contingência:** Apenas será criado um novo produto do zero se o plano atual inviabilizar a configuração da mecânica de cupons de primeiro mês ou se o webhook existente estiver comprovadamente corrompido e irreparável a tempo.
4.  **Protocolo Mandatório de Validação:** Antes de qualquer liberação de vendas ao público, deve ser executada uma compra simulada completa aplicando o cupom para certificar a esteira de: *Checkout mobile -> Aplicação de cupom de 40% OFF -> Disparo de Webhook -> Liberação Automática de Credenciais de Acesso no Banco -> Onboarding sem atritos*.

---

## 🚫 2. Congelamento dos 4 Planos no MVP

A infraestrutura técnica existente mapeada em `firestore.ts` e `App.tsx` possui referências internas a quatro níveis de assinatura (`starter`, `plus`, `pro`, `top`) que limitam o número de mensagens de IA e o envio diário de fotos:
*   **Starter:** 10 msgs IA/mês, 3 fotos/dia.
*   **Plus:** 20 msgs IA/mês, 6 fotos/dia.
*   **Pro:** 30 msgs IA/mês, 9 fotos/dia.
*   **Top:** 999 msgs IA/mês, ilimitadas fotos/dia.

### 🛡️ Regra de Preservação e Blindagem de Código para o MVP

> [!IMPORTANT]
> **RESTRUTURAÇÃO DO CHECKOUT PROIBIDA**
> Para garantir conformidade com o cronograma agressivo do MVP, o fluxo de desenvolvimento técnico do aplicativo deve cumprir estritamente as regras abaixo:
>
> 1.  **Sem Alteração no Back-end/Firestore:** Os níveis antigos continuarão existindo e sendo validados no Firestore para evitar quebras no banco de dados e bugs inesperados em produção.
> 2.  **Ocultação Estrita na Interface (UI):** O checkout do MVP não exibirá seletores ou tabelas complexas com estes quatro planos legados. A interface de compra exibirá uma experiência unificada e simplificada baseada na copy oficial do Membro Fundador.
> 3.  **Sem Alterações em Código de Faturamento:** Não alterar arquivos de lógica financeira ou de comunicação de gateway. Toda a conversão comercial será baseada em ofertas estáticas no marketing e na aplicação do cupom fundador ("FUNDADOR") configurado de forma externa ou estática, mantendo o ecossistema original intocado.
> 4.  **Calibração do Perfil Padrão:** Todos os novos membros fundadores receberão por trás das cortinas uma calibração padrão de limites de uso que garanta uma excelente experiência de uso metabólico (por exemplo, associados ao perfil comercial `starter` ou `plus` no banco de dados, com liberação temporária se necessário).

---

## 🚀 3. Visão de Futuro: Premium Pass (Pós-MVP)

A estratégia de monetização do GLPY é desenhada em escadas de valor de upsell (LTV incremental). Após o lançamento do MVP com oferta única, as seguintes camadas de receita serão implementadas no roadmap pós-MVP:

### 🛍️ A. GLPY Store (E-commerce Metabólico Contextual)
Venda inteligente de produtos físicos e suplementos de alta qualidade diretamente relacionados ao protocolo ativo do usuário, sugeridos no momento exato de necessidade pela GLPY.IA:
*   *Whey Protein Isolado de Alta Biodisponibilidade:* Preservação de massa magra.
*   *Eletrólitos GLPY:* Combate à desidratação e à fadiga.
*   *Magnésio Quelato Premium:* Controle da compulsão noturna e insônia.

### 🤝 B. Células Patrocinadas (Sponsorships & Mentoria)
Salas de bate-papo exclusivas da Comunidade gerenciadas por médicos especialistas, nutricionistas ou personalidades de destaque no mundo do emagrecimento saudável, acessíveis mediante taxa mensal adicional ou compra de passe.

### 📊 C. Testes Metabólicos e Kits de Acompanhamento
Envio de kits físicos de acompanhamento contendo fitas medidoras de cetose, balanças corporais de bioimpedância integradas via Bluetooth e relatórios periódicos avançados impressos de evolução de gordura visceral.
