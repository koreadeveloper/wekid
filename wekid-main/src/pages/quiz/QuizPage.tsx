import { questions } from '../../data/questions';
import type { AnswerChoice, Question } from '../../types/career';
import { QuestionPanel } from './components/QuestionPanel';
import { QuizIntro } from './components/QuizIntro';

type QuizPageProps = {
  answeredCount: number;
  currentAnswer?: AnswerChoice;
  currentIndex: number;
  currentQuestion: Question;
  isAdvancing: boolean;
  progress: number;
  userName: string;
  onChooseAnswer: (choice: AnswerChoice) => void;
  onPrevious: () => void;
};

export function QuizPage({
  answeredCount,
  currentAnswer,
  currentIndex,
  currentQuestion,
  isAdvancing,
  progress,
  userName,
  onChooseAnswer,
  onPrevious,
}: QuizPageProps) {
  return (
    <section className="quiz-layout">
      <QuizIntro answeredCount={answeredCount} totalQuestions={questions.length} progress={progress} userName={userName} />
      <QuestionPanel
        answeredCount={answeredCount}
        currentAnswer={currentAnswer}
        currentIndex={currentIndex}
        currentQuestion={currentQuestion}
        isAdvancing={isAdvancing}
        questions={questions}
        onChooseAnswer={onChooseAnswer}
        onPrevious={onPrevious}
      />
    </section>
  );
}
