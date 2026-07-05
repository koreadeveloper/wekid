import { useEffect, useRef, useState } from 'react';
import { CreditCard, Download, FileText, PartyPopper } from 'lucide-react';
import { getReadableKoreanLines } from '../../../lib/readableKoreanLines';
import type { CareerProfile } from '../../../types/career';

type ResultHeroProps = {
  profile: CareerProfile;
  focusRequest: number;
  userName: string;
  hasCareerDetail: (careerName: string) => boolean;
  onCareerSelect: (careerName: string) => void;
  onCreateBusinessCard: (careerName: string) => void;
  onSavePdf: () => void;
  isPdfSaving: boolean;
  exportErrorMessage: string | null;
  onClearExportError: () => void;
  onExportError: (message: string) => void;
};

const waitForPaint = () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

export function ResultHero({
  profile,
  focusRequest,
  userName,
  hasCareerDetail,
  onCareerSelect,
  onCreateBusinessCard,
  onSavePdf,
  isPdfSaving,
  exportErrorMessage,
  onClearExportError,
  onExportError,
}: ResultHeroProps) {
  const [isSavingImage, setIsSavingImage] = useState(false);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const shareCardRef = useRef<HTMLElement>(null);
  const hasTopCareerDetail = hasCareerDetail(profile.topCareer.name);

  useEffect(() => {
    if (focusRequest <= 0) {
      return;
    }

    const focusFrame = window.requestAnimationFrame(() => {
      titleRef.current?.focus({ preventScroll: true });
    });

    return () => window.cancelAnimationFrame(focusFrame);
  }, [focusRequest]);

  const handleSaveImage = async () => {
    const shareCard = shareCardRef.current;
    if (!shareCard) {
      return;
    }

    setIsSavingImage(true);
    onClearExportError();
    shareCard.classList.add('is-exporting');

    try {
      await waitForPaint();
      const { default: html2canvas } = await import('html2canvas');
      const canvas = await html2canvas(shareCard, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#58cc02',
      });
      const link = document.createElement('a');
      link.download = `위키드_직업탐험_${profile.topCareer.name}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch {
      onExportError('결과 이미지를 저장하지 못했어요. 다시 시도해 주세요.');
    } finally {
      shareCard.classList.remove('is-exporting');
      setIsSavingImage(false);
    }
  };

  return (
    <section className="result-hero career-result-hero" ref={shareCardRef}>
      <div>
        <p className="section-kicker">{userName ? `${userName}의 탐험 결과` : '추천 결과'}</p>
        <h1 className="result-title" ref={titleRef} tabIndex={-1}>
          <span className="result-title-prefix">가장 잘 맞는 직업은</span>
          <span className="result-title-career">{profile.topCareer.name}입니다</span>
        </h1>
        <p className="result-subtitle">{profile.headline}</p>
        <p className="result-description">
          {getReadableKoreanLines(profile.summary).map((line) => (
            <span key={line}>{line}</span>
          ))}
        </p>
        <div className="badge-row">
          {profile.topCareer.fitTags.map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>
      </div>
      <button
        className={`top-career-card ${hasTopCareerDetail ? 'clickable' : ''}`}
        type="button"
        onClick={() => hasTopCareerDetail && onCareerSelect(profile.topCareer.name)}
        aria-label={hasTopCareerDetail ? `대표 추천 ${profile.topCareer.name} 자세히 보기` : undefined}
        disabled={!hasTopCareerDetail}
      >
        <div className="top-career-icon">
          <PartyPopper size={36} />
        </div>
        <span>대표 추천</span>
        <strong>{profile.topCareer.name}</strong>
        {hasTopCareerDetail && <small className="career-tap-hint">눌러서 자세히 보기</small>}
      </button>
      <div className="share-row">
        <button
          className="share-button business-card-share-button"
          type="button"
          onClick={() => {
            onClearExportError();
            onCreateBusinessCard(profile.topCareer.name);
          }}
          disabled={isSavingImage || isPdfSaving}
        >
          <CreditCard size={18} />
          꿈 명함 만들기
        </button>
        <button
          className="share-button"
          type="button"
          onClick={handleSaveImage}
          disabled={isSavingImage || isPdfSaving}
        >
          <Download size={18} />
          {isSavingImage ? '이미지 준비 중' : '결과 이미지 저장'}
        </button>
        <button
          className="share-button pdf-share-button"
          type="button"
          onClick={onSavePdf}
          disabled={isPdfSaving || isSavingImage}
        >
          <FileText size={18} />
          {isPdfSaving ? 'PDF 만드는 중' : 'PDF 결과지 저장'}
        </button>
      </div>
      {exportErrorMessage && (
        <p className="result-export-status" role="status" aria-live="polite" aria-atomic="true">
          {exportErrorMessage}
        </p>
      )}
    </section>
  );
}
