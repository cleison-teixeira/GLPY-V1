import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { imageBase64, prompt } = req.body as { imageBase64?: string; prompt?: string };

  if (!imageBase64 || !prompt) {
    return res.status(400).json({ error: "imageBase64 e prompt são obrigatórios" });
  }

  const apiKey = process.env.ANTHROPIC_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "ANTHROPIC_KEY não configurada" });
  }

  const anthropicRes = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-5-20250929",
      max_tokens: 400,
      messages: [{
        role: "user",
        content: [
          { type: "image", source: { type: "base64", media_type: "image/jpeg", data: imageBase64 } },
          { type: "text", text: prompt },
        ],
      }],
    }),
  });

  if (!anthropicRes.ok) {
    const err = await anthropicRes.text();
    return res.status(anthropicRes.status).json({ error: err });
  }

  const data = await anthropicRes.json();
  const raw = data.content?.[0]?.text ?? "";
  console.log("RAW RESPONSE:", raw);
  try {
    const cleaned = raw.replace(/```json|```/g, "").trim();
    console.log("PARSED:", JSON.parse(cleaned));
  } catch (e) {
    console.log("PARSE ERROR:", e);
  }
  return res.status(200).json(data);
}
