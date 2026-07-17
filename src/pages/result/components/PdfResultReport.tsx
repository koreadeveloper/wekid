import { forwardRef } from 'react';
import type { CareerResultV2, DreamChoice } from '../../../types/career';
import { getDreamChoiceText } from './DreamChoicePanel';

type PdfResultReportProps = {
  result: CareerResultV2;
  dreamChoice?: DreamChoice;
  userName: string;
};

export const PdfResultReport = forwardRef<HTMLDivElement, PdfResultReportProps>(function PdfResultReport(
  { result, dreamChoice, userName },
  ref,
) {
  const nameLabel = userName ? `${userName}의` : '나의';
  const reportDate = new Intl.DateTimeFormat('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date());

  return (
    <div className="pdf-report-capture" ref={ref} aria-hidden="true">
      <article className="pdf-report">
        <header className="pdf-report-header">
          <div>
            <p>위키드 직업 탐험</p>
            <h2>{nameLabel} 진로 탐험 결과</h2>
          </div>
          <span>{reportDate}</span>
        </header>
        <section className="pdf-main-card">
          <p>{result.recommendedFieldResults.length ? '내가 탐험한 세 가지 방향' : '내가 직접 고른 진로 탐험'}</p>
          {result.recommendedFieldResults.map((field) => <h3 key={field.fieldId}>{field.label}</h3>)}
          <span>{result.summary}</span>
        </section>
        <section className="pdf-box pdf-dream-choice">
          <h4>내가 고른 꿈</h4>
          <strong>{getDreamChoiceText(dreamChoice)}</strong>
        </section>
        <section className="pdf-box">
          <h4>분야별 추천 직업</h4>
          <div className="pdf-career-grid">
            {result.recommendedFieldResults.flatMap((field) => field.recommendedCareers.map((career) => (
              <div className="pdf-career-card" key={`${field.fieldId}-${career.name}`}>
                <strong>{career.name}</strong>
                <p>{field.label}</p>
              </div>
            )))}
            {result.recommendedFieldResults.length === 0 && <p>아직 고르는 중이에요.</p>}
          </div>
        </section>
      </article>
    </div>
  );
});
