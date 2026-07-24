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
export type FocusHandoffOptions = {
  readonly focusNextSurface?: boolean;
};

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

export type CareerFieldId =
  | 'research'
  | 'digital'
  | 'creative'
  | 'people'
  | 'life'
  | 'leadership'
  | 'public'
  | 'action';

export type ActivityTag =
  | 'investigate'
  | 'observe'
  | 'measure'
  | 'digital_make'
  | 'rule_make'
  | 'express'
  | 'perform'
  | 'guide'
  | 'communicate'
  | 'care'
  | 'health'
  | 'plan'
  | 'introduce'
  | 'safety'
  | 'nature'
  | 'active';

export type WorkStyleTag =
  | 'together'
  | 'focus'
  | 'observe'
  | 'imagine'
  | 'solve'
  | 'care'
  | 'plan'
  | 'flex';

export type CareerAnswer = 'A' | 'B' | 'unknown';
export type CareerAnswerMap = Record<number, CareerAnswer>;

export type CareerQuestionOption = {
  id: 'A' | 'B';
  label: string;
  activityTags: Partial<Record<ActivityTag, number>>;
  workStyleTags?: Partial<Record<WorkStyleTag, number>>;
};

export type CareerQuestionV2 = {
  id: number;
  kind: 'activity' | 'style';
  text: string;
  options: [CareerQuestionOption, CareerQuestionOption];
};

export type CareerField = {
  id: CareerFieldId;
  label: string;
  description: string;
  activityTags: Partial<Record<ActivityTag, number>>;
  workStyleTags: Partial<Record<WorkStyleTag, number>>;
};

export type CareerDefinition = {
  name: string;
  libraryCategory: string;
  primaryField: CareerFieldId;
  secondaryField?: CareerFieldId;
  activityTags: Partial<Record<ActivityTag, number>>;
  workStyleTags: Partial<Record<WorkStyleTag, number>>;
  detail: CareerDetail;
};

export type ScoredCareerV2 = {
  name: string;
  score: number;
  primaryField: CareerFieldId;
  secondaryField?: CareerFieldId;
  reason: string;
};

export type CareerFieldResult = {
  fieldId: CareerFieldId;
  label: string;
  score: number;
  scoreBand: 'very-high' | 'high' | 'explore';
  evidence: string[];
  recommendedCareers: ScoredCareerV2[];
};

export type CareerResultV2 = {
  questionnaireVersion: 2;
  fieldResults: CareerFieldResult[];
  recommendedFieldResults: CareerFieldResult[];
  strengths: string[];
  summary: string;
};

export type CareerAnswerSnapshot = {
  questionId: number;
  questionText: string;
  choice: CareerAnswer;
  optionLabel: string;
};

export type DreamChoice =
  | { kind: 'recommended'; careerName: string }
  | { kind: 'catalog'; careerName: string }
  | { kind: 'custom'; careerName: string }
  | { kind: 'undecided' };
