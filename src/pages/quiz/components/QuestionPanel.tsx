import { ArrowLeft, Check } from 'lucide-react';
import type { ChoiceKey, Question } from '../../../types/career';

type QuestionPanelProps = {
  answeredCount: number;
  currentAnswer?: ChoiceKey;
  currentIndex: number;
  currentQuestion: Question;
  isAdvancing: boolean;
  questions: Question[];
  onChooseAnswer: (choice: ChoiceKey) => void;
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
        <p>{currentQuestion.eyebrow}</p>
      </div>

      <h2>{currentQuestion.text}</h2>

      <div className="options-grid">
        {currentQuestion.options.map((option) => {
          const selected = currentAnswer === option.choice;
          return (
            <button
              className={`option-card ${selected ? 'selected' : ''}`}
              key={option.choice}
              type="button"
              onClick={() => onChooseAnswer(option.choice)}
              aria-pressed={selected}
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
