import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { fetchAdminResults, toAdminDate } from '../../lib/adminResults';
import {
  createBusinessCardPrefill,
  searchBusinessCardResults,
  type BusinessCardPrefill,
} from '../../lib/businessCardPrefill';
import type { StoredTestResultRecord } from '../../types/firestore';

type SurveyResultLookupProps = {
  onSelect: (prefill: BusinessCardPrefill) => void;
  initialResults?: StoredTestResultRecord[];
};

function formatResultDate(value: StoredTestResultRecord['createdAt']) {
  return toAdminDate(value)?.toLocaleDateString('ko-KR') ?? '-';
}

export function SurveyResultLookup({ onSelect, initialResults }: SurveyResultLookupProps) {
  const [query, setQuery] = useState(
    () => initialResults?.find((result) => result.participantName?.trim())?.participantName?.trim() ?? '',
  );
  const [results, setResults] = useState<StoredTestResultRecord[]>(initialResults ?? []);
  const [status, setStatus] = useState<'loading' | 'ready' | 'unavailable'>(initialResults ? 'ready' : 'loading');
  const [selectedResult, setSelectedResult] = useState<StoredTestResultRecord | null>(null);

  useEffect(() => {
    if (initialResults) {
      return;
    }

    let cancelled = false;
    void fetchAdminResults().then((response) => {
      if (cancelled) {
        return;
      }

      if (response.ok) {
        setResults(response.results);
        setStatus('ready');
      } else {
        setStatus('unavailable');
      }
    });

    return () => {
      cancelled = true;
    };
  }, [initialResults]);

  const matches = query.trim() ? searchBusinessCardResults(results, query) : [];

  return (
    <section className="business-card-panel survey-result-lookup" aria-label="설문 결과 이름 검색">
      <div className="survey-result-lookup-heading">
        <div>
          <p className="section-kicker">설문 결과 불러오기</p>
          <h2>이름으로 응답 찾기</h2>
        </div>
        <p>동명인은 이메일·소속·응답일로 구분해 주세요.</p>
      </div>

      <label className="survey-result-search">
        <Search size={19} aria-hidden="true" />
        <span className="sr-only">설문 응답자 이름</span>
        <input
          type="search"
          value={query}
          placeholder="이름을 입력하세요"
          onChange={(event) => setQuery(event.target.value)}
        />
      </label>

      {status === 'loading' && (
        <p className="survey-result-status" role="status" aria-live="polite">
          설문 결과를 불러오는 중이에요.
        </p>
      )}
      {status === 'unavailable' && (
        <p className="survey-result-status error" role="alert">
          설문 결과를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.
        </p>
      )}
      {status === 'ready' && query.trim() && matches.length === 0 && (
        <p className="survey-result-status" role="status" aria-live="polite">
          이름이 일치하는 설문 결과가 없어요.
        </p>
      )}

      {matches.length > 0 && (
        <div className="survey-result-list" aria-label="설문 결과 검색 목록">
          {matches.map((result) => {
            const prefill = createBusinessCardPrefill(result);
            const date = formatResultDate(result.createdAt);

            return (
              <button
                className="survey-result-row"
                type="button"
                key={result.id}
                onClick={() => {
                  setSelectedResult(result);
                  onSelect(prefill);
                }}
              >
                <span className="survey-result-row-title">
                  <strong>{prefill.name}</strong>
                  <time>{date}</time>
                </span>
                <span>{prefill.email || '이메일 없음'}</span>
                <span>{prefill.school || '소속 없음'}</span>
                <span className="survey-result-dream">최종 꿈: {prefill.job || '미정'}</span>
              </button>
            );
          })}
        </div>
      )}

      {selectedResult && (
        <p className="survey-result-selection" role="status">
          <strong>{selectedResult.participantName?.trim()}</strong>님의 {formatResultDate(selectedResult.createdAt)} 응답을
          명함에 넣었어요.
        </p>
      )}
    </section>
  );
}
