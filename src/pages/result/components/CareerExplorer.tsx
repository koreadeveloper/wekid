import type { CareerRecommendation } from '../../../types/career';

type CareerExplorerProps = {
  careers: CareerRecommendation[];
};

export function CareerExplorer({ careers }: CareerExplorerProps) {
  return (
    <section className="career-section">
      <div className="section-heading">
        <p className="section-kicker">더 넓게 보기</p>
        <h2>함께 탐험할 직업</h2>
      </div>
      <div className="career-chip-grid">
        {careers.map((career) => (
          <span className="career-chip strong" key={career.name} title={career.reason}>
            {career.name}
          </span>
        ))}
      </div>
    </section>
  );
}
