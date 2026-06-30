import { Compass, RotateCcw } from 'lucide-react';

type AppMode = 'career' | 'business-card';

type TopBarProps = {
  mode: AppMode;
  totalCareerCount: number;
  onModeChange: (mode: AppMode) => void;
  onReset: () => void;
};

export function TopBar({ mode, totalCareerCount, onModeChange, onReset }: TopBarProps) {
  return (
    <section className="topbar" aria-label="상단 정보">
      <div className="brand">
        <div className="brand-mark">
          <Compass size={22} />
        </div>
        <div>
          <strong>위키드 직업 탐험</strong>
          <span>어린이 진로 추천 테스트</span>
        </div>
      </div>
      <div className="topbar-actions">
        <div className="mode-switch" aria-label="화면 선택">
          <button
            className={`mode-button ${mode === 'career' ? 'active' : ''}`}
            type="button"
            onClick={() => onModeChange('career')}
          >
            진로 탐험
          </button>
          <button
            className={`mode-button ${mode === 'business-card' ? 'active' : ''}`}
            type="button"
            onClick={() => onModeChange('business-card')}
          >
            명함 제작
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
