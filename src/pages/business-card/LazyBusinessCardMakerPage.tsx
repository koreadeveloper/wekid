import { lazy, Suspense } from 'react';
import type { BusinessCardMakerPageProps } from './BusinessCardMakerPage';

const BusinessCardMakerPage = lazy(async () => {
  const module = await import('./BusinessCardMakerPage');
  return { default: module.BusinessCardMakerPage };
});

function BusinessCardLoadingFallback() {
  return (
    <section className="business-card-loading" aria-busy="true" aria-live="polite">
      <p className="section-kicker">꿈 명함</p>
      <h1>명함 화면 준비 중</h1>
    </section>
  );
}

export function LazyBusinessCardMakerPage(props: BusinessCardMakerPageProps) {
  return (
    <Suspense fallback={<BusinessCardLoadingFallback />}>
      <BusinessCardMakerPage {...props} />
    </Suspense>
  );
}
