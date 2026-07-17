import { Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { CareerDefinition, DreamChoice } from '../../../types/career';

type DreamChoicePanelProps = {
  careers: CareerDefinition[];
  recommendedCareerNames: string[];
  onConfirm: (choice: DreamChoice) => void;
  isSaving?: boolean;
  isSaved?: boolean;
};

export function isDreamChoiceReady(choice: DreamChoice | undefined): choice is DreamChoice {
  return Boolean(choice && (choice.kind === 'undecided' || choice.careerName.trim().length > 0));
}

export function getDreamChoiceText(choice: DreamChoice | undefined) {
  if (!choice || choice.kind === 'undecided') {
    return '아직 더 찾아보는 중';
  }

  return choice.careerName;
}

export function DreamChoicePanel({
  careers,
  recommendedCareerNames,
  onConfirm,
  isSaving = false,
  isSaved = false,
}: DreamChoicePanelProps) {
  const [choice, setChoice] = useState<DreamChoice>();
  const [searchTerm, setSearchTerm] = useState('');
  const [customName, setCustomName] = useState('');
  const trimmedSearch = searchTerm.trim().toLocaleLowerCase('ko-KR');
  const groupedCareers = useMemo(() => {
    const groups = new Map<string, CareerDefinition[]>();

    careers
      .filter((career) => !trimmedSearch || career.name.toLocaleLowerCase('ko-KR').includes(trimmedSearch))
      .forEach((career) => {
        const group = groups.get(career.libraryCategory) ?? [];
        group.push(career);
        groups.set(career.libraryCategory, group);
      });

    return Array.from(groups.entries());
  }, [careers, trimmedSearch]);

  const selectCustom = (value: string) => {
    const nextName = value.slice(0, 40);
    setCustomName(nextName);
    setChoice(nextName.trim() ? { kind: 'custom', careerName: nextName } : undefined);
  };

  return (
    <section className="dream-choice-panel" aria-labelledby="dream-choice-title">
      <div className="section-heading">
        <p className="section-kicker">마지막 선택</p>
        <h2 id="dream-choice-title">내가 고른 꿈</h2>
        <p>추천을 참고해도 좋고, 목록에서 직접 찾거나 나만의 꿈을 적어도 괜찮아요.</p>
      </div>

      <div className="dream-choice-block">
        <h3>추천 직업에서 고르기</h3>
        <div className="dream-chip-grid">
          {recommendedCareerNames.map((careerName) => (
            <button
              className={`dream-chip ${choice?.kind === 'recommended' && choice.careerName === careerName ? 'selected' : ''}`}
              key={careerName}
              type="button"
              onClick={() => setChoice({ kind: 'recommended', careerName })}
              aria-pressed={choice?.kind === 'recommended' && choice.careerName === careerName}
            >
              {careerName}
            </button>
          ))}
        </div>
      </div>

      <div className="dream-choice-block">
        <label className="dream-search" htmlFor="dream-career-search">
          <Search size={18} />
          <span className="sr-only">직업 목록 검색</span>
          <input
            id="dream-career-search"
            type="search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="직업 목록에서 찾아보기"
          />
        </label>
        <div className="dream-library" aria-label="직업 목록">
          {groupedCareers.map(([category, categoryCareers]) => (
            <div className="dream-library-group" key={category}>
              <h3>{category}</h3>
              <div className="dream-chip-grid">
                {categoryCareers.map((career) => (
                  <button
                    className={`dream-chip ${choice?.kind === 'catalog' && choice.careerName === career.name ? 'selected' : ''}`}
                    key={career.name}
                    type="button"
                    onClick={() => setChoice({ kind: 'catalog', careerName: career.name })}
                    aria-pressed={choice?.kind === 'catalog' && choice.careerName === career.name}
                  >
                    {career.name}
                  </button>
                ))}
              </div>
            </div>
          ))}
          {groupedCareers.length === 0 && <p className="dream-empty">찾는 직업이 없어요. 아래에 직접 적어 볼 수 있어요.</p>}
        </div>
      </div>

      <div className="dream-choice-block">
        <label className="dream-custom-label" htmlFor="custom-dream">
          목록에 없는 꿈 직접 적기
        </label>
        <input
          id="custom-dream"
          className="dream-custom-input"
          maxLength={40}
          value={customName}
          onChange={(event) => selectCustom(event.target.value)}
          placeholder="예: 만화 번역가"
        />
      </div>

      <div className="dream-choice-actions">
        <button
          className={`dream-undecided ${choice?.kind === 'undecided' ? 'selected' : ''}`}
          type="button"
          onClick={() => setChoice({ kind: 'undecided' })}
          aria-pressed={choice?.kind === 'undecided'}
        >
          아직 더 찾아볼래요
        </button>
        <button
          className="primary-button"
          type="button"
          disabled={!isDreamChoiceReady(choice) || isSaving || isSaved}
          onClick={() => choice && onConfirm(choice)}
        >
          {isSaved ? '결과를 저장했어요' : isSaving ? '결과 저장 중' : '이 꿈으로 결과 저장하기'}
        </button>
      </div>
      {choice && <p className="dream-selected">내가 고른 꿈: <strong>{getDreamChoiceText(choice)}</strong></p>}
    </section>
  );
}
