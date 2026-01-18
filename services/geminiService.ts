
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, NewsSource } from "../types";

export const analyzeNewsAuthenticity = async (text: string): Promise<AnalysisResult> => {
  const apiKey = process.env.API_KEY;
  
  if (!apiKey) {
    throw new Error("API Key is not configured. Please add 'API_KEY' to your Vercel Environment Variables.");
  }

  const ai = new GoogleGenAI({ apiKey });

  const systemInstruction = `You are an advanced news verification engine. 
  Step 1: Use Google Search to verify the factual claims in the text, especially if the news is from 2022-2025.
  Step 2: Apply BERT-based linguistic analysis to detect misinformation patterns (hyperbole, bias, clickbait).
  Step 3: Compare findings and provide a verdict.
  
  If the news is very recent and you find matching reports from multiple reputable sources, mark as REAL.
  If the news contradicts current web data or looks like a fabricated story, mark as FAKE.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Analyze this news content for authenticity using live search verification: "${text}"`,
    config: {
      systemInstruction,
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          verdict: {
            type: Type.STRING,
            description: "Must be exactly 'REAL' or 'FAKE'",
          },
          confidence: {
            type: Type.NUMBER,
            description: "A confidence score from 0 to 100",
          },
          explanation: {
            type: Type.STRING,
            description: "A detailed breakdown of the factual and linguistic logic",
          },
          sourceReliability: {
            type: Type.STRING,
            description: "Analysis of the writing style and source verification results",
          },
          linguisticMarkers: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Markers identified (e.g., 'Factually Verified', 'Sensationalism', 'Contradictory')",
          },
        },
        required: ["verdict", "confidence", "explanation", "sourceReliability", "linguisticMarkers"],
      },
    },
  });

  if (!response.text) {
    throw new Error("The AI model failed to generate a classification.");
  }

  const result = JSON.parse(response.text.trim()) as AnalysisResult;

  // Extract grounding sources from the response metadata
  const sources: NewsSource[] = [];
  const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
  
  if (groundingChunks) {
    groundingChunks.forEach((chunk: any) => {
      if (chunk.web && chunk.web.uri) {
        sources.push({
          title: chunk.web.title || "Reference Source",
          url: chunk.web.uri
        });
      }
    });
  }

  // Deduplicate sources by URL
  const uniqueSources = Array.from(new Map(sources.map(item => [item.url, item])).values());

  return {
    ...result,
    sources: uniqueSources
  };
};
