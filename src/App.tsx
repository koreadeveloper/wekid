import { useEffect, useMemo, useRef, useState } from 'react';
import { TopBar } from './components/layout/TopBar';
import { getCareerDetail } from './data/careerDetails';
import { careerCategories } from './data/careerCategories';
import { questions } from './data/questions';
import { getCenterNameFromSearch, resolveCenterContext } from './lib/centerContext';
import { getCareerResult, getScores } from './lib/careerScoring';
import { saveTestResult } from './lib/resultStorage