import { useEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { RotateCcw, X } from 'lucide-react';

type ResetConfirmButtonProps = {
  readonly ariaLabel?: string;
  readonly children: ReactNode;
  readonly className: string;
  readonly onConfirm: () => void;
};

const FOCUSABLE_SELECTOR = [
  'button:not([disabled])',
  'a[href]',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

const getFocusableElements = (container: HTMLElement) =>
  Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
    (element) => element.tabIndex >= 0 && element.getAttribute('aria-hidden') !== 'true',
  );

export function ResetConfirmButton({ ariaLabel, children, className, onConfirm }: ResetConfirmButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [portalElement, setPortalElement] = useState<HTMLDivElement | null>(null);
  const triggerButtonRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);

  const closeDialog = () => setIsOpen(false);

  const confirmReset = () => {
    setIsOpen(false);
    onConfirm();
  };

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const nextPortalElement = document.createElement('div');
    nextPortalElement.className = 'reset-confirm-portal';
    document.body.append(nextPortalElement);
    setPortalElement(nextPortalElement);

    return () => {
      nextPortalElement.remove();
      setPortalElement(null);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !portalElement) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    const hiddenSiblings: Array<{ element: HTMLElement; ariaHidden: string | null; inert: boolean }> = [];
    const focusFrame = window.requestAnimationFrame(() => {
      cancelButtonRef.current?.focus({ preventScroll: true });
    });

    for (const child of Array.from(document.body.children)) {
      if (child === portalElement || !(child instanceof HTMLElement)) {
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

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeDialog();
        return;
      }

      if (event.key !== 'Tab') {
        return;
      }

      const dialog = dialogRef.current;
      if (!dialog) {
        return;
      }

      const focusableElements = getFocusableElements(dialog);
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (!firstElement || !lastElement) {
        event.preventDefault();
        dialog.focus({ preventScroll: true });
        return;
      }

      const activeElement = document.activeElement;
      if (event.shiftKey) {
        if (activeElement === firstElement || !dialog.contains(activeElement)) {
          event.preventDefault();
          lastElement.focus({ preventScroll: true });
        }
        return;
      }

      if (activeElement === lastElement || !dialog.contains(activeElement)) {
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
      if (triggerButtonRef.current?.isConnected) {
        triggerButtonRef.current.focus({ preventScroll: true });
      }
    };
  }, [isOpen, portalElement]);

  return (
    <>
      <button
        className={className}
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label={ariaLabel}
        ref={triggerButtonRef}
      >
        {children}
      </button>
      {isOpen && portalElement && createPortal(
        <div className="reset-confirm-overlay" onClick={closeDialog}>
          <div
            className="reset-confirm-card"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="reset-confirm-title"
            aria-describedby="reset-confirm-desc"
            onClick={(event) => event.stopPropagation()}
            ref={dialogRef}
            tabIndex={-1}
          >
            <button className="reset-confirm-close" type="button" onClick={closeDialog} aria-label="닫기">
              <X size={20} />
            </button>
            <div className="reset-confirm-icon" aria-hidden="true">
              <RotateCcw size={26} />
            </div>
            <p className="section-kicker">처음부터 다시</p>
            <h2 id="reset-confirm-title">처음부터 다시 시작할까요?</h2>
            <p id="reset-confirm-desc">지금까지 선택한 답변과 결과 화면이 지워져요.</p>
            <div className="reset-confirm-actions">
              <button className="ghost-button" type="button" onClick={closeDialog} ref={cancelButtonRef}>
                계속하기
              </button>
              <button className="primary-button reset-confirm-primary" type="button" onClick={confirmReset}>
                처음부터 다시
              </button>
            </div>
          </div>
        </div>,
        portalElement,
      )}
    </>
  );
}
