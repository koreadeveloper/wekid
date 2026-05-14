import { careerProfiles } from '../data/careerProfiles';
import type {
  AnswerMap,
  CareerMatches,
  CareerPattern,
  CareerProfile,
  ChoiceKey,
  DecisionKey,
  EnergyKey,
  InfoKey,
  PaceKey,
  ScoreMap,
} from '../types/career';

export const initialScores: ScoreMap = {
  together: 0,
  focus: 0,
  observe: 0,
  imagine: 0,
  solve: 0,
  care: 0,
  plan: 0,
  flex: 0,
};

const swapChoice = (choice: ChoiceKey): ChoiceKey => {
  const swaps: Record<ChoiceKey, ChoiceKey> = {
    together: 'focus',
    focus: 'together',
    observe: 'imagine',
    imagine: 'observe',
    solve: 'care',
    care: 'solve',
    plan: 'flex',
    flex: 'plan',
  };

  return swaps[choice];
};

const dedupeRecommendations = (recommendations: CareerMatches['primary']) => {
  const seen = new Set<string>();
  return recommendations.filter((career) => {
    if (seen.has(career.name)) {
      return false;
    }

    seen.add(career.name);
    return true;
  });
};

export function getScores(answers: AnswerMap) {
  const scores: ScoreMap = { ...initialScores };

  Object.values(answers).forEach((choice) => {
    scores[choice] += 1;
  });

  return scores;
}

export function getCareerPattern(scores: ScoreMap): CareerPattern {
  const energy: EnergyKey = scores.together >= scores.focus ? 'together' : 'focus';
  const information: InfoKey = scores.observe >= scores.imagine ? 'observe' : 'imagine';
  const decision: DecisionKey = scores.solve >= scores.care ? 'solve' : 'care';
  const pace: PaceKey = scores.plan >= scores.flex ? 'plan' : 'flex';

  return `${energy}_${information}_${decision}_${pace}`;
}

export function getNeighborPatterns(pattern: CareerPattern) {
  const parts = pattern.split('_') as [EnergyKey, InfoKey, DecisionKey, PaceKey];

  return parts.map((part, index) => {
    const next = [...parts] as [ChoiceKey, ChoiceKey, ChoiceKey, ChoiceKey];
    next[index] = swapChoice(part);
    return next.join('_') as CareerPattern;
  });
}

export function getCareerMatches(pattern: CareerPattern, profile: CareerProfile): CareerMatches {
  const neighborCareers = getNeighborPatterns(pattern).flatMap((neighbor) => {
    const neighborProfile = careerProfiles[neighbor];
    if (!neighborProfile) {
      return [];
    }

    return [neighborProfile.topCareer, ...neighborProfile.recommendations.slice(0, 2)];
  });
  const explore = dedupeRecommendations([profile.topCareer, ...profile.recommendations, ...neighborCareers]).filter(
    (career) => career.name !== profile.topCareer.name,
  );

  return {
    primary: profile.recommendations.slice(0, 6),
    explore: explore.slice(6, 24),
  };
}
