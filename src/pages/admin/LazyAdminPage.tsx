import { lazy, Suspense } from 'react';

const AdminPage = lazy(async () => {
  const module = await import('./AdminPage');
  return { default: module.AdminPage };
});

function AdminLoadingFallback() {
  return (
    <section className="admin-page admin-loading" aria-busy="true" aria-live="polite">
      <div className="admin-card compact">
        <p className="section-kicker">관리자</p>
        <h1>관리자 화면 준비 중</h1>
      </div>
    </section>
  );
}

export function LazyAdminPage() {
  return (
    <Suspense fallback={<AdminLoadingFallback />}>
      <AdminPage />
    </Suspense>
  );
}
