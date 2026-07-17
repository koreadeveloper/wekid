import { careerFits } from '../data/careerFits';
import { careerCategories } from '../data/careerCategories';
import { careerCatalog } from '../data/careerCatalog';
import { careerFields } from '../data/careerFields';
import { interestLabels } from '../data/interestLabels';
import { questions } from '../data/questions';
import { careerQuestionsV2 } from '../data/questionsV2';
import type {
  ActivityTag,
  AnswerMap,
  CareerAnswerMap,
  CareerFieldResult,
  CareerMatches,
  CareerProfile,
  CareerQuestionOption,
  CareerQuestionV2,
  CareerResultV2,
  ExplorationAxis,
  InterestKey,
  ScoreMap,
  ScoredCareer,
  ScoredCareerV2,
  StyleKey,
  WorkStyleTag,
  CategoryRecommendationGroup,
} from '../types/career';

export const interestKeys: InterestKey[] = [
  'realistic',
  'investigative',
  'artistic',
  'social',
  'enterprising',
  'conventional',
];

export const styleAxes: Record<ExplorationAxis, [StyleKey, StyleKey]> = {
  energy: ['together', 'focus'],
  information: ['observe', 'imagine'],
  decision: ['solve', 'care'],
  pace: ['plan', 'flex'],
};

export const initialScores: ScoreMap = {
  together: 0,
  focus: 0,
  observe: 0,
  imagine: 0,
  solve: 0,
  care: 0,
  plan: 0,
  flex: 0,
  realistic: 0,
  investigative: 0,
  artistic: 0,
  social: 0,
  enterprising: 0,
  conventional: 0,
};

const scoreCeilings = questions.reduce<ScoreMap>((ceilings, question) => {
  question.options.forEach(({ choice }) => {
    ceilings[choice] += 1;
  });

  return ceilings;
}, { ...initialScores });

const styleStrengths: Record<StyleKey, string> = {
  together: '함께 움직이기',
  focus: '혼자 깊게 집중하기',
  observe: '실제로 보고 확인하기',
  imagine: '상상하고 연결하기',
  solve: '근거로 문제 해결하기',
  care: '마음을 살피며 돕기',
  plan: '계획대로 완성하기',
  flex: '상황에 맞게 바꾸기',
};

const unique = (items: string[]) => [...new Set(items)].filter(Boolean);

const fallbackCareer: ScoredCareer = {
  name: '진로 탐험가',
  reason: '아직 여러 직업을 넓게 탐색하며 나에게 맞는 활동을 찾아가는 중이에요.',
  fitTags: ['탐색', '경험', '호기심'],
  score: 0,
};

export function getScores(answers: AnswerMap) {
  const scores: ScoreMap = { ...initialScores };

  Object.values(answers).forEach((choice) => {
    if (choice in scores) {
      scores[choice as keyof ScoreMap] += 1;
    }
  });

  return scores;
}

export function getDominantStyles(scores: ScoreMap) {
  return Object.fromEntries(
    Object.entries(styleAxes).map(([axis, [left, right]]) => [
      axis,
      scores[left] >= scores[right] ? left : right,
    ]),
  ) as Record<ExplorationAxis, StyleKey>;
}

const getTopInterests = (scores: ScoreMap) =>
  [...interestKeys].sort((a, b) => scores[b] - scores[a]);

const scoreCareer = (scores: ScoreMap, careerNameOrder: number): ScoredCareer => {
  const career = careerFits[careerNameOrder];
  const interestRaw = Object.entries(career.interestFit).reduce(
    (sum, [interest, weight]) => sum + scores[interest as InterestKey] * (weight ?? 0),
    0,
  );
  const interestMax = Object.entries(career.interestFit).reduce(
    (sum, [interest, weight]) => sum + scoreCeilings[interest as InterestKey] * (weight ?? 0),
    0,
  );
  const styleEntries = Object.values(career.styleFit);
  const styleRaw = styleEntries.reduce((sum, style) => sum + scores[style], 0);
  const styleMax = styleEntries.reduce((sum, style) => sum + scoreCeilings[style], 0);
  const interestScore = interestMax ? interestRaw / interestMax : 0;
  const styleScore = styleMax ? styleRaw / styleMax : 0;
  const score = interestScore * 0.7 + styleScore * 0.3;

  return {
    name: career.name,
    reason: career.reasonTemplate,
    fitTags: career.fitTags,
    score,
  };
};

const scoredCareers = (scores: ScoreMap) =>
  careerFits
    .map((_, index) => scoreCareer(scores, index))
    .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name, 'ko'));

export function getCategoryScores(scores: ScoreMap): Record<string, number> {
  const ranked = scoredCareers(scores);

  return Object.fromEntries(
    careerCategories.map((category) => {
      const categoryScores = ranked
        .filter((career) => category.careers.includes(career.name))
        .slice(0, 3)
        .map((career) => career.score);
      const normalized = categoryScores.length
        ? categoryScores.reduce((sum, score) => sum + score, 0) / categoryScores.length
        : 0;
      return [category.title, normalized];
    }),
  );
}

export function getCategoryRecommendations(scores: ScoreMap): CategoryRecommendationGroup[] {
  const ranked = scoredCareers(scores);
  const categoryScores = getCategoryScores(scores);

  return careerCategories
    .map((category) => ({
      category: category.title,
      score: categoryScores[category.title] ?? 0,
      careers: ranked
        .filter((career) => category.careers.includes(career.name))
        .slice(0, 2),
    }))
    .sort((a, b) => b.score - a.score || a.category.localeCompare(b.category, 'ko'))
    .slice(0, 3);
}

export function getCareerResult(scores: ScoreMap): { profile: CareerProfile; matches: CareerMatches } {
  const ranked = scoredCareers(scores);
  const topCareer = ranked[0] ?? fallbackCareer;
  const topInterests = getTopInterests(scores);
  const mainInterest = topInterests[0];
  const thirdInterest = topInterests[2];
  const lowDifferentiation = scores[mainInterest] - scores[thirdInterest] <= 1;
  const interestInfo = interestLabels[mainInterest];
  const dominantStyles = getDominantStyles(scores);
  const styleHints = Object.values(dominantStyles).map((style) => styleStrengths[style]);
  const topFit = careerFits.find((career) => career.name === topCareer.name);
  const summary = lowDifferentiation
    ? '아직 여러 분야를 고르게 탐색하는 중이에요. 다양한 경험을 해보며 특히 마음이 오래 머무는 활동을 찾아가면 좋아요.'
    : interestInfo.summary;

  const recommendations = ranked.slice(1, 7);
  const profile: CareerProfile = {
    headline: interestInfo.headline,
    summary,
    topCareer,
    recommendations,
    strengths: unique([...interestInfo.strengths.slice(0, 3), ...styleHints.slice(0, 3), ...topCareer.fitTags]).slice(0, 6),
    missions: unique([...(topFit?.missions ?? []), ...interestInfo.missions]).slice(0, 3),
    interestHighlights: [
      `${interestInfo.label}: ${interestInfo.keywords}`,
      `${interestLabels[topInterests[1]].label}: ${interestLabels[topInterests[1]].keywords}`,
    ],
    categoryRecommendations: getCategoryRecommendations(scores),
  };

  return {
    profile,
    matches: {
      primary: recommendations,
      explore: ranked.slice(7, 25),
    },
  };
}

const SCORE_EPSILON = 0.0000001;

function dot<Tag extends string>(
  left: Partial<Record<Tag, number>> | undefined,
  right: Partial<Record<Tag, number>> | undefined,
) {
  return Object.entries(left ?? {}).reduce(
    (sum, [tag, weight]) => sum + Number(weight ?? 0) * Number(right?.[tag as Tag] ?? 0),
    0,
  );
}

export function normalizedAffinity<Tag extends string>(
  quizQuestions: CareerQuestionV2[],
  answers: CareerAnswerMap,
  profile: Partial<Record<Tag, number>>,
  selector: (option: CareerQuestionOption) => Partial<Record<Tag, number>> | undefined,
) {
  let actual = 0;
  let maximum = 0;

  for (const question of quizQuestions) {
    const answer = answers[question.id];
    if (answer !== 'A' && answer !== 'B') {
      continue;
    }

    const selected = question.options[answer === 'A' ? 0 : 1];
    const score = (option: CareerQuestionOption) => dot(selector(option), profile);
    actual += score(selected);
    maximum += Math.max(...question.options.map(score));
  }

  return maximum === 0 ? 0 : actual / maximum;
}

type AffinityMatrix = Array<{ a: number; b: number; maximum: number }>;

function createAffinityMatrix<Tag extends string>(
  profile: Partial<Record<Tag, number>>,
  selector: (option: CareerQuestionOption) => Partial<Record<Tag, number>> | undefined,
): AffinityMatrix {
  return careerQuestionsV2.map((question) => {
    const a = dot(selector(question.options[0]), profile);
    const b = dot(selector(question.options[1]), profile);
    return { a, b, maximum: Math.max(a, b) };
  });
}

function normalizedMatrixAffinity(matrix: AffinityMatrix, answers: CareerAnswerMap) {
  let actual = 0;
  let maximum = 0;
  for (let index = 0; index < careerQuestionsV2.length; index += 1) {
    const answer = answers[careerQuestionsV2[index].id];
    if (answer !== 'A' && answer !== 'B') {
      continue;
    }

    const scores = matrix[index];
    actual += answer === 'A' ? scores.a : scores.b;
    maximum += scores.maximum;
  }

  return maximum === 0 ? 0 : actual / maximum;
}

const fieldActivityMatrices = new Map(
  careerFields.map((field) => [field.id, createAffinityMatrix<ActivityTag>(field.activityTags, (option) => option.activityTags)]),
);

const careerAffinityMatrices = new Map(
  careerCatalog.map((career) => [
    career.name,
    {
      activity: createAffinityMatrix<ActivityTag>(career.activityTags, (option) => option.activityTags),
      style: createAffinityMatrix<WorkStyleTag>(career.workStyleTags, (option) => option.workStyleTags),
    },
  ]),
);

function scoreBand(score: number): CareerFieldResult['scoreBand'] {
  if (score >= 0.75) {
    return 'very-high';
  }

  if (score >= 0.5) {
    return 'high';
  }

  return 'explore';
}

function evidenceForField(
  answers: CareerAnswerMap,
  profile: Partial<Record<ActivityTag, number>>,
) {
  return careerQuestionsV2
    .flatMap((question) => {
      const answer = answers[question.id];
      if (answer !== 'A' && answer !== 'B') {
        return [];
      }

      const selected = question.options[answer === 'A' ? 0 : 1];
      const contribution = dot(selected.activityTags, profile);
      return contribution > 0 ? [{ contribution, label: selected.label }] : [];
    })
    .sort((left, right) => right.contribution - left.contribution)
    .slice(0, 2)
    .map((item) => item.label);
}

function topWithTies<T extends { score: number }>(items: T[], count: number) {
  if (items.length <= count) {
    return items;
  }

  const cutoff = items[count - 1]?.score ?? 0;
  return items.filter((item) => item.score >= cutoff - SCORE_EPSILON);
}

function scoreCareerV2(
  career: typeof careerCatalog[number],
  primaryFieldAffinity: number,
  answers: CareerAnswerMap,
): ScoredCareerV2 {
  const matrices = careerAffinityMatrices.get(career.name);
  const activityAffinity = normalizedMatrixAffinity(matrices?.activity ?? [], answers);
  const styleAffinity = normalizedMatrixAffinity(matrices?.style ?? [], answers);
  const score = primaryFieldAffinity * 0.65 + activityAffinity * 0.2 + styleAffinity * 0.15;

  return {
    name: career.name,
    score,
    primaryField: career.primaryField,
    secondaryField: career.secondaryField,
    reason: `${career.detail.tagline} 활동과 연결해 탐험해 볼 수 있어요.`,
  };
}

export function getCareerScoresV2(answers: CareerAnswerMap) {
  const fieldAffinities = new Map(
    careerFields.map((field) => [
      field.id,
      normalizedMatrixAffinity(fieldActivityMatrices.get(field.id) ?? [], answers),
    ]),
  );
  const careerScores = careerCatalog.map((career) => scoreCareerV2(career, fieldAffinities.get(career.primaryField) ?? 0, answers));

  return { fieldAffinities, careerScores };
}

export function getCareerResultV2(answers: CareerAnswerMap): CareerResultV2 {
  const { fieldAffinities, careerScores } = getCareerScoresV2(answers);
  const scoredCareersByField = new Map<string, ScoredCareerV2[]>();

  for (const careerScore of careerScores) {
    const scored = scoredCareersByField.get(careerScore.primaryField) ?? [];
    scored.push(careerScore);
    scoredCareersByField.set(careerScore.primaryField, scored);
  }

  const fieldResults = careerFields
    .map((field): CareerFieldResult => {
      const careers = [...(scoredCareersByField.get(field.id) ?? [])].sort((left, right) => right.score - left.score);
      const score = fieldAffinities.get(field.id) ?? 0;
      return {
        fieldId: field.id,
        label: field.label,
        score,
        scoreBand: scoreBand(score),
        evidence: evidenceForField(answers, field.activityTags),
        recommendedCareers: topWithTies(careers, 3),
      };
    })
    .sort((left, right) => right.score - left.score);

  const hasKnownAnswer = Object.values(answers).some((answer) => answer === 'A' || answer === 'B');
  const recommendedFieldResults = hasKnownAnswer ? fieldResults.slice(0, 3) : [];
  const strengths = recommendedFieldResults.map((field) => field.label.split(' — ')[0]);

  return {
    questionnaireVersion: 2,
    fieldResults,
    recommendedFieldResults,
    strengths,
    summary: hasKnownAnswer
      ? '답변 속에서 여러 가지 흥미로운 방향을 찾았어요. 아래 분야와 직업을 차례로 탐험해 보세요.'
      : '아직 마음이 끌리는 활동을 찾는 중이에요. 마음에 드는 직업을 직접 골라 보고, 다음에는 조금 더 답해 보세요.',
  };
}
