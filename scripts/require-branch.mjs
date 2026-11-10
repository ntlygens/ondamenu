/**
 * Stops a deploy unless the current git branch is the expected one.
 *   node scripts/require-branch.mjs main      (production)
 *   node scripts/require-branch.mjs staging   (preview)
 */
import { execSync } from 'node:child_process';

const expected = process.argv[2];
const branch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' }).trim();
if (branch !== expected) {
  console.error(`\nThis deploy runs from the "${expected}" branch, but you are on "${branch}".`);
  console.error(expected === 'main'
    ? 'Production deploys come from main: merge staging into main, check out main, then deploy.\n'
    : 'Preview deploys come from staging: check out staging, then deploy.\n');
  process.exit(1);
}
