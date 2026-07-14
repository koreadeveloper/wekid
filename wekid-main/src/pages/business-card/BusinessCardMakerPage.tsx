import { useEffect, useMemo, useRef, useState } from 'react';
import { BriefcaseBusiness, ImagePlus, Printer, Search, Sparkles, UserRound } from 'lucide-react';

const PRINT_CARD_COUNT = 10;

type PrintSide = 'front' | 'back';

type BusinessCardData = {
  name: string;
  englishName: string;
  job: string;
  school: string;
  phone: string;
  email: string;
  goal: string;
};

type JobCardTheme = {
  key: 'police' | 'firefighter' | 'soccer' | 'director' | 'teacher';
  name: string;
  emoji: string;
  hint: string;
  backgroundUrl: string;
};

const JOB_CARD_THEMES: JobCardTheme[] = [
  {
    key: 'police',
    name: '경찰관',
    emoji: '👮',
    hint: '질서와 안전을 지키는 공공 전문가',
    backgroundUrl: '/business-card-backgrounds/police.png',
  },
  {
    key: 'firefighter',
    name: '소방관',
    emoji: '🚒',
    hint: '위험한 순간 가장 먼저 달려가는 구조자',
    backgroundUrl: '/business-card-backgrounds/firefighter.png',
  },
  {
    key: 'soccer',
    name: '축구선수',
    emoji: '⚽',
    hint: '경기장에서 팀과 함께 뛰는 운동 전문가',
    backgroundUrl: '/business-card-backgrounds/soccer.png',
  },
  {
    key: 'director',
    name: '영화감독',
    emoji: '🎬',
    hint: '영상 이야기를 이끄는 연출가',
    backgroundUrl: '/business-card-backgrounds/director.png',
  },
  {
    key: 'teacher',
    name: '선생님',
    emoji: '📚',
    hint: '배움의 길을 열어 주는 사람',
    backgroundUrl: '/business-card-backgrounds/teacher.png',
  },
];

const defaultCardData: BusinessCardData = {
  name: '김위키드',
  englishName: 'KIM WEKID',
  job: JOB_CARD_THEMES[0].name,
  school: '위키드 초등학교',
  phone: '010-0000-0000',
  email: 'dream@wekid.kr',
  goal: '사람들이 즐거운 순간을 만들고 싶어요.',
};

const fields: Array<{
  id: keyof BusinessCardData;
  label: string;
  maxLength: number;
  placeholder: string;
}> = [
  { id: 'name', label: '이름', maxLength: 12, placeholder: '김위키드' },
  { id: 'englishName', label: '영문 이름', maxLength: 24, placeholder: 'KIM WEKID' },
  { id: 'school', label: '학교 / 소속', maxLength: 24, placeholder: '위키드 초등학교' },
  { id: 'phone', label: '전화번호 (선택)', maxLength: 18, placeholder: '010-0000-0000' },
  { id: 'email', label: '이메일 (선택)', maxLength: 36, placeholder: 'dream@wekid.kr' },
  { id: 'goal', label: '한 줄 목표', maxLength: 36, placeholder: '사람들이 즐거운 순간을 만들고 싶어요.' },
];

const cardCopies = Array.from({ length: PRINT_CARD_COUNT }, (_, index) => index);

export function BusinessCardMakerPage() {
  const [cardData, setCardData] = useState<BusinessCardData>(defaultCardData);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [printSide, setPrintSide] = useState<PrintSide>('front');
  const [selectedJobKey, setSelectedJobKey] = useState<JobCardTheme['key']>(JOB_CARD_THEMES[0].key);
  const [jobSearch, setJobSearch] = useState('');
  const photoObjectUrlRef = useRef<string | null>(null);

  const selectedJobTheme = JOB_CARD_THEMES.find((theme) => theme.key === selectedJobKey) ?? JOB_CARD_THEMES[0];
  const filteredJobThemes = useMemo(() => {
    const keyword = jobSearch.trim().toLowerCase();
    if (!keyword) {
      return JOB_CARD_THEMES;
    }

    return JOB_CARD_THEMES.filter(
      (theme) => theme.name.toLowerCase().includes(keyword) || theme.hint.toLowerCase().includes(keyword),
    );
  }, [jobSearch]);

  useEffect(
    () => () => {
      if (photoObjectUrlRef.current) {
        URL.revokeObjectURL(photoObjectUrlRef.current);
      }
    },
    [],
  );

  const updateField = (field: keyof BusinessCardData, value: string) => {
    setCardData((current) => ({ ...current, [field]: value }));
  };

  const selectJobTheme = (theme: JobCardTheme) => {
    setSelectedJobKey(theme.key);
    setCardData((current) => ({ ...current, job: theme.name }));
  };

  const updatePhoto = (file: File | undefined) => {
    if (photoObjectUrlRef.current) {
      URL.revokeObjectURL(photoObjectUrlRef.current);
      photoObjectUrlRef.current = null;
    }

    if (!file || !file.type.startsWith('image/')) {
      setPhotoUrl(null);
      return;
    }

    const nextUrl = URL.createObjectURL(file);
    photoObjectUrlRef.current = nextUrl;
    setPhotoUrl(nextUrl);
  };

  return (
    <section className="business-card-maker">
      <div className="business-card-screen business-card-page-heading">
        <p className="section-kicker">꿈 명함</p>
        <h1>위키드 명함 제작</h1>
      </div>

      <div className="business-card-screen business-card-editor">
        <section className="business-card-panel business-card-form-panel" aria-label="명함 정보 입력">
          <div className="panel-heading">
            <div className="panel-icon">
              <BriefcaseBusiness size={22} />
            </div>
            <div>
              <p className="section-kicker">정보 입력</p>
              <h2>내 명함 만들기</h2>
            </div>
          </div>

          <div className="business-card-form-grid">
            <div className="business-card-job-selector">
              <label className="business-card-field">
                <span>희망 직업 검색</span>
                <div className="job-search-box">
                  <Search size={17} />
                  <input
                    type="search"
                    value={jobSearch}
                    placeholder="경찰관, 소방관, 축구선수..."
                    onChange={(event) => setJobSearch(event.target.value)}
                  />
                </div>
              </label>
              <div className="job-theme-list" aria-label="희망 직업 선택">
                {filteredJobThemes.map((theme) => (
                  <button
                    className={`job-theme-button ${selectedJobTheme.key === theme.key ? 'active' : ''}`}
                    key={theme.key}
                    type="button"
                    onClick={() => selectJobTheme(theme)}
                  >
                    <span aria-hidden="true">{theme.emoji}</span>
                    <strong>{theme.name}</strong>
                  </button>
                ))}
                {filteredJobThemes.length === 0 && <p className="job-theme-empty">검색 결과가 없어요.</p>}
              </div>
            </div>

            {fields.map((field) => (
              <label className="business-card-field" key={field.id}>
                <span>{field.label}</span>
                <input
                  type="text"
                  value={cardData[field.id]}
                  maxLength={field.maxLength}
                  placeholder={field.placeholder}
                  onChange={(event) => updateField(field.id, event.target.value)}
                />
              </label>
            ))}

            <label className="business-card-upload">
              <input
                type="file"
                accept="image/*"
                onChange={(event) => {
                  updatePhoto(event.target.files?.[0]);
                  event.currentTarget.value = '';
                }}
              />
              <ImagePlus size={20} />
              사진 넣기
            </label>
          </div>
        </section>

        <section className="business-card-panel business-card-preview-panel" aria-label="명함 미리보기">
          <div className="panel-heading">
            <div className="panel-icon yellow">
              <Sparkles size={22} />
            </div>
            <div>
              <p className="section-kicker">미리보기</p>
              <h2>앞면과 뒷면</h2>
            </div>
          </div>

          <div className="business-card-preview-grid">
            <BusinessCardPreview data={cardData} photoUrl={photoUrl} side="front" theme={selectedJobTheme} />
            <BusinessCardPreview data={cardData} photoUrl={photoUrl} side="back" theme={selectedJobTheme} />
          </div>

          <div className="business-card-print-controls" aria-label="인쇄 설정">
            <div className="print-side-switch">
              <button
                className={printSide === 'front' ? 'active' : ''}
                type="button"
                onClick={() => setPrintSide('front')}
              >
                앞면
              </button>
              <button
                className={printSide === 'back' ? 'active' : ''}
                type="button"
                onClick={() => setPrintSide('back')}
              >
                뒷면
              </button>
            </div>
            <span className="print-count-pill">A4 10장</span>
            <button className="primary-button print-button" type="button" onClick={() => window.print()}>
              <Printer size={19} />
              인쇄하기
            </button>
          </div>
        </section>
      </div>

      <section className="business-card-print-zone" aria-hidden="true">
        <div className="business-card-print-sheet">
          {cardCopies.map((copy) => (
            <BusinessCardPreview
              data={cardData}
              key={`${printSide}-${copy}`}
              photoUrl={photoUrl}
              side={printSide}
              theme={selectedJobTheme}
              variant="print"
            />
          ))}
        </div>
      </section>
    </section>
  );
}

type BusinessCardPreviewProps = {
  data: BusinessCardData;
  photoUrl: string | null;
  side: PrintSide;
  theme: JobCardTheme;
  variant?: 'screen' | 'print';
};

function BusinessCardPreview({ data, photoUrl, side, theme, variant = 'screen' }: BusinessCardPreviewProps) {
  const value = (text: string, fallback: string) => text.trim() || fallback;
  const name = value(data.name, '이름');
  const englishName = value(data.englishName, 'WEKID DREAMER');
  const job = value(data.job, '희망 직업');
  const school = value(data.school, '학교 / 소속');
  const phoneText = data.phone.trim();
  const emailText = data.email.trim();
  const goal = value(data.goal, '나의 목표를 적어보세요.');

  if (side === 'front') {
    const nameSize = name.length > 9 ? 'is-very-long' : name.length > 6 ? 'is-long' : '';
    const englishNameSize = englishName.length > 18 ? 'is-very-long' : englishName.length > 13 ? 'is-long' : '';

    return (
      <article className={`business-card-face business-card-front ${variant}`} aria-label="명함 앞면">
        <span className="card-front-topline" aria-hidden="true" />
        <img className="card-front-center-logo" src="/goyang-volunteer-center.png" alt="고양시자원봉사센터" />
        <div className="card-front-identity" aria-label={`${name}의 ${job} 꿈 명함`}>
          <strong className={nameSize}>{name}</strong>
          <span className={`card-front-english-name ${englishNameSize}`}>{englishName}</span>
          <span className="card-front-job">{job}</span>
        </div>
        <span className="card-front-divider" aria-hidden="true" />
        <div className="card-front-contact">
          {phoneText && <span>{phoneText}</span>}
          {emailText && <span>{emailText}</span>}
        </div>
        <img className="card-front-wekid-mark" src="/wekid-logo.png" alt="위키드" />
      </article>
    );
  }

  return (
    <article className={`business-card-face business-card-back ${variant}`} aria-label="명함 뒷면">
      <span className="card-back-smile" aria-hidden="true" />
      <div className="card-photo-frame">
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
      <div className="card-info-column">
        <p className="card-info-job">
          <span aria-hidden="true">{theme.emoji}</span>
          {job}
        </p>
        <h3>{name}</h3>
        <dl>
          <div>
            <dt>소속</dt>
            <dd>{school}</dd>
          </div>
          {(phoneText || emailText) && (
            <div>
              <dt>연락</dt>
              <dd>{[phoneText, emailText].filter(Boolean).join(' · ')}</dd>
            </div>
          )}
          <div>
            <dt>목표</dt>
            <dd>{goal}</dd>
          </div>
        </dl>
      </div>
    </article>
  );
}
