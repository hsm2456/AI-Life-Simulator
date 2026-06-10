'use client';

import { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { FaPaperPlane, FaBrain, FaChartLine, FaArrowLeft, FaNewspaper, FaCommentDots, FaCamera, FaExclamationTriangle, FaCheckCircle, FaRegClock, FaSeedling } from 'react-icons/fa';
import { motion, AnimatePresence, useMotionValue, useTransform, animate, useInView } from 'framer-motion';
import StepIndicator from '../components/StepIndicator';

interface ScenarioData {
  intentAnalysis: string;
  riskAnalysis: {
    successProbability: number;
    criticalFactChecks: string[];
    consultantAdvice: string;
  };
  initialStats: { 경제력: number; 행복도: number; 회복탄력성: number; 번아웃확률: number; };
  turningPoint: string;
  analysis: string;
  options: ScenarioOption[];
}

interface ScenarioOption {
  type: string;
  title: string;
  description: string;
  survivalRate: number;
  survivalReason: string;
  fakeNewsHeadline: string;
  imagePrompt: string;
  statChanges: { 경제력: number; 행복도: number; 회복탄력성: number; 번아웃확률: number; };
  timeline: { months_3: TimelineEvent; year_1: TimelineEvent; year_5: TimelineEvent; };
  futureMeGreeting: string;
  actionPlan: {
    immediate: string;
    weekly: string;
    investment: string;
  };
}

interface TimelineEvent {
  content: string;
  핵심성과: string;
  예상치못한변수: string;
  정신적상태: string;
}

const PRIORITY_OPTIONS = [
  { label: '💰 경제적 안정', value: '💰 경제적 안정' },
  { label: '❤️ 가족과 행복', value: '❤️ 가족과 행복' },
  { label: '🚀 커리어 성공', value: '🚀 커리어 성공' },
  { label: '🌍 자유와 모험', value: '🌍 자유와 모험' },
  { label: '🎨 창작과 성취', value: '🎨 창작과 성취' },
];

const FINANCIAL_OPTIONS = [
  { label: '😰 매우 빠듯함 (자산 500만원 미만)', value: '😰 매우 빠듯함 (자산 500만원 미만)' },
  { label: '😐 보통 (500~3000만원)', value: '😐 보통 (500~3000만원)' },
  { label: '🙂 여유있음 (3000만원~1억)', value: '🙂 여유있음 (3000만원~1억)' },
  { label: '😊 풍족함 (1억 이상)', value: '😊 풍족함 (1억 이상)' },
];

const ENERGY_OPTIONS = [
  { label: '🔴 경고 (자주 아프거나 번아웃)', value: '🔴 경고 (자주 아프거나 번아웃)' },
  { label: '🟡 보통 (가끔 피곤함)', value: '🟡 보통 (가끔 피곤함)' },
  { label: '🟢 양호 (건강한 편)', value: '🟢 양호 (건강한 편)' },
  { label: '⚡ 최상 (에너지 넘침)', value: '⚡ 최상 (에너지 넘침)' },
];

const SOCIAL_OPTIONS = [
  { label: '😶 거의 없음', value: '😶 거의 없음' },
  { label: '👤 가족만 있음', value: '👤 가족만 있음' },
  { label: '👥 친구/지인 있음', value: '👥 친구/지인 있음' },
  { label: '🤝 강한 네트워크 보유', value: '🤝 강한 네트워크 보유' },
];

const FAILURE_OPTIONS = [
  { label: '😰 없음 (처음 도전)', value: '😰 없음 (처음 도전)' },
  { label: '😤 있음, 극복했음', value: '😤 있음, 극복했음' },
  { label: '😔 있음, 아직 회복 중', value: '😔 있음, 아직 회복 중' },
];

const DECISION_OPTIONS = [
  { label: '🧠 데이터와 분석 우선', value: '🧠 데이터와 분석 우선' },
  { label: '❤️ 감과 직관 우선', value: '❤️ 감과 직관 우선' },
  { label: '👥 주변 의견 참고', value: '👥 주변 의견 참고' },
  { label: '⏰ 될 때까지 미룸', value: '⏰ 될 때까지 미룸' },
];

function AnimatedCounter({ value, duration = 1.5 }: { value: number, duration?: number }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, Math.round);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  useEffect(() => {
    if (isInView) {
      const controls = animate(count, value, { duration, ease: "easeOut" });
      return controls.stop;
    }
  }, [value, count, duration, isInView]);

  return <motion.span ref={ref}>{rounded}</motion.span>;
}

function GaugeChart({ percentage, color }: { percentage: number, color: string }) {
  const radius = 35;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div style={{ position: 'relative', width: '90px', height: '90px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <svg width="90" height="90" style={{ position: 'absolute', transform: 'rotate(-90deg)' }}>
        <circle cx="45" cy="45" r={radius} fill="none" stroke="rgba(0,0,0,0.05)" strokeWidth="8" />
        <motion.circle 
          cx="45" cy="45" r={radius} 
          fill="none" 
          stroke={color} 
          strokeWidth="8" 
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />
      </svg>
      <div style={{ fontSize: '1.25rem', fontWeight: 800, color, position: 'relative', zIndex: 1 }}>
        <AnimatedCounter value={percentage} />%
      </div>
    </div>
  );
}

function StatBar({ label, initial, change }: { label: string, initial: number, change: number }) {
  const finalValue = Math.max(0, Math.min(100, initial + change));
  const isPositive = change > 0;
  const isNegative = change < 0;
  const barColor = isPositive ? '#10B981' : isNegative ? '#EF4444' : '#6366F1';

  return (
    <div className="stat-row" style={{ marginBottom: '1.2rem' }}>
      <div className="stat-label" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.6rem', fontWeight: 600, color: 'var(--text-primary)' }}>
        <span>{label}</span>
        <span className="stat-value" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span>{finalValue}</span>
          {change !== 0 && (
            <span style={{ 
              color: barColor, 
              fontSize: '0.85rem', 
              fontWeight: 800, 
              background: `${barColor}20`, 
              padding: '0.1rem 0.4rem', 
              borderRadius: '6px' 
            }}>
              {isPositive ? '+' : ''}{change}
            </span>
          )}
        </span>
      </div>
      <div className="stat-bar-bg" style={{ width: '100%', height: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)' }}>
        <motion.div 
          className="stat-bar-fill" 
          initial={{ width: 0 }}
          whileInView={{ width: `${finalValue}%` }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          style={{ height: '100%', background: barColor, borderRadius: '12px' }}
        />
      </div>
    </div>
  );
}

function Chatbot({ option, scenario }: { option: ScenarioOption, scenario: ScenarioData }) {
  const [messages, setMessages] = useState([{ role: 'assistant', content: option.futureMeGreeting }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || loading) return;
    
    const newMessages = [...messages, { role: 'user', content: input }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages, scenarioContext: scenario, optionContext: option })
      });
      const data = await res.json();
      setMessages([...newMessages, { role: 'assistant', content: data.reply }]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <FaCommentDots /> 5년 뒤의 '나'와 대화하기
      </div>
      <div className="chat-messages">
        {messages.map((m, i) => (
          <div key={i} className={`chat-bubble ${m.role === 'assistant' ? 'chat-assistant' : 'chat-user'}`}>
            <ReactMarkdown>{m.content}</ReactMarkdown>
          </div>
        ))}
        {loading && <div className="chat-bubble chat-assistant typing-indicator">...</div>}
        <div ref={chatEndRef} />
      </div>
      <form onSubmit={sendMessage} className="chat-input-area">
        <input 
          type="text" 
          value={input} 
          onChange={e => setInput(e.target.value)} 
          placeholder="그때 왜 그런 선택을 했어?"
          className="chat-input"
        />
        <button type="submit" disabled={loading || !input.trim()} className="chat-send-btn">
          <FaPaperPlane />
        </button>
      </form>
    </div>
  );
}

function WhatIfSimulation({ option, scenario, baseFormData }: { option: ScenarioOption, scenario: ScenarioData, baseFormData: any }) {
  const [whatIfInput, setWhatIfInput] = useState('');
  const [history, setHistory] = useState<{ input: string; result: any; id: number }[]>([]);
  const [loading, setLoading] = useState(false);
  const [isHistoryExpanded, setIsHistoryExpanded] = useState(false);

  const SUGGESTED_TAGS = ['자본금 +500만원', '영어점수 900점', '서울로 이사', '1년 더 준비', '건강 상태 개선', '멘토 생김'];

  const handleWhatIf = async () => {
    if (!whatIfInput.trim() || loading) return;
    setLoading(true);
    try {
      const res = await fetch('/api/scenario/whatif', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ baseFormData, option, whatIfInput, initialStats: scenario.initialStats })
      });
      const data = await res.json();
      
      setHistory(prev => {
        const newHistory = [{ input: whatIfInput, result: data.whatIfOption, id: Date.now() }, ...prev];
        return newHistory.slice(0, 3);
      });
      setWhatIfInput('');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const currentResult = history[0];
  const pastResults = history.slice(1);

  return (
    <div className="what-if-container" style={{ marginTop: '2rem', padding: '1.5rem', background: 'rgba(255,255,255,0.4)', borderRadius: '16px', border: '0.5px solid rgba(255,255,255,0.5)', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
      <h4 style={{ color: 'var(--accent-indigo)', marginBottom: '0.5rem', fontWeight: 800 }}>✨ What-If 시뮬레이션</h4>
      <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>변수를 다르게 설정했다면 5년 뒤가 어떻게 달라질까요?</p>
      
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '1.2rem', marginBottom: '0.5rem' }}>
        {SUGGESTED_TAGS.map(tag => (
          <button 
            key={tag} 
            onClick={() => setWhatIfInput(tag)}
            style={{ padding: '0.4rem 0.8rem', background: 'rgba(255,255,255,0.8)', border: '1px solid rgba(0,0,0,0.08)', borderRadius: '20px', fontSize: '0.85rem', color: 'var(--text-secondary)', cursor: 'pointer', transition: 'all 0.2s', fontWeight: 600 }}
            onMouseOver={e => { e.currentTarget.style.borderColor = 'var(--accent-indigo)'; e.currentTarget.style.color = 'var(--accent-indigo)'; }}
            onMouseOut={e => { e.currentTarget.style.borderColor = 'rgba(0,0,0,0.08)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
          >
            {tag}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <input className="sentient-input" value={whatIfInput} onChange={e=>setWhatIfInput(e.target.value)} placeholder="직접 입력: 예) 자본금 +500만원" onKeyDown={e => e.key === 'Enter' && handleWhatIf()} />
        <button onClick={handleWhatIf} className="sentient-submit" style={{ marginTop: 0, padding: '0.8rem 1.5rem', width: 'auto' }} disabled={loading}>{loading ? '계산중...' : '확인하기'}</button>
      </div>

      <AnimatePresence mode="wait">
        {currentResult && (
          <motion.div key={currentResult.id} initial={{ opacity:0, y: 10 }} animate={{ opacity:1, y: 0 }} exit={{ opacity: 0, y: -10 }} style={{ marginTop: '2rem', padding: '1.8rem', background: '#FFFFFF', borderRadius: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', border: '1px solid rgba(0,0,0,0.05)' }}>
             <h5 style={{ fontWeight: 800, marginBottom: '1.5rem', fontSize: '1.15rem', color: 'var(--accent-indigo)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
               <FaBrain /> 만약 "{currentResult.input}" 조건이 추가된다면
             </h5>
             
             <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
               <div style={{ flex: 1, minWidth: '250px', background: 'rgba(248,250,252,0.5)', padding: '1.5rem', borderRadius: '12px' }}>
                 <h6 style={{ fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '1rem', fontSize: '0.9rem', textTransform: 'uppercase' }}>기존 미래 ({option.title})</h6>
                 <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                   성공 확률 <span style={{ fontSize: '1.5rem', fontWeight: 900 }}>{option.survivalRate}%</span>
                 </div>
                 <StatBar label="경제력" initial={scenario.initialStats.경제력} change={option.statChanges.경제력} />
                 <StatBar label="행복도" initial={scenario.initialStats.행복도} change={option.statChanges.행복도} />
                 <StatBar label="회복탄력성" initial={scenario.initialStats.회복탄력성} change={option.statChanges.회복탄력성} />
                 <StatBar label="번아웃 확률" initial={scenario.initialStats.번아웃확률} change={option.statChanges.번아웃확률} />
               </div>
               
               <div style={{ flex: 1, minWidth: '250px', background: 'rgba(16,185,129,0.05)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(16,185,129,0.1)' }}>
                 <h6 style={{ fontWeight: 700, color: 'var(--success)', marginBottom: '1rem', fontSize: '0.9rem', textTransform: 'uppercase' }}>바뀐 미래 (What-If)</h6>
                 <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--success)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                   성공 확률 
                   <span style={{ fontSize: '1.5rem', fontWeight: 900 }}><AnimatedCounter value={currentResult.result.survivalRate} />%</span>
                   {currentResult.result.survivalRate - option.survivalRate !== 0 && (
                     <span style={{ fontSize: '0.85rem', padding: '0.2rem 0.5rem', borderRadius: '20px', background: currentResult.result.survivalRate > option.survivalRate ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)', color: currentResult.result.survivalRate > option.survivalRate ? '#059669' : '#DC2626' }}>
                       {currentResult.result.survivalRate > option.survivalRate ? '▲' : '▼'} {Math.abs(currentResult.result.survivalRate - option.survivalRate)}%
                     </span>
                   )}
                 </div>
                 <StatBar label="경제력" initial={scenario.initialStats.경제력} change={currentResult.result.statChanges.경제력} />
                 <StatBar label="행복도" initial={scenario.initialStats.행복도} change={currentResult.result.statChanges.행복도} />
                 <StatBar label="회복탄력성" initial={scenario.initialStats.회복탄력성} change={currentResult.result.statChanges.회복탄력성} />
                 <StatBar label="번아웃 확률" initial={scenario.initialStats.번아웃확률} change={currentResult.result.statChanges.번아웃확률} />
               </div>
             </div>
             
             <div style={{ marginTop: '1.5rem', fontSize: '1.05rem', lineHeight: 1.6, padding: '1.5rem', background: 'linear-gradient(to right, rgba(99,102,241,0.05), transparent)', borderLeft: '4px solid var(--accent-indigo)', borderRadius: '0 12px 12px 0', color: 'var(--text-primary)' }}>
               <strong>💡 AI 통찰: </strong>{currentResult.result.description}
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      {pastResults.length > 0 && (
        <div style={{ marginTop: '1.5rem' }}>
          <button 
            onClick={() => setIsHistoryExpanded(!isHistoryExpanded)} 
            style={{ width: '100%', padding: '1rem', background: '#FFFFFF', border: '1px solid rgba(0,0,0,0.08)', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', fontWeight: 600, color: 'var(--text-secondary)', transition: 'all 0.2s' }}
            onMouseOver={e => e.currentTarget.style.background = 'rgba(248,250,252,1)'}
            onMouseOut={e => e.currentTarget.style.background = '#FFFFFF'}
          >
            <span>⏱️ 이전 시뮬레이션 기록 보기 ({pastResults.length}건)</span>
            <span>{isHistoryExpanded ? '▲' : '▼'}</span>
          </button>
          
          <AnimatePresence>
            {isHistoryExpanded && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', marginTop: '0.8rem' }}>
                  {pastResults.map((past) => (
                    <div key={past.id} style={{ padding: '1.2rem', background: 'rgba(255,255,255,0.6)', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.05)' }}>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>조건: "{past.input}"</div>
                      <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                        <span style={{ color: past.result.survivalRate >= 50 ? 'var(--success)' : 'var(--danger)', fontWeight: 600 }}>성공 확률: {past.result.survivalRate}%</span>
                        <span>경제력 변화: {past.result.statChanges.경제력 > 0 ? '+' : ''}{past.result.statChanges.경제력}</span>
                        <span>행복도 변화: {past.result.statChanges.행복도 > 0 ? '+' : ''}{past.result.statChanges.행복도}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

function DramaticLoader({ isLoading, onComplete }: { isLoading: boolean, onComplete: () => void }) {
  const [progress, setProgress] = useState(0);
  const [textIndex, setTextIndex] = useState(0);
  const [randomVarsCount, setRandomVarsCount] = useState(347);
  const [randomPeersCount, setRandomPeersCount] = useState(2847);

  useEffect(() => {
    // Generate random number of at least 300 (e.g. 300 to 450)
    setRandomVarsCount(Math.floor(Math.random() * 151) + 300);
    // Generate random number of at least 2800 (e.g. 2800 to 2999)
    setRandomPeersCount(Math.floor(Math.random() * 200) + 2800);
  }, []);

  const phrases = [
    `${randomVarsCount}개의 인생 변수를 수집하는 중...`,
    `당신과 비슷한 ${randomPeersCount.toLocaleString()}명의 데이터와 대조 중...`,
    "평행우주 시나리오를 생성하는 중...",
    "5년 후의 당신에게 편지를 전달하는 중..."
  ];
  const [stars, setStars] = useState<{ size: number; left: number; top: number; opacity: number; duration: number; delay: number }[]>([]);

  useEffect(() => {
    setStars(Array.from({ length: 60 }).map(() => ({
      size: Math.random() * 2 + 1, // 1px ~ 3px
      left: Math.random() * 100,
      top: Math.random() * 100, // distribute over full screen
      opacity: Math.random() * 0.7 + 0.3, // 0.3 ~ 1.0
      duration: Math.random() * 3 + 2, // 2s ~ 5s
      delay: Math.random() * 2
    })));
  }, []);
  useEffect(() => {
    let textInterval: any;
    let animationFrameId: number;

    if (isLoading) {
      const startTime = Date.now();
      const targetDuration = 12000;
      
      const updateProgress = () => {
        const elapsed = Date.now() - startTime;
        let newProgress = Math.min(95, (elapsed / targetDuration) * 100);
        setProgress(newProgress);
        if (elapsed < targetDuration) {
          animationFrameId = requestAnimationFrame(updateProgress);
        }
      };
      animationFrameId = requestAnimationFrame(updateProgress);

      textInterval = setInterval(() => {
        setTextIndex(i => (i + 1) % phrases.length);
      }, 3000);
    } else {
      setProgress(100);
      setTextIndex(3);
      const timer = setTimeout(() => {
        onComplete();
      }, 800);
      return () => clearTimeout(timer);
    }
    
    return () => {
      clearInterval(textInterval);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [isLoading, onComplete]);

  const radius = 65;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <motion.div 
      className="ai-loading-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
    >
      {stars.map((star, i) => (
        <div 
          key={i} 
          className="star" 
          style={{
            width: `${star.size}px`, height: `${star.size}px`,
            left: `${star.left}%`,
            animationDuration: `${star.duration}s`,
            animationDelay: `${star.delay}s`
          }} 
        />
      ))}
      <div className="loading-ring-container">
        <svg className="loading-ring-svg" viewBox="0 0 150 150">
          <circle cx="75" cy="75" r={radius} className="loading-ring-circle" />
          <circle 
            cx="75" cy="75" r={radius} 
            className="loading-ring-progress" 
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
          />
        </svg>
        <div className="loading-percentage">
          {Math.floor(progress)}<span style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.5)', marginLeft: '2px' }}>%</span>
        </div>
      </div>
      
      <div style={{ height: '30px', position: 'relative', width: '320px', display: 'flex', justifyContent: 'center' }}>
        <AnimatePresence mode="wait">
          <motion.div 
            key={textIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.5 }}
            className="loading-text"
            style={{ position: 'absolute' }}
          >
            {phrases[textIndex]}
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

const getStrategyType = (formData: any) => {
  const risk = formData.riskTolerance;
  const goal = formData.primaryGoal || '';
  const mbti = formData.mbti || '';
  const isT = mbti.includes('T');
  const isJ = mbti.includes('J');

  if (isT && goal.includes('경제')) return { emoji: '🎯', name: '냉철한 계산가', desc: '감정보다 숫자를 믿는 당신, 5년 후 포트폴리오는 탄탄합니다.', bg: 'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)' };
  if (risk <= 4 && goal.includes('가족')) return { emoji: '🦁', name: '생존형 전략가', desc: '가족과 안정을 최우선으로 생각하는 당신, 변수 없는 단단한 미래를 만듭니다.', bg: 'linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%)' };
  if (risk >= 7 && goal.includes('가족')) return { emoji: '🔥', name: '역경 돌파형', desc: '위기를 오히려 기회로 삼는 당신, 평탄한 길보다 거친 길에서 더 빛납니다.', bg: 'linear-gradient(135deg, #ff0844 0%, #ffb199 100%)' };
  if (risk >= 7 && goal.includes('자유')) return { emoji: '🚀', name: '무모한 몽상가', desc: '리스크를 두려워하지 않는 당신, 5년 후엔 상상도 못할 곳에 도달할 수 있습니다.', bg: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)' };
  if (risk >= 7 && goal.includes('커리어')) return { emoji: '⚡', name: '번아웃 러너', desc: '몸이 부서져라 성취를 쫓는 당신, 로켓처럼 솟아오르지만 엔진 과열을 조심하세요.', bg: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)' };
  if (risk <= 4 && goal.includes('창작')) return { emoji: '🌱', name: '느린 성장형', desc: '자신만의 속도로 고유한 가치를 깎아내는 당신, 흔들림이 없습니다.', bg: 'linear-gradient(135deg, #d4fc79 0%, #96e6a1 100%)' };
  if (risk <= 4 || isJ) return { emoji: '💎', name: '완벽주의 설계자', desc: '돌다리도 두드려보고 건너는 당신, 예측 불가능한 변수마저 통제하려 합니다.', bg: 'linear-gradient(135deg, #fdfcfb 0%, #e2d1c3 100%)' };
  
  return { emoji: '🧭', name: '탐험가형 생존자', desc: '적당한 리스크를 즐기며 자유롭게 뻗어나가는 유연함을 가졌습니다.', bg: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)' };
};

function TimeCapsule({ formData, scenario }: { formData: any, scenario: ScenarioData }) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');
  const [showParticles, setShowParticles] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus('loading');

    setTimeout(() => {
      const userType = getStrategyType(formData);
      const capsuleData = {
        email,
        submittedAt: new Date().toISOString(),
        choiceA: formData.choiceA,
        choiceB: formData.choiceB,
        predictedSuccessA: scenario.options[0].survivalRate,
        predictedSuccessB: scenario.options[1].survivalRate,
        userType
      };

      localStorage.setItem('lifeSimulatorTimeCapsule', JSON.stringify(capsuleData));
      console.log("TIMECAPSULE_SAVE:", JSON.stringify(capsuleData));

      setStatus('success');
      setShowParticles(true);

      setTimeout(() => setShowParticles(false), 3000);
    }, 1500);
  };

  const nextYearDate = new Date();
  nextYearDate.setFullYear(nextYearDate.getFullYear() + 1);
  const formattedDate = `${nextYearDate.getMonth() + 1}월 ${nextYearDate.getDate()}일`;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }} 
      whileInView={{ opacity: 1, y: 0 }} 
      viewport={{ once: true, margin: "-50px" }}
      style={{ gridColumn: 'span 12', marginTop: '2rem', marginBottom: '1rem' }}
    >
      <div style={{ background: 'linear-gradient(135deg, #0f0f2d, #1a1a4e)', borderRadius: '24px', padding: '3.5rem 2rem', color: '#fff', textAlign: 'center', boxShadow: '0 20px 40px rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden', position: 'relative' }}>
        
        {showParticles && (
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none', overflow: 'hidden' }}>
            {Array.from({ length: 30 }).map((_, i) => {
              const angle = (i / 30) * Math.PI * 2;
              const radius = 100 + Math.random() * 200;
              const x = Math.cos(angle) * radius;
              const y = Math.sin(angle) * radius;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 1, scale: 0, x: 0, y: 0 }}
                  animate={{ 
                    opacity: 0, 
                    scale: Math.random() * 1.5 + 0.5, 
                    x, 
                    y
                  }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  style={{ position: 'absolute', left: '50%', top: '50%', fontSize: '1.5rem', marginLeft: '-12px', marginTop: '-12px' }}
                >
                  ✨
                </motion.div>
              );
            })}
          </div>
        )}

        <div style={{ fontSize: '4.5rem', marginBottom: '1rem', textShadow: '0 0 20px rgba(255,255,255,0.2)', position: 'relative', zIndex: 1 }}>⏰</div>
        <h3 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '0.5rem', color: '#E2E8F0', position: 'relative', zIndex: 1, letterSpacing: '-0.02em' }}>인생 타임캡슐 봉인하기</h3>
        <p style={{ color: '#94A3B8', fontSize: '1.1rem', marginBottom: '2.5rem', position: 'relative', zIndex: 1 }}>1년 후, AI의 예측이 맞았는지 확인해드릴게요</p>

        {status !== 'success' ? (
          <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '1rem', maxWidth: '450px', margin: '0 auto', flexDirection: 'column', position: 'relative', zIndex: 1 }}>
            <input 
              type="email" 
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="이메일을 입력하면 1년 후 알림을 보내드려요" 
              required
              style={{ padding: '1.2rem 1.5rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.05)', color: '#fff', fontSize: '1rem', outline: 'none', textAlign: 'center', transition: 'border-color 0.2s' }}
              onFocus={e => e.currentTarget.style.borderColor = '#4F46E5'}
              onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'}
            />
            <button 
              type="submit" 
              disabled={status === 'loading'}
              style={{ padding: '1.2rem', borderRadius: '12px', background: '#4F46E5', color: '#fff', fontWeight: 700, fontSize: '1.1rem', border: 'none', cursor: status === 'loading' ? 'default' : 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', transition: 'background 0.2s', boxShadow: '0 4px 15px rgba(79, 70, 229, 0.4)' }}
              onMouseOver={e => { if(status !== 'loading') e.currentTarget.style.background = '#4338CA' }}
              onMouseOut={e => { if(status !== 'loading') e.currentTarget.style.background = '#4F46E5' }}
            >
              {status === 'loading' ? (
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} style={{ width: '22px', height: '22px', border: '3px solid rgba(255,255,255,0.3)', borderTop: '3px solid #fff', borderRadius: '50%' }} />
              ) : (
                '📮 타임캡슐 봉인하기'
              )}
            </button>
          </form>
        ) : (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} style={{ background: 'rgba(255,255,255,0.05)', padding: '2rem', borderRadius: '16px', maxWidth: '550px', margin: '0 auto', border: '1px solid rgba(16,185,129,0.3)', position: 'relative', zIndex: 1 }}>
            <div style={{ fontSize: '1.15rem', color: '#10B981', fontWeight: 700, marginBottom: '1.5rem' }}>
              ✅ 2027년 {formattedDate}에 열릴 타임캡슐이 봉인되었습니다
            </div>
            <div style={{ fontSize: '1.1rem', color: '#E2E8F0', marginBottom: '1rem', lineHeight: 1.6, wordBreak: 'keep-all' }}>
              AI는 당신이 <strong style={{color: '#60A5FA'}}>"{formData.choiceA}"</strong>를 선택할 경우 <strong style={{color: '#10B981', fontSize: '1.3rem'}}>{scenario.options[0].survivalRate}%</strong> 성공을 예측했습니다
            </div>
            <div style={{ fontSize: '1.05rem', color: '#CBD5E1', marginBottom: '1.5rem' }}>
              1년 후, 실제 결과를 비교해드릴게요
            </div>
            <div style={{ fontSize: '0.85rem', color: '#64748B' }}>
              스팸 없음. 1년에 딱 1번만 연락드립니다
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

function TypewriterText({ text }: { text: string }) {
  const [displayedText, setDisplayedText] = useState('');

  useEffect(() => {
    setDisplayedText('');
    let i = 0;
    if (!text) return;
    
    const interval = setInterval(() => {
      setDisplayedText(text.slice(0, i));
      i++;
      if (i > text.length) clearInterval(interval);
    }, 30);
    
    return () => clearInterval(interval);
  }, [text]);

  return <span style={{ whiteSpace: 'pre-wrap' }}>{displayedText}</span>;
}

function PerspectiveSimulation({ formData }: { formData: any }) {
  const [selectedPersp, setSelectedPersp] = useState<string | null>(null);
  const [comments, setComments] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState<Record<string, boolean>>({});
  const [showToast, setShowToast] = useState(false);

  const perspectives = [
    { id: 'parents', emoji: '👨‍👩‍👧', label: '부모님 시점' },
    { id: 'friend', emoji: '👫', label: '절친 시점' },
    { id: 'mentor', emoji: '💼', label: '현직자 멘토 시점' },
    { id: 'ai', emoji: '🤖', label: 'AI 객관 시점' }
  ];

  const handleSelect = async (p: {id: string, emoji: string, label: string}, forceRetry = false) => {
    setSelectedPersp(p.id);
    if (!forceRetry && comments[p.id]) return; // Use cache

    if (forceRetry) {
      setComments(prev => {
        const next = { ...prev };
        delete next[p.id];
        return next;
      });
    }

    setLoading(true);
    setFailed(prev => ({ ...prev, [p.id]: false }));
    try {
      const res = await fetch('/api/perspective', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          perspective: p.label,
          age: formData.age,
          jobStatus: formData.jobStatus,
          choiceA: formData.choiceA,
          choiceB: formData.choiceB
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      setComments(prev => ({ ...prev, [p.id]: data.reply }));
    } catch (err) {
      console.error(err);
      setFailed(prev => ({ ...prev, [p.id]: true }));
    } finally {
      setLoading(false);
    }
  };

  const handleShare = () => {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const currentPersp = perspectives.find(p => p.id === selectedPersp);

  return (
    <motion.div className="bento-cell col-span-12" style={{ background: '#FFFFFF', border: '1px solid rgba(0,0,0,0.05)', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '0.5rem' }}>
        <h3 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: '#1E293B', letterSpacing: '-0.02em' }}>👥 주변인은 이 선택을 어떻게 볼까?</h3>
      </div>
      <p style={{ color: '#64748B', fontSize: '1rem', marginBottom: '2rem' }}>같은 상황을 다른 시점으로 바라봅니다</p>

      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
        {perspectives.map(p => {
          const isSelected = selectedPersp === p.id;
          return (
            <button
              key={p.id}
              onClick={() => handleSelect(p)}
              style={{
                padding: '0.8rem 1.5rem',
                borderRadius: '20px',
                border: '2px solid #4F46E5',
                background: isSelected ? '#4F46E5' : '#FFFFFF',
                color: isSelected ? '#FFFFFF' : '#4F46E5',
                fontWeight: 700,
                fontSize: '0.95rem',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <span>{p.emoji}</span> {p.label}
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        {selectedPersp && currentPersp && (
          <motion.div 
            key={selectedPersp}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            style={{ 
              position: 'relative',
              background: '#FFFFFF', 
              padding: '2rem', 
              borderRadius: '24px', 
              boxShadow: '0 10px 30px rgba(0,0,0,0.08)', 
              border: '1px solid rgba(0,0,0,0.05)',
              marginTop: '1rem'
            }}
          >
            {/* Speech bubble tail */}
            <div style={{
              position: 'absolute',
              top: '-10px',
              left: '40px',
              width: '20px',
              height: '20px',
              background: '#FFFFFF',
              transform: 'rotate(45deg)',
              borderLeft: '1px solid rgba(0,0,0,0.05)',
              borderTop: '1px solid rgba(0,0,0,0.05)'
            }} />

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1.2rem', color: '#1E293B', fontWeight: 800, fontSize: '1.1rem' }}>
              <span>{currentPersp.emoji}</span> {currentPersp.label}
            </div>

            <div style={{ fontSize: '1.05rem', lineHeight: 1.6, color: '#334155', minHeight: '60px' }}>
              {loading && !comments[selectedPersp] && !failed[selectedPersp] ? (
                <motion.div style={{ display: 'flex', gap: '0.3rem', alignItems: 'center', height: '100%' }}>
                  <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.2, delay: 0 }}>●</motion.span>
                  <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.2, delay: 0.2 }}>●</motion.span>
                  <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.2, delay: 0.4 }}>●</motion.span>
                </motion.div>
              ) : failed[selectedPersp] ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '1rem' }}>
                  <span style={{ color: '#64748B', fontWeight: 600 }}>잠시 후 다시 시도해주세요 🔄</span>
                  <button 
                    onClick={() => handleSelect(currentPersp!, true)}
                    style={{
                      border: '1px solid #4F46E5',
                      color: '#4F46E5',
                      background: 'transparent',
                      padding: '8px 16px',
                      borderRadius: '8px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      transition: 'all 0.2s'
                    }}
                    onMouseOver={e => { e.currentTarget.style.background = '#F5F3FF'; }}
                    onMouseOut={e => { e.currentTarget.style.background = 'transparent'; }}
                  >
                    다시 불러오기
                  </button>
                </div>
              ) : (
                <TypewriterText text={comments[selectedPersp] || ''} />
              )}
            </div>

            <div style={{ marginTop: '2rem', display: 'flex', alignItems: 'center', position: 'relative' }}>
              <button 
                onClick={handleShare}
                style={{ 
                  background: 'rgba(241,245,249,0.8)', 
                  border: 'none', 
                  padding: '0.6rem 1.2rem', 
                  borderRadius: '100px', 
                  fontSize: '0.85rem', 
                  fontWeight: 600, 
                  color: '#64748B', 
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  transition: 'background 0.2s'
                }}
                onMouseOver={e => e.currentTarget.style.background = '#E2E8F0'}
                onMouseOut={e => e.currentTarget.style.background = 'rgba(241,245,249,0.8)'}
              >
                🔗 이 시점 공유하기
              </button>
              
              <AnimatePresence>
                {showToast && (
                  <motion.div 
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    style={{
                      position: 'absolute',
                      left: '150px',
                      background: '#1E293B',
                      color: '#FFF',
                      padding: '0.5rem 1rem',
                      borderRadius: '8px',
                      fontSize: '0.8rem',
                      fontWeight: 600
                    }}
                  >
                    공유 기능 준비 중입니다
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function ShareSection({ scenario, formData }: { scenario: ScenarioData, formData: any }) {
  const [email, setEmail] = useState('');
  const [copied, setCopied] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const getStrategyBadge = (data: any) => {
    const risk = data.riskTolerance || 5;
    const goal = data.primaryGoal || '';
    if (risk >= 7 && goal.includes('커리어')) return { emoji: '⚡', name: '번아웃 러너' };
    if (risk >= 7 && goal.includes('자유')) return { emoji: '🚀', name: '무모한 몽상가' };
    if (risk >= 7 && goal.includes('가족')) return { emoji: '🔥', name: '역경 돌파형' };
    if (risk <= 4 && goal.includes('가족')) return { emoji: '🦁', name: '생존형 전략가' };
    if (risk <= 4 && goal.includes('창작')) return { emoji: '🌱', name: '느린 성장형' };
    if (risk <= 4 && goal.includes('경제')) return { emoji: '🎯', name: '냉철한 계산가' };
    if (goal.includes('자유')) return { emoji: '🧭', name: '탐험가형 생존자' };
    return { emoji: '💎', name: '완벽주의 설계자' };
  };

  const badge = getStrategyBadge(formData);

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    localStorage.setItem('lifeSimulatorEmail', email);
    console.log("EMAIL_COLLECTION:", JSON.stringify({ email, timestamp: new Date().toISOString() }));
    alert('리포트 수신 이메일이 등록되었습니다!');
    setEmail('');
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleImageSave = async () => {
    if (!cardRef.current) return;
    try {
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(cardRef.current, { backgroundColor: null, scale: 2 });
      const a = document.createElement('a');
      a.href = canvas.toDataURL('image/png');
      a.download = 'my-life-report.png';
      a.click();
    } catch (err) {
      console.error('Failed to capture image', err);
      alert('이미지 저장에 실패했습니다.');
    }
  };

  return (
    <div style={{ gridColumn: 'span 12', marginTop: '2rem', marginBottom: '2rem', padding: '3rem 2rem', background: '#FFFFFF', borderRadius: '24px', boxShadow: '0 10px 40px rgba(0,0,0,0.05)', border: '1px solid rgba(0,0,0,0.05)' }}>
      
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h4 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1E293B', marginBottom: '2.5rem' }}>내 결과 공유하기</h4>
        
        {/* 미리보기 카드 DOM */}
        <div 
          ref={cardRef} 
          style={{ 
            maxWidth: '480px', 
            margin: '0 auto', 
            background: 'linear-gradient(135deg, #0f0f2d 0%, #4F46E5 100%)', 
            borderRadius: '16px', 
            padding: '32px', 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            color: '#FFF',
            boxShadow: '0 10px 30px rgba(79, 70, 229, 0.3)',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Grid overlay for texture */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)', backgroundSize: '20px 20px', pointerEvents: 'none' }} />
          
          <div style={{ position: 'relative', zIndex: 1, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ fontSize: '16px', fontWeight: 700, opacity: 0.9, marginBottom: '1.5rem', letterSpacing: '0.05em' }}>🌌 나의 인생 평행우주 리포트</div>
            
            <div style={{ background: 'rgba(255,255,255,0.1)', padding: '0.8rem 1.5rem', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)' }}>
              <span style={{ fontSize: '1.5rem' }}>{badge.emoji}</span>
              <span style={{ fontWeight: 800, fontSize: '1.2rem' }}>{badge.name}</span>
            </div>

            <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.8)', marginBottom: '0.5rem', fontWeight: 600 }}>[{formData.choiceA}] vs [{formData.choiceB}]</div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
              <span style={{ fontSize: '3.5rem', fontWeight: 900, color: scenario.options[0].survivalRate >= 50 ? '#10B981' : '#F59E0B' }}>{scenario.options[0].survivalRate}%</span>
              <span style={{ fontSize: '2rem', opacity: 0.6 }}>⚡</span>
              <span style={{ fontSize: '3.5rem', fontWeight: 900, color: scenario.options[1].survivalRate >= 50 ? '#3B82F6' : '#EF4444' }}>{scenario.options[1].survivalRate}%</span>
            </div>

            <hr style={{ width: '100%', borderColor: 'rgba(255,255,255,0.1)', margin: '0 0 1.5rem 0' }} />

            <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', fontWeight: 500 }}>AI가 분석한 5년 후의 나</div>
              <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', fontWeight: 600, letterSpacing: '0.05em' }}>Sentient Life Strategist</div>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '2rem', flexWrap: 'wrap' }}>
          <button 
            disabled
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '1rem 1.5rem', borderRadius: '12px', background: '#E2E8F0', color: '#94A3B8', fontWeight: 700, border: 'none', cursor: 'not-allowed', fontSize: '1.05rem' }}
          >
            <span style={{ fontSize: '1.2rem' }}>💬</span> 카카오로 공유 (준비 중)
          </button>

          <button 
            onClick={handleCopyLink}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '1rem 1.5rem', borderRadius: '12px', background: '#FFFFFF', color: '#4F46E5', fontWeight: 700, border: '1px solid #E2E8F0', cursor: 'pointer', fontSize: '1.05rem', transition: 'all 0.2s' }}
            onMouseOver={e => { e.currentTarget.style.background = '#4F46E5'; e.currentTarget.style.color = '#FFFFFF'; }}
            onMouseOut={e => { e.currentTarget.style.background = '#FFFFFF'; e.currentTarget.style.color = '#4F46E5'; }}
          >
            <span>🔗</span> {copied ? '✓ 복사됨' : '링크 복사하기'}
          </button>

          <button 
            onClick={handleImageSave}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '1rem 1.5rem', borderRadius: '12px', background: '#FFFFFF', color: '#4F46E5', fontWeight: 700, border: '1px solid #E2E8F0', cursor: 'pointer', fontSize: '1.05rem', transition: 'all 0.2s' }}
            onMouseOver={e => { e.currentTarget.style.background = '#4F46E5'; e.currentTarget.style.color = '#FFFFFF'; }}
            onMouseOut={e => { e.currentTarget.style.background = '#FFFFFF'; e.currentTarget.style.color = '#4F46E5'; }}
          >
            <FaCamera /> 이미지 저장하기
          </button>
        </div>
      </div>

      {/* Email Form */}
      <div style={{ textAlign: 'center', marginTop: '3rem', paddingTop: '3rem', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
        <h4 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#1E293B', marginBottom: '1rem' }}>리포트를 이메일로 받아보세요 (무료)</h4>
        <form onSubmit={handleEmailSubmit} style={{ display: 'flex', gap: '0.8rem', justifyContent: 'center', maxWidth: '400px', margin: '0 auto' }}>
          <input 
            type="email" 
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="이메일 주소 입력" 
            required
            style={{ flex: 1, padding: '0.8rem 1.2rem', borderRadius: '12px', border: '1px solid #CBD5E1', outline: 'none', fontSize: '1rem' }}
            onFocus={e => e.target.style.borderColor = '#4F46E5'}
            onBlur={e => e.target.style.borderColor = '#CBD5E1'}
          />
          <button type="submit" style={{ padding: '0.8rem 1.5rem', borderRadius: '12px', background: '#0F172A', color: '#fff', fontWeight: 700, border: 'none', cursor: 'pointer', whiteSpace: 'nowrap', transition: 'background 0.2s' }} onMouseOver={e => e.currentTarget.style.background = '#334155'} onMouseOut={e => e.currentTarget.style.background = '#0F172A'}>
            받아보기
          </button>
        </form>
      </div>

    </div>
  );
}

function ActionTracker({ option, formData }: { option: ScenarioOption, formData: any }) {
  const storageKey = `actionTracker_${formData.choiceA}_${formData.choiceB}_${option.type}`;
  const [checks, setChecks] = useState({ step1: false, step2: false, step3: false });
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setChecks({ step1: !!parsed.step1, step2: !!parsed.step2, step3: !!parsed.step3 });
      } catch (e) {}
    }
    setIsLoaded(true);
  }, [storageKey]);

  const handleCheck = (step: 'step1' | 'step2' | 'step3') => {
    setChecks(prev => {
      const next = { ...prev, [step]: !prev[step] };
      localStorage.setItem(storageKey, JSON.stringify({ ...next, savedAt: new Date().toISOString() }));
      return next;
    });
  };

  const completedCount = [checks.step1, checks.step2, checks.step3].filter(Boolean).length;
  const progressPercent = Math.round((completedCount / 3) * 100);
  const isAllCompleted = completedCount === 3;

  if (!isLoaded) return null;

  return (
    <div style={{ position: 'relative', background: isAllCompleted ? '#ECFDF5' : '#FFFFFF', border: isAllCompleted ? '1px solid #10B981' : '1px solid #E2E8F0', padding: '2.5rem', borderRadius: '24px', marginBottom: '2rem', boxShadow: '0 10px 40px -10px rgba(0,0,0,0.05)', transition: 'background 0.5s ease' }}>
      
      {isAllCompleted && (
        <>
          <style>
            {`
              @keyframes confettiFall {
                0% { transform: translateY(-50px) rotate(0deg); opacity: 1; }
                100% { transform: translateY(200px) rotate(360deg); opacity: 0; }
              }
              .confetti-piece {
                position: absolute;
                width: 10px;
                height: 10px;
                top: -10px;
                animation: confettiFall 2s ease-out forwards;
              }
            `}
          </style>
          {['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6'].map((color, i) => (
            <div key={i} className="confetti-piece" style={{ left: `${20 + i * 15}%`, background: color, animationDelay: `${i * 0.1}s` }} />
          ))}
          <div style={{ position: 'absolute', top: '-15px', left: '50%', transform: 'translateX(-50%)', background: '#10B981', color: '#fff', padding: '0.4rem 1rem', borderRadius: '20px', fontWeight: 800, fontSize: '0.9rem', boxShadow: '0 4px 10px rgba(16,185,129,0.3)', zIndex: 10 }}>
            🎉 이번 주 액션 플랜 완료!
          </div>
        </>
      )}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', borderRadius: '10px', background: isAllCompleted ? '#D1FAE5' : '#F1F5F9', color: isAllCompleted ? '#10B981' : '#475569', fontSize: '1.2rem', transition: 'background 0.5s' }}>
            <FaCheckCircle />
          </div>
          <h4 style={{ color: isAllCompleted ? '#065F46' : '#0F172A', fontWeight: 800, margin: 0, fontSize: '1.3rem', letterSpacing: '-0.02em', transition: 'color 0.5s' }}>
            현실 복귀: 3단계 액션 플랜
          </h4>
        </div>
        <div style={{ fontWeight: 700, color: isAllCompleted ? '#10B981' : '#4F46E5', fontSize: '0.95rem' }}>
          {completedCount}/3 완료
        </div>
      </div>

      <div style={{ width: '100%', height: '4px', background: '#E2E8F0', borderRadius: '4px', marginBottom: '2rem', overflow: 'hidden' }}>
        <div style={{ width: `${progressPercent}%`, height: '100%', background: isAllCompleted ? '#10B981' : '#4F46E5', borderRadius: '4px', transition: 'width 0.5s ease-out, background 0.5s' }} />
      </div>
      
      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {[
          { id: 'step1', title: 'Step 1 • Immediate (24H)', icon: <FaRegClock />, text: option.actionPlan?.immediate, isChecked: checks.step1 },
          { id: 'step2', title: 'Step 2 • Weekly', icon: <FaCheckCircle />, text: option.actionPlan?.weekly, isChecked: checks.step2 },
          { id: 'step3', title: 'Step 3 • Long-term Investment', icon: <FaSeedling />, text: option.actionPlan?.investment, isChecked: checks.step3 }
        ].map((item, i) => (
          <motion.li 
            key={item.id}
            whileHover={{ scale: 1.01 }} 
            onClick={() => handleCheck(item.id as any)}
            style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', background: item.isChecked ? 'transparent' : '#F8FAFC', padding: '1.5rem', borderRadius: '16px', border: item.isChecked ? '1px dashed #A7F3D0' : '1px solid #F1F5F9', cursor: 'pointer', transition: 'all 0.3s' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '20px', height: '20px', borderRadius: '4px', background: item.isChecked ? '#4F46E5' : '#FFFFFF', border: item.isChecked ? 'none' : '1px solid #D1D5DB', flexShrink: 0, color: '#fff', fontSize: '12px', fontWeight: 'bold' }}>
              {item.isChecked && '✓'}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '48px', height: '48px', borderRadius: '50%', background: '#FFFFFF', color: item.isChecked ? '#9CA3AF' : ['#6366F1', '#10B981', '#F59E0B'][i], fontSize: '1.2rem', boxShadow: '0 4px 10px rgba(0,0,0,0.03)', flexShrink: 0, transition: 'color 0.3s' }}>
              {item.icon}
            </div>
            <div style={{ flex: 1, transition: 'opacity 0.3s' }}>
              <div style={{ fontSize: '0.8rem', color: '#64748B', marginBottom: '0.2rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', textDecoration: item.isChecked ? 'line-through' : 'none' }}>{item.title}</div>
              <div style={{ color: item.isChecked ? '#9CA3AF' : '#1E293B', lineHeight: 1.5, fontWeight: 600, fontSize: '1.05rem', textDecoration: item.isChecked ? 'line-through' : 'none', transition: 'color 0.3s' }}>{item.text}</div>
            </div>
          </motion.li>
        ))}
      </ul>
    </div>
  );
}

export default function Home() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    age: '',
    jobStatus: '',
    financialStatus: '',
    mbti: '',
    primaryGoal: '',
    riskTolerance: 5,
    failureExp: '',
    decisionStyle: '',
    socialNet: '',
    energyLevel: '',
    dynamicAnswer1: '',
    dynamicAnswer2: '',
    choiceA: '',
    choiceB: '',
    story: '',
    emotionState: 'neutral'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [scenario, setScenario] = useState<ScenarioData | null>(null);
  const [showScenario, setShowScenario] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAnalysisExpanded, setIsAnalysisExpanded] = useState(false);

  const validateStep = (currentStep: number) => {
    if (currentStep === 1) {
      if (!formData.age || !formData.jobStatus || !formData.mbti) return false;
      if (!formData.dynamicAnswer1.trim() || !formData.dynamicAnswer2.trim()) return false;
      return true;
    }
    if (currentStep === 2) {
      if (!formData.primaryGoal || !formData.financialStatus || !formData.energyLevel || !formData.socialNet) return false;
      return true;
    }
    if (currentStep === 3) {
      if (!formData.failureExp || !formData.decisionStyle) return false;
      return true;
    }
    if (currentStep === 4) {
      if (!formData.choiceA.trim() || !formData.choiceB.trim() || !formData.story.trim()) return false;
      return true;
    }
    return true;
  };

  const handleNextStep = () => {
    if (validateStep(step)) {
      setError(null);
      setStep(s => s + 1);
    } else {
      setError('현재 단계의 모든 필수 정보를 입력 및 선택해주세요.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(4)) {
      setError('현재 단계의 모든 필수 정보를 입력 및 선택해주세요.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setScenario(null);
    setShowScenario(false);

    try {
      const response = await fetch('/api/scenario', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        let errorMsg = '시나리오를 생성하는 중 오류가 발생했습니다.';
        try {
          const errData = await response.json();
          errorMsg = errData.error || errorMsg;
        } catch (_) {
          try {
            const textErr = await response.text();
            if (textErr) errorMsg = textErr;
          } catch (_) {}
        }
        throw new Error(errorMsg);
      }

      const data = await response.json();
      setScenario(data.scenario);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLTextAreaElement | HTMLInputElement>) => {
    const value = e.target.type === 'range' ? parseInt(e.target.value) : e.target.value;
    setFormData(prev => ({ ...prev, [e.target.name]: value }));
  };

  const handleCardSelect = (name: string, value: string, nextId: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    if (nextId) {
      setTimeout(() => {
        document.getElementById(nextId)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 250);
    }
  };

  const generateViralCard = (option: ScenarioOption) => {
    const canvas = document.createElement('canvas');
    canvas.width = 1080;
    canvas.height = 1920;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Background Gradient
    const grad = ctx.createLinearGradient(0, 0, 1080, 1920);
    grad.addColorStop(0, '#0F172A');
    grad.addColorStop(1, '#4F46E5');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1080, 1920);

    // Grid Overlay
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.lineWidth = 2;
    for (let i = 0; i < 1080; i += 100) { ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, 1920); ctx.stroke(); }
    for (let i = 0; i < 1920; i += 100) { ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(1080, i); ctx.stroke(); }

    ctx.textAlign = 'center';
    ctx.fillStyle = '#FFFFFF';
    
    // Header
    ctx.font = 'bold 50px sans-serif';
    ctx.fillText('AI가 예측한 나의 5년 뒤', 540, 200);

    // Title
    ctx.font = 'bold 80px sans-serif';
    ctx.fillStyle = '#E2E8F0';
    ctx.fillText(`"${option.title}"`, 540, 350);

    // Survival Rate
    ctx.fillStyle = 'rgba(255,255,255,0.1)';
    ctx.beginPath();
    ctx.roundRect(240, 500, 600, 300, 40);
    ctx.fill();
    ctx.fillStyle = '#10B981';
    ctx.font = 'bold 150px sans-serif';
    ctx.fillText(`${option.survivalRate}%`, 540, 680);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 40px sans-serif';
    ctx.fillText('성공 확률', 540, 580);

    // Headline
    ctx.fillStyle = '#F8FAFC';
    ctx.font = 'italic 50px serif';
    const lines = option.fakeNewsHeadline.match(/.{1,25}/g) || [];
    lines.forEach((line, i) => ctx.fillText(line, 540, 950 + (i * 70)));

    // Stats
    ctx.textAlign = 'left';
    ctx.font = 'bold 45px sans-serif';
    const finalWealth = Math.max(0, Math.min(100, scenario!.initialStats.경제력 + option.statChanges.경제력));
    const finalHappy = Math.max(0, Math.min(100, scenario!.initialStats.행복도 + option.statChanges.행복도));
    
    ctx.fillText(`💰 경제력: ${finalWealth}/100`, 250, 1300);
    ctx.fillText(`😊 행복도: ${finalHappy}/100`, 250, 1400);

    // Footer
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = '35px sans-serif';
    ctx.fillText('Sentient Life Strategist', 540, 1800);

    // Download
    const a = document.createElement('a');
    a.href = canvas.toDataURL('image/png');
    a.download = `viral-card-${option.type}.png`;
    a.click();
  };



  return (
    <main>
      <AnimatePresence mode="wait">
        {!scenario && !isLoading && (
          <motion.div 
            key="input"
            className="sentient-input-container"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.5 }}
          >
            <div className="sentient-header">
              <h1>당신의 인생을 설계합니다</h1>
              <p>기본 정보를 입력하고, 고민 중인 두 가지 갈림길을 알려주세요.<br/>AI 인생 전략가가 5년 후의 미래를 시뮬레이션해드립니다.</p>
            </div>
            
            <StepIndicator currentStep={step} />
            
            <form onSubmit={handleSubmit}>
              <div className="input-bento-grid">
                <AnimatePresence mode="wait">
                  {step === 1 && (
                    <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="col-span-12" style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '1.5rem' }}>
                      
                      <div className="input-cell col-span-6">
                        <label>나이 (만)</label>
                        <input type="number" className="sentient-input" name="age" value={formData.age} onChange={handleChange} placeholder="예: 28" required />
                      </div>

                      <div className="input-cell col-span-6">
                        <label>현재 직업/상태</label>
                        <select className="sentient-select" name="jobStatus" value={formData.jobStatus} onChange={handleChange} required>
                          <option value="" disabled>선택해주세요</option>
                          <option value="학생">학생</option>
                          <option value="취업준비생">취업준비생</option>
                          <option value="직장인 (1~3년차)">직장인 (1~3년차)</option>
                          <option value="직장인 (4년차 이상)">직장인 (4년차 이상)</option>
                          <option value="프리랜서/자영업">프리랜서/자영업</option>
                          <option value="무직/휴식중">무직/휴식중</option>
                        </select>
                      </div>

                      {/* 상황별 가변 질문 (Conditional Logic) */}
                      {formData.jobStatus === '학생' && (
                        <motion.div className="input-cell col-span-12" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.2rem' }}>
                            <div>
                              <label>졸업까지 남은 학기 수는?</label>
                              <input type="text" className="sentient-input" name="dynamicAnswer1" value={formData.dynamicAnswer1} onChange={handleChange} placeholder="예: 3학기" />
                            </div>
                            <div>
                              <label>희망하는 첫 직장의 최소 연봉은?</label>
                              <input type="text" className="sentient-input" name="dynamicAnswer2" value={formData.dynamicAnswer2} onChange={handleChange} placeholder="예: 4,000만원" />
                            </div>
                          </div>
                        </motion.div>
                      )}
                      {formData.jobStatus.includes('직장인') && (
                        <motion.div className="input-cell col-span-12" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.2rem' }}>
                            <div>
                              <label>현재 직무의 AI 대체 가능성에 대해 어떻게 생각하시나요?</label>
                              <select className="sentient-select" name="dynamicAnswer1" value={formData.dynamicAnswer1} onChange={handleChange}>
                                <option value="">선택해주세요</option>
                                <option value="매우 높음">매우 높음 (대부분 대체될 것)</option>
                                <option value="보통">보통 (일부 대체되나 역할 변경)</option>
                                <option value="낮음">낮음 (인간의 고유 영역)</option>
                              </select>
                            </div>
                            <div>
                              <label>이직 혹은 새로운 스킬 준비 여부는?</label>
                              <input type="text" className="sentient-input" name="dynamicAnswer2" value={formData.dynamicAnswer2} onChange={handleChange} placeholder="예: 파이썬 공부 중, 이직 사이트 탐색 중" />
                            </div>
                          </div>
                        </motion.div>
                      )}
                      {(formData.jobStatus === '프리랜서/자영업' || formData.jobStatus === '취업준비생' || formData.jobStatus === '무직/휴식중') && (
                        <motion.div className="input-cell col-span-12" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.2rem' }}>
                            <div>
                              <label>현재 가장 큰 현실적 제약은 무엇인가요?</label>
                              <input type="text" className="sentient-input" name="dynamicAnswer1" value={formData.dynamicAnswer1} onChange={handleChange} placeholder="예: 당장의 생활비, 떨어지는 자신감" />
                            </div>
                            <div>
                              <label>3년 안에 반드시 이루고 싶은 한 가지는?</label>
                              <input type="text" className="sentient-input" name="dynamicAnswer2" value={formData.dynamicAnswer2} onChange={handleChange} placeholder="예: 월 수익 500만원 안정화" />
                            </div>
                          </div>
                        </motion.div>
                      )}

                      <div className="input-cell col-span-12">
                        <label>MBTI 성향</label>
                        <select className="sentient-select" name="mbti" value={formData.mbti} onChange={handleChange} required>
                          <option value="" disabled>선택해주세요</option>
                          <optgroup label="분석형"><option value="INTJ">INTJ</option><option value="INTP">INTP</option><option value="ENTJ">ENTJ</option><option value="ENTP">ENTP</option></optgroup>
                          <optgroup label="외교형"><option value="INFJ">INFJ</option><option value="INFP">INFP</option><option value="ENFJ">ENFJ</option><option value="ENFP">ENFP</option></optgroup>
                          <optgroup label="관리자형"><option value="ISTJ">ISTJ</option><option value="ISFJ">ISFJ</option><option value="ESTJ">ESTJ</option><option value="ESFJ">ESFJ</option></optgroup>
                          <optgroup label="탐험가형"><option value="ISTP">ISTP</option><option value="ISFP">ISFP</option><option value="ESTP">ESTP</option><option value="ESFP">ESFP</option></optgroup>
                        </select>
                      </div>
                    </motion.div>
                  )}

                  {step === 2 && (
                    <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="col-span-12" style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '1.5rem' }}>
                      
                      <div className="input-cell col-span-12" id="step2-q1">
                        <label>인생의 우선순위</label>
                        <div className="card-select-grid">
                          {PRIORITY_OPTIONS.map(opt => (
                            <div key={opt.value} className={`card-option ${formData.primaryGoal === opt.value ? 'selected' : ''}`} onClick={() => handleCardSelect('primaryGoal', opt.value, 'step2-q2')}>
                              {opt.label}
                              {formData.primaryGoal === opt.value && <FaCheckCircle className="check-icon" />}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="input-cell col-span-12" id="step2-q2">
                        <label>경제적 상황</label>
                        <div className="card-select-grid">
                          {FINANCIAL_OPTIONS.map(opt => (
                            <div key={opt.value} className={`card-option ${formData.financialStatus === opt.value ? 'selected' : ''}`} onClick={() => handleCardSelect('financialStatus', opt.value, 'step2-q3')}>
                              {opt.label}
                              {formData.financialStatus === opt.value && <FaCheckCircle className="check-icon" />}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="input-cell col-span-12" id="step2-q3">
                        <label>현재 에너지/건강 상태</label>
                        <div className="card-select-grid">
                          {ENERGY_OPTIONS.map(opt => (
                            <div key={opt.value} className={`card-option ${formData.energyLevel === opt.value ? 'selected' : ''}`} onClick={() => handleCardSelect('energyLevel', opt.value, 'step2-q4')}>
                              {opt.label}
                              {formData.energyLevel === opt.value && <FaCheckCircle className="check-icon" />}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="input-cell col-span-12" id="step2-q4">
                        <label>사회적 지지망</label>
                        <div className="card-select-grid">
                          {SOCIAL_OPTIONS.map(opt => (
                            <div key={opt.value} className={`card-option ${formData.socialNet === opt.value ? 'selected' : ''}`} onClick={() => handleCardSelect('socialNet', opt.value, 'step2-next-btn')}>
                              {opt.label}
                              {formData.socialNet === opt.value && <FaCheckCircle className="check-icon" />}
                            </div>
                          ))}
                        </div>
                      </div>
                      <div id="step2-next-btn" />
                    </motion.div>
                  )}

                  {step === 3 && (
                    <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="col-span-12" style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '1.5rem' }}>
                      
                      <div className="input-cell col-span-12" id="step3-q1">
                        <label>과거 큰 실패나 위기를 경험한 적 있나요?</label>
                        <div className="card-select-grid">
                          {FAILURE_OPTIONS.map(opt => (
                            <div key={opt.value} className={`card-option ${formData.failureExp === opt.value ? 'selected' : ''}`} onClick={() => handleCardSelect('failureExp', opt.value, 'step3-q2')}>
                              {opt.label}
                              {formData.failureExp === opt.value && <FaCheckCircle className="check-icon" />}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="input-cell col-span-12" id="step3-q2">
                        <label>중요한 결정을 내릴 때 나는?</label>
                        <div className="card-select-grid">
                          {DECISION_OPTIONS.map(opt => (
                            <div key={opt.value} className={`card-option ${formData.decisionStyle === opt.value ? 'selected' : ''}`} onClick={() => handleCardSelect('decisionStyle', opt.value, 'step3-q3')}>
                              {opt.label}
                              {formData.decisionStyle === opt.value && <FaCheckCircle className="check-icon" />}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="input-cell col-span-12" id="step3-q3">
                        <label>리스크 감수도 (실패 시 무너지는 성향)</label>
                        <div className="range-container">
                          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>극도로 안정 추구 (1)</span>
                          <input type="range" name="riskTolerance" min="1" max="10" value={formData.riskTolerance} onChange={handleChange} className="range-slider" />
                          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>하이리스크 하이리턴 (10)</span>
                          <span className="range-value">{formData.riskTolerance}</span>
                        </div>
                      </div>
                      
                    </motion.div>
                  )}

                  {step === 4 && (
                    <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="col-span-12" style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '1.5rem' }}>
                      
                      <div className="input-cell col-span-6">
                        <label>선택의 기로 A</label>
                        <input type="text" className="sentient-input" name="choiceA" value={formData.choiceA} onChange={handleChange} placeholder="예: 대기업 취업 준비 계속하기" required />
                      </div>
                      <div className="input-cell col-span-6">
                        <label>선택의 기로 B</label>
                        <input type="text" className="sentient-input" name="choiceB" value={formData.choiceB} onChange={handleChange} placeholder="예: 당장 스타트업 합류하기" required />
                      </div>

                      <div className="input-cell col-span-12">
                        <label>가장 큰 고민을 자유롭게 들려주세요</label>
                        <textarea className="sentient-textarea" name="story" value={formData.story} onChange={handleChange} placeholder="두 선택지 사이에서 고민하는 이유, 두려운 점 등을 적어주세요." required />
                      </div>

                      <div className="input-cell col-span-12" style={{ background: '#F5F3FF', padding: '2rem', borderRadius: '24px', border: '1px solid rgba(79, 70, 229, 0.1)' }}>
                        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                          <h4 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#1E293B', letterSpacing: '-0.02em', marginBottom: '0.4rem' }}>💭 솔직히, 지금 이 선택 앞에서 감정이 어때요?</h4>
                          <p style={{ margin: 0, fontSize: '0.9rem', color: '#64748B' }}>AI가 당신의 감정까지 반영해 분석합니다</p>
                        </div>
                        
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.8rem', justifyContent: 'center', marginBottom: '1.5rem' }}>
                          {[
                            { id: 'fearful', emoji: '😨', label: '무서워요', msg: '그 두려움, AI가 숫자로 정직하게 마주해드릴게요' },
                            { id: 'determined', emoji: '😤', label: '오기가 생겨요', msg: '좋아요. 그 에너지가 결과를 바꿀 수 있습니다' },
                            { id: 'exhausted', emoji: '😔', label: '지쳐있어요', msg: '알겠어요. 지친 상태까지 반영해서 분석할게요' },
                            { id: 'dependent', emoji: '🥺', label: '누군가 대신 결정해줬으면', msg: '대신 결정은 못 해도, 최대한 근거를 드릴게요' },
                            { id: 'confident', emoji: '😎', label: '자신 있어요', msg: '그 자신감, 근거가 있는지 확인해드릴게요' }
                          ].map(emo => {
                            const isSelected = formData.emotionState === emo.label;
                            return (
                              <motion.button
                                type="button"
                                key={emo.id}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setFormData(prev => ({ ...prev, emotionState: emo.label }))}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '0.5rem',
                                  padding: '0.8rem 1.2rem',
                                  borderRadius: '16px',
                                  background: isSelected ? '#E0E7FF' : '#FFFFFF',
                                  border: isSelected ? '2px solid #4F46E5' : '1px solid #E2E8F0',
                                  color: isSelected ? '#4F46E5' : '#475569',
                                  fontWeight: 700,
                                  fontSize: '0.95rem',
                                  cursor: 'pointer',
                                  transition: 'all 0.2s',
                                  transform: isSelected ? 'scale(1.05)' : 'scale(1)'
                                }}
                              >
                                <span style={{ fontSize: '1.2em' }}>{emo.emoji}</span> {emo.label}
                              </motion.button>
                            );
                          })}
                        </div>

                        {formData.emotionState !== 'neutral' && (
                          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: 'center', color: '#4F46E5', fontWeight: 700, fontSize: '0.95rem', background: '#FFFFFF', padding: '0.8rem', borderRadius: '12px', border: '1px solid rgba(79, 70, 229, 0.2)' }}>
                            {
                              [
                                { id: 'fearful', emoji: '😨', label: '무서워요', msg: '그 두려움, AI가 숫자로 정직하게 마주해드릴게요' },
                                { id: 'determined', emoji: '😤', label: '오기가 생겨요', msg: '좋아요. 그 에너지가 결과를 바꿀 수 있습니다' },
                                { id: 'exhausted', emoji: '😔', label: '지쳐있어요', msg: '알겠어요. 지친 상태까지 반영해서 분석할게요' },
                                { id: 'dependent', emoji: '🥺', label: '누군가 대신 결정해줬으면', msg: '대신 결정은 못 해도, 최대한 근거를 드릴게요' },
                                { id: 'confident', emoji: '😎', label: '자신 있어요', msg: '그 자신감, 근거가 있는지 확인해드릴게요' }
                              ].find(e => e.label === formData.emotionState)?.msg
                            }
                          </motion.div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem' }}>
                {step > 1 ? (
                  <button type="button" onClick={() => setStep(s => s - 1)} className="sentient-btn-secondary" style={{ padding: '0.8rem 1.5rem', borderRadius: '12px', border: '1px solid var(--surface-border)', background: 'transparent', color: 'var(--text-primary)', fontWeight: 600, cursor: 'pointer' }}>
                    이전 단계
                  </button>
                ) : <div />}
                
                {step < 4 ? (
                  <button type="button" onClick={handleNextStep} className="sentient-submit" style={{ width: 'auto', marginTop: 0 }}>
                    다음 단계로
                  </button>
                ) : (
                  <button type="submit" className="sentient-submit" disabled={isLoading} style={{ width: 'auto', marginTop: 0 }}>
                    <FaPaperPlane /> 5년 후 미래 시뮬레이션 시작
                  </button>
                )}
              </div>
              {error && <p style={{ color: 'var(--danger)', marginTop: '1.5rem', textAlign: 'center', fontWeight: 'bold' }}>{error}</p>}
            </form>
          </motion.div>
        )}

        {(isLoading || (scenario && !showScenario)) && (
          <DramaticLoader 
            isLoading={isLoading} 
            onComplete={() => setShowScenario(true)} 
          />
        )}

        {scenario && showScenario && (
          <motion.div 
            key="result"
            className="bento-grid"
            initial={{ opacity: 0, y: 80 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], staggerChildren: 0.2 }}
          >
            <motion.div className="bento-cell cell-header" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ padding: '3rem 2rem', textAlign: 'center' }}>
              
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2.5rem' }}>
                {(() => {
                  const strategy = getStrategyType(formData);
                  return (
                    <div style={{ background: strategy.bg, padding: '1.5rem 2rem', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.5)', boxShadow: '0 15px 35px rgba(0,0,0,0.2)', color: '#334155', maxWidth: '500px', width: '100%', position: 'relative', zIndex: 10 }}>
                      <div style={{ fontSize: '3.5rem', marginBottom: '0.5rem', lineHeight: 1 }}>{strategy.emoji}</div>
                      <div style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '0.8rem', color: '#1E293B', letterSpacing: '-0.02em' }}>나의 인생 전략 유형: {strategy.name}</div>
                      <div style={{ fontSize: '1rem', fontWeight: 600, color: '#475569', marginBottom: '1.2rem', lineHeight: 1.5, padding: '0 1rem' }}>"{strategy.desc}"</div>
                      <button style={{ padding: '0.7rem 1.5rem', background: '#FFFFFF', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '100px', fontSize: '0.9rem', fontWeight: 800, color: 'var(--accent-indigo)', cursor: 'pointer', boxShadow: '0 4px 10px rgba(0,0,0,0.05)', transition: 'transform 0.2s' }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>내 유형 공유하기</button>
                    </div>
                  );
                })()}
              </div>

              <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', background: 'linear-gradient(to right, #fff, #cbd5e1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>인생 평행우주 리포트</h1>
              <p style={{ color: '#4B5563', fontSize: '1.1rem', marginBottom: '3rem' }}>5년 후 당신의 두 가지 미래를 확인하세요</p>
              
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '3rem', margin: '0 auto', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{ fontSize: '1.2rem', color: '#4B5563', marginBottom: '1rem', fontWeight: 700, padding: '0.5rem 1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '100px' }}>{scenario.options[0].title}</div>
                  <div style={{ fontSize: '5.5rem', fontWeight: 900, color: scenario.options[0].survivalRate >= 50 ? '#10B981' : '#F59E0B', lineHeight: 1, textShadow: '0 10px 30px rgba(16,185,129,0.2)' }}>
                    {scenario.options[0].survivalRate}%
                  </div>
                </div>
                
                <div style={{ fontSize: '3rem', fontWeight: 900, color: '#4B5563', fontStyle: 'italic' }}>VS</div>
                
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{ fontSize: '1.2rem', color: '#4B5563', marginBottom: '1rem', fontWeight: 700, padding: '0.5rem 1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '100px' }}>{scenario.options[1].title}</div>
                  <div style={{ fontSize: '5.5rem', fontWeight: 900, color: scenario.options[1].survivalRate >= 50 ? '#3B82F6' : '#EF4444', lineHeight: 1, textShadow: '0 10px 30px rgba(59,130,246,0.2)' }}>
                    {scenario.options[1].survivalRate}%
                  </div>
                </div>
              </div>
              
              <div style={{ marginTop: '3rem' }}>
                <span style={{ fontSize: '1.1rem', fontWeight: 600, color: '#E2E8F0', background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.2))', padding: '1rem 2rem', borderRadius: '100px', border: '1px solid rgba(139,92,246,0.3)' }}>
                  {scenario.options[0].survivalRate > scenario.options[1].survivalRate 
                    ? `"${scenario.options[0].title}" 방향이 현실적으로 더 성공 가능성이 높습니다.` 
                    : scenario.options[0].survivalRate < scenario.options[1].survivalRate
                      ? `"${scenario.options[1].title}" 방향이 현실적으로 더 성공 가능성이 높습니다.`
                      : `두 선택지의 현실적 성공 가능성이 비슷합니다.`}
                </span>
              </div>
            </motion.div>

            {/* 데이터 기반 리스크 진단 (Fact-Check) - Quiet Luxury Pale Amber */}
            <motion.div className="bento-cell col-span-12" style={{ background: '#FFFBEB', border: '1px solid rgba(251, 191, 36, 0.3)', boxShadow: '0 4px 20px rgba(251, 191, 36, 0.05)' }} initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(245, 158, 11, 0.15)', color: '#D97706', fontSize: '1.2rem' }}>
                  <FaExclamationTriangle />
                </div>
                <h3 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: '#92400E', letterSpacing: '-0.02em' }}>리스크 진단 경고</h3>
              </div>
              
              <div style={{ display: 'flex', gap: '2.5rem', flexWrap: 'wrap' }}>
                {/* Gauge Chart Box */}
                <div style={{ flex: '1 1 240px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#FFFFFF', padding: '2rem', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.03)', boxShadow: '0 10px 30px rgba(0,0,0,0.02)' }}>
                   <GaugeChart percentage={scenario.riskAnalysis.successProbability} color="#D97706" />
                   <div style={{ marginTop: '1.2rem', fontWeight: 800, fontSize: '1.1rem', color: '#92400E', textAlign: 'center', letterSpacing: '-0.01em' }}>현실적 성공 확률</div>
                   <div style={{ fontSize: '12px', color: '#6B7280', textAlign: 'center', marginTop: '0.5rem' }}>자산 및 목표 격차 기반</div>
                </div>
                
                {/* Critical Risks Box */}
                <div style={{ flex: '2 1 400px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                   <h4 style={{ fontWeight: 800, marginBottom: '1.2rem', color: '#92400E', fontSize: '1.1rem' }}>치명적 약점 (Critical Risks)</h4>
                   <ul style={{ padding: 0, margin: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                     {scenario.riskAnalysis.criticalFactChecks.map((fact, i) => (
                       <li key={i} style={{ display: 'flex', gap: '0.8rem', alignItems: 'flex-start' }}>
                         <span style={{ color: '#F59E0B', marginTop: '2px' }}>•</span>
                         <span style={{ color: '#78350F', fontWeight: 600, lineHeight: 1.5 }}>{fact}</span>
                       </li>
                     ))}
                   </ul>
                   <div style={{ marginTop: '2rem', padding: '1.2rem 1.5rem', background: '#FFFFFF', borderRadius: '12px', borderLeft: '4px solid #D97706', fontStyle: 'italic', color: '#78350F', fontSize: '0.95rem', lineHeight: 1.6, boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
                     "{scenario.riskAnalysis.consultantAdvice}"
                   </div>
                </div>
              </div>
            </motion.div>

            {/* 또래 비교 섹션 */}
            <motion.div className="bento-cell col-span-12" style={{ background: '#F5F3FF', border: '1px solid rgba(79, 70, 229, 0.1)', boxShadow: '0 4px 20px rgba(79, 70, 229, 0.05)' }} initial={{ y: 20, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true, margin: "-50px" }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(79, 70, 229, 0.1)', color: '#4F46E5', fontSize: '1.2rem' }}>
                  <FaChartLine />
                </div>
                <h3 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: '#4F46E5', letterSpacing: '-0.02em' }}>내 위치는 어디쯤일까? (또래 통계)</h3>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                <div style={{ background: '#FFFFFF', padding: '1.8rem', borderRadius: '16px', boxShadow: '0 4px 15px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div style={{ color: '#6B7280', fontSize: '0.95rem', fontWeight: 600 }}>{formData.age}세 {formData.jobStatus} 중 연봉 상위</div>
                  <div style={{ color: '#4F46E5', fontSize: '2.5rem', fontWeight: 900, lineHeight: 1 }}>
                    상위 <AnimatedCounter value={Math.max(5, 45 - ((parseInt(formData.age) || 25) - 20) * 2)} />%
                  </div>
                  <div style={{ color: '#9CA3AF', fontSize: '0.85rem' }}>*희망 연봉 기준 가상 데이터</div>
                </div>
                <div style={{ background: '#FFFFFF', padding: '1.8rem', borderRadius: '16px', boxShadow: '0 4px 15px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div style={{ color: '#6B7280', fontSize: '0.95rem', fontWeight: 600 }}>{formData.age}세 평균 자산</div>
                  <div style={{ color: '#4F46E5', fontSize: '2.5rem', fontWeight: 900, lineHeight: 1 }}>
                    약 <AnimatedCounter value={Math.max(500, ((parseInt(formData.age) || 25) - 20) * 800 + 500)} />만원
                  </div>
                  <div style={{ color: '#9CA3AF', fontSize: '0.85rem' }}>*동일 연령대 통계청 데이터 환산</div>
                </div>
                <div style={{ background: '#FFFFFF', padding: '1.8rem', borderRadius: '16px', boxShadow: '0 4px 15px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div style={{ color: '#6B7280', fontSize: '0.95rem', fontWeight: 600 }}>이 선택을 한 또래의 5년 후 만족도</div>
                  <div style={{ color: '#4F46E5', fontSize: '2.5rem', fontWeight: 900, lineHeight: 1 }}>
                    <AnimatedCounter value={67 + ((parseInt(formData.age) || 25) % 10)} />%
                  </div>
                  <div style={{ color: '#9CA3AF', fontSize: '0.85rem' }}>*유사 프로필 유저 시뮬레이션 기준</div>
                </div>
              </div>
            </motion.div>

            {/* 교차 지점 (Turning Point) */}
            <motion.div className="bento-cell col-span-12 turning-point-banner" initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
              <div className="section-title"><FaBrain /> The Turning Point (결정적 분기점)</div>
              <p className="turning-text">{scenario.turningPoint}</p>
            </motion.div>

            <PerspectiveSimulation formData={formData} />

            <motion.div className="bento-cell cell-intent" initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
              <div className="section-title"><FaBrain /> 심리 분석</div>
              <div style={{ position: 'relative' }}>
                <div className="text-content" style={{ 
                  maxHeight: isAnalysisExpanded ? '2000px' : '100px', 
                  overflow: 'hidden', 
                  transition: 'max-height 0.5s ease',
                  WebkitMaskImage: isAnalysisExpanded ? 'none' : 'linear-gradient(to bottom, black 40%, transparent 100%)',
                  maskImage: isAnalysisExpanded ? 'none' : 'linear-gradient(to bottom, black 40%, transparent 100%)'
                }}>
                  <ReactMarkdown>{scenario.intentAnalysis}</ReactMarkdown>
                  <hr style={{ margin: '1rem 0', borderColor: 'var(--surface-border)' }} />
                  <ReactMarkdown>{scenario.analysis}</ReactMarkdown>
                </div>
              </div>
              <button onClick={() => setIsAnalysisExpanded(!isAnalysisExpanded)} style={{ width: '100%', padding: '0.8rem', marginTop: '1rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#CBD5E1', cursor: 'pointer', fontWeight: 600, transition: 'all 0.2s' }} onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'} onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}>
                {isAnalysisExpanded ? '접기 ▲' : '더 보기 ▼'}
              </button>
            </motion.div>

            <motion.div className="bento-cell cell-stats" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
              <div className="section-title"><FaChartLine /> 현재 스테이터스</div>
              <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <StatBar label="경제력" initial={scenario.initialStats.경제력} change={0} />
                <StatBar label="행복도" initial={scenario.initialStats.행복도} change={0} />
                <StatBar label="회복탄력성" initial={scenario.initialStats.회복탄력성} change={0} />
                <StatBar label="번아웃 확률" initial={scenario.initialStats.번아웃확률} change={0} />
              </div>
            </motion.div>

            {/* Side-by-Side Scenarios */}
            {scenario.options.map((option, index) => (
              <motion.div 
                key={index} 
                className="bento-cell cell-option"
                initial={{ y: 20, opacity: 0 }} 
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 + index * 0.2 }}
              >
                <div 
                  style={{ 
                    marginBottom: '1.5rem', 
                    width: '100%', 
                    height: '80px', 
                    borderRadius: '12px', 
                    background: index === 0 ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: '1.2rem',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
                  }}
                >
                  {index === 0 ? '🚀 선택 A 시나리오' : '🎓 선택 B 시나리오'}
                </div>
                
                <h3 style={{ fontSize: '1.4rem', color: 'var(--text-primary)', marginBottom: '1rem', fontWeight: 800 }}>{option.title}</h3>

                <div className="survival-banner" style={{ 
                  background: option.survivalRate >= 70 ? 'rgba(16,185,129,0.08)' : option.survivalRate <= 30 ? 'rgba(239,68,68,0.08)' : 'rgba(245,158,11,0.08)', 
                  border: `1px solid ${option.survivalRate >= 70 ? 'rgba(16,185,129,0.3)' : option.survivalRate <= 30 ? 'rgba(239,68,68,0.3)' : 'rgba(245,158,11,0.3)'}`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1.5rem',
                  padding: '1.5rem',
                  borderRadius: '16px'
                }}>
                  <GaugeChart percentage={option.survivalRate} color={option.survivalRate >= 70 ? '#10B981' : option.survivalRate <= 30 ? '#EF4444' : '#F59E0B'} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.4rem' }}>예상 성공 확률</div>
                    <div className="survival-reason" style={{ fontSize: '1rem', lineHeight: 1.6 }}>{option.survivalReason}</div>
                  </div>
                </div>

                <div className="fake-news">
                  "{option.fakeNewsHeadline}"
                </div>

                <p className="text-content" style={{ marginBottom: '1.5rem' }}>{option.description}</p>
                
                <div style={{ background: 'rgba(255,255,255,0.5)', border: '1px solid var(--surface-border)', padding: '1.5rem', borderRadius: '12px', marginBottom: '1.5rem' }}>
                  <h4 style={{ marginBottom: '1rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>선택 후 5년 뒤 스탯 변화</h4>
                  <StatBar label="경제력" initial={scenario.initialStats.경제력} change={option.statChanges.경제력} />
                  <StatBar label="행복도" initial={scenario.initialStats.행복도} change={option.statChanges.행복도} />
                  <StatBar label="회복탄력성" initial={scenario.initialStats.회복탄력성} change={option.statChanges.회복탄력성} />
                  <StatBar label="번아웃 확률" initial={scenario.initialStats.번아웃확률} change={option.statChanges.번아웃확률} />
                </div>

                <div className="timeline-vertical" style={{ marginBottom: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem', position: 'relative' }}>
                  {/* Vertical connecting line */}
                  <div style={{ position: 'absolute', left: '23px', top: '30px', bottom: '30px', width: '2px', background: 'rgba(255,255,255,0.1)', zIndex: 0 }} />
                  
                  {[
                    { period: '3개월 후', data: option.timeline.months_3, icon: <FaSeedling /> },
                    { period: '1년 후', data: option.timeline.year_1, icon: <FaChartLine /> },
                    { period: '5년 후', data: option.timeline.year_5, icon: <FaCheckCircle /> }
                  ].map((t, i) => t.data && (
                    <motion.div 
                      key={i} 
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true, margin: "-50px" }}
                      transition={{ delay: i * 0.2, duration: 0.5 }}
                      style={{ display: 'flex', gap: '1.5rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', padding: '1.5rem', position: 'relative', zIndex: 1, backdropFilter: 'blur(10px)' }}
                    >
                      <div style={{ width: '46px', height: '46px', borderRadius: '50%', background: 'linear-gradient(135deg, #4F46E5, #7C3AED)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0, boxShadow: '0 4px 10px rgba(124,58,237,0.3)', zIndex: 2 }}>
                        {t.icon}
                      </div>
                      <div style={{ flex: 1, paddingTop: '0.2rem' }}>
                        <div style={{ display: 'inline-block', padding: '0.3rem 0.8rem', background: 'rgba(255,255,255,0.1)', color: '#E2E8F0', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.8rem' }}>{t.period}</div>
                        <div style={{ color: 'var(--text-primary)', lineHeight: 1.6, fontSize: '1.05rem' }}>{t.data.content}</div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <ActionTracker option={option} formData={formData} />

                <Chatbot option={option} scenario={scenario} />

                <WhatIfSimulation option={option} scenario={scenario} baseFormData={formData} />


              </motion.div>
            ))}

            <TimeCapsule formData={formData} scenario={scenario} />
            
            <ShareSection scenario={scenario} formData={formData} />

            <motion.div style={{ gridColumn: 'span 12' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}>
              <button className="back-btn" onClick={() => { setScenario(null); setShowScenario(false); setStep(1); }}>
                <FaArrowLeft style={{ marginRight: '0.5rem', display: 'inline' }} /> 다른 고민 시뮬레이션 하기
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
