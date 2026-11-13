import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { Badge, Button, Card, Checkbox, CodeBlock, Dialog, DropdownMenu, Field, Input, Select, Separator, Slider, Switch, Tabs, Textarea, Theme, Tooltip } from '@kartikeyak/evoker';
import './documentation.css';
import { compositionPages } from './CompositionPages.js';
import { legacyBlockPages, sourceBlockPages } from './BlockPages.js';
import { BrandLink } from './Brand.js';
import { SelectControl } from './SelectControl.js';

type Example = { title: string; node: ReactNode; code: string };
export type Page = { id: string; title: string; description: string; examples: Example[]; props?: [string, string, string][] };

const buttonCode = `import { Button } from '@kartikeyak/evoker';

<Button onClick={save}>Save changes</Button>
<Button variant="outline" size="sm">Cancel</Button>
<Button loading>Saving changes</Button>`;
const fieldCode = `<Field.Root name="email">
  <Field.Label>Email address</Field.Label>
  <Input type="email" name="email" placeholder="you@example.com" required />
  <Field.Description>Only used for account updates.</Field.Description>
  <Field.Error match="valueMissing">Enter your email.</Field.Error>
</Field.Root>`;
const selectCode = `const items = [
  { value: 'north', label: 'North' },
  { value: 'south', label: 'South' },
];

<Select.Root name="region" defaultValue="north" items={items}>
  <Select.Trigger aria-label="Region">
    <Select.Value /><Select.Icon>⌄</Select.Icon>
  </Select.Trigger>
  <Select.Portal>
    <Select.Positioner>
      <Select.Content><Select.List>
        {items.map(item => <Select.Item key={item.value} value={item.value}>
          <Select.ItemText>{item.label}</Select.ItemText>
        </Select.Item>)}
      </Select.List></Select.Content>
    </Select.Positioner>
  </Select.Portal>
</Select.Root>`;
const dialogCode = `<Dialog.Root>
  <Dialog.Trigger render={<Button />}>Edit profile</Dialog.Trigger>
  <Dialog.Portal>
    <Dialog.Backdrop />
    <Dialog.Content>
      <Dialog.Title>Edit profile</Dialog.Title>
      <Dialog.Description>Your public display name.</Dialog.Description>
      <Field.Root name="displayName">
        <Field.Label>Display name</Field.Label>
        <Input name="displayName" defaultValue="Operator" />
      </Field.Root>
      <Dialog.Footer>
        <Dialog.Close render={<Button variant="outline" />}>Cancel</Dialog.Close>
        <Dialog.Close render={<Button />}>Save profile</Dialog.Close>
      </Dialog.Footer>
    </Dialog.Content>
  </Dialog.Portal>
</Dialog.Root>`;
const tabsCode = `<Tabs.Root defaultValue="overview">
  <Tabs.List aria-label="Project views" activateOnFocus>
    <Tabs.Trigger value="overview">Overview</Tabs.Trigger>
    <Tabs.Trigger value="activity">Activity</Tabs.Trigger>
  </Tabs.List>
  <Tabs.Content value="overview">Project overview.</Tabs.Content>
  <Tabs.Content value="activity">Recent activity.</Tabs.Content>
</Tabs.Root>`;

function ButtonDemo() {
  const [count, setCount] = useState(0);
  return <div className="doc-stack"><div className="doc-row"><Button onClick={() => setCount(value => value + 1)}>Save changes</Button><Button variant="secondary">Secondary</Button><Button variant="outline">Outline</Button><Button variant="ghost">Ghost</Button></div><div className="doc-row"><Button size="sm">Small</Button><Button size="lg">Large</Button><Button disabled>Disabled</Button><Button loading>Saving</Button></div><output aria-live="polite">Saved {count} times</output></div>;
}
function FormDemo() {
  const [submitted, setSubmitted] = useState('');
  return <form className="doc-example-form" onSubmit={event => { event.preventDefault(); setSubmitted(String(new FormData(event.currentTarget).get('email'))); }}>
    <Field.Root name="email"><Field.Label>Email address</Field.Label><Input type="email" name="email" placeholder="you@example.com" required /><Field.Description>Only used for account updates.</Field.Description><Field.Error match="valueMissing">Enter your email.</Field.Error></Field.Root>
    <Button type="submit">Create account</Button><output aria-live="polite">{submitted && `Account requested for ${submitted}`}</output>
  </form>;
}
function SelectDemo() {
  const [value, setValue] = useState('north');
  return <div className="doc-stack"><Select.Root name="region" value={value} items={{ north: 'North', south: 'South', locked: 'Unavailable' }} onValueChange={next => setValue(next ?? 'north')}>
    <Select.Trigger aria-label="Region"><Select.Value /><Select.Icon>⌄</Select.Icon></Select.Trigger><Select.Portal><Select.Positioner><Select.Content><Select.List>
      <Select.Item value="north"><Select.ItemText>North</Select.ItemText></Select.Item><Select.Item value="south"><Select.ItemText>South</Select.ItemText></Select.Item><Select.Item value="locked" disabled><Select.ItemText>Unavailable</Select.ItemText></Select.Item>
    </Select.List></Select.Content></Select.Positioner></Select.Portal></Select.Root><output>Selected: {value}</output></div>;
}
function DialogDemo() {
  const [saved, setSaved] = useState('');
  const [name, setName] = useState('Operator');
  const [open, setOpen] = useState(false);
  return <div className="doc-stack"><Dialog.Root open={open} onOpenChange={setOpen}><Dialog.Trigger render={<Button />}>Edit profile</Dialog.Trigger><Dialog.Portal><Dialog.Backdrop /><Dialog.Content>
    <Dialog.Title>Edit profile</Dialog.Title><Dialog.Description>Your public display name.</Dialog.Description>
    <form className="doc-example-form" onSubmit={event => { event.preventDefault(); setSaved(name); setOpen(false); }}>
      <Field.Root name="displayName"><Field.Label>Display name</Field.Label><Input name="displayName" value={name} onValueChange={setName} required /></Field.Root>
      <Dialog.Footer><Dialog.Close render={<Button variant="outline" />}>Cancel</Dialog.Close><Button type="submit">Save profile</Button></Dialog.Footer>
    </form>
  </Dialog.Content></Dialog.Portal></Dialog.Root><output aria-live="polite">{saved && `Saved ${saved}`}</output></div>;
}
function MenuDemo() {
  const [action, setAction] = useState('Choose an action.');
  return <div className="doc-stack"><DropdownMenu.Root><DropdownMenu.Trigger render={<Button variant="outline" />}>Project actions</DropdownMenu.Trigger><DropdownMenu.Portal><DropdownMenu.Positioner><DropdownMenu.Content>
    <DropdownMenu.Item onClick={() => setAction('Project duplicated')}>Duplicate</DropdownMenu.Item><DropdownMenu.Item disabled>Archive unavailable</DropdownMenu.Item><DropdownMenu.Item onClick={() => setAction('Project exported')}>Export</DropdownMenu.Item>
  </DropdownMenu.Content></DropdownMenu.Positioner></DropdownMenu.Portal></DropdownMenu.Root><output aria-live="polite">{action}</output></div>;
}

const pages: Page[] = [
  { id: 'button', title: 'Button', description: 'Actions with native button semantics, size and visual variants. Your text and icons.', examples: [{ title: 'Variants and states', node: <ButtonDemo />, code: buttonCode }], props: [['variant', 'primary | secondary | outline | ghost', 'primary'], ['size', 'sm | md | lg | icon', 'md'], ['loading', 'boolean; disables activation and sets aria-busy', 'false'], ['endIcon', 'ReactNode; optional decorative content', '—'], ['ref / native props', 'HTMLButtonElement / ButtonHTMLAttributes', 'Forwarded']] },
  { id: 'input', title: 'Input', description: 'Native text entry with field integration, controlled or uncontrolled values, and forwarded refs.', examples: [{ title: 'Email field', node: <FormDemo />, code: fieldCode }, { title: 'Native input types and disabled state', node: <div className="doc-stack"><Input aria-label="Search projects" type="search" placeholder="Search projects…" /><Input aria-label="Disabled input" disabled defaultValue="Unavailable" /></div>, code: '<Input type="search" name="query" placeholder="Search projects…" />\n<Input disabled defaultValue="Unavailable" />' }], props: [['value / defaultValue', 'Native input value', 'Uncontrolled'], ['onValueChange', '(value, eventDetails) => void', '—'], ['type / name / required / disabled', 'Native input attributes', 'Native defaults'], ['render / ref', 'Custom element / HTMLElement ref', 'input']] },
  { id: 'textarea', title: 'Textarea', description: 'Multiline native text entry. Compose with Field.Control to connect labels, help and validation.', examples: [{ title: 'Project notes', node: <Field.Root name="notes"><Field.Label>Notes</Field.Label><Field.Control name="notes" render={<Textarea rows={4} placeholder="What are you working on?" />} /><Field.Description>Write a short project description.</Field.Description></Field.Root>, code: '<Field.Root name="notes">\n  <Field.Label>Notes</Field.Label>\n  <Field.Control name="notes" render={<Textarea rows={4} />} />\n  <Field.Description>Write a short description.</Field.Description>\n</Field.Root>' }], props: [['native props / ref', 'TextareaHTMLAttributes / HTMLTextAreaElement', 'Forwarded']] },
  { id: 'field', title: 'Field', description: 'Compose a label, control, help and validation message. The association is handled for you.', examples: [{ title: 'Required email', node: <FormDemo />, code: fieldCode }], props: [['Root', 'name, disabled, invalid, validationMode, validate', 'Field context'], ['Label / Description', 'Linked accessible label and help', '—'], ['Control', 'Native control or render={<CustomControl />}', 'input'], ['Error', 'match validity reason or server error', 'Automatic association']] },
  { id: 'checkbox', title: 'Checkbox', description: 'Checkbox behavior with native form participation, mixed state and keyboard support.', examples: [{ title: 'Checked, mixed and disabled', node: <div className="doc-stack"><Field.Root name="notifications"><Field.Label className="doc-row"><Checkbox name="notifications" defaultChecked /> Email notifications</Field.Label></Field.Root><label className="doc-row"><Checkbox aria-label="Some selected" indeterminate /> Some items selected</label><label className="doc-row"><Checkbox disabled /> Unavailable option</label></div>, code: '<Field.Root name="notifications">\n  <Field.Label><Checkbox name="notifications" defaultChecked /> Notifications</Field.Label>\n</Field.Root>\n<Checkbox indeterminate aria-label="Some selected" />' }], props: [['checked / defaultChecked', 'boolean', 'false'], ['onCheckedChange', '(checked, eventDetails) => void', '—'], ['indeterminate / disabled / name', 'Mixed, unavailable and native form states', '—']] },
  { id: 'switch', title: 'Switch', description: 'An on/off setting with controlled state and native form values.', examples: [{ title: 'Motion setting', node: <Field.Root name="feedback"><Field.Label className="doc-row"><Switch name="feedback" defaultChecked /> Action feedback</Field.Label><Field.Description>Enable feedback when actions finish.</Field.Description></Field.Root>, code: '<Field.Root name="feedback">\n  <Field.Label><Switch name="feedback" defaultChecked /> Action feedback</Field.Label>\n  <Field.Description>Enable feedback when actions finish.</Field.Description>\n</Field.Root>' }], props: [['checked / defaultChecked', 'boolean', 'false'], ['onCheckedChange', '(checked, eventDetails) => void', '—'], ['name / disabled / readOnly', 'Native form and interaction options', '—']] },
  { id: 'select', title: 'Select', description: 'A styled selection popup with keyboard navigation, disabled items and form submission.', examples: [{ title: 'Controlled selection', node: <SelectDemo />, code: selectCode }], props: [['Root', 'value/defaultValue, onValueChange, items, name, disabled, required', 'Single selection'], ['Trigger / Value / Icon', 'Compose the visible control; items maps values to labels', '—'], ['Portal / Positioner / Content / List', 'Popup placement, clipping and theme inheritance', '—'], ['Item / ItemText', 'value, disabled and option label', '—']] },
  { id: 'slider', title: 'Slider', description: 'Pointer and keyboard value adjustment, with linked labels, range thumbs and form values.', examples: [{ title: 'Volume', node: <Slider.Root defaultValue={65} name="volume" className="doc-stack"><div className="doc-row"><Slider.Label>Volume</Slider.Label><Slider.Value /></div><Slider.Control><Slider.Track><Slider.Indicator /><Slider.Thumb /></Slider.Track></Slider.Control></Slider.Root>, code: '<Slider.Root defaultValue={65} name="volume">\n  <Slider.Label>Volume</Slider.Label><Slider.Value />\n  <Slider.Control><Slider.Track>\n    <Slider.Indicator /><Slider.Thumb />\n  </Slider.Track></Slider.Control>\n</Slider.Root>' }], props: [['Root', 'value/defaultValue, min, max, step, name, onValueChange', '0–100, step 1'], ['Label / Value', 'Associated text and formatted value', '—'], ['Control / Track / Indicator / Thumb', 'Compose track, fill and one or more thumbs', '—']] },
  { id: 'dialog', title: 'Dialog', description: 'Compose your own modal content. Focus, Escape, dismissal, scroll locking and trigger restoration are handled by Base UI.', examples: [{ title: 'Edit profile', node: <DialogDemo />, code: dialogCode }], props: [['Root', 'open/defaultOpen, onOpenChange, modal', 'Uncontrolled modal'], ['Trigger / Close', 'render={<Button />} composes behavior onto your button', 'Native button'], ['Portal / Backdrop / Content', 'Modal layers; initialFocus/finalFocus supported on Content', 'Themed portal'], ['Title / Description / Footer', 'Accessible naming and caller-owned layout', '—']] },
  { id: 'tabs', title: 'Tabs', description: 'Custom tab labels and panel contents, controlled or uncontrolled selection, disabled tabs and keyboard navigation.', examples: [{ title: 'Project views', node: <Tabs.Root defaultValue="overview"><Tabs.List aria-label="Project views" activateOnFocus><Tabs.Trigger value="overview">Overview</Tabs.Trigger><Tabs.Trigger value="activity">Activity</Tabs.Trigger><Tabs.Trigger value="locked" disabled>Unavailable</Tabs.Trigger></Tabs.List><Tabs.Content value="overview">Your workspace, organized around your next move.</Tabs.Content><Tabs.Content value="activity">Two projects updated today.</Tabs.Content></Tabs.Root>, code: tabsCode }], props: [['Root', 'value/defaultValue, onValueChange, orientation', 'Horizontal'], ['List', 'activateOnFocus, loopFocus', 'Manual activation, wrapping'], ['Trigger', 'value, disabled, render, ref', 'button'], ['Content', 'value, keepMounted', 'Linked panel']] },
  { id: 'card', title: 'Card', description: 'A content surface with independently composed heading, description, body and actions.', examples: [{ title: 'Project card', node: <Card.Root className="doc-card-example"><Card.Header><Badge>Workspace</Badge><Card.Title>Signal studio</Card.Title><Card.Description>Your ideas, in motion.</Card.Description></Card.Header><Card.Content><p>Build the interface your project needs.</p></Card.Content><Card.Footer><Button>Open project</Button><Button variant="outline">Details</Button></Card.Footer></Card.Root>, code: '<Card.Root>\n  <Card.Header>\n    <Card.Title>Signal studio</Card.Title>\n    <Card.Description>Your ideas, in motion.</Card.Description>\n  </Card.Header>\n  <Card.Content>Your own content.</Card.Content>\n  <Card.Footer><Button>Open project</Button></Card.Footer>\n</Card.Root>' }], props: [['Root / Header / Content / Footer', 'Native div attributes and refs', 'Caller-owned content'], ['Title / Description', 'Native heading/paragraph props and refs', 'h3 / p']] },
  { id: 'badge', title: 'Badge & separator', description: 'Compact status labels and structural dividers, with your own content.', examples: [{ title: 'Status', node: <div><div className="doc-row"><Badge>In progress</Badge><Badge variant="outline">Archived</Badge></div><Separator /><p>Separate sections without adding a container.</p></div>, code: '<Badge>In progress</Badge>\n<Badge variant="outline">Archived</Badge>\n<Separator />' }], props: [['Badge.variant', 'solid | outline', 'solid'], ['Badge / Separator', 'Native span/hr props and refs', '—']] },
  { id: 'tooltip', title: 'Tooltip', description: 'Contextual help on focus or hover. Compose it with your own focusable control.', examples: [{ title: 'Action help', node: <Tooltip.Provider delay={100}><Tooltip.Root><Tooltip.Trigger render={<Button variant="outline" />}>Keyboard help</Tooltip.Trigger><Tooltip.Portal><Tooltip.Positioner><Tooltip.Content>Use Tab to move between controls.</Tooltip.Content></Tooltip.Positioner></Tooltip.Portal></Tooltip.Root></Tooltip.Provider>, code: '<Tooltip.Provider delay={100}>\n  <Tooltip.Root>\n    <Tooltip.Trigger render={<Button />}>Keyboard help</Tooltip.Trigger>\n    <Tooltip.Portal><Tooltip.Positioner>\n      <Tooltip.Content>Use Tab to move between controls.</Tooltip.Content>\n    </Tooltip.Positioner></Tooltip.Portal>\n  </Tooltip.Root>\n</Tooltip.Provider>' }], props: [['Provider', 'delay, closeDelay', 'Shared timing'], ['Root / Trigger', 'open/defaultOpen and custom render', 'Focus or hover'], ['Positioner / Content', 'side, align, offsets and custom content', 'Themed portal']] },
  { id: 'dropdown-menu', title: 'Dropdown menu', description: 'Action menus with focus management, keyboard navigation and disabled items.', examples: [{ title: 'Project actions', node: <MenuDemo />, code: '<DropdownMenu.Root>\n  <DropdownMenu.Trigger render={<Button />}>Actions</DropdownMenu.Trigger>\n  <DropdownMenu.Portal><DropdownMenu.Positioner>\n    <DropdownMenu.Content>\n      <DropdownMenu.Item onClick={duplicate}>Duplicate</DropdownMenu.Item>\n      <DropdownMenu.Item disabled>Unavailable</DropdownMenu.Item>\n    </DropdownMenu.Content>\n  </DropdownMenu.Positioner></DropdownMenu.Portal>\n</DropdownMenu.Root>' }], props: [['Root / Trigger', 'open/defaultOpen, onOpenChange, custom render', 'Uncontrolled'], ['Item', 'onClick, disabled, render and ref', 'menuitem'], ['Portal / Positioner / Content', 'Positioning, focus and theme inheritance', '—']] },
];

function Code({ value, language = 'tsx', filename = 'Example.tsx' }: { value: string; language?: string; filename?: string }) {
  return <CodeBlock code={value} filename={filename} language={language} className="doc-code" />;
}

function Preview({ example, id = 'example-1' }: { example: Example; id?: string }) {
  return <section id={id} tabIndex={-1} className="doc-example" aria-labelledby={`${id}-title`}><h2 id={`${id}-title`}>{example.title}</h2><Tabs.Root defaultValue="preview"><Tabs.List aria-label={`${example.title} example`}><Tabs.Trigger value="preview">Preview</Tabs.Trigger><Tabs.Trigger value="code">Code</Tabs.Trigger></Tabs.List><Tabs.Content value="preview"><div className="doc-preview">{example.node}</div></Tabs.Content><Tabs.Content value="code"><Code value={example.code} /></Tabs.Content></Tabs.Root></section>;
}

const install = `# In an existing React 18 or 19 application
npm install @kartikeyak/evoker@beta

# Pin the initial beta for a reproducible installation
npm install @kartikeyak/evoker@0.1.0-beta.1`;
const localInstall = `# From the Evoker repository
npm ci
npm run package

# In your application (replace the path)
npm install /path/to/evoker/artifacts/npm/kartikeyak-evoker-core-0.1.0-beta.1.tgz \\
  /path/to/evoker/artifacts/npm/kartikeyak-evoker-0.1.0-beta.1.tgz`;

const quickstart = `import { Button, Theme } from '@kartikeyak/evoker';
import '@kartikeyak/evoker/styles.css';

export function App() {
  return <Theme appearance="dark">
    <Button onClick={() => console.log('Saved')}>Save changes</Button>
  </Theme>;
}`;

const gettingStarted = [
  { id: 'introduction', title: 'Introduction' },
  { id: 'installation', title: 'Installation' },
  { id: 'theming', title: 'Theming' },
];
const compactDocumentation = '(max-width: 60rem), (max-height: 32rem)';

export function Documentation() {
  const blockPages = [...legacyBlockPages, ...sourceBlockPages, ...compositionPages];
  const shell = useRef<HTMLDivElement>(null);
  const header = useRef<HTMLElement>(null);
  const content = useRef<HTMLElement>(null);
  const readPage = () => location.hash === '#/docs' || location.hash === '#/docs/' ? 'introduction' : location.hash.replace(/^#\/(?:docs\/)?/, '').split('?')[0] || 'introduction';
  const [pageId, setPageId] = useState(readPage);
  const [search, setSearch] = useState('');
  const searchInput = useRef<HTMLElement>(null);
  const [navigationOpen, setNavigationOpen] = useState(() => !matchMedia(compactDocumentation).matches);
  const readSection = () => new URLSearchParams(location.hash.split('?')[1]).get('section');
  const [section, setSection] = useState(readSection);
  const [appearance, setAppearance] = useState<'dark' | 'light'>('dark');
  const [density, setDensity] = useState<'comfortable' | 'compact'>('comfortable');
  const [reduced, setReduced] = useState<boolean | 'system'>('system');
  useEffect(() => {
    const update = () => shell.current?.style.setProperty('--doc-header-height', `${header.current?.getBoundingClientRect().height ?? 72}px`);
    const observer = new ResizeObserver(update);
    if (header.current) observer.observe(header.current);
    update();
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    const media = matchMedia(compactDocumentation);
    const resize = () => setNavigationOpen(!media.matches);
    media.addEventListener('change', resize);
    return () => media.removeEventListener('change', resize);
  }, []);
  useEffect(() => {
    const change = () => {
      setPageId(readPage()); setSection(readSection());
      if (matchMedia(compactDocumentation).matches) setNavigationOpen(false);
    };
    window.addEventListener('hashchange', change);
    return () => window.removeEventListener('hashchange', change);
  }, []);
  const page = [...pages, ...blockPages].find(item => item.id === pageId);
  const title = page?.title ?? gettingStarted.find(item => item.id === pageId)?.title ?? 'Introduction';
  const groups = [
    { title: 'Getting started', items: gettingStarted },
    { title: 'Primitives', items: [...pages].sort((a, b) => a.title.localeCompare(b.title)) },
    { title: 'Blocks & motion', items: [...blockPages].sort((a, b) => a.title.localeCompare(b.title)) },
  ];
  const orderedPages = groups.flatMap(group => group.items);
  const position = orderedPages.findIndex(item => item.id === pageId);
  const previous = orderedPages[position - 1];
  const next = orderedPages[position + 1];
  const filtered = groups.map(group => ({ ...group, items: group.items.filter(item => item.title.toLowerCase().includes(search.trim().toLowerCase())) }));
  const resultCount = filtered.reduce((count, group) => count + group.items.length, 0);
  const sections = page ? [
    { id: 'overview', title: 'Overview' },
    ...page.examples.slice(0, 1).map(example => ({ id: 'example-1', title: example.title })),
    { id: 'usage', title: 'Usage' },
    ...page.examples.slice(1).map((example, index) => ({ id: `example-${index + 2}`, title: example.title })),
    ...(page.props ? [{ id: 'api', title: 'API reference' }] : []),
  ] : pageId === 'installation' ? [
    { id: 'overview', title: 'Installation' }, { id: 'import-theme', title: 'Import the theme' }, { id: 'individual-imports', title: 'Individual imports' }, { id: 'local-archives', title: 'Local archives' },
  ] : pageId === 'theming' ? [
    { id: 'overview', title: 'Theming' }, { id: 'example-1', title: 'Theme preview' }, { id: 'override-tokens', title: 'Override tokens' },
  ] : [
    { id: 'overview', title: 'Introduction' }, { id: 'example-1', title: 'Start with a component' }, { id: 'developer-experience', title: 'Developer experience' }, { id: 'primitives-blocks', title: 'Primitives and blocks' },
  ];
  useEffect(() => {
    document.title = `${title} — Evoker UI`;
    const target = section ? document.getElementById(section) : null;
    if (target && content.current?.contains(target)) {
      target.scrollIntoView({ block: 'start', behavior: 'instant' });
      target.focus({ preventScroll: true });
    } else {
      window.scrollTo(0, 0);
      content.current?.focus({ preventScroll: true });
    }
  }, [pageId, title, section]);
  return <Theme ref={shell} appearance={appearance} density={density} reducedMotion={reduced} className="doc-app">
    <a className="skip" href="#doc-content" onClick={event => { event.preventDefault(); content.current?.focus(); }}>Skip to documentation</a>
    <header ref={header} className="doc-header"><BrandLink /><nav aria-label="Documentation"><a href="#/docs/button">Components</a><a href="#">Playground</a><a href="#/docs/theming">Theme</a></nav><Button variant="ghost" size="sm" aria-label="Toggle appearance" onClick={() => setAppearance(value => value === 'dark' ? 'light' : 'dark')}>{appearance === 'dark' ? 'Light' : 'Dark'}</Button></header>
    <div className="doc-layout"><aside className="doc-sidebar">
      <details open={navigationOpen} onToggle={event => setNavigationOpen(event.currentTarget.open)}>
        <summary><span>Browse documentation<small>{title}</small></span><span aria-hidden="true">{navigationOpen ? '−' : '+'}</span></summary>
        <div className="doc-navigation">
          <div className="doc-search"><Input ref={searchInput} aria-label="Find a component" placeholder="Search pages…" type="search" value={search} onValueChange={setSearch} />
            {search && <Button variant="ghost" size="sm" aria-label="Clear component search" onClick={() => { setSearch(''); searchInput.current?.focus(); }}>×</Button>}
          </div>
          <p className="doc-search-count" role="status">{search ? `${resultCount} ${resultCount === 1 ? 'result' : 'results'}` : `${orderedPages.length} guides & components`}</p>
          <nav aria-label="Component pages">{filtered.map(group => group.items.length > 0 && <div className="doc-nav-group" key={group.title}><p>{group.title}</p>{group.items.map(item =>
            <a key={item.id} href={`#/docs/${item.id}`} aria-current={pageId === item.id ? 'page' : undefined}>{item.title}</a>)}
          </div>)}
            {resultCount === 0 && <div className="doc-empty"><strong>No matching pages</strong><p>Try another name or clear your search.</p></div>}
          </nav>
        </div>
      </details>
    </aside><main ref={content} tabIndex={-1} id="doc-content" className="doc-content" data-doc-page={pageId}>
      <nav className="doc-breadcrumb" aria-label="Breadcrumb"><a href="#/docs">Documentation</a><span aria-hidden="true">/</span><span>{title}</span></nav>
      {page ? <><header id="overview" tabIndex={-1} className="doc-page-header"><p className="doc-eyebrow">{pages.includes(page) ? 'Primitive' : 'Block'} / React</p><h1>{page.title}</h1><p className="doc-lead">{page.description}</p></header>
        {page.examples[0] && <Preview key={`${page.id}-first`} example={page.examples[0]} />}
        <section id="usage" tabIndex={-1} className="doc-usage"><h2>Usage</h2><Code value={`import { ${page.id === 'dropdown-menu' ? 'DropdownMenu' : page.id === 'badge' ? 'Badge, Separator' : page.title} } from '@kartikeyak/evoker';`} /></section>
        {page.examples.slice(1).map((example, index) => <Preview key={`${page.id}-${example.title}`} id={`example-${index + 2}`} example={example} />)}
        {blockPages.includes(page) && page.id !== 'code-block' && <p className="doc-note">These are original browser adaptations informed by audited static references. Extracted artwork, fonts and native tables remain private. Exact game runtime fidelity is unverified. Import global CSS once from @kartikeyak/evoker/styles.css.</p>}
        {page.props && <section id="api" tabIndex={-1} className="doc-api"><h2>API reference</h2><div className="doc-table-scroll"><table><thead><tr><th>Prop or part</th><th>Contract</th><th>Default</th></tr></thead><tbody>{page.props.map(row => <tr key={row[0]}>{row.map((cell, index) => index === 0 ? <th scope="row" key={index}>{cell}</th> : <td key={index}>{cell}</td>)}</tr>)}</tbody></table></div><p className="doc-note">Native attributes are forwarded. Ref support follows each component’s contract. Base UI behavior parts also accept state-aware className/style and render composition props.</p></section>}</>
        : pageId === 'installation' ? <><p className="doc-eyebrow">Getting started</p><h1 id="overview" tabIndex={-1}>Installation</h1><p className="doc-lead">Add Evoker to an existing React application.</p><p className="doc-note">Public beta · 0.1.0-beta.1 · Available from npm under the beta tag.</p><p>Use React and React DOM 18 or 19. npm installs the compatible Evoker core and Base UI dependencies automatically. The beta API may change before 1.0.</p><Code value={install} language="sh" filename="Terminal" /><h2 id="import-theme" tabIndex={-1}>Import the theme once</h2><Code value={quickstart} /><p>For Next.js, put interactive components behind a client boundary and import the stylesheet in your root layout. The package entry points declare their client boundary.</p><h2 id="individual-imports" tabIndex={-1}>Individual imports</h2><Code value={`import { Button } from '@kartikeyak/evoker/button';\nimport { Dialog } from '@kartikeyak/evoker/dialog';\nimport { Tabs } from '@kartikeyak/evoker/tabs';\nimport { InspectorList } from '@kartikeyak/evoker/blocks';`} /><h2 id="local-archives" tabIndex={-1}>Build local archives</h2><p>Contributors can install tested archives without a registry release. Both packages must be installed together when using archives.</p><Code value={localInstall} language="sh" filename="Local installation" /></>
        : pageId === 'theming' ? <><p className="doc-eyebrow">Getting started</p><h1 id="overview" tabIndex={-1}>Theming</h1><p className="doc-lead">The source palette becomes reusable color roles, spacing, density and motion tokens.</p><div className="doc-row"><Button variant="outline" onClick={() => setDensity(value => value === 'compact' ? 'comfortable' : 'compact')}>Density: {density}</Button><SelectControl label="Documentation motion" value={String(reduced)} onValueChange={value => setReduced(value === 'system' ? 'system' : value === 'true')} options={[{ value: 'system', label: 'System preference' }, { value: 'true', label: 'Reduced' }, { value: 'false', label: 'Full' }]} /></div><Preview example={{ title: 'Theme preview', node: <FormDemo />, code: '<Theme appearance="light" density="compact" reducedMotion="system">\n  <YourApplication />\n</Theme>' }} /><h2 id="override-tokens" tabIndex={-1}>Override tokens</h2><Code value={`.my-theme {\n  --evoker-blue: #1269cc;\n  --evoker-cyan: #51eefc;\n  --evoker-font: Arial, sans-serif;\n}\n\n<Theme className="my-theme">…</Theme>`} /><p>Portalled menus, selects and dialogs retain the enclosing theme. Extracted sprite layering, separate key/action text, sharp planes and independent motion inform the styling. Game artwork and fonts stay in private research.</p></>
        : <><Badge>React / 0.1</Badge><h1 id="overview" tabIndex={-1}>Build your own<br />next move.</h1><p className="doc-lead">Composable UI primitives with P3R-inspired visual language. Your markup, your application state, your content.</p><div className="doc-row"><a href="#/docs/installation" className="doc-primary-link">Get started ↗</a><a href="#/docs/button">Browse components</a></div><Preview example={{ title: 'Start with a component', node: <Card.Root className="doc-card-example"><Card.Header><Badge>Ready to build</Badge><Card.Title>A system, in pieces.</Card.Title><Card.Description>Compose controls and content into your own interface.</Card.Description></Card.Header><Card.Content><Field.Root><Field.Label>Project name</Field.Label><Input placeholder="Your next project" /></Field.Root></Card.Content><Card.Footer><Button>Create project</Button><Button variant="outline">Explore</Button></Card.Footer></Card.Root>, code: quickstart }} /><h2 id="developer-experience" tabIndex={-1}>A familiar developer experience</h2><p>Install the packages, import the stylesheet, and compose parts. Choose controlled or uncontrolled state, change native attributes, forward refs, customize styling or compose behavior onto your own Button with the render prop.</p><h2 id="primitives-blocks" tabIndex={-1}>Primitives and blocks</h2><p>Inputs, fields, selects, dialogs and tabs are the building pieces. Collection inspectors, dialogue frames and cut-ins are optional blocks built for the visual language.</p><div className="doc-row"><a href="#/docs/input">Form controls ↗</a><a href="#/docs/dialog">Overlay primitives ↗</a><a href="#/docs/quest-brief">Source-inspired blocks ↗</a></div></>}
      <nav className="doc-pagination" aria-label="Page navigation">
        {previous ? <a href={`#/docs/${previous.id}`}><small>← Previous</small><strong>{previous.title}</strong></a> : <span />}
        {next && <a href={`#/docs/${next.id}`}><small>Next →</small><strong>{next.title}</strong></a>}
      </nav>
    </main><aside className="doc-toc" aria-label="On this page"><p>On this page</p><nav>{sections.map(item =>
      <a key={item.id} href={`#/docs/${pageId}?section=${item.id}`} aria-current={(section ?? 'overview') === item.id ? 'location' : undefined}>{item.title}</a>
    )}</nav><div className="doc-toc-note"><strong>Build your next move.</strong><p>Original components. Your content.</p><a href="#/docs/installation">Get started ↗</a></div></aside></div>
    <footer className="doc-footer">Evoker UI · React primitives, source-inspired motion and composable blocks.</footer>
  </Theme>;
}
