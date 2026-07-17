import type { CareerFieldResult } from '../../../types/career';

type CareerRecommendationsProps = {
  fieldResults: CareerFieldResult[];
  hasCareerDetail: (careerName: string) => boolean;
  onCareerSelect: (careerName: string) => void;
};

const scoreBandLabel: Record<CareerFieldResult['scoreBand'], string> = {
  'very-high': '아주 잘 맞는 방향',
  high: '잘 맞는 방향',
  explore: '더 탐험해 볼 방향',
};

export function CareerRecommendations({ fieldResults, hasCareerDetail, onCareerSelect }: CareerRecommendationsProps) {
  return (
    <section className="field-results" aria-labelledby="field-results-title">
      <div className="section-heading">
        <p className="section-kicker">추천 방향</p>
        <h2 id="field-results-title">내가 더 탐험해 볼 분야와 직업</h2>
      </div>
      <div className="field-result-grid">
        {fieldResults.map((field) => (
          <article className="field-result-card" key={field.fieldId}>
            <div className="field-result-heading">
              <div>
                <p>{scoreBandLabel[field.scoreBand]}</p>
                <h3>{field.label}</h3>
              </div>
              <strong>{Math.round(field.score * 100)}%</strong>
            </div>
            {field.evidence.length > 0 && (
              <p className="field-evidence">고른 활동: {field.evidence.join(' · ')}</p>
            )}
            <div className="field-career-list">
              {field.recommendedCareers.map((career) => {
                const hasDetail = hasCareerDetail(career.name);
                return (
                  <button
                    className="field-career-chip"
                    key={career.name}
                    type="button"
                    disabled={!hasDetail}
                    onClick={() => hasDetail && onCareerSelect(career.name)}
                    title={career.reason}
                  >
                    {career.name}
                  </button>
                );
              })}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
