
import { GoogleGenAI, Type } from "@google/genai";
import { SpoonParameters, DEFAULT_PARAMETERS, BowlType } from "../types";

export const generateSpoonVariants = async (count: number = 5): Promise<SpoonParameters[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  const schema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        bowlWidth: { type: Type.NUMBER },
        bowlLength: { type: Type.NUMBER },
        bowlRadius: { type: Type.NUMBER },
        bowlType: { type: Type.STRING },
        neckLength: { type: Type.NUMBER },
        neckWidth: { type: Type.NUMBER },
        handleLength: { type: Type.NUMBER },
        handleShoulderWidth: { type: Type.NUMBER },
        handleMidWidth: { type: Type.NUMBER },
        handleEndWidth: { type: Type.NUMBER },
      },
      required: ["bowlWidth", "bowlLength", "neckLength", "handleLength"]
    }
  };

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate ${count} unique, high-quality spoon design variations for woodworking. 
      Themes: Nordic scoop, Slotted spatula, Elegant stirrer, Deep soup ladle, Modern minimalist.
      Values should be in inches. Widths usually 1-3", total lengths 6-12".`,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema
      }
    });

    const data = JSON.parse(response.text || '[]');
    return data.map((item: any) => ({
      ...DEFAULT_PARAMETERS,
      ...item,
      bowlType: Object.values(BowlType).includes(item.bowlType) ? item.bowlType : BowlType.OVAL
    }));
  } catch (error) {
    console.error("AI Generation failed, falling back to procedural math", error);
    // Procedural Fallback
    return Array.from({ length: count }).map(() => ({
      ...DEFAULT_PARAMETERS,
      bowlWidth: 1.5 + Math.random(),
      bowlLength: 2 + Math.random() * 2,
      handleLength: 4 + Math.random() * 6,
      neckWidth: 0.4 + Math.random() * 0.4,
    }));
  }
};
