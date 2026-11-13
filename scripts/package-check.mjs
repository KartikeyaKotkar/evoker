import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const fromRegistry = process.argv.includes('--registry');
const consumer = mkdtempSync(resolve(tmpdir(), 'evoker-consumer-'));
try {
  const core = JSON.parse(readFileSync(resolve(root, 'core/package.json')));
  const ui = JSON.parse(readFileSync(resolve(root, 'react/package.json')));
  writeFileSync(resolve(consumer, 'package.json'), JSON.stringify({ name: 'evoker-independent-consumer', private: true, type: 'module', version: '0.0.0' }));
  const packages = fromRegistry ? [`${ui.name}@beta`] : [
    resolve(root, `artifacts/npm/kartikeyak-evoker-core-${core.version}.tgz`), resolve(root, `artifacts/npm/kartikeyak-evoker-${ui.version}.tgz`),
  ];
  execFileSync('npm', ['install', '--ignore-scripts', '--no-audit', '--no-fund', ...(fromRegistry ? ['--registry=https://registry.npmjs.org/'] : []), ...packages,
    'react@18.3.1', 'react-dom@18.3.1', '@types/react@18.3.12', '@types/react-dom@18.3.1'], { cwd: consumer, stdio: 'pipe' });
  writeFileSync(resolve(consumer, 'index.html'), '<!doctype html><html><body><div id="root"></div><script type="module" src="/main.tsx"></script></body></html>');
  writeFileSync(resolve(consumer, 'main.tsx'), `
import { createRoot } from 'react-dom/client';
import { Theme, Field, Input, Card, Select, Checkbox, Switch, Slider, PartyPanel, ResultSummary, MessageLog, ActionBar, StatusDialog, CodeBlock } from '@kartikeyak/evoker';
import type { PartyMember, PartyPanelProps, ResultSummaryProps, MessageLogProps, ActionBarProps, StatusDialogProps, QuestRequirement, CodeBlockProps } from '@kartikeyak/evoker';
import { Button } from '@kartikeyak/evoker/button';
import { Dialog } from '@kartikeyak/evoker/dialog';
import { Tabs } from '@kartikeyak/evoker/tabs';
import { InspectorList, QuestBrief, PartyPanel as BlockPartyPanel, ResultSummary as BlockResultSummary, MessageLog as BlockMessageLog, ActionBar as BlockActionBar, StatusDialog as BlockStatusDialog, CodeBlock as BlockCodeBlock } from '@kartikeyak/evoker/blocks';
import type { PartyGauge, ResultMetric, ResultReward, MessageLogEntry, ActionBarItem, PartyPanelProps as BlockPartyProps, ResultSummaryProps as BlockResultProps, MessageLogProps as BlockLogProps, ActionBarProps as BlockActionProps, StatusDialogProps as BlockStatusProps, CodeBlockProps as BlockCodeBlockProps } from '@kartikeyak/evoker/blocks';
import '@kartikeyak/evoker/styles.css';
const gauges: readonly PartyGauge[] = [{ id: 'health', label: 'Health', value: 75 }];
const members: readonly PartyMember[] = [{ id: 'mira', name: 'Mira', gauges }];
const metrics: readonly ResultMetric[] = [{ id: 'score', label: 'Score', value: '120' }];
const rewards: readonly ResultReward[] = [{ id: 'access', label: 'Access', detail: 'Unlocked' }];
const entries: readonly MessageLogEntry[] = [{ id: '1', speaker: 'Guide', message: 'Ready' }];
const actions: readonly ActionBarItem[] = [{ id: 'inspect', label: 'Inspect', keys: 'E' }];
const objectives: readonly QuestRequirement[] = [{ id: 'inspect', label: 'Inspect relay', completed: true }];
const variants = [
  { PartyPanel, ResultSummary, MessageLog, ActionBar, StatusDialog },
  { PartyPanel: BlockPartyPanel, ResultSummary: BlockResultSummary, MessageLog: BlockMessageLog, ActionBar: BlockActionBar, StatusDialog: BlockStatusDialog },
];
function App() { return <Theme appearance="light"><Card.Root><Card.Header><Card.Title>Independent consumer</Card.Title></Card.Header><Card.Content>
<Field.Root name="name"><Field.Label>Name</Field.Label><Input defaultValue="Operator" name="name" /></Field.Root>
<Checkbox name="accepted" defaultChecked aria-label="Accepted" /><Switch name="feedback" defaultChecked aria-label="Feedback" />
<Select.Root name="region" defaultValue="north" items={{ north: 'North' }}><Select.Trigger aria-label="Region"><Select.Value /></Select.Trigger><Select.Portal><Select.Positioner><Select.Content><Select.List><Select.Item value="north"><Select.ItemText>North</Select.ItemText></Select.Item></Select.List></Select.Content></Select.Positioner></Select.Portal></Select.Root>
<Slider.Root defaultValue={50}><Slider.Label>Volume</Slider.Label><Slider.Control><Slider.Track><Slider.Indicator /><Slider.Thumb /></Slider.Track></Slider.Control></Slider.Root>
<Tabs.Root defaultValue="a"><Tabs.List aria-label="Views"><Tabs.Trigger value="a">Overview</Tabs.Trigger></Tabs.List><Tabs.Content value="a">Ready</Tabs.Content></Tabs.Root>
<Dialog.Root><Dialog.Trigger render={<Button />}>Open</Dialog.Trigger><Dialog.Portal><Dialog.Backdrop /><Dialog.Content><Dialog.Title>Connected</Dialog.Title><Dialog.Close render={<Button />}>Close</Dialog.Close></Dialog.Content></Dialog.Portal></Dialog.Root>
<InspectorList label="Collection" items={[]} value={null} onValueChange={() => {}} detail={() => null} />
<QuestBrief title="Mission" requirements={objectives} onRequirementChange={() => {}} actions={<Button>Claim reward</Button>} />
<QuestBrief title="Legacy mission" requirements={['Inspect relay']} />
<CodeBlock code="const ready = true;" filename="signal.ts" language="ts" highlightedLines={[1]} renderLine={line => <span>{line}</span>} />
<BlockCodeBlock code="build complete" lineNumbers={false} defaultWrap copy={false} />
{variants.map((Parts, index) => <section key={index}>
<Parts.PartyPanel label="Team" members={members} value="mira" onValueChange={() => {}} />
<Parts.ResultSummary title="Complete" metrics={metrics} rewards={rewards} actions={<Button>Accept</Button>} />
<Parts.MessageLog label="History" entries={entries} />
<Parts.ActionBar label="Actions" items={actions} onAction={() => {}} />
<Parts.StatusDialog open={false} onOpenChange={() => {}} title="Status" description="Saved locally" />
</section>)}
</Card.Content></Card.Root></Theme>; }
createRoot(document.getElementById('root')!).render(<App />);
`);
  execFileSync(process.execPath, [resolve(root, 'node_modules/typescript/bin/tsc'), '--noEmit', '--jsx', 'react-jsx', '--module', 'ESNext', '--moduleResolution', 'bundler', '--target', 'ES2020', '--lib', 'ES2020,DOM', '--strict', '--skipLibCheck', 'main.tsx'], { cwd: consumer, stdio: 'pipe' });
  execFileSync(process.execPath, ['--input-type=module', '-e', `
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { PartyPanel, CodeBlock } from '@kartikeyak/evoker/blocks';
for (const startLine of [0, -1, NaN, Infinity, 1.5]) {
  assert.throws(() => renderToStaticMarkup(createElement(CodeBlock, {code: 'source', startLine})), /positive safe integer/);
}
const markup = renderToStaticMarkup(createElement(CodeBlock, {code: '<script>signal()</script>', filename: 'source.html'}));
assert.ok(markup.includes('&lt;script&gt;') && !markup.includes('<script>'), 'SSR code must remain escaped text');
for (const gauge of [
  { id: 'bad', label: 'Bad', value: NaN },
  { id: 'bad', label: 'Bad', value: 1, max: 0 },
]) {
  assert.throws(() => renderToStaticMarkup(createElement(PartyPanel, {
    label: 'Invalid', members: [{ id: 'bad', name: 'Invalid', gauges: [gauge] }],
  })), /finite value and positive finite max/, 'PartyPanel must preserve Gauge validation');
}
`], { cwd: consumer, stdio: 'pipe' });
  execFileSync(process.execPath, [resolve(root, 'node_modules/vite/bin/vite.js'), 'build'], { cwd: consumer, stdio: 'pipe' });
  const styles = readdirSync(resolve(consumer, 'dist/assets')).filter(name => name.endsWith('.css')).map(name => readFileSync(resolve(consumer, 'dist/assets', name), 'utf8')).join('\n');
  assert.ok(styles.includes('.evoker-input') && styles.includes('.evoker-modal'), 'Consumer must retain the imported primitive stylesheet');
  for (const name of ['party-panel', 'result-summary', 'message-log', 'action-bar', 'status-dialog', 'code-block']) {
    assert.ok(styles.includes('.evoker-' + name), 'Consumer must retain composition styling: ' + name);
  }
  const installed = JSON.parse(readFileSync(resolve(consumer, 'node_modules', ui.name, 'package.json')));
  assert.equal(installed.version, ui.version);
  for (const name of ['core', 'react']) {
    const directory = resolve(consumer, 'node_modules', name === 'core' ? core.name : ui.name);
    const manifest = JSON.parse(readFileSync(resolve(directory, 'package.json')));
    assert.equal(manifest.version, name === 'core' ? core.version : ui.version, 'Consumer must install the expected release versions');
    assert.equal(manifest.license, 'MIT');
    assert.ok(readFileSync(resolve(directory, 'README.md'), 'utf8').includes(`npm install ${manifest.name}@beta`), 'Consumer must receive package-specific installation instructions');
    assert.equal(readFileSync(resolve(directory, 'dist/LICENSE'), 'utf8'), readFileSync(resolve(root, 'LICENSE'), 'utf8'), 'Consumer must receive the project license');
  }
  console.log(`Independent consumer passed: ${fromRegistry ? 'public beta installed from npm, including the resolved core dependency' : 'archives installed outside workspace'}; root/subpath imports, declarations, stylesheet and production build. No workspace aliases.`);
} catch (error) {
  if (error.stdout) console.error(error.stdout.toString());
  if (error.stderr) console.error(error.stderr.toString());
  throw error;
} finally {
  rmSync(consumer, { recursive: true, force: true });
}
