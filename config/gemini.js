import { GoogleGenerativeAI } from "@google/generative-ai";

export const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
// or use: gemini-2.5-pro (slower but more powerful)
