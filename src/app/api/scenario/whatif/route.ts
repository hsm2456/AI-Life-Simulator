import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

const apiKey = process.env.GEMINI_API_KEY;

export const maxDuration = 60;

export async function POST(req: Request) {
  if (!apiKey) {
    return NextResponse.json(
      { error: 'GEMINI_API_KEY is not configured.' },
      { status: 500 }
    );
  }

  try {
    const { baseFormData, option, whatIfInput, initialStats } = await req.json();

    const prompt = `
당신은 '센티언트(Sentient) 인생 전략가'입니다. 
사용자가 기존 시뮬레이션 결과에서 "특정 변수 하나를 살짝 바꿨을 때(What-If)" 5년 뒤가 어떻게 드라마틱하게 바뀌는지 대조해서 보여주기 위한 데이터를 생성해야 합니다.

[사용자 기본 조건]
- 나이: ${baseFormData.age}세
- 직업: ${baseFormData.jobStatus}
- 동적 변수 1: ${baseFormData.dynamicAnswer1}
- 동적 변수 2: ${baseFormData.dynamicAnswer2}

[기존 선택지 정보]
- 선택: ${option.title}
- 기존 성공 확률: ${option.survivalRate}%

[What-If 추가 조건]
"${whatIfInput}"

이 추가 조건이 반영되었을 때, 기존 선택지의 5년 뒤 미래가 어떻게 바뀌는지 새로운 결과를 계산하세요.

반드시 아래 JSON 스키마를 엄격히 준수하여 마크다운 코드블록 없이 순수 JSON 문자열만 반환하세요.
{
  "whatIfOption": {
    "survivalRate": 85,
    "description": "추가된 조건 덕분에 초기 자본의 압박이 줄어들어 리스크 테이킹이 가능해졌습니다. [구체적인 드라마틱한 변화 묘사]",
    "statChanges": {
      "경제력": 25, 
      "행복도": 15,
      "회복탄력성": 10,
      "번아웃확률": -20
    },
    "timeline": {
      "year_5": { "content": "변경된 5년 후의 묘사...", "핵심성과": "...", "예상치못한변수": "...", "정신적상태": "..." }
    }
  }
}
`;

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-3-flash-preview',
      generationConfig: {
        temperature: 0.7,
        responseMimeType: "application/json",
      }
    });
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    let parsedData;
    try {
      const cleanText = text.replace(/```json\n?/g, '').replace(/```/g, '').trim();
      parsedData = JSON.parse(cleanText);
    } catch (parseError) {
      console.error("Failed to parse JSON:", text);
      throw new Error("AI가 유효하지 않은 응답을 반환했습니다.");
    }

    return NextResponse.json({ whatIfOption: parsedData.whatIfOption });
  } catch (error: any) {
    console.error('Gemini What-If API Error:', error);
    return NextResponse.json(
      { error: '시뮬레이션을 생성하는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
