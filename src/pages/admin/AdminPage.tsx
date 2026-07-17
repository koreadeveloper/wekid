import { onAuthStateChanged, signInWithEmailAndPassword, signOut, type User } from 'firebase/auth';
import {
  ArrowDown,
  ArrowUp,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Copy,
  Download,
  Eye,
  FileText,
  Lock,
  RefreshCw,
  Search,
  X,
} from 'lucide-react';
import { forwardRef, useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { auth } from '../../lib/firebase';
import { getAdminProfile, isOwnerAdmin } from '../../lib/adminAuth';
import {
  buildAdminExportFileName,
  createAdminResultAnalysis,
  createAdminResultSummary,
  detectSimilarCenterGroups,
  fetchAdminResults,
  filterResults,
  getAdminAnswerDetails,
  getDreamChoiceLabel,
  getRecommendedFieldLabels,
  getRecommendedCareerNames,
  getResultCareerLabel,
  getResultDurationMinutes,
  isV2Result,
  isSuspectedTestResult,
  paginateAdminResults,
  sortAdminResults,
  toAdminDate,
  toResultsCsv,
  type AdminPageSize,
  type AdminSortDirection,
  type AdminSortKey,
  type SimilarCenterGroup,
} from '../../lib/adminResults';
import type { AdminProfile, StoredTestResultRecord } from '../../types/firestore';

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
  filterMemo: string;
  hideTestResults: boolean;
  results: StoredTestResultRecord[];
  searchTerm: string;
  similarCenterGroups: SimilarCenterGroup[];
  sortLabel: string;
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
const interestScoreKeys = new Set(['realistic', 'investigative', 'artistic', 'social', 'enterprising', 'conventional']);
const pageSizeOptions: AdminPageSize[] = [25, 50, 100, 'all'];
const sortLabels: Record<AdminSortKey, string> = {
  centerName: '센터명',
  createdAt: '저장일',
  durationMinutes: '소요 시간',
  participantName: '이름',
  topCareer: '최종 꿈',
};

type AdminUiState = {
  centerFilter: string;
  fromDate: string;
  hideTestResults: boolean;
  pageSize: AdminPageSize;
  searchTerm: string;
  sortDirection: AdminSortDirection;
  sortKey: AdminSortKey;
  toDate: string;
};

const isAdminSortKey = (value: string | null): value is AdminSortKey =>
  value === 'createdAt' ||
  value === 'participantName' ||
  value === 'centerName' ||
  value === 'topCareer' ||
  value === 'durationMinutes';

const isAdminSortDirection = (value: string | null): value is AdminSortDirection => value === 'asc' || value === 'desc';

function parsePageSize(value: string | null): AdminPageSize {
  if (value === 'all') {
    return 'all';
  }

  const parsed = Number(value);
  return parsed === 25 || parsed === 50 || parsed === 100 ? parsed : 25;
}

function readInitialAdminUiState(): AdminUiState {
  if (typeof window === 'undefined') {
    return {
      centerFilter: '',
      fromDate: '',
      hideTestResults: false,
      pageSize: 25,
      searchTerm: '',
      sortDirection: 'desc',
      sortKey: 'createdAt',
      toDate: '',
    };
  }

  const params = new URLSearchParams(window.location.search);
  const sortKey = params.get('adminSort');
  const sortDirection = params.get('adminDir');

  return {
    centerFilter: params.get('adminCenter') ?? '',
    fromDate: params.get('adminFrom') ?? '',
    hideTestResults: params.get('adminHideTest') === '1',
    pageSize: parsePageSize(params.get('adminPageSize')),
    searchTerm: params.get('adminQ') ?? '',
    sortDirection: isAdminSortDirection(sortDirection) ? sortDirection : 'desc',
    sortKey: isAdminSortKey(sortKey) ? sortKey : 'createdAt',
    toDate: params.get('adminTo') ?? '',
  };
}

function syncAdminUiStateToUrl(state: AdminUiState) {
  if (typeof window === 'undefined') {
    return;
  }

  const params = new URLSearchParams(window.location.search);
  const setOrDelete = (key: string, value: string, defaultValue = '') => {
    if (value && value !== defaultValue) {
      params.set(key, value);
      return;
    }

    params.delete(key);
  };

  setOrDelete('adminCenter', state.centerFilter);
  setOrDelete('adminFrom', state.fromDate);
  setOrDelete('adminTo', state.toDate);
  setOrDelete('adminQ', state.searchTerm.trim());
  setOrDelete('adminSort', state.sortKey, 'createdAt');
  setOrDelete('adminDir', state.sortDirection, 'desc');
  setOrDelete('adminPageSize', String(state.pageSize), '25');

  if (state.hideTestResults) {
    params.set('adminHideTest', '1');
  } else {
    params.delete('adminHideTest');
  }

  const query = params.toString();
  const nextUrl = `${window.location.pathname}${query ? `?${query}` : ''}${window.location.hash}`;
  window.history.replaceState(null, '', nextUrl);
}

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

function getLocalDateStamp(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function getSortLabel(sortKey: AdminSortKey, sortDirection: AdminSortDirection) {
  return `${sortLabels[sortKey]} ${sortDirection === 'asc' ? '오름차순' : '내림차순'}`;
}

function createFilterMemo({
  activeCenterLabel,
  dateRangeLabel,
  hideTestResults,
  searchTerm,
  sortLabel,
}: {
  activeCenterLabel: string;
  dateRangeLabel: string;
  hideTestResults: boolean;
  searchTerm: string;
  sortLabel: string;
}) {
  const searchLabel = searchTerm.trim() ? `검색: ${searchTerm.trim()}` : '검색: 없음';
  const testLabel = hideTestResults ? '테스트 의심 결과 제외' : '테스트 의심 결과 포함';

  return `센터: ${activeCenterLabel} / 기간: ${dateRangeLabel} / ${searchLabel} / ${testLabel} / 정렬: ${sortLabel}`;
}

function downloadCsv({
  centerLabel,
  filterMemo,
  hideTestResults,
  results,
  searchTerm,
}: {
  centerLabel: string;
  filterMemo: string;
  hideTestResults: boolean;
  results: StoredTestResultRecord[];
  searchTerm: string;
}) {
  const blob = new Blob([toResultsCsv(results, { filterMemo })], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = buildAdminExportFileName({
    centerLabel,
    dateStamp: getLocalDateStamp(),
    extension: 'csv',
    hideTestResults,
    kind: 'results',
    searchTerm,
  });
  anchor.click();
  URL.revokeObjectURL(url);
}

type AdminPageProps = {
  onOwnerStatusChange?: (isOwner: boolean) => void;
};

export function AdminPage({ onOwnerStatusChange }: AdminPageProps) {
  const initialAdminUiState = useMemo(readInitialAdminUiState, []);
  const [adminStatus, setAdminStatus] = useState<AdminStatus>(auth ? { status: 'checking' } : { status: 'firebase-missing' });
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isLoadingResults, setIsLoadingResults] = useState(false);
  const [isPdfSaving, setIsPdfSaving] = useState(false);
  const [resultsError, setResultsError] = useState('');
  const [results, setResults] = useState<StoredTestResultRecord[]>([]);
  const [centerFilter, setCenterFilter] = useState(initialAdminUiState.centerFilter);
  const [fromDate, setFromDate] = useState(initialAdminUiState.fromDate);
  const [hideTestResults, setHideTestResults] = useState(initialAdminUiState.hideTestResults);
  const [pageSize, setPageSize] = useState<AdminPageSize>(initialAdminUiState.pageSize);
  const [searchTerm, setSearchTerm] = useState(initialAdminUiState.searchTerm);
  const [sortDirection, setSortDirection] = useState<AdminSortDirection>(initialAdminUiState.sortDirection);
  const [sortKey, setSortKey] = useState<AdminSortKey>(initialAdminUiState.sortKey);
  const [toDate, setToDate] = useState(initialAdminUiState.toDate);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedResult, setSelectedResult] = useState<StoredTestResultRecord | null>(null);
  const reportRef = useRef<HTMLDivElement>(null);

  const loadAdmin = async (user: User | null) => {
    if (!user) {
      onOwnerStatusChange?.(false);
      setAdminStatus({ status: 'signed-out' });
      return;
    }

    setAdminStatus({ status: 'checking' });
    const profile = await getAdminProfile(user.uid);

    if (!profile.ok) {
      onOwnerStatusChange?.(false);
      setAdminStatus({ status: 'denied', message: '관리자 문서를 찾을 수 없어요.' });
      return;
    }

    if (!isOwnerAdmin(profile.admin)) {
      onOwnerStatusChange?.(false);
      setAdminStatus({ status: 'denied', message: 'owner 권한이 있는 관리자만 볼 수 있어요.' });
      return;
    }

    setAdminStatus({ status: 'ready', admin: profile.admin });
    onOwnerStatusChange?.(true);
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

  useEffect(() => {
    setCurrentPage(1);
  }, [centerFilter, fromDate, hideTestResults, pageSize, searchTerm, sortDirection, sortKey, toDate]);

  useEffect(() => {
    syncAdminUiStateToUrl({
      centerFilter,
      fromDate,
      hideTestResults,
      pageSize,
      searchTerm,
      sortDirection,
      sortKey,
      toDate,
    });
  }, [centerFilter, fromDate, hideTestResults, pageSize, searchTerm, sortDirection, sortKey, toDate]);

  const filteredResults = useMemo(
    () =>
      filterResults(results, {
        centerKey: centerFilter || undefined,
        fromDate,
        hideTestResults,
        searchTerm,
        toDate,
      }),
    [centerFilter, fromDate, hideTestResults, results, searchTerm, toDate],
  );
  const sortedResults = useMemo(
    () => sortAdminResults(filteredResults, { direction: sortDirection, key: sortKey }),
    [filteredResults, sortDirection, sortKey],
  );
  const paginatedResults = useMemo(
    () => paginateAdminResults(sortedResults, { page: currentPage, pageSize }),
    [currentPage, pageSize, sortedResults],
  );
  const summary = useMemo(() => createAdminResultSummary(filteredResults), [filteredResults]);
  const analysis = useMemo(() => createAdminResultAnalysis(filteredResults), [filteredResults]);
  const allCenters = useMemo(() => createAdminResultSummary(results).byCenter, [results]);
  const similarCenterGroups = useMemo(() => detectSimilarCenterGroups(results), [results]);
  const activeCenterLabel = centerFilter
    ? allCenters.find((center) => center.centerKey === centerFilter)?.centerName ?? '선택 센터'
    : '전체 센터';
  const dateRangeLabel =
    fromDate || toDate ? `${fromDate || '처음'} - ${toDate || '오늘'}` : '전체 기간';
  const topScoreMax = Math.max(...analysis.scoreAverages.slice(0, 8).map((score) => score.average), 1);
  const sortLabel = getSortLabel(sortKey, sortDirection);
  const filterMemo = createFilterMemo({ activeCenterLabel, dateRangeLabel, hideTestResults, searchTerm, sortLabel });
  const visibleStart = paginatedResults.totalResults === 0 || pageSize === 'all' ? 0 : (paginatedResults.currentPage - 1) * Number(pageSize) + 1;
  const visibleEnd =
    pageSize === 'all'
      ? paginatedResults.totalResults
      : Math.min(paginatedResults.currentPage * Number(pageSize), paginatedResults.totalResults);

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

      pdf.save(
        buildAdminExportFileName({
          centerLabel: activeCenterLabel,
          dateStamp: getLocalDateStamp(),
          extension: 'pdf',
          hideTestResults,
          kind: 'report',
          searchTerm,
        }),
      );
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
        filterMemo={filterMemo}
        hideTestResults={hideTestResults}
        results={sortedResults}
        searchTerm={searchTerm}
        similarCenterGroups={similarCenterGroups}
        sortLabel={sortLabel}
        summary={summary}
      />

      <div className="admin-dashboard-heading">
        <div>
          <p className="section-kicker">관리자 대시보드</p>
          <h1>검사 결과 모아보기</h1>
          <p>
            {adminStatus.admin.email} 계정으로 로그인 중이에요. 현재 보기: {activeCenterLabel} · {dateRangeLabel}
            {searchTerm.trim() ? ` · 검색 "${searchTerm.trim()}"` : ''}{hideTestResults ? ' · 테스트 의심 제외' : ''}
          </p>
        </div>
        <div className="admin-actions">
          <button className="ghost-button" type="button" onClick={loadResults} disabled={isLoadingResults}>
            <RefreshCw size={17} />
            새로고침
          </button>
          <button
            className="ghost-button"
            type="button"
            onClick={() =>
              downloadCsv({
                centerLabel: activeCenterLabel,
                filterMemo,
                hideTestResults,
                results: sortedResults,
                searchTerm,
              })
            }
          >
            <Download size={17} />
            필터 전체 CSV
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
        <label className="admin-search-field">
          <span>검색</span>
          <div className="admin-search-box">
            <Search size={17} />
            <input
              type="search"
              value={searchTerm}
              placeholder="이름, 센터, 직업, 요약, 문서 ID"
              onChange={(event) => setSearchTerm(event.target.value)}
            />
            {searchTerm && (
              <button type="button" onClick={() => setSearchTerm('')} aria-label="검색어 지우기">
                <X size={16} />
              </button>
            )}
          </div>
          <small>
            검색/필터 결과 {filteredResults.length}건
            {results.length !== filteredResults.length ? ` · 전체 ${results.length}건 중` : ''}
          </small>
        </label>
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
        <label>
          <span>정렬</span>
          <select value={sortKey} onChange={(event) => setSortKey(event.target.value as AdminSortKey)}>
            <option value="createdAt">저장일</option>
            <option value="participantName">이름</option>
            <option value="centerName">센터명</option>
            <option value="topCareer">최종 꿈</option>
            <option value="durationMinutes">소요 시간</option>
          </select>
        </label>
        <label>
          <span>표시 개수</span>
          <select value={String(pageSize)} onChange={(event) => setPageSize(parsePageSize(event.target.value))}>
            {pageSizeOptions.map((option) => (
              <option key={String(option)} value={String(option)}>
                {option === 'all' ? '전체' : `${option}개`}
              </option>
            ))}
          </select>
        </label>
        <button
          className="ghost-button admin-sort-direction"
          type="button"
          onClick={() => setSortDirection((current) => (current === 'asc' ? 'desc' : 'asc'))}
          aria-label={`현재 ${sortLabel}. 정렬 방향 바꾸기`}
        >
          {sortDirection === 'asc' ? <ArrowUp size={17} /> : <ArrowDown size={17} />}
          {sortDirection === 'asc' ? '오름차순' : '내림차순'}
        </button>
        <label className="admin-checkbox-field">
          <input
            type="checkbox"
            checked={hideTestResults}
            onChange={(event) => setHideTestResults(event.target.checked)}
          />
          <span>테스트 의심 결과 숨기기</span>
        </label>
        <button
          className="ghost-button admin-filter-reset"
          type="button"
          onClick={() => {
            setCenterFilter('');
            setFromDate('');
            setHideTestResults(false);
            setPageSize(25);
            setSearchTerm('');
            setSortDirection('desc');
            setSortKey('createdAt');
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

      <section className="admin-card admin-center-audit-card">
        <div className="admin-card-heading">
          <div>
            <p className="section-kicker">운영 정리</p>
            <h2>센터명 정리 보조</h2>
            <p>공백, 대소문자, 특수문자 차이만 있는 센터명을 감지해요. 실제 데이터는 수정하지 않아요.</p>
          </div>
        </div>
        <div className="admin-similar-center-list">
          {similarCenterGroups.slice(0, 5).map((group) => (
            <article key={group.normalizedKey}>
              <div>
                <strong>{group.normalizedKey}</strong>
                <span>{group.totalCount}건 · {group.variants.length}개 표기</span>
              </div>
              <div className="admin-chip-row">
                {group.variants.map((variant) => (
                  <span key={`${variant.centerKey}-${variant.centerName}`}>
                    {variant.centerName} {variant.count}
                  </span>
                ))}
              </div>
            </article>
          ))}
          {similarCenterGroups.length === 0 && <p className="admin-empty">현재 감지된 유사 센터명 그룹이 없어요.</p>}
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
          <h2>선택한 꿈 분포</h2>
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
            <p>
              {paginatedResults.totalResults === 0
                ? '조건에 맞는 결과가 없어요.'
                : `${visibleStart}-${visibleEnd} / 총 ${paginatedResults.totalResults}건 · CSV/PDF는 현재 필터 전체 기준이에요.`}
            </p>
          </div>
        </div>
        <div className="admin-table-wrap">
          <table>
            <thead>
              <tr>
                <th>저장일</th>
                <th>이름</th>
                <th>센터</th>
                <th>설문</th>
                <th>최종 꿈</th>
                <th>추천 분야</th>
                <th>소요</th>
                <th>요약</th>
                <th>상세</th>
              </tr>
            </thead>
            <tbody>
              {paginatedResults.pageResults.map((result) => (
                <tr key={result.id}>
                  <td>{formatDate(result.createdAt)}</td>
                  <td>
                    <span className="admin-table-primary">{result.participantName ?? '이름 없음'}</span>
                    {isSuspectedTestResult(result) && <span className="admin-test-badge">테스트 의심</span>}
                  </td>
                  <td>{result.centerName ?? '센터 없음'}</td>
                  <td>{isV2Result(result) ? '새 설문' : '기존 설문'}</td>
                  <td>{getResultCareerLabel(result)}</td>
                  <td>{getRecommendedFieldLabels(result) || '-'}</td>
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
        <div className="admin-pagination">
          <p>
            페이지 {paginatedResults.currentPage} / {paginatedResults.totalPages}
          </p>
          <div>
            <button
              className="ghost-button"
              type="button"
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              disabled={paginatedResults.currentPage <= 1}
            >
              <ChevronLeft size={17} />
              이전
            </button>
            <button
              className="ghost-button"
              type="button"
              onClick={() => setCurrentPage((page) => Math.min(paginatedResults.totalPages, page + 1))}
              disabled={paginatedResults.currentPage >= paginatedResults.totalPages}
            >
              다음
              <ChevronRight size={17} />
            </button>
          </div>
        </div>
      </section>
    </section>
  );
}

function AdminResultDetailDialog({ result, onClose }: { result: StoredTestResultRecord; onClose: () => void }) {
  const [areAnswersExpanded, setAreAnswersExpanded] = useState(false);
  const [copyStatus, setCopyStatus] = useState<'idle' | 'success' | 'failed'>('idle');
  const isV2 = isV2Result(result);
  const answerDetails = getAdminAnswerDetails(result);
  const scoreEntries = isV2 ? [] : Object.entries(result.scores).sort((left, right) => Number(right[1]) - Number(left[1]));
  const maxScore = Math.max(...scoreEntries.map(([, score]) => Number(score)), 1);
  const interestScoreEntries = scoreEntries.filter(([scoreKey]) => interestScoreKeys.has(scoreKey));
  const styleScoreEntries = scoreEntries.filter(([scoreKey]) => !interestScoreKeys.has(scoreKey));
  const recommendedCareerNames = isV2
    ? result.recommendedFieldResults.flatMap((field) => field.recommendedCareers.map((career) => career.name))
    : getRecommendedCareerNames(result.recommendedCareers).split(' / ').filter(Boolean);
  const recommendedFields = getRecommendedFieldLabels(result).split(' / ').filter(Boolean);
  const visibleAnswers = isV2 || areAnswersExpanded ? answerDetails : answerDetails.slice(0, 8);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const copySummary = async () => {
    const text = [
      `이름: ${result.participantName ?? '이름 없음'}`,
      `이메일: ${result.participantEmail ?? '-'}`,
      `센터: ${result.centerName ?? '센터 없음'}`,
      `설문: ${isV2 ? '새 설문 (v2)' : '기존 설문 (v1)'}`,
      `최종 꿈: ${getResultCareerLabel(result)}`,
      `추천 분야: ${recommendedFields.join(', ') || '-'}`,
      `추천 직업: ${recommendedCareerNames.join(', ') || '-'}`,
      `요약: ${result.resultSummary}`,
    ].join('\n');

    try {
      await navigator.clipboard.writeText(text);
      setCopyStatus('success');
    } catch {
      setCopyStatus('failed');
    }
  };

  return (
    <div className="admin-modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        aria-modal="true"
        aria-labelledby="admin-result-detail-title"
        className="admin-result-modal"
        role="dialog"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="admin-modal-heading">
          <div>
            <p className="section-kicker">개별 결과</p>
            <h2 id="admin-result-detail-title">{result.participantName ?? '이름 없는 검사'} 결과</h2>
            <p>{result.centerName ?? '센터 없음'} · {formatDate(result.createdAt)}</p>
          </div>
          <button className="icon-button" type="button" onClick={onClose} aria-label="상세 결과 닫기">
            <X size={20} />
          </button>
        </div>

        <div className="admin-detail-meta">
          <div>
            <span>최종 꿈</span>
            <strong>{getResultCareerLabel(result)}</strong>
          </div>
          <div>
            <span>설문 버전</span>
            <strong>{isV2 ? '새 설문 v2' : '기존 설문 v1'}</strong>
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
          <div className="admin-detail-section-heading">
            <h3>학생용 결과 요약</h3>
            <button className="admin-detail-button" type="button" onClick={copySummary}>
              <Copy size={15} />
              요약 복사
            </button>
          </div>
          <p>{result.resultSummary}</p>
          <div className="admin-chip-row">
            <span className="strong">{getResultCareerLabel(result)}</span>
          </div>
          {recommendedFields.length > 0 && (
            <div className="admin-chip-row">
              {recommendedFields.map((fieldLabel) => <span key={fieldLabel}>{fieldLabel}</span>)}
            </div>
          )}
          {recommendedCareerNames.length > 0 && (
            <div className="admin-chip-row">
              {recommendedCareerNames.map((careerName) => (
                <span key={careerName}>{careerName}</span>
              ))}
            </div>
          )}
          {copyStatus === 'success' && <p className="admin-copy-status">요약을 복사했어요.</p>}
          {copyStatus === 'failed' && <p className="admin-copy-status warning">복사하지 못했어요. 브라우저 권한을 확인해주세요.</p>}
        </section>

        {!isV2 && (
          <section className="admin-detail-section">
            <h3>기존 설문 점수</h3>
            <div className="admin-score-groups">
              <ScoreGroup title="관심 유형" entries={interestScoreEntries} maxScore={maxScore} />
              <ScoreGroup title="스타일 유형" entries={styleScoreEntries} maxScore={maxScore} />
            </div>
          </section>
        )}

        <section className="admin-detail-section">
          <div className="admin-detail-section-heading">
            <h3>문항별 답변</h3>
            {!isV2 && answerDetails.length > 8 && (
              <button className="admin-text-button" type="button" onClick={() => setAreAnswersExpanded((current) => !current)}>
                {areAnswersExpanded ? '접기' : `전체 ${answerDetails.length}개 보기`}
              </button>
            )}
          </div>
          <div className="admin-answer-list">
            {visibleAnswers.map((answer, index) => (
              <article key={`${answer.questionEyebrow}-${index}`}>
                <span>{answer.questionEyebrow}{isV2 ? ' · v2' : ''}</span>
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

function ScoreGroup({ entries, maxScore, title }: { entries: Array<[string, number]>; maxScore: number; title: string }) {
  return (
    <div className="admin-score-group">
      <h4>{title}</h4>
      <div className="admin-score-bars compact">
        {entries.map(([scoreKey, score]) => (
          <div key={scoreKey}>
            <span>{scoreLabels[scoreKey] ?? scoreKey}</span>
            <div>
              <i style={{ width: `${Math.max(6, (Number(score) / maxScore) * 100)}%` }} />
            </div>
            <strong>{Number(score)}</strong>
          </div>
        ))}
        {entries.length === 0 && <p className="admin-empty">점수 데이터가 없어요.</p>}
      </div>
    </div>
  );
}

const AdminReportDocument = forwardRef<HTMLDivElement, AdminReportDocumentProps>(function AdminReportDocument(
  { activeCenterLabel, analysis, dateRangeLabel, filterMemo, hideTestResults, results, searchTerm, similarCenterGroups, sortLabel, summary },
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
          <span>검색어: {searchTerm.trim() || '없음'}</span>
          <span>테스트 의심 결과: {hideTestResults ? '제외' : '포함'}</span>
          <span>정렬: {sortLabel}</span>
          <span>{filterMemo}</span>
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
            <li>가장 많이 선택한 꿈: {analysis.topCareer ? `${analysis.topCareer.careerName} (${analysis.topCareer.count}건)` : '데이터 없음'}</li>
            <li>평균 답변 수: {formatAverage(analysis.averageAnsweredCount)}개</li>
            <li>
              상위 점수 평균:{' '}
              {analysis.scoreAverages.length > 0
                ? analysis.scoreAverages
                    .slice(0, 3)
                    .map((score) => `${scoreLabels[score.scoreKey] ?? score.scoreKey} ${score.average.toFixed(1)}`)
                    .join(', ')
                : '데이터 없음'}
            </li>
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
            <h2>선택한 꿈 분포</h2>
            {summary.byTopCareer.slice(0, 8).map((career) => (
              <div className="admin-report-row" key={career.careerName}>
                <span>{career.careerName}</span>
                <strong>{career.count}</strong>
              </div>
            ))}
          </section>
        </div>

        <section>
          <h2>센터명 유사 그룹</h2>
          {similarCenterGroups.slice(0, 5).map((group) => (
            <div className="admin-report-row" key={group.normalizedKey}>
              <span>
                {group.variants.map((variant) => `${variant.centerName} ${variant.count}건`).join(' / ')}
              </span>
              <strong>{group.totalCount}</strong>
            </div>
          ))}
          {similarCenterGroups.length === 0 && <p>감지된 유사 센터명 그룹이 없습니다.</p>}
        </section>

        <section>
          <h2>최근 결과</h2>
          <table>
            <thead>
              <tr>
                <th>저장일</th>
                <th>이름</th>
                <th>센터</th>
                <th>최종 꿈</th>
              </tr>
            </thead>
            <tbody>
              {results.slice(0, 12).map((result) => (
                <tr key={result.id}>
                  <td>{formatDateShort(result.createdAt)}</td>
                  <td>{result.participantName ?? '이름 없음'}</td>
                  <td>{result.centerName ?? '센터 없음'}</td>
                  <td>{getResultCareerLabel(result)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <p className="admin-report-footnote">
          본 보고서는 WEKID 관리자 페이지에서 생성된 요약 자료입니다. 개인정보가 포함될 수 있으므로 외부 공유에 주의하세요.
        </p>
      </div>
    </div>
  );
});
