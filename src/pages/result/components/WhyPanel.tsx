import { Brain } from 'lucide-react';
import type { CareerProfile } from '../../../types/career';

type WhyPanelProps = {
  profile: CareerProfile;
};

export function WhyPanel({ profile }: WhyPanelProps) {
  return (
    <section className="why-panel">
      <div className="panel-title">
        <Brain size={20} />
        <h2>왜 잘 맞나요?</h2>
      </div>
      <p>
        {profile.summary} {profile.topCareer.reason}
      </p>
    </section>
  );
}
