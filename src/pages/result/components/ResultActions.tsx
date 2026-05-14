import { ArrowLeft, Wand2 } from 'lucide-react';

type ResultActionsProps = {
  onEditLastAnswer: () => void;
  onReset: () => void;
};

export function ResultActions({ onEditLastAnswer, onReset }: ResultActionsProps) {
  return (
    <div className="result-actions">
      <button className="ghost-button" type="button" onClick={onEditLastAnswer}>
        <ArrowLeft size={18} />
        답변 고치기
      </button>
      <button className="primary-button" type="button" onClick={onReset}>
        <Wand2 size={18} />
        다시 테스트
      </button>
    </div>
  );
}
