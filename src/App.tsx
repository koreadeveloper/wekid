import { useEffect, useMemo, useRef, useState } from 'react';
import { TopBar } from './components/layout/TopBar';
import { getCareerDetail } from './data/careerDetails';
import { careerCategories } from './data/careerCategories';
import { questions } from './data/questions';
import { getCareerResult, getScores } from './lib/careerScoring';
import { QuizPage } from './pages/quiz/QuizPage';
import { CareerDetailModal } from './pages/result/components/CareerDetailModal';
import { ResultPage } from './pages/result/ResultPage';
import { StartPage } from './pages/start/StartPage';
import type { AnswerMap, CareerDetail, ChoiceKey } from './types/career';

function App() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [showResult, setShowResult] = useState(false);
  const [nameStep, setNameStep] = useState(true);
  const [nameInput, setNameInput] = useState('');
  const [userName, setUserName] = useState('');
  const [selectedCareer, setSelectedCareer] = useState<CareerDetail | null>(null);
  const [isAdvancing, setIsAdvancingState] = useState(false);
  const advanceTimerRef = useRef<number | undefined>(undefined);
  const advancingRef = useRef(false);

  const setIsAdvancing = (value: boolean) => {
    advancingRef.current = value;
    setIsAdvancingState(value);
  };

  const clearAdvanceTimer = () => {
    if (advanceTimerRef.current !== undefined) {
      window.clearTimeout(advanceTimerRef.current);
      advanceTimerRef.current = undefined;
    }
  };

  useEffect(() => clearAdvanceTimer, []);

  const scores = useMemo(() => getScores(answers), [answers]);
  const answeredCount = Object.keys(answers).length;
  const isComplete = answeredCount === questions.length;
  const result = useMemo(() => (isComplete ? getCareerResult(scores) : undefined), [isComplete, scores]);
  const profile = result?.profile;
  const progress = Math.round((answeredCount / questions.length) * 100);
  const safeCurrentIndex = Math.min(Math.max(currentIndex, 0), questions.length - 1);
  const currentQuestion = questions[safeCurrentIndex];
  const currentAnswer = answers[currentQuestion.id];
  const careerMatches = result?.matches ?? { primary: [], explore: [] };
  const highlightedCareers = useMemo(() => {
    if (!profile) {
      return new Set<string>();
    }

    return new Set([
      profile.topCareer.name,
      ...careerMatches.primary.map((career) => career.name),
      ...careerMatches.explore.map((career) => career.name),
    ]);
  }, [careerMatches, profile]);
  const totalCareerCount = useMemo(
    () => new Set(careerCategories.flatMap((category) => category.careers)).size,
    [],
  );

  const chooseAnswer = (choice: ChoiceKey) => {
    if (advancingRef.current) {
      return;
    }

    setIsAdvancing(true);
    clearAdvanceTimer();

    const nextAnswers = { ...answers, [currentQuestion.id]: choice };
    const nextAnsweredCount = Object.keys(nextAnswers).length;
    setAnswers(nextAnswers);

    if (safeCurrentIndex < questions.length - 1) {
      setShowResult(false);
      advanceTimerRef.current = window.setTimeout(() => {
        advanceTimerRef.current = undefined;
        setCurrentIndex(safeCurrentIndex + 1);
        setIsAdvancing(false);
      }, 160);
      return;
    }

    if (nextAnsweredCount < questions.length) {
      const firstUnansweredIndex = questions.findIndex((question) => !(question.id in nextAnswers));
      setShowResult(false);
      setCurrentIndex(firstUnansweredIndex === -1 ? safeCurrentIndex : firstUnansweredIndex);
      setIsAdvancing(false);
      return;
    }

    advanceTimerRef.current = window.setTimeout(() => {
      advanceTimerRef.current = undefined;
      setShowResult(true);
      setIsAdvancing(false);
      window.requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
    }, 180);
  };

  const reset = () => {
    clearAdvanceTimer();
    setIsAdvancing(false);
    setAnswers({});
    setCurrentIndex(0);
    setShowResult(false);
    setNameStep(true);
    setNameInput('');
    setUserName('');
    setSelectedCareer(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const editLastAnswer = () => {
    clearAdvanceTimer();
    setIsAdvancing(false);
    setShowResult(false);
    setCurrentIndex(questions.length - 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const startWithName = () => {
    clearAdvanceTimer();
    setIsAdvancing(false);
    setUserName(nameInput.trim());
    setNameStep(false);
  };

  const skipName = () => {
    clearAdvanceTimer();
    setIsAdvancing(false);
    setUserName('');
    setNameStep(false);
  };

  const selectCareer = (careerName: string) => {
    const detail = getCareerDetail(careerName);
    if (detail) {
      setSelectedCareer(detail);
    }
  };

  return (
    <main className="app">
      {selectedCareer && <CareerDetailModal detail={selectedCareer} onClose={() => setSelectedCareer(null)} />}
      <TopBar totalCareerCount={totalCareerCount} onReset={reset} />
      {nameStep ? (
        <StartPage nameInput={nameInput} onNameChange={setNameInput} onStart={startWithName} onSkip={skipName} />
      ) : showResult && profile ? (
        <ResultPage
          careerMatches={careerMatches}
          highlightedCareers={highlightedCareers}
          profile={profile}
          scores={scores}
          userName={userName}
          hasCareerDetail={(careerName) => Boolean(getCareerDetail(careerName))}
          onCareerSelect={selectCareer}
          onEditLastAnswer={editLastAnswer}
          onReset={reset}
        />
      ) : (
        <QuizPage
          answeredCount={answeredCount}
          currentAnswer={currentAnswer}
          currentIndex={safeCurrentIndex}
          currentQuestion={currentQuestion}
          isAdvancing={isAdvancing}
          progress={progress}
          userName={userName}
          onChooseAnswer={chooseAnswer}
          onPrevious={() => {
            if (advancingRef.current) {
              return;
            }

            clearAdvanceTimer();
            setCurrentIndex((index) => Math.max(0, index - 1));
          }}
        />
      )}
    </main>
  );
}

export default App;
