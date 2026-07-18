import { GoogleGenAI } from "@google/genai";
import dotenv from 'dotenv';
dotenv.config();

// 1. Ingest a comma-separated pool string from .env, fallback safely if not set
const keyPool = process.env.GEMINI_API_KEYS 
  ? process.env.GEMINI_API_KEYS.split(',').map(k => k.trim()) 
  : (process.env.GEMINI_API_KEY ? [process.env.GEMINI_API_KEY] : []);

if (keyPool.length === 0) {
  throw new Error("CRITICAL: Neither GEMINI_API_KEYS nor GEMINI_API_KEY are configured in environment variables.");
}

let currentKeyIndex = 0;

// 2. Helper function to generate an active instance using the current rotation position
export const getAIInstance = () => {
  const currentKey = keyPool[currentKeyIndex];
  return new GoogleGenAI({ apiKey: currentKey });
};

// 3. Increment the index pointer across the key array
export const rotateApiKey = () => {
  if (keyPool.length <= 1) return false; // Nowhere to rotate if only one key exists
  
  currentKeyIndex = (currentKeyIndex + 1) % keyPool.length;
  console.warn(`🔄 Rate limit encountered. Swapping active client index to position [${currentKeyIndex}]`);
  return true;
};

export const config = {
  model: 'gemini-3.1-flash-lite', // Kept exactly as you requested
  temperature: 0.2
};