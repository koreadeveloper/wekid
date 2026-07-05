import { lazy, Suspense } from 'react';
import type { CareerDetail } from '../../../types/career';

const CareerDetailModal = lazy(async () => {
  const module = await import('./CareerDetailModal');
  return { default: module.CareerDetailModal };
});

type LazyCareerDetailModalProps = {
  detail: CareerDetail;
  onClose: () => void;
};

export function LazyCareerDetailModal(props: LazyCareerDetailModalProps) {
  return (
    <Suspense fallback={null}>
      <CareerDetailModal {...props} />
    </Suspense>
  );
}
