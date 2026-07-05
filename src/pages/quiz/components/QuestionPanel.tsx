import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Check } from 'lucide-react';
import type { ChoiceKey, FocusHandoffOptions, Question } from '../../../types/career';

type QuestionPanelProps = {
  answeredCount: number;
  currentAnswer?: ChoiceKey;
  currentIndex: number;
  currentQuestion: Question;
  focusRequest: number;
  isAdvancing: boolean;
  questions: Question[];
  onChooseAnswer: (choice: ChoiceKey, options?: FocusHandoffOptions) => void;
  onPrevious: () => void;
};

const RADIO_NAVIGATION_KEYS = new Set(['ArrowDown', 'ArrowRight', 'ArrowUp', 'ArrowLeft', 'Home', 'End']);
const RADIO_COMMIT_KEYS = new Set(['Enter', ' ']);

const getNextOptionIndex = (key: string, currentIndex: number, optionCount: number) => {
  switch (key) {
    case 'ArrowDown':
    case 'ArrowRight':
      return (currentIndex + 1) % optionCount;
    case 'ArrowUp':
    case 'ArrowLeft':
      return (currentIndex - 1 + optionCount) % optionCount;
    case 'Home':
      return 0;
    case 'End':
      return optionCount - 1;
    default:
      return currentIndex;
  }
};

export function QuestionPanel({
  answeredCount,
  currentAnswer,
  currentIndex,
  currentQuestion,
  focusRequest,
  isAdvancing,
  questions,
  onChooseAnswer,
  onPrevious,
}: QuestionPanelProps) {
  const questionHeadingId = `question-${currentQuestion.id}-heading`;
  const selectedOptionIndex = currentQuestion.options.findIndex((option) => option.choice === currentAnswer);
  const defaultOptionIndex = selectedOptionIndex === -1 ? 0 : selectedOptionIndex;
  const optionCount = currentQuestion.options.length;
  const optionGridRef = useRef<HTMLDivElement>(null);
  const shouldFocusNextQuestionRef = useRef(false);
  const [activeOptionIndex, setActiveOptionIndex] = useState(defaultOptionIndex);

  useEffect(() => {
    setActiveOptionIndex(defaultOptionIndex);
  }, [currentQuestion.id, defaultOptionIndex]);

  useEffect(() => {
    if (focusRequest <= 0 || isAdvancing) {
      return;
    }

    const focusFrame = window.requestAnimationFrame(() => {
      const activeOption = optionGridRef.current?.querySelector<HTMLButtonElement>('.option-card[tabindex="0"]:not(:disabled)');
      activeOption?.focus({ preventScroll: true });
    });

    return () => window.cancelAnimationFrame(focusFrame);
  }, [focusRequest, isAdvancing]);

  useEffect(() => {
    if (!shouldFocusNextQuestionRef.current || isAdvancing) {
      return;
    }

    const focusFrame = window.requestAnimationFrame(() => {
      const nextOption = optionGridRef.current?.querySelector<HTMLButtonElement>('.option-card[tabindex="0"]:not(:disabled)');
      nextOption?.focus({ preventScroll: true });
      shouldFocusNextQuestionRef.current = false;
    });

    return () => window.cancelAnimationFrame(focusFrame);
  }, [currentQuestion.id, isAdvancing]);

  return (
    <section className="question-panel" aria-live="polite">
      <div className="question-meta">
        <span>{String(currentIndex + 1).padStart(2, '0')}</span>
        <p>{currentQuestion.eyebrow}</p>
      </div>

      <h2 id={questionHeadingId}>{currentQuestion.text}</h2>

      <div className="options-grid" role="group" aria-labelledby={questionHeadingId} ref={optionGridRef}>
        {currentQuestion.options.map((option, optionIndex) => {
          const selected = currentAnswer === option.choice;
          return (
            <button
              className={`option-card ${selected ? 'selected' : ''}`}
              key={option.choice}
              type="button"
              onClick={() => {
                setActiveOptionIndex(optionIndex);
                onChooseAnswer(option.choice);
              }}
              onKeyDown={(event) => {
                if (RADIO_COMMIT_KEYS.has(event.key)) {
                  event.preventDefault();
                  if (!isAdvancing) {
                    setActiveOptionIndex(optionIndex);
                    shouldFocusNextQuestionRef.current = true;
                    onChooseAnswer(option.choice, { focusNextSurface: true });
                  }
                  return;
                }

                if (!RADIO_NAVIGATION_KEYS.has(event.key)) {
                  return;
                }

                event.preventDefault();
                if (isAdvancing) {
                  return;
                }

                const nextIndex = getNextOptionIndex(event.key, optionIndex, optionCount);
                if (nextIndex === optionIndex) {
                  return;
                }

                setActiveOptionIndex(nextIndex);
                const optionButtons = event.currentTarget
                  .closest('.options-grid')
                  ?.querySelectorAll<HTMLButtonElement>('.option-card');
                optionButtons?.[nextIndex]?.focus({ preventScroll: true });
              }}
              aria-pressed={selected}
              tabIndex={optionIndex === activeOptionIndex ? 0 : -1}
              disabled={isAdvancing}
            >
              <span className="option-check">
                {selected ? <Check size={18} /> : <span className="empty-dot" aria-hidden="true" />}
              </span>
              <strong>{option.label}</strong>
              <small>{option.helper}</small>
            </button>
          );
        })}
      </div>

      <div className="question-footer">
        <button className="ghost-button" type="button" onClick={onPrevious} disabled={currentIndex === 0 || isAdvancing}>
          <ArrowLeft size={18} />
          이전
        </button>
        <span className="question-footer-count" aria-label={`${currentIndex + 1}번 문항, 전체 ${questions.length}문항`}>
          {currentIndex + 1} / {questions.length}
        </span>
        <div className="question-dots" aria-hidden="true">
          {questions.map((question, index) => (
            <span
              className={`${index < answeredCount ? 'done' : ''} ${index === currentIndex ? 'active' : ''}`}
              key={question.id}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
