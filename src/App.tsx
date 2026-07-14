import { useEffect, useMemo, useRef, useState } from 'react';
import { TopBar } from './components/layout/TopBar';
import { getCareerDetail } from './data/careerDetails';
import { careerCategories } from './data/careerCategories';
import { questions } from './data/questions';
import { getCenterNameFromSearch, resolveCenterContext } from './lib/centerContext';
import { getCareerResult, getScores } from './lib/careerScoring';
import { saveTestResult } from './lib/resultStorage';
import {
  AdminBusinessCardBridge,
  type BusinessCardPrefill,
} from './pages/admin/AdminBusinessCardBridge';
import { AdminPage } from './pages/admin/AdminPage';
import { AdminBusinessCardMakerPage } from './pages/business-card/AdminBusinessCardMakerPage';
import { BusinessCardMakerPage } from './pages/business-card/BusinessCardMakerPage';
import { QuizPage } from './pages/quiz/QuizPage';
import { CareerDetailModal } from './pages/result/components/CareerDetailModal';
import { ResultPage } from './pages/result/ResultPage';
import { StartPage } from './pages/start/StartPage';
import type { AnswerChoice, AnswerMap, CareerDetail } from './types/career';

type AppMode = 'career' | 'business-card' | 'admin';

type ResultSaveStatus =
  | { status: 'idle' | 'saving' }
  | { status: 'saved'; resultId: string }
  | { status: 'skipped'; reason: 'firebase-not-configured' }
  | { status: 'failed'; error: unknown };

function App() {
  const [mode, setMode] = useState<AppMode>('career');
  const [canUseBusinessCard, setCanUseBusinessCard] = useState(false);
  const [businessCardPrefill, setBusinessCardPrefill] = useState<BusinessCardPrefill | null>(null);
  const initialUrlCenterName = useMemo(
    () => getCenterNameFromSearch(typeof window === 'undefined' ? '' : window.location.search),
    [],
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [showResult, setShowResult] = useState(false);
  const [nameStep, setNameStep] = useState(true);
  const [nameInput, setNameInput] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [centerInput, setCenterInput] = useState(initialUrlCenterName ?? '');
  const [isCenterManual, setIsCenterManual] = useState(false);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [startedAt, setStartedAt] = useState<Date | null>(null);
  const [resultSaveStatus, setResultSaveStatus] = useState<ResultSaveStatus>({ status: 'idle' });
  const [selectedCareer, setSelectedCareer] = useState<CareerDetail | null>(null);
  const [isAdvancing, setIsAdvancingState] = useState(false);
  const advanceTimerRef = useRef<number | undefined>(undefined);
  const advancingRef = useRef(false);
  const savedResultSignatureRef = useRef<string | null>(null);

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
  const centerContext = useMemo(
    () => resolveCenterContext({ centerInput, initialUrlCenterName, isManual: isCenterManual }),
    [centerInput, initialUrlCenterName, isCenterManual],
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

  useEffect(() => {
    if (!showResult || !profile || !isComplete) {
      return;
    }

    const resultSignature = JSON.stringify({ answers, centerContext, topCareer: profile.topCareer.name, userName, userEmail });
    if (savedResultSignatureRef.current === resultSignature) {
      return;
    }

    savedResultSignatureRef.current = resultSignature;
    setResultSaveStatus({ status: 'saving' });

    const completedAt = new Date();
    const resultStartedAt = startedAt ?? completedAt;

    void saveTestResult({
      participantName: userName || null,
      participantEmail: userEmail || null,
      centerName: centerContext.centerName,
      centerKey: centerContext.centerKey,
      centerSource: centerContext.centerSource,
      startedAt: resultStartedAt,
      completedAt,
      answers: questions
        .map((question) => ({ questionId: question.id, choice: answers[question.id] }))
        .filter((answer) => Boolean(answer.choice)),
      scores,
      topCareer: profile.topCareer,
      recommendedCareers: profile.recommendations,
      resultSummary: profile.summary,
    }).then((saveResult) => {
      if (saveResult.ok) {
        setResultSaveStatus({ status: 'saved', resultId: saveResult.resultId });
        return;
      }

      if (saveResult.reason === 'firebase-not-configured') {
        setResultSaveStatus({ status: 'skipped', reason: saveResult.reason });
        return;
      }

      setResultSaveStatus({ status: 'failed', error: saveResult.error });
    });
  }, [answers, centerContext, isComplete, profile, scores, showResult, startedAt, userName, userEmail]);

  const chooseAnswer = (choice: AnswerChoice) => {
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
    setEmailInput('');
    setUserName('');
    setUserEmail('');
    setStartedAt(null);
    setResultSaveStatus({ status: 'idle' });
    savedResultSignatureRef.current = null;
    setSelectedCareer(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const editLastAnswer = () => {
    clearAdvanceTimer();
    setIsAdvancing(false);
    setShowResult(false);
    setCurrentIndex(questions.length - 1);
    setResultSaveStatus({ status: 'idle' });
    savedResultSignatureRef.current = null;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const startWithName = () => {
    clearAdvanceTimer();
    setIsAdvancing(false);
    setUserName(nameInput.trim());
    setUserEmail(emailInput.trim());
    setNameStep(false);
    setStartedAt(new Date());
    window.requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
  };

  const skipName = () => {
    clearAdvanceTimer();
    setIsAdvancing(false);
    setUserName('');
    setNameStep(false);
    setStartedAt(new Date());
    window.requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
  };

  const selectCareer = (careerName: string) => {
    const detail = getCareerDetail(careerName);
    if (detail) {
      setSelectedCareer(detail);
    }
  };

  const handleModeChange = (nextMode: AppMode) => {
    if (nextMode !== 'business-card') {
      setBusinessCardPrefill(null);
    }
    setMode(nextMode);
    setSelectedCareer(null);
    window.requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
  };

  const createBusinessCardFromResult = (prefill: BusinessCardPrefill) => {
    setBusinessCardPrefill(prefill);
    setSelectedCareer(null);
    setMode('business-card');
    window.requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
  };

  return (
    <main className={`app ${mode === 'business-card' ? 'business-card-app' : ''}`}>
      {mode === 'career' && selectedCareer && (
        <CareerDetailModal detail={selectedCareer} onClose={() => setSelectedCareer(null)} />
      )}
      <TopBar
        mode={mode}
        totalCareerCount={totalCareerCount}
        canUseBusinessCard={canUseBusinessCard}
        onModeChange={handleModeChange}
        onReset={reset}
      />
      <AdminBusinessCardBridge
        enabled={mode === 'admin' && canUseBusinessCard}
        onCreateBusinessCard={createBusinessCardFromResult}
      />
      {mode === 'admin' ? (
        <AdminPage onOwnerStatusChange={setCanUseBusinessCard} />
      ) : mode === 'business-card' ? (
        businessCardPrefill ? (
          <AdminBusinessCardMakerPage key={businessCardPrefill.sourceId} prefill={businessCardPrefill} />
        ) : (
          <BusinessCardMakerPage initialEmail={userEmail} initialName={userName} />
        )
      ) : nameStep ? (
        <StartPage
          centerInput={centerInput}
          emailInput={emailInput}
          centerSource={centerContext.centerSource}
          initialUrlCenterName={initialUrlCenterName}
          nameInput={nameInput}
          onCenterChange={(value) => {
            setCenterInput(value);
            setIsCenterManual(true);
          }}
          onEmailChange={setEmailInput}
          onNameChange={setNameInput}
          onStart={startWithName}
          onSkip={skipName}
        />
      ) : showResult && profile ? (
        <ResultPage
          careerMatches={careerMatches}
          highlightedCareers={highlightedCareers}
          profile={profile}
          scores={scores}
          resultSaveStatus={resultSaveStatus}
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
