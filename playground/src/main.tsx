import { StrictMode, Suspense, lazy, useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Button, Dialog, EvokerProvider, Gauge, KeyHint, Menu, Panel, SelectionIndicator, Tabs, Transition } from '@evoker/react';
import type { KeyboardEvent, MouseEvent } from 'react';
import type { MenuItem } from '@evoker/react';
import '../../react/src/styles.css';
import './style.css';
import { SourceComponents } from './SourceComponents.js';
import { legacyBlockPages, sourceBlockPages } from './BlockPages.js';
import { compositionPages } from './CompositionPages.js';
import { PanelDemo } from './BlockDemos.js';
import { BrandLink } from './Brand.js';

const Documentation = lazy(() => import('./Documentation.js').then(module => ({ default: module.Documentation })));

const menuItems: MenuItem[] = [
  { id: 'components', label: 'Components', description: 'Twenty-six pieces. One visual language.', angle: -4, offset: 4 },
  { id: 'motion', label: 'Motion', description: 'Independent layers. Shared rhythm.', angle: -2, offset: 16 },
  { id: 'foundations', label: 'Foundations', description: 'Color, contrast and composition.', angle: 1, offset: 4 },
  { id: 'documentation', label: 'Documentation', description: 'Examples, contracts and installation.', angle: -1 },
];
const componentItems = [
  ['Button', '<Button onClick={save}>Save changes</Button>', 'Native activation. Separate focus, press and hit area.', 'button'],
  ['Menu / List', '<Menu items={items} onSelect={open} />', 'Arrow keys, Home / End. Stable identity. Disabled rows skipped.', 'menu'],
  ['Tabs', '<Tabs items={tabs} value={tab}\n  onValueChange={setTab} label="Views" />', 'Controlled selection. Roving focus. Linked panels.', 'tabs'],
  ['Panel', legacyBlockPages.find(page => page.id === 'panel')!.examples[0]!.code, 'Group content and actions in a shaped surface. Your children supply behavior.', 'panel'],
  ['Dialog', '<Dialog open={open} onClose={close}\n  title="Ready to continue?">…</Dialog>', 'Native focus containment, Escape and focus restoration.', 'dialog'],
  ['Gauge', '<Gauge label="Capacity" value={72} max={100} />', 'Clamped numeric values. Accessible meter or progressbar.', 'gauge'],
  ['KeyHint', '<KeyHint keys={["↑", "↓"]} action="Navigate" />', 'Key, action and optional platform glyph stay separate.', 'key-hint'],
  ['SelectionIndicator', '<SelectionIndicator y={64} height={56} />', 'Independent cursor layers. Interrupted motion keeps current pose.', 'selection-indicator'],
  ['Transition', '<Transition show={visible} effect="wipe">\n  {children}\n</Transition>', 'Fade, slide or mask. Reversible changes. Reduced motion.', 'transition'],
  ...sourceBlockPages.map(page => [page.title, page.examples[0]!.code, page.description, page.id] as const),
  ...compositionPages.map(page => [page.title, page.examples[0]!.code, page.description, page.id] as const),
] as const;

const interactive = 'button:not(:disabled), a[href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex="0"]';
function controlsWithin(element: HTMLElement) {
  return [...element.querySelectorAll<HTMLElement>(interactive)].filter(control => !control.matches(':disabled, [aria-disabled="true"]') && !control.closest('[hidden], [inert], .specimen-label') && control.getClientRects().length > 0);
}
function focusWithin(element: HTMLElement | null) {
  if (!element) return;
  (controlsWithin(element)[0] ?? element).focus({ preventScroll: true });
}
function Catalog() {
  const canvas = useRef<HTMLElement>(null);
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
  const enterDemo = (index: number) => {
    inspect(index);
    const demo = document.getElementById(`demo-${componentItems[index]![3]}`);
    demo?.scrollIntoView({ behavior: 'instant', block: 'center' });
    focusWithin(demo);
  };
  const choose = (item: MenuItem) => {
    if (item.id === 'documentation') { location.hash = '/docs'; return; }
    const section = document.getElementById(item.id);
    section?.scrollIntoView({ behavior: 'instant' });
    focusWithin(section);
    setNotice(`${item.label} section selected`);
  };
  useEffect(() => {
    document.title = 'P3R Blocks & Motion — Evoker UI';
    const section = ['#components', '#motion', '#foundations'].includes(location.hash) ? document.getElementById(location.hash.slice(1)) : null;
    if (section) { section.scrollIntoView({ behavior: 'instant' }); focusWithin(section); }
    else focusWithin(document.getElementById('demo-menu'));
  }, []);
  const focusArea = (event: MouseEvent<HTMLElement>) => {
    const target = event.target as HTMLElement;
    if (target.closest('button, a, input, select, textarea, [contenteditable="true"]') || window.getSelection()?.isCollapsed === false) return;
    focusWithin(target.closest<HTMLElement>('.specimen, [data-playground-area]'));
  };
  const trackDemoFocus = (target: EventTarget) => {
    if (!(target instanceof HTMLElement) || !canvas.current?.contains(target)) return;
    const demo = target.closest<HTMLElement>('.specimen');
    const index = componentItems.findIndex(item => `demo-${item[3]}` === demo?.id);
    if (index >= 0 && index !== selected) inspect(index);
  };
  const keyboard = (event: KeyboardEvent<HTMLElement>) => {
    const target = event.target as HTMLElement;
    if (!canvas.current?.contains(target) || event.defaultPrevented || event.nativeEvent.isComposing || event.altKey || event.ctrlKey || event.metaKey) return;
    if (target.closest('input, textarea, select, [contenteditable="true"], [role="slider"]')) return;
    if (event.key === 'Escape') {
      if (target.closest('.hero')) return;
      event.preventDefault();
      if (target.closest('.specimen')) canvas.current.querySelector<HTMLElement>('.component-index [aria-pressed="true"]')?.focus();
      else focusWithin(document.getElementById('demo-menu'));
      return;
    }
    if (target.closest('[role="menu"], [role="tablist"], [role="listbox"], [role="log"]')) return;
    const group = target.closest<HTMLElement>('.component-index, .specimen, .motion-controls');
    if (!group || !['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    const controls = controlsWithin(group);
    const current = controls.indexOf(target);
    if (current < 0 || !controls.length) return;
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? controls.length - 1 : (current + (['ArrowUp', 'ArrowLeft'].includes(event.key) ? -1 : 1) + controls.length) % controls.length;
    event.preventDefault();
    controls[next]?.focus();
  };
  return <EvokerProvider reducedMotion={reduced}>
    <div className="catalog">
      <a className="skip" href="#components" onClick={() => choose(menuItems[0]!)}>Skip to components</a>
      <header className="site-header"><BrandLink onClick={() => focusWithin(document.getElementById('demo-menu'))} /><nav aria-label="Main"><a href="#components" onClick={() => choose(menuItems[0]!)}>Components <sup>{componentItems.length}</sup></a><a href="#motion" onClick={() => choose(menuItems[1]!)}>Motion</a><a href="#foundations" onClick={() => choose(menuItems[2]!)}>Foundations</a><a href="#/docs">Docs ↗</a></nav><span className="release">REACT / 0.1</span></header>
      <main ref={canvas} className="playground-canvas" aria-label="Interactive playground" onClick={focusArea} onFocusCapture={event => trackDemoFocus(event.target)} onKeyDown={keyboard}>
        <div className="canvas-guide"><strong>P3R Blocks &amp; Motion</strong><span>Click a demo or Tab into it · Arrows navigate · Enter selects · Esc goes back</span></div>
        <section tabIndex={-1} data-playground-area="hero" className="hero" aria-labelledby="hero-title">
          <div className="water" aria-hidden="true"><i /><i /><i /><i /></div>
          <div className="hero-meta"><span>INTERFACE SYSTEM / VOL. 01</span><span>CORE + REACT</span></div>
          <h1 id="hero-title">BREAK<br /><span>THE STATIC.</span></h1>
          <div className="hero-bottom"><p>Sharp shapes. Fluid motion.<br />A reusable interface toolkit<br />in electric blue.</p><span className="hero-edition">EVOKER<br /><b>{componentItems.length}</b><small>COMPONENTS</small></span></div>
          <div id="demo-menu" tabIndex={-1} className="hero-menu"><span className="micro">SELECT YOUR NEXT MOVE</span><Menu key={replay} aria-label="Explore the toolkit" items={menuItems} onSelect={choose} /><div className="hints"><KeyHint keys={['↑', '↓']} action="Navigate" /><KeyHint keys="Enter" action="Select" /></div></div>
          <div className="hero-caption"><span>INSPIRED BY PERSONA 3 RELOAD</span><span>ORIGINAL GEOMETRY / NO GAME ASSETS</span></div>
        </section>

        <section tabIndex={-1} data-playground-area="components" id="components" className="component-section" aria-labelledby="components-title">
          <div className="section-heading"><div><p className="micro">01 / THE TOOLKIT</p><h2 id="components-title">BUILT TO<br /><em>BE COMPOSED.</em></h2></div><p>Real controls. Your content.<br />Take one piece or build the whole scene.</p></div>
          <div className="component-layout">
            <aside className="component-index" aria-label="Component API selector">{componentItems.map(([name], index) => <button key={name} data-component-id={componentItems[index]![3]} tabIndex={selected === index ? 0 : -1} type="button" aria-pressed={selected === index} onFocus={() => inspect(index)} onClick={() => enterDemo(index)}><span>{String(index + 1).padStart(2, '0')}</span>{name}<i aria-hidden="true">↗</i></button>)}</aside>
            <div className="specimens">
              <div className="api-strip"><span className="micro">{String(selected + 1).padStart(2, '0')} / {componentItems[selected]![0]}</span><p>{componentItems[selected]![2]}</p><pre><code>{componentItems[selected]![1]}</code></pre><a href={`#/docs/${componentItems[selected]![3]}`}>Full documentation ↗</a></div>
              <div className="specimen-grid">
                <article id="demo-button" tabIndex={-1} className="specimen specimen-wide"><div className="specimen-label"><span>01 / BUTTON</span><span>TRY THE STATES</span></div><div className="button-row"><Button onClick={() => { setOpen(true); inspect(0); }}>Continue</Button><Button variant="secondary" onClick={() => setNotice('Secondary action activated')}>Secondary</Button><Button disabled>Unavailable</Button></div></article>
                <article id="demo-tabs" tabIndex={-1} className="specimen"><div className="specimen-label"><span>03 / TABS</span><span>← →</span></div><Tabs value={tab} onValueChange={setTab} label="Component details" items={[
                  { id: 'overview', label: 'Overview', content: <><h3>Every layer has a role.</h3><p>Labels, shapes and page content move independently. Ordinary application data belongs here.</p></> },
                  { id: 'details', label: 'Details', content: <><h3>Made for your keyboard.</h3><p>Use Left / Right, Home and End. Tab enters the active panel.</p></> },
                  { id: 'locked', label: 'Later', disabled: true, content: 'Unavailable' },
                ]} /></article>
                <article id="demo-panel" tabIndex={-1} className="specimen"><div className="specimen-label"><span>04 / PANEL</span><span>COMPOSE FREELY</span></div><PanelDemo /></article>
                <article id="demo-gauge" tabIndex={-1} className="specimen"><div className="specimen-label"><span>06 / GAUGE</span><span>LIVE VALUE</span></div><Gauge label="Capacity" value={gauge} /><label className="range-label">Adjust capacity<input aria-label="Adjust capacity" type="range" min="0" max="100" value={gauge} onChange={event => setGauge(Number(event.target.value))} /></label></article>
                <article id="demo-dialog" tabIndex={-1} className="specimen"><div className="specimen-label"><span>05 / DIALOG</span><span>NATIVE MODAL</span></div><h3>A moment to decide.</h3><p>Focused choices, with room to breathe.</p><Button variant="secondary" onClick={() => setOpen(true)}>Open dialog</Button></article>
                <article id="demo-key-hint" tabIndex={-1} className="specimen"><div className="specimen-label"><span>07 / KEYHINT</span><span>INPUT + ACTION</span></div><div className="hint-stack"><KeyHint keys={['↑', '↓']} action="Navigate" /><KeyHint keys="Enter" action="Confirm" /><KeyHint keys="Esc" action="Close dialog" /></div></article>
                <article id="demo-selection-indicator" tabIndex={-1} className="specimen"><div className="specimen-label"><span>08 / SELECTION INDICATOR</span><span>INDEPENDENT LAYER</span></div><div className="cursor-demo"><SelectionIndicator y={cursor * 48} height={40} />{['First position', 'Second position'].map((name, index) => <button type="button" key={name} aria-pressed={cursor === index} onClick={() => setCursor(index)}>{name}</button>)}</div></article>
                <SourceComponents />
                {compositionPages.map((page, index) => <article key={page.id} id={`demo-${page.id}`} tabIndex={-1} className="specimen specimen-wide">
                  <div className="specimen-label"><span>{index + 22} / {page.title}</span><a href={`#/docs/${page.id}`}>Docs ↗</a></div>{page.examples[0]!.node}
                </article>)}
              </div>
            </div>
          </div>
        </section>

        <section tabIndex={-1} data-playground-area="motion" id="motion" className="motion-section" aria-labelledby="motion-title"><div className="section-heading"><div><p className="micro">02 / CHOREOGRAPHY</p><h2 id="motion-title">FEEL THE<br /><em>CHANGE.</em></h2></div><p>One timeline core.<br />Separate tracks. Interruptible playback.</p></div>
          <div id="demo-transition" tabIndex={-1} className="motion-layout"><div className="motion-controls"><label>Transition<select value={effect} onChange={event => setEffect(event.target.value as typeof effect)}><option value="wipe">Mask / wipe</option><option value="slide">Slide</option><option value="fade">Fade</option></select></label><Button onClick={() => setVisible(value => !value)}>{visible ? 'Exit panel' : 'Enter panel'}</Button><Button variant="ghost" onClick={() => setReplay(value => value + 1)}>Replay menu</Button><label>Motion preference<select aria-label="Motion preference" value={String(reduced)} onChange={event => setReduced(event.target.value === 'system' ? 'system' : event.target.value === 'true')}><option value="system">Use system preference</option><option value="true">Reduce motion</option><option value="false">Full motion</option></select></label></div>
            <div className="transition-stage"><span className="stage-number" aria-hidden="true">09</span><Transition show={visible} effect={effect} duration={420} className="transition-example"><Panel title="Always in motion." eyebrow="Transition / live" tone="light"><p>A shape enters. A cursor arrives. Content follows.<br />Every part keeps its own rhythm.</p><span className="panel-arrow" aria-hidden="true">↗</span></Panel></Transition></div></div>
        </section>

        <section tabIndex={-1} data-playground-area="foundations" id="foundations" className="foundations" aria-labelledby="foundations-title"><div className="section-heading"><div><p className="micro">03 / FOUNDATIONS</p><h2 id="foundations-title">FIVE COLORS.<br /><em>FULL EXPRESSION.</em></h2></div><p>Original CSS geometry.<br />System typography. No image requests.</p></div><div className="swatches">{['#6d9ac7', '#1269cc', '#51eefc', '#ffffff', '#303030'].map((color, index) => <div key={color} style={{ background: color, color: index === 1 || index === 4 ? '#ffffff' : '#303030' }}><span>0{index + 1}</span><strong>{['Sky', 'Blue', 'Cyan', 'White', 'Ink'][index]}</strong><code>{color}</code></div>)}</div><p className="foundation-note">P3R composition and motion informed by extracted reference data. Browser interactions and timing are authored for this toolkit; exact native behavior remains unverified.</p></section>
      </main>
      <footer className="site-footer"><BrandLink /><p>Engine-independent TypeScript core.<br />React is the first adapter.</p><span role="status" aria-live="polite">{notice}</span></footer>
      <Dialog open={open} onClose={() => setOpen(false)} title="Ready to move?" actions={<><Button onClick={() => { setOpen(false); setNotice('Changes confirmed'); }}>Confirm</Button><Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button></>}><p>Compose the next interface your way. Your content, your actions, your rhythm.</p><KeyHint keys="Esc" action="Close" /></Dialog>
    </div>
  </EvokerProvider>;
}
function App() {
  const [hash, setHash] = useState(() => location.hash);
  useEffect(() => { const change = () => setHash(location.hash); window.addEventListener('hashchange', change); return () => window.removeEventListener('hashchange', change); }, []);
  // Existing #/component links remain valid; #/blocks is the old playground entry.
  const docs = hash === '#/docs' || hash.startsWith('#/docs/') || (/^#\/[^/]+$/.test(hash) && hash !== '#/blocks');
  return docs ? <Suspense fallback={<main role="status" className="page-loading">Loading documentation…</main>}><Documentation /></Suspense> : <Catalog />;
}
createRoot(document.getElementById('root')!).render(<StrictMode><App /></StrictMode>);
