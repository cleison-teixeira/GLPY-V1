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
            { type: "text", text: "Você é um nutricionista expert. Analise esta foto com MÁXIMA ATENÇÃO aos detalhes visuais.\n\nCRÍTICO: Identifique EXATAMENTE o que você VÊ:\n- Hambúrguer = pão + carne + vegetais em camadas\n- Omelete = ovos mexidos dobrados/enrolados\n- Salada = vegetais crus predominantes\n- Bowl = tigela com grãos/proteína misturados\n\nSeja ESPECÍFICO no nome: 'Hambúrguer artesanal com batata' não 'Omelete'.\n\nEstime macros realistas da porção fotografada.\n\nRetorne APENAS JSON limpo (sem markdown):\n{\"dish\":\"nome exato do prato\",\"kcal\":número,\"protein\":número,\"carbs\":número,\"fat\":número,\"review\":\"avaliação GLP-1 em 1 frase curta\"}" },
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
