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

type ResultPageProps = {
  careerMatches: CareerMatches;
  highlightedCareers: Set<string>;
  profile: CareerProfile;
  scores: ScoreMap;
  userName: string;
  hasCareerDetail: (careerName: string) => boolean;
  onCareerSelect: (careerName: string) => void;
  onEditLastAnswer: () => void;
  onReset: () => void;
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
  highlightedCareers,
  profile,
  scores,
  userName,
  hasCareerDetail,
  onCareerSelect,
  onEditLastAnswer,
  onReset,
}: ResultPageProps) {
  const pdfReportRef = useRef<HTMLDivElement>(null);
  const [isPdfSaving, setIsPdfSaving] = useState(false);

  const handleSavePdf = async () => {
    if (!pdfReportRef.current) {
      return;
    }

    setIsPdfSaving(true);
    try {
      await document.fonts?.ready;
      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([import('html2canvas'), import('jspdf')]);
      const canvas = await html2canvas(pdfReportRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
      });
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: true });
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, 210, 297);
      pdf.save(getPdfFileName(userName, profile.topCareer.name));
    } catch {
      alert('PDF 결과지를 만들지 못했어요. 다시 시도해 주세요.');
    } finally {
      setIsPdfSaving(false);
    }
  };

  return (
    <section className="result-layout">
      <ResultHero
        profile={profile}
        userName={userName}
        hasCareerDetail={hasCareerDetail}
        onCareerSelect={onCareerSelect}
        onSavePdf={handleSavePdf}
        isPdfSaving={isPdfSaving}
      />
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
      <ResultActions onEditLastAnswer={onEditLastAnswer} onReset={onReset} />
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
