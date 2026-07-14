import type { CareerRecommendation, CategoryRecommendationGroup } from '../../../types/career';

type CareerRecommendationsProps = {
  careers: CareerRecommendation[];
  categoryRecommendations?: CategoryRecommendationGroup[];
  hasCareerDetail: (careerName: string) => boolean;
  onCareerSelect: (careerName: string) => void;
};

export function CareerRecommendations({ careers, categoryRecommendations = [], hasCareerDetail, onCareerSelect }: CareerRecommendationsProps) {
  return (
    <section className="career-section">
      <div className="section-heading">
        <p className="section-kicker">함께 잘 맞는 직업</p>
        <h2>추천 직업과 이유</h2>
      </div>
      {categoryRecommendations.length > 0 && (
        <div className="category-recommendation-grid" aria-label="분야별 추천 직업">
          {categoryRecommendations.map((group) => (
            <div className="category-recommendation-card" key={group.category}>
              <div className="category-recommendation-heading">
                <strong>{group.category}</strong>
                <span>{Math.round(group.score * 100)}%</span>
              </div>
              <div className="category-recommendation-careers">
                {group.careers.map((career) => {
                  const hasDetail = hasCareerDetail(career.name);
                  return (
                    <button
                      className="category-career-chip"
                      key={career.name}
                      type="button"
                      onClick={() => hasDetail && onCareerSelect(career.name)}
                      disabled={!hasDetail}
                    >
                      {career.name}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="career-grid primary career-reason-grid">
        {careers.map((career, index) => {
          const hasDetail = hasCareerDetail(career.name);
          return (
            <button
              className={`career-card reason-card ${hasDetail ? 'clickable' : ''}`}
              key={career.name}
              type="button"
              onClick={() => hasDetail && onCareerSelect(career.name)}
              disabled={!hasDetail}
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
            </button>
          );
        })}
      </div>
    </section>
  );
}
