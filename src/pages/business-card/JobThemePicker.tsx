import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { Search } from 'lucide-react';
import type { JobCardTheme } from '../../lib/jobCardThemes';
import { JobThemeIcon } from './JobThemeIcon';

const JOB_THEME_LIST_ID = 'business-card-job-theme-list';
const JOB_THEME_STATUS_ID = 'business-card-job-theme-status';

type JobThemePickerProps = {
  readonly filteredJobThemes: readonly JobCardTheme[];
  readonly jobSearch: string;
  readonly selectedJobKey: JobCardTheme['key'];
  readonly onJobSearchChange: (value: string) => void;
  readonly onSelectJobTheme: (theme: JobCardTheme) => void;
};

export function JobThemePicker({
  filteredJobThemes,
  jobSearch,
  selectedJobKey,
  onJobSearchChange,
  onSelectJobTheme,
}: JobThemePickerProps) {
  const [keyboardActiveJobKey, setKeyboardActiveJobKey] = useState<JobCardTheme['key']>(selectedJobKey);
  const jobButtonRefs = useRef(new Map<JobCardTheme['key'], HTMLButtonElement>());

  useEffect(() => {
    if (filteredJobThemes.length === 0) {
      return;
    }

    const activeJobVisible = filteredJobThemes.some((theme) => theme.key === keyboardActiveJobKey);
    if (!activeJobVisible) {
      const selectedJobVisible = filteredJobThemes.some((theme) => theme.key === selectedJobKey);
      setKeyboardActiveJobKey(selectedJobVisible ? selectedJobKey : filteredJobThemes[0].key);
    }
  }, [filteredJobThemes, keyboardActiveJobKey, selectedJobKey]);

  const selectJobTheme = (theme: JobCardTheme) => {
    setKeyboardActiveJobKey(theme.key);
    onSelectJobTheme(theme);
  };

  const handleJobThemeKeyDown = (event: KeyboardEvent<HTMLButtonElement>, theme: JobCardTheme) => {
    const currentIndex = filteredJobThemes.findIndex((candidate) => candidate.key === theme.key);
    if (currentIndex === -1 || filteredJobThemes.length === 0) {
      return;
    }

    let nextIndex: number | null = null;
    switch (event.key) {
      case 'ArrowDown':
      case 'ArrowRight':
        nextIndex = (currentIndex + 1) % filteredJobThemes.length;
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        nextIndex = (currentIndex - 1 + filteredJobThemes.length) % filteredJobThemes.length;
        break;
      case 'Home':
        nextIndex = 0;
        break;
      case 'End':
        nextIndex = filteredJobThemes.length - 1;
        break;
      default:
        return;
    }

    event.preventDefault();
    const nextTheme = filteredJobThemes[nextIndex];
    if (!nextTheme) {
      return;
    }

    selectJobTheme(nextTheme);
    jobButtonRefs.current.get(nextTheme.key)?.focus();
  };

  return (
    <div className="business-card-job-selector">
      <label className="business-card-field">
        <span>하고 싶은 직업 찾기</span>
        <div className="job-search-box">
          <Search size={17} />
          <input
            type="search"
            value={jobSearch}
            placeholder="직업 이름이나 관련 말로 찾아보세요"
            aria-controls={JOB_THEME_LIST_ID}
            aria-describedby={JOB_THEME_STATUS_ID}
            onChange={(event) => onJobSearchChange(event.target.value)}
          />
        </div>
      </label>
      <p className="job-theme-count" id={JOB_THEME_STATUS_ID} role="status" aria-live="polite" aria-atomic="true">
        {filteredJobThemes.length}개 직업
      </p>
      <div
        className="job-theme-list"
        id={JOB_THEME_LIST_ID}
        role="radiogroup"
        aria-label="하고 싶은 직업 선택"
        aria-describedby={JOB_THEME_STATUS_ID}
      >
        {filteredJobThemes.map((theme) => (
          <button
            className={`job-theme-button ${selectedJobKey === theme.key ? 'active' : ''}`}
            key={theme.key}
            ref={(button) => {
              if (button) {
                jobButtonRefs.current.set(theme.key, button);
              } else {
                jobButtonRefs.current.delete(theme.key);
              }
            }}
            title={`${theme.name} ${theme.englishName}`}
            type="button"
            role="radio"
            aria-checked={selectedJobKey === theme.key}
            tabIndex={theme.key === keyboardActiveJobKey ? 0 : -1}
            onFocus={() => setKeyboardActiveJobKey(theme.key)}
            onKeyDown={(event) => handleJobThemeKeyDown(event, theme)}
            onClick={() => selectJobTheme(theme)}
          >
            <span className="job-theme-symbol" aria-hidden="true">
              <JobThemeIcon category={theme.category} />
            </span>
            <span className="job-theme-text">
              <strong>{theme.name}</strong>
              <small>{theme.hint}</small>
            </span>
          </button>
        ))}
        {filteredJobThemes.length === 0 && <p className="job-theme-empty">검색 결과가 없어요.</p>}
      </div>
    </div>
  );
}
