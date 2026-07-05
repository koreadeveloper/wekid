import { Brain } from 'lucide-react';
import { getReadableKoreanLines } from '../../../lib/readableKoreanLines';
import type { CareerProfile } from '../../../types/career';

type WhyPanelProps = {
  profile: CareerProfile;
};

export function WhyPanel({ profile }: WhyPanelProps) {
  const reasonLines = getReadableKoreanLines(`${profile.summary} ${profile.topCareer.reason}`);

  return (
    <section className="why-panel">
      <div className="panel-title">
        <Brain size={20} />
        <h2>왜 잘 맞나요?</h2>
      </div>
      <p>
        {reasonLines.map((line) => (
          <span key={line}>{line}</span>
        ))}
      </p>
    </section>
  );
}
