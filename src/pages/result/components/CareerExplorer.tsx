import type { CareerRecommendation } from '../../../types/career';

type CareerExplorerProps = {
  careers: CareerRecommendation[];
  hasCareerDetail: (careerName: string) => boolean;
  onCareerSelect: (careerName: string) => void;
};

export function CareerExplorer({ careers, hasCareerDetail, onCareerSelect }: CareerExplorerProps) {
  return (
    <section className="career-section">
      <div className="section-heading">
        <p className="section-kicker">더 넓게 보기</p>
        <h2>함께 탐험할 직업</h2>
      </div>
      <div className="career-chip-grid">
        {careers.map((career) => {
          const hasDetail = hasCareerDetail(career.name);
          return (
            <span
              className={`career-chip strong ${hasDetail ? 'has-detail' : ''}`}
              key={career.name}
              title={career.reason}
              onClick={() => hasDetail && onCareerSelect(career.name)}
            >
              {career.name}
              {hasDetail ? ' →' : ''}
            </span>
          );
        })}
      </div>
    </section>
  );
}
