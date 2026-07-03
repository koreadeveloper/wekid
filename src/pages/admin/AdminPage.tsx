import { onAuthStateChanged, signInWithEmailAndPassword, signOut, type User } from 'firebase/auth';
import { BarChart3, Download, Eye, FileText, Lock, RefreshCw, X } from 'lucide-react';
import { forwardRef, useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { questions } from '../../data/questions';
import { auth } from '../../lib/firebase';
import { getAdminProfile, isOwnerAdmin } from '../../lib/adminAuth';
import {
  createAdminResultAnalysis,
  createAdminResultSummary,
  fetchAdminResults,
  filterResults,
  getCareerName,
  getResultDurationMinutes,
  toAdminDate,
  toResultsCsv,
} from '../../lib/adminResults';
import type { AdminProfile, StoredTestResultRecord, TestResultAnswer } from '../../types/firestore';

type AdminStatus =
  | { status: 'firebase-missing' }
  | { status: 'signed-out' }
  | { status: 'checking' }
  | { status: 'denied'; message: string }
  | { status: 'ready'; admin: AdminProfile };

type AdminReportDocumentProps = {
  activeCenterLabel: string;
  analysis: ReturnType<typeof createAdminResultAnalysis>;
  dateRangeLabel: string;
  results: StoredTestResultRecord[];
  summary: ReturnType<typeof createAdminResultSummary>;
};

const scoreLabels: Record<string, string> = {
  realistic: '실용형',
  investigative: '탐구형',
  artistic: '예술형',
  social: '사회형',
  enterprising: '도전형',
  conventional: '정리형',
  together: '함께하기',
  focus: '혼자집중',
  observe: '실제관찰',
  imagine: '상상아이디어',
  solve: '논리해결',
  care: '마음도움',
  plan: '계획형',
  flex: '탐험형',
};
const questionMap = new Map(questions.map((question) => [String(question.id), question]));

function formatDate(value: StoredTestResultRecord['createdAt']) {
  const date = toAdminDate(value);
  return date ? date.toLocaleString('ko-KR') : '-';
}

function formatDateShort(value: StoredTestResultRecord['createdAt']) {
  const date = toAdminDate(value);
  return date ? date.toLocaleDateString('ko-KR') : '-';
}

function formatDuration(minutes: number | null) {
  if (minutes === null) {
    return '-';
  }

  if (minutes < 1) {
    return '1분 미만';
  }

  return `${minutes.toFixed(1)}분`;
}

function formatPercent(value: number) {
  return `${Math.round(value * 100)}%`;
}

function formatAverage(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

function getSourceLabel(source: StoredTestResultRecord['centerSource']) {
  if (source === 'url') {
    return 'URL';
  }

  if (source === 'manual') {
    return '직접 입력';
  }

  return '센터 없음';
}

function getRecommendedCareerNames(result: StoredTestResultRecord) {
  return result.recommendedCareers
    .map((career) => {
      if (typeof career === 'string') {
        return career;
      }

      return typeof career.name === 'string' ? career.name : '';
    })
    .filter(Boolean);
}

function getAnswerDetail(answer: TestResultAnswer) {
  const question = questionMap.get(String(answer.questionId));
  const option = question?.options.find((candidate) => candidate.choice === answer.choice);

  return {
    choice: String(answer.choice),
    helper: option?.helper ?? '',
    optionLabel: option?.label ?? String(answer.choice),
    questionEyebrow: question?.eyebrow ?? `문항 ${answer.questionId}`,
    questionText: question?.text ?? '저장된 문항 정보를 찾을 수 없어요.',
  };
}

function safeFileNamePart(value: string) {
  if (value.trim() === '전체 센터') {
    return 'all';
  }

  return value.trim().replace(/[\\/:*?"<>|]+/g, '').replace(/\s+/g, '_') || 'all';
}

function getLocalDateStamp(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function downloadCsv(results: StoredTestResultRecord[], centerLabel: string) {
  const blob = new Blob([toResultsCsv(results)], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `wekid-results-${safeFileNamePart(centerLabel)}-${getLocalDateStamp()}.csv`;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function AdminPage() {
  const [adminStatus, setAdminStatus] = useState<AdminStatus>(auth ? { status: 'checking' } : { status: 'firebase-missing' });
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isLoadingResults, setIsLoadingResults] = useState(false);
  const [isPdfSaving, setIsPdfSaving] = useState(false);
  const [resultsError, setResultsError] = useState('');
  const [results, setResults] = useState<StoredTestResultRecord[]>([]);
  const [centerFilter, setCenterFilter] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [selectedResult, setSelectedResult] = useState<StoredTestResultRecord | null>(null);
  const reportRef = useRef<HTMLDivElement>(null);

  const loadAdmin = async (user: User | null) => {
    if (!user) {
      setAdminStatus({ status: 'signed-out' });
      return;
    }

    setAdminStatus({ status: 'checking' });
    const profile = await getAdminProfile(user.uid);

    if (!profile.ok) {
      setAdminStatus({ status: 'denied', message: '관리자 문서를 찾을 수 없어요.' });
      return;
    }

    if (!isOwnerAdmin(profile.admin)) {
      setAdminStatus({ status: 'denied', message: 'owner 권한이 있는 관리자만 볼 수 있어요.' });
      return;
    }

    setAdminStatus({ status: 'ready', admin: profile.admin });
  };

  const loadResults = async () => {
    setIsLoadingResults(true);
    setResultsError('');
    const response = await fetchAdminResults();

    if (response.ok) {
      setResults(response.results);
    } else {
      setResultsError(
        response.reason === 'firebase-not-configured'
          ? 'Firebase 설정이 아직 연결되지 않았어요.'
          : '검사 결과를 불러오지 못했어요. Firestore 규칙과 관리자 권한을 확인해주세요.',
      );
    }

    setIsLoadingResults(false);
  };

  useEffect(() => {
    if (!auth) {
      return undefined;
    }

    return onAuthStateChanged(auth, (user) => {
      void loadAdmin(user);
    });
  }, []);

  useEffect(() => {
    if (adminStatus.status === 'ready') {
      void loadResults();
    }
  }, [adminStatus.status]);

  const filteredResults = useMemo(
    () => filterResults(results, { centerKey: centerFilter || undefined, fromDate, toDate }),
    [centerFilter, fromDate, results, toDate],
  );
  const summary = useMemo(() => createAdminResultSummary(filteredResults), [filteredResults]);
  const analysis = useMemo(() => createAdminResultAnalysis(filteredResults), [filteredResults]);
  const allCenters = useMemo(() => createAdminResultSummary(results).byCenter, [results]);
  const activeCenterLabel = centerFilter
    ? allCenters.find((center) => center.centerKey === centerFilter)?.centerName ?? '선택 센터'
    : '전체 센터';
  const dateRangeLabel =
    fromDate || toDate ? `${fromDate || '처음'} - ${toDate || '오늘'}` : '전체 기간';
  const topScoreMax = Math.max(...analysis.scoreAverages.slice(0, 8).map((score) => score.average), 1);

  const handleSignIn = async (event: FormEvent) => {
    event.preventDefault();

    if (!auth) {
      setAuthError('Firebase 설정이 아직 연결되지 않았어요.');
      return;
    }

    setIsSigningIn(true);
    setAuthError('');

    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      setPassword('');
    } catch {
      setAuthError('로그인에 실패했어요. 이메일과 비밀번호를 확인해주세요.');
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleDownloadReportPdf = async () => {
    if (!reportRef.current) {
      return;
    }

    setIsPdfSaving(true);

    try {
      await document.fonts?.ready;
      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([import('html2canvas'), import('jspdf')]);
      const canvas = await html2canvas(reportRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
        windowWidth: reportRef.current.scrollWidth,
      });
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: true });
      const imageData = canvas.toDataURL('image/png');
      const pageWidth = 210;
      const pageHeight = 297;
      const imageHeight = (canvas.height * pageWidth) / canvas.width;
      let remainingHeight = imageHeight;
      let position = 0;

      pdf.addImage(imageData, 'PNG', 0, position, pageWidth, imageHeight);
      remainingHeight -= pageHeight;

      while (remainingHeight > 0) {
        position -= pageHeight;
        pdf.addPage();
        pdf.addImage(imageData, 'PNG', 0, position, pageWidth, imageHeight);
        remainingHeight -= pageHeight;
      }

      pdf.save(`wekid-report-${safeFileNamePart(activeCenterLabel)}-${getLocalDateStamp()}.pdf`);
    } catch {
      setResultsError('PDF 보고서를 만들지 못했어요. 잠시 후 다시 시도해주세요.');
    } finally {
      setIsPdfSaving(false);
    }
  };

  if (adminStatus.status === 'firebase-missing') {
    return (
      <section className="admin-page">
        <div className="admin-card compact">
          <Lock size={24} />
          <h1>관리자 페이지</h1>
          <p>Firebase 환경변수를 먼저 연결해야 관리자 페이지를 사용할 수 있어요.</p>
        </div>
      </section>
    );
  }

  if (adminStatus.status === 'signed-out' || adminStatus.status === 'checking' || adminStatus.status === 'denied') {
    return (
      <section className="admin-page">
        <form className="admin-card admin-login" onSubmit={handleSignIn}>
          <div className="admin-heading">
            <Lock size={24} />
            <div>
              <p className="section-kicker">관리자</p>
              <h1>검사 결과 대시보드</h1>
            </div>
          </div>
          <label>
            <span>이메일</span>
            <input value={email} type="email" onChange={(event) => setEmail(event.target.value)} autoComplete="email" />
          </label>
          <label>
            <span>비밀번호</span>
            <input
              value={password}
              type="password"
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
            />
          </label>
          {adminStatus.status === 'checking' && <p className="admin-message">권한을 확인하는 중이에요.</p>}
          {adminStatus.status === 'denied' && <p className="admin-message warning">{adminStatus.message}</p>}
          {authError && <p className="admin-message warning">{authError}</p>}
          <button className="primary-button" type="submit" disabled={isSigningIn}>
            {isSigningIn ? '로그인 중' : '로그인'}
          </button>
        </form>
      </section>
    );
  }

  return (
    <section className="admin-page">
      {selectedResult && <AdminResultDetailDialog result={selectedResult} onClose={() => setSelectedResult(null)} />}
      <AdminReportDocument
        ref={reportRef}
        activeCenterLabel={activeCenterLabel}
        analysis={analysis}
        dateRangeLabel={dateRangeLabel}
        results={filteredResults}
        summary={summary}
      />

      <div className="admin-dashboard-heading">
        <div>
          <p className="section-kicker">관리자 대시보드</p>
          <h1>검사 결과 모아보기</h1>
          <p>
            {adminStatus.admin.email} 계정으로 로그인 중이에요. 현재 보기: {activeCenterLabel} · {dateRangeLabel}
          </p>
        </div>
        <div className="admin-actions">
          <button className="ghost-button" type="button" onClick={loadResults} disabled={isLoadingResults}>
            <RefreshCw size={17} />
            새로고침
          </button>
          <button className="ghost-button" type="button" onClick={() => downloadCsv(filteredResults, activeCenterLabel)}>
            <Download size={17} />
            CSV
          </button>
          <button className="ghost-button" type="button" onClick={handleDownloadReportPdf} disabled={isPdfSaving}>
            <FileText size={17} />
            {isPdfSaving ? 'PDF 생성 중' : 'PDF 보고서'}
          </button>
          <button className="ghost-button" type="button" onClick={() => auth && void signOut(auth)}>
            로그아웃
          </button>
        </div>
      </div>

      <div className="admin-stats-grid">
        <article className="admin-stat-card">
          <span>현재 보기 검사</span>
          <strong>{summary.totalCount}</strong>
        </article>
        <article className="admin-stat-card">
          <span>최근 7일 검사</span>
          <strong>{summary.recentCount}</strong>
        </article>
        <article className="admin-stat-card">
          <span>평균 소요 시간</span>
          <strong>{formatDuration(analysis.averageDurationMinutes)}</strong>
        </article>
        <article className="admin-stat-card">
          <span>센터 수</span>
          <strong>{summary.byCenter.length}</strong>
        </article>
      </div>

      <section className="admin-card admin-center-picker">
        <div className="admin-card-heading">
          <div>
            <h2>센터별 보기</h2>
            <p>센터를 누르면 아래 통계, 표, CSV, PDF가 해당 센터 기준으로 바뀌어요.</p>
          </div>
          {centerFilter && (
            <button className="admin-text-button" type="button" onClick={() => setCenterFilter('')}>
              전체로 보기
            </button>
          )}
        </div>
        <div className="admin-center-chips">
          <button className={!centerFilter ? 'active' : ''} type="button" onClick={() => setCenterFilter('')}>
            전체 <strong>{results.length}</strong>
          </button>
          {allCenters.map((center) => (
            <button
              className={centerFilter === center.centerKey ? 'active' : ''}
              key={center.centerKey}
              type="button"
              onClick={() => setCenterFilter(center.centerKey)}
            >
              {center.centerName} <strong>{center.count}</strong>
            </button>
          ))}
        </div>
      </section>

      <div className="admin-card admin-filters">
        <label>
          <span>센터</span>
          <select value={centerFilter} onChange={(event) => setCenterFilter(event.target.value)}>
            <option value="">전체 센터</option>
            {allCenters.map((center) => (
              <option key={center.centerKey} value={center.centerKey}>
                {center.centerName}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>시작일</span>
          <input type="date" value={fromDate} onChange={(event) => setFromDate(event.target.value)} />
        </label>
        <label>
          <span>종료일</span>
          <input type="date" value={toDate} onChange={(event) => setToDate(event.target.value)} />
        </label>
        <button
          className="ghost-button admin-filter-reset"
          type="button"
          onClick={() => {
            setCenterFilter('');
            setFromDate('');
            setToDate('');
          }}
        >
          필터 초기화
        </button>
      </div>

      {resultsError && <p className="admin-message warning">{resultsError}</p>}

      <section className="admin-card admin-analysis-card">
        <div className="admin-card-heading">
          <div>
            <p className="section-kicker">보고서 및 분석</p>
            <h2>{activeCenterLabel} 분석 요약</h2>
          </div>
          <BarChart3 size={24} />
        </div>
        <div className="admin-analysis-grid">
          <div>
            <span>상위 센터</span>
            <strong>{analysis.topCenter?.centerName ?? '-'}</strong>
            <p>{analysis.topCenter ? `${analysis.topCenter.count}건 · ${formatPercent(analysis.topCenter.ratio)}` : '데이터 없음'}</p>
          </div>
          <div>
            <span>상위 추천 직업</span>
            <strong>{analysis.topCareer?.careerName ?? '-'}</strong>
            <p>{analysis.topCareer ? `${analysis.topCareer.count}건 · ${formatPercent(analysis.topCareer.ratio)}` : '데이터 없음'}</p>
          </div>
          <div>
            <span>평균 답변 수</span>
            <strong>{formatAverage(analysis.averageAnsweredCount)}</strong>
            <p>저장된 답변 배열 기준</p>
          </div>
        </div>
        <div className="admin-score-bars">
          {analysis.scoreAverages.slice(0, 8).map((score) => (
            <div key={score.scoreKey}>
              <span>{scoreLabels[score.scoreKey] ?? score.scoreKey}</span>
              <div>
                <i style={{ width: `${Math.max(6, (score.average / topScoreMax) * 100)}%` }} />
              </div>
              <strong>{score.average.toFixed(1)}</strong>
            </div>
          ))}
          {analysis.scoreAverages.length === 0 && <p className="admin-empty">아직 점수 데이터가 없어요.</p>}
        </div>
      </section>

      <div className="admin-grid">
        <section className="admin-card">
          <h2>센터별 검사 수</h2>
          <div className="admin-rank-list">
            {summary.byCenter.map((center) => (
              <button key={center.centerKey} type="button" onClick={() => setCenterFilter(center.centerKey)}>
                <span>{center.centerName}</span>
                <strong>{center.count}</strong>
              </button>
            ))}
            {summary.byCenter.length === 0 && <p className="admin-empty">아직 결과가 없어요.</p>}
          </div>
        </section>
        <section className="admin-card">
          <h2>추천 직업 분포</h2>
          <div className="admin-rank-list">
            {summary.byTopCareer.slice(0, 10).map((career) => (
              <div key={career.careerName}>
                <span>{career.careerName}</span>
                <strong>{career.count}</strong>
              </div>
            ))}
            {summary.byTopCareer.length === 0 && <p className="admin-empty">아직 결과가 없어요.</p>}
          </div>
        </section>
      </div>

      <section className="admin-card admin-table-card">
        <div className="admin-card-heading">
          <div>
            <h2>개별 검사 결과</h2>
            <p>행의 결과 보기를 누르면 답변, 점수, 추천 직업까지 확인할 수 있어요.</p>
          </div>
        </div>
        <div className="admin-table-wrap">
          <table>
            <thead>
              <tr>
                <th>저장일</th>
                <th>이름</th>
                <th>센터</th>
                <th>대표 직업</th>
                <th>소요</th>
                <th>요약</th>
                <th>상세</th>
              </tr>
            </thead>
            <tbody>
              {filteredResults.map((result) => (
                <tr key={result.id}>
                  <td>{formatDate(result.createdAt)}</td>
                  <td>{result.participantName ?? '이름 없음'}</td>
                  <td>{result.centerName ?? '센터 없음'}</td>
                  <td>{getCareerName(result.topCareer)}</td>
                  <td>{formatDuration(getResultDurationMinutes(result))}</td>
                  <td>{result.resultSummary}</td>
                  <td>
                    <button className="admin-detail-button" type="button" onClick={() => setSelectedResult(result)}>
                      <Eye size={16} />
                      결과 보기
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredResults.length === 0 && <p className="admin-empty">조건에 맞는 결과가 없어요.</p>}
        </div>
      </section>
    </section>
  );
}

function AdminResultDetailDialog({ result, onClose }: { result: StoredTestResultRecord; onClose: () => void }) {
  const answerDetails = result.answers.map(getAnswerDetail);
  const scoreEntries = Object.entries(result.scores).sort((left, right) => Number(right[1]) - Number(left[1]));
  const maxScore = Math.max(...scoreEntries.map(([, score]) => Number(score)), 1);
  const recommendedCareerNames = getRecommendedCareerNames(result);

  return (
    <div className="admin-modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        aria-modal="true"
        className="admin-result-modal"
        role="dialog"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="admin-modal-heading">
          <div>
            <p className="section-kicker">개별 결과</p>
            <h2>{result.participantName ?? '이름 없는 검사'} 결과</h2>
            <p>{result.centerName ?? '센터 없음'} · {formatDate(result.createdAt)}</p>
          </div>
          <button className="icon-button" type="button" onClick={onClose} aria-label="상세 결과 닫기">
            <X size={20} />
          </button>
        </div>

        <div className="admin-detail-meta">
          <div>
            <span>대표 직업</span>
            <strong>{getCareerName(result.topCareer)}</strong>
          </div>
          <div>
            <span>검사 시작</span>
            <strong>{formatDate(result.startedAt)}</strong>
          </div>
          <div>
            <span>검사 완료</span>
            <strong>{formatDate(result.completedAt)}</strong>
          </div>
          <div>
            <span>소요 시간</span>
            <strong>{formatDuration(getResultDurationMinutes(result))}</strong>
          </div>
          <div>
            <span>센터 입력</span>
            <strong>{getSourceLabel(result.centerSource)}</strong>
          </div>
          <div>
            <span>문서 ID</span>
            <strong>{result.id}</strong>
          </div>
        </div>

        <section className="admin-detail-section">
          <h3>결과 요약</h3>
          <p>{result.resultSummary}</p>
          {recommendedCareerNames.length > 0 && (
            <div className="admin-chip-row">
              {recommendedCareerNames.map((careerName) => (
                <span key={careerName}>{careerName}</span>
              ))}
            </div>
          )}
        </section>

        <section className="admin-detail-section">
          <h3>점수</h3>
          <div className="admin-score-bars compact">
            {scoreEntries.map(([scoreKey, score]) => (
              <div key={scoreKey}>
                <span>{scoreLabels[scoreKey] ?? scoreKey}</span>
                <div>
                  <i style={{ width: `${Math.max(6, (Number(score) / maxScore) * 100)}%` }} />
                </div>
                <strong>{Number(score)}</strong>
              </div>
            ))}
          </div>
        </section>

        <section className="admin-detail-section">
          <h3>문항별 답변</h3>
          <div className="admin-answer-list">
            {answerDetails.map((answer, index) => (
              <article key={`${answer.questionEyebrow}-${index}`}>
                <span>{answer.questionEyebrow}</span>
                <strong>{answer.questionText}</strong>
                <p>{answer.optionLabel}</p>
                {answer.helper && <small>{answer.helper}</small>}
              </article>
            ))}
            {answerDetails.length === 0 && <p className="admin-empty">저장된 답변이 없어요.</p>}
          </div>
        </section>
      </section>
    </div>
  );
}

const AdminReportDocument = forwardRef<HTMLDivElement, AdminReportDocumentProps>(function AdminReportDocument(
  { activeCenterLabel, analysis, dateRangeLabel, results, summary },
  ref,
) {
  return (
    <div className="admin-report-print" ref={ref} aria-hidden="true">
      <div className="admin-report-page">
        <p className="admin-report-kicker">WEKID 직업탐험</p>
        <h1>WEKID 직업탐험 관리자 분석 보고서</h1>
        <p className="admin-report-meta">
          {activeCenterLabel} · {dateRangeLabel} · 생성일 {new Date().toLocaleDateString('ko-KR')}
        </p>
        <div className="admin-report-filter-summary">
          <span>적용 센터 필터: {activeCenterLabel}</span>
          <span>적용 날짜 필터: {dateRangeLabel}</span>
        </div>

        <div className="admin-report-stats">
          <div>
            <span>검사 수</span>
            <strong>{summary.totalCount}</strong>
          </div>
          <div>
            <span>최근 7일</span>
            <strong>{summary.recentCount}</strong>
          </div>
          <div>
            <span>평균 소요</span>
            <strong>{formatDuration(analysis.averageDurationMinutes)}</strong>
          </div>
          <div>
            <span>센터 수</span>
            <strong>{summary.byCenter.length}</strong>
          </div>
        </div>

        <section>
          <h2>핵심 분석</h2>
          <ul>
            <li>가장 많은 센터: {analysis.topCenter ? `${analysis.topCenter.centerName} (${analysis.topCenter.count}건)` : '데이터 없음'}</li>
            <li>가장 많은 대표 직업: {analysis.topCareer ? `${analysis.topCareer.careerName} (${analysis.topCareer.count}건)` : '데이터 없음'}</li>
            <li>평균 답변 수: {formatAverage(analysis.averageAnsweredCount)}개</li>
          </ul>
        </section>

        <div className="admin-report-grid">
          <section>
            <h2>센터별 검사 수</h2>
            {summary.byCenter.slice(0, 8).map((center) => (
              <div className="admin-report-row" key={center.centerKey}>
                <span>{center.centerName}</span>
                <strong>{center.count}</strong>
              </div>
            ))}
          </section>
          <section>
            <h2>대표 직업 분포</h2>
            {summary.byTopCareer.slice(0, 8).map((career) => (
              <div className="admin-report-row" key={career.careerName}>
                <span>{career.careerName}</span>
                <strong>{career.count}</strong>
              </div>
            ))}
          </section>
        </div>

        <section>
          <h2>최근 결과</h2>
          <table>
            <thead>
              <tr>
                <th>저장일</th>
                <th>이름</th>
                <th>센터</th>
                <th>대표 직업</th>
              </tr>
            </thead>
            <tbody>
              {results.slice(0, 12).map((result) => (
                <tr key={result.id}>
                  <td>{formatDateShort(result.createdAt)}</td>
                  <td>{result.participantName ?? '이름 없음'}</td>
                  <td>{result.centerName ?? '센터 없음'}</td>
                  <td>{getCareerName(result.topCareer)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    </div>
  );
});
