import { Microscope, Palette, Sparkles, Users } from 'lucide-react';

type QuizIntroProps = {
  answeredCount: number;
  totalQuestions: number;
  progress: number;
};

export function QuizIntro({ answeredCount, totalQuestions, progress }: QuizIntroProps) {
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
        <h1>나에게 잘 맞는 미래 직업 찾기</h1>
        <p>마음에 더 가까운 선택지를 고르면 마지막에 대표 추천 직업과 이유가 열립니다.</p>
      </div>

      <div className="progress-block">
        <div className="progress-label">
          <span>
            {answeredCount} / {totalQuestions}
          </span>
          <strong>{progress}%</strong>
        </div>
        <div className="progress-track" aria-hidden="true">
          <div style={{ width: `${progress}%` }} />
        </div>
      </div>
    </aside>
  );
}
