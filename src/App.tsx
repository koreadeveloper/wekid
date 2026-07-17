import { useEffect, useMemo, useRef, useState } from 'react';
import { TopBar } from './components/layout/TopBar';
import { careerCategories } from './data/careerCategories';
import { getCareerDetail } from './data/careerDetails';
import { careerQuestionsV2 } from './data/questionsV2';
import { getCenterNameFromSearch, resolveCenterContext } from './lib/centerContext';
import { getCareerResultV2 } from './lib/careerScoring';
import { createAnswerSnapshots } from './lib/questionSnapshots';
import { saveTestResult, updateTestResultDreamChoice } from './lib/resultStorage';
import { AdminPage } from './pages/admin/AdminPage';
import { BusinessCardMakerPage } from './pages/business-card/BusinessCardMakerPage';
import { QuizPage } from './pages/quiz/QuizPage';
import { CareerDetailModal } from './pages/result/components/CareerDetailModal';
import { ResultPage } from './pages/result/ResultPage';
import { StartPage } from './pages/start/StartPage';
import type { CareerAnswer, CareerAnswerMap, CareerDetail, DreamChoice } from './types/career';

type AppMode = 'career' | 'business-card' | 'admin';

type ResultSaveStatus =
  | { status: 'idle' | 'saving' }
  | { status: 'saved'; resultId: string }
  | { status: 'skipped'; reason: 'firebase-not-configured' }
  | { status: 'failed'; error: unknown };

function App() {
  const [mode, setMode] = useState<AppMode>('career');
  const [canUseBusinessCard, setCanUseBusinessCard] = useState(false);
  const initialUrlCenterName = useMemo(
    () => getCenterNameFromSearch(typeof window === 'undefined' ? '' : window.location.search),
    [],
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<CareerAnswerMap>({});
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
  const [dreamChoice, setDreamChoice] = useState<DreamChoice>();
  const [selectedCareer, setSelectedCareer] = useState<CareerDetail | null>(null);
  const [isAdvancing, setIsAdvancingState] = useState(false);
  const advanceTimerRef = useRef<number | undefined>(undefined);
  const advancingRef = useRef(false);
  const automaticSaveStartedRef = useRef(false);
  const savedResultIdRef = useRef<string | null>(null);
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

  const answeredCount = Object.keys(answers).length;
  const isComplete = answeredCount === careerQuestionsV2.length;
  const result = useMemo(() => (isComplete ? getCareerResultV2(answers) : undefined), [answers, isComplete]);
  const progress = Math.round((answeredCount / careerQuestionsV2.length) * 100);
  const safeCurrentIndex = Math.min(Math.max(currentIndex, 0), careerQuestionsV2.length - 1);
  const currentQuestion = careerQuestionsV2[safeCurrentIndex];
  const currentAnswer = answers[currentQuestion.id];
  const centerContext = useMemo(
    () => resolveCenterContext({ centerInput, initialUrlCenterName, isManual: isCenterManual }),
    [centerInput, initialUrlCenterName, isCenterManual],
  );
  const totalCareerCount = useMemo(
    () => new Set(careerCategories.flatMap((category) => category.careers)).size,
    [],
  );

  const chooseAnswer = (choice: CareerAnswer) => {
    if (advancingRef.current) {
      return;
    }

    setIsAdvancing(true);
    clearAdvanceTimer();
    const nextAnswers = { ...answers, [currentQuestion.id]: choice };
    const nextAnsweredCount = Object.keys(nextAnswers).length;
    setAnswers(nextAnswers);
    setDreamChoice(undefined);
    setResultSaveStatus({ status: 'idle' });
    automaticSaveStartedRef.current = false;
    savedResultIdRef.current = null;
    savedResultSignatureRef.current = null;

    if (safeCurrentIndex < careerQuestionsV2.length - 1) {
      setShowResult(false);
      advanceTimerRef.current = window.setTimeout(() => {
        advanceTimerRef.current = undefined;
        setCurrentIndex(safeCurrentIndex + 1);
        setIsAdvancing(false);
      }, 160);
      return;
    }

    if (nextAnsweredCount < careerQuestionsV2.length) {
      const firstUnansweredIndex = careerQuestionsV2.findIndex((question) => !(question.id in nextAnswers));
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

  const confirmDreamChoice = (nextDreamChoice: DreamChoice) => {
    if (!result || !isComplete) {
      return;
    }

    setDreamChoice(nextDreamChoice);

    if (savedResultIdRef.current) {
      const resultId = savedResultIdRef.current;
      setResultSaveStatus({ status: 'saving' });

      void updateTestResultDreamChoice(resultId, nextDreamChoice).then((saveResult) => {
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
      return;
    }

    const resultSignature = JSON.stringify({ answers, centerContext, nextDreamChoice, userName, userEmail });
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
      questionnaireVersion: 2,
      answerSnapshots: createAnswerSnapshots(answers),
      fieldResults: result.fieldResults,
      recommendedFieldResults: result.recommendedFieldResults,
      dreamChoice: nextDreamChoice,
      resultSummary: result.summary,
    }).then((saveResult) => {
      if (saveResult.ok) {
        savedResultIdRef.current = saveResult.resultId;
        setResultSaveStatus({ status: 'saved', resultId: saveResult.resultId });
        return;
      }

      if (saveResult.reason === 'firebase-not-configured') {
        setResultSaveStatus({ status: 'skipped', reason: saveResult.reason });
        return;
      }

      savedResultSignatureRef.current = null;
      setResultSaveStatus({ status: 'failed', error: saveResult.error });
    });
  };

  useEffect(() => {
    if (!showResult || !result || !isComplete || automaticSaveStartedRef.current) {
      return;
    }

    automaticSaveStartedRef.current = true;
    confirmDreamChoice({ kind: 'undecided' });
  }, [showResult, result, isComplete]);

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
    setDreamChoice(undefined);
    setResultSaveStatus({ status: 'idle' });
    automaticSaveStartedRef.current = false;
    savedResultIdRef.current = null;
    savedResultSignatureRef.current = null;
    setSelectedCareer(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const editLastAnswer = () => {
    clearAdvanceTimer();
    setIsAdvancing(false);
    setShowResult(false);
    setCurrentIndex(careerQuestionsV2.length - 1);
    setDreamChoice(undefined);
    setResultSaveStatus({ status: 'idle' });
    automaticSaveStartedRef.current = false;
    savedResultIdRef.current = null;
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
    setUserEmail('');
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
    setMode(nextMode);
    setSelectedCareer(null);
    window.requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
  };

  return (
    <main className={`app ${mode === 'business-card' ? 'business-card-app' : ''}`}>
      {mode === 'career' && selectedCareer && <CareerDetailModal detail={selectedCareer} onClose={() => setSelectedCareer(null)} />}
      <TopBar
        mode={mode}
        totalCareerCount={totalCareerCount}
        canUseBusinessCard={canUseBusinessCard}
        onModeChange={handleModeChange}
        onReset={reset}
      />
      {mode === 'admin' ? (
        <AdminPage onOwnerStatusChange={setCanUseBusinessCard} />
      ) : mode === 'business-card' ? (
        <BusinessCardMakerPage initialEmail={userEmail} initialName={userName} />
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
      ) : showResult && result ? (
        <ResultPage
          result={result}
          dreamChoice={dreamChoice}
          resultSaveStatus={resultSaveStatus}
          userName={userName}
          hasCareerDetail={(careerName) => Boolean(getCareerDetail(careerName))}
          onCareerSelect={selectCareer}
          onConfirmDreamChoice={confirmDreamChoice}
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
