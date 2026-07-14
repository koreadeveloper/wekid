import type { CareerDetail } from '../types/career';
import { careerCategories } from './careerCategories';
import { buildFallbackCareerDetail, enrichCareerDetail } from './careerDetailContext';
import { detailedCareerDetails } from './careerDetailGroups';
import { careerFits } from './careerFits';

export const careerDetails: Record<string, CareerDetail> = Object.fromEntries(
  detailedCareerDetails.map((detail) => [detail.name, detail]),
);

export const getCareerDetail = (careerName: string) => {
  const detail = careerDetails[careerName];
  const fit = careerFits.find((career) => career.name === careerName);
  const category = careerCategories.find((careerCategory) => careerCategory.careers.includes(careerName));

  if (detail) {
    return enrichCareerDetail(detail, fit, category?.title);
  }

  if (fit || category) {
    return buildFallbackCareerDetail(careerName, fit, category?.title);
  }

  return null;
};
