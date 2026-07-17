import { ArrowLeft, Check } from 'lucide-react';
import type { CareerAnswer, CareerQuestionV2 } from '../../../types/career';

type QuestionPanelProps = {
  answeredCount: number;
  currentAnswer?: CareerAnswer;
  currentIndex: number;
  currentQuestion: CareerQuestionV2;
  isAdvancing: boolean;
  questions: CareerQuestionV2[];
  onChooseAnswer: (choice: CareerAnswer) => void;
  onPrevious: () => void;
};

export function QuestionPanel({
  answeredCount,
  currentAnswer,
  currentIndex,
  currentQuestion,
  isAdvancing,
  questions,
  onChooseAnswer,
  onPrevious,
}: QuestionPanelProps) {
  return (
    <section className="question-panel" aria-live="polite">
      <div className="question-meta">
        <span>{String(currentIndex + 1).padStart(2, '0')}</span>
        <p>{currentQuestion.kind === 'activity' ? '활동 흥미' : '일하는 방식'}</p>
      </div>

      <h2>{currentQuestion.text}</h2>

      <div className="options-grid">
        {currentQuestion.options.map((option) => {
          const selected = currentAnswer === option.id;
          return (
            <button
              className={`option-card ${selected ? 'selected' : ''}`}
              key={option.id}
              type="button"
              onClick={() => onChooseAnswer(option.id)}
              aria-pressed={selected}
              disabled={isAdvancing}
            >
              <span className="option-check">
                {selected ? <Check size={18} /> : null}
              </span>
              <strong>{option.label}</strong>
            </button>
          );
        })}
        <button
          className={`option-card option-card-neutral ${currentAnswer === 'unknown' ? 'selected' : ''}`}
          type="button"
          onClick={() => onChooseAnswer('unknown')}
          aria-pressed={currentAnswer === 'unknown'}
          disabled={isAdvancing}
        >
          <span className="option-check">{currentAnswer === 'unknown' ? <Check size={18} /> : null}</span>
          <strong>아직 잘 모르겠어요</strong>
          <small>고민이 더 필요하면 이 선택을 골라도 괜찮아요.</small>
        </button>
      </div>

      <div className="question-footer">
        <button className="ghost-button" type="button" onClick={onPrevious} disabled={currentIndex === 0 || isAdvancing}>
          <ArrowLeft size={18} />
          이전
        </button>
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
