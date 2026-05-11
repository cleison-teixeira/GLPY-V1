import type { VercelRequest, VercelResponse } from "@vercel/node";

async function compressImage(base64: string): Promise<string> {
  try {
    const sharp = (await import("sharp")).default;
    const buffer = Buffer.from(base64, "base64");
    const compressed = await sharp(buffer)
      .resize(800, 800, { fit: "inside", withoutEnlargement: true })
      .jpeg({ quality: 80 })
      .toBuffer();
    return compressed.toString("base64");
  } catch {
    console.log("COMPRESS SKIP: sharp não disponível, usando imagem original");
    return base64;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { imageBase64: rawImage, prompt } = req.body as { imageBase64?: string; prompt?: string };

  if (!rawImage || !prompt) {
    return res.status(400).json({ error: "imageBase64 e prompt são obrigatórios" });
  }

  console.log("IMAGE SIZE:", rawImage.length, "chars");

  const imageBase64 = rawImage.length > 5_000_000
    ? await compressImage(rawImage)
    : rawImage;

  if (rawImage.length > 5_000_000) {
    console.log("IMAGE COMPRESSED TO:", imageBase64.length, "chars");
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
    console.log("PARSED:", JSON.parse(cleaned));
  } catch (e) {
    console.log("PARSE ERROR:", e);
  }
  return res.status(200).json(data);
}
