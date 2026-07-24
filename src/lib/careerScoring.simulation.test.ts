import { describe, expect, it } from 'vitest';
import { careerCatalog } from '../data/careerCatalog';
import { careerFieldById } from '../data/careerFields';
import { careerQuestionsV2 } from '../data/questionsV2';
import type { ActivityTag, CareerAnswerMap, CareerQuestionOption, WorkStyleTag } from '../types/career';
import { getCareerResultV2, getCareerScoresV2 } from './careerScoring';

const dot = <Tag extends string>(
  left: Partial<Record<Tag, number>> | undefined,
  right: Partial<Record<Tag, number>> | undefined,
) => Object.entries(left ?? {}).reduce((sum, [key, value]) => sum + Number(value) * Number(right?.[key as Tag] ?? 0), 0);

function scenarioForCareer(career: typeof careerCatalog[number]): CareerAnswerMap {
  const field = careerFieldById[career.primaryField];
  return Object.fromEntries(careerQuestionsV2.map((question) => {
    const score = (option: CareerQuestionOption) =>
      dot<ActivityTag>(option.activityTags, field.activityTags) * 0.2 +
      dot<ActivityTag>(option.activityTags, career.activityTags) * 0.6 +
      dot<WorkStyleTag>(option.workStyleTags, career.workStyleTags) * 0.2;
    return [question.id, score(question.options[0]) >= score(question.options[1]) ? 'A' : 'B'];
  })) as CareerAnswerMap;
}

function seededAnswers(seed: number): CareerAnswerMap {
  let state = seed >>> 0;
  const next = () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0x1_0000_0000;
  };
  return Object.fromEntries(careerQuestionsV2.map((question) => [question.id, next() < 0.5 ? 'A' : 'B'])) as CareerAnswerMap;
}

function recommendationMargin(career: typeof careerCatalog[number], answers: CareerAnswerMap) {
  const fieldScores = getCareerScoresV2(answers).careerScores
    .filter((scored) => scored.primaryField === career.primaryField)
    .sort((left, right) => right.score - left.score);
  const target = fieldScores.find((scored) => scored.name === career.name);
  const cutoff = fieldScores[Math.min(4, fieldScores.length - 1)]?.score ?? 0;
  return (target?.score ?? 0) - cutoff;
}

function optimizeScenarioForCareer(career: typeof careerCatalog[number]) {
  let answers = scenarioForCareer(career);
  for (let round = 0; round < 3; round += 1) {
    let changed = false;
    for (const question of careerQuestionsV2) {
      const aAnswers = { ...answers, [question.id]: 'A' as const };
      const bAnswers = { ...answers, [question.id]: 'B' as const };
      const nextAnswer = recommendationMargin(career, aAnswers) >= recommendationMargin(career, bAnswers) ? 'A' : 'B';
      if (answers[question.id] !== nextAnswer) {
        answers = { ...answers, [question.id]: nextAnswer };
        changed = true;
      }
    }
    if (!changed) {
      break;
    }
  }
  return answers;
}

describe('career scoring distribution safeguards', () => {
  it('keeps every career reachable by its matching scenario', () => {
    const unreachable = careerCatalog.flatMap((career) => {
      const result = getCareerResultV2(scenarioForCareer(career));
      const isRecommended = result.fieldResults
        .find((field) => field.fieldId === career.primaryField)
        ?.recommendedCareers.some((recommended) => recommended.name === career.name);
      if (isRecommended) {
        return [];
      }

      const optimizedResult = getCareerResultV2(optimizeScenarioForCareer(career));
      const isReachable = optimizedResult.fieldResults
        .find((field) => field.fieldId === career.primaryField)
        ?.recommendedCareers.some((recommended) => recommended.name === career.name);
      if (isReachable) {
        return [];
      }

      const ranking = getCareerScoresV2(optimizeScenarioForCareer(career)).careerScores
        .filter((scored) => scored.primaryField === career.primaryField)
        .sort((left, right) => right.score - left.score)
        .findIndex((scored) => scored.name === career.name) + 1;
      return [`${career.name} (${ranking}위)`];
    });
    expect(unreachable).toEqual([]);
  });

  it('exposes all eight fields in deterministic random response scenarios', () => {
    const fields = new Set<string>();
    const careerCounts = new Map(careerCatalog.map((career) => [career.name, 0]));
    const simulationCount = Number(process.env.CAREER_SIMULATION_COUNT ?? 400);
    for (let seed = 1; seed <= simulationCount; seed += 1) {
      const result = getCareerResultV2(seededAnswers(seed));
      result.recommendedFieldResults.forEach((field) => {
        fields.add(field.fieldId);
        field.recommendedCareers.forEach((career) => careerCounts.set(career.name, (careerCounts.get(career.name) ?? 0) + 1));
      });
    }

    expect(fields.size).toBe(8);
    if (simulationCount >= 100_000) {
      const unseen = Array.from(careerCounts.entries())
        .filter(([, count]) => count === 0)
        .map(([name]) => name);
      console.info(`100,000회 무작위 응답: 추천 직업 ${careerCounts.size - unseen.length}/${careerCatalog.length}개 노출`);
      if (unseen.length > 0) {
        console.info(`무작위 노출 0회 직업(개별 도달 시나리오로 검증됨): ${unseen.join(', ')}`);
      }
    }
  }, 240_000);
});
