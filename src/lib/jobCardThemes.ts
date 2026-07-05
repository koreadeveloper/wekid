export type JobBackgroundRecord = {
  koreanName: string;
  englishName: string;
  emoji: string;
  filename: string;
  category: string;
  tagline: string;
};

export type JobCardTheme = {
  key: string;
  name: string;
  englishName: string;
  emoji: string;
  hint: string;
  category: string;
  backgroundUrl: string;
};

const requiredHeaders: Array<keyof JobBackgroundRecord> = [
  'koreanName',
  'englishName',
  'emoji',
  'filename',
  'category',
  'tagline',
];

const parseCsvLine = (line: string) => {
  const values: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];
    const nextCharacter = line[index + 1];

    if (character === '"' && inQuotes && nextCharacter === '"') {
      current += '"';
      index += 1;
      continue;
    }

    if (character === '"') {
      inQuotes = !inQuotes;
      continue;
    }

    if (character === ',' && !inQuotes) {
      values.push(current.trim());
      current = '';
      continue;
    }

    current += character;
  }

  values.push(current.trim());
  return values;
};

const getFilenameFromPath = (path: string) => path.split('/').pop() ?? path;
const getOptimizedFilename = (filename: string) => filename.replace(/\.png$/i, '.webp');

export function parseJobBackgroundCsv(csv: string): JobBackgroundRecord[] {
  const rows = csv
    .split(/\r?\n/)
    .map((row) => row.trim())
    .filter(Boolean);
  const [headerRow, ...dataRows] = rows;

  if (!headerRow) {
    return [];
  }

  const headers = parseCsvLine(headerRow);
  const missingHeaders = requiredHeaders.filter((header) => !headers.includes(header));
  if (missingHeaders.length > 0) {
    throw new Error(`Missing job background CSV headers: ${missingHeaders.join(', ')}`);
  }

  return dataRows.map((row) => {
    const values = parseCsvLine(row);
    const record = Object.fromEntries(headers.map((header, index) => [header, values[index] ?? '']));

    return {
      koreanName: record.koreanName,
      englishName: record.englishName,
      emoji: record.emoji,
      filename: record.filename,
      category: record.category,
      tagline: record.tagline,
    };
  });
}

export function buildJobCardThemes(csv: string, backgroundUrlsByPath: Record<string, string>): JobCardTheme[] {
  const backgroundUrlsByFilename = Object.fromEntries(
    Object.entries(backgroundUrlsByPath).map(([path, url]) => [getFilenameFromPath(path), url]),
  );

  return parseJobBackgroundCsv(csv).map((record) => {
    const backgroundUrl = backgroundUrlsByFilename[record.filename] ?? backgroundUrlsByFilename[getOptimizedFilename(record.filename)];
    if (!backgroundUrl) {
      throw new Error(`Missing job background image: ${record.filename}`);
    }

    return {
      key: record.koreanName,
      name: record.koreanName,
      englishName: record.englishName,
      emoji: record.emoji,
      hint: record.tagline,
      category: record.category,
      backgroundUrl,
    };
  });
}

export function searchJobCardThemes(themes: JobCardTheme[], query: string) {
  const keyword = query.trim().toLowerCase();
  if (!keyword) {
    return themes;
  }

  return themes.filter((theme) =>
    [theme.name, theme.englishName, theme.hint, theme.category].some((value) => value.toLowerCase().includes(keyword)),
  );
}
