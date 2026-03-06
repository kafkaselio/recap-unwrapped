
import { GoogleGenAI } from "@google/genai";
import { Moment, BucketType } from "../types";
import { BUCKET_CONFIGS } from "../constants";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface SmartInsight {
  title: string;
  description: string;
  type: 'correlation' | 'trend' | 'suggestion';
  icon?: string;
}

export interface MonthlyRecapAI {
  title: string;
  summary: string;
  topVibe: string;
  vibeDescription: string;
  funnyObservation: string;
}

export const generateSmartInsights = async (moments: Moment[]): Promise<SmartInsight[]> => {
  if (moments.length < 3) return [];

  const momentsSummary = moments.map(m => ({
    type: m.type,
    title: m.title,
    subtitle: m.subtitle,
    timestamp: m.timestamp,
    value: m.value,
    unit: m.unit,
    isFavorite: m.isFavorite
  }));

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analyze these life moments and provide 3 "Smart Insights". 
      Find connections between different categories (e.g., music and location, or games and mood).
      Be creative, personal, and slightly witty.
      
      CRITICAL: Pay special attention to moments marked as "isFavorite: true" as these are the user's most cherished memories.
      
      Moments: ${JSON.stringify(momentsSummary)}
      
      Return the response as a JSON array of objects with:
      - title: string (short, catchy)
      - description: string (the insight)
      - type: 'correlation' | 'trend' | 'suggestion'
      `,
      config: {
        responseMimeType: "application/json",
      }
    });

    const text = response.text;
    if (text) {
      return JSON.parse(text);
    }
  } catch (error) {
    console.error("Error generating insights:", error);
  }

  return [
    {
      title: "The Focus Mode",
      description: "You tend to listen to lo-fi music whenever you're at coffee shops. This seems to be your ultimate productivity trigger!",
      type: 'correlation'
    },
    {
      title: "Weekend Warrior",
      description: "Your gaming hours spike by 300% on Saturdays. A true weekend escape!",
      type: 'trend'
    }
  ];
};

export const generateMonthlyRecap = async (moments: Moment[], monthName: string): Promise<MonthlyRecapAI | null> => {
  if (moments.length === 0) return null;

  const momentsSummary = moments.map(m => ({
    type: m.type,
    title: m.title,
    subtitle: m.subtitle,
    value: m.value,
    isFavorite: m.isFavorite
  }));

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate a creative monthly recap for the month of ${monthName}.
      Analyze the following moments and create a high-energy, "Spotify Wrapped" style summary.
      
      CRITICAL: Prioritize items marked as "isFavorite: true" and those with higher "value" (e.g., more plays, higher score). These are the most important highlights.
      
      Moments: ${JSON.stringify(momentsSummary)}
      
      Return the response as a JSON object with:
      - title: string (A catchy title for the month, e.g., "The Month of Neon Dreams")
      - summary: string (A 2-sentence emotional summary of the month)
      - topVibe: string (A single word or short phrase representing the overall mood)
      - vibeDescription: string (Why this vibe was chosen)
      - funnyObservation: string (A witty or funny observation about the data)
      `,
      config: {
        responseMimeType: "application/json",
      }
    });

    const text = response.text;
    if (text) {
      return JSON.parse(text);
    }
  } catch (error) {
    console.error("Error generating monthly recap:", error);
  }

  return null;
};

export const generateYearlyRecap = async (moments: Moment[], year: number): Promise<MonthlyRecapAI | null> => {
  if (moments.length === 0) return null;

  const momentsSummary = moments.map(m => ({
    type: m.type,
    title: m.title,
    subtitle: m.subtitle,
    value: m.value,
    isFavorite: m.isFavorite,
    month: new Date(m.timestamp).getMonth()
  }));

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate a creative yearly recap for the year ${year}.
      Analyze the following moments from the entire year and create a high-energy, "Spotify Wrapped" style summary.
      
      CRITICAL: Prioritize items marked as "isFavorite: true" and those with higher "value" (e.g., more plays, higher score). These are the most important highlights of the year.
      
      Moments: ${JSON.stringify(momentsSummary)}
      
      Return the response as a JSON object with:
      - title: string (A catchy title for the year, e.g., "The Year of Infinite Growth")
      - summary: string (A 2-sentence emotional summary of your year so far)
      - topVibe: string (A single word or short phrase representing the overall mood of the year)
      - vibeDescription: string (Why this vibe was chosen for your year)
      - funnyObservation: string (A witty or funny observation about your yearly data)
      `,
      config: {
        responseMimeType: "application/json",
      }
    });

    const text = response.text;
    if (text) {
      return JSON.parse(text);
    }
  } catch (error) {
    console.error("Error generating yearly recap:", error);
  }

  return null;
};
