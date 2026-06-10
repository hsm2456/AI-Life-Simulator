import { NextResponse } from 'next/server';

export const maxDuration = 60;

export async function POST(req: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    // If Anthropic API key is not present, we can fallback to Gemini or just return a mock message for testing.
    // For this implementation, we require the Anthropic key as requested by the user.
    return NextResponse.json({ error: 'ANTHROPIC_API_KEY is missing in environment variables.' }, { status: 500 });
  }

  try {
    const { perspective, age, jobStatus, choiceA, choiceB } = await req.json();

    const systemPrompt = `당신은 ${perspective} 입장에서 말하는 역할입니다.
반드시 해당 관계의 말투와 감정으로 답하세요.
3~4문장, 따뜻하지만 솔직하게.`;

    const userPrompt = `나이 ${age}세, ${jobStatus} 상태의 사람이
[선택A]: "${choiceA}" vs [선택B]: "${choiceB}"를 고민 중입니다.
${perspective} 입장에서 한마디 해주세요.`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307', // Using haiku for fast, cheap responses
        max_tokens: 300,
        system: systemPrompt,
        messages: [{ role: 'user', content: userPrompt }]
      })
    });

    if (!response.ok) {
      const errData = await response.text();
      throw new Error(`Anthropic API Error: ${errData}`);
    }

    const data = await response.json();
    return NextResponse.json({ reply: data.content[0].text });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
