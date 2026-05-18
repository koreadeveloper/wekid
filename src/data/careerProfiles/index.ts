import type { CareerPattern, CareerProfile } from '../../types/career';
import { careerProfileGroupOne } from './groupOne';
import { careerProfileGroupTwo } from './groupTwo';
import { careerProfileGroupThree } from './groupThree';
import { careerProfileGroupFour } from './groupFour';

export const careerProfiles: Partial<Record<CareerPattern, CareerProfile>> = {
  ...careerProfileGroupOne,
  ...careerProfileGroupTwo,
  ...careerProfileGroupThree,
  ...careerProfileGroupFour,
};
