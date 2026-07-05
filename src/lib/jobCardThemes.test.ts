import { describe, expect, it } from 'vitest';
import { buildJobCardThemes, parseJobBackgroundCsv, searchJobCardThemes } from './jobCardThemes';

const sampleCsv = `koreanName,englishName,emoji,filename,category,tagline
웹툰 작가,Webtoon Artist,✏️,웹툰 작가_Webtoon Artist.png,arts,이야기를 그림으로 이어 가는 작가
소프트웨어 개발자,Software Developer,💻,소프트웨어 개발자_Software Developer.png,digital,아이디어를 기술로 실제로 만드는 해결사
"AR/VR 개발자",AR VR Developer,🥽,AR VR 개발자_AR VR Developer.png,digital,가상 세계를 현실처럼 느끼게 만드는 개발자`;

describe('parseJobBackgroundCsv', () => {
  it('reads Korean and English job background metadata from CSV rows', () => {
    expect(parseJobBackgroundCsv(sampleCsv)).toEqual([
      {
        koreanName: '웹툰 작가',
        englishName: 'Webtoon Artist',
        emoji: '✏️',
        filename: '웹툰 작가_Webtoon Artist.png',
        category: 'arts',
        tagline: '이야기를 그림으로 이어 가는 작가',
      },
      {
        koreanName: '소프트웨어 개발자',
        englishName: 'Software Developer',
        emoji: '💻',
        filename: '소프트웨어 개발자_Software Developer.png',
        category: 'digital',
        tagline: '아이디어를 기술로 실제로 만드는 해결사',
      },
      {
        koreanName: 'AR/VR 개발자',
        englishName: 'AR VR Developer',
        emoji: '🥽',
        filename: 'AR VR 개발자_AR VR Developer.png',
        category: 'digital',
        tagline: '가상 세계를 현실처럼 느끼게 만드는 개발자',
      },
    ]);
  });
});

describe('buildJobCardThemes', () => {
  it('connects parsed jobs to matching background image URLs by filename', () => {
    const themes = buildJobCardThemes(sampleCsv, {
      '../../wekid-job-backgrounds-clean-178/webp/웹툰 작가_Webtoon Artist.webp': '/assets/webtoon.webp',
      '../../wekid-job-backgrounds-clean-178/webp/소프트웨어 개발자_Software Developer.webp': '/assets/software.webp',
      '../../wekid-job-backgrounds-clean-178/webp/AR VR 개발자_AR VR Developer.webp': '/assets/arvr.webp',
    });

    expect(themes).toHaveLength(3);
    expect(themes[1]).toMatchObject({
      key: '소프트웨어 개발자',
      name: '소프트웨어 개발자',
      englishName: 'Software Developer',
      emoji: '💻',
      hint: '아이디어를 기술로 실제로 만드는 해결사',
      category: 'digital',
      backgroundUrl: '/assets/software.webp',
    });
  });

  it('fails loudly when a CSV row has no matching background image', () => {
    expect(() => buildJobCardThemes(sampleCsv, {})).toThrow('Missing job background image');
  });
});

describe('searchJobCardThemes', () => {
  const themes = buildJobCardThemes(sampleCsv, {
    '../../wekid-job-backgrounds-clean-178/images/웹툰 작가_Webtoon Artist.png': '/assets/webtoon.png',
    '../../wekid-job-backgrounds-clean-178/images/소프트웨어 개발자_Software Developer.png': '/assets/software.png',
    '../../wekid-job-backgrounds-clean-178/images/AR VR 개발자_AR VR Developer.png': '/assets/arvr.png',
  });

  it('finds jobs by Korean name, English name, category, and tagline', () => {
    expect(searchJobCardThemes(themes, '웹툰').map((theme) => theme.name)).toEqual(['웹툰 작가']);
    expect(searchJobCardThemes(themes, 'software').map((theme) => theme.name)).toEqual(['소프트웨어 개발자']);
    expect(searchJobCardThemes(themes, 'digital').map((theme) => theme.name)).toEqual([
      '소프트웨어 개발자',
      'AR/VR 개발자',
    ]);
    expect(searchJobCardThemes(themes, '가상 세계').map((theme) => theme.name)).toEqual(['AR/VR 개발자']);
  });

  it('returns every job when the search query is blank', () => {
    expect(searchJobCardThemes(themes, '').map((theme) => theme.name)).toEqual([
      '웹툰 작가',
      '소프트웨어 개발자',
      'AR/VR 개발자',
    ]);
  });
});
