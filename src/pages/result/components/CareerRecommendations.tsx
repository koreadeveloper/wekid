import type { CareerRecommendation } from '../../../types/career';

type CareerRecommendationsProps = {
  careers: CareerRecommendation[];
};

export function CareerRecommendations({ careers }: CareerRecommendationsProps) {
  return (
    <section className="career-section">
      <div className="section-heading">
        <p className="section-kicker">함께 잘 맞는 직업</p>
        <h2>추천 직업과 이유</h2>
      </div>
      <div className="career-grid primary career-reason-grid">
        {careers.map((career, index) => (
          <article className="career-card reason-card" key={career.name}>
            <span>{String(index + 1).padStart(2, '0')}</span>
            <strong>{career.name}</strong>
            <p>{career.reason}</p>
            <div className="fit-tag-row">
              {career.fitTags.map((tag) => (
                <small key={tag}>{tag}</small>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
