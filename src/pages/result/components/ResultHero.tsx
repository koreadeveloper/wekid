import { PartyPopper } from 'lucide-react';
import type { CareerProfile } from '../../../types/career';

type ResultHeroProps = {
  profile: CareerProfile;
};

export function ResultHero({ profile }: ResultHeroProps) {
  return (
    <section className="result-hero career-result-hero">
      <div>
        <p className="section-kicker">추천 결과</p>
        <h1>가장 잘 맞는 직업은 {profile.topCareer.name}예요</h1>
        <p className="result-subtitle">{profile.headline}</p>
        <p className="result-description">{profile.summary}</p>
        <div className="badge-row">
          {profile.topCareer.fitTags.map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>
      </div>
      <article className="top-career-card">
        <div className="top-career-icon">
          <PartyPopper size={36} />
        </div>
        <span>대표 추천</span>
        <strong>{profile.topCareer.name}</strong>
      </article>
    </section>
  );
}
