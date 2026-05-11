import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { imageBase64, prompt } = req.body as { imageBase64?: string; prompt?: string };

  if (!imageBase64 || !prompt) {
    return res.status(400).json({ error: "imageBase64 e prompt são obrigatórios" });
  }

  const apiKey = process.env.OPENAI_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "OPENAI_KEY não configurada" });
  }

  const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o",
      max_tokens: 400,
      messages: [{
        role: "user",
        content: [
          { type: "image_url", image_url: { url: `data:image/jpeg;base64,${imageBase64}` } },
          { type: "text", text: prompt },
        ],
      }],
    }),
  });

  if (!openaiRes.ok) {
    const err = await openaiRes.text();
    return res.status(openaiRes.status).json({ error: err });
  }

  const data = await openaiRes.json();
  return res.status(200).json(data);
}
