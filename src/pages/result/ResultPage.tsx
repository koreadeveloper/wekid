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
  onRetryResultSave: () => void;
  onReset: () => void;
  focusRequest: number;
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
  onRetryResultSave,
  onReset,
  focusRequest,
}: ResultPageProps) {
  const pdfReportRef = useRef<HTMLDivElement>(null);
  const [isPdfSaving, setIsPdfSaving] = useState(false);
  const [exportErrorMessage, setExportErrorMessage] = useState('');
  const recommendedCareerNames = result.recommendedFieldResults.flatMap((field) =>
    field.recommendedCareers.map((career) => career.name),
  );
  const highlightedCareers = new Set(recommendedCareerNames);
  const resultSaveErrorMessage = resultSaveStatus.status === 'failed'
    ? '결과 저장에 실패했어요. 다시 시도해 주세요.'
    : '';

  const handleSavePdf = async () => {
    if (!pdfReportRef.current) {
      return;
    }

    setIsPdfSaving(true);
    setExportErrorMessage('');
    try {
      await document.fonts?.ready;
      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([import('html2canvas'), import('jspdf')]);
      const canvas = await html2canvas(pdfReportRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        windowWidth: pdfReportRef.current.scrollWidth,
      });
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: true });
      const imageData = canvas.toDataURL('image/png');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const naturalImageHeight = (canvas.height * pageWidth) / canvas.width;
      const pageOverflowTolerance = 8;
      const imageHeight = naturalImageHeight - pageHeight <= pageOverflowTolerance ? pageHeight : naturalImageHeight;
      let imageOffset = 0;
      let remainingHeight = imageHeight;

      pdf.addImage(imageData, 'PNG', 0, imageOffset, pageWidth, imageHeight);
      while (remainingHeight > pageOverflowTolerance) {
        remainingHeight -= pageHeight;

        if (remainingHeight <= pageOverflowTolerance) {
          break;
        }

        imageOffset -= pageHeight;
        pdf.addPage();
        pdf.addImage(imageData, 'PNG', 0, imageOffset, pageWidth, imageHeight);
      }
      const safeName = sanitizeFileNamePart(userName);
      pdf.save(safeName ? `${safeName}_나의_진로_탐험_결과.pdf` : '나의_진로_탐험_결과.pdf');
    } catch {
      setExportErrorMessage('PDF 결과지를 만들지 못했어요. 다시 시도해 주세요.');
    } finally {
      setIsPdfSaving(false);
    }
  };

  return (
    <section className="result-layout">
      <ResultHero
        exportErrorMessage={exportErrorMessage}
        focusRequest={focusRequest}
        hasCareerDetail={hasCareerDetail}
        result={result}
        userName={userName}
        onCareerSelect={onCareerSelect}
        onExportError={setExportErrorMessage}
        onSavePdf={handleSavePdf}
        isPdfSaving={isPdfSaving}
      />
      <ResultActions onEditLastAnswer={onEditLastAnswer} onReset={onReset} />
      {resultSaveErrorMessage && (
        <div className="result-save-notice warning" role="status" aria-live="polite">
          <p>{resultSaveErrorMessage}</p>
          <button type="button" onClick={onRetryResultSave}>
            다시 시도
          </button>
        </div>
      )}
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
      <PdfResultReport ref={pdfReportRef} result={result} dreamChoice={dreamChoice} userName={userName} />
    </section>
  );
}
