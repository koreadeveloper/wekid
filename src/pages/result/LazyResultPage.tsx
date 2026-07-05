import { lazy, Suspense } from 'react';
import type { ResultPageProps } from './ResultPage';

const ResultPage = lazy(async () => {
  const module = await import('./ResultPage');
  return { default: module.ResultPage };
});

function ResultLoadingFallback() {
  return (
    <section className="result-loading" aria-busy="true" aria-live="polite">
      <p className="section-kicker">추천 결과</p>
      <h1>결과 화면 준비 중</h1>
    </section>
  );
}

export function LazyResultPage(props: ResultPageProps) {
  return (
    <Suspense fallback={<ResultLoadingFallback />}>
      <ResultPage {...props} />
    </Suspense>
  );
}
