import { useMemo, useState } from 'react';
import { TopBar } from './components/layout/TopBar';
import { getCareerDetail } from './data/careerDetails';
import { careerCategories } from './data/careerCategories';
import { careerProfiles } from './data/careerProfiles';
import { questions } from './data/questions';
import { getCareerMatches, getCareerPattern, getScores } from './lib/careerScoring';
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

  const scores = useMemo(() => getScores(answers), [answers]);
  const careerPattern = useMemo(() => getCareerPattern(scores), [scores]);
  const profile = careerProfiles[careerPattern];
  const answeredCount = Object.keys(answers).length;
  const progress = Math.round((answeredCount / questions.length) * 100);
  const currentQuestion = questions[currentIndex];
  const currentAnswer = answers[currentQuestion.id];
  const careerMatches = useMemo(
    () => (profile ? getCareerMatches(careerPattern, profile) : { primary: [], explore: [] }),
    [careerPattern, profile],
  );
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
    const nextAnswers = { ...answers, [currentQuestion.id]: choice };
    setAnswers(nextAnswers);

    if (currentIndex < questions.length - 1) {
      window.setTimeout(() => setCurrentIndex((index) => index + 1), 160);
      return;
    }

    window.setTimeout(() => {
      setShowResult(true);
      window.requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
    }, 180);
  };

  const reset = () => {
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
    setShowResult(false);
    setCurrentIndex(questions.length - 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const startWithName = () => {
    setUserName(nameInput.trim());
    setNameStep(false);
  };

  const skipName = () => {
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
      ) : !showResult ? (
        <QuizPage
          answers={answers}
          answeredCount={answeredCount}
          currentAnswer={currentAnswer}
          currentIndex={currentIndex}
          currentQuestion={currentQuestion}
          progress={progress}
          userName={userName}
          onChooseAnswer={chooseAnswer}
          onPrevious={() => setCurrentIndex((index) => Math.max(0, index - 1))}
        />
      ) : (
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
      )}
    </main>
  );
}

export default App;
