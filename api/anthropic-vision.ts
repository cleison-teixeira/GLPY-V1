import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { image } = req.body as { image?: string };
  if (!image) {
    return res.status(400).json({ error: "image (base64) é obrigatório" });
  }

  const apiKey = process.env.ANTHROPIC_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "ANTHROPIC_KEY não configurada" });
  }

  let anthropicRes: Response;
  try {
    anthropicRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-5-20250514",
        max_tokens: 400,
        messages: [{
          role: "user",
          content: [
            { type: "image", source: { type: "base64", media_type: "image/jpeg", data: image } },
            { type: "text", text: "Analise esta foto de comida. Identifique o prato EXATAMENTE (ex: 'Hambúrguer com fritas', 'Salada Caesar', 'Omelete de queijo'). Estime macros por porção. Retorne APENAS JSON: {\"dish\":\"nome exato\",\"kcal\":N,\"protein\":N,\"carbs\":N,\"fat\":N,\"review\":\"avaliação GLP-1 em 1 frase\"}" },
          ],
        }],
      }),
    });
  } catch (e) {
    console.error("ANTHROPIC FETCH ERROR:", e);
    return res.status(502).json({ error: "Falha ao conectar com Anthropic" });
  }

  if (!anthropicRes.ok) {
    const errText = await anthropicRes.text();
    console.error("ANTHROPIC ERROR:", errText);
    return res.status(anthropicRes.status).json({ error: errText });
  }

  const data = await anthropicRes.json();
  const raw = data.content?.[0]?.text ?? "";
  console.log("RAW RESPONSE:", raw);

  try {
    const cleaned = raw.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleaned);
    return res.status(200).json(parsed);
  } catch (e) {
    console.error("PARSE ERROR:", e, "RAW:", raw);
    return res.status(500).json({ error: "Falha ao parsear resposta da IA", raw });
  }
}
