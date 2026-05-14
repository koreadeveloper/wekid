import type { LucideIcon } from 'lucide-react';

export type EnergyKey = 'together' | 'focus';
export type InfoKey = 'observe' | 'imagine';
export type DecisionKey = 'solve' | 'care';
export type PaceKey = 'plan' | 'flex';
export type ExplorationAxis = 'energy' | 'information' | 'decision' | 'pace';
export type ChoiceKey = EnergyKey | InfoKey | DecisionKey | PaceKey;
export type CareerPattern = `${EnergyKey}_${InfoKey}_${DecisionKey}_${PaceKey}`;
export type AnswerMap = Record<number, ChoiceKey>;
export type ScoreMap = Record<ChoiceKey, number>;

export type Question = {
  id: number;
  axis: ExplorationAxis;
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
};

export type CareerCategory = {
  title: string;
  accent: string;
  icon: LucideIcon;
  careers: string[];
};

export type AxisLabels = Record<
  ExplorationAxis,
  { left: ChoiceKey; right: ChoiceKey; title: string; leftLabel: string; rightLabel: string }
>;

export type CareerMatches = {
  primary: CareerRecommendation[];
  explore: CareerRecommendation[];
};
