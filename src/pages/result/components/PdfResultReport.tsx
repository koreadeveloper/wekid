import { forwardRef } from 'react';
import { axisLabels } from '../../../data/axisLabels';
import type { CareerMatches, CareerProfile, ExplorationAxis, ScoreMap } from '../../../types/career';

type PdfResultReportProps = {
  careerMatches: CareerMatches;
  profile: CareerProfile;
  scores: ScoreMap;
  userName: string;
};

const axisOrder: ExplorationAxis[] = ['energy', 'information', 'decision', 'pace'];

export const PdfResultReport = forwardRef<HTMLDivElement, PdfResultReportProps>(function PdfResultReport(
  { careerMatches, profile, scores, userName },
  ref,
) {
  const nameLabel = userName ? `${userName}의` : '나의';
  const reportDate = new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date());

  const recommendations = [
    profile.topCareer,
    ...careerMatches.primary.filter((career) => career.name !== profile.topCareer.name),
  ].slice(0, 4);

  return (
    <div className="pdf-report-capture" ref={ref} aria-hidden="true">
      <article className="pdf-report">
        <header className="pdf-report-header">
          <div>
            <p>위키드 직업 탐험</p>
            <h2>{nameLabel} 직업 추천 결과지</h2>
          </div>
          <span>{reportDate}</span>
        </header>

        <section className="pdf-main-card">
          <p>가장 잘 맞는 직업</p>
          <h3>{profile.topCareer.name}</h3>
          <strong>{profile.headline}</strong>
          <span>
            {profile.summary} {profile.topCareer.reason}
          </span>
        </section>

        <section className="pdf-two-column">
          <div className="pdf-box">
            <h4>나의 강점</h4>
            <div className="pdf-tag-row">
              {profile.strengths.slice(0, 6).map((strength) => (
                <span key={strength}>{strength}</span>
              ))}
            </div>
          </div>
          <div className="pdf-box">
            <h4>내 답변에서 보인 모습</h4>
            <ul className="pdf-mini-list">
              {axisOrder.map((axis) => {
                const axisInfo = axisLabels[axis];
                const strongerLabel =
                  scores[axisInfo.left] >= scores[axisInfo.right] ? axisInfo.leftLabel : axisInfo.rightLabel;
                return (
                  <li key={axis}>
                    <b>{axisInfo.title}</b>
                    <span>{strongerLabel}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>

        <section className="pdf-box">
          <h4>추천 직업과 이유</h4>
          <div className="pdf-career-grid">
            {recommendations.map((career) => (
              <div className="pdf-career-card" key={career.name}>
                <strong>{career.name}</strong>
                <p>{career.reason}</p>
              </div>
            ))}
          </div>
        </section>

      </article>
    </div>
  );
});
