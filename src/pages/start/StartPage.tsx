import type { CenterSource } from '../../lib/centerContext';

const KEYBOARD_START_KEYS = new Set(['Enter', ' ']);

type StartPageProps = {
  centerInput: string;
  centerSource: CenterSource;
  initialUrlCenterName: string | null;
  nameInput: string;
  onCenterChange: (value: string) => void;
  onNameChange: (value: string) => void;
  onStart: (shouldFocusQuiz?: boolean) => void;
  onSkip: (shouldFocusQuiz?: boolean) => void;
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
  const startTest = (shouldFocusQuiz = false) => {
    if (hasName) {
      onStart(shouldFocusQuiz);
      return;
    }

    onSkip(shouldFocusQuiz);
  };

  return (
    <section className="name-step-layout">
      <div className="name-step-card">
        <div className="name-step-copy">
          <p className="section-kicker">탐험 준비</p>
          <h1>누가 탐험하나요?</h1>
          <p className="name-step-sub">
            이름과 센터명은 선택이에요. 답변과 결과는 저장될 수 있어요.
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
              if (event.key === 'Enter') {
                startTest(true);
              }
            }}
            autoFocus
          />
          <label className="center-input-wrap">
            <span>센터명</span>
            {hasUrlCenter && centerSource === 'url' && <small>초대 링크에서 센터명이 들어왔어요. 필요하면 고칠 수 있어요.</small>}
            <input
              className="center-input"
              type="text"
              placeholder="예: 강남청소년센터"
              value={centerInput}
              maxLength={40}
              onChange={(event) => onCenterChange(event.target.value)}
            />
          </label>
          <button
            className="primary-button name-start-btn"
            type="button"
            onClick={() => startTest()}
            onKeyDown={(event) => {
              if (!KEYBOARD_START_KEYS.has(event.key)) {
                return;
              }

              event.preventDefault();
              startTest(true);
            }}
          >
            검사 시작
          </button>
        </div>
      </div>
    </section>
  );
}
