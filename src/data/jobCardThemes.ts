import jobBackgroundCsv from '../../wekid-job-backgrounds-clean-178/job-background-name-map.csv?raw';
import { buildJobCardThemes } from '../lib/jobCardThemes';

const jobBackgroundImageUrls = import.meta.glob('../../wekid-job-backgrounds-clean-178/webp/*.webp', {
  eager: true,
  import: 'default',
  query: '?url',
}) as Record<string, string>;

export const jobCardThemes = buildJobCardThemes(jobBackgroundCsv, jobBackgroundImageUrls);
