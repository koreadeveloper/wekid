import { RotateCcw } from 'lucide-react';
import { ResetConfirmButton } from './ResetConfirmButton';
import type { AppMode } from '../../lib/appMode';

const SITE_LOGO_URL = '/brand/wekid-site-logo.png';

type TopBarProps = {
  mode: AppMode;
  showReset: boolean;
  totalCareerCount: number;
  onModeChange: (mode: AppMode) => void;
  onReset: () => void;
};

export function TopBar({ mode, showReset, totalCareerCount, onModeChange, onReset }: TopBarProps) {
  return (
    <section className="topbar" aria-label="상단 정보">
      <div className="brand">
        <div className="brand-mark" aria-hidden="true">
          <img className="brand-logo" src={SITE_LOGO_URL} alt="" />
        </div>
        <div>
          <strong>위키드 직업 탐험</strong>
          <span>어린이 진로 추천 테스트</span>
        </div>
      </div>
      <div className="topbar-actions">
        <div className={`mode-switch ${mode === 'admin' ? 'with-admin' : ''}`} role="group" aria-label="화면 선택">
          <button
            className={`mode-button ${mode === 'career' ? 'active' : ''}`}
            type="button"
            onClick={() => onModeChange('career')}
            aria-pressed={mode === 'career'}
          >
            진로 탐험
          </button>
          <button
            className={`mode-button ${mode === 'business-card' ? 'active' : ''}`}
            type="button"
            onClick={() => onModeChange('business-card')}
            aria-pressed={mode === 'business-card'}
          >
            명함 제작
          </button>
          {mode === 'admin' && (
            <button
              className="mode-button active"
              type="button"
              onClick={() => onModeChange('admin')}
              aria-pressed="true"
            >
              센터 관리
            </button>
          )}
        </div>
        <span className="career-count">{totalCareerCount}+ 직업</span>
        {showReset && (
          <ResetConfirmButton className="icon-button" onConfirm={onReset} ariaLabel="검사 처음부터 다시 하기">
            <RotateCcw size={19} />
          </ResetConfirmButton>
        )}
      </div>
    </section>
  );
}
