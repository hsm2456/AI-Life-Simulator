import { generateGeminiContent, getErrorMessage } from '../gemini';
import { NextResponse } from 'next/server';

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { perspective, age, jobStatus, choiceA, choiceB } = await req.json();

    const systemPrompt = `당신은 ${perspective} 입장에서 말하는 역할입니다.
반드시 해당 관계의 말투와 감정으로 답하세요.
3~4문장, 따뜻하지만 솔직하게.`;

    const userPrompt = `나이 ${age}세, ${jobStatus} 상태의 사람이
[선택A]: "${choiceA}" vs [선택B]: "${choiceB}"를 고민 중입니다.
${perspective} 입장에서 한마디 해주세요.`;

    const reply = await generateGeminiContent(`${systemPrompt}\n\n${userPrompt}`, {
      temperature: 0.7,
      maxOutputTokens: 300,
    });
    return NextResponse.json({ reply });
  } catch (error) {
    console.error('Gemini Perspective API Error:', error);
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}
