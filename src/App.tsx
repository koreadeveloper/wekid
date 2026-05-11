import { useMemo, useState } from 'react';
import type { CSSProperties } from 'react';
import {
  ArrowLeft,
  BookOpenCheck,
  Brain,
  BriefcaseBusiness,
  Check,
  Code2,
  Compass,
  HeartHandshake,
  HeartPulse,
  Microscope,
  Palette,
  PartyPopper,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Sprout,
  Users,
  Wand2,
} from 'lucide-react';

type EnergyKey = 'together' | 'focus';
type InfoKey = 'observe' | 'imagine';
type DecisionKey = 'solve' | 'care';
type PaceKey = 'plan' | 'flex';
type ExplorationAxis = 'energy' | 'information' | 'decision' | 'pace';
type ChoiceKey = EnergyKey | InfoKey | DecisionKey | PaceKey;
type CareerPattern = `${EnergyKey}_${InfoKey}_${DecisionKey}_${PaceKey}`;
type AnswerMap = Record<number, ChoiceKey>;
type ScoreMap = Record<ChoiceKey, number>;

type Question = {
  id: number;
  axis: ExplorationAxis;
  eyebrow: string;
  text: string;
  options: [
    { label: string; choice: ChoiceKey; helper: string },
    { label: string; choice: ChoiceKey; helper: string },
  ];
};

type CareerRecommendation = {
  name: string;
  reason: string;
  fitTags: string[];
};

type CareerProfile = {
  headline: string;
  summary: string;
  topCareer: CareerRecommendation;
  recommendations: CareerRecommendation[];
  strengths: string[];
  missions: string[];
};

type CareerCategory = {
  title: string;
  accent: string;
  icon: typeof Microscope;
  careers: string[];
};

type AccentStyle = CSSProperties & { '--accent': string };

const questions: Question[] = [
  {
    id: 1,
    axis: 'energy',
    eyebrow: '쉬는 시간',
    text: '내가 더 신나는 쪽은?',
    options: [
      {
        label: '친구들과 함께 움직이며 놀기',
        choice: 'together',
        helper: '이야기하고 같이 해보면 힘이 나요.',
      },
      {
        label: '혼자 조용히 만들거나 상상하기',
        choice: 'focus',
        helper: '차분히 생각할 때 집중이 잘돼요.',
      },
    ],
  },
  {
    id: 2,
    axis: 'information',
    eyebrow: '새로운 과제',
    text: '어떤 방법이 더 편할까?',
    options: [
      {
        label: '예시를 보고 차근차근 따라 하기',
        choice: 'observe',
        helper: '눈에 보이는 순서와 사실이 좋아요.',
      },
      {
        label: '내 방식으로 새롭게 바꿔 보기',
        choice: 'imagine',
        helper: '상상하고 연결하는 일이 재미있어요.',
      },
    ],
  },
  {
    id: 3,
    axis: 'decision',
    eyebrow: '친구의 고민',
    text: '내가 먼저 하는 말은?',
    options: [
      {
        label: '문제가 왜 생겼는지 같이 찾아보자',
        choice: 'solve',
        helper: '원인을 알아내고 해결책을 세워요.',
      },
      {
        label: '많이 속상했겠다, 내가 들어줄게',
        choice: 'care',
        helper: '마음을 살피고 따뜻하게 도와요.',
      },
    ],
  },
  {
    id: 4,
    axis: 'pace',
    eyebrow: '숙제 시작',
    text: '내 책상 위 모습은?',
    options: [
      {
        label: '해야 할 일을 적고 하나씩 끝내기',
        choice: 'plan',
        helper: '정리된 계획이 있으면 마음이 편해요.',
      },
      {
        label: '떠오르는 생각부터 빠르게 해보기',
        choice: 'flex',
        helper: '해보면서 더 좋은 길을 발견해요.',
      },
    ],
  },
  {
    id: 5,
    axis: 'energy',
    eyebrow: '모둠 활동',
    text: '내가 맡고 싶은 역할은?',
    options: [
      {
        label: '앞에서 발표하고 친구들을 모으기',
        choice: 'together',
        helper: '사람들과 움직이는 순간이 즐거워요.',
      },
      {
        label: '자료를 만들고 중요한 부분 챙기기',
        choice: 'focus',
        helper: '깊게 살피며 조용히 완성도를 높여요.',
      },
    ],
  },
  {
    id: 6,
    axis: 'information',
    eyebrow: '발명 수업',
    text: '더 만들고 싶은 것은?',
    options: [
      {
        label: '실제로 튼튼하게 움직이는 물건',
        choice: 'observe',
        helper: '손으로 확인하고 고치는 과정이 좋아요.',
      },
      {
        label: '아무도 본 적 없는 미래 도구',
        choice: 'imagine',
        helper: '새로운 가능성을 떠올리면 설레요.',
      },
    ],
  },
  {
    id: 7,
    axis: 'decision',
    eyebrow: '선물 고르기',
    text: '내가 고르는 기준은?',
    options: [
      {
        label: '오래 쓰고 도움이 되는 선물',
        choice: 'solve',
        helper: '쓸모와 이유를 꼼꼼히 생각해요.',
      },
      {
        label: '받는 사람이 활짝 웃을 선물',
        choice: 'care',
        helper: '기분과 마음을 먼저 떠올려요.',
      },
    ],
  },
  {
    id: 8,
    axis: 'pace',
    eyebrow: '체험학습',
    text: '출발 전 나는?',
    options: [
      {
        label: '준비물과 시간을 미리 확인하기',
        choice: 'plan',
        helper: '예상하고 준비하면 더 잘할 수 있어요.',
      },
      {
        label: '가서 재미있는 걸 발견해보기',
        choice: 'flex',
        helper: '상황에 맞춰 움직이는 게 자연스러워요.',
      },
    ],
  },
  {
    id: 9,
    axis: 'energy',
    eyebrow: '궁금한 문제',
    text: '답을 찾을 때 나는?',
    options: [
      {
        label: '친구와 말하며 아이디어 나누기',
        choice: 'together',
        helper: '대화 속에서 생각이 더 커져요.',
      },
      {
        label: '먼저 혼자 생각을 정리하기',
        choice: 'focus',
        helper: '차분히 살피면 좋은 답이 보여요.',
      },
    ],
  },
  {
    id: 10,
    axis: 'information',
    eyebrow: '좋아하는 수업',
    text: '더 끌리는 활동은?',
    options: [
      {
        label: '관찰하고 실험해서 확인하기',
        choice: 'observe',
        helper: '정확한 결과와 실제 경험이 좋아요.',
      },
      {
        label: '이야기와 아이디어를 연결하기',
        choice: 'imagine',
        helper: '보이지 않는 뜻을 찾아내고 싶어요.',
      },
    ],
  },
  {
    id: 11,
    axis: 'decision',
    eyebrow: '규칙 정하기',
    text: '더 중요하다고 느끼는 것은?',
    options: [
      {
        label: '모두에게 공평한 기준 만들기',
        choice: 'solve',
        helper: '정확하고 납득되는 규칙을 세워요.',
      },
      {
        label: '서로의 마음이 다치지 않게 하기',
        choice: 'care',
        helper: '함께 편안한 분위기를 만들어요.',
      },
    ],
  },
  {
    id: 12,
    axis: 'pace',
    eyebrow: '발표 준비',
    text: '마지막 점검 시간에 나는?',
    options: [
      {
        label: '연습한 대로 또박또박 마무리하기',
        choice: 'plan',
        helper: '정해진 순서를 지키면 실수가 줄어요.',
      },
      {
        label: '더 재미있는 표현을 끝까지 바꾸기',
        choice: 'flex',
        helper: '새로운 생각이 떠오르면 바로 반영해요.',
      },
    ],
  },
];

const careerProfiles: Record<CareerPattern, CareerProfile> = {
  together_observe_solve_plan: {
    headline: '규칙을 세우고 친구들을 이끄는 힘',
    summary: '역할을 나누고 약속을 지키며 모두가 안전하게 움직이도록 챙기는 장점이 보여요.',
    topCareer: {
      name: '경찰관',
      reason:
        '공정한 기준으로 상황을 살피고 사람들을 보호하는 일을 잘할 가능성이 커요. 친구들과 함께 움직이며 필요한 순간에 또렷하게 결정하는 힘이 경찰관의 일과 잘 맞아요.',
      fitTags: ['공정함', '책임감', '현장 판단'],
    },
    recommendations: [
      {
        name: '소방대장',
        reason: '위험한 상황에서 팀을 모으고 순서를 정해 침착하게 움직이는 힘을 사용할 수 있어요.',
        fitTags: ['리더십', '안전', '실행력'],
      },
      {
        name: '항공관제사',
        reason: '정확한 규칙과 빠른 판단으로 여러 비행기가 안전하게 움직이도록 돕는 일이 잘 맞아요.',
        fitTags: ['집중', '규칙', '판단'],
      },
      {
        name: '프로젝트 매니저',
        reason: '여러 사람이 하는 일을 나누고 일정에 맞춰 끝까지 완성하는 강점을 살릴 수 있어요.',
        fitTags: ['계획', '협동', '관리'],
      },
      {
        name: '안전관리 전문가',
        reason: '위험한 부분을 미리 찾고 모두가 지킬 수 있는 방법을 만드는 일에 어울려요.',
        fitTags: ['관찰', '책임', '예방'],
      },
      {
        name: '스포츠 감독',
        reason: '팀의 목표를 세우고 선수들이 각자 역할을 잘하도록 이끄는 일이 잘 맞아요.',
        fitTags: ['팀워크', '전략', '응원'],
      },
      {
        name: '도시계획가',
        reason: '사람들이 안전하고 편하게 다닐 수 있도록 길과 공간을 체계적으로 설계할 수 있어요.',
        fitTags: ['질서', '공공성', '계획'],
      },
    ],
    strengths: ['역할 나누기', '일정 지키기', '빠른 결정', '친구들 챙기기'],
    missions: ['학급 회의 진행 맡아보기', '체험학습 준비 체크리스트 만들기', '모둠 발표 순서 정리하기'],
  },
  together_observe_solve_flex: {
    headline: '바로 움직이며 문제를 해결하는 힘',
    summary: '직접 해보고 빠르게 고치며, 갑자기 생긴 문제도 침착하게 다루는 장점이 보여요.',
    topCareer: {
      name: '소방관',
      reason:
        '눈앞의 상황을 빠르게 보고 몸을 움직여 사람들을 돕는 일이 잘 맞아요. 새로운 상황에서도 겁내지 않고 필요한 행동을 찾는 힘이 소방관에게 중요해요.',
      fitTags: ['용기', '순발력', '현장 감각'],
    },
    recommendations: [
      {
        name: '응급구조사',
        reason: '갑작스러운 상황에서 침착하게 사람을 살피고 필요한 도움을 주는 힘을 살릴 수 있어요.',
        fitTags: ['침착함', '도움', '속도'],
      },
      {
        name: '드론 조종사',
        reason: '장비를 직접 다루며 현장의 변화를 빠르게 읽는 일이 잘 맞아요.',
        fitTags: ['조작', '관찰', '집중'],
      },
      {
        name: '스포츠 트레이너',
        reason: '몸의 움직임을 살피고 바로 연습 방법을 바꿔주는 실전 감각을 사용할 수 있어요.',
        fitTags: ['운동', '코칭', '현장'],
      },
      {
        name: '자동차 정비사',
        reason: '고장의 원인을 직접 확인하고 손으로 고쳐내는 과정에서 강점이 빛나요.',
        fitTags: ['도구', '수리', '실험'],
      },
      {
        name: '여행 가이드',
        reason: '사람들과 함께 움직이며 상황에 맞춰 즐겁고 안전한 길을 안내할 수 있어요.',
        fitTags: ['활동', '소통', '대처'],
      },
      {
        name: '무대 기술자',
        reason: '공연 현장에서 조명과 장비를 빠르게 확인하고 문제를 해결하는 일이 어울려요.',
        fitTags: ['장비', '순발력', '무대'],
      },
    ],
    strengths: ['위기 대처', '도구 다루기', '현장 관찰', '분위기 전환'],
    missions: ['과학 실험 장비 맡아보기', '학교 행사 안전 동선 그려보기', '새 스포츠 기술 익히기'],
  },
  together_observe_care_plan: {
    headline: '사람을 살피고 차근차근 도와주는 힘',
    summary: '친구들의 표정과 필요한 것을 잘 알아차리고, 모두가 편안하게 참여하도록 챙기는 장점이 보여요.',
    topCareer: {
      name: '초등교사',
      reason:
        '아이들이 무엇을 어려워하는지 살피고 차근차근 설명하는 일이 잘 맞아요. 따뜻하게 도와주면서도 수업과 생활을 안정적으로 이끄는 힘이 선생님에게 중요해요.',
      fitTags: ['친절함', '설명', '책임감'],
    },
    recommendations: [
      {
        name: '간호사',
        reason: '아픈 사람의 상태를 세심하게 살피고 필요한 도움을 꾸준히 주는 일이 잘 맞아요.',
        fitTags: ['돌봄', '관찰', '성실함'],
      },
      {
        name: '상담교사',
        reason: '친구의 마음을 듣고 학교생활을 더 편하게 만들 방법을 함께 찾을 수 있어요.',
        fitTags: ['공감', '대화', '안정'],
      },
      {
        name: '영양사',
        reason: '사람들이 건강하게 먹을 수 있도록 계획하고 챙기는 일에 어울려요.',
        fitTags: ['건강', '계획', '세심함'],
      },
      {
        name: '박물관 교육사',
        reason: '관찰한 내용을 아이들이 이해하기 쉽게 설명하고 체험 활동을 준비할 수 있어요.',
        fitTags: ['교육', '자료', '안내'],
      },
      {
        name: '사회복지사',
        reason: '도움이 필요한 사람을 찾아 실제로 필요한 지원을 연결하는 일이 잘 맞아요.',
        fitTags: ['배려', '연결', '실천'],
      },
      {
        name: '호텔리어',
        reason: '사람들이 편안하게 머물 수 있도록 필요한 것을 미리 챙기는 장점을 사용할 수 있어요.',
        fitTags: ['서비스', '친절', '정리'],
      },
    ],
    strengths: ['분위기 만들기', '생활 규칙 챙기기', '세심한 도움', '말로 응원하기'],
    missions: ['새 친구 학교 안내하기', '생일 축하 진행 맡기', '감사 카드 프로젝트 열기'],
  },
  together_observe_care_flex: {
    headline: '밝은 에너지로 사람들을 즐겁게 하는 힘',
    summary: '사람들 앞에서 자연스럽게 표현하고, 그 순간에 맞는 즐거운 방법을 잘 찾아요.',
    topCareer: {
      name: '방송 진행자',
      reason:
        '사람들과 눈을 맞추고 분위기를 살리며 이야기를 이어가는 일이 잘 맞아요. 즉석에서 반응하고 모두가 즐겁게 참여하도록 만드는 힘이 방송 진행자에게 중요해요.',
      fitTags: ['표현력', '소통', '순발력'],
    },
    recommendations: [
      {
        name: '배우',
        reason: '몸짓과 표정으로 감정을 전하고 사람들의 관심을 모으는 장점을 살릴 수 있어요.',
        fitTags: ['무대', '감정', '표현'],
      },
      {
        name: '댄서',
        reason: '몸으로 리듬을 표현하고 관객과 에너지를 주고받는 일이 어울려요.',
        fitTags: ['활동', '리듬', '연습'],
      },
      {
        name: '이벤트 플래너',
        reason: '사람들이 즐거워할 순간을 떠올리고 현장에서 유연하게 진행할 수 있어요.',
        fitTags: ['기획', '현장', '즐거움'],
      },
      {
        name: '패션 스타일리스트',
        reason: '색과 분위기를 빠르게 살피고 사람에게 어울리는 표현을 찾아줄 수 있어요.',
        fitTags: ['감각', '사람', '표현'],
      },
      {
        name: '콘텐츠 진행자',
        reason: '재미있는 주제를 사람들에게 쉽게 전달하고 반응을 이끌어내는 일이 잘 맞아요.',
        fitTags: ['콘텐츠', '소통', '재치'],
      },
      {
        name: '레크리에이션 강사',
        reason: '친구들이 함께 웃고 움직일 수 있는 활동을 만드는 힘을 사용할 수 있어요.',
        fitTags: ['활기', '진행', '협동'],
      },
    ],
    strengths: ['무대 매너', '즉흥 표현', '친구와 어울리기', '즐거운 아이디어'],
    missions: ['학급 행사 사회 보기', '짧은 공연 영상 만들기', '체육대회 응원 구호 짜기'],
  },
  together_imagine_solve_plan: {
    headline: '큰 목표를 세우고 새 길을 만드는 힘',
    summary: '큰 그림을 보고 필요한 전략을 세우며, 사람들과 함께 결과를 만들고 싶어 하는 장점이 보여요.',
    topCareer: {
      name: '창업가',
      reason:
        '새로운 아이디어를 실제 서비스나 물건으로 만들고 사람들을 모아 실행하는 일이 잘 맞아요. 목표를 세우고 필요한 결정을 하는 힘이 창업가에게 중요해요.',
      fitTags: ['목표', '전략', '도전'],
    },
    recommendations: [
      {
        name: '제품 관리자',
        reason: '사람들이 원하는 것을 상상하고 팀과 함께 실제 제품으로 완성하는 일이 어울려요.',
        fitTags: ['기획', '팀워크', '결정'],
      },
      {
        name: '전략 컨설턴트',
        reason: '복잡한 문제를 큰 그림으로 보고 더 나은 방향을 제안하는 힘을 사용할 수 있어요.',
        fitTags: ['분석', '전략', '설득'],
      },
      {
        name: '도시 혁신 기획자',
        reason: '미래의 도시가 더 편리해질 방법을 상상하고 계획으로 만드는 일이 잘 맞아요.',
        fitTags: ['미래', '공공성', '계획'],
      },
      {
        name: '광고기획자',
        reason: '사람들의 마음을 움직일 아이디어를 세우고 캠페인으로 완성할 수 있어요.',
        fitTags: ['아이디어', '설득', '기획'],
      },
      {
        name: '정책연구원',
        reason: '사회 문제를 살피고 더 좋은 규칙과 방향을 제안하는 일에 어울려요.',
        fitTags: ['사회', '분석', '책임'],
      },
      {
        name: '우주항공 프로젝트 리더',
        reason: '큰 목표를 여러 단계로 나누고 팀이 함께 완성하도록 이끄는 힘을 살릴 수 있어요.',
        fitTags: ['미래', '과학', '리더십'],
      },
    ],
    strengths: ['큰 계획 세우기', '논리적으로 말하기', '팀 이끌기', '결과 점검하기'],
    missions: ['가상의 회사 대표 되어보기', '모둠 목표표 만들기', '토론에서 주장 정리하기'],
  },
  together_imagine_solve_flex: {
    headline: '새로운 생각을 빠르게 실험하는 힘',
    summary: '당연해 보이는 것도 다르게 바라보고, 친구들과 말하며 아이디어를 크게 키우는 장점이 보여요.',
    topCareer: {
      name: '게임 기획자',
      reason:
        '새로운 규칙과 세계를 상상하고 사람들이 재미있게 즐길 방법을 만드는 일이 잘 맞아요. 아이디어를 빠르게 말하고 바꾸며 더 좋은 방향을 찾는 힘이 게임 기획자에게 중요해요.',
      fitTags: ['아이디어', '규칙 만들기', '실험'],
    },
    recommendations: [
      {
        name: '발명가',
        reason: '불편한 점을 발견하고 새로운 물건이나 방법으로 바꾸는 일을 즐길 수 있어요.',
        fitTags: ['호기심', '개선', '도전'],
      },
      {
        name: '앱 서비스 기획자',
        reason: '사람들이 쓰기 편한 기능을 상상하고 빠르게 시험해보는 일이 잘 맞아요.',
        fitTags: ['디지털', '기획', '실험'],
      },
      {
        name: '로봇공학자',
        reason: '상상한 움직임을 실제 기계와 코드로 만들어보는 과정에서 강점이 보여요.',
        fitTags: ['기술', '상상', '문제 해결'],
      },
      {
        name: '과학 커뮤니케이터',
        reason: '어려운 과학 이야기를 재미있는 질문과 설명으로 사람들에게 전할 수 있어요.',
        fitTags: ['질문', '소통', '과학'],
      },
      {
        name: 'AR/VR 개발자',
        reason: '현실과 상상을 섞어 새로운 체험을 만드는 일이 잘 맞아요.',
        fitTags: ['미래', '콘텐츠', '기술'],
      },
      {
        name: '브랜드 네이밍 전문가',
        reason: '짧고 기억에 남는 말로 새로운 아이디어의 매력을 표현할 수 있어요.',
        fitTags: ['언어', '창의', '설득'],
      },
    ],
    strengths: ['새 관점 찾기', '재미있는 질문', '빠른 실험', '아이디어 연결'],
    missions: ['불편한 물건 개선안 그리기', '친구들과 1분 토론하기', '앱 아이디어 이름 붙이기'],
  },
  together_imagine_care_plan: {
    headline: '사람의 가능성을 보고 키워주는 힘',
    summary: '친구들의 장점을 잘 발견하고, 모두가 더 좋은 방향으로 성장하도록 이끄는 장점이 보여요.',
    topCareer: {
      name: '진로상담가',
      reason:
        '사람이 무엇을 좋아하고 잘할 수 있는지 함께 찾아주는 일이 잘 맞아요. 따뜻하게 듣고 미래 계획을 세워주는 힘이 진로상담가에게 중요해요.',
      fitTags: ['공감', '성장', '미래 계획'],
    },
    recommendations: [
      {
        name: '청소년 지도사',
        reason: '친구들이 함께 배우고 성장할 수 있는 활동을 계획하고 이끌 수 있어요.',
        fitTags: ['교육', '리더십', '배려'],
      },
      {
        name: '코치',
        reason: '사람의 강점을 발견하고 목표를 향해 꾸준히 나아가도록 도와주는 일이 잘 맞아요.',
        fitTags: ['응원', '목표', '성장'],
      },
      {
        name: '교육 콘텐츠 기획자',
        reason: '재미있게 배울 수 있는 수업과 자료를 상상하고 계획하는 힘을 사용할 수 있어요.',
        fitTags: ['교육', '아이디어', '기획'],
      },
      {
        name: '공익 캠페인 기획자',
        reason: '사람들이 함께 좋은 변화를 만들도록 메시지와 활동을 설계할 수 있어요.',
        fitTags: ['사회', '소통', '가치'],
      },
      {
        name: '어린이 방송 진행자',
        reason: '아이들이 이해하기 쉽게 말하고 즐겁게 참여하도록 돕는 일이 어울려요.',
        fitTags: ['표현', '교육', '친근함'],
      },
      {
        name: '문화기획자',
        reason: '사람들이 의미 있게 만나는 공연과 전시, 활동을 계획하는 일이 잘 맞아요.',
        fitTags: ['문화', '사람', '기획'],
      },
    ],
    strengths: ['응원하기', '갈등 풀기', '좋은 말 전하기', '함께 목표 세우기'],
    missions: ['친구 장점 인터뷰하기', '학급 캠페인 기획하기', '어린이 뉴스 진행해보기'],
  },
  together_imagine_care_flex: {
    headline: '사람과 이야기를 즐겁게 연결하는 힘',
    summary: '상상한 것을 사람들과 나누며 새로운 이야기와 활동으로 크게 키우는 장점이 보여요.',
    topCareer: {
      name: '문화콘텐츠 기획자',
      reason:
        '사람들이 좋아할 이야기와 체험을 상상하고 함께 즐길 수 있는 콘텐츠로 만드는 일이 잘 맞아요. 밝은 에너지와 따뜻한 상상력이 문화콘텐츠 기획에서 크게 쓰여요.',
      fitTags: ['상상력', '소통', '콘텐츠'],
    },
    recommendations: [
      {
        name: '작가',
        reason: '사람의 마음을 움직이는 이야기와 장면을 자유롭게 만들어낼 수 있어요.',
        fitTags: ['이야기', '감성', '표현'],
      },
      {
        name: '캐릭터 기획자',
        reason: '개성 있는 인물과 세계를 만들고 사람들이 좋아할 매력을 찾는 일이 잘 맞아요.',
        fitTags: ['상상', '디자인', '기획'],
      },
      {
        name: '축제 기획자',
        reason: '사람들이 함께 즐길 순간을 상상하고 다양한 활동으로 연결할 수 있어요.',
        fitTags: ['행사', '사람', '창의'],
      },
      {
        name: '음악 프로듀서',
        reason: '분위기와 감정을 소리로 표현하고 여러 사람의 아이디어를 모을 수 있어요.',
        fitTags: ['음악', '감각', '협업'],
      },
      {
        name: '캠페인 디자이너',
        reason: '좋은 메시지를 사람들이 기억하기 쉬운 이미지와 활동으로 만들 수 있어요.',
        fitTags: ['가치', '디자인', '소통'],
      },
      {
        name: '여행 작가',
        reason: '새로운 장소에서 느낀 점을 이야기로 풀어 사람들에게 전하는 일이 어울려요.',
        fitTags: ['탐험', '글쓰기', '공유'],
      },
    ],
    strengths: ['이야기 만들기', '친구 연결하기', '새로운 시도', '밝은 에너지'],
    missions: ['나만의 축제 기획서 쓰기', '캐릭터 세계관 만들기', '환경 캠페인 포스터 만들기'],
  },
  focus_observe_solve_plan: {
    headline: '정확하게 살피고 믿음직하게 완성하는 힘',
    summary: '자료와 규칙을 꼼꼼히 확인하고, 맡은 일을 안정적으로 끝내는 장점이 보여요.',
    topCareer: {
      name: '약사',
      reason:
        '정확한 정보를 확인하고 사람에게 필요한 약과 사용 방법을 차분히 알려주는 일이 잘 맞아요. 작은 실수도 놓치지 않는 꼼꼼함이 약사에게 매우 중요해요.',
      fitTags: ['정확함', '건강', '책임감'],
    },
    recommendations: [
      {
        name: '회계사',
        reason: '숫자와 자료를 꼼꼼히 확인하고 정확한 결과를 만드는 힘을 사용할 수 있어요.',
        fitTags: ['숫자', '정리', '신뢰'],
      },
      {
        name: '사서',
        reason: '책과 자료를 차분히 분류하고 필요한 정보를 찾아주는 일이 잘 맞아요.',
        fitTags: ['자료', '정리', '집중'],
      },
      {
        name: '품질관리 전문가',
        reason: '제품이 안전하고 정확하게 만들어졌는지 세심하게 확인하는 일이 어울려요.',
        fitTags: ['검사', '기준', '완성도'],
      },
      {
        name: '기록관리사',
        reason: '중요한 기록을 빠짐없이 정리하고 오래 보관하는 일에 강점이 있어요.',
        fitTags: ['문서', '질서', '보관'],
      },
      {
        name: '보험계리사',
        reason: '숫자와 가능성을 차분히 계산해 사람들이 준비할 수 있게 돕는 일이 잘 맞아요.',
        fitTags: ['계산', '분석', '예측'],
      },
      {
        name: '연구실 안전관리자',
        reason: '실험실의 규칙과 위험 요소를 꼼꼼히 살피는 책임감이 잘 쓰여요.',
        fitTags: ['안전', '규칙', '관찰'],
      },
    ],
    strengths: ['자료 정리', '규칙 지키기', '실수 찾기', '꾸준한 연습'],
    missions: ['학급 물품 목록 만들기', '도서 분류표 정리하기', '실험 기록장 써보기'],
  },
  focus_observe_solve_flex: {
    headline: '조용히 원리를 파악하고 직접 고치는 힘',
    summary: '말보다 손으로 확인하며, 복잡한 도구와 장치의 원리를 차분히 찾아내는 장점이 보여요.',
    topCareer: {
      name: '로봇 기술자',
      reason:
        '기계가 어떻게 움직이는지 살피고 직접 고쳐보는 일이 잘 맞아요. 원리를 파악한 뒤 여러 방법으로 시험해보는 힘이 로봇 기술자에게 중요해요.',
      fitTags: ['기계', '원리', '실험'],
    },
    recommendations: [
      {
        name: '기계공학자',
        reason: '움직이는 구조를 분석하고 더 튼튼하고 편리하게 만드는 일에 어울려요.',
        fitTags: ['구조', '설계', '문제 해결'],
      },
      {
        name: '자동차 정비사',
        reason: '소리와 움직임을 관찰해 고장의 원인을 찾아내는 힘을 사용할 수 있어요.',
        fitTags: ['수리', '관찰', '도구'],
      },
      {
        name: '게임 개발자',
        reason: '규칙과 코드를 직접 시험하며 재미있는 움직임을 만드는 일이 잘 맞아요.',
        fitTags: ['코딩', '실험', '집중'],
      },
      {
        name: '음향 엔지니어',
        reason: '소리의 차이를 세밀하게 듣고 장비를 조절하는 감각이 잘 쓰여요.',
        fitTags: ['소리', '장비', '섬세함'],
      },
      {
        name: '정보보안 전문가',
        reason: '시스템의 약한 부분을 조용히 찾아내고 안전하게 고치는 일이 어울려요.',
        fitTags: ['분석', '보안', '집중'],
      },
      {
        name: '3D 프린팅 전문가',
        reason: '모양과 구조를 직접 만들고 실패한 부분을 고쳐가며 완성할 수 있어요.',
        fitTags: ['제작', '도구', '개선'],
      },
    ],
    strengths: ['분해하고 조립하기', '원리 찾기', '차분한 해결', '도구 활용'],
    missions: ['고장 난 장난감 원인 찾기', '간단한 코딩 게임 만들기', '종이 구조물 튼튼하게 만들기'],
  },
  focus_observe_care_plan: {
    headline: '필요한 것을 세심하게 챙기는 힘',
    summary: '작은 변화도 잘 알아차리고, 누군가에게 실제로 도움이 되는 일을 꾸준히 해내는 장점이 보여요.',
    topCareer: {
      name: '간호사',
      reason:
        '사람의 상태를 세심하게 살피고 필요한 도움을 차근차근 주는 일이 잘 맞아요. 따뜻한 마음과 꼼꼼한 확인이 함께 필요한 직업이에요.',
      fitTags: ['돌봄', '관찰', '성실함'],
    },
    recommendations: [
      {
        name: '물리치료사',
        reason: '몸의 움직임을 살피고 꾸준히 회복을 도와주는 일에 어울려요.',
        fitTags: ['건강', '관찰', '꾸준함'],
      },
      {
        name: '특수교사',
        reason: '아이마다 필요한 도움을 다르게 살피고 천천히 성장하도록 돕는 힘을 사용할 수 있어요.',
        fitTags: ['교육', '배려', '인내'],
      },
      {
        name: '영양사',
        reason: '사람에게 필요한 식단을 꼼꼼히 계획하고 건강을 챙기는 일이 잘 맞아요.',
        fitTags: ['건강', '계획', '세심함'],
      },
      {
        name: '의료기록사',
        reason: '중요한 의료 정보를 정확하게 정리하고 필요한 사람이 찾을 수 있게 돕는 일이 어울려요.',
        fitTags: ['기록', '정확함', '책임'],
      },
      {
        name: '아동발달 전문가',
        reason: '아이의 작은 성장과 변화를 살피고 필요한 도움을 연결할 수 있어요.',
        fitTags: ['아이', '관찰', '도움'],
      },
      {
        name: '보건교사',
        reason: '학교에서 친구들의 건강을 챙기고 안전한 생활을 알려주는 일이 잘 맞아요.',
        fitTags: ['학교', '건강', '돌봄'],
      },
    ],
    strengths: ['필요한 것 챙기기', '차분한 설명', '정리정돈', '꾸준한 도움'],
    missions: ['친구 준비물 도우미 하기', '식물 성장 기록하기', '작은 봉사 활동 계획하기'],
  },
  focus_observe_care_flex: {
    headline: '감각으로 세상을 부드럽게 표현하는 힘',
    summary: '조용히 관찰하며 색, 모양, 자연스러운 분위기를 자기만의 방식으로 표현하는 장점이 보여요.',
    topCareer: {
      name: '플로리스트',
      reason:
        '꽃과 색을 세심하게 관찰하고 사람의 마음에 어울리는 작품으로 만드는 일이 잘 맞아요. 조용한 집중력과 따뜻한 감각이 플로리스트에게 중요해요.',
      fitTags: ['색감', '자연', '섬세함'],
    },
    recommendations: [
      {
        name: '사진작가',
        reason: '빛과 표정을 조용히 관찰해 특별한 순간으로 남기는 일이 어울려요.',
        fitTags: ['관찰', '감각', '기록'],
      },
      {
        name: '동물훈련사',
        reason: '동물의 작은 반응을 살피고 부드럽게 소통하는 힘을 사용할 수 있어요.',
        fitTags: ['동물', '인내', '교감'],
      },
      {
        name: '요리사',
        reason: '맛과 향, 모양을 직접 느끼며 사람을 기쁘게 하는 음식을 만들 수 있어요.',
        fitTags: ['감각', '손재주', '창작'],
      },
      {
        name: '공예가',
        reason: '손끝의 느낌을 살려 작고 아름다운 작품을 완성하는 일이 잘 맞아요.',
        fitTags: ['손재주', '집중', '작품'],
      },
      {
        name: '인테리어 스타일리스트',
        reason: '공간의 분위기를 관찰하고 편안하게 바꾸는 감각을 사용할 수 있어요.',
        fitTags: ['공간', '색감', '배려'],
      },
      {
        name: '반려동물 미용사',
        reason: '동물을 차분히 다루고 예쁘고 편안하게 돌보는 일이 어울려요.',
        fitTags: ['동물', '섬세함', '돌봄'],
      },
    ],
    strengths: ['색과 모양 고르기', '섬세한 관찰', '따뜻한 배려', '작품 완성'],
    missions: ['교실 꽃 장식하기', '하루 사진 일기 만들기', '나만의 캐릭터 스타일 정하기'],
  },
  focus_imagine_solve_plan: {
    headline: '미래의 구조를 깊게 설계하는 힘',
    summary: '혼자 오래 생각하며 정확한 계획을 세우고, 아직 없는 미래의 시스템을 상상하는 장점이 보여요.',
    topCareer: {
      name: 'AI 연구원',
      reason:
        '복잡한 문제를 깊게 생각하고 새로운 기술로 해결하는 일이 잘 맞아요. 멀리 있는 목표를 향해 차근차근 연구하는 힘이 AI 연구원에게 중요해요.',
      fitTags: ['연구', '논리', '미래 기술'],
    },
    recommendations: [
      {
        name: '데이터 과학자',
        reason: '많은 정보 속에서 규칙을 찾고 더 좋은 결정을 돕는 일이 어울려요.',
        fitTags: ['분석', '자료', '예측'],
      },
      {
        name: '우주공학자',
        reason: '먼 미래의 목표를 상상하고 복잡한 장치를 설계하는 힘을 사용할 수 있어요.',
        fitTags: ['우주', '설계', '탐구'],
      },
      {
        name: '정보보안 연구원',
        reason: '보이지 않는 위험을 깊게 분석하고 안전한 방법을 만드는 일이 잘 맞아요.',
        fitTags: ['보안', '분석', '집중'],
      },
      {
        name: '반도체 설계자',
        reason: '작고 정교한 구조를 계획하고 정확하게 완성하는 일에 어울려요.',
        fitTags: ['정밀함', '기술', '설계'],
      },
      {
        name: '기후 과학자',
        reason: '큰 자연 현상을 자료로 분석하고 미래를 예측하는 힘을 살릴 수 있어요.',
        fitTags: ['지구', '데이터', '미래'],
      },
      {
        name: '수학자',
        reason: '어려운 문제를 깊이 생각하고 보이지 않는 규칙을 찾아내는 일이 잘 맞아요.',
        fitTags: ['논리', '집중', '원리'],
      },
    ],
    strengths: ['깊은 분석', '큰 그림 설계', '혼자 집중', '장기 목표'],
    missions: ['미래 도시 지도 그리기', '어려운 퍼즐 풀이 기록하기', '관심 분야 연구 노트 만들기'],
  },
  focus_imagine_solve_flex: {
    headline: '끝없이 질문하며 원리를 찾는 힘',
    summary: '정답만 외우기보다 왜 그런지 알고 싶어 하고, 새로운 지식을 조용히 연결하는 장점이 보여요.',
    topCareer: {
      name: '과학자',
      reason:
        '궁금한 것을 끝까지 질문하고 실험으로 확인하는 일이 잘 맞아요. 보이지 않는 원리를 찾아내려는 호기심이 과학자에게 큰 힘이 돼요.',
      fitTags: ['호기심', '실험', '원리'],
    },
    recommendations: [
      {
        name: '소프트웨어 개발자',
        reason: '문제를 작은 규칙으로 나누고 코드로 해결하는 과정에서 강점이 보여요.',
        fitTags: ['코딩', '논리', '집중'],
      },
      {
        name: '천문학자',
        reason: '우주처럼 큰 질문을 오래 탐구하고 자료를 연결하는 일이 어울려요.',
        fitTags: ['우주', '탐구', '상상'],
      },
      {
        name: '게임 시스템 디자이너',
        reason: '게임 속 규칙이 어떻게 재미를 만드는지 분석하고 새롭게 바꿀 수 있어요.',
        fitTags: ['규칙', '아이디어', '실험'],
      },
      {
        name: '알고리즘 연구원',
        reason: '더 빠르고 똑똑한 해결 순서를 찾는 논리적인 일이 잘 맞아요.',
        fitTags: ['논리', '문제 해결', '연구'],
      },
      {
        name: '해양생물학자',
        reason: '아직 모르는 생물과 환경을 관찰하고 질문하는 탐구심을 사용할 수 있어요.',
        fitTags: ['자연', '관찰', '연구'],
      },
      {
        name: '논리 퍼즐 제작자',
        reason: '사람들이 생각하며 풀 수 있는 규칙과 문제를 만드는 일이 어울려요.',
        fitTags: ['퍼즐', '논리', '창의'],
      },
    ],
    strengths: ['가설 세우기', '원리 설명', '복잡한 생각 정리', '새 지식 탐색'],
    missions: ['왜 질문 10개 적기', '보드게임 규칙 바꿔보기', '관심 과학자 조사하기'],
  },
  focus_imagine_care_plan: {
    headline: '마음의 의미를 깊게 살피는 힘',
    summary: '사람의 마음과 세상의 의미를 깊게 생각하고, 조용하지만 따뜻한 변화를 만들고 싶어 해요.',
    topCareer: {
      name: '심리상담사',
      reason:
        '사람의 마음을 깊이 듣고 더 편안한 길을 함께 찾는 일이 잘 맞아요. 차분한 집중력과 따뜻한 이해심이 심리상담사에게 중요해요.',
      fitTags: ['공감', '깊이 듣기', '도움'],
    },
    recommendations: [
      {
        name: '작가',
        reason: '사람의 마음과 세상의 의미를 글로 차분히 표현하는 힘을 사용할 수 있어요.',
        fitTags: ['글쓰기', '통찰', '감성'],
      },
      {
        name: '특수교사',
        reason: '아이마다 다른 필요를 깊게 이해하고 꾸준히 도와주는 일이 잘 맞아요.',
        fitTags: ['교육', '배려', '인내'],
      },
      {
        name: '미술치료사',
        reason: '말로 하기 어려운 마음을 그림과 활동으로 표현하도록 도울 수 있어요.',
        fitTags: ['예술', '마음', '치유'],
      },
      {
        name: '교육연구원',
        reason: '아이들이 더 잘 배울 수 있는 방법을 깊게 연구하고 제안하는 일이 어울려요.',
        fitTags: ['연구', '교육', '계획'],
      },
      {
        name: '도서 큐레이터',
        reason: '사람에게 필요한 책과 이야기를 골라 의미 있게 연결할 수 있어요.',
        fitTags: ['책', '의미', '안내'],
      },
      {
        name: '공익 캠페인 기획자',
        reason: '세상을 더 따뜻하게 만드는 메시지를 차분히 계획하고 전할 수 있어요.',
        fitTags: ['가치', '사회', '표현'],
      },
    ],
    strengths: ['깊이 듣기', '좋은 글 쓰기', '사람의 장점 발견', '조용한 리더십'],
    missions: ['친구 인터뷰 글 쓰기', '도움이 필요한 문제 조사하기', '나만의 가치 사전 만들기'],
  },
  focus_imagine_care_flex: {
    headline: '상상과 마음을 작품으로 표현하는 힘',
    summary: '자기만의 세계가 풍부하고, 따뜻한 이야기와 아름다운 표현으로 마음을 움직이는 장점이 보여요.',
    topCareer: {
      name: '웹툰 작가',
      reason:
        '상상한 캐릭터와 이야기를 그림으로 표현하는 일이 잘 맞아요. 혼자 깊게 몰입하면서도 사람의 감정을 섬세하게 담아내는 힘이 웹툰 작가에게 중요해요.',
      fitTags: ['상상력', '그림', '이야기'],
    },
    recommendations: [
      {
        name: '동화작가',
        reason: '따뜻한 메시지를 어린이가 이해하기 쉬운 이야기로 만드는 힘을 사용할 수 있어요.',
        fitTags: ['글쓰기', '상상', '감성'],
      },
      {
        name: '일러스트레이터',
        reason: '말로 하기 어려운 느낌을 색과 그림으로 표현하는 일이 어울려요.',
        fitTags: ['그림', '색감', '표현'],
      },
      {
        name: '게임 스토리 작가',
        reason: '캐릭터와 세계관을 깊게 만들고 플레이어가 몰입할 이야기를 쓸 수 있어요.',
        fitTags: ['세계관', '이야기', '상상'],
      },
      {
        name: '캐릭터 디자이너',
        reason: '인물의 성격과 마음을 모양과 표정으로 보여주는 일이 잘 맞아요.',
        fitTags: ['캐릭터', '디자인', '감정'],
      },
      {
        name: '음악가',
        reason: '마음속 느낌을 소리와 리듬으로 표현하는 힘을 살릴 수 있어요.',
        fitTags: ['음악', '감성', '몰입'],
      },
      {
        name: '동물보호 활동가',
        reason: '말 못 하는 동물의 마음을 생각하고 따뜻하게 돕는 일에 어울려요.',
        fitTags: ['동물', '배려', '가치'],
      },
    ],
    strengths: ['이야기 짓기', '감정 표현', '혼자 몰입', '가치 지키기'],
    missions: ['짧은 동화 쓰기', '나만의 캐릭터에게 편지 쓰기', '좋아하는 노래 소개 카드 만들기'],
  },
};

const careerCategories: CareerCategory[] = [
  {
    title: '과학·연구',
    accent: '#2f80ed',
    icon: Microscope,
    careers: [
      '과학자',
      '천문학자',
      '해양생물학자',
      '기후 과학자',
      '의학 연구원',
      '신약개발 연구원',
      '유전공학자',
      '로봇공학자',
      '우주공학자',
      '생태연구원',
      '고고학자',
      '심리학자',
      '수학자',
      '통계학자',
      '식품연구원',
      '실험물리학자',
      '에너지 시스템 연구원',
      '발명 연구원',
    ],
  },
  {
    title: '기술·디지털',
    accent: '#197a8c',
    icon: Code2,
    careers: [
      '소프트웨어 개발자',
      '게임 개발자',
      'AI 연구원',
      '데이터 과학자',
      '정보보안 전문가',
      '정보보안 연구원',
      '앱 서비스 기획자',
      'UX 디자이너',
      'UX 리서처',
      '웹 디자이너',
      'AR/VR 개발자',
      '드론 엔지니어',
      '반도체 설계자',
      '시스템 아키텍트',
      '로봇 알고리즘 개발자',
      '클라우드 엔지니어',
      '디지털 포렌식 전문가',
      '게임 시스템 디자이너',
      '게임 엔진 개발자',
      '데이터베이스 관리자',
      '3D 프린팅 전문가',
    ],
  },
  {
    title: '예술·콘텐츠',
    accent: '#d85b4a',
    icon: Palette,
    careers: [
      '웹툰 작가',
      '애니메이션 작가',
      '애니메이터',
      '일러스트레이터',
      '사진작가',
      '영화감독',
      '방송 PD',
      '방송 진행자',
      '작가',
      '동화작가',
      '시인',
      '뮤지컬 배우',
      '음악 프로듀서',
      '음악가',
      '게임 스토리 작가',
      '캐릭터 디자이너',
      '캐릭터 기획자',
      '패션 디자이너',
      '패션 스타일리스트',
      '인테리어 디자이너',
      '아트 디렉터',
      '영상 편집자',
      '무대 디자이너',
      '큐레이터',
      '공연 연출가',
      '콘텐츠 프로듀서',
      '콘텐츠 진행자',
      '문화콘텐츠 기획자',
    ],
  },
  {
    title: '사람·교육',
    accent: '#8a5a22',
    icon: HeartHandshake,
    careers: [
      '초등교사',
      '특수교사',
      '상담교사',
      '진로상담가',
      '유치원교사',
      '청소년 지도사',
      '코치',
      '리더십 강사',
      'HR 매니저',
      '통역사',
      '사회복지사',
      '심리상담사',
      '교육 콘텐츠 기획자',
      '독서지도사',
      '박물관 교육사',
      '문화기획자',
      '창의교육가',
      '어린이 방송 진행자',
      '학교 상담 프로그램 기획자',
      '커뮤니티 리더',
    ],
  },
  {
    title: '의료·돌봄',
    accent: '#c24164',
    icon: HeartPulse,
    careers: [
      '의사',
      '간호사',
      '약사',
      '수의사',
      '물리치료사',
      '작업치료사',
      '치과위생사',
      '영양사',
      '응급구조사',
      '임상심리사',
      '아동발달 전문가',
      '재활 트레이너',
      '의료기록사',
      '보건교사',
      '수의테크니션',
      '병원 코디네이터',
      '의료사회복지사',
      '미술치료사',
    ],
  },
  {
    title: '비즈니스·리더십',
    accent: '#7a4cc2',
    icon: BriefcaseBusiness,
    careers: [
      '창업가',
      'CEO',
      '제품 관리자',
      '프로젝트 매니저',
      '전략 컨설턴트',
      '광고기획자',
      '광고 크리에이터',
      '브랜드 기획자',
      '브랜드 매니저',
      '마케터',
      '투자분석가',
      '회계사',
      '세무사',
      '물류관리자',
      '호텔리어',
      '쇼호스트',
      '고객경험 매니저',
      '비즈니스 개발자',
      '브랜드 총괄',
      '미래 산업 분석가',
    ],
  },
  {
    title: '사회·안전·공공',
    accent: '#386641',
    icon: ShieldCheck,
    careers: [
      '소방관',
      '소방대장',
      '경찰관',
      '변호사',
      '인권변호사',
      '판사',
      '공무원',
      '외교관',
      '국제기구 활동가',
      '국제기구 기획자',
      '환경운동가',
      '도시계획가',
      '도시 혁신 기획자',
      '재난안전 전문가',
      '항공관제사',
      '철도 관제사',
      '군 장교',
      '인권활동가',
      '정책연구원',
      '법무사',
      '안전관리 전문가',
    ],
  },
  {
    title: '자연·현장·스포츠',
    accent: '#d97706',
    icon: Sprout,
    careers: [
      '셰프',
      '베이커',
      '플로리스트',
      '목공예가',
      '공예가',
      '도예가',
      '자동차 정비사',
      '항공정비사',
      '전기기술자',
      '건축가',
      '건설관리자',
      '조경가',
      '농업기술자',
      '동물훈련사',
      '동물보호 활동가',
      '반려동물 미용사',
      '자연해설사',
      '스포츠 선수',
      '스포츠 트레이너',
      '스포츠 감독',
      '여행 가이드',
      '파일럿',
      '드론 조종사',
      '체육교사',
      '해양 구조대원',
      '스마트팜 기술자',
      '무대 기술자',
    ],
  },
];

const axisLabels: Record<
  ExplorationAxis,
  { left: ChoiceKey; right: ChoiceKey; title: string; leftLabel: string; rightLabel: string }
> = {
  energy: { left: 'together', right: 'focus', title: '활동 방식', leftLabel: '함께하기', rightLabel: '혼자집중' },
  information: {
    left: 'observe',
    right: 'imagine',
    title: '생각 재료',
    leftLabel: '실제관찰',
    rightLabel: '상상아이디어',
  },
  decision: { left: 'solve', right: 'care', title: '도움 방식', leftLabel: '논리해결', rightLabel: '마음도움' },
  pace: { left: 'plan', right: 'flex', title: '진행 방식', leftLabel: '계획형', rightLabel: '탐험형' },
};

const initialScores: ScoreMap = {
  together: 0,
  focus: 0,
  observe: 0,
  imagine: 0,
  solve: 0,
  care: 0,
  plan: 0,
  flex: 0,
};

const swapChoice = (choice: ChoiceKey): ChoiceKey => {
  const swaps: Record<ChoiceKey, ChoiceKey> = {
    together: 'focus',
    focus: 'together',
    observe: 'imagine',
    imagine: 'observe',
    solve: 'care',
    care: 'solve',
    plan: 'flex',
    flex: 'plan',
  };

  return swaps[choice];
};

const dedupeRecommendations = (recommendations: CareerRecommendation[]) => {
  const seen = new Set<string>();
  return recommendations.filter((career) => {
    if (seen.has(career.name)) {
      return false;
    }

    seen.add(career.name);
    return true;
  });
};

function getScores(answers: AnswerMap) {
  const scores: ScoreMap = { ...initialScores };

  Object.values(answers).forEach((choice) => {
    scores[choice] += 1;
  });

  return scores;
}

function getCareerPattern(scores: ScoreMap): CareerPattern {
  const energy: EnergyKey = scores.together >= scores.focus ? 'together' : 'focus';
  const information: InfoKey = scores.observe >= scores.imagine ? 'observe' : 'imagine';
  const decision: DecisionKey = scores.solve >= scores.care ? 'solve' : 'care';
  const pace: PaceKey = scores.plan >= scores.flex ? 'plan' : 'flex';

  return `${energy}_${information}_${decision}_${pace}`;
}

function getNeighborPatterns(pattern: CareerPattern) {
  const parts = pattern.split('_') as [EnergyKey, InfoKey, DecisionKey, PaceKey];

  return parts.map((part, index) => {
    const next = [...parts] as [ChoiceKey, ChoiceKey, ChoiceKey, ChoiceKey];
    next[index] = swapChoice(part);
    return next.join('_') as CareerPattern;
  });
}

function getCareerMatches(pattern: CareerPattern, profile: CareerProfile) {
  const neighborCareers = getNeighborPatterns(pattern).flatMap((neighbor) => {
    const neighborProfile = careerProfiles[neighbor];
    if (!neighborProfile) {
      return [];
    }

    return [neighborProfile.topCareer, ...neighborProfile.recommendations.slice(0, 2)];
  });
  const explore = dedupeRecommendations([profile.topCareer, ...profile.recommendations, ...neighborCareers]).filter(
    (career) => career.name !== profile.topCareer.name,
  );

  return {
    primary: profile.recommendations.slice(0, 6),
    explore: explore.slice(6, 24),
  };
}

function App() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [showResult, setShowResult] = useState(false);

  const scores = useMemo(() => getScores(answers), [answers]);
  const careerPattern = useMemo(() => getCareerPattern(scores), [scores]);
  const profile = careerProfiles[careerPattern];
  const answeredCount = Object.keys(answers).length;
  const progress = Math.round((answeredCount / questions.length) * 100);
  const currentQuestion = questions[currentIndex];
  const currentAnswer = answers[currentQuestion.id];
  const careerMatches = useMemo(
    () => (profile ? getCareerMatches(careerPattern, profile) : { primary: [], explore: [] }),
    [careerPattern, profile],
  );
  const highlightedCareers = useMemo(() => {
    if (!profile) {
      return new Set<string>();
    }

    return new Set([
      profile.topCareer.name,
      ...careerMatches.primary.map((career) => career.name),
      ...careerMatches.explore.map((career) => career.name),
    ]);
  }, [careerMatches, profile]);
  const totalCareerCount = useMemo(
    () => new Set(careerCategories.flatMap((category) => category.careers)).size,
    [],
  );

  const chooseAnswer = (choice: ChoiceKey) => {
    const nextAnswers = { ...answers, [currentQuestion.id]: choice };
    setAnswers(nextAnswers);

    if (currentIndex < questions.length - 1) {
      window.setTimeout(() => setCurrentIndex((index) => index + 1), 160);
      return;
    }

    window.setTimeout(() => {
      setShowResult(true);
      window.requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
    }, 180);
  };

  const reset = () => {
    setAnswers({});
    setCurrentIndex(0);
    setShowResult(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const editLastAnswer = () => {
    setShowResult(false);
    setCurrentIndex(questions.length - 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <main className="app">
      <section className="topbar" aria-label="상단 정보">
        <div className="brand">
          <div className="brand-mark">
            <Compass size={22} />
          </div>
          <div>
            <strong>위키드 직업 탐험</strong>
            <span>어린이 진로 추천 테스트</span>
          </div>
        </div>
        <div className="topbar-actions">
          <span className="career-count">{totalCareerCount}+ 직업</span>
          <button className="icon-button" type="button" onClick={reset} aria-label="처음부터 다시 하기">
            <RotateCcw size={19} />
          </button>
        </div>
      </section>

      {!showResult ? (
        <section className="quiz-layout">
          <aside className="intro-panel" aria-label="테스트 정보">
            <div className="visual-board">
              <div className="visual-card visual-card-large">
                <Sparkles size={28} />
                <span>미래</span>
              </div>
              <div className="visual-card">
                <Microscope size={25} />
                <span>탐구</span>
              </div>
              <div className="visual-card">
                <Palette size={25} />
                <span>예술</span>
              </div>
              <div className="visual-card visual-card-wide">
                <Users size={25} />
                <span>팀</span>
              </div>
            </div>

            <div className="intro-copy">
              <p className="section-kicker">12문항</p>
              <h1>나와 잘 맞는 미래 직업 찾기</h1>
              <p>마음에 더 가까운 선택지를 누르면 마지막에 대표 추천 직업과 이유가 열립니다.</p>
            </div>

            <div className="progress-block">
              <div className="progress-label">
                <span>
                  {answeredCount} / {questions.length}
                </span>
                <strong>{progress}%</strong>
              </div>
              <div className="progress-track" aria-hidden="true">
                <div style={{ width: `${progress}%` }} />
              </div>
            </div>
          </aside>

          <section className="question-panel" aria-live="polite">
            <div className="question-meta">
              <span>{String(currentIndex + 1).padStart(2, '0')}</span>
              <p>{currentQuestion.eyebrow}</p>
            </div>

            <h2>{currentQuestion.text}</h2>

            <div className="options-grid">
              {currentQuestion.options.map((option) => {
                const selected = currentAnswer === option.choice;
                return (
                  <button
                    className={`option-card ${selected ? 'selected' : ''}`}
                    key={option.choice}
                    type="button"
                    onClick={() => chooseAnswer(option.choice)}
                    aria-pressed={selected}
                  >
                    <span className="option-check">
                      {selected ? <Check size={18} /> : <span className="empty-dot" aria-hidden="true" />}
                    </span>
                    <strong>{option.label}</strong>
                    <small>{option.helper}</small>
                  </button>
                );
              })}
            </div>

            <div className="question-footer">
              <button
                className="ghost-button"
                type="button"
                onClick={() => setCurrentIndex((index) => Math.max(0, index - 1))}
                disabled={currentIndex === 0}
              >
                <ArrowLeft size={18} />
                이전
              </button>
              <div className="question-dots" aria-hidden="true">
                {questions.map((question, index) => (
                  <span
                    className={`${answers[question.id] ? 'done' : ''} ${index === currentIndex ? 'active' : ''}`}
                    key={question.id}
                  />
                ))}
              </div>
            </div>
          </section>
        </section>
      ) : !profile ? (
        <section className="result-layout">
          <section className="empty-result-panel" role="status" aria-live="polite">
            <div className="empty-result-icon">
              <Compass size={42} />
            </div>
            <p className="section-kicker">결과를 찾지 못했어요</p>
            <h1>이번 답변에 딱 맞는 직업 결과가 아직 없어요</h1>
            <p>
              선택이 잘못된 것은 아니에요. 아직 이 조합에 맞는 추천 직업 카드가 준비되지 않았어요. 답변을 조금
              바꿔보거나 처음부터 다시 테스트하면 다른 직업 결과를 확인할 수 있어요.
            </p>
            <div className="empty-result-actions">
              <button className="ghost-button" type="button" onClick={editLastAnswer}>
                <ArrowLeft size={18} />
                답변 고치기
              </button>
              <button className="primary-button" type="button" onClick={reset}>
                <Wand2 size={18} />
                다시 테스트
              </button>
            </div>
          </section>
        </section>
      ) : (
        <section className="result-layout">
          <section className="result-hero career-result-hero">
            <div>
              <p className="section-kicker">추천 결과</p>
              <h1>가장 잘 맞는 직업은 {profile.topCareer.name}예요</h1>
              <p className="result-subtitle">{profile.headline}</p>
              <p className="result-description">{profile.summary}</p>
              <div className="badge-row">
                {profile.topCareer.fitTags.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>
            </div>
            <article className="top-career-card">
              <div className="top-career-icon">
                <PartyPopper size={36} />
              </div>
              <span>대표 추천</span>
              <strong>{profile.topCareer.name}</strong>
            </article>
          </section>

          <section className="why-panel">
            <div className="panel-title">
              <Brain size={20} />
              <h2>왜 잘 맞나요?</h2>
            </div>
            <p>
              {profile.summary} {profile.topCareer.reason}
            </p>
          </section>

          <section className="insight-grid career-insights">
            <div className="insight-panel">
              <div className="panel-title">
                <Sparkles size={20} />
                <h2>나의 강점 힌트</h2>
              </div>
              <div className="strength-list">
                {profile.strengths.map((strength) => (
                  <span key={strength}>{strength}</span>
                ))}
              </div>
            </div>

            <div className="insight-panel">
              <div className="panel-title">
                <Compass size={20} />
                <h2>선택에서 보인 모습</h2>
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

          <section className="career-section">
            <div className="section-heading">
              <p className="section-kicker">함께 잘 맞는 직업</p>
              <h2>추천 직업과 이유</h2>
            </div>
            <div className="career-grid primary career-reason-grid">
              {careerMatches.primary.map((career, index) => (
                <article className="career-card reason-card" key={career.name}>
                  <span>{String(index + 1).padStart(2, '0')}</span>
                  <strong>{career.name}</strong>
                  <p>{career.reason}</p>
                  <div className="fit-tag-row">
                    {career.fitTags.map((tag) => (
                      <small key={tag}>{tag}</small>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="career-section">
            <div className="section-heading">
              <p className="section-kicker">더 넓게 보기</p>
              <h2>함께 탐험할 직업</h2>
            </div>
            <div className="career-chip-grid">
              {careerMatches.explore.map((career) => (
                <span className="career-chip strong" key={career.name} title={career.reason}>
                  {career.name}
                </span>
              ))}
            </div>
          </section>

          <section className="library-section">
            <div className="section-heading">
              <p className="section-kicker">직업 지도</p>
              <h2>전체 직업 지도</h2>
            </div>
            <div className="category-grid">
              {careerCategories.map((category) => {
                const Icon = category.icon;
                return (
                  <article className="category-panel" key={category.title} style={{ '--accent': category.accent } as AccentStyle}>
                    <div className="category-title">
                      <Icon size={22} />
                      <h3>{category.title}</h3>
                    </div>
                    <div className="career-chip-grid compact">
                      {category.careers.map((career) => (
                        <span className={`career-chip ${highlightedCareers.has(career) ? 'matched' : ''}`} key={career}>
                          {career}
                        </span>
                      ))}
                    </div>
                  </article>
                );
              })}
            </div>
          </section>

          <div className="result-actions">
            <button className="ghost-button" type="button" onClick={editLastAnswer}>
              <ArrowLeft size={18} />
              답변 고치기
            </button>
            <button className="primary-button" type="button" onClick={reset}>
              <Wand2 size={18} />
              다시 테스트
            </button>
          </div>
        </section>
      )}
    </main>
  );
}

export default App;
