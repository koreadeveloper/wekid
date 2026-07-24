import type { CenterSource } from '../../lib/centerContext';

type StartPageProps = {
  centerInput: string;
  emailInput: string;
  centerSource: CenterSource;
  initialUrlCenterName: string | null;
  nameInput: string;
  onCenterChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onNameChange: (value: string) => void;
  onStart: (shouldFocusQuiz?: boolean) => void;
  onSkip: (shouldFocusQuiz?: boolean) => void;
};

export function StartPage({
  centerInput,
  centerSource,
  emailInput,
  initialUrlCenterName,
  nameInput,
  onCenterChange,
  onEmailChange,
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
        <div className="name-step-logo">
          <img src="/wekid-logo.png" alt="위키드 로고" />
        </div>
        <p className="section-kicker">탐험 준비</p>
        <h1>누가 탐험하나요?</h1>
        <p className="name-step-sub">
          이름과 센터명은 선택이에요.
          <br />
          답변과 결과는 저장될 수 있어요.
        </p>
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
        <label className="center-input-wrap">
          <span>이메일 (선택)</span>
          <input
            className="center-input"
            type="email"
            placeholder="예: dream@wekid.kr"
            value={emailInput}
            maxLength={40}
            onChange={(event) => onEmailChange(event.target.value)}
          />
        </label>
        <button className="primary-button name-start-btn" type="button" onClick={() => startTest(false)}>
          검사 시작
        </button>
      </div>
    </section>
  );
}
