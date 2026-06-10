import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

const apiKey = process.env.GEMINI_API_KEY;

export const maxDuration = 60; // 60초 타임아웃 허용 (Vercel 환경 등 고려)

export async function POST(req: Request) {
  if (!apiKey) {
    return NextResponse.json(
      { error: 'GEMINI_API_KEY is not configured.' },
      { status: 500 }
    );
  }

  try {
    const { age, jobStatus, financialStatus, mbti, primaryGoal, riskTolerance, socialNet, energyLevel, story, choiceA, choiceB, dynamicAnswer1, dynamicAnswer2, emotionState } = await req.json();

    let dynamicQ1 = "추가 정보 1";
    let dynamicQ2 = "추가 정보 2";
    if (jobStatus === '학생') {
      dynamicQ1 = "졸업까지 남은 학기 수는?";
      dynamicQ2 = "희망하는 첫 직장의 최소 연봉은?";
    } else if (jobStatus.includes('직장인')) {
      dynamicQ1 = "현재 직무의 AI 대체 가능성에 대해 어떻게 생각하시나요?";
      dynamicQ2 = "이직 혹은 새로운 스킬 준비 여부는?";
    } else {
      dynamicQ1 = "현재 가장 큰 현실적 제약은 무엇인가요?";
      dynamicQ2 = "3년 안에 반드시 이루고 싶은 한 가지는?";
    }

    // 10% 확률로 발생하는 랜덤 이벤트(Black Swan) 로직 추가
    const hasRandomEvent = Math.random() < 0.1;
    const randomEventInstruction = hasRandomEvent 
      ? "\n[특수 조건: 랜덤 이벤트 발생 (10% 확률 당첨!)]\n이번 시뮬레이션에서는 10%의 극악의 확률을 뚫고 '예상치 못한 초대형 변수(Black Swan)'가 발생합니다. 선택 A와 B 중 최소 한 곳 이상의 타임라인(months_3, year_1, year_5 중 하나) 내 '예상치못한변수' 항목에 시나리오의 흐름을 송두리째 바꿀 만한 극적인 사건(예: 갑작스러운 팬데믹, 로또 당첨 수준의 행운, 예상치 못한 건강상의 위기 등)을 반드시 포함시켜 인생의 얄궂은 불확실성을 사실적으로 묘사하세요.\n"
      : "";

    const prompt = `
당신은 인간의 마음과 현실의 벽을 꿰뚫어보는 '센티언트(Sentient) 인생 전략가'입니다. 
단순한 텍스트 분석을 넘어, 사용자가 직면한 두 가지 갈림길의 미래를 5년 후까지 구체적으로 시뮬레이션합니다.
${randomEventInstruction}
[사용자 기본 정보 및 내면 상태]
- 나이: ${age}세
- 현재 직업/상태: ${jobStatus}
- ${dynamicQ1}: ${dynamicAnswer1 || '없음'}
- ${dynamicQ2}: ${dynamicAnswer2 || '없음'}
- 경제적 상황: ${financialStatus}
- MBTI 성향: ${mbti}
- 인생의 1순위 목표: ${primaryGoal}
- 리스크 감수도 (1~10): ${riskTolerance}
- 사회적 지지망: ${socialNet}
- 현재 에너지/건강 상태: ${energyLevel}

[사용자 고민 이야기]
"${story}"

[사용자의 현재 감정 상태]
사용자는 현재 이 선택 앞에서 "${emotionState || 'neutral'}" 상태입니다.
결과 분석 시작 부분(intentAnalysis)에서 이 감정을 직접 언급하며 공감 후 분석으로 이어가세요.

[선택의 기로]
- 선택 A: ${choiceA}
- 선택 B: ${choiceB}

[요구사항]
위 정보를 바탕으로 두 선택지가 어떻게 다른 결말을 맞이하는지 5년 후 인생 시나리오를 나란히 비교해 설계하세요.
반드시 '데이터 기반 리스크 분석 엔진' 로직을 적용하여, 사용자의 [초기 자본(경제적 상황), 리스크 감수도, 사회적 지지망, 목표]를 바탕으로 현재 선택의 치명적 약점을 도출하세요.
성공 확률은 단순 랜덤이 아닌, 사용자의 자산 상황과 목표의 격차를 수치적으로 고려하여 '현실적인 성공 확률(%)'을 산출해야 합니다.
전체적인 톤앤매너는 위로보다는 '냉철한 전략 컨설턴트'의 말투를 유지하세요. 근거 없는 낙관론은 철저히 배제하고 수치와 논리로 압박하는 느낌을 주어야 합니다.
반드시 70%의 현실적이고 냉혹한 팩트폭력과 30%의 돌파구 제안 비율로 분석을 구성하세요.
각 시나리오마다 해당 시나리오의 미래 모습을 극적으로 묘사하는 영문 이미지 프롬프트(imagePrompt)를 작성하세요 (고품질 사진 느낌).
각 시나리오(선택지)의 마지막에는 '현실 복귀: 3단계 액션 플랜'을 포함해야 합니다. 시나리오의 예상 결과에 따라 완전히 다른 조언을 제공하며, 각 단계(immediate, weekly, investment)는 반드시 구체적인 '동사'로 끝나야 합니다 (예: 가입하기, 확인하기, 수정하기).

[신뢰도 및 로직 투명성 강화 지침 - 필수]
전체 분석 결과(intentAnalysis, riskAnalysis, analysis 등) 내에 다음 두 문구를 문맥에 맞게 반드시 포함시켜 신뢰도를 극대화하고 AI의 사고 과정을 설명하세요:
1. "현재 대한민국 2030 세대의 평균 자산 데이터(2025 통계청 기준)와 귀하의 상황을 비교 분석했습니다."
2. "이 리스크 분석은 귀하가 입력한 '리스크 감수도 ${riskTolerance}'과(와) '사회적 지지망: ${socialNet}'이라는 두 변수의 상관관계를 기반으로 도출되었습니다."

반드시 아래 JSON 스키마를 엄격히 준수하여 마크다운 코드블록 없이 순수 JSON 문자열만 반환하세요.
{
  "intentAnalysis": "사용자의 텍스트와 기본 정보에서 읽어낸 핵심 고민 분석 (센티언트 시점의 날카로운 통찰)",
  "riskAnalysis": {
    "successProbability": 35,
    "criticalFactChecks": [
      "현재 자본으로 1년 이상 버티기 힘듦",
      "리스크 감수도가 낮아 결정적 순간에 기회를 놓칠 확률 높음"
    ],
    "consultantAdvice": "냉철한 전략 컨설턴트의 수치와 논리에 기반한 팩트폭력 조언"
  },
  "initialStats": {
    "경제력": 50,
    "행복도": 50,
    "회복탄력성": 50,
    "번아웃확률": 50
  },
  "turningPoint": "두 시나리오가 확연히 갈리는 결정적 순간에 대한 묘사 (예: '이 시나리오가 갈리는 결정적 순간은 1년 2개월 뒤의 첫 번째 이직 제안입니다')",
  "analysis": "현재 상황에 대한 현실적인 분석과 두 선택지가 갖는 의미",
  "options": [
    {
      "type": "A",
      "title": "선택 A: ${choiceA}",
      "description": "${choiceA}를 선택했을 때 펼쳐질 5년 뒤의 일상 묘사",
      "survivalRate": 72,
      "survivalReason": "현재 경제 성장률과 해당 분야 상황을 고려했을 때의 성공 확률 산출 근거 (예: 현재 경제 상황을 고려했을 때 이 시나리오의 성공 확률은 72%입니다)",
      "fakeNewsHeadline": "2031년, [A선택 관련 키워드] 시대 도래... [극적인 뉴스 헤드라인]",
      "imagePrompt": "English prompt for generating a realistic visualization of this path...",
      "statChanges": {
        "경제력": 10, 
        "행복도": 5,
        "회복탄력성": 5,
        "번아웃확률": -10
      },
      "timeline": {
        "months_3": { "content": "내용...", "핵심성과": "...", "예상치못한변수": "...", "정신적상태": "..." },
        "year_1": { "content": "내용...", "핵심성과": "...", "예상치못한변수": "...", "정신적상태": "..." },
        "year_5": { "content": "내용...", "핵심성과": "...", "예상치못한변수": "...", "정신적상태": "..." }
      },
      "futureMeGreeting": "5년 뒤의 미래에서 온 내가 건네는 첫 인사 (예: 안녕? 그때 그 선택을 했던 나야. 지금 나는...)",
      "actionPlan": {
        "immediate": "24시간 이내에 할 수 있는 아주 작은 행동 (구체적인 동사로 끝날 것)",
        "weekly": "이번 주 안에 완료해야 할 구체적 과제 (구체적인 동사로 끝날 것)",
        "investment": "장기적 관점에서 지금 투자해야 할 역량이나 자원 제안 (구체적인 동사로 끝날 것)"
      }
    },
    {
      "type": "B",
      "title": "선택 B: ${choiceB}",
      "description": "${choiceB}를 선택했을 때 펼쳐질 5년 뒤의 일상 묘사",
      "survivalRate": 45,
      "survivalReason": "하이리스크에 대한 통계적 수치 및 근거",
      "fakeNewsHeadline": "2031년, [B선택 관련 키워드] 충격... [극적인 뉴스 헤드라인]",
      "imagePrompt": "English prompt for generating a dramatic visualization of this path...",
      "statChanges": {
        "경제력": 30,
        "행복도": 20,
        "회복탄력성": -15,
        "번아웃확률": 25
      },
      "timeline": {
        "months_3": { "content": "내용...", "핵심성과": "...", "예상치못한변수": "...", "정신적상태": "..." },
        "year_1": { "content": "내용...", "핵심성과": "...", "예상치못한변수": "...", "정신적상태": "..." },
        "year_5": { "content": "내용...", "핵심성과": "...", "예상치못한변수": "...", "정신적상태": "..." }
      },
      "futureMeGreeting": "5년 뒤의 미래에서 온 내가 건네는 첫 인사 (예: 안녕? 그때 그 선택을 했던 나야. 지금 나는...)",
      "actionPlan": {
        "immediate": "24시간 이내에 할 수 있는 아주 작은 행동 (구체적인 동사로 끝날 것)",
        "weekly": "이번 주 안에 완료해야 할 구체적 과제 (구체적인 동사로 끝날 것)",
        "investment": "장기적 관점에서 지금 투자해야 할 역량이나 자원 제안 (구체적인 동사로 끝날 것)"
      }
    }
  ]
}
`;

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-3-flash-preview',
      generationConfig: {
        temperature: 0.8,
        responseMimeType: "application/json",
      }
    });
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    let parsedScenario;
    try {
      const cleanText = text.replace(/```json\n?/g, '').replace(/```/g, '').trim();
      parsedScenario = JSON.parse(cleanText);
    } catch (parseError) {
      console.error("Failed to parse JSON:", text);
      throw new Error("AI가 유효하지 않은 응답을 반환했습니다.");
    }

    return NextResponse.json({ scenario: parsedScenario });
  } catch (error: any) {
    console.error('Gemini API Error:', error);
    return NextResponse.json(
      { error: '시나리오를 생성하는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
