import type { VercelRequest, VercelResponse } from "@vercel/node";

const NUTRITION: Record<string, { kcal: number; protein: number; carbs: number; fat: number }> = {
  "rice":            { kcal: 350, protein: 7,  carbs: 77, fat: 1  },
  "chicken":         { kcal: 280, protein: 38, carbs: 0,  fat: 12 },
  "beef":            { kcal: 320, protein: 32, carbs: 0,  fat: 20 },
  "fish":            { kcal: 220, protein: 34, carbs: 0,  fat: 9  },
  "egg":             { kcal: 180, protein: 18, carbs: 1,  fat: 12 },
  "salad":           { kcal: 80,  protein: 4,  carbs: 10, fat: 3  },
  "pizza":           { kcal: 580, protein: 22, carbs: 68, fat: 22 },
  "burger":          { kcal: 650, protein: 28, carbs: 52, fat: 35 },
  "pasta":           { kcal: 420, protein: 14, carbs: 72, fat: 8  },
  "bread":           { kcal: 260, protein: 8,  carbs: 50, fat: 3  },
  "soup":            { kcal: 180, protein: 9,  carbs: 22, fat: 5  },
  "steak":           { kcal: 380, protein: 42, carbs: 0,  fat: 22 },
  "sushi":           { kcal: 280, protein: 18, carbs: 38, fat: 5  },
  "sandwich":        { kcal: 380, protein: 18, carbs: 44, fat: 14 },
  "potato":          { kcal: 310, protein: 5,  carbs: 60, fat: 8  },
  "french fries":    { kcal: 420, protein: 5,  carbs: 52, fat: 22 },
  "yogurt":          { kcal: 180, protein: 18, carbs: 20, fat: 4  },
  "fruit":           { kcal: 90,  protein: 1,  carbs: 22, fat: 0  },
  "vegetable":       { kcal: 70,  protein: 3,  carbs: 12, fat: 1  },
  "cheese":          { kcal: 280, protein: 16, carbs: 2,  fat: 22 },
  "default":         { kcal: 300, protein: 15, carbs: 35, fat: 10 },
};

function estimateNutrition(dish: string) {
  const lower = dish.toLowerCase();
  for (const key of Object.keys(NUTRITION)) {
    if (key !== "default" && lower.includes(key)) return NUTRITION[key];
  }
  return NUTRITION["default"];
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { image } = req.body as { image?: string };
  if (!image) {
    return res.status(400).json({ error: "image (base64) é obrigatório" });
  }

  const apiKey = process.env.CLARIFAI_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "CLARIFAI_KEY não configurada" });
  }

  let clarifaiRes: Response;
  try {
    clarifaiRes = await fetch(
      "https://api.clarifai.com/v2/models/food-item-recognition/outputs",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Key ${apiKey}`,
        },
        body: JSON.stringify({
          user_app_id: {
            user_id: "liooci6xyo4n",
            app_id: "glpy-food-recognition",
          },
          inputs: [{ data: { image: { base64: image } } }],
        }),
      }
    );
  } catch (e) {
    console.error("CLARIFAI FETCH ERROR:", e);
    return res.status(502).json({ error: "Falha ao conectar com Clarifai" });
  }

  if (!clarifaiRes.ok) {
    const errText = await clarifaiRes.text();
    console.error("CLARIFAI ERROR:", errText);
    return res.status(clarifaiRes.status).json({ error: errText });
  }

  const data = await clarifaiRes.json();
  const concepts: { name: string; value: number }[] =
    data?.outputs?.[0]?.data?.concepts ?? [];

  console.log("CLARIFAI CONCEPTS:", concepts.slice(0, 5));

  const dish = concepts[0]?.name ?? "unknown";
  const nutrition = estimateNutrition(dish);

  return res.status(200).json({
    dish,
    kcal:    nutrition.kcal,
    protein: nutrition.protein,
    carbs:   nutrition.carbs,
    fat:     nutrition.fat,
  });
}
