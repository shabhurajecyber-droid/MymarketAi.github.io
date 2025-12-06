import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Converts a File object to a Base64 string.
 */
const fileToGenerativePart = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
      const base64Data = base64String.split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

/**
 * Analyzes the stock chart image using Gemini 2.5 Flash.
 */
export const analyzeChart = async (file: File): Promise<AnalysisResult> => {
  try {
    const base64Data = await fileToGenerativePart(file);

    const prompt = `
      You are an expert technical analyst and NSE Option Chain Expert. 
      Analyze this chart image in extreme detail. 
      
      1. **Technical Analysis**: Identify trend, patterns, and support/resistance.
      2. **Option Chain Simulation**: Based on the price action (breakouts/breakdowns), infer where Open Interest (OI) shifting might occur (e.g., Short Covering or Long Unwinding).
      3. **Option Strategy**: Suggest the MOST PROFITABLE Option Trade (Call or Put) based on the chart. Select a specific Strike Price (ATM or slightly OTM).
      
      IMPORTANT: Provide all text explanations in BOTH English and Marathi.
      Structure the 'reasoning' field like this:
      [English Explanation]
      
      [Marathi Explanation]

      For 'keyLevels', strictly identify numerical price levels for Support and Resistance. 
      Format them strictly like "Support: 22000" or "Resistance: 22500". 
      Do NOT return generic text like "Previous High". ALWAYS include the number.

      Output JSON format:
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: file.type,
              data: base64Data
            }
          },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            action: { type: Type.STRING, enum: ["BUY", "SELL", "HOLD"] },
            confidence: { type: Type.NUMBER, description: "Confidence percentage 0-100" },
            entryPrice: { type: Type.STRING, description: "Suggested entry price or range" },
            targetPrice: { type: Type.STRING, description: "Suggested take profit target" },
            stopLoss: { type: Type.STRING, description: "Suggested stop loss level" },
            reasoning: { type: Type.STRING, description: "Detailed technical analysis explanation in both English and Marathi" },
            keyLevels: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "List of specific price levels formatted strictly as 'Support: Price' or 'Resistance: Price'"
            },
            timeframeAnalysis: {
              type: Type.ARRAY,
              description: "Sentiment analysis for different timeframes (1m to 1y)",
              items: {
                type: Type.OBJECT,
                properties: {
                   timeframe: { type: Type.STRING, description: "e.g., 1 min, 5 min, 1 hr, 1 day, etc." },
                   buyPercent: { type: Type.NUMBER, description: "Buy percentage (0-100)" },
                   sellPercent: { type: Type.NUMBER, description: "Sell percentage (0-100)" }
                },
                required: ["timeframe", "buyPercent", "sellPercent"]
              }
            },
            optionStrategy: {
              type: Type.OBJECT,
              description: "Recommended Option Trade based on implied OI and technicals",
              properties: {
                action: { type: Type.STRING, enum: ["BUY CE", "BUY PE", "SELL CE", "SELL PE", "NO TRADE"] },
                strikePrice: { type: Type.STRING, description: "Specific strike price (e.g., 22500 CE)" },
                expiry: { type: Type.STRING, description: "Suggested expiry (e.g., Current Week)" },
                reasoning: { type: Type.STRING, description: "Why this option? Mention OI logic (Short covering, etc.) in Marathi/English" },
                roiPotential: { type: Type.STRING, description: "Estimated profit potential (e.g., High, Medium)" }
              },
              required: ["action", "strikePrice", "expiry", "reasoning", "roiPotential"]
            }
          },
          required: ["action", "confidence", "reasoning", "entryPrice", "targetPrice", "stopLoss", "keyLevels", "timeframeAnalysis", "optionStrategy"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from Gemini");
    
    return JSON.parse(text) as AnalysisResult;

  } catch (error) {
    console.error("Error analyzing chart:", error);
    throw error;
  }
};