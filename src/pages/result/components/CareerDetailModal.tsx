import { useEffect, useRef } from 'react';
import { BookOpen, Building2, Lightbulb, MapPin, Route, Sparkles, Star, X } from 'lucide-react';
import type { CareerDetail } from '../../../types/career';

type CareerDetailModalProps = {
  detail: CareerDetail;
  onClose: () => void;
};

type DetailListProps = {
  items?: string[];
};

function DetailList({ items }: DetailListProps) {
  if (!items?.length) {
    return null;
  }

  return (
    <ul className="modal-task-list">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

export function CareerDetailModal({ detail, onClose }: CareerDetailModalProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleKeyDown);
    closeButtonRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="career-detail-title"
        onClick={(event) => event.stopPropagation()}
      >
        <button className="modal-close" type="button" onClick={onClose} aria-label="닫기" ref={closeButtonRef}>
          <X size={20} />
        </button>
        <div className="modal-emoji">{detail.emoji}</div>
        <p className="modal-tagline">{detail.tagline}</p>
        <h2 className="modal-title" id="career-detail-title">{detail.name}</h2>
        <p className="modal-desc">{detail.description}</p>
        {detail.fitReason && (
          <div className="modal-fit-note">
            <Sparkles size={16} />
            <p>{detail.fitReason}</p>
          </div>
        )}
        <div className="modal-section">
          <div className="modal-section-title">
            <Star size={15} />
            하는 일
          </div>
          <DetailList items={detail.dailyTasks} />
        </div>
        <div className="modal-section">
          <div className="modal-section-title">
            <Building2 size={15} />
            일하는 곳
          </div>
          <div className="modal-skill-chips place-chips">
            {detail.workPlaces?.map((place) => (
              <span key={place}>{place}</span>
            ))}
          </div>
        </div>
        <div className="modal-section">
          <div className="modal-section-title">
            <Lightbulb size={15} />
            필요한 능력
          </div>
          <div className="modal-skill-chips">
            {detail.skills.map((skill) => (
              <span key={skill}>{skill}</span>
            ))}
          </div>
        </div>
        <div className="modal-section">
          <div className="modal-section-title">
            <BookOpen size={15} />
            학교에서 해볼 것
          </div>
          <DetailList items={detail.schoolActivities} />
        </div>
        <div className="modal-section">
          <div className="modal-section-title">
            <Route size={15} />
            키워가는 방법
          </div>
          <DetailList items={detail.growthSteps} />
        </div>
        <div className="modal-funfact">
          <MapPin size={14} />
          <span>{detail.funFact}</span>
        </div>
      </div>
    </div>
  );
}
