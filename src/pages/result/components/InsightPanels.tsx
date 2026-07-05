import { BookOpenCheck, Compass, Sparkles } from 'lucide-react';
import type { AxisLabels, CareerProfile, ExplorationAxis, ScoreMap } from '../../../types/career';

type InsightPanelsProps = {
  axisLabels: AxisLabels;
  profile: CareerProfile;
  scores: ScoreMap;
};

export function InsightPanels({ axisLabels, profile, scores }: InsightPanelsProps) {
  return (
    <section className="insight-grid career-insights">
      <div className="insight-panel">
        <div className="panel-title">
          <Sparkles size={20} />
          <h2>나의 강점 힌트</h2>
        </div>
        <div className="strength-list">
          {profile.interestHighlights?.map((highlight) => (
            <span key={highlight}>{highlight}</span>
          ))}
          {profile.strengths.map((strength) => (
            <span key={strength}>{strength}</span>
          ))}
        </div>
      </div>

      <div className="insight-panel">
        <div className="panel-title">
          <Compass size={20} />
          <h2>내 답변에서 보인 모습</h2>
        </div>
        <div className="hint-list">
          {(Object.keys(axisLabels) as ExplorationAxis[]).map((axis) => {
            const axisInfo = axisLabels[axis];
            const leftScore = scores[axisInfo.left];
            const rightScore = scores[axisInfo.right];
            const strongerLabel = leftScore >= rightScore ? axisInfo.leftLabel : axisInfo.rightLabel;
            return (
              <span key={axis}>
                {axisInfo.title}: {strongerLabel}
              </span>
            );
          })}
        </div>
      </div>

      <div className="insight-panel">
        <div className="panel-title">
          <BookOpenCheck size={20} />
          <h2>학교에서 해볼 미션</h2>
        </div>
        <ol className="mission-list">
          {profile.missions.map((mission) => (
            <li key={mission}>{mission}</li>
          ))}
        </ol>
      </div>
    </section>
  );
}
