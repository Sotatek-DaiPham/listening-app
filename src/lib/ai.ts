import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

/**
 * Translates text from English to Vietnamese using Gemini AI.
 */
export async function translateToVietnamese(text: string): Promise<string> {
  if (!text.trim()) return "";
  
  if (!process.env.GOOGLE_API_KEY) {
    console.error("GOOGLE_API_KEY is missing");
    throw new Error("AI Service configuration missing");
  }

  try {
    const prompt = `Translate the following English segment from a dictation exercise into natural, accurate Vietnamese. Return ONLY the translated text without any explanations or quotes.
    
    Text: "${text}"`;

    console.log("Gemini Prompt:", prompt);
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const translatedText = response.text().trim();
    console.log("Gemini Result:", translatedText);
    return translatedText;
  } catch (error: any) {
    console.error("Gemini Translation Error:", error);
    // Log safe parts of error to help debug
    const errorDetails = error?.response?.data?.error?.message || error?.message || "Unknown Gemini Error";
    console.error("Gemini Error Details:", errorDetails);
    throw new Error(`Gemini Error: ${errorDetails}`);
  }
}

/**
 * Analyzes grammar of English text and returns a simple Vietnamese explanation.
 */
export async function analyzeGrammar(text: string): Promise<string> {
  if (!text.trim()) return "";
  
  if (!process.env.GOOGLE_API_KEY) {
    console.error("GOOGLE_API_KEY is missing");
    throw new Error("AI Service configuration missing");
  }

  try {
    const prompt = `Bạn là một chuyên gia ngôn ngữ học. Hãy phân tích cấu trúc ngữ pháp và từ vựng của câu tiếng Anh dưới đây. 
    Giải thích bằng TIẾNG VIỆT, phong cách CỰC KỲ NGẮN GỌN, SÚC TÍCH, chỉ nêu những điểm quan trọng nhất. 
    Không giải thích rườm rà. Sử dụng tối đa 3-4 gạch đầu dòng.
    
    Câu cần phân tích: "${text}"`;

    console.log("Gemini Grammar Prompt:", prompt);
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const analysis = response.text().trim();
    console.log("Gemini Grammar Result:", analysis);
    return analysis;
  } catch (error: any) {
    console.error("Gemini Grammar Analysis Error:", error);
    const errorDetails = error?.response?.data?.error?.message || error?.message || "Unknown Gemini Error";
    throw new Error(`Gemini Grammar error: ${errorDetails}`);
  }
}
