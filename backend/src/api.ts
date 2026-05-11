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
    contents: `
You are given a mind map represented in tab-delimited format with columns:
node_id\tparent_id\tlabel

The current mind map is:

node_id\tparent_id\tlabel
1\tNULL\tCar
2\t1\tEngine
3\t2\tFuel System
4\t2\tCooling System
5\t1\tSafety
6\t5\tAirbags
7\t5\tABS
8\t1\tDesign
9\t8\tInterior
10\t8\tExterior

Task:
Based on the selected node "Engine" (node_id = 2), generate 5 contextually relevant new child nodes.

Return ONLY the output in tab-delimited format with columns:
node_id\tparent_id\tlabel

Do not include explanations or additional text.
`,
  });
  console.log(response.text);
}

main();
