import { useEffect, useMemo, useRef, useState } from 'react';
import { BriefcaseBusiness, ImageOff, ImagePlus, Printer, Sparkles } from 'lucide-react';
import { jobCardThemes } from '../../data/jobCardThemes';
import { searchJobCardThemes, type JobCardTheme } from '../../lib/jobCardThemes';
import { BusinessCardPreview, type BusinessCardData, type PrintSide } from './BusinessCardPreview';
import { JobThemePicker } from './JobThemePicker';
import { businessCardFields, cardCopies, defaultCardData } from './businessCardConfig';
import { readBusinessCardDraft, saveBusinessCardDraft } from './businessCardDraftStorage';

type BusinessCardMakerPageProps = {
  readonly focusRequest: number;
  readonly initialCardData?: BusinessCardData;
};

const getJobKey = (jobName: string) => jobCardThemes.find((theme) => theme.name === jobName)?.key ?? jobCardThemes[0].key;

const waitForPrintImages = async (root: HTMLElement | null) => {
  const images = Array.from(root?.querySelectorAll('img') ?? []);
  await Promise.all(
    images.map(async (image) => {
      if (image.complete && image.naturalWidth > 0) {
        return;
      }

      await image.decode().catch(() => undefined);
    }),
  );
};

export function BusinessCardMakerPage({ focusRequest, initialCardData }: BusinessCardMakerPageProps) {
  const initialData = initialCardData ?? readBusinessCardDraft() ?? defaultCardData;
  const [cardData, setCardData] = useState<BusinessCardData>(initialData);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [printSide, setPrintSide] = useState<PrintSide>('front');
  const [selectedJobKey, setSelectedJobKey] = useState<JobCardTheme['key']>(() => getJobKey(initialData.job));
  const [jobSearch, setJobSearch] = useState('');
  const headingRef = useRef<HTMLHeadingElement>(null);
  const photoObjectUrlRef = useRef<string | null>(null);
  const printZoneRef = useRef<HTMLElement>(null);

  const selectedJobTheme = jobCardThemes.find((theme) => theme.key === selectedJobKey) ?? jobCardThemes[0];
  const filteredJobThemes = useMemo(() => {
    return searchJobCardThemes(jobCardThemes, jobSearch);
  }, [jobSearch]);

  useEffect(
    () => () => {
      if (photoObjectUrlRef.current) {
        URL.revokeObjectURL(photoObjectUrlRef.current);
      }
    },
    [],
  );

  useEffect(() => {
    if (!initialCardData) {
      return;
    }

    setCardData(initialCardData);
    setSelectedJobKey(getJobKey(initialCardData.job));
    setJobSearch('');
  }, [initialCardData]);

  useEffect(() => {
    if (focusRequest <= 0) {
      return;
    }

    const focusFrame = window.requestAnimationFrame(() => {
      headingRef.current?.focus({ preventScroll: true });
    });

    return () => window.cancelAnimationFrame(focusFrame);
  }, [focusRequest]);

  useEffect(() => {
    saveBusinessCardDraft(cardData);
  }, [cardData]);

  const printSideLabel = printSide === 'front' ? '앞면' : '뒷면';

  const updateField = (field: keyof BusinessCardData, value: string) => {
    setCardData((current) => ({ ...current, [field]: value }));
  };

  const selectJobTheme = (theme: JobCardTheme) => {
    setSelectedJobKey(theme.key);
    setCardData((current) => ({ ...current, job: theme.name }));
  };

  const clearPhoto = () => {
    if (photoObjectUrlRef.current) {
      URL.revokeObjectURL(photoObjectUrlRef.current);
      photoObjectUrlRef.current = null;
    }

    setPhotoUrl(null);
  };

  const updatePhoto = (file: File | undefined) => {
    clearPhoto();

    if (!file || !file.type.startsWith('image/')) {
      return;
    }

    const nextUrl = URL.createObjectURL(file);
    photoObjectUrlRef.current = nextUrl;
    setPhotoUrl(nextUrl);
  };

  const handlePrint = async () => {
    await document.fonts?.ready;
    await waitForPrintImages(printZoneRef.current);
    window.print();
  };

  return (
    <section className="business-card-maker">
      <div className="business-card-screen business-card-page-heading">
        <p className="section-kicker">꿈 명함</p>
        <h1 ref={headingRef} tabIndex={-1}>
          내 꿈 명함 만들기
        </h1>
      </div>

      <div className="business-card-screen business-card-editor">
        <section className="business-card-panel business-card-form-panel" aria-label="내 명함 정보 쓰기">
          <div className="panel-heading">
            <div className="panel-icon">
              <BriefcaseBusiness size={22} />
            </div>
            <div>
              <p className="section-kicker">내 정보 쓰기</p>
              <h2>내 명함 만들기</h2>
            </div>
          </div>

          <div className="business-card-mobile-live-preview" aria-hidden="true">
            <BusinessCardPreview data={cardData} photoUrl={photoUrl} side="front" theme={selectedJobTheme} />
          </div>

          <div className="business-card-form-grid">
            <JobThemePicker
              filteredJobThemes={filteredJobThemes}
              jobSearch={jobSearch}
              selectedJobKey={selectedJobTheme.key}
              onJobSearchChange={setJobSearch}
              onSelectJobTheme={selectJobTheme}
            />

            {businessCardFields.map((field) => (
              <label className={`business-card-field${field.id === 'goal' ? ' wide' : ''}`} key={field.id}>
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

            <div className={`business-card-photo-actions${photoUrl ? ' has-photo' : ''}`}>
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
              {photoUrl && (
                <button className="business-card-photo-remove" type="button" onClick={clearPhoto}>
                  <ImageOff size={20} />
                  사진 빼기
                </button>
              )}
            </div>
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

          <div className="business-card-print-controls" role="group" aria-label="명함 인쇄 설정">
            <div className="print-side-switch" role="group" aria-label="인쇄할 면 선택">
              <button
                className={printSide === 'front' ? 'active' : ''}
                type="button"
                aria-pressed={printSide === 'front'}
                onClick={() => setPrintSide('front')}
              >
                앞면
              </button>
              <button
                className={printSide === 'back' ? 'active' : ''}
                type="button"
                aria-pressed={printSide === 'back'}
                onClick={() => setPrintSide('back')}
              >
                뒷면
              </button>
            </div>
            <span className="print-count-pill">{printSideLabel}만 10개 인쇄</span>
            <p className="print-guide" id="business-card-print-guide">
              앞면 인쇄 후 같은 종이에 뒷면을 인쇄하세요.
            </p>
            <button
              className="primary-button print-button"
              type="button"
              aria-describedby="business-card-print-guide"
              onClick={() => void handlePrint()}
            >
              <Printer size={19} />
              인쇄하기
            </button>
          </div>
        </section>
      </div>

      <section className="business-card-print-zone" aria-hidden="true" ref={printZoneRef}>
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
