import { useEffect, useRef } from 'react';
import { BookOpen, Building2, Lightbulb, MapPin, Route, Sparkles, Star, X } from 'lucide-react';
import { careerCategories } from '../../../data/careerCategories';
import type { CareerDetail } from '../../../types/career';

type CareerDetailModalProps = {
  detail: CareerDetail;
  onClose: () => void;
};

type DetailListProps = {
  items?: string[];
};

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

function getFocusableElements(container: HTMLElement) {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
    (element) => element.tabIndex >= 0 && element.getAttribute('aria-hidden') !== 'true',
  );
}

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

const getCareerCategory = (careerName: string) =>
  careerCategories.find((category) => category.careers.includes(careerName));

export function CareerDetailModal({ detail, onClose }: CareerDetailModalProps) {
  const modalOverlayRef = useRef<HTMLDivElement>(null);
  const modalCardRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const onCloseRef = useRef(onClose);
  const careerCategory = getCareerCategory(detail.name);
  const CareerIcon = careerCategory?.icon ?? Sparkles;

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    const restoreFocusElement = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const hiddenSiblings: Array<{ element: HTMLElement; ariaHidden: string | null; inert: boolean }> = [];
    const modalOverlay = modalOverlayRef.current;
    const parentElement = modalOverlay?.parentElement;
    const focusFrame = window.requestAnimationFrame(() => {
      closeButtonRef.current?.focus({ preventScroll: true });
    });

    if (modalOverlay && parentElement) {
      for (const child of Array.from(parentElement.children)) {
        if (child === modalOverlay || !(child instanceof HTMLElement)) {
          continue;
        }

        hiddenSiblings.push({
          ariaHidden: child.getAttribute('aria-hidden'),
          element: child,
          inert: child.inert,
        });
        child.inert = true;
        child.setAttribute('aria-hidden', 'true');
      }
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onCloseRef.current();
        return;
      }

      if (event.key !== 'Tab') {
        return;
      }

      const modalCard = modalCardRef.current;
      if (!modalCard) {
        return;
      }

      const focusableElements = getFocusableElements(modalCard);
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (!firstElement || !lastElement) {
        event.preventDefault();
        modalCard.focus({ preventScroll: true });
        return;
      }

      const activeElement = document.activeElement;
      if (event.shiftKey) {
        if (activeElement === firstElement || !modalCard.contains(activeElement)) {
          event.preventDefault();
          lastElement.focus({ preventScroll: true });
        }
        return;
      }

      if (activeElement === lastElement || !modalCard.contains(activeElement)) {
        event.preventDefault();
        firstElement.focus({ preventScroll: true });
      }
    };

    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      window.cancelAnimationFrame(focusFrame);
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
      for (const sibling of hiddenSiblings) {
        sibling.element.inert = sibling.inert;
        if (sibling.ariaHidden === null) {
          sibling.element.removeAttribute('aria-hidden');
        } else {
          sibling.element.setAttribute('aria-hidden', sibling.ariaHidden);
        }
      }
      if (restoreFocusElement?.isConnected) {
        restoreFocusElement.focus({ preventScroll: true });
      }
    };
  }, []);

  return (
    <div className="modal-overlay" onClick={onClose} ref={modalOverlayRef}>
      <div
        className="modal-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="career-detail-title"
        ref={modalCardRef}
        tabIndex={-1}
        onClick={(event) => event.stopPropagation()}
      >
        <button className="modal-close" type="button" onClick={onClose} aria-label="닫기" ref={closeButtonRef}>
          <X size={20} />
        </button>
        <div className="modal-career-symbol" aria-hidden="true">
          <CareerIcon size={34} strokeWidth={2.7} />
        </div>
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
            실력을 키우는 방법
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
