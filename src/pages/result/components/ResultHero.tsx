import { useRef, useState } from 'react';
import { Download, FileText } from 'lucide-react';
import type { CareerResultV2 } from '../../../types/career';

type ResultHeroProps = {
  result: CareerResultV2;
  userName: string;
  onSavePdf: () => void;
  isPdfSaving: boolean;
};

const waitForPaint = () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

export function ResultHero({ result, userName, onSavePdf, isPdfSaving }: ResultHeroProps) {
  const [isSavingImage, setIsSavingImage] = useState(false);
  const shareCardRef = useRef<HTMLElement>(null);

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
      const canvas = await html2canvas(shareCard, { scale: 2, useCORS: true, backgroundColor: '#58cc02' });
      const link = document.createElement('a');
      link.download = '나의_진로_탐험_결과.png';
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
        <p className="section-kicker">{userName ? `${userName}의 진로 탐험 결과` : '나의 진로 탐험 결과'}</p>
        <h1 className="result-title">{result.recommendedFieldResults.length ? '세 가지 방향을 탐험했어요' : '나만의 진로를 찾아볼 시간이에요'}</h1>
        <p className="result-subtitle">{result.recommendedFieldResults.length ? '한 가지 직업으로 정하지 않아도 괜찮아요.' : '마음에 드는 직업을 고르고, 다음에 다시 탐험해도 괜찮아요.'}</p>
        <p className="result-description">{result.summary}</p>
        <div className="field-hero-list">
          {result.recommendedFieldResults.map((field) => (
            <div key={field.fieldId}>
              <strong>{field.label}</strong>
              <span>{Math.round(field.score * 100)}% 탐험 일치</span>
            </div>
          ))}
        </div>
      </div>
      <div className="share-row">
        <button className="share-button" type="button" onClick={handleSaveImage} disabled={isSavingImage || isPdfSaving}>
          <Download size={18} />
          {isSavingImage ? '이미지 준비 중' : '결과 이미지 저장'}
        </button>
        <button className="share-button pdf-share-button" type="button" onClick={onSavePdf} disabled={isPdfSaving || isSavingImage}>
          <FileText size={18} />
          {isPdfSaving ? 'PDF 만드는 중' : 'PDF 결과지 저장'}
        </button>
      </div>
    </section>
  );
}
