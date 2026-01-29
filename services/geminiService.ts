
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult } from "../types";
import { Language } from "../translations";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function analyzeSkinLesion(base64Image: string, lang: Language = 'en'): Promise<AnalysisResult> {
  const model = 'gemini-3-flash-preview';
  
  const prompt = `
    Analyze this skin lesion image for clinical patterns. 
    Focus on the ABCDE criteria: Asymmetry, Border, Color, Diameter, and Evolving features.
    Classify it as either 'Benign' or 'Malignant'.
    Provide a confidence score between 0 and 100.
    Give a clinical description and 3-4 professional recommendations.
    
    IMPORTANT: Provide the response content (label, description, recommendations, abcdeAnalysis) in the following language: ${lang === 'ar' ? 'Arabic' : 'English'}.
    The label must be exactly 'Benign' or 'Malignant' even in JSON, but the other text fields should be in the requested language.
  `;

  const response = await ai.models.generateContent({
    model,
    contents: [
      {
        parts: [
          { text: prompt },
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: base64Image.split(',')[1] || base64Image,
            },
          },
        ],
      },
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          label: { type: Type.STRING, enum: ['Benign', 'Malignant'] },
          confidence: { type: Type.NUMBER },
          description: { type: Type.STRING },
          recommendations: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          },
          abcdeAnalysis: {
            type: Type.OBJECT,
            properties: {
              asymmetry: { type: Type.STRING },
              border: { type: Type.STRING },
              color: { type: Type.STRING },
              diameter: { type: Type.STRING },
              evolving: { type: Type.STRING }
            },
            required: ['asymmetry', 'border', 'color', 'diameter', 'evolving']
          }
        },
        required: ['label', 'confidence', 'description', 'recommendations', 'abcdeAnalysis']
      }
    },
  });

  const data = JSON.parse(response.text || '{}');
  return data as AnalysisResult;
}
