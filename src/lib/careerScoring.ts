import { careerFits } from '../data/careerFits';
import { interestLabels } from '../data/interestLabels';
import type {
  AnswerMap,
  CareerMatches,
  CareerProfile,
  ChoiceKey,
  ExplorationAxis,
  InterestKey,
  ScoreMap,
  ScoredCareer,
  StyleKey,
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

export function getScores(answers: AnswerMap) {
  const scores: ScoreMap = { ...initialScores };

  Object.values(answers).forEach((choice) => {
    scores[choice] += 1;
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
  const interestWeightTotal = Object.values(career.interestFit).reduce((sum, weight) => sum + (weight ?? 0), 0);
  const interestRaw = Object.entries(career.interestFit).reduce(
    (sum, [interest, weight]) => sum + scores[interest as ChoiceKey] * (weight ?? 0),
    0,
  );
  const interestScore = interestWeightTotal ? interestRaw / (6 * interestWeightTotal) : 0;
  const styleScore =
    Object.values(career.styleFit).reduce((sum, style) => sum + scores[style], 0) / (Object.keys(styleAxes).length * 3);
  const score = interestScore * 0.7 + styleScore * 0.3;

  return {
    name: career.name,
    reason: career.reasonTemplate,
    fitTags: career.fitTags,
    score,
  };
};

export function getCareerResult(scores: ScoreMap): { profile: CareerProfile; matches: CareerMatches } {
  const ranked = careerFits
    .map((_, index) => scoreCareer(scores, index))
    .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name, 'ko'));
  const topCareer = ranked[0];
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
  };

  return {
    profile,
    matches: {
      primary: recommendations,
      explore: ranked.slice(7, 25),
    },
  };
}
