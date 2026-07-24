import { careerQuestionsV2 } from '../data/questionsV2';
import type { CareerAnswerMap, CareerAnswerSnapshot } from '../types/career';

export function createAnswerSnapshots(answers: CareerAnswerMap): CareerAnswerSnapshot[] {
  return careerQuestionsV2.flatMap((question) => {
    const choice = answers[question.id];
    if (!choice) {
      return [];
    }

    const option = question.options.find((candidate) => candidate.id === choice);
    return [{
      questionId: question.id,
      questionText: question.text,
      choice,
      optionLabel: option?.label ?? '아직 잘 모르겠어요',
    }];
  });
}
