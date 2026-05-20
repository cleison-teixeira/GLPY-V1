# Estratégia de Oferta e Cupom Fundador — GLPY

Status: **OFFICIAL DOCUMENT**  
Versão: **V1**  
Data: **2026-05-20**  

---

## 🎯 1. Objetivo Estratégico da Oferta

O lançamento da oferta de **Membro Fundador** do GLPY foi desenhado para equilibrar três pilares vitais de crescimento e sustentabilidade no mercado de suporte a tratamentos GLP-1:
1.  **Redução Radical da Barreira de Entrada:** Permitir que o usuário experimente a potência dos protocolos e da GLPY.IA por um preço inicial extremamente convidativo.
2.  **Competitividade no Segmento de Assinaturas:** Posicionar o GLPY como a alternativa mais acessível e focada em relação a apps estrangeiros ou consultorias nutricionais caras.
3.  **Recorrência Saudável:** Garantir fluxo de caixa recorrente sustentável de longo prazo, evitando promessas de descontos vitalícios insustentáveis que canibalizam o valor do produto.

---

## 💰 2. Decisão Oficial de Precificação do MVP

Para o lançamento até sexta-feira, o modelo de precificação do MVP está unificado na seguinte oferta promocional:

*   **Preço Cheio do GLPY (Tabela Padrão):** R$ 29,90/mês.
*   **Oferta de Membro Fundador:** 40% de desconto aplicado exclusivamente no **primeiro mês** de assinatura.
*   **Preço Promocional do Primeiro Mês:** R$ 17,94 (com uso do cupom fundador).
*   **Preço Recorrente (Após o 1º mês):** R$ 29,90/mês.

> [!NOTE]
> A oferta fundador funciona como um convite emocional para que os primeiros usuários participem ativamente da construção e validação da plataforma GLPY.

---

## 📢 3. Regras de Comunicação e Copywriting

A consistência na comunicação da oferta é vital para manter a transparência legal e a percepção de alto valor da marca.

### ❌ O que NUNCA deve ser comunicado:
*   **NÃO** comunicar "Desconto Vitalício".
*   **NÃO** comunicar "50% de desconto para sempre".
*   **NÃO** exibir tabelas complexas com múltiplos planos (Starter/Plus/Pro/Top) na tela de pagamento durante o MVP (os planos antigos continuam congelados por trás das cortinas).

###  O que DEVE ser comunicado de forma cristalina:
*   O desconto de 40% é aplicado **apenas no primeiro mês** (R$ 17,94).
*   A partir do segundo mês, a assinatura é renovada automaticamente pelo valor padrão de **R$ 29,90/mês**.
*   A oferta principal do MVP é: **Protocolo Anti-Rebote + Aplicativo GLPY incluso**.

### ✍️ Copy Oficial Sugerida:
> **"Como membro fundador, você entra no GLPY por apenas R$ 17,94 no primeiro mês. Depois, sua assinatura continua por R$ 29,90/mês."**

---

## 🧠 4. Justificativa Estratégica da Oferta

*   **Redução da Barreira de Entrada:** O preço promocional de R$ 17,94 viabiliza a experimentação imediata do aplicativo, capturando usuários hesitantes que teriam atrito com valores superiores a R$ 25,00 no primeiro contato.
*   **Competitividade no Segmento de Assinaturas:** Posiciona o GLPY como uma alternativa de altíssimo valor e preço extremamente competitivo se comparado a aplicativos globais de wellness e acompanhamentos tradicionais.
*   **Recorrência Saudável e Sustentável:** A manutenção da mensalidade cheia de R$ 29,90/mês nos meses seguintes preserva o LTV (Lifetime Value) de longo prazo e a saúde financeira da operação, evitando a armadilha de descontos perpétuos que desgastam a margem de lucro.
*   **Sentimento de Co-criação (Pertencimento):** Ao se posicionar como "Membro Fundador", o usuário se sente parte de um clube exclusivo ajudando a moldar uma nova tecnologia de suporte metabólico.
*   **Foco no "Efeito Rebote":** O marketing focado no **Protocolo Anti-Rebote** resolve a maior dor de quem utiliza análogos de GLP-1. O app GLPY serve como canal oficial de suporte diário desse protocolo.
*   **Gatilho de Urgência:** A oferta fundador é estruturada como uma oportunidade única de acesso e cocriação reservada para os primeiros pioneiros da fase inicial do MVP.

---

## 🛡️ 5. Diretriz de Implementação Técnica (Blindagem do Código)

> [!WARNING]
> **RESTRUTURAÇÃO TÉCNICA RESTRITA — ZERO CÓDIGO**
> Para garantir a estabilidade absoluta do lançamento do MVP até sexta-feira, as seguintes diretrizes são de aplicação mandatória e compulsória para toda a engenharia de software:
> 1. **Zero Alterações de Código:** Nenhuma linha de código do aplicativo (`src/` ou congêneres) deve ser alterada.
> 2. **Zero Alterações de Checkout:** O fluxo de checkout no aplicativo permanece inalterado.
> 3. **Zero Alterações de Telas:** Nenhuma tela de pagamento ou faturamento interna deve ser alterada ou refatorada visualmente para este ciclo.
> 4. **Foco Exclusivo em Documentação:** O ajuste de precificação é operacionalizado exclusivamente na camada de faturamento externo (Kiwify) e na comunicação de marketing.

---

## 🛒 6. Decisão Operacional de Checkout (Kiwify)

Para assegurar o lançamento seguro e veloz até sexta-feira, adota-se a seguinte estratégia operacional de faturamento e integração com a plataforma Kiwify:

### ⚙️ Reaproveitamento de Produto e Webhook Legado
Em vez de configurar um produto totalmente novo na Kiwify, a operação do GLPY irá **reaproveitar o produto/plano existente** que já se encontra homologado e com webhook configurado e funcional.

*   **Justificativa Técnica:**
    *   **Minimização de Risco:** Evita o risco de quebra ou falha na entrega do webhook que sincroniza com o Firebase.
    *   **Velocidade Operacional:** Preserva o fluxo de liberação de acesso e criação de conta já configurado na esteira do banco de dados, poupando tempo crítico de reconfiguração de infraestrutura.
    *   **Estabilidade:** Evita reconfigurações desnecessárias que poderiam gerar latência de sincronização no onboarding do app.

*   **Modelo Operacional do Produto:**
    *   **Nome do Produto/Oferta:** GLPY Anti-Rebote — Acesso Fundador
    *   **Preço de Tabela Recorrente:** R$ 29,90/mês
    *   **Incentivo Fundador:** Cupom de 40% de desconto no primeiro mês
    *   **Preço no Primeiro Mês (com cupom):** R$ 17,94
    *   **Recorrência Subsequente:** R$ 29,90/mês

### 🧪 Protocolo de Homologação e Compra Teste
> [!IMPORTANT]
> **COMPULSÃO DE TESTE ANTES DA VENDA**
> Antes de abrir o carrinho ao público final, a equipe técnica e comercial deve executar uma compra teste utilizando o cupom fundador para validar toda a esteira de atendimento em 5 etapas fundamentais:
> 1. **Validação do Checkout:** Garantir que o link do checkout legado está abrindo sob HTTPS e com carregamento perfeito no mobile.
> 2. **Aplicação do Cupom:** Verificar se o cupom promocional fundador calcula e aplica exatamente os 40% de desconto na tela da Kiwify (fechando o valor de R$ 17,94 para o primeiro mês e informando a recorrência subsequente de R$ 29,90/mês).
> 3. **Sincronização de Webhook:** Confirmar que a Kiwify disparou o webhook de transação aprovada com sucesso.
> 4. **Liberação de Acesso:** Certificar-se de que o webhook gerou e liberou as credenciais de acesso do cliente de forma automática no banco.
> 5. **Onboarding & Entrada:** Garantir que o usuário simulado realiza a autenticação silenciosa automática e conclui o fluxo de Onboarding no app.

*   **Gatilho de Contingência:** A criação de um novo produto/plano do zero na Kiwify só será executada se a plataforma inviabilizar a configuração correta do cupom fundador no produto legado, ou se for tecnicamente comprovado que o webhook atual está corrompido e impossibilitado de recuperação imediata.
