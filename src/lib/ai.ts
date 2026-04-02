import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

/**
 * Translates text from English to Vietnamese using Gemini AI with context awareness.
 */
export async function translateToVietnamese(text: string, mediaTitle?: string): Promise<string> {
  if (!text.trim()) return "";
  
  if (!process.env.GOOGLE_API_KEY) {
    console.error("GOOGLE_API_KEY is missing");
    throw new Error("AI Service configuration missing");
  }

  try {
    const context = mediaTitle ? `The context of the media is: "${mediaTitle}". ` : "";
    const prompt = `${context}Translate the following English segment from a dictation exercise into natural, accurate Vietnamese. 
    Return ONLY the translated text. Do not include any explanations, quotes, or introductory text.
    
    Text: "${text}"`;

    console.log("Gemini Prompt:", prompt);
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const translatedText = response.text().trim();
    console.log("Gemini Result:", translatedText);
    return translatedText;
  } catch (error: any) {
    console.error("Gemini Translation Error:", error);
    const errorDetails = error?.response?.data?.error?.message || error?.message || "Unknown Gemini Error";
    throw new Error(`Gemini Error: ${errorDetails}`);
  }
}

/**
 * Analyzes grammar of English text and returns a simple Vietnamese explanation.
 * Context-aware version to improve translation accuracy.
 */
export async function analyzeGrammar(text: string, mediaTitle?: string): Promise<string> {
  if (!text.trim()) return "";
  
  if (!process.env.GOOGLE_API_KEY) {
    console.error("GOOGLE_API_KEY is missing");
    throw new Error("AI Service configuration missing");
  }

  try {
    const context = mediaTitle ? `Chủ đề của bài nghe này là: "${mediaTitle}". ` : "";
    const prompt = `Bạn là một chuyên gia ngôn ngữ học. ${context}Đối với câu tiếng Anh dưới đây, hãy thực hiện:
    1. Dịch câu sang tiếng Việt một cách tự nhiên nhất (bám sát ngữ cảnh chủ đề).
    2. Phân tích cấu trúc ngữ pháp và từ vựng quan trọng (phong cách CỰC KỲ NGẮN GỌN, SÚC TÍCH, tối đa 3-4 gạch đầu dòng).
    
    YÊU CẦU NGHIÊM NGẶT: 
    - Bắt đầu phản hồi TRỰC TIẾP bằng nội dung phân tích. 
    - TUYỆT ĐỐI KHÔNG chào hỏi, không dùng câu dẫn dắt (ví dụ: KHÔNG dùng 'Tuyệt vời!', 'Dưới đây là...', 'Dưới đây là phần xử lý...').
    
    Câu cần xử lý: "${text}"`;

    console.log("Gemini Grammar Prompt:", prompt);
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const analysis = response.text().trim();
    
    // Safety check to strip common AI filler if it still persists
    const cleanAnalysis = analysis.replace(/^(Tuyệt vời!|Dưới đây là|Chào bạn|Phần xử lý).*?(\n|:)/gi, '').trim();
    
    console.log("Gemini Grammar Result:", cleanAnalysis);
    return cleanAnalysis;
  } catch (error: any) {
    console.error("Gemini Grammar Analysis Error:", error);
    const errorDetails = error?.response?.data?.error?.message || error?.message || "Unknown Gemini Error";
    throw new Error(`Gemini Grammar error: ${errorDetails}`);
  }
}
