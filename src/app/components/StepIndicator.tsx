import React from 'react';

interface StepIndicatorProps {
  currentStep: number;
}

export default function StepIndicator({ currentStep }: StepIndicatorProps) {
  const steps = [
    { id: 1, label: '기본 정보' },
    { id: 2, label: '가치관' },
    { id: 3, label: '리스크' },
    { id: 4, label: '선택의 기로' },
  ];

  return (
    <div className="w-full max-w-2xl mx-auto mb-10 px-4 mt-6">
      <div style={{ display: 'flex', alignItems: 'flex-start', width: '100%' }}>
        {steps.map((step, index) => {
          const isCompleted = step.id < currentStep;
          const isCurrent = step.id === currentStep;

          return (
            <React.Fragment key={step.id}>
              {/* 노드 영역 */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                <div 
                  style={{ 
                    width: '32px', 
                    height: '32px', 
                    borderRadius: '50%', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    backgroundColor: isCompleted ? '#4F46E5' : isCurrent ? '#FFFFFF' : '#E5E7EB',
                    border: isCurrent ? '2px solid #4F46E5' : 'none',
                    color: isCompleted ? '#FFFFFF' : isCurrent ? '#4F46E5' : '#4B5563',
                    boxSizing: 'border-box',
                    zIndex: 2
                  }}
                >
                  {isCompleted ? <span>✓</span> : <span>{step.id}</span>}
                </div>
                
                {/* 라벨 영역 */}
                <div 
                  className="hidden sm:block"
                  style={{ 
                    marginTop: '8px',
                    whiteSpace: 'nowrap', 
                    fontSize: '11px', 
                    fontWeight: 'bold',
                    color: isCompleted || isCurrent ? '#4F46E5' : '#4B5563' 
                  }}
                >
                  {step.label}
                </div>
              </div>

              {/* 연결선 영역 */}
              {index < steps.length - 1 && (
                <div 
                  style={{
                    flexGrow: 1,
                    height: '2px',
                    backgroundColor: step.id < currentStep ? '#4F46E5' : '#E5E7EB',
                    margin: '15px 8px 0 8px',
                    zIndex: 1
                  }}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
