import { researchCareerDetails } from './research';
import { digitalCareerDetails } from './digital';
import { artsCareerDetails } from './arts';
import { educationCareerDetails } from './education';
import { medicalCareerDetails } from './medical';
import { businessCareerDetails } from './business';
import { publicCareerDetails } from './public';
import { fieldCareerDetails } from './field';

export const detailedCareerDetails = [
  ...researchCareerDetails,
  ...digitalCareerDetails,
  ...artsCareerDetails,
  ...educationCareerDetails,
  ...medicalCareerDetails,
  ...businessCareerDetails,
  ...publicCareerDetails,
  ...fieldCareerDetails,
];
