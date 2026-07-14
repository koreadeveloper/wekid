import { RotateCcw } from 'lucide-react';

type AppMode = 'career' | 'business-card' | 'admin';

type TopBarProps = {
  mode: AppMode;
  totalCareerCount: number;
  canUseBusinessCard: boolean;
  onModeChange: (mode: AppMode) => void;
  onReset: () => void;
};

export function TopBar({ mode, totalCareerCount, canUseBusinessCard, onModeChange, onReset }: TopBarProps) {
  return (
    <section className="topbar" aria-label="상단 정보">
      <div className="brand">
        <div className="brand-mark">
          <img src="/wekid-logo.png" alt="위키드 로고" />
        </div>
        <div>
          <strong>위키드 직업 탐험</strong>
          <span>청소년 진로 직업 테스트</span>
        </div>
      </div>
      <div className="topbar-actions">
        <div className="mode-switch" aria-label="화면 선택">
          <button
            className={`mode-button ${mode === 'career' ? 'active' : ''}`}
            type="button"
            onClick={() => onModeChange('career')}
            aria-pressed={mode === 'career'}
          >
            진로 탐험
          </button>
          {canUseBusinessCard && <button
            className={`mode-button ${mode === 'business-card' ? 'active' : ''}`}
            type="button"
            onClick={() => onModeChange('business-card')}
            aria-pressed={mode === 'business-card'}
          >
            명함 제작
          </button>}
          <button
            className={`mode-button ${mode === 'admin' ? 'active' : ''}`}
            type="button"
            onClick={() => onModeChange('admin')}
            aria-pressed={mode === 'admin'}
          >
            관리자
          </button>
        </div>
        <span className="career-count">{totalCareerCount}+ 직업</span>
        <button className="icon-button" type="button" onClick={onReset} aria-label="처음부터 다시 하기">
          <RotateCcw size={19} />
        </button>
      </div>
    </section>
  );
}
