import { Lightbulb, MapPin, Star, X } from 'lucide-react';
import type { CareerDetail } from '../../../types/career';

type CareerDetailModalProps = {
  detail: CareerDetail;
  onClose: () => void;
};

export function CareerDetailModal({ detail, onClose }: CareerDetailModalProps) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(event) => event.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="닫기">
          <X size={20} />
        </button>
        <div className="modal-emoji">{detail.emoji}</div>
        <p className="modal-tagline">{detail.tagline}</p>
        <h2 className="modal-title">{detail.name}</h2>
        <p className="modal-desc">{detail.description}</p>
        <div className="modal-section">
          <div className="modal-section-title">
            <Star size={15} />
            하는 일
          </div>
          <ul className="modal-task-list">
            {detail.dailyTasks.map((task) => (
              <li key={task}>{task}</li>
            ))}
          </ul>
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
        <div className="modal-funfact">
          <MapPin size={14} />
          <span>{detail.funFact}</span>
        </div>
      </div>
    </div>
  );
}
