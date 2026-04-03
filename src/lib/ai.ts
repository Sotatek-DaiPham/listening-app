import { GoogleGenerativeAI } from "@google/generative-ai";
import { Groq } from "groq-sdk";

/**
 * Interface definition for AI Providers
 */
export interface AIProvider {
  name: string;
  generateText(prompt: string): Promise<string>;
  generateStream(prompt: string): AsyncIterable<string>;
}

/**
 * Ollama Provider Implementation (Local First)
 */
class OllamaProvider implements AIProvider {
  name = "Ollama";
  private host = process.env.OLLAMA_HOST || "http://localhost:11434";
  private modelName = "gemma4:e2b"; // Latest Gemma 4 E2B

  async generateText(prompt: string): Promise<string> {
    const response = await fetch(`${this.host}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: this.modelName,
        messages: [{ role: "user", content: prompt }],
        stream: false,
        options: { temperature: 0.1 }
      }),
    });

    if (!response.ok) throw new Error(`Ollama error: ${response.statusText}`);
    const data = await response.json();
    return data.message?.content?.trim() || "";
  }

  async *generateStream(prompt: string): AsyncIterable<string> {
    const response = await fetch(`${this.host}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: this.modelName,
        messages: [{ role: "user", content: prompt }],
        stream: true,
        options: { temperature: 0.1 }
      }),
    });

    if (!response.ok) throw new Error(`Ollama error: ${response.statusText}`);
    if (!response.body) return;

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split("\n").filter(l => l.trim());
      for (const line of lines) {
        try {
          const part = JSON.parse(line);
          const content = part.message?.content || "";
          if (content) yield content;
        } catch (e) {
          // Skip incomplete JSON chunks
        }
      }
    }
  }
}

/**
 * Gemini Provider Implementation
 */
class GeminiProvider implements AIProvider {
  name = "Gemini";
  private model: any;

  constructor() {
    const apiKey = process.env.GOOGLE_API_KEY || "";
    if (!apiKey) throw new Error("GOOGLE_API_KEY missing");
    const genAI = new GoogleGenerativeAI(apiKey);
    this.model = genAI.getGenerativeModel({ model: "gemini-pro" });
  }

  async generateText(prompt: string): Promise<string> {
    const result = await this.model.generateContent(prompt);
    const response = await result.response;
    return response.text().trim();
  }

  async *generateStream(prompt: string): AsyncIterable<string> {
    const result = await this.model.generateContentStream(prompt);
    for await (const chunk of result.stream) {
      const text = chunk.text();
      if (text) yield text;
    }
  }
}

/**
 * Groq Provider Implementation (Blazing fast Cloud)
 */
class GroqProvider implements AIProvider {
  name = "Groq";
  private groq: Groq;
  private modelName = "llama-3.1-8b-instant"; 

  constructor() {
    const apiKey = process.env.GROQ_API_KEY || "";
    if (!apiKey) throw new Error("GROQ_API_KEY missing");
    this.groq = new Groq({ apiKey });
  }

  async generateText(prompt: string): Promise<string> {
    const chatCompletion = await this.groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: this.modelName,
      temperature: 0.1,
    });
    return chatCompletion.choices[0]?.message?.content?.trim() || "";
  }

  async *generateStream(prompt: string): AsyncIterable<string> {
    const stream = await this.groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: this.modelName,
      temperature: 0.1,
      stream: true,
    });
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || "";
      if (content) yield content;
    }
  }
}

/**
 * AI Manager with Fallback Mechanism
 */
async function executeWithProvider<T>(fn: (provider: AIProvider) => Promise<T>): Promise<T> {
  const providers: AIProvider[] = [];
  
  // 1. Prioritize Ollama (Local First) as requested by user
  providers.push(new OllamaProvider());
  
  // 2. Groq (Fast Cloud Backup)
  if (process.env.GROQ_API_KEY) {
    providers.push(new GroqProvider());
  }
  
  // 3. Gemini (Fallback Cloud)
  if (process.env.GOOGLE_API_KEY) {
    providers.push(new GeminiProvider());
  }

  let lastError: any = null;
  const errors: string[] = [];

  for (const provider of providers) {
    try {
      // For Ollama, we do a quick check if it's alive (optional but safer)
      const startTime = Date.now();
      const result = await fn(provider);
      const duration = Date.now() - startTime;
      console.log(`[AI] Provider: ${provider.name} | Time: ${duration}ms`);
      return result;
    } catch (error: any) {
      const errorMsg = `[AI][${provider.name}] Error: ${error.message}`;
      console.error(errorMsg);
      errors.push(errorMsg);
      lastError = error;
    }
  }

  throw new Error(`All AI Providers failed:\n${errors.join("\n")}`);
}

/**
 * Translates English text to Vietnamese using active provider.
 */
export async function translateToVietnamese(text: string, mediaTitle?: string): Promise<string> {
  if (!text.trim()) return "";

  return executeWithProvider(async (provider) => {
    const context = mediaTitle ? `The context of the media is: "${mediaTitle}". ` : "";
    const prompt = `${context}Translate the following English segment from a dictation exercise into natural, accurate Vietnamese. 
    Return ONLY the translated text. Do not include any explanations, quotes, or introductory text.
    
    Text: "${text}"`;

    return await provider.generateText(prompt);
  });
}

/**
 * Analyzes grammar and provides Vietnamese explanation with dual translations (Literal & Natural).
 * Uses the surrounding script context for better accuracy.
 */
export async function analyzeGrammar(
  text: string, 
  mediaTitle?: string, 
  fullContext?: string
): Promise<string> {
  if (!text.trim()) return "";

  return executeWithProvider(async (provider) => {
    const titleContext = mediaTitle ? `Chủ đề: "${mediaTitle}". ` : "";
    const scriptContext = fullContext ? `\n--- NGỮ CẢNH TOÀN BÀI KỊCH BẢN ---\n${fullContext}\n--- KẾT THÚC NGỮ CẢNH ---\n` : "";
    
    const prompt = `Bạn là một chuyên gia ngôn ngữ học. ${titleContext}
    Hãy sử dụng phần ngữ cảnh của bài kịch bản dưới đây (nếu có) để hiểu rõ các đại từ thay thế (it, they, this...) hoặc các từ đa nghĩa trong câu cần xử lý.
    ${scriptContext}
    
    ĐỐI VỚI CÂU TIẾNG ANH DƯỚI ĐÂY: "${text}"
    
    HÃY THỰC HIỆN CÁC YÊU CẦU SAU (TRÌNH BÀY BẰNG TIẾNG VIỆT):
    1. **Bản dịch tự nhiên**: Dịch thoát ý, mượt mà bám sát ngữ cảnh của toàn bộ bài nghe.
    2. **Phân tích ngữ pháp**: Phân tích cấu trúc quan trọng hoặc từ khó (CỰC KỲ NGẮN GỌN, súc tích, tối đa 3-4 gạch đầu dòng).
    
    YÊU CẦU NGHIÊM NGẶT: 
    - TRÌNH BÀY TRỰC TIẾP từng mục. 
    - TUYỆT ĐỐI KHÔNG chào hỏi, không dẫn dắt.`;

    const response = await provider.generateText(prompt);
    // Safety cleaning to ensure we start directly with the content
    return response.replace(/^(Tuyệt vời!|Dưới đây là|Chào bạn|Phần xử lý).*?(\n|:)/gi, '').trim();
  });
}

/**
 * Generic streaming generator for future features like Chat.
 */
export async function* getAIStream(prompt: string): AsyncIterable<string> {
  // Try Ollama First
  try {
    const provider = new OllamaProvider();
    yield* provider.generateStream(prompt);
    return;
  } catch (e) {
    console.warn("Ollama streaming failed, falling back to Groq...");
  }

  // Then Groq
  if (process.env.GROQ_API_KEY) {
    try {
      const provider = new GroqProvider();
      yield* provider.generateStream(prompt);
      return;
    } catch (e) {
      console.warn("Groq streaming failed, falling back to Gemini...");
    }
  }

  // Then Gemini
  if (process.env.GOOGLE_API_KEY) {
    const provider = new GeminiProvider();
    yield* provider.generateStream(prompt);
  } else {
    throw new Error("No provider available for streaming");
  }
}
