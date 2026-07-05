import {
  BriefcaseBusiness,
  GraduationCap,
  HeartPulse,
  Laptop,
  Microscope,
  Palette,
  ShieldCheck,
  Sparkles,
  Wrench,
  type LucideIcon,
} from 'lucide-react';

const iconsByCategory: Record<string, LucideIcon> = {
  arts: Palette,
  business: BriefcaseBusiness,
  digital: Laptop,
  education: GraduationCap,
  field: Wrench,
  medical: HeartPulse,
  public: ShieldCheck,
  research: Microscope,
};

type JobThemeIconProps = {
  readonly category: string;
  readonly className?: string;
  readonly size?: number;
};

export function JobThemeIcon({ category, className, size = 18 }: JobThemeIconProps) {
  const Icon = iconsByCategory[category] ?? Sparkles;
  return <Icon aria-hidden="true" className={className} size={size} strokeWidth={2.7} />;
}
