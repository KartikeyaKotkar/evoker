import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { execFileSync } from 'node:child_process';

const root = resolve(import.meta.dirname, '..');
const destination = resolve(root, 'artifacts/npm');
mkdirSync(destination, { recursive: true });
for (const workspace of ['@evoker/core', '@evoker/react']) {
  const [info] = JSON.parse(execFileSync('npm', ['pack', '--json', '--workspace', workspace, '--pack-destination', destination], { cwd: root, encoding: 'utf8' }));
  if (!info.files.every(file => file.path === 'package.json' || file.path.startsWith('dist/'))) throw new Error('Unexpected package contents');
  console.log(`${workspace}: ${resolve(destination, info.filename)}`);
}
