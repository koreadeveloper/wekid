import { ArrowLeft, Wand2 } from 'lucide-react';
import { ResetConfirmButton } from '../../../components/layout/ResetConfirmButton';

type ResultActionsProps = {
  onEditLastAnswer: () => void;
  onReset: () => void;
};

export function ResultActions({ onEditLastAnswer, onReset }: ResultActionsProps) {
  return (
    <div className="result-actions">
      <button className="ghost-button" type="button" onClick={onEditLastAnswer}>
        <ArrowLeft size={18} />
        마지막 답변 고치기
      </button>
      <ResetConfirmButton className="primary-button" onConfirm={onReset}>
        <Wand2 size={18} />
        다시 검사하기
      </ResetConfirmButton>
    </div>
  );
}
