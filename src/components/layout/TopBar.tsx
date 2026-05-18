import { Compass, RotateCcw } from 'lucide-react';

type TopBarProps = {
  totalCareerCount: number;
  onReset: () => void;
};

export function TopBar({ totalCareerCount, onReset }: TopBarProps) {
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
        <span className="career-count">{totalCareerCount}+ 직업</span>
        <button className="icon-button" type="button" onClick={onReset} aria-label="처음부터 다시 하기">
          <RotateCcw size={19} />
        </button>
      </div>
    </section>
  );
}
