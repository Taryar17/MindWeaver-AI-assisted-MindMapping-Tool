import { GoogleGenAI } from "@google/genai";

import dotenv from "dotenv";

dotenv.config();
// The client gets the API key from the environment variable `GEMINI_API_KEY`.

async function main() {
  const ai = new GoogleGenAI({
    apiKey: process.env.VERTEX_API_KEY,
    vertexai: true,
  });
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: `Example Prompt`,
  });
  console.log(response.text);
}

main();
