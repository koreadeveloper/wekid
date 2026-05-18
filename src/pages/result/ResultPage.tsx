import { axisLabels } from '../../data/axisLabels';
import { careerCategories } from '../../data/careerCategories';
import type { CareerMatches, CareerProfile, ScoreMap } from '../../types/career';
import { CareerExplorer } from './components/CareerExplorer';
import { CareerLibrary } from './components/CareerLibrary';
import { CareerRecommendations } from './components/CareerRecommendations';
import { EmptyResult } from './components/EmptyResult';
import { InsightPanels } from './components/InsightPanels';
import { ResultActions } from './components/ResultActions';
import { ResultHero } from './components/ResultHero';
import { WhyPanel } from './components/WhyPanel';

type ResultPageProps = {
  careerMatches: CareerMatches;
  highlightedCareers: Set<string>;
  profile?: CareerProfile;
  scores: ScoreMap;
  onEditLastAnswer: () => void;
  onReset: () => void;
};

export function ResultPage({
  careerMatches,
  highlightedCareers,
  profile,
  scores,
  onEditLastAnswer,
  onReset,
}: ResultPageProps) {
  if (!profile) {
    return <EmptyResult onEditLastAnswer={onEditLastAnswer} onReset={onReset} />;
  }

  return (
    <section className="result-layout">
      <ResultHero profile={profile} />
      <WhyPanel profile={profile} />
      <InsightPanels axisLabels={axisLabels} profile={profile} scores={scores} />
      <CareerRecommendations careers={careerMatches.primary} />
      <CareerExplorer careers={careerMatches.explore} />
      <CareerLibrary categories={careerCategories} highlightedCareers={highlightedCareers} />
      <ResultActions onEditLastAnswer={onEditLastAnswer} onReset={onReset} />
    </section>
  );
}
