
// pages/api/chefai.js

// pages/api/chefai.js
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Mets ta clé dans .env.local
});
//
      }

      const systemPrompt = `
Tu es Chef-AI pour AstroFood Premium Gold. 
Tu génères des recettes courtes et claires, adaptées :
- au signe astrologique,
- à l'état énergétique,
- au type de repas,
- à la langue demandée.

Tu DOIS répondre exclusivement au format JSON suivant, sans texte autour :

{
  "recipes": [
    {
      "title": "string",
      "preparation": "string",
      "energy": "string",
      "time": "string"
    },
    {
      "title": "string",
      "preparation": "string",
      "energy": "string",
      "time": "string"
    },
    {
      "title": "string",
      "preparation": "string",
      "energy": "string",
      "time": "string"
    }
  ]
}

- "title" : nom de la recette
- "preparation" : explication courte (préparation + cuisson) en 3-6 phrases max
- "energy" : phrase courte qui résume le ressenti ou le bénéfice énergétique
- "time" : temps estimé (ex: "20 min" ou "10-15 min")
- Langue du texte : selon le code de langue (fr, en, ar).
`;

      const userPrompt = `
Génère 3 recettes au format demandé.

Contexte :
- signe astrologique : ${sign}
- état énergétique : ${state || "non précisé"}
- type de repas : ${mealType}
- langue : ${lang}
`;

      const completion = await client.chat.completions.create({
        model: "gpt-4.1-mini", // ou un autre modèle disponible dans ton compte
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      });

      const raw = completion.choices[0]?.message?.content || "{}";
      let parsed;
      try {
        parsed = JSON.parse(raw);
      } catch (e) {
        console.error("JSON parse error, raw content:", raw);
        // fallback simple si jamais le JSON est mal formé
        parsed = {
          recipes: [
            {
              title: "Recette AstroFood",
              preparation:
                "Une recette générée par l’IA, mais le format JSON a posé problème. Vérifie la console du backend.",
              energy: "Énergie équilibrée.",
              time: "~",
            },
          ],
        };
      }

      return res.status(200).json({
        ok: true,
        mode: "recipes",
        sign,
        state,
        mealType,
        lang,
        recipes: parsed.recipes || [],
      });
    }

    // --- 2) MODE CHAT (chat flottant Chef-AI) ---
    if (mode === "chat") {
      if (!message) {
        return res.status(400).json({ error: "Missing message for chat mode" });
      }

      const systemChat = `
Tu es Chef-AI dans la bulle de chat d'AstroFood Premium Gold.
Tu réponds de façon courte, chaleureuse, concrète. 
Tu peux parler de recettes, de préparation, d’idées de menus en fonction du signe et de l’état demandé.
Réponse en : ${lang || "fr"}.
`;

      const completionChat = await client.chat.completions.create({
        model: "gpt-4.1-mini",
        messages: [
          { role: "system", content: systemChat },
          {
            role: "user",
            content: `Signe astrologique : ${sign || "non précisé"}.\nQuestion de l'utilisateur : ${message}`,
          },
        ],
      });

      const reply = completionChat.choices[0]?.message?.content || "";

      return res.status(200).json({
        ok: true,
        mode: "chat",
        message: reply,
      });
    }

    // --- 3) Fallback si mode inconnu ---
    return res.status(400).json({ error: "Unknown mode" });
  } catch (err) {
    console.error("Error in /api/chefai:", err);
    return res.status(500).json({ error: "Server error", details: String(err) });
  }
}
