import { onAuthStateChanged, signInWithEmailAndPassword, signOut, type User } from 'firebase/auth';
import { Download, Lock, RefreshCw } from 'lucide-react';
import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { auth } from '../../lib/firebase';
import { getAdminProfile, isOwnerAdmin } from '../../lib/adminAuth';
import { createAdminResultSummary, fetchAdminResults, filterResults, toResultsCsv } from '../../lib/adminResults';
import type { AdminProfile, StoredTestResultRecord } from '../../types/firestore';

type AdminStatus =
  | { status: 'firebase-missing' }
  | { status: 'signed-out' }
  | { status: 'checking' }
  | { status: 'denied'; message: string }
  | { status: 'ready'; admin: AdminProfile };

function getCareerName(topCareer: StoredTestResultRecord['topCareer']) {
  if (typeof topCareer === 'string') {
    return topCareer;
  }

  return typeof topCareer.name === 'string' ? topCareer.name : '알 수 없음';
}

function formatDate(value: StoredTestResultRecord['createdAt']) {
  if (!value) {
    return '-';
  }

  const date = value instanceof Date ? value : 'toDate' in value ? value.toDate() : null;
  return date ? date.toLocaleString('ko-KR') : '-';
}

function downloadCsv(results: StoredTestResultRecord[]) {
  const blob = new Blob([toResultsCsv(results)], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `wekid-results-${new Date().toISOString().slice(0, 10)}.csv`;
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
  const [resultsError, setResultsError] = useState('');
  const [results, setResults] = useState<StoredTestResultRecord[]>([]);
  const [centerFilter, setCenterFilter] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

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
  const allCenters = useMemo(() => createAdminResultSummary(results).byCenter, [results]);

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
      <div className="admin-dashboard-heading">
        <div>
          <p className="section-kicker">관리자 대시보드</p>
          <h1>검사 결과 모아보기</h1>
          <p>{adminStatus.admin.email} 계정으로 로그인 중이에요.</p>
        </div>
        <div className="admin-actions">
          <button className="ghost-button" type="button" onClick={loadResults} disabled={isLoadingResults}>
            <RefreshCw size={17} />
            새로고침
          </button>
          <button className="ghost-button" type="button" onClick={() => downloadCsv(filteredResults)}>
            <Download size={17} />
            CSV
          </button>
          <button className="ghost-button" type="button" onClick={() => auth && void signOut(auth)}>
            로그아웃
          </button>
        </div>
      </div>

      <div className="admin-stats-grid">
        <article className="admin-stat-card">
          <span>전체 검사</span>
          <strong>{summary.totalCount}</strong>
        </article>
        <article className="admin-stat-card">
          <span>최근 7일</span>
          <strong>{summary.recentCount}</strong>
        </article>
        <article className="admin-stat-card">
          <span>센터 수</span>
          <strong>{summary.byCenter.length}</strong>
        </article>
      </div>

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
      </div>

      {resultsError && <p className="admin-message warning">{resultsError}</p>}

      <div className="admin-grid">
        <section className="admin-card">
          <h2>센터별 검사 수</h2>
          <div className="admin-rank-list">
            {summary.byCenter.map((center) => (
              <div key={center.centerKey}>
                <span>{center.centerName}</span>
                <strong>{center.count}</strong>
              </div>
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
        <h2>개별 검사 결과</h2>
        <div className="admin-table-wrap">
          <table>
            <thead>
              <tr>
                <th>저장일</th>
                <th>이름</th>
                <th>센터</th>
                <th>대표 직업</th>
                <th>요약</th>
              </tr>
            </thead>
            <tbody>
              {filteredResults.map((result) => (
                <tr key={result.id}>
                  <td>{formatDate(result.createdAt)}</td>
                  <td>{result.participantName ?? '이름 없음'}</td>
                  <td>{result.centerName ?? '센터 없음'}</td>
                  <td>{getCareerName(result.topCareer)}</td>
                  <td>{result.resultSummary}</td>
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
