import { useMemo, useRef, useState } from 'react';
import { BriefcaseBusiness, ImagePlus, Printer, Sparkles, UserRound } from 'lucide-react';
import { getCareerDetail } from '../../data/careerDetails';
import { romanizeKoreanName } from '../../lib/romanizeKoreanName';
import type { BusinessCardPrefill } from '../admin/AdminBusinessCardBridge';

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

type AdminBusinessCardMakerPageProps = {
  prefill: BusinessCardPrefill;
};

const fields: Array<{
  id: keyof BusinessCardData;
  label: string;
  maxLength: number;
  placeholder: string;
}> = [
  { id: 'name', label: '이름', maxLength: 12, placeholder: '김위키드' },
  { id: 'englishName', label: '영문 이름', maxLength: 24, placeholder: 'KIM WEKID' },
  { id: 'school', label: '학교 / 소속', maxLength: 24, placeholder: '학교 또는 센터' },
  { id: 'phone', label: '전화번호 (선택)', maxLength: 18, placeholder: '010-0000-0000' },
  { id: 'email', label: '이메일 (선택)', maxLength: 36, placeholder: 'dream@wekid.kr' },
  { id: 'goal', label: '한 줄 목표', maxLength: 80, placeholder: '나의 꿈을 적어보세요.' },
];

const cardCopies = Array.from({ length: PRINT_CARD_COUNT }, (_, index) => index);

export function AdminBusinessCardMakerPage({ prefill }: AdminBusinessCardMakerPageProps) {
  const [cardData, setCardData] = useState<BusinessCardData>(() => ({
    name: prefill.name,
    englishName: romanizeKoreanName(prefill.name) || 'WEKID DREAMER',
    job: prefill.job,
    school: prefill.school,
    phone: '',
    email: prefill.email,
    goal: prefill.goal,
  }));
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [printSide, setPrintSide] = useState<PrintSide>('front');
  const photoObjectUrlRef = useRef<string | null>(null);

  const careerDetail = useMemo(() => getCareerDetail(cardData.job.trim()), [cardData.job]);
  const careerEmoji = careerDetail?.emoji ?? '💼';

  const updateField = (field: keyof BusinessCardData, value: string) => {
    setCardData((current) => {
      if (field !== 'name') {
        return { ...current, [field]: value };
      }

      const previousAutoEnglish = romanizeKoreanName(current.name);
      const nextEnglish = romanizeKoreanName(value);
      const shouldSyncEnglish = !current.englishName.trim() || current.englishName === previousAutoEnglish;

      return {
        ...current,
        name: value,
        englishName: shouldSyncEnglish && nextEnglish ? nextEnglish : current.englishName,
      };
    });
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
              <p className="section-kicker">관리자 결과 자동 입력</p>
              <h2>사진만 넣으면 완성돼요</h2>
            </div>
          </div>

          <div className="business-card-form-grid">
            <label className="business-card-field">
              <span>희망 직업</span>
              <input
                type="text"
                value={cardData.job}
                maxLength={30}
                onChange={(event) => updateField('job', event.target.value)}
              />
            </label>

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
            <BusinessCardPreview data={cardData} emoji={careerEmoji} photoUrl={photoUrl} side="front" />
            <BusinessCardPreview data={cardData} emoji={careerEmoji} photoUrl={photoUrl} side="back" />
          </div>

          <div className="business-card-print-controls" aria-label="인쇄 설정">
            <div className="print-side-switch">
              <button className={printSide === 'front' ? 'active' : ''} type="button" onClick={() => setPrintSide('front')}>
                앞면
              </button>
              <button className={printSide === 'back' ? 'active' : ''} type="button" onClick={() => setPrintSide('back')}>
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
              emoji={careerEmoji}
              key={`${printSide}-${copy}`}
              photoUrl={photoUrl}
              side={printSide}
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
  emoji: string;
  photoUrl: string | null;
  side: PrintSide;
  variant?: 'screen' | 'print';
};

function BusinessCardPreview({ data, emoji, photoUrl, side, variant = 'screen' }: BusinessCardPreviewProps) {
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
        {photoUrl ? <img alt="" src={photoUrl} /> : <UserRound size={variant === 'print' ? 24 : 34} />}
      </div>
      <div className="card-info-column">
        <p className="card-info-job">
          <span aria-hidden="true">{emoji}</span>
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
