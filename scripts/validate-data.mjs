import { spawnSync } from 'node:child_process';

const result = spawnSync(
  process.execPath,
  [
    'node_modules/vitest/vitest.mjs',
    'run',
    'src/types/careerV2.test.ts',
    'src/data/careerCatalog.test.ts',
    'src/data/questionsV2.test.ts',
    'src/lib/questionSnapshots.test.ts',
  ],
  { stdio: 'inherit' },
);

process.exit(result.status ?? 1);
