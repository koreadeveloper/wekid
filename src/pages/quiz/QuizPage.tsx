import { questions } from '../../data/questions';
import type { AnswerMap, ChoiceKey, Question } from '../../types/career';
import { QuestionPanel } from './components/QuestionPanel';
import { QuizIntro } from './components/QuizIntro';

type QuizPageProps = {
  answers: AnswerMap;
  answeredCount: number;
  currentAnswer?: ChoiceKey;
  currentIndex: number;
  currentQuestion: Question;
  progress: number;
  onChooseAnswer: (choice: ChoiceKey) => void;
  onPrevious: () => void;
};

export function QuizPage({
  answers,
  answeredCount,
  currentAnswer,
  currentIndex,
  currentQuestion,
  progress,
  onChooseAnswer,
  onPrevious,
}: QuizPageProps) {
  return (
    <section className="quiz-layout">
      <QuizIntro answeredCount={answeredCount} totalQuestions={questions.length} progress={progress} />
      <QuestionPanel
        answers={answers}
        currentAnswer={currentAnswer}
        currentIndex={currentIndex}
        currentQuestion={currentQuestion}
        questions={questions}
        onChooseAnswer={onChooseAnswer}
        onPrevious={onPrevious}
      />
    </section>
  );
}
