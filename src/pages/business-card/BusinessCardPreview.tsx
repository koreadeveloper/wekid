import { UserRound } from 'lucide-react';
import type { JobCardTheme } from '../../lib/jobCardThemes';
import { JobThemeIcon } from './JobThemeIcon';

const WEKID_LOGO_URL = '/brand/wekid-logo.png';

export type PrintSide = 'front' | 'back';

export type BusinessCardData = {
  name: string;
  englishName: string;
  job: string;
  school: string;
  phone: string;
  goal: string;
};

type BusinessCardPreviewProps = {
  data: BusinessCardData;
  photoUrl: string | null;
  side: PrintSide;
  theme: JobCardTheme;
  variant?: 'screen' | 'print';
};

export function BusinessCardPreview({ data, photoUrl, side, theme, variant = 'screen' }: BusinessCardPreviewProps) {
  const value = (text: string, fallback: string) => text.trim() || fallback;
  const name = value(data.name, '이름');
  const englishName = value(data.englishName, 'WEKID DREAM');
  const job = value(data.job, '희망 직업');
  const school = value(data.school, '학교 또는 센터');
  const phone = data.phone.trim();
  const goal = data.goal.trim();

  const jobBadgeLength = [...job].length;
  const jobBadgeSizeClass = jobBadgeLength >= 11 ? ' dense' : jobBadgeLength >= 6 ? ' compact' : '';
  const nameLength = [...name].length;
  const englishNameLength = [...englishName].length;
  const nameSizeClass =
    nameLength >= 11 || englishNameLength >= 22
      ? ' ultra'
      : nameLength >= 8 || englishNameLength >= 18
        ? ' dense'
        : nameLength >= 5 || englishNameLength >= 15
          ? ' compact'
          : '';

  if (side === 'front') {
    return (
      <article className={`business-card-face business-card-front ${variant}`} aria-label="명함 앞면">
        <img className="card-front-background" src={theme.backgroundUrl} alt="" />
        <img className="card-front-logo" src={WEKID_LOGO_URL} alt="위키드 로고" />
        <div className={`card-front-name-layer${nameSizeClass}`}>
          <h3 className="card-name-overlay">{name}</h3>
          <span className="card-english-overlay">{englishName}</span>
        </div>
        <div className={`card-front-job-badge${jobBadgeSizeClass}`}>
          <span>{job}</span>
        </div>
      </article>
    );
  }

  return (
    <article className={`business-card-face business-card-back ${variant}`} aria-label="명함 뒷면">
      <div className="card-back-brand">
        <img className="card-back-logo" src={WEKID_LOGO_URL} alt="위키드 로고" />
        <span>WEKID DREAM CARD</span>
      </div>
      <div className="card-back-identity">
        <div className={`card-photo-frame${photoUrl ? ' has-photo' : ' is-empty'}`}>
          {photoUrl ? (
            <img
              alt=""
              src={photoUrl}
              onError={(event) => {
                event.currentTarget.style.display = 'none';
              }}
            />
          ) : (
            <UserRound size={variant === 'print' ? 24 : 34} />
          )}
        </div>
        <div className={`card-info-column${nameSizeClass}`}>
          <p className="card-info-job">
            <span className="card-job-symbol" aria-hidden="true">
              <JobThemeIcon category={theme.category} />
            </span>
            <strong>{job}</strong>
          </p>
          <h3>{name}</h3>
          <span className="card-info-english">{englishName}</span>
        </div>
      </div>
      <dl className={`card-detail-grid${phone ? '' : ' single'}`}>
        <div className="card-detail-item">
          <dt>소속</dt>
          <dd>{school}</dd>
        </div>
        {phone && (
          <div className="card-detail-item">
            <dt>연락처</dt>
            <dd>{phone}</dd>
          </div>
        )}
      </dl>
      <div className="card-goal-band">
        <span>목표</span>
        <strong>{goal}</strong>
      </div>
    </article>
  );
}
