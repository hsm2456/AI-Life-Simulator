'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

export default function LandingPage() {
  const router = useRouter();

  const [stars, setStars] = useState<{ size: number; left: number; top: number; duration: number; delay: number }[]>([]);

  useEffect(() => {
    setStars(Array.from({ length: 100 }).map(() => ({
      size: Math.random() * 3 + 1,
      left: Math.random() * 100,
      top: Math.random() * 100,
      duration: Math.random() * 3 + 2,
      delay: Math.random() * 2
    })));
  }, []);

  return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Section 1 - Hero */}
      <section style={{ position: 'relative', width: '100%', minHeight: '100vh', background: '#0f0f2d', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        {/* Star Particles Background */}
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
          {stars.map((star, i) => (
            <div 
              key={i} 
              className="star" 
              style={{
                position: 'absolute',
                background: '#fff',
                borderRadius: '50%',
                opacity: 0,
                width: `${star.size}px`, 
                height: `${star.size}px`,
                left: `${star.left}%`,
                top: `${star.top}%`,
                animationName: 'twinkle',
                animationIterationCount: 'infinite',
                animationTimingFunction: 'ease-in-out',
                animationDuration: `${star.duration}s`,
                animationDelay: `${star.delay}s`
              }} 
            />
          ))}
          <style>
            {`
              @keyframes twinkle {
                0% { opacity: 0; transform: scale(0.5); }
                50% { opacity: 1; transform: scale(1); box-shadow: 0 0 10px rgba(255,255,255,0.8); }
                100% { opacity: 0; transform: scale(0.5); }
              }
            `}
          </style>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: 'easeOut' }}
          style={{ position: 'relative', zIndex: 1, textAlign: 'center', padding: '0 2rem' }}
        >
          <div style={{ display: 'inline-block', padding: '0.5rem 1.2rem', background: 'rgba(79, 70, 229, 0.2)', border: '1px solid rgba(79, 70, 229, 0.5)', borderRadius: '30px', color: '#A5B4FC', fontWeight: 700, fontSize: '0.9rem', marginBottom: '2rem', letterSpacing: '0.05em' }}>
            V2.0 대규모 업데이트 완료
          </div>
          <h1 style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', fontWeight: 900, color: '#FFFFFF', lineHeight: 1.2, letterSpacing: '-0.03em', marginBottom: '1.5rem', textShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
            당신의 선택,<br/>
            <span style={{ background: 'linear-gradient(135deg, #4F46E5, #A855F7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>5년 후엔 어떤 삶</span>이 될까요?
          </h1>
          <p style={{ fontSize: '1.2rem', color: '#94A3B8', marginBottom: '3rem', fontWeight: 500 }}>
            AI가 두 갈림길의 미래를 시뮬레이션해드립니다
          </p>

          <button 
            onClick={() => router.push('/simulate')}
            style={{ padding: '1.2rem 2.5rem', borderRadius: '16px', background: '#4F46E5', color: '#FFF', fontWeight: 800, fontSize: '1.2rem', border: 'none', cursor: 'pointer', boxShadow: '0 10px 30px rgba(79, 70, 229, 0.4)', transition: 'all 0.3s' }}
            onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 15px 40px rgba(79, 70, 229, 0.6)'; }}
            onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 10px 30px rgba(79, 70, 229, 0.4)'; }}
          >
            내 인생 시뮬레이션 시작하기 →
          </button>
        </motion.div>
      </section>

      {/* Section 2 - How it works */}
      <section style={{ background: '#FFFFFF', padding: '8rem 2rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#0F172A', marginBottom: '1rem', letterSpacing: '-0.02em' }}>시뮬레이션 작동 방식</h2>
          <p style={{ fontSize: '1.1rem', color: '#64748B' }}>단 3단계면 당신의 평행우주를 엿볼 수 있습니다</p>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', maxWidth: '1200px', width: '100%' }}>
          {[
            { emoji: '📝', title: '4가지 정보 입력', desc: '나이, 직업 상태, 가치관, 그리고 리스크 성향 등 최소한의 정보를 제공합니다.' },
            { emoji: '🤖', title: 'AI가 347개 변수 분석', desc: '선택에 따른 경제력, 행복도, 번아웃 확률 등 실제 데이터 기반으로 5년의 궤적을 그립니다.' },
            { emoji: '🌌', title: '평행우주 리포트', desc: '두 가지 갈림길의 성공 확률과 타임라인을 동시에 비교 분석합니다.' }
          ].map((item, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: i * 0.2 }}
              style={{ background: '#F8FAFC', padding: '3rem 2rem', borderRadius: '24px', border: '1px solid #E2E8F0', textAlign: 'center' }}
            >
              <div style={{ fontSize: '3rem', marginBottom: '1.5rem' }}>{item.emoji}</div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#1E293B', marginBottom: '1rem' }}>{item.title}</h3>
              <p style={{ color: '#64748B', lineHeight: 1.6 }}>{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Section 3 - Social Proof */}
      <section style={{ background: '#F1F5F9', padding: '8rem 2rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#0F172A', marginBottom: '1rem', letterSpacing: '-0.02em' }}>먼저 미래를 경험한 사람들</h2>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem', maxWidth: '1200px', width: '100%' }}>
          {[
            { text: "취업 vs 대학원 고민했는데 결과 보고 바로 결정했어요. 진짜 컨설팅 받은 기분입니다.", name: "익명의 대학생", badge: "⚡ 번아웃 러너" },
            { text: "5년 뒤 나와 대화하는 기능이 소름이었어요. 내 선택의 무게를 다시 생각해보게 되네요.", name: "3년차 직장인", badge: "🦁 생존형 전략가" },
            { text: "디자인이 너무 예뻐서 친구한테 바로 공유했습니다. 다들 신기해하네요!", name: "창업 준비생", badge: "🚀 무모한 몽상가" }
          ].map((review, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: i * 0.2 }}
              style={{ background: '#FFFFFF', padding: '2.5rem 2rem', borderRadius: '24px', boxShadow: '0 10px 40px rgba(0,0,0,0.03)', position: 'relative' }}
            >
              <div style={{ fontSize: '2rem', color: '#CBD5E1', position: 'absolute', top: '1.5rem', left: '1.5rem', opacity: 0.5 }}>"</div>
              <p style={{ fontSize: '1.1rem', color: '#334155', lineHeight: 1.6, marginBottom: '2rem', position: 'relative', zIndex: 1, fontWeight: 500 }}>
                {review.text}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #F1F5F9', paddingTop: '1.5rem' }}>
                <span style={{ fontWeight: 700, color: '#0F172A' }}>{review.name}</span>
                <span style={{ fontSize: '0.85rem', background: '#F5F3FF', color: '#4F46E5', padding: '0.4rem 0.8rem', borderRadius: '20px', fontWeight: 800 }}>{review.badge}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section style={{ background: '#0F172A', padding: '8rem 2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 900, color: '#FFFFFF', marginBottom: '1.5rem', letterSpacing: '-0.02em' }}>당신의 평행우주를 확인할 준비가 되셨나요?</h2>
          <button 
            onClick={() => router.push('/simulate')}
            style={{ padding: '1.2rem 3rem', borderRadius: '16px', background: '#4F46E5', color: '#FFF', fontWeight: 800, fontSize: '1.2rem', border: 'none', cursor: 'pointer', boxShadow: '0 10px 30px rgba(79, 70, 229, 0.4)', transition: 'all 0.3s' }}
            onMouseOver={e => { e.currentTarget.style.transform = 'scale(1.05)'; }}
            onMouseOut={e => { e.currentTarget.style.transform = 'scale(1)'; }}
          >
            지금 바로 시작하기 (무료)
          </button>
        </motion.div>
      </section>
    </main>
  );
}
