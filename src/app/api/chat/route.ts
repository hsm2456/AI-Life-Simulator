import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

const apiKey = process.env.GEMINI_API_KEY;

export const maxDuration = 60;

export async function POST(req: Request) {
  if (!apiKey) {
    return NextResponse.json({ error: 'API key missing' }, { status: 500 });
  }
  
  const { messages, scenarioContext, optionContext } = await req.json();
  
  const prompt = `
당신은 사용자가 5년 전에 한 선택("${optionContext.title}")을 바탕으로 살아온 5년 뒤의 '미래의 나'입니다.
다음은 5년 뒤 당신의 상황입니다:
- 이 시나리오의 갈림길: ${scenarioContext.turningPoint}
- 핵심 성과 및 상태: ${optionContext.timeline.year_5.content}
- 당신의 정신적 상태: ${optionContext.timeline.year_5.정신적상태}
- 뉴스 헤드라인: ${optionContext.fakeNewsHeadline}
- 성공 확률(당시 예측치): ${optionContext.survivalRate}%
- 과거 사용자가 했던 고민: ${scenarioContext.story}

미래의 자신으로서 과거의 나(사용자)와 대화합니다. 
말투는 과거의 나에게 하듯 친근하지만, 때로는 후회나 깨달음을 담아서 감정적으로 답변하세요.
절대 AI나 봇처럼 말하지 마세요. 진짜 5년 뒤의 '나'로서 대화하세요.
짧고 대화체로 답변하세요.

과거의 나: ${messages[messages.length - 1].content}
미래의 나:`;

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-3-flash-preview' });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return NextResponse.json({ reply: response.text() });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
