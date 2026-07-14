import { ChevronDown, ChevronUp, Search } from 'lucide-react';
import { useMemo, useState, type CSSProperties } from 'react';
import type { CareerCategory } from '../../../types/career';

type AccentStyle = CSSProperties & { '--accent': string };

type VisibleCareerCategory = CareerCategory & {
  visibleCareers: string[];
};

type CareerLibraryProps = {
  categories: CareerCategory[];
  highlightedCareers: Set<string>;
  hasCareerDetail: (careerName: string) => boolean;
  onCareerSelect: (careerName: string) => void;
};

const PREVIEW_CATEGORY_COUNT = 4;
const PREVIEW_CAREER_COUNT = 10;

export function CareerLibrary({ categories, highlightedCareers, hasCareerDetail, onCareerSelect }: CareerLibraryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategoryTitle, setActiveCategoryTitle] = useState('all');
  const [isExpanded, setIsExpanded] = useState(false);

  const trimmedSearchTerm = searchTerm.trim().toLowerCase();
  const isFiltered = activeCategoryTitle !== 'all' || trimmedSearchTerm.length > 0;

  const filteredCategories = useMemo<VisibleCareerCategory[]>(() => {
    return categories
      .filter((category) => activeCategoryTitle === 'all' || category.title === activeCategoryTitle)
      .map((category) => {
        const titleMatches = category.title.toLowerCase().includes(trimmedSearchTerm);
        const visibleCareers =
          !trimmedSearchTerm || titleMatches
            ? category.careers
            : category.careers.filter((career) => career.toLowerCase().includes(trimmedSearchTerm));

        return { ...category, visibleCareers };
      })
      .filter((category) => category.visibleCareers.length > 0);
  }, [activeCategoryTitle, categories, trimmedSearchTerm]);

  const visibleCategories =
    isExpanded || isFiltered ? filteredCategories : filteredCategories.slice(0, PREVIEW_CATEGORY_COUNT);

  return (
    <section className="library-section">
      <div className="library-heading-row">
        <div className="section-heading">
          <p className="section-kicker">직업 지도</p>
          <h2>전체 직업 지도</h2>
        </div>
        <button
          className="library-toggle"
          type="button"
          onClick={() => setIsExpanded((current) => !current)}
          aria-expanded={isExpanded}
        >
          {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          {isExpanded ? '접기' : '펼치기'}
        </button>
      </div>

      <div className="library-controls">
        <label className="library-search">
          <Search size={18} />
          <input
            type="search"
            value={searchTerm}
            placeholder="직업 검색"
            onChange={(event) => {
              setSearchTerm(event.target.value);
              setIsExpanded(true);
            }}
          />
        </label>
        <div className="library-category-filter" aria-label="직업 카테고리">
          <button
            className={`library-filter-button ${activeCategoryTitle === 'all' ? 'active' : ''}`}
            type="button"
            onClick={() => {
              setActiveCategoryTitle('all');
              setIsExpanded(false);
            }}
          >
            전체
          </button>
          {categories.map((category) => (
            <button
              className={`library-filter-button ${activeCategoryTitle === category.title ? 'active' : ''}`}
              key={category.title}
              type="button"
              onClick={() => {
                setActiveCategoryTitle(category.title);
                setIsExpanded(true);
              }}
            >
              {category.title}
            </button>
          ))}
        </div>
      </div>

      <div className="category-grid">
        {visibleCategories.map((category) => {
          const Icon = category.icon;
          const visibleCareers =
            isExpanded || isFiltered ? category.visibleCareers : category.visibleCareers.slice(0, PREVIEW_CAREER_COUNT);
          return (
            <article className="category-panel" key={category.title} style={{ '--accent': category.accent } as AccentStyle}>
              <div className="category-title">
                <Icon size={22} />
                <h3>{category.title}</h3>
              </div>
              <div className="career-chip-grid compact">
                {visibleCareers.map((career) => {
                  const hasDetail = hasCareerDetail(career);
                  return (
                    <button
                      className={`career-chip ${highlightedCareers.has(career) ? 'matched' : ''} ${hasDetail ? 'has-detail' : ''}`}
                      key={career}
                      type="button"
                      onClick={() => hasDetail && onCareerSelect(career)}
                      disabled={!hasDetail}
                    >
                      {career}
                    </button>
                  );
                })}
              </div>
            </article>
          );
        })}
      </div>
      {visibleCategories.length === 0 && <p className="library-empty">검색 결과가 없어요.</p>}
    </section>
  );
}
