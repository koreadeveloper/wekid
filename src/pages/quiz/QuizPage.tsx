import { careerQuestionsV2 } from '../../data/questionsV2';
import type { CareerAnswer, CareerQuestionV2 } from '../../types/career';
import { QuestionPanel } from './components/QuestionPanel';
import { QuizIntro } from './components/QuizIntro';

type QuizPageProps = {
  answeredCount: number;
  currentAnswer?: CareerAnswer;
  currentIndex: number;
  currentQuestion: CareerQuestionV2;
  isAdvancing: boolean;
  progress: number;
  userName: string;
  onChooseAnswer: (choice: CareerAnswer) => void;
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
      <QuizIntro answeredCount={answeredCount} totalQuestions={careerQuestionsV2.length} progress={progress} userName={userName} />
      <QuestionPanel
        answeredCount={answeredCount}
        currentAnswer={currentAnswer}
        currentIndex={currentIndex}
        currentQuestion={currentQuestion}
        isAdvancing={isAdvancing}
        questions={careerQuestionsV2}
        onChooseAnswer={onChooseAnswer}
        onPrevious={onPrevious}
      />
    </section>
  );
}
