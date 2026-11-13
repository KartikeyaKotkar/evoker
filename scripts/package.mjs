import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { execFileSync } from 'node:child_process';

const root = resolve(import.meta.dirname, '..');
const destination = resolve(root, 'artifacts/npm');
mkdirSync(destination, { recursive: true });
for (const workspace of ['@k2x/evoker-core', '@k2x/evoker']) {
  const [info] = JSON.parse(execFileSync('npm', ['pack', '--json', '--workspace', workspace, '--pack-destination', destination], { cwd: root, encoding: 'utf8' }));
  if (!info.files.every(file => ['package.json', 'LICENSE', 'README.md'].includes(file.path) || file.path.startsWith('dist/'))) throw new Error('Unexpected package contents');
  if (!info.files.some(file => file.path === 'dist/LICENSE')) throw new Error('Package must include the MIT license');
  if (!info.files.some(file => file.path === 'README.md')) throw new Error('Package must include its installation README');
  console.log(`${workspace}: ${resolve(destination, info.filename)}`);
}
