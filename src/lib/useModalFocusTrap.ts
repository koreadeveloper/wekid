import { useEffect, useRef, type RefObject } from 'react';

type ModalFocusTrapOptions = {
  readonly dialogRef: RefObject<HTMLElement | null>;
  readonly initialFocusRef: RefObject<HTMLElement | null>;
  readonly onClose: () => void;
  readonly overlayRef: RefObject<HTMLElement | null>;
};

type HiddenSiblingState = {
  readonly ariaHidden: string | null;
  readonly element: HTMLElement;
  readonly inert: boolean;
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

export function useModalFocusTrap({ dialogRef, initialFocusRef, onClose, overlayRef }: ModalFocusTrapOptions) {
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    const restoreFocusElement = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const hiddenSiblings: HiddenSiblingState[] = [];
    const overlayElement = overlayRef.current;
    const focusFrame = window.requestAnimationFrame(() => {
      const focusTarget = initialFocusRef.current ?? dialogRef.current;
      focusTarget?.focus({ preventScroll: true });
    });

    if (overlayElement) {
      let currentElement: HTMLElement | null = overlayElement;

      while (currentElement.parentElement) {
        for (const child of Array.from(currentElement.parentElement.children)) {
          if (child === currentElement || !(child instanceof HTMLElement)) {
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

        currentElement = currentElement.parentElement;
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

      const dialogElement = dialogRef.current;
      if (!dialogElement) {
        return;
      }

      const focusableElements = getFocusableElements(dialogElement);
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (!firstElement || !lastElement) {
        event.preventDefault();
        dialogElement.focus({ preventScroll: true });
        return;
      }

      const activeElement = document.activeElement;

      if (event.shiftKey) {
        if (activeElement === firstElement || !dialogElement.contains(activeElement)) {
          event.preventDefault();
          lastElement.focus({ preventScroll: true });
        }
        return;
      }

      if (activeElement === lastElement || !dialogElement.contains(activeElement)) {
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
  }, [dialogRef, initialFocusRef, overlayRef]);
}
