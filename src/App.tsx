import { useEffect, useMemo, useRef, useState } from 'react';
import { TopBar } from './components/layout/TopBar';
import { totalCareerCount } from './data/careerCatalogSummary';
import { questions } from './data/questions';
import { readCurrentAppMode, writeAppModeToHistory, type AppMode } from './lib/appMode';
import { getCenterNameFromSearch, resolveCenterContext } from './lib/centerContext';
import { getCareerResult, getScores } from './lib/careerScoring';
import { persistTestResult } from './lib/resultPersistence';
import { LazyAdminPage } from './pages/admin/LazyAdminPage';
import { LazyBusinessCardMakerPage } from './pages/business-card/LazyBusinessCardMakerPage';
import type { BusinessCardData } from './pages/business-card/BusinessCardPreview';
import { buildResultBusinessCardData } from './pages/business-card/businessCardConfig';
import {
  clearBusinessCardDraft,
  readBusinessCardDraft,
  saveBusinessCardDraft,
} from './pages/business-card/businessCardDraftStorage';
import { QuizPage } from './pages/quiz/QuizPage';
import { LazyCareerDetailModal } from './pages/result/components/LazyCareerDetailModal';
import { LazyResultPage } from './pages/result/LazyResultPage';
import { StartPage } from './pages/start/StartPage';
import type { AnswerMap, CareerDetail, ChoiceKey, FocusHandoffOptions } from './types/career';

type ResultSaveErrorReason = 'firebase-not-configured' | 'write-failed';

const resultSaveErrorMessages: Record<ResultSaveErrorReason, string> = {
  'firebase-not-configured': '결과 저장 연결이 준비되지 않았어요. 담당자에게 알려 주세요.',
  'write-failed': '결과를 저장하지 못했어요. 연결 상태를 확인한 뒤 다시 시도해 주세요.',
};

const getPreferredScrollBehavior = (): ScrollBehavior =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';

const scrollToTop = () => window.scrollTo({ top: 0, behavior: getPreferredScrollBehavior() });

const requestScrollToTop = () => window.requestAnimationFrame(scrollToTop);

function App() {
  const [mode, setMode] = useState<AppMode>(() => readCurrentAppMode());
  const initialUrlCenterName = useMemo(
    () => getCenterNameFromSearch(typeof window === 'undefined' ? '' : window.location.search),
    [],
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [showResult, setShowResult] = useState(false);
  const [nameStep, setNameStep] = useState(true);
  const [nameInput, setNameInput] = useState('');
  const [centerInput, setCenterInput] = useState(initialUrlCenterName ?? '');
  const [isCenterManual, setIsCenterManual] = useState(false);
  const [userName, setUserName] = useState('');
  const [startedAt, setStartedAt] = useState<Date | null>(null);
  const [selectedCareer, setSelectedCareer] = useState<CareerDetail | null>(null);
  const [businessCardData, setBusinessCardData] = useState<BusinessCardData | undefined>(() => readBusinessCardDraft());
  const [isAdvancing, setIsAdvancingState] = useState(false);
  const [quizFocusRequest, setQuizFocusRequest] = useState(0);
  const [resultFocusRequest, setResultFocusRequest] = useState(0);
  const [businessCardFocusRequest, setBusinessCardFocusRequest] = useState(0);
  const [resultSaveError, setResultSaveError] = useState<ResultSaveErrorReason | null>(null);
  const [resultSaveRetryRequest, setResultSaveRetryRequest] = useState(0);
  const advanceTimerRef = useRef<number | undefined>(undefined);
  const advancingRef = useRef(false);
  const savedResultSignatureRef = useRef<string | null>(null);
  const savingResultSignatureRef = useRef<string | null>(null);
  const savingResultRequestRef = useRef<symbol | null>(null);

  const setIsAdvancing = (value: boolean) => {
    advancingRef.current = value;
    setIsAdvancingState(value);
  };

  const requestQuizFocus = () => setQuizFocusRequest((request) => request + 1);

  const requestResultFocus = () => setResultFocusRequest((request) => request + 1);

  const requestBusinessCardFocus = () => setBusinessCardFocusRequest((request) => request + 1);

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
  useEffect(() => {
    const syncModeFromHistory = () => {
      setMode(readCurrentAppMode());
      setSelectedCareer(null);
    };

    window.addEventListener('popstate', syncModeFromHistory);
    return () => window.removeEventListener('popstate', syncModeFromHistory);
  }, []);

  useEffect(() => {
    if (!showResult || !profile || !isComplete) {
      return;
    }

    const resultSignature = JSON.stringify({ answers, centerContext, topCareer: profile.topCareer.name, userName });
    if (savedResultSignatureRef.current === resultSignature || savingResultSignatureRef.current === resultSignature) {
      return;
    }

    const saveRequest = Symbol(resultSignature);
    savingResultSignatureRef.current = resultSignature;
    savingResultRequestRef.current = saveRequest;
    const completedAt = new Date();
    const resultStartedAt = startedAt ?? completedAt;

    void (async () => {
      try {
        const saveResult = await persistTestResult({
          participantName: userName || null,
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
        });

        if (savingResultRequestRef.current !== saveRequest) {
          return;
        }

        if (saveResult.ok) {
          savedResultSignatureRef.current = resultSignature;
          setResultSaveError(null);
          return;
        }

        setResultSaveError(saveResult.reason);
      } catch {
        if (savingResultRequestRef.current === saveRequest) {
          setResultSaveError('write-failed');
        }
      } finally {
        if (savingResultRequestRef.current === saveRequest) {
          savingResultSignatureRef.current = null;
          savingResultRequestRef.current = null;
        }
      }
    })();
  }, [answers, centerContext, isComplete, profile, resultSaveRetryRequest, scores, showResult, startedAt, userName]);

  const chooseAnswer = (choice: ChoiceKey, options: FocusHandoffOptions = {}) => {
    if (advancingRef.current) {
      return;
    }

    const shouldFocusNextSurface = options.focusNextSurface === true;
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
      if (shouldFocusNextSurface) {
        requestResultFocus();
      }
      requestScrollToTop();
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
    setStartedAt(null);
    setBusinessCardData(undefined);
    clearBusinessCardDraft();
    savedResultSignatureRef.current = null;
    savingResultSignatureRef.current = null;
    savingResultRequestRef.current = null;
    setResultSaveError(null);
    setSelectedCareer(null);
    scrollToTop();
  };

  const editLastAnswer = () => {
    clearAdvanceTimer();
    setIsAdvancing(false);
    setShowResult(false);
    setCurrentIndex(questions.length - 1);
    savedResultSignatureRef.current = null;
    savingResultSignatureRef.current = null;
    savingResultRequestRef.current = null;
    setResultSaveError(null);
    requestQuizFocus();
    scrollToTop();
  };

  const retryResultSave = () => {
    savingResultSignatureRef.current = null;
    savingResultRequestRef.current = null;
    setResultSaveError(null);
    setResultSaveRetryRequest((request) => request + 1);
  };

  const startWithName = (shouldFocusQuiz = false) => {
    clearAdvanceTimer();
    setIsAdvancing(false);
    setUserName(nameInput.trim());
    setNameStep(false);
    setStartedAt(new Date());
    if (shouldFocusQuiz) {
      requestQuizFocus();
    }
    requestScrollToTop();
  };

  const skipName = (shouldFocusQuiz = false) => {
    clearAdvanceTimer();
    setIsAdvancing(false);
    setUserName('');
    setNameStep(false);
    setStartedAt(new Date());
    if (shouldFocusQuiz) {
      requestQuizFocus();
    }
    requestScrollToTop();
  };

  const selectCareer = (careerName: string) => {
    void import('./data/careerDetails').then(({ getCareerDetail }) => setSelectedCareer(getCareerDetail(careerName)));
  };

  const handleModeChange = (nextMode: AppMode) => {
    if (nextMode === 'business-card') {
      const storedCardData = readBusinessCardDraft();
      if (storedCardData) {
        setBusinessCardData(storedCardData);
      }
    }

    if (nextMode !== mode) {
      writeAppModeToHistory(nextMode);
    }

    setMode(nextMode);
    setSelectedCareer(null);
    if (nextMode === 'business-card') {
      requestBusinessCardFocus();
    }
    requestScrollToTop();
  };

  const createBusinessCardFromResult = (careerName: string) => {
    const nextBusinessCardData = buildResultBusinessCardData({
      userName,
      centerName: centerContext.centerName,
      careerName,
    });

    setBusinessCardData(nextBusinessCardData);
    saveBusinessCardDraft(nextBusinessCardData);
    handleModeChange('business-card');
  };

  const appClassName = [
    'app',
    mode === 'business-card' ? 'business-card-app' : '',
    mode === 'career' && nameStep ? 'name-step-app' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <main className={appClassName}>
      {mode === 'career' && selectedCareer && (
        <LazyCareerDetailModal detail={selectedCareer} onClose={() => setSelectedCareer(null)} />
      )}
      <TopBar
        mode={mode}
        showReset={mode === 'career' && !nameStep && !showResult}
        totalCareerCount={totalCareerCount}
        onModeChange={handleModeChange}
        onReset={reset}
      />
      {mode === 'admin' ? (
        <LazyAdminPage />
      ) : mode === 'business-card' ? (
        <LazyBusinessCardMakerPage focusRequest={businessCardFocusRequest} initialCardData={businessCardData} />
      ) : nameStep ? (
        <StartPage
          centerInput={centerInput}
          centerSource={centerContext.centerSource}
          initialUrlCenterName={initialUrlCenterName}
          nameInput={nameInput}
          onCenterChange={(value) => {
            setCenterInput(value);
            setIsCenterManual(true);
          }}
          onNameChange={setNameInput}
          onStart={startWithName}
          onSkip={skipName}
        />
      ) : showResult && profile ? (
        <LazyResultPage
          careerMatches={careerMatches}
          highlightedCareers={highlightedCareers}
          profile={profile}
          focusRequest={resultFocusRequest}
          scores={scores}
          userName={userName}
          hasCareerDetail={() => true}
          onCareerSelect={selectCareer}
          onCreateBusinessCard={createBusinessCardFromResult}
          onEditLastAnswer={editLastAnswer}
          onReset={reset}
          onRetryResultSave={retryResultSave}
          resultSaveErrorMessage={resultSaveError ? resultSaveErrorMessages[resultSaveError] : null}
        />
      ) : (
        <QuizPage
          answeredCount={answeredCount}
          currentAnswer={currentAnswer}
          currentIndex={safeCurrentIndex}
          currentQuestion={currentQuestion}
          focusRequest={quizFocusRequest}
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
