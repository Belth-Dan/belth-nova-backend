import express from "express";
import cors from "cors";
import Anthropic from "@anthropic-ai/sdk";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

app.get("/", (req, res) => {
  res.send("BELTH Nova backend is running");
});

app.post("/chat", async (req, res) => {
  try {
    const userMessage = req.body.message;

    if (!userMessage) {
      return res.status(400).json({ error: "Message is required" });
    }

    const response = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 700,
      system: `
Je bent Nova, de AI-assistent van BELTH AI Technology.

Je helpt bezoekers professioneel, vriendelijk en kort.
BELTH bouwt AI call systems, websites, dashboards, AI agents, workflow automation, QR ordering systems, klantenportalen, apps, firmware, BLE connectivity en OEM technology platforms.

BELTH helpt vooral:
- restaurants
- boekhoudkantoren
- huisartspraktijken
- advocatenkantoren
- notarissen
- servicebedrijven
- B2B-bedrijven
- OEM merken en fabrikanten

Antwoord altijd in dezelfde taal als de bezoeker.
Geef geen medisch, juridisch of financieel advies. Geef alleen algemene informatie en stel voor om een demo of gesprek te plannen.
Vraag indien nuttig naam, bedrijfstype, e-mail en telefoonnummer.
      `,
      messages: [
        {
          role: "user",
          content: userMessage,
        },
      ],
    });

    const answer = response.content[0].text;
    res.json({ reply: answer });
  } catch (error) {
    console.error("Nova error:", error);
    res.status(500).json({
      error: "Nova kan nu niet antwoorden. Probeer later opnieuw.",
    });
  }
});

app.listen(PORT, () => {
  console.log(`BELTH Nova backend running on port ${PORT}`);
});
