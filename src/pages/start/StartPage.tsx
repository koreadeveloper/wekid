import { Sparkles } from 'lucide-react';

type StartPageProps = {
  nameInput: string;
  onNameChange: (value: string) => void;
  onStart: () => void;
  onSkip: () => void;
};

export function StartPage({ nameInput, onNameChange, onStart, onSkip }: StartPageProps) {
  const hasName = Boolean(nameInput.trim());

  return (
    <section className="name-step-layout">
      <div className="name-step-card">
        <div className="name-step-emoji">🧭</div>
        <p className="section-kicker">탐험 시작</p>
        <h1>이름을 알려주세요!</h1>
        <p className="name-step-sub">결과지에 이름을 넣어드려요.</p>
        <input
          className="name-input"
          type="text"
          placeholder="예: 김탐험"
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
        <button className="primary-button name-start-btn" type="button" disabled={!hasName} onClick={onStart}>
          <Sparkles size={18} />
          탐험 시작!
        </button>
        <button className="ghost-button name-skip-btn" type="button" onClick={onSkip}>
          이름 없이 시작하기
        </button>
      </div>
    </section>
  );
}
