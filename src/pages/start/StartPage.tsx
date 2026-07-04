import { Sparkles } from 'lucide-react';
import type { CenterSource } from '../../lib/centerContext';

type StartPageProps = {
  centerInput: string;
  centerSource: CenterSource;
  initialUrlCenterName: string | null;
  nameInput: string;
  onCenterChange: (value: string) => void;
  onNameChange: (value: string) => void;
  onStart: () => void;
  onSkip: () => void;
};

export function StartPage({
  centerInput,
  centerSource,
  initialUrlCenterName,
  nameInput,
  onCenterChange,
  onNameChange,
  onStart,
  onSkip,
}: StartPageProps) {
  const hasName = Boolean(nameInput.trim());
  const hasUrlCenter = Boolean(initialUrlCenterName);

  return (
    <section className="name-step-layout">
      <div className="name-step-card">
        <div className="name-step-copy">
          <div className="name-step-emoji">🧭</div>
          <p className="section-kicker">탐험 시작</p>
          <h1>
            이름과 센터명을
            <br />
            알려주세요
          </h1>
          <p className="name-step-sub">
            검사를 마치면 이름, 센터명, 선택한 답변과 결과가 저장될 수 있어요. 센터명은 비워도 진행할 수 있어요.
          </p>
        </div>
        <div className="name-step-form">
          <input
            className="name-input"
            type="text"
            placeholder="예: 김탐험"
            aria-label="이름"
            value={nameInput}
            maxLength={10}
            onChange={(event) => onNameChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && hasName) {
                onStart();
              }
            }}
            autoFocus
          />
          <label className="center-input-wrap">
            <span>센터명</span>
            {hasUrlCenter && centerSource === 'url' && <small>URL에서 자동 입력됐어요. 필요하면 수정할 수 있어요.</small>}
            <input
              className="center-input"
              type="text"
              placeholder="예: 강남청소년센터"
              value={centerInput}
              maxLength={40}
              onChange={(event) => onCenterChange(event.target.value)}
            />
          </label>
          <button className="primary-button name-start-btn" type="button" disabled={!hasName} onClick={onStart}>
            <Sparkles size={18} />
            탐험 시작!
          </button>
          {!hasName && <p className="name-helper">이름을 쓰거나 아래에서 이름 없이 시작할 수 있어요.</p>}
          <button className="ghost-button name-skip-btn" type="button" onClick={onSkip}>
            이름 없이 시작하기
          </button>
        </div>
      </div>
    </section>
  );
}
