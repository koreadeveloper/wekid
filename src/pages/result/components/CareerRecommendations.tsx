import type { CareerRecommendation } from '../../../types/career';

type CareerRecommendationsProps = {
  careers: CareerRecommendation[];
  hasCareerDetail: (careerName: string) => boolean;
  onCareerSelect: (careerName: string) => void;
};

export function CareerRecommendations({ careers, hasCareerDetail, onCareerSelect }: CareerRecommendationsProps) {
  return (
    <section className="career-section">
      <div className="section-heading">
        <p className="section-kicker">함께 잘 맞는 직업</p>
        <h2>추천 직업과 이유</h2>
      </div>
      <div className="career-grid primary career-reason-grid">
        {careers.map((career, index) => {
          const hasDetail = hasCareerDetail(career.name);
          return (
            <article
              className={`career-card reason-card ${hasDetail ? 'clickable' : ''}`}
              key={career.name}
              onClick={() => hasDetail && onCareerSelect(career.name)}
            >
              <span>{String(index + 1).padStart(2, '0')}</span>
              <strong>{career.name}</strong>
              <p>{career.reason}</p>
              <div className="fit-tag-row">
                {career.fitTags.map((tag) => (
                  <small key={tag}>{tag}</small>
                ))}
              </div>
              {hasDetail && <div className="career-detail-hint">자세히 보기 →</div>}
            </article>
          );
        })}
      </div>
    </section>
  );
}
