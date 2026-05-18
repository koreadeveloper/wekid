import type { CSSProperties } from 'react';
import type { CareerCategory } from '../../../types/career';

type AccentStyle = CSSProperties & { '--accent': string };

type CareerLibraryProps = {
  categories: CareerCategory[];
  highlightedCareers: Set<string>;
  hasCareerDetail: (careerName: string) => boolean;
  onCareerSelect: (careerName: string) => void;
};

export function CareerLibrary({ categories, highlightedCareers, hasCareerDetail, onCareerSelect }: CareerLibraryProps) {
  return (
    <section className="library-section">
      <div className="section-heading">
        <p className="section-kicker">직업 지도</p>
        <h2>전체 직업 지도</h2>
      </div>
      <div className="category-grid">
        {categories.map((category) => {
          const Icon = category.icon;
          return (
            <article className="category-panel" key={category.title} style={{ '--accent': category.accent } as AccentStyle}>
              <div className="category-title">
                <Icon size={22} />
                <h3>{category.title}</h3>
              </div>
              <div className="career-chip-grid compact">
                {category.careers.map((career) => {
                  const hasDetail = hasCareerDetail(career);
                  return (
                    <span
                      className={`career-chip ${highlightedCareers.has(career) ? 'matched' : ''} ${hasDetail ? 'has-detail' : ''}`}
                      key={career}
                      onClick={() => hasDetail && onCareerSelect(career)}
                    >
                      {career}
                    </span>
                  );
                })}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
