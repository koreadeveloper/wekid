import { useRef, useState } from 'react';
import { Download, FileText, PartyPopper } from 'lucide-react';
import type { CareerProfile } from '../../../types/career';

type ResultHeroProps = {
  profile: CareerProfile;
  userName: string;
  hasCareerDetail: (careerName: string) => boolean;
  onCareerSelect: (careerName: string) => void;
  onSavePdf: () => void;
  isPdfSaving: boolean;
};

const waitForPaint = () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

const getSentenceLines = (text: string) => text.match(/[^.!?]+[.!?]+|[^.!?]+$/g)?.map((line) => line.trim()) ?? [text];

export function ResultHero({
  profile,
  userName,
  hasCareerDetail,
  onCareerSelect,
  onSavePdf,
  isPdfSaving,
}: ResultHeroProps) {
  const [isSavingImage, setIsSavingImage] = useState(false);
  const shareCardRef = useRef<HTMLElement>(null);
  const hasTopCareerDetail = hasCareerDetail(profile.topCareer.name);

  const handleSaveImage = async () => {
    const shareCard = shareCardRef.current;
    if (!shareCard) {
      return;
    }

    setIsSavingImage(true);
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
      alert('결과 이미지를 저장하지 못했어요. 다시 시도해 주세요.');
    } finally {
      shareCard.classList.remove('is-exporting');
      setIsSavingImage(false);
    }
  };

  return (
    <section className="result-hero career-result-hero" ref={shareCardRef}>
      <div>
        <p className="section-kicker">{userName ? `${userName}의 탐험 결과` : '추천 결과'}</p>
        <h1 className="result-title">
          <span className="result-title-prefix">가장 잘 맞는 직업은</span>
          <span className="result-title-career">{profile.topCareer.name}입니다</span>
        </h1>
        <p className="result-subtitle">{profile.headline}</p>
        <p className="result-description">
          {getSentenceLines(profile.summary).map((line) => (
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
        disabled={!hasTopCareerDetail}
      >
        <div className="top-career-icon">
          <PartyPopper size={36} />
        </div>
        <span>대표 추천</span>
        <strong>{profile.topCareer.name}</strong>
        {hasTopCareerDetail && <small className="career-tap-hint">탭해서 자세히 보기</small>}
      </button>
      <div className="share-row">
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
    </section>
  );
}
