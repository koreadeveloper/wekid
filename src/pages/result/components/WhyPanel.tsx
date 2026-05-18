import { Brain } from 'lucide-react';
import type { CareerProfile } from '../../../types/career';

type WhyPanelProps = {
  profile: CareerProfile;
};

const getSentenceLines = (text: string) => text.match(/[^.!?]+[.!?]+|[^.!?]+$/g)?.map((line) => line.trim()) ?? [text];

export function WhyPanel({ profile }: WhyPanelProps) {
  const reasonLines = getSentenceLines(`${profile.summary} ${profile.topCareer.reason}`);

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
