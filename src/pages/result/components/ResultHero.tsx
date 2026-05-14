import { useRef, useState } from 'react';
import { Download, PartyPopper } from 'lucide-react';
import type { CareerProfile } from '../../../types/career';

type ResultHeroProps = {
  profile: CareerProfile;
};

export function ResultHero({ profile }: ResultHeroProps) {
  const [isSaving, setIsSaving] = useState(false);
  const shareCardRef = useRef<HTMLElement>(null);

  const handleSaveImage = async () => {
    if (!shareCardRef.current) {
      return;
    }

    setIsSaving(true);
    try {
      const { default: html2canvas } = await import('html2canvas');
      const canvas = await html2canvas(shareCardRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#58cc02',
      });
      const link = document.createElement('a');
      link.download = `위키드_직업탐험_${profile.topCareer.name}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch {
      alert('이미지 저장에 실패했어요. 다시 시도해 주세요.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className="result-hero career-result-hero" ref={shareCardRef}>
      <div>
        <p className="section-kicker">추천 결과</p>
        <h1>가장 잘 맞는 직업은 {profile.topCareer.name}예요</h1>
        <p className="result-subtitle">{profile.headline}</p>
        <p className="result-description">{profile.summary}</p>
        <div className="badge-row">
          {profile.topCareer.fitTags.map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>
      </div>
      <article className="top-career-card">
        <div className="top-career-icon">
          <PartyPopper size={36} />
        </div>
        <span>대표 추천</span>
        <strong>{profile.topCareer.name}</strong>
      </article>
      <div className="share-row">
        <button className="share-button" type="button" onClick={handleSaveImage} disabled={isSaving}>
          <Download size={18} />
          {isSaving ? '저장 중...' : '결과 이미지 저장'}
        </button>
      </div>
    </section>
  );
}
