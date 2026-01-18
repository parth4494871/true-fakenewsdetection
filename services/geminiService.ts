import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, NewsSource } from "../types";

export const analyzeNewsAuthenticity = async (text: string): Promise<AnalysisResult> => {
  const apiKey = process.env.API_KEY;
  
  if (!apiKey) {
    throw new Error("API Key is missing. Please add 'API_KEY' to your Vercel Environment Variables.");
  }

  const ai = new GoogleGenAI({ apiKey });

  // Using gemini-3-pro-preview because it handles complex search grounding better than flash
  const modelName = 'gemini-3-pro-preview';

  const systemInstruction = `You are a high-precision news verification engine using BERT-style linguistic analysis and real-time data verification.
  
  CRITICAL RULES:
  1. For news after 2021, you MUST use Google Search to verify current facts.
  2. Analyze writing style for "Fake News" indicators: hyperbolic adjectives, clickbait phrasing, or lack of attribution.
  3. If search results confirm the story from multiple reputable outlets (AP, Reuters, BBC, etc.), mark as REAL.
  4. If search reveals it as a debunked hoax or provides no evidence for a major claim, mark as FAKE.`;

  const response = await ai.models.generateContent({
    model: modelName,
    contents: `Examine this news content and perform a fact-check using search: "${text}"`,
    config: {
      systemInstruction,
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          verdict: {
            type: Type.STRING,
            description: "Exactly 'REAL' or 'FAKE'",
          },
          confidence: {
            type: Type.NUMBER,
            description: "Percentage score (0-100)",
          },
          explanation: {
            type: Type.STRING,
            description: "Why it was flagged as real/fake, citing search findings if applicable",
          },
          sourceReliability: {
            type: Type.STRING,
            description: "Analysis of the linguistic structure and source credibility",
          },
          linguisticMarkers: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Patterns like 'Fact Checked', 'Loaded Language', 'Verified Event'",
          },
        },
        required: ["verdict", "confidence", "explanation", "sourceReliability", "linguisticMarkers"],
      },
    },
  });

  if (!response.text) {
    throw new Error("The AI engine did not return a response. Try again.");
  }

  const result = JSON.parse(response.text.trim()) as AnalysisResult;

  // Extract search citations to show the user the proof
  const sources: NewsSource[] = [];
  const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
  
  if (groundingChunks) {
    groundingChunks.forEach((chunk: any) => {
      if (chunk.web && chunk.web.uri) {
        sources.push({
          title: chunk.web.title || "News Reference",
          url: chunk.web.uri
        });
      }
    });
  }

  // Remove duplicate URLs
  const uniqueSources = Array.from(new Map(sources.map(item => [item.url, item])).values());

  return {
    ...result,
    sources: uniqueSources
  };
};