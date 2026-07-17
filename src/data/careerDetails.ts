import type { CareerDetail } from '../types/career';
import { careerByName } from './careerCatalog';

export const careerDetails: Record<string, CareerDetail> = Object.fromEntries(
  Object.values(careerByName).map((career) => [career.name, career.detail]),
);

export const getCareerDetail = (careerName: string) => careerByName[careerName]?.detail ?? null;
