import { useState } from 'react';
import { Search } from 'lucide-react';
import { careerCatalog } from '../../data/careerCatalog';
import type { CareerDefinition } from '../../types/career';

type CareerPickerProps = {
  value: string;
  onChange: (careerName: string) => void;
};

export function filterBusinessCardCareers(careers: CareerDefinition[], searchTerm: string) {
  const keyword = searchTerm.trim().toLowerCase();

  if (!keyword) {
    return careers;
  }

  return careers.filter((career) => career.name.toLowerCase().includes(keyword));
}

export function CareerPicker({ value, onChange }: CareerPickerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const careers = filterBusinessCardCareers(careerCatalog, searchTerm);

  return (
    <div className="business-card-job-selector">
      <label className="business-card-field direct-job-field">
        <span>직업명 직접 입력</span>
        <input
          type="text"
          value={value}
          maxLength={18}
          placeholder="예: 경찰관, 영상 편집자"
          onChange={(event) => onChange(event.target.value)}
        />
      </label>
      <label className="business-card-field">
        <span>희망 직업 검색</span>
        <div className="job-search-box">
          <Search size={17} />
          <input
            type="search"
            value={searchTerm}
            placeholder="원하는 직업을 검색해 보세요"
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </div>
      </label>
      <div className="job-theme-list" aria-label="희망 직업 선택">
        {careers.map((career) => (
          <button
            aria-pressed={value === career.name}
            className={`job-theme-button ${value === career.name ? 'active' : ''}`}
            key={career.name}
            type="button"
            onClick={() => onChange(career.name)}
          >
            <span aria-hidden="true">{career.detail.emoji}</span>
            <strong>{career.name}</strong>
          </button>
        ))}
        {careers.length === 0 && <p className="job-theme-empty">검색 결과가 없어요.</p>}
      </div>
    </div>
  );
}
