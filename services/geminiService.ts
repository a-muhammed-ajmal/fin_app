import { GoogleGenAI } from "@google/genai";
import { AppData } from "../types";

const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.warn("API_KEY not found in environment variables");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const generateLifeInsights = async (data: AppData, query?: string): Promise<string> => {
  const ai = getAiClient();
  if (!ai) return "AI services unavailable. Please configure your API Key.";

  const prompt = `
    You are a life coach and productivity expert analyzing the user's "Life OS" dashboard.
    
    Current Data Snapshot:
    - Pending Tasks: ${data.tasks.filter(t => !t.completed).length} (High Priority P1/P2: ${data.tasks.filter(t => !t.completed && (t.priority === 'P1' || t.priority === 'P2')).length})
    - Habits: ${data.habits.length} tracked.
    - Financials: ${data.transactions.length} recent transactions.
    - Active Contacts: ${data.contacts.length}.
    - Mission: ${data.missionStatement || "Not defined yet"}.
    
    User Query: ${query || "Provide a brief morning briefing, highlighting 3 key focus areas based on my data. Be concise and motivational."}
    
    Respond in plain text, formatted nicely with markdown if needed. Keep it under 200 words.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || "No insights generated.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Sorry, I couldn't generate insights right now.";
  }
};

export const chatWithAssistant = async (history: string[], newMessage: string): Promise<string> => {
    const ai = getAiClient();
    if (!ai) return "AI services unavailable.";

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `
                System: You are Life OS Assistant, a helpful, strict but kind productivity partner.
                Conversation History:
                ${history.join('\n')}
                User: ${newMessage}
            `
        });
        return response.text || "I'm listening.";
    } catch (e) {
        return "I encountered an error processing your request.";
    }
}