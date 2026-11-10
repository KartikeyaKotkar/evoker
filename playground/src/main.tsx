import { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Button, Dialog, EvokerProvider, Gauge, KeyHint, Menu, Panel, SelectionIndicator, Tabs, Transition } from '@evoker/react';
import type { MenuItem } from '@evoker/react';
import '../../react/src/styles.css';
import './style.css';
import { SourceComponents, sourceComponentItems } from './SourceComponents.js';
import { Documentation } from './Documentation.js';

const menuItems: MenuItem[] = [
  { id: 'components', label: 'Components', description: 'Twenty-one pieces. One visual language.', angle: -4, offset: 4 },
  { id: 'motion', label: 'Motion', description: 'Independent layers. Shared rhythm.', angle: -2, offset: 16 },
  { id: 'foundations', label: 'Foundations', description: 'Color, contrast and composition.', angle: 1, offset: 4 },
  { id: 'adapters', label: 'More adapters', description: 'Coming later', disabled: true, angle: -1 },
];
const componentItems = [
  ['Button', '<Button onClick={save}>Save changes</Button>', 'Native activation. Separate focus, press and hit area.'],
  ['Menu / List', '<Menu items={items} onSelect={open} />', 'Arrow keys, Home / End. Stable identity. Disabled rows skipped.'],
  ['Tabs', '<Tabs items={tabs} value={tab}\n  onValueChange={setTab} label="Views" />', 'Controlled selection. Roving focus. Linked panels.'],
  ['Panel', '<Panel title="Overview" tone="dark">\n  {children}\n</Panel>', 'Original cut geometry around ordinary content flow.'],
  ['Dialog', '<Dialog open={open} onClose={close}\n  title="Ready to continue?">…</Dialog>', 'Native focus containment, Escape and focus restoration.'],
  ['Gauge', '<Gauge label="Capacity" value={72} max={100} />', 'Clamped numeric values. Accessible meter or progressbar.'],
  ['KeyHint', '<KeyHint keys={["↑", "↓"]} action="Navigate" />', 'Key, action and optional platform glyph stay separate.'],
  ['SelectionIndicator', '<SelectionIndicator y={64} height={56} />', 'Independent cursor layers. Interrupted motion keeps current pose.'],
  ['Transition', '<Transition show={visible} effect="wipe">\n  {children}\n</Transition>', 'Fade, slide or mask. Reversible changes. Reduced motion.'],
  ...sourceComponentItems,
] as const;

function Catalog() {
  const [reduced, setReduced] = useState<boolean | 'system'>('system');
  const [selected, setSelected] = useState(0);
  const [tab, setTab] = useState('overview');
  const [gauge, setGauge] = useState(72);
  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(true);
  const [effect, setEffect] = useState<'wipe' | 'slide' | 'fade'>('wipe');
  const [cursor, setCursor] = useState(0);
  const [notice, setNotice] = useState('Choose a component to inspect its API.');
  const [replay, setReplay] = useState(0);
  const inspect = (index: number) => { setSelected(index); setNotice(`${componentItems[index]![0]} API selected`); };
  const choose = (item: MenuItem) => { document.getElementById(item.id)?.scrollIntoView({ behavior: 'instant' }); setNotice(`${item.label} section selected`); };
  return <EvokerProvider reducedMotion={reduced}>
    <div className="catalog">
      <a className="skip" href="#components">Skip to components</a>
      <header className="site-header"><a href="#" className="wordmark">evoker<span> / UI</span></a><nav aria-label="Main"><a href="#components">Components <sup>{componentItems.length}</sup></a><a href="#motion">Motion</a><a href="#foundations">Foundations</a></nav><span className="release">REACT / 0.1</span></header>
      <main>
        <section className="hero" aria-labelledby="hero-title">
          <div className="water" aria-hidden="true"><i /><i /><i /><i /></div>
          <div className="hero-meta"><span>INTERFACE SYSTEM / VOL. 01</span><span>CORE + REACT</span></div>
          <h1 id="hero-title">BREAK<br /><span>THE STATIC.</span></h1>
          <div className="hero-bottom"><p>Sharp shapes. Fluid motion.<br />A reusable interface toolkit<br />in electric blue.</p><span className="hero-edition">EVOKER<br /><b>{componentItems.length}</b><small>COMPONENTS</small></span></div>
          <div className="hero-menu"><span className="micro">SELECT YOUR NEXT MOVE</span><Menu key={replay} aria-label="Explore the toolkit" items={menuItems} onSelect={choose} /><div className="hints"><KeyHint keys={['↑', '↓']} action="Navigate" /><KeyHint keys="Enter" action="Select" /></div></div>
          <div className="hero-caption"><span>INSPIRED BY PERSONA 3 RELOAD</span><span>ORIGINAL GEOMETRY / NO GAME ASSETS</span></div>
        </section>

        <section id="components" className="component-section" aria-labelledby="components-title">
          <div className="section-heading"><div><p className="micro">01 / THE TOOLKIT</p><h2 id="components-title">BUILT TO<br /><em>BE COMPOSED.</em></h2></div><p>Real controls. Your content.<br />Take one piece or build the whole scene.</p></div>
          <div className="component-layout">
            <aside className="component-index" aria-label="Component API selector">{componentItems.map(([name], index) => <button key={name} type="button" aria-pressed={selected === index} onClick={() => inspect(index)}><span>{String(index + 1).padStart(2, '0')}</span>{name}<i aria-hidden="true">↗</i></button>)}</aside>
            <div className="specimens">
              <div className="api-strip"><span className="micro">{String(selected + 1).padStart(2, '0')} / {componentItems[selected]![0]}</span><p>{componentItems[selected]![2]}</p><pre><code>{componentItems[selected]![1]}</code></pre></div>
              <div className="specimen-grid">
                <article className="specimen specimen-wide"><div className="specimen-label"><span>01 / BUTTON</span><span>TRY THE STATES</span></div><div className="button-row"><Button onClick={() => { setOpen(true); inspect(0); }}>Continue</Button><Button variant="secondary" onClick={() => setNotice('Secondary action activated')}>Secondary</Button><Button disabled>Unavailable</Button></div></article>
                <article className="specimen"><div className="specimen-label"><span>03 / TABS</span><span>← →</span></div><Tabs value={tab} onValueChange={setTab} label="Component details" items={[
                  { id: 'overview', label: 'Overview', content: <><h3>Every layer has a role.</h3><p>Labels, shapes and page content move independently. Ordinary application data belongs here.</p></> },
                  { id: 'details', label: 'Details', content: <><h3>Made for your keyboard.</h3><p>Use Left / Right, Home and End. Tab enters the active panel.</p></> },
                  { id: 'locked', label: 'Later', disabled: true, content: 'Unavailable' },
                ]} /></article>
                <article className="specimen"><div className="specimen-label"><span>04 / PANEL</span><span>COMPOSE FREELY</span></div><Panel title="Signal found" eyebrow="Workspace / 01" tone="light"><p>Cut planes. Clear hierarchy. Your own content inside.</p><KeyHint keys="Tab" action="Move focus" /></Panel></article>
                <article className="specimen"><div className="specimen-label"><span>06 / GAUGE</span><span>LIVE VALUE</span></div><Gauge label="Capacity" value={gauge} /><label className="range-label">Adjust capacity<input aria-label="Adjust capacity" type="range" min="0" max="100" value={gauge} onChange={event => setGauge(Number(event.target.value))} /></label></article>
                <article className="specimen"><div className="specimen-label"><span>05 / DIALOG</span><span>NATIVE MODAL</span></div><h3>A moment to decide.</h3><p>Focused choices, with room to breathe.</p><Button variant="secondary" onClick={() => setOpen(true)}>Open dialog</Button></article>
                <article className="specimen"><div className="specimen-label"><span>07 / KEYHINT</span><span>INPUT + ACTION</span></div><div className="hint-stack"><KeyHint keys={['↑', '↓']} action="Navigate" /><KeyHint keys="Enter" action="Confirm" /><KeyHint keys="Esc" action="Close dialog" /></div></article>
                <article className="specimen"><div className="specimen-label"><span>08 / SELECTION INDICATOR</span><span>INDEPENDENT LAYER</span></div><div className="cursor-demo"><SelectionIndicator y={cursor * 48} height={40} />{['First position', 'Second position'].map((name, index) => <button type="button" key={name} aria-pressed={cursor === index} onClick={() => setCursor(index)}>{name}</button>)}</div></article>
                <SourceComponents />
              </div>
            </div>
          </div>
        </section>

        <section id="motion" className="motion-section" aria-labelledby="motion-title"><div className="section-heading"><div><p className="micro">02 / CHOREOGRAPHY</p><h2 id="motion-title">FEEL THE<br /><em>CHANGE.</em></h2></div><p>One timeline core.<br />Separate tracks. Interruptible playback.</p></div>
          <div className="motion-layout"><div className="motion-controls"><label>Transition<select value={effect} onChange={event => setEffect(event.target.value as typeof effect)}><option value="wipe">Mask / wipe</option><option value="slide">Slide</option><option value="fade">Fade</option></select></label><Button onClick={() => setVisible(value => !value)}>{visible ? 'Exit panel' : 'Enter panel'}</Button><Button variant="ghost" onClick={() => setReplay(value => value + 1)}>Replay menu</Button><label>Motion preference<select aria-label="Motion preference" value={String(reduced)} onChange={event => setReduced(event.target.value === 'system' ? 'system' : event.target.value === 'true')}><option value="system">Use system preference</option><option value="true">Reduce motion</option><option value="false">Full motion</option></select></label></div>
            <div className="transition-stage"><span className="stage-number" aria-hidden="true">09</span><Transition show={visible} effect={effect} duration={420} className="transition-example"><Panel title="Always in motion." eyebrow="Transition / live" tone="light"><p>A shape enters. A cursor arrives. Content follows.<br />Every part keeps its own rhythm.</p><span className="panel-arrow" aria-hidden="true">↗</span></Panel></Transition></div></div>
        </section>

        <section id="foundations" className="foundations" aria-labelledby="foundations-title"><div className="section-heading"><div><p className="micro">03 / FOUNDATIONS</p><h2 id="foundations-title">FIVE COLORS.<br /><em>FULL EXPRESSION.</em></h2></div><p>Original CSS geometry.<br />System typography. No image requests.</p></div><div className="swatches">{['#6d9ac7', '#1269cc', '#51eefc', '#ffffff', '#303030'].map((color, index) => <div key={color} style={{ background: color, color: index === 1 || index === 4 ? '#ffffff' : '#303030' }}><span>0{index + 1}</span><strong>{['Sky', 'Blue', 'Cyan', 'White', 'Ink'][index]}</strong><code>{color}</code></div>)}</div><p className="foundation-note">P3R composition and motion informed by extracted reference data. Browser interactions and timing are authored for this toolkit; exact native behavior remains unverified.</p></section>
      </main>
      <footer className="site-footer"><a href="#" className="wordmark">evoker<span> / UI</span></a><p>Engine-independent TypeScript core.<br />React is the first adapter.</p><span role="status" aria-live="polite">{notice}</span></footer>
      <Dialog open={open} onClose={() => setOpen(false)} title="Ready to move?" actions={<><Button onClick={() => { setOpen(false); setNotice('Changes confirmed'); }}>Confirm</Button><Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button></>}><p>Compose the next interface your way. Your content, your actions, your rhythm.</p><KeyHint keys="Esc" action="Close" /></Dialog>
    </div>
  </EvokerProvider>;
}
createRoot(document.getElementById('root')!).render(<StrictMode><Documentation blocks={<Catalog />} /></StrictMode>);
