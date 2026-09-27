import { GoogleGenAI, type GenerateContentConfig } from '@google/genai';

const DEFAULT_MODEL = 'gemini-3.5-flash-lite';
const MAX_ATTEMPTS = 3;
const REQUEST_BUDGET_MS = 50_000;

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
  // A model with no quota cannot recover by repeating the same request.
  if (/limit:\s*0\b/.test(error.message ?? '')) return false;
  return error.status === 429 || error.status === 503 || /\b(429|503)\b/.test(error.message ?? '');
}

export function getGeminiFailure(error: unknown): { error: string; code: string; status: number } {
  const { status, message = '' } = toGeminiError(error);
  if (message.includes('GEMINI_API_KEY is not configured')) {
    return { error: 'AI 서비스 키가 설정되지 않았습니다. 서버의 GEMINI_API_KEY 설정을 확인해주세요.', code: 'AI_NOT_CONFIGURED', status: 503 };
  }
  if (status === 404) {
    return { error: '현재 설정된 AI 모델을 사용할 수 없습니다. 서버의 GEMINI_MODEL 설정을 확인해주세요.', code: 'AI_MODEL_UNAVAILABLE', status: 503 };
  }
  if (status === 429) {
    return { error: /limit:\s*0\b/.test(message)
      ? '현재 AI 모델의 사용 할당량이 없습니다. 사용 가능한 모델 또는 API 결제 설정을 확인해주세요.'
      : 'AI 서비스의 요청 한도에 도달했습니다. 잠시 후 다시 시도해주세요.', code: 'AI_QUOTA_EXCEEDED', status: 429 };
  }
  if (status === 400 || status === 401 || status === 403) {
    return { error: 'AI 서비스 연결 설정을 확인해주세요. API 키 또는 모델 요청이 거부되었습니다.', code: 'AI_CONFIGURATION_ERROR', status: 503 };
  }
  if (status === 503) {
    return { error: 'AI 서비스가 일시적으로 혼잡합니다. 잠시 후 다시 시도해주세요.', code: 'AI_BUSY', status: 503 };
  }
  if (/timeout|timed out|abort/i.test(message)) {
    return { error: '시나리오 생성 시간이 초과되었습니다. 다시 시도해주세요.', code: 'AI_TIMEOUT', status: 504 };
  }
  return { error: '시나리오를 생성하는 중 오류가 발생했습니다. 다시 시도해주세요.', code: 'AI_GENERATION_FAILED', status: 502 };
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
  const model = process.env.GEMINI_MODEL?.trim() || DEFAULT_MODEL;
  const deadline = Date.now() + REQUEST_BUDGET_MS;
  let delay = 1_000;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents,
        config: {
          ...config,
          httpOptions: {
            ...config?.httpOptions,
            timeout: Math.min(config?.httpOptions?.timeout ?? REQUEST_BUDGET_MS, deadline - Date.now()),
            // This helper owns retries so the SDK cannot multiply attempts.
            retryOptions: { attempts: 1 },
          },
        },
      });
      const text = response.text?.trim();

      if (!text) {
        throw new Error('AI가 비어 있는 응답을 반환했습니다.');
      }

      return text;
    } catch (error) {
      const geminiError = toGeminiError(error);
      if (!isRetryable(geminiError) || attempt === MAX_ATTEMPTS || Date.now() + delay >= deadline) {
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
