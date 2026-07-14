import type { LucideIcon } from 'lucide-react';

export type EnergyKey = 'together' | 'focus';
export type InfoKey = 'observe' | 'imagine';
export type DecisionKey = 'solve' | 'care';
export type PaceKey = 'plan' | 'flex';
export type InterestKey =
  | 'realistic'
  | 'investigative'
  | 'artistic'
  | 'social'
  | 'enterprising'
  | 'conventional';
export type ExplorationAxis = 'energy' | 'information' | 'decision' | 'pace';
export type QuestionAxis = ExplorationAxis | 'interest';
export type StyleKey = EnergyKey | InfoKey | DecisionKey | PaceKey;
export type ChoiceKey = StyleKey | InterestKey;
export type NeutralAnswerKey = 'uncertain' | 'neither';
export type AnswerChoice = ChoiceKey | NeutralAnswerKey;
export type AnswerMap = Record<number, AnswerChoice>;
export type ScoreMap = Record<ChoiceKey, number>;

export type Question = {
  id: number;
  kind: 'interest' | 'style';
  axis: QuestionAxis;
  eyebrow: string;
  text: string;
  options: [
    { label: string; choice: ChoiceKey; helper: string },
    { label: string; choice: ChoiceKey; helper: string },
  ];
};

export type CareerRecommendation = {
  name: string;
  reason: string;
  fitTags: string[];
};

export type CareerProfile = {
  headline: string;
  summary: string;
  topCareer: CareerRecommendation;
  recommendations: CareerRecommendation[];
  strengths: string[];
  missions: string[];
  interestHighlights?: string[];
  categoryRecommendations: CategoryRecommendationGroup[];
};

export type CategoryRecommendationGroup = {
  category: string;
  score: number;
  careers: ScoredCareer[];
};

export type CareerFit = {
  name: string;
  interestFit: Partial<Record<InterestKey, number>>;
  styleFit: Record<ExplorationAxis, StyleKey>;
  reasonTemplate: string;
  fitTags: string[];
  missions: string[];
};

export type ScoredCareer = CareerRecommendation & {
  score: number;
};

export type CareerCategory = {
  title: string;
  accent: string;
  icon: LucideIcon;
  careers: string[];
};

export type CareerDetail = {
  name: string;
  emoji: string;
  tagline: string;
  description: string;
  fitReason?: string;
  dailyTasks: string[];
  workPlaces?: string[];
  skills: string[];
  schoolActivities?: string[];
  growthSteps?: string[];
  funFact: string;
};

export type AxisLabels = Record<
  ExplorationAxis,
  { left: ChoiceKey; right: ChoiceKey; title: string; leftLabel: string; rightLabel: string }
>;

export type CareerMatches = {
  primary: CareerRecommendation[];
  explore: CareerRecommendation[];
};
