import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = join(fileURLToPath(new URL('..', import.meta.url)));
const read = (filePath) => readFileSync(join(rootDir, filePath), 'utf8');
const listTsFiles = (dirPath) =>
  readdirSync(join(rootDir, dirPath))
    .filter((fileName) => fileName.endsWith('.ts') && fileName !== 'index.ts')
    .map((fileName) => `${dirPath}/${fileName}`);

const interestKeys = ['realistic', 'investigative', 'artistic', 'social', 'enterprising', 'conventional'];
const styleKeys = ['together', 'focus', 'observe', 'imagine', 'solve', 'care', 'plan', 'flex'];
const styleAxes = ['energy', 'information', 'decision', 'pace'];
const choiceKeys = [...interestKeys, ...styleKeys];
const errors = [];

const collect = (text, pattern) => [...text.matchAll(pattern)].map((match) => match[1]);
const fail = (message) => errors.push(message);
const assertUnique = (items, label) => {
  const duplicates = [...new Set(items.filter((item, index) => items.indexOf(item) !== index))];
  duplicates.forEach((item) => fail(`${label} duplicate: ${item}`));
};

const questionText = listTsFiles('src/data/questions').map(read).join('\n');
const questionIds = collect(questionText, /id:\s*(\d+)/g).map(Number);
const choices = collect(questionText, /choice:\s*'([^']+)'/g);

if (questionIds.length !== 30) {
  fail(`expected 30 questions, found ${questionIds.length}`);
}

assertUnique(questionIds, 'question id');
questionIds
  .slice()
  .sort((a, b) => a - b)
  .forEach((id, index) => {
    if (id !== index + 1) {
      fail(`question ids must be sequential from 1 to 30; found ${id} at position ${index + 1}`);
    }
  });

choices.forEach((choice) => {
  if (!choiceKeys.includes(choice)) {
    fail(`unknown question choice: ${choice}`);
  }
});

interestKeys.forEach((key) => {
  const count = choices.filter((choice) => choice === key).length;
  if (count !== 6) {
    fail(`interest choice ${key} should appear 6 times, found ${count}`);
  }
});

styleKeys.forEach((key) => {
  const count = choices.filter((choice) => choice === key).length;
  if (count !== 3) {
    fail(`style choice ${key} should appear 3 times, found ${count}`);
  }
});

const careerFitText = listTsFiles('src/data/careerFits').map(read).join('\n');
const careerFitItems = [
  ...careerFitText.matchAll(/\{\s*name:\s*'([^']+)',\s*interestFit:\s*\{([^}]*)\},\s*styleFit:\s*\{([^}]*)\}/g),
].map((match) => ({
  name: match[1],
  interestFit: match[2],
  styleFit: match[3],
}));

const careerFitNames = careerFitItems.map((career) => career.name);
assertUnique(careerFitNames, 'career fit name');

if (careerFitNames.length < 48) {
  fail(`expected at least 48 matched careers, found ${careerFitNames.length}`);
}

careerFitItems.forEach((career) => {
  const interestEntries = [...career.interestFit.matchAll(/([a-z]+):\s*([0-9.]+)/g)];
  if (!interestEntries.length) {
    fail(`career fit ${career.name} needs at least one interest`);
  }

  interestEntries.forEach(([, key, rawWeight]) => {
    const weight = Number(rawWeight);
    if (!interestKeys.includes(key)) {
      fail(`career fit ${career.name} has unknown interest ${key}`);
    }
    if (!Number.isFinite(weight) || weight <= 0) {
      fail(`career fit ${career.name} has invalid interest weight ${rawWeight}`);
    }
  });

  const styleEntries = Object.fromEntries([...career.styleFit.matchAll(/([a-z]+):\s*'([^']+)'/g)].map((match) => [match[1], match[2]]));
  styleAxes.forEach((axis) => {
    if (!styleEntries[axis]) {
      fail(`career fit ${career.name} is missing style axis ${axis}`);
    } else if (!styleKeys.includes(styleEntries[axis])) {
      fail(`career fit ${career.name} has invalid style ${styleEntries[axis]}`);
    }
  });
});

const categoryText = listTsFiles('src/data/careerCategories').map(read).join('\n');
const categoryCareers = [...categoryText.matchAll(/careers:\s*\[([\s\S]*?)\]/g)].flatMap((match) =>
  collect(match[1], /'([^']+)'/g),
);
const uniqueCategoryCareers = [...new Set(categoryCareers)];

assertUnique(categoryCareers, 'career category name');
if (uniqueCategoryCareers.length < 177) {
  fail(`expected at least 177 career map entries, found ${uniqueCategoryCareers.length}`);
}

careerFitNames.forEach((careerName) => {
  if (!uniqueCategoryCareers.includes(careerName)) {
    fail(`recommended career is missing from career map: ${careerName}`);
  }
});

const careerDetailText = listTsFiles('src/data/careerDetailGroups')
  .filter((filePath) => !filePath.endsWith('/factory.ts'))
  .map(read)
  .join('\n');
const detailNames = collect(careerDetailText, /name:\s*['"]([^'"]+)['"]/g);
assertUnique(detailNames, 'career detail name');

if (detailNames.length !== uniqueCategoryCareers.length) {
  fail(`expected ${uniqueCategoryCareers.length} career details, found ${detailNames.length}`);
}

uniqueCategoryCareers.forEach((careerName) => {
  if (!detailNames.includes(careerName)) {
    fail(`career map entry is missing detailed career content: ${careerName}`);
  }
});

detailNames.forEach((careerName) => {
  if (!uniqueCategoryCareers.includes(careerName)) {
    fail(`career detail is not present in career map: ${careerName}`);
  }
});

if (errors.length) {
  console.error(['Data validation failed:', ...errors.map((error) => `- ${error}`)].join('\n'));
  process.exit(1);
}

console.log(
  `Data validation passed: ${questionIds.length} questions, ${careerFitNames.length} matched careers, ${uniqueCategoryCareers.length} map careers, ${detailNames.length} career details.`,
);
