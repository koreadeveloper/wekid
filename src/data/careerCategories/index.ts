import {
  BookOpen,
  Clapperboard,
  Code2,
  HeartPulse,
  Landmark,
  Music2,
  ShieldCheck,
  Sprout,
  Trophy,
  Utensils,
  UsersRound,
  type LucideIcon,
} from 'lucide-react';
import { careerLibraryGroups } from '../careerCatalog';
import type { CareerCategory } from '../../types/career';

const categoryPresentation: Record<string, { accent: string; icon: LucideIcon }> = {
  '방송·콘텐츠': { accent: '#c26045', icon: Clapperboard },
  '음악·공연': { accent: '#9b5de5', icon: Music2 },
  '그림·글': { accent: '#d85b4a', icon: BookOpen },
  '게임·디지털': { accent: '#197a8c', icon: Code2 },
  스포츠: { accent: '#d97706', icon: Trophy },
  '요리·음식': { accent: '#c4772f', icon: Utensils },
  '동물·자연': { accent: '#438650', icon: Sprout },
  '과학·우주': { accent: '#2f80ed', icon: Landmark },
  의료: { accent: '#c24164', icon: HeartPulse },
  '안전·법': { accent: '#386641', icon: ShieldCheck },
  '탈것·교통': { accent: '#3976c7', icon: Landmark },
  '교육·사람': { accent: '#8a5a22', icon: UsersRound },
  '뷰티·서비스': { accent: '#bd5b90', icon: UsersRound },
  '만들기·기획': { accent: '#7a4cc2', icon: Code2 },
};

export const careerCategories: CareerCategory[] = careerLibraryGroups.map((group) => ({
  title: group.title,
  careers: group.careers,
  ...categoryPresentation[group.title],
}));
