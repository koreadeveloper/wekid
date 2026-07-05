import { Microscope, Palette, Sparkles, Users } from 'lucide-react';

type QuizIntroProps = {
  answeredCount: number;
  totalQuestions: number;
  progress: number;
  userName: string;
};

export function QuizIntro({ answeredCount, totalQuestions, progress, userName }: QuizIntroProps) {
  return (
    <aside className="intro-panel" aria-label="테스트 정보">
      <div className="visual-board">
        <div className="visual-card visual-card-large">
          <Sparkles size={28} />
          <span>미래</span>
        </div>
        <div className="visual-card">
          <Microscope size={25} />
          <span>탐구</span>
        </div>
        <div className="visual-card">
          <Palette size={25} />
          <span>예술</span>
        </div>
        <div className="visual-card visual-card-wide">
          <Users size={25} />
          <span>팀</span>
        </div>
      </div>

      <div className="intro-copy">
        <p className="section-kicker">{totalQuestions}문항</p>
        <h1>{userName ? `${userName}의 미래 직업 찾기` : '나에게 잘 맞는 미래 직업 찾기'}</h1>
        <p>{totalQuestions}문항에 답하면 나에게 잘 맞는 직업과 이유를 볼 수 있어요.</p>
      </div>

      <div className="progress-block">
        <div className="progress-label">
          <span>
            {answeredCount} / {totalQuestions}
          </span>
          <strong>{progress}%</strong>
        </div>
        <div
          className="progress-track"
          role="progressbar"
          aria-label="검사 진행률"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progress}
          aria-valuetext={`${answeredCount} / ${totalQuestions}, ${progress}%`}
        >
          <div style={{ width: `${progress}%` }} />
        </div>
      </div>
    </aside>
  );
}
