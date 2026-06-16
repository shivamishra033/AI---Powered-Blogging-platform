import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({apiKey: process.env.GEMINI_API_KEY});

async function generateContent(prompt) {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: `Write a detailed blog post about "${prompt}". 
    Return ONLY the inner HTML content using tags like <h2>, <p>, <ul>, <li>, <strong>.
    Do NOT include <!DOCTYPE>, <html>, <head>, <style>, or <body> tags.
    Do NOT include any markdown or backticks.`,
  });
  return response.text;
}

export default generateContent;