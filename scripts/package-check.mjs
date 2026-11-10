import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const consumer = mkdtempSync(resolve(tmpdir(), 'evoker-consumer-'));
try {
  const core = JSON.parse(readFileSync(resolve(root, 'core/package.json')));
  const ui = JSON.parse(readFileSync(resolve(root, 'react/package.json')));
  writeFileSync(resolve(consumer, 'package.json'), JSON.stringify({ name: 'evoker-independent-consumer', private: true, type: 'module', version: '0.0.0' }));
  execFileSync('npm', ['install', '--ignore-scripts', '--no-audit', '--no-fund',
    resolve(root, `artifacts/npm/evoker-core-${core.version}.tgz`), resolve(root, `artifacts/npm/evoker-react-${ui.version}.tgz`),
    'react@18.3.1', 'react-dom@18.3.1', '@types/react@18.3.12', '@types/react-dom@18.3.1'], { cwd: consumer, stdio: 'pipe' });
  writeFileSync(resolve(consumer, 'index.html'), '<!doctype html><html><body><div id="root"></div><script type="module" src="/main.tsx"></script></body></html>');
  writeFileSync(resolve(consumer, 'main.tsx'), `
import { createRoot } from 'react-dom/client';
import { Theme, Field, Input, Card, Select, Checkbox, Switch, Slider } from '@evoker/react';
import { Button } from '@evoker/react/button';
import { Dialog } from '@evoker/react/dialog';
import { Tabs } from '@evoker/react/tabs';
import { InspectorList } from '@evoker/react/blocks';
import '@evoker/react/styles.css';
function App() { return <Theme appearance="light"><Card.Root><Card.Header><Card.Title>Independent consumer</Card.Title></Card.Header><Card.Content>
<Field.Root name="name"><Field.Label>Name</Field.Label><Input defaultValue="Operator" name="name" /></Field.Root>
<Checkbox name="accepted" defaultChecked aria-label="Accepted" /><Switch name="feedback" defaultChecked aria-label="Feedback" />
<Select.Root name="region" defaultValue="north" items={{ north: 'North' }}><Select.Trigger aria-label="Region"><Select.Value /></Select.Trigger><Select.Portal><Select.Positioner><Select.Content><Select.List><Select.Item value="north"><Select.ItemText>North</Select.ItemText></Select.Item></Select.List></Select.Content></Select.Positioner></Select.Portal></Select.Root>
<Slider.Root defaultValue={50}><Slider.Label>Volume</Slider.Label><Slider.Control><Slider.Track><Slider.Indicator /><Slider.Thumb /></Slider.Track></Slider.Control></Slider.Root>
<Tabs.Root defaultValue="a"><Tabs.List aria-label="Views"><Tabs.Trigger value="a">Overview</Tabs.Trigger></Tabs.List><Tabs.Content value="a">Ready</Tabs.Content></Tabs.Root>
<Dialog.Root><Dialog.Trigger render={<Button />}>Open</Dialog.Trigger><Dialog.Portal><Dialog.Backdrop /><Dialog.Content><Dialog.Title>Connected</Dialog.Title><Dialog.Close render={<Button />}>Close</Dialog.Close></Dialog.Content></Dialog.Portal></Dialog.Root>
<InspectorList label="Collection" items={[]} value={null} onValueChange={() => {}} detail={() => null} />
</Card.Content></Card.Root></Theme>; }
createRoot(document.getElementById('root')!).render(<App />);
`);
  execFileSync(process.execPath, [resolve(root, 'node_modules/typescript/bin/tsc'), '--noEmit', '--jsx', 'react-jsx', '--module', 'ESNext', '--moduleResolution', 'bundler', '--target', 'ES2020', '--lib', 'ES2020,DOM', '--strict', '--skipLibCheck', 'main.tsx'], { cwd: consumer, stdio: 'pipe' });
  execFileSync(process.execPath, [resolve(root, 'node_modules/vite/bin/vite.js'), 'build'], { cwd: consumer, stdio: 'pipe' });
  const styles = readdirSync(resolve(consumer, 'dist/assets')).filter(name => name.endsWith('.css')).map(name => readFileSync(resolve(consumer, 'dist/assets', name), 'utf8')).join('\n');
  assert.ok(styles.includes('.evoker-input') && styles.includes('.evoker-modal'), 'Consumer must retain the imported primitive stylesheet');
  const installed = JSON.parse(readFileSync(resolve(consumer, 'node_modules/@evoker/react/package.json')));
  assert.equal(installed.version, ui.version);
  console.log('Independent consumer passed: archives installed outside workspace; root/subpath imports, declarations, stylesheet and production build. No workspace aliases.');
} catch (error) {
  if (error.stdout) console.error(error.stdout.toString());
  if (error.stderr) console.error(error.stderr.toString());
  throw error;
} finally {
  rmSync(consumer, { recursive: true, force: true });
}
