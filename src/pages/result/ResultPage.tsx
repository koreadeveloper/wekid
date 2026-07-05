import { useRef, useState } from 'react';
import { axisLabels } from '../../data/axisLabels';
import { careerCategories } from '../../data/careerCategories';
import type { CareerMatches, CareerProfile, ScoreMap } from '../../types/career';
import { CareerExplorer } from './components/CareerExplorer';
import { CareerLibrary } from './components/CareerLibrary';
import { CareerRecommendations } from './components/CareerRecommendations';
import { InsightPanels } from './components/InsightPanels';
import { PdfResultReport } from './components/PdfResultReport';
import { ResultActions } from './components/ResultActions';
import { ResultHero } from './components/ResultHero';
import { WhyPanel } from './components/WhyPanel';

export type ResultPageProps = {
  careerMatches: CareerMatches;
  focusRequest: number;
  highlightedCareers: Set<string>;
  profile: CareerProfile;
  resultSaveErrorMessage: string | null;
  scores: ScoreMap;
  userName: string;
  hasCareerDetail: (careerName: string) => boolean;
  onCareerSelect: (careerName: string) => void;
  onCreateBusinessCard: (careerName: string) => void;
  onEditLastAnswer: () => void;
  onReset: () => void;
  onRetryResultSave: () => void;
};

const sanitizeFileNamePart = (value: string) => value.trim().replace(/[\\/:*?"<>|]+/g, '').replace(/\s+/g, '_');

const getPdfFileName = (userName: string, careerName: string) => {
  const safeName = sanitizeFileNamePart(userName);
  const safeCareerName = sanitizeFileNamePart(careerName);
  const baseName = safeName
    ? `${safeName}_위키드_직업탐험_${safeCareerName}_결과지`
    : `위키드_직업탐험_${safeCareerName}_결과지`;

  return `${baseName}.pdf`;
};

export function ResultPage({
  careerMatches,
  focusRequest,
  highlightedCareers,
  profile,
  resultSaveErrorMessage,
  scores,
  userName,
  hasCareerDetail,
  onCareerSelect,
  onCreateBusinessCard,
  onEditLastAnswer,
  onReset,
  onRetryResultSave,
}: ResultPageProps) {
  const pdfReportRef = useRef<HTMLDivElement>(null);
  const [isPdfSaving, setIsPdfSaving] = useState(false);
  const [exportErrorMessage, setExportErrorMessage] = useState<string | null>(null);

  const handleSavePdf = async () => {
    if (!pdfReportRef.current) {
      return;
    }

    setExportErrorMessage(null);
    setIsPdfSaving(true);
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
      const imageHeight =
        naturalImageHeight > pageHeight && naturalImageHeight - pageHeight <= pageOverflowTolerance
          ? pageHeight
          : naturalImageHeight;
      let remainingHeight = imageHeight;
      let position = 0;

      pdf.addImage(imageData, 'PNG', 0, position, pageWidth, imageHeight);
      remainingHeight -= pageHeight;

      while (remainingHeight > pageOverflowTolerance) {
        position -= pageHeight;
        pdf.addPage();
        pdf.addImage(imageData, 'PNG', 0, position, pageWidth, imageHeight);
        remainingHeight -= pageHeight;
      }

      pdf.save(getPdfFileName(userName, profile.topCareer.name));
    } catch {
      setExportErrorMessage('PDF 결과지를 만들지 못했어요. 다시 시도해 주세요.');
    } finally {
      setIsPdfSaving(false);
    }
  };

  return (
    <section className="result-layout">
      <ResultHero
        profile={profile}
        focusRequest={focusRequest}
        userName={userName}
        hasCareerDetail={hasCareerDetail}
        onCareerSelect={onCareerSelect}
        onCreateBusinessCard={onCreateBusinessCard}
        onSavePdf={handleSavePdf}
        isPdfSaving={isPdfSaving}
        exportErrorMessage={exportErrorMessage}
        onClearExportError={() => setExportErrorMessage(null)}
        onExportError={setExportErrorMessage}
      />
      {resultSaveErrorMessage && (
        <div className="result-save-notice warning" role="status" aria-live="polite" aria-atomic="true">
          <p>{resultSaveErrorMessage}</p>
          <button type="button" onClick={onRetryResultSave}>
            다시 시도
          </button>
        </div>
      )}
      <ResultActions onEditLastAnswer={onEditLastAnswer} onReset={onReset} />
      <WhyPanel profile={profile} />
      <InsightPanels axisLabels={axisLabels} profile={profile} scores={scores} />
      <CareerRecommendations
        careers={careerMatches.primary}
        hasCareerDetail={hasCareerDetail}
        onCareerSelect={onCareerSelect}
      />
      <CareerExplorer
        careers={careerMatches.explore}
        hasCareerDetail={hasCareerDetail}
        onCareerSelect={onCareerSelect}
      />
      <CareerLibrary
        categories={careerCategories}
        highlightedCareers={highlightedCareers}
        hasCareerDetail={hasCareerDetail}
        onCareerSelect={onCareerSelect}
      />
      <PdfResultReport
        ref={pdfReportRef}
        careerMatches={careerMatches}
        profile={profile}
        scores={scores}
        userName={userName}
      />
    </section>
  );
}
