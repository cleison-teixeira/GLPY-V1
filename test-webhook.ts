/**
 * Script de teste do webhook Kiwify.
 * Envia um payload real para o endpoint de produção e exibe o resultado.
 *
 * Uso:
 *   npm run test:webhook            → produção (https://glpy.com.br)
 *   npm run test:webhook:local      → local (http://localhost:3000, requer vercel dev)
 *   npx tsx test-webhook.ts [--local]
 */

const isLocal = process.argv.includes("--local");
const BASE_URL = isLocal ? "http://localhost:3000" : "https://glpy.com.br";
const TOKEN = "glpy_kiwify_2026";
const URL_WEBHOOK = `${BASE_URL}/api/kiwify-webhook?token=${TOKEN}`;

const PAYLOAD = {
  event: "purchase.approved",
  order_id: `test_order_${Date.now()}`,
  approved_date: new Date().toISOString(),
  Customer: {
    full_name: "Teste Webhook",
    email: "teste-webhook-glpy@gmail.com",
    mobile: "11999999999",
  },
  Product: {
    product_id: "prod_test_001",
    name: "GLPY Plus",
  },
  Subscription: {
    id: "sub_test_123",
    status: "active",
    charge_frequency: "monthly",
  },
};

async function run() {
  console.log("─".repeat(50));
  console.log("🧪  GLPY — Teste do Webhook Kiwify");
  console.log("─".repeat(50));
  console.log(`📍 Destino : ${URL_WEBHOOK}`);
  console.log(`📦 Evento  : ${PAYLOAD.event}`);
  console.log(`👤 Email   : ${PAYLOAD.Customer.email}`);
  console.log(`🛍  Produto : ${PAYLOAD.Product.name}`);
  console.log("─".repeat(50));

  let res: Response;
  try {
    res = await fetch(URL_WEBHOOK, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(PAYLOAD),
    });
  } catch (err) {
    console.error("❌ Erro de rede:", (err as Error).message);
    if (isLocal) {
      console.error("   Certifique-se de que `vercel dev` está rodando na porta 3000.");
    }
    process.exit(1);
  }

  const rawBody = await res.text();
  let body: unknown;
  try {
    body = JSON.parse(rawBody);
  } catch {
    body = rawBody;
  }

  const ok = res.status >= 200 && res.status < 300;
  console.log(`\n${ok ? "✅" : "❌"} Status : ${res.status} ${res.statusText}`);
  console.log(`📄 Body   :`, JSON.stringify(body, null, 2));

  if (res.status === 200) {
    const b = body as Record<string, unknown>;
    if (b.ok === true) {
      console.log("\n📌 Resultado esperado:");
      console.log("   • Usuário criado ou atualizado no Firebase Auth + Firestore");
      console.log(`   • Plano salvo como { tipo: "plus", status: "active", origem: "kiwify" }`);
      console.log(`   • Email enviado para ${PAYLOAD.Customer.email}`);
      console.log("   • primeiroAcesso: true (se usuário novo)");
    } else if (b.ignored === true) {
      console.log("\n⚠️  Evento ignorado pelo webhook (não tratado).");
    }
  } else if (res.status === 401) {
    console.log("\n⚠️  Token inválido. Verifique VALID_TOKENS no webhook.");
  } else if (res.status === 500) {
    console.log("\n💥 Erro interno. Verifique os logs do Vercel:");
    console.log("   vercel logs --follow");
  }

  console.log("\n" + "─".repeat(50));
}

run();
