import { spawnSync } from 'node:child_process';

const result = spawnSync(
  process.execPath,
  ['node_modules/vitest/vitest.mjs', 'run', 'src/lib/careerScoring.simulation.test.ts'],
  {
    stdio: 'inherit',
    env: { ...process.env, CAREER_SIMULATION_COUNT: '100000' },
  },
);

process.exit(result.status ?? 1);
