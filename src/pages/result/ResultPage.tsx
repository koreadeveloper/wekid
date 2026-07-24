import { useRef, useState } from 'react';
import { careerCatalog } from '../../data/careerCatalog';
import { careerCategories } from '../../data/careerCategories';
import type { CareerResultV2, DreamChoice } from '../../types/career';
import { CareerLibrary } from './components/CareerLibrary';
import { CareerRecommendations } from './components/CareerRecommendations';
import { DreamChoicePanel } from './components/DreamChoicePanel';
import { PdfResultReport } from './components/PdfResultReport';
import { ResultActions } from './components/ResultActions';
import { ResultHero } from './components/ResultHero';

export type ResultSaveStatus =
  | { status: 'idle' | 'saving' }
  | { status: 'saved'; resultId: string }
  | { status: 'skipped'; reason: 'firebase-not-configured' }
  | { status: 'failed'; error: unknown };

export type ResultPageProps = {
  result: CareerResultV2;
  dreamChoice?: DreamChoice;
  resultSaveStatus: ResultSaveStatus;
  userName: string;
  hasCareerDetail: (careerName: string) => boolean;
  onCareerSelect: (careerName: string) => void;
  onConfirmDreamChoice: (choice: DreamChoice) => void;
  onEditLastAnswer: () => void;
  onReset: () => void;
};

const sanitizeFileNamePart = (value: string) => value.trim().replace(/[\\/:*?"<>|]+/g, '').replace(/\s+/g, '_');

export function ResultPage({
  result,
  dreamChoice,
  resultSaveStatus,
  userName,
  hasCareerDetail,
  onCareerSelect,
  onConfirmDreamChoice,
  onEditLastAnswer,
  onReset,
}: ResultPageProps) {
  const pdfReportRef = useRef<HTMLDivElement>(null);
  const [isPdfSaving, setIsPdfSaving] = useState(false);
  const recommendedCareerNames = result.recommendedFieldResults.flatMap((field) =>
    field.recommendedCareers.map((career) => career.name),
  );
  const highlightedCareers = new Set(recommendedCareerNames);

  const handleSavePdf = async () => {
    if (!pdfReportRef.current) {
      return;
    }

    setIsPdfSaving(true);
    try {
      await document.fonts?.ready;
      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([import('html2canvas'), import('jspdf')]);
      const canvas = await html2canvas(pdfReportRef.current, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: true });
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, 210, 297);
      const safeName = sanitizeFileNamePart(userName);
      pdf.save(safeName ? `${safeName}_나의_진로_탐험_결과.pdf` : '나의_진로_탐험_결과.pdf');
    } catch {
      alert('PDF 결과지를 만들지 못했어요. 다시 시도해 주세요.');
    } finally {
      setIsPdfSaving(false);
    }
  };

  return (
    <section className="result-layout">
      <ResultHero result={result} userName={userName} onSavePdf={handleSavePdf} isPdfSaving={isPdfSaving} />
      <ResultSaveNotice resultSaveStatus={resultSaveStatus} dreamChoice={dreamChoice} />
      <CareerRecommendations
        fieldResults={result.recommendedFieldResults}
        hasCareerDetail={hasCareerDetail}
        onCareerSelect={onCareerSelect}
      />
      <DreamChoicePanel
        careers={careerCatalog}
        recommendedCareerNames={recommendedCareerNames}
        onConfirm={onConfirmDreamChoice}
        isSaving={resultSaveStatus.status === 'saving'}
        savedChoice={resultSaveStatus.status === 'saved' ? dreamChoice : undefined}
      />
      <CareerLibrary
        categories={careerCategories}
        highlightedCareers={highlightedCareers}
        hasCareerDetail={hasCareerDetail}
        onCareerSelect={onCareerSelect}
      />
      <ResultActions onEditLastAnswer={onEditLastAnswer} onReset={onReset} />
      <PdfResultReport ref={pdfReportRef} result={result} dreamChoice={dreamChoice} userName={userName} />
    </section>
  );
}

function ResultSaveNotice({ resultSaveStatus, dreamChoice }: Pick<ResultPageProps, 'resultSaveStatus' | 'dreamChoice'>) {
  if (resultSaveStatus.status === 'idle') {
    return <p className="result-save-notice muted">모든 문항을 마치면 답변이 자동으로 저장돼요.</p>;
  }

  if (resultSaveStatus.status === 'saving') {
    return <p className="result-save-notice">결과를 안전하게 저장하는 중이에요.</p>;
  }

  if (resultSaveStatus.status === 'saved') {
    return dreamChoice?.kind === 'undecided'
      ? <p className="result-save-notice success">모든 답변을 자동으로 저장했어요.</p>
      : <p className="result-save-notice success">내가 고른 꿈과 모든 답변을 저장했어요.</p>;
  }

  if (resultSaveStatus.status === 'skipped') {
    return <p className="result-save-notice muted">Firebase 연결 전이라 이 결과는 이 기기에서만 확인돼요.</p>;
  }

  return <p className="result-save-notice warning">결과 저장에 실패했어요. 다시 저장해 주세요.</p>;
}
