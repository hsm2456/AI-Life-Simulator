const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI('AIzaSyBZs0ZIfxAsTDLZZ2d2syC6EwiaNwuNdBE');

async function run() {
  const prompt = `
당신은 인간의 마음과 현실의 벽을 꿰뚫어보는 '센티언트(Sentient) 인생 전략가'입니다. 
단순한 텍스트 분석을 넘어, 사용자가 직면한 두 가지 갈림길의 미래를 5년 후까지 구체적으로 시뮬레이션합니다.

[사용자 기본 정보 및 내면 상태]
- 나이: 25세
- 현재 직업/상태: 학생
- 동적 응답 1: 3학기
- 동적 응답 2: 4000
- 경제적 상황: 부족함
- MBTI 성향: INTJ
- 인생의 1순위 목표: 성공/돈
- 리스크 감수도 (1~10): 5
- 사회적 지지망: 보통
- 현재 에너지/건강 상태: 양호

[사용자 고민 이야기]
"고민입니다"

[선택의 기로]
- 선택 A: 대기업
- 선택 B: 창업

[요구사항]
위 정보를 바탕으로 두 선택지가 어떻게 다른 결말을 맞이하는지 5년 후 인생 시나리오를 나란히 비교해 설계하세요.
반드시 70%의 현실적이고 냉혹한 팩트폭력과 30%의 돌파구 제안 비율로 분석을 구성하세요.
각 시나리오마다 해당 시나리오의 미래 모습을 극적으로 묘사하는 영문 이미지 프롬프트(imagePrompt)를 작성하세요 (고품질 사진 느낌).

반드시 아래 JSON 스키마를 엄격히 준수하여 마크다운 코드블록 없이 순수 JSON 문자열만 반환하세요.
{
  "intentAnalysis": "사용자의 텍스트와 기본 정보에서 읽어낸 핵심 고민 분석 (센티언트 시점의 날카로운 통찰)",
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
      "title": "선택 A: 대기업",
      "description": "대기업를 선택했을 때 펼쳐질 5년 뒤의 일상 묘사",
      "survivalRate": 72,
      "survivalReason": "현재 경제 성장률과 해당 분야 상황을 고려했을 때의 생존 확률 산출 근거 (예: 현재 경제 상황을 고려했을 때 이 시나리오의 생존 확률은 72%입니다)",
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
      "futureMeGreeting": "5년 뒤의 미래에서 온 내가 건네는 첫 인사 (예: 안녕? 그때 그 선택을 했던 나야. 지금 나는...)"
    },
    {
      "type": "B",
      "title": "선택 B: 창업",
      "description": "창업를 선택했을 때 펼쳐질 5년 뒤의 일상 묘사",
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
      "futureMeGreeting": "5년 뒤의 미래에서 온 내가 건네는 첫 인사 (예: 안녕? 그때 그 선택을 했던 나야. 지금 나는...)"
    }
  ]
}
`;
  try {
    const m = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash', 
      generationConfig: { temperature: 0.8, responseMimeType: 'application/json' } 
    });
    const r = await m.generateContent(prompt);
    const response = await r.response;
    console.log('success:', response.text().substring(0, 100));
  } catch(e) {
    console.error('error:', e.message);
  }
}
run();
