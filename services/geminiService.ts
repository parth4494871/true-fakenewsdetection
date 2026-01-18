
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeNewsAuthenticity = async (text: string): Promise<AnalysisResult> => {
  const prompt = `Analyze the following news text for authenticity. 
  Pretend you are an advanced classifier model utilizing a BERT (Bidirectional Encoder Representations from Transformers) algorithm.
  Evaluate the text based on linguistic patterns, factual consistency, and common misinformation markers.
  
  News Text: "${text}"
  
  Provide a structured JSON response.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          verdict: {
            type: Type.STRING,
            description: "Must be either 'REAL' or 'FAKE'",
          },
          confidence: {
            type: Type.NUMBER,
            description: "Percentage score from 0 to 100",
          },
          explanation: {
            type: Type.STRING,
            description: "Brief summary of why this verdict was reached",
          },
          sourceReliability: {
            type: Type.STRING,
            description: "Evaluation of potential source or style",
          },
          linguisticMarkers: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "List of markers like 'Sensationalism', 'Clickbait', 'Factual'",
          },
        },
        required: ["verdict", "confidence", "explanation", "sourceReliability", "linguisticMarkers"],
      },
    },
  });

  if (!response.text) {
    throw new Error("Empty response from AI engine");
  }

  return JSON.parse(response.text.trim()) as AnalysisResult;
};
