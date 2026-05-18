import { ArrowLeft, Compass, Wand2 } from 'lucide-react';

type EmptyResultProps = {
  onEditLastAnswer: () => void;
  onReset: () => void;
};

export function EmptyResult({ onEditLastAnswer, onReset }: EmptyResultProps) {
  return (
    <section className="result-layout">
      <section className="empty-result-panel" role="status" aria-live="polite">
        <div className="empty-result-icon">
          <Compass size={42} />
        </div>
        <p className="section-kicker">결과를 찾지 못했어요</p>
        <h1>이번 답변에 딱 맞는 직업 결과가 아직 없어요</h1>
        <p>
          선택이 잘못된 것은 아니에요. 아직 이 조합에 맞는 추천 직업 카드가 준비되지 않았어요. 답변을 조금
          바꿔보거나 처음부터 다시 테스트하면 다른 직업 결과를 확인할 수 있어요.
        </p>
        <div className="empty-result-actions">
          <button className="ghost-button" type="button" onClick={onEditLastAnswer}>
            <ArrowLeft size={18} />
            답변 고치기
          </button>
          <button className="primary-button" type="button" onClick={onReset}>
            <Wand2 size={18} />
            다시 테스트
          </button>
        </div>
      </section>
    </section>
  );
}
