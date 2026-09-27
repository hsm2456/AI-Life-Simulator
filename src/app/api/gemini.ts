import { GoogleGenAI, type GenerateContentConfig } from '@google/genai';

const MODEL = 'gemini-2.5-pro';
const MAX_ATTEMPTS = 3;

type GeminiError = {
  message?: string;
  status?: number;
};

function toGeminiError(error: unknown): GeminiError {
  if (error instanceof Error) {
    return error as GeminiError;
  }

  return typeof error === 'object' && error !== null ? error as GeminiError : {};
}

function isRetryable(error: GeminiError): boolean {
  return error.status === 429 || error.status === 503 || /\b(429|503)\b/.test(error.message ?? '');
}

export function getErrorMessage(error: unknown): string {
  const { message } = toGeminiError(error);
  return message || '알 수 없는 오류가 발생했습니다.';
}

export async function generateGeminiContent(
  contents: string,
  config?: GenerateContentConfig,
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured.');
  }

  const ai = new GoogleGenAI({ apiKey });
  let delay = 1_000;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    try {
      const response = await ai.models.generateContent({
        model: MODEL,
        contents,
        config,
      });
      const text = response.text?.trim();

      if (!text) {
        throw new Error('AI가 비어 있는 응답을 반환했습니다.');
      }

      return text;
    } catch (error) {
      const geminiError = toGeminiError(error);
      if (!isRetryable(geminiError) || attempt === MAX_ATTEMPTS) {
        throw error;
      }

      console.warn(
        `Gemini API returned a retryable error. Retrying ${attempt}/${MAX_ATTEMPTS} in ${delay}ms...`,
      );
      await new Promise((resolve) => setTimeout(resolve, delay));
      delay *= 2;
    }
  }

  throw new Error('Gemini API 요청을 완료하지 못했습니다.');
}
