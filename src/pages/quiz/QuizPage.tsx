import { questions } from '../../data/questions';
import type { ChoiceKey, FocusHandoffOptions, Question } from '../../types/career';
import { QuestionPanel } from './components/QuestionPanel';
import { QuizIntro } from './components/QuizIntro';

type QuizPageProps = {
  answeredCount: number;
  currentAnswer?: ChoiceKey;
  currentIndex: number;
  currentQuestion: Question;
  focusRequest: number;
  isAdvancing: boolean;
  progress: number;
  userName: string;
  onChooseAnswer: (choice: ChoiceKey, options?: FocusHandoffOptions) => void;
  onPrevious: () => void;
};

export function QuizPage({
  answeredCount,
  currentAnswer,
  currentIndex,
  currentQuestion,
  focusRequest,
  isAdvancing,
  progress,
  userName,
  onChooseAnswer,
  onPrevious,
}: QuizPageProps) {
  return (
    <section className="quiz-layout">
      <QuestionPanel
        answeredCount={answeredCount}
        currentAnswer={currentAnswer}
        currentIndex={currentIndex}
        currentQuestion={currentQuestion}
        focusRequest={focusRequest}
        isAdvancing={isAdvancing}
        questions={questions}
        onChooseAnswer={onChooseAnswer}
        onPrevious={onPrevious}
      />
      <QuizIntro answeredCount={answeredCount} totalQuestions={questions.length} progress={progress} userName={userName} />
    </section>
  );
}
