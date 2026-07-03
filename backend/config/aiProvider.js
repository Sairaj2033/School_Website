require("dotenv").config();
const Groq = require("groq-sdk");

if (!process.env.GROQ_API_KEY) {
  console.error("❌ GROQ_API_KEY is missing from environment variables.");
}

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function getAIResponse(systemPrompt, history, userMessage) {
  const messages = [
    { role: "system", content: systemPrompt },
    ...history.map((h) => ({
      role: h.role === "user" ? "user" : "assistant",
      content: h.text,
    })),
    { role: "user", content: userMessage },
  ];

  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile", // fast + strong free-tier model on Groq
    messages,
    temperature: 0.4,
    max_tokens: 512,
    response_format: { type: "json_object" }, // forces valid JSON, like Gemini's responseMimeType
  });

  // Return a raw string — chatController.js owns parsing/validation.
  return completion.choices[0]?.message?.content?.trim() || "";
}

module.exports = { getAIResponse };